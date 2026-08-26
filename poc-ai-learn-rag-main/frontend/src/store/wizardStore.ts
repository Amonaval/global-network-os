import { create } from 'zustand'
import type { WizardForm, UrlGroup } from '../types'

const DEFAULT_FORM: WizardForm = {
  appName: 'Knowledge Hub',
  sourceType: 'portal',
  portalUrl: '',
  sections: '',
  contentSelector: '#main-content',
  nextBtnSelector: '.article-next',
  confluenceUrl: '',
  confluenceSpaces: '',
  confluenceAuthMethod: 'apitoken',
  confluenceEmail: '',
  confluenceToken: '',
  confluenceClientId: '',
  confluenceClientSecret: '',
  authType: 'none',
  authEmail: '',
  authPassword: '',
  llmProvider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:3b',
  anthropicKey: '',
  vllmUrl: 'http://localhost:8000',
  vllmModel: '',
  embProvider: 'nomic',
  openaiKey: '',
  urlGroups: [{ name: 'web-pages', urls: '' }],
  urlSelector: '',
}

type BuildState = 'idle' | 'building' | 'done' | 'error'

interface WizardState {
  step: number
  form: WizardForm
  oauthConnected: boolean
  oauthCloudName: string
  preloginDone: boolean
  buildState: BuildState
  buildLog: string[]
  buildPhase: string
  errorMessage: string
  successMessage: string

  setStep: (n: number) => void
  setField: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void
  setUrlGroup: (index: number, field: keyof UrlGroup, value: string) => void
  addUrlGroup: () => void
  removeUrlGroup: (index: number) => void
  setOauthConnected: (cloudName: string) => void
  resetOauth: () => void
  setPreloginDone: (done: boolean) => void
  setBuildState: (state: BuildState) => void
  appendBuildLog: (msg: string) => void
  setBuildPhase: (phase: string) => void
  setError: (msg: string) => void
  setSuccess: (msg: string) => void
  resetBuild: () => void
}

export const useWizardStore = create<WizardState>(set => ({
  step: 1,
  form: { ...DEFAULT_FORM },
  oauthConnected: false,
  oauthCloudName: '',
  preloginDone: false,
  buildState: 'idle',
  buildLog: [],
  buildPhase: 'Initialising…',
  errorMessage: '',
  successMessage: '',

  setStep: step => set({ step }),
  setField: (key, value) => set(s => ({ form: { ...s.form, [key]: value } })),
  setUrlGroup: (index, field, value) => set(s => ({
    form: { ...s.form, urlGroups: s.form.urlGroups.map((g, i) => i === index ? { ...g, [field]: value } : g) }
  })),
  addUrlGroup: () => set(s => ({
    form: { ...s.form, urlGroups: [...s.form.urlGroups, { name: '', urls: '' }] }
  })),
  removeUrlGroup: (index) => set(s => ({
    form: { ...s.form, urlGroups: s.form.urlGroups.filter((_, i) => i !== index) }
  })),
  setOauthConnected: cloudName => set({ oauthConnected: true, oauthCloudName: cloudName }),
  resetOauth: () => set({ oauthConnected: false, oauthCloudName: '' }),
  setPreloginDone: preloginDone => set({ preloginDone }),
  setBuildState: buildState => set({ buildState }),
  appendBuildLog: msg => set(s => ({ buildLog: [...s.buildLog, msg] })),
  setBuildPhase: buildPhase => set({ buildPhase }),
  setError: errorMessage => set({ errorMessage, buildState: 'error' }),
  setSuccess: successMessage => set({ successMessage, buildState: 'done' }),
  resetBuild: () => set({ buildState: 'idle', buildLog: [], buildPhase: 'Initialising…', errorMessage: '' }),
}))
