import { createServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('name, location, plan, locale, credits_balance, stripe_customer_id, founding_member, trial_ends_at')
    .eq('id', user.id)
    .single()

  return (
    <SettingsClient
      name={profile?.name ?? ''}
      email={user.email ?? ''}
      location={profile?.location ?? ''}
      plan={(profile?.plan as 'free' | 'pro' | 'accelerator') ?? 'free'}
      locale={(profile?.locale as 'uk' | 'in') ?? 'uk'}
      creditsBalance={(profile?.credits_balance as number) ?? 0}
      stripeCustomerId={(profile?.stripe_customer_id as string | null) ?? null}
      foundingMember={(profile?.founding_member as boolean) ?? false}
      trialEndsAt={(profile?.trial_ends_at as string | null) ?? null}
    />
  )
}
