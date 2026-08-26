import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLicense, useActivateLicense, useDeactivateLicense } from '../../hooks/useApi'

interface Props {
  onClose: () => void
}

export function LicenseModal({ onClose }: Props) {
  const { data: license, isLoading } = useLicense()
  const activateMutation = useActivateLicense()
  const deactivateMutation = useDeactivateLicense()
  const [keyInput, setKeyInput] = useState('')
  const [activateMsg, setActivateMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleActivate = async () => {
    const key = keyInput.trim()
    if (!key) { setActivateMsg({ type: 'err', text: 'Enter a license key.' }); return }
    setActivateMsg(null)
    try {
      const result = await activateMutation.mutateAsync(key)
      setActivateMsg({ type: 'ok', text: `✓ Activated ${result.tierName} plan!` })
      setKeyInput('')
    } catch (err) {
      setActivateMsg({ type: 'err', text: err instanceof Error ? err.message : 'Activation failed' })
    }
  }

  const handleDeactivate = async () => {
    if (!confirm('Remove the license from this machine? You can re-activate it at any time.')) return
    await deactivateMutation.mutateAsync()
  }

  const openCheckout = (planKey: 'proMonthly' | 'proAnnual' | 'lifetime') => {
    if (!license) return
    const urls: Record<string, string | undefined> = {
      proMonthly: license.stripeProMonthlyUrl,
      proAnnual: license.stripeProAnnualUrl,
      lifetime: license.stripeLifetimeUrl,
    }
    const url = urls[planKey]
    if (!url) {
      const subject = encodeURIComponent('Knowledge Hub License Request')
      const body = encodeURIComponent(`Hi, I'm interested in the ${planKey} plan.`)
      window.location.href = `mailto:sales@xyz.com?subject=${subject}&body=${body}`
      return
    }
    window.open(url, '_blank')
  }

  const modal = (
    <div
      className="modal-backdrop"
      style={{ display: 'flex' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-card license-modal">
        <div className="modal-header">
          <h2>License &amp; Billing</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {isLoading ? <div style={{ padding: 24 }}>Loading…</div> : license && (
          <>
            <div className="license-current">
              <div className="license-plan-row">
                <div>
                  <div className="license-plan-name">{license.tierName} Plan</div>
                  <div className="license-plan-sub">
                    {license.tier === 'free'
                      ? `Limited to ${license.queryLimit} queries/month and ${license.uploadLimit} uploads.`
                      : 'Unlimited queries, uploads, and all integrations.'}
                  </div>
                </div>
                <span className="license-tier-badge" style={{ background: license.tierColor }}>{license.tierName}</span>
              </div>

              <div className="license-usage-row">
                <UsageBar
                  label="Queries this month"
                  used={license.queriesThisMonth || 0}
                  limit={license.queryLimit}
                />
                <UsageBar
                  label="Uploaded documents"
                  used={license.uploadCount || 0}
                  limit={license.uploadLimit}
                />
              </div>

              {license.key && license.activatedAt && (
                <div className="license-activated-info">
                  Key: {license.key}{license.offline ? ' (offline mode)' : ''} · Activated: {new Date(license.activatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {license.tier === 'free' && (
              <div className="license-plans">
                <div className="plans-heading">Upgrade for unlimited access</div>
                <div className="plans-grid">
                  <PlanCard
                    name="Pro Monthly" price="$19" period="/month"
                    features={['Unlimited queries', 'Unlimited uploads', 'Confluence integration', 'Analytics dashboard']}
                    btnLabel={license.stripeProMonthlyUrl ? 'Get Pro Monthly' : 'Request Access'}
                    onBuy={() => openCheckout('proMonthly')}
                  />
                  <PlanCard
                    name="Pro Annual" price="$149" period="/year"
                    badge="Best value" featured
                    features={['Everything in Pro Monthly', 'Save 34% vs monthly', 'Priority support']}
                    btnLabel={license.stripeProAnnualUrl ? 'Get Pro Annual' : 'Request Access'}
                    onBuy={() => openCheckout('proAnnual')}
                  />
                  <PlanCard
                    name="Lifetime" price="$299" period=" once"
                    features={['Everything in Pro', 'All future updates', 'No recurring fees']}
                    btnLabel={license.stripeLifetimeUrl ? 'Get Lifetime' : 'Request Access'}
                    onBuy={() => openCheckout('lifetime')}
                  />
                </div>
              </div>
            )}

            <div className="license-activate">
              <div className="activate-heading">Have a license key?</div>
              <div className="activate-row">
                <input
                  type="text"
                  className="license-key-input"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={24}
                  spellCheck={false}
                  autoComplete="off"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                />
                <button
                  className="activate-btn"
                  onClick={handleActivate}
                  disabled={activateMutation.isPending}
                >
                  {activateMutation.isPending ? 'Activating…' : 'Activate'}
                </button>
              </div>
              {activateMsg && (
                <div className={`activate-result activate-result-${activateMsg.type}`}>
                  {activateMsg.text}
                </div>
              )}
            </div>

            {license.key && (
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <button className="deactivate-link" onClick={handleDeactivate}>
                  Remove license from this machine
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit === -1 ? 0 : Math.min(100, (used / limit) * 100)
  return (
    <div className="license-usage-item">
      <div className="usage-label">{label}</div>
      <div className="usage-bar-wrap">
        <div className={`usage-bar${pct >= 90 ? ' usage-bar-warn' : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="usage-count">{limit === -1 ? `${used} (unlimited)` : `${used} / ${limit}`}</div>
    </div>
  )
}

function PlanCard({ name, price, period, badge, featured, features, btnLabel, onBuy }: {
  name: string; price: string; period: string; badge?: string; featured?: boolean
  features: string[]; btnLabel: string; onBuy: () => void
}) {
  return (
    <div className={`plan-card${featured ? ' plan-featured' : ''}`}>
      {badge && <div className="plan-badge">{badge}</div>}
      <div className="plan-name">{name}</div>
      <div className="plan-price">{price}<span className="plan-period">{period}</span></div>
      <ul className="plan-features">
        {features.map(f => <li key={f}>✓ {f}</li>)}
      </ul>
      <button className={`plan-btn${featured ? ' plan-btn-featured' : ''}`} onClick={onBuy}>{btnLabel}</button>
    </div>
  )
}
