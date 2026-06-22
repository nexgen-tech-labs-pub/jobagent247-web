'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Zap, Shield } from 'lucide-react'

interface SettingsClientProps {
  name: string
  email: string
  location: string
  plan: 'free' | 'pro' | 'accelerator'
  locale: 'uk' | 'in'
  creditsBalance: number
  stripeCustomerId: string | null
  foundingMember: boolean
  trialEndsAt: string | null
}

export function SettingsClient({ name, email, location, plan, locale, stripeCustomerId, foundingMember, trialEndsAt }: SettingsClientProps) {
  const [saved, setSaved] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCheckout = async (planKey: string) => {
    setCheckoutLoading(planKey)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, interval: 'month' }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Checkout failed')
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Could not open billing portal')
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Could not open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  const hasActiveSubscription = !!stripeCustomerId
  const onTrial = foundingMember && !stripeCustomerId && plan !== 'free' && !!trialEndsAt
  const trialEndDate = trialEndsAt ? new Date(trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  const planLabel =
    plan === 'accelerator' ? 'Career Accelerator' : plan === 'pro' ? 'Pro' : 'Free'

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl">
        <Tabs defaultValue="account">
          <TabsList className="mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Account */}
          <TabsContent value="account">
            <GlassCard className="p-6 space-y-5">
              <h3 className="font-heading font-semibold text-white">Account Information</h3>
              {[
                { label: 'Full name', value: name },
                { label: 'Email address', value: email },
                { label: 'Location', value: location },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                  />
                </div>
              ))}
              <div className="pt-2">
                <GradientButton size="sm" onClick={handleSave}>
                  {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save changes'}
                </GradientButton>
              </div>
            </GlassCard>

            <GlassCard className="p-6 mt-4">
              <h3 className="font-heading font-semibold text-white mb-4">Password</h3>
              <SecondaryButton size="sm">Change password</SecondaryButton>
            </GlassCard>

            <GlassCard className="p-6 mt-4">
              <h3 className="font-heading font-semibold text-white mb-2">Danger Zone</h3>
              <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>Permanently delete your account and all associated data.</p>
              <button className="text-sm px-4 py-2 rounded-xl font-medium"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                Delete account
              </button>
            </GlassCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <GlassCard className="p-6 space-y-5">
              <h3 className="font-heading font-semibold text-white">Notification Preferences</h3>
              {[
                { label: 'New job matches', desc: 'Get notified when new jobs match your profile', enabled: true },
                { label: 'Follow-up reminders', desc: 'Remind me when a follow-up is due', enabled: true },
                { label: 'Interview reminders', desc: 'Notify me 24 hours before an interview', enabled: true },
                { label: 'Weekly job digest', desc: 'Weekly summary of top job matches', enabled: false },
                { label: 'Product updates', desc: 'New features and platform improvements', enabled: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{item.desc}</p>
                  </div>
                  <div className="w-10 h-5 rounded-full relative cursor-pointer"
                    style={{ background: item.enabled ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                      style={{ left: item.enabled ? '22px' : '2px', transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </GlassCard>
          </TabsContent>

          {/* Plan */}
          <TabsContent value="plan">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-white">Current Plan</h3>
                  <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>You are on the {planLabel} plan</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                  {planLabel}
                </span>
              </div>

              {plan === 'free' && (
                <>
                  <div className="rounded-xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                      <span className="font-heading font-semibold text-white">
                        Upgrade to Pro — {locale === 'in' ? '₹500' : '£9.99'}/month
                      </span>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#CBD5E1' }}>Unlimited CV improvements, job matching, cover letters, and interview prep.</p>
                    <button
                      className="btn-gradient text-sm px-4 py-2 disabled:opacity-60"
                      disabled={checkoutLoading === 'pro'}
                      onClick={() => handleCheckout('pro')}
                    >
                      {checkoutLoading === 'pro' ? 'Processing…' : 'Upgrade to Pro'}
                    </button>
                  </div>

                  <div className="rounded-xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(139,92,246,0.08))', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      <span className="font-heading font-semibold text-white">
                        Career Accelerator — {locale === 'in' ? '₹1,000' : '£29.99'}/month
                      </span>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#CBD5E1' }}>Everything in Pro plus mock interviews, DOCX export, and priority support.</p>
                    <button
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-60"
                      disabled={checkoutLoading === 'accelerator'}
                      onClick={() => handleCheckout('accelerator')}
                    >
                      {checkoutLoading === 'accelerator' ? 'Processing…' : 'Upgrade to Accelerator'}
                    </button>
                  </div>
                </>
              )}

              {onTrial && (
                <div className="rounded-xl p-5 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <p className="text-sm font-medium text-white mb-1">
                    Founding-member trial active
                  </p>
                  <p className="text-sm mb-3" style={{ color: '#CBD5E1' }}>
                    Your free Pro trial runs until <span className="font-semibold text-white">{trialEndDate}</span>. Add a payment method to keep Pro after the trial ends — no charge today.
                  </p>
                  <button
                    className="btn-gradient text-sm px-4 py-2 disabled:opacity-60"
                    disabled={checkoutLoading === 'pro'}
                    onClick={() => handleCheckout('pro')}
                  >
                    {checkoutLoading === 'pro' ? 'Processing…' : 'Add payment method'}
                  </button>
                </div>
              )}

              {hasActiveSubscription && (
                <div>
                  <button
                    type="button"
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-60"
                  >
                    {portalLoading ? 'Opening…' : 'Manage subscription'}
                  </button>
                  {portalError && (
                    <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{portalError}</p>
                  )}
                </div>
              )}

              <p className="text-xs mt-4" style={{ color: '#64748B' }}>
                Billing managed securely via Stripe. Cancel anytime. No hidden fees.
              </p>
            </GlassCard>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5" style={{ color: '#06B6D4' }} />
                <h3 className="font-heading font-semibold text-white">Privacy & Data</h3>
              </div>
              <div className="space-y-4 text-sm" style={{ color: '#94A3B8' }}>
                <p>Your CV, profile data, and generated documents are stored securely and are never shared with employers or third parties without your explicit consent.</p>
                <p>AI analysis of your CV is performed using your data only and is not used to train AI models.</p>
              </div>
              <div className="mt-6 space-y-3">
                <SecondaryButton size="sm" className="w-full justify-center">Export my data</SecondaryButton>
                <SecondaryButton size="sm" className="w-full justify-center">Download my CVs</SecondaryButton>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
