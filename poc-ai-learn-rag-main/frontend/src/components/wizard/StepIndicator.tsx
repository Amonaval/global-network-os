const STEP_LABELS = ['Welcome', 'Portal', 'Auth', 'AI', 'Build']

interface Props {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: Props) {
  return (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => {
        const n = i + 1
        const isActive = n === currentStep
        const isDone = n < currentStep
        return (
          <div key={n} style={{ display: 'contents' }}>
            <div
              className={`step-item${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
              data-step={n}
            >
              <div className="step-dot">{n}</div>
              <div className="step-label">{STEP_LABELS[i]}</div>
            </div>
            {n < totalSteps && <div className="step-line" />}
          </div>
        )
      })}
    </div>
  )
}
