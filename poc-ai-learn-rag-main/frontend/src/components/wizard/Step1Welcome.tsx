import { useWizardStore } from '../../store/wizardStore'

export function Step1Welcome() {
  const { setStep } = useWizardStore()

  return (
    <div className="wizard-card">
      <div className="welcome-hero">
        <div className="hero-icon">📚</div>
        <h1>Set up your Knowledge Hub</h1>
        <p className="hero-sub">
          Connect to your documentation portal, choose your AI model, and we'll build a private,
          searchable knowledge base for your team — everything runs locally on your machine.
        </p>
        <div className="hero-steps">
          <div className="hero-step"><span className="hs-num">1</span><span>Point to your docs portal</span></div>
          <div className="hero-step"><span className="hs-num">2</span><span>Add your AI credentials</span></div>
          <div className="hero-step"><span className="hs-num">3</span><span>We crawl, index &amp; launch</span></div>
        </div>
      </div>
      <div className="card-footer">
        <div />
        <button className="btn-primary" onClick={() => setStep(2)}>Get Started →</button>
      </div>
    </div>
  )
}
