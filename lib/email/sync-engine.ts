import type { SupabaseClient } from '@supabase/supabase-js'
import { decryptToken, encryptToken } from './crypto'
import { gmailAdapter } from './adapters/gmail'
import { microsoftAdapter } from './adapters/microsoft'
import { classifyEmail } from '@/lib/claude'
import type { EmailProvider } from '@/lib/types/database'

function getAdapter(provider: EmailProvider) {
  return provider === 'gmail' ? gmailAdapter : microsoftAdapter
}

export async function syncAccount(
  supabase: SupabaseClient,
  accountId: string,
  triggerType: 'scheduled' | 'manual' | 'initial',
): Promise<{ messagesCreated: number; recommendationsCreated: number; error?: string }> {
  const { data: account } = await supabase
    .from('connected_email_accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  const { data: runData } = await supabase
    .from('email_sync_runs')
    .insert({
      user_id: account?.user_id,
      connected_email_account_id: accountId,
      trigger_type: triggerType,
      status: 'running',
    })
    .select('id')
    .single()
  const runId = runData?.id

  await supabase
    .from('connected_email_accounts')
    .update({ last_sync_attempt_at: new Date().toISOString() })
    .eq('id', accountId)

  if (!account || account.connection_status === 'disconnected' || account.connection_status === 'paused') {
    if (runId) {
      await supabase.from('email_sync_runs')
        .update({ status: 'failed', completed_at: new Date().toISOString(), error_summary: 'Account not active', messages_scanned: 0, messages_created: 0, recommendations_created: 0 })
        .eq('id', runId)
    }
    return { messagesCreated: 0, recommendationsCreated: 0, error: 'Account not active' }
  }

  const provider = account.provider as string
  if (provider !== 'gmail' && provider !== 'microsoft') {
    throw new Error(`Unsupported email provider: ${provider}`)
  }
  const adapter = getAdapter(provider)

  let accessToken: string
  let messagesCreated = 0
  let recommendationsCreated = 0

  try {
    const encryptedRefresh = account.encrypted_refresh_token as string
    if (!encryptedRefresh) throw new Error('No refresh token stored for account')
    const refreshToken = decryptToken(encryptedRefresh)
    const tokens = await adapter.refreshAccessToken(refreshToken)
    accessToken = tokens.accessToken

    await supabase
      .from('connected_email_accounts')
      .update({
        encrypted_access_token:  encryptToken(tokens.accessToken),
        encrypted_refresh_token: encryptToken(tokens.refreshToken),
      })
      .eq('id', accountId)

    const syncCursor = account.sync_cursor as string | null
    const page = await adapter.listMessages(accessToken, syncCursor, 30)

    for (const msg of page.messages) {
      const { data: existing } = await supabase
        .from('synced_email_messages')
        .select('id')
        .eq('connected_email_account_id', accountId)
        .eq('provider_message_id', msg.providerMessageId)
        .single()

      if (existing) continue

      let classification = null
      let classificationConfidence = null
      let actionRequired = false
      let followUpRecommended = false
      let followUpType = null
      let followUpUrgency = null
      let followUpReason = null
      let isJobRelated = false

      try {
        const result = await classifyEmail(msg.subject, msg.bodyText, msg.sender)
        if (result.isJobRelated) {
          isJobRelated = true
          classification = result.classification
          classificationConfidence = result.confidence
          actionRequired = result.actionRequired
          followUpRecommended = result.followUpRecommended
          followUpType = result.followUpType
          followUpUrgency = result.followUpUrgency
          followUpReason = result.followUpReason
        }
      } catch {
        // Classification failure is non-fatal; skip message
      }

      if (!isJobRelated) continue

      const { data: inserted } = await supabase
        .from('synced_email_messages')
        .insert({
          user_id:                      account.user_id,
          connected_email_account_id:   accountId,
          provider_message_id:          msg.providerMessageId,
          provider_thread_id:           msg.providerThreadId,
          sender:                       msg.sender,
          subject:                      msg.subject,
          received_at:                  msg.receivedAt,
          body_text:                    msg.bodyText,
          snippet:                      msg.snippet,
          classification,
          classification_confidence:    classificationConfidence,
          action_required:              actionRequired,
          processed_at:                 new Date().toISOString(),
        })
        .select('id')
        .single()

      messagesCreated++

      if (inserted && followUpRecommended && followUpType && followUpUrgency) {
        const { data: existingRec } = await supabase
          .from('follow_up_recommendations')
          .select('id')
          .eq('connected_email_account_id', accountId)
          .eq('provider_thread_id', msg.providerThreadId)
          .eq('recommendation_type', followUpType)
          .not('status', 'in', '(dismissed,sent,no_longer_needed)')
          .single()

        if (!existingRec) {
          await supabase.from('follow_up_recommendations').insert({
            user_id:                    account.user_id,
            connected_email_account_id: accountId,
            provider_thread_id:         msg.providerThreadId,
            source_message_id:          inserted.id,
            recommendation_type:        followUpType,
            reason:                     followUpReason ?? '',
            urgency:                    followUpUrgency,
            confidence:                 classificationConfidence ?? 'medium',
            status:                     'pending',
          })
          recommendationsCreated++
        }
      }
    }

    if (page.nextCursor) {
      await supabase
        .from('connected_email_accounts')
        .update({ sync_cursor: page.nextCursor, last_successful_sync_at: new Date().toISOString(), initial_sync_completed: true })
        .eq('id', accountId)
    } else {
      await supabase
        .from('connected_email_accounts')
        .update({ sync_cursor: null, last_successful_sync_at: new Date().toISOString(), initial_sync_completed: true })
        .eq('id', accountId)
    }

    if (runId) {
      await supabase.from('email_sync_runs').update({
        status: 'completed', completed_at: new Date().toISOString(),
        messages_scanned: page.messages.length, messages_created: messagesCreated, recommendations_created: recommendationsCreated,
      }).eq('id', runId)
    }

    return { messagesCreated, recommendationsCreated }
  } catch (err) {
    const errorSummary = err instanceof Error ? err.message : String(err)
    await supabase.from('connected_email_accounts').update({ connection_status: 'reconnect_required' }).eq('id', accountId)
    if (runId) {
      await supabase.from('email_sync_runs').update({ status: 'failed', completed_at: new Date().toISOString(), error_summary: errorSummary }).eq('id', runId)
    }
    return { messagesCreated: 0, recommendationsCreated: 0, error: errorSummary }
  }
}
