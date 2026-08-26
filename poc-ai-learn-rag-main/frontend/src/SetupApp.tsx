import { useEffect } from 'react'
import { useWizardStore } from './store/wizardStore'
import { StepIndicator } from './components/wizard/StepIndicator'
import { Step1Welcome } from './components/wizard/Step1Welcome'
import { Step2Source } from './components/wizard/Step2Source'
import { Step3Auth } from './components/wizard/Step3Auth'
import { Step4AI } from './components/wizard/Step4AI'
import { Step5Build } from './components/wizard/Step5Build'

export function SetupApp() {
  const { step } = useWizardStore()

  // Set OAuth callback hint
  useEffect(() => {
    document.title = 'Knowledge Hub — Setup'
  }, [])

  return (
    <div className="wizard-shell">
      <StepIndicator currentStep={step} totalSteps={5} />

      {step === 1 && <Step1Welcome />}
      {step === 2 && <Step2Source />}
      {step === 3 && <Step3Auth />}
      {step === 4 && <Step4AI />}
      {step === 5 && <Step5Build />}
    </div>
  )
}
