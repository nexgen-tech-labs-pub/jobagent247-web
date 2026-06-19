import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerClient } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = (await req.json()) as { code?: string }
  const normalised = (code ?? '').trim().toUpperCase()
  if (!normalised) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const list = await stripe.promotionCodes.list({
      code: normalised,
      active: true,
      limit: 1,
      expand: ['data.promotion.coupon'],
    })
    if (list.data.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired promo code' }, { status: 404 })
    }
    const promo = list.data[0]
    const couponRef = promo.promotion?.coupon
    if (!couponRef) {
      return NextResponse.json({ valid: false, error: 'Promo code has no coupon' }, { status: 404 })
    }
    const coupon = typeof couponRef === 'string'
      ? await stripe.coupons.retrieve(couponRef)
      : couponRef

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: coupon.percent_off != null ? 'percent' : 'amount',
      percentOff: coupon.percent_off ?? null,
      amountOff: coupon.amount_off ?? null,
      currency: coupon.currency ?? null,
      duration: coupon.duration,
      durationInMonths: coupon.duration_in_months ?? null,
      name: coupon.name ?? null,
    })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Could not verify promo code' }, { status: 500 })
  }
}
