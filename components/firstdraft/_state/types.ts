export type BrandKit = {
  domain: string
  name: string
  faviconUrl: string
  logoSrc?: string
  colors: { primary: string; secondary: string; text: string }
  font: string
}

export type Connector = {
  id: string
  name: string
  iconSrc?: string
}

export type ActivityEntry =
  | { delay: number; type: 'main'; text: string }
  | { delay: number; type: 'sub'; text: string }
  | { delay: number; type: 'sub-list'; items: string[] }
  | { delay: number; type: 'done'; text: string }

export type CardType = 'popup' | 'flow' | 'smarttip' | 'article'
export type Confidence = 'high' | 'medium' | 'low'
export type BuildStatus = 'queued' | 'building' | 'built' | 'failed'

export type FlowStep = {
  num: number
  anchor: { top: string; left: string }
  anchorLabel: string
  title: string
  body: string
}

export type JourneyCard =
  | { id: string; type: 'popup'; title: string; confidence: Confidence; body: string; cta: { primary: string; secondary: string }; audience: string }
  | { id: string; type: 'flow'; title: string; confidence: Confidence; steps: FlowStep[]; audience: string }
  | { id: string; type: 'smarttip'; title: string; confidence: Confidence; anchorLabel: string; body: string; audience: string; alternative?: string }
  | { id: string; type: 'article'; title: string; confidence: Confidence; sections: Array<{ heading: string; body: string }>; audience: string }

export type Journey = { cards: JourneyCard[] }

export type CreatePhase =
  | { phase: 'onboarding-needed' }
  | { phase: 'onboarding'; step: 1 | 2 | 3; brandKit?: BrandKit; rules?: string[]; connectors?: string[] }
  | { phase: 'discovery'; attachedFiles: string[]; prompt: string }
  | { phase: 'clarifying'; question: string; userAnswer?: string }
  | { phase: 'thinking' }
  | { phase: 'plan'; journey: Journey; selectedCardId?: string }
  | { phase: 'building'; journey: Journey; progress: Record<string, BuildStatus> }
  | { phase: 'completed'; journey: Journey }
