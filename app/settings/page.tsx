'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { mockUserProfile } from '@/lib/mock-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Zap, Shield, Bell } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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
                { label: 'Full name', value: mockUserProfile.name },
                { label: 'Email address', value: mockUserProfile.email },
                { label: 'Location', value: mockUserProfile.location },
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
                  <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>You are on the Free plan</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>Free</span>
              </div>
              <div className="rounded-xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(139,92,246,0.3)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                  <span className="font-heading font-semibold text-white">Upgrade to Pro — £9.99/month</span>
                </div>
                <p className="text-sm mb-4" style={{ color: '#CBD5E1' }}>Unlimited CV improvements, job matching, cover letters, and interview prep.</p>
                <GradientButton size="sm">Upgrade to Pro</GradientButton>
              </div>
              <p className="text-xs" style={{ color: '#64748B' }}>Billing managed securely. Cancel anytime. No hidden fees.</p>
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
