import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getStripe, getPriceId } from '@/lib/stripe'

const logger = console

const VALID_CURRENCIES = new Set(['gbp', 'usd', 'inr'])

function resolveCurrency(
  bodyCurrency: string | undefined,
  userLocale: string | null | undefined,
  acceptLanguage: string | null,
): 'gbp' | 'usd' | 'inr' {
  if (bodyCurrency && VALID_CURRENCIES.has(bodyCurrency.toLowerCase())) {
    return bodyCurrency.toLowerCase() as 'gbp' | 'usd' | 'inr'
  }
  if (userLocale === 'in') return 'inr'
  if (userLocale === 'uk') return 'gbp'
  const lang = (acceptLanguage ?? '').toLowerCase()
  if (lang.includes('en-us') || lang.includes('en_us')) return 'usd'
  if (lang.includes('en-in') || lang.includes('hi')) return 'inr'
  return 'gbp'
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { plan?: string; interval?: string; currency?: string; promoCode?: string }
  const plan = body.plan ?? 'pro'
  const interval = body.interval ?? 'month'
  const promoCodeRaw = (body.promoCode ?? '').trim().toUpperCase()

  const { data: profile } = await supabase
    .from('users')
    .select('locale, stripe_customer_id, name')
    .eq('id', user.id)
    .single()

  const currency = resolveCurrency(body.currency, profile?.locale, req.headers.get('accept-language'))

  let priceId: string
  try {
    priceId = getPriceId(plan, interval, currency)
  } catch {
    return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 })
  }

  const stripe = getStripe()

  let customerId = profile?.stripe_customer_id ?? undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let resolvedPromotionCodeId: string | undefined
  if (promoCodeRaw) {
    try {
      const list = await stripe.promotionCodes.list({
        code: promoCodeRaw,
        active: true,
        limit: 1,
      })
      if (list.data.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 })
      }
      resolvedPromotionCodeId = list.data[0].id
    } catch (promoErr) {
      Sentry.captureException(promoErr)
      logger.error('[billing/checkout] promo code lookup failed:', promoErr)
      return NextResponse.json({ error: 'Could not verify promo code' }, { status: 500 })
    }
  }

  try {
    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings?tab=plan&upgraded=1`,
      cancel_url: `${origin}/settings?tab=plan`,
    }

    if (resolvedPromotionCodeId) {
      // When we pre-apply a code, Stripe disallows allow_promotion_codes — the
      // user can't also type a second one. Cleanly one-or-the-other.
      sessionParams.discounts = [{ promotion_code: resolvedPromotionCodeId }]
    } else {
      sessionParams.allow_promotion_codes = true
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    Sentry.setUser({ id: user.id })
    Sentry.captureException(err)
    logger.error('[billing/checkout] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
