"use client"

import { WelcomeIllustration } from "./welcome-illustration"

interface Props {
  titleId: string
}

export function WelcomeSlide({ titleId }: Props) {
  return (
    <div className="wfc-slide wfc-welcome-slide">
      <WelcomeIllustration />

      <div className="wfc-welcome-copy">
        <h2 id={titleId} className="wfc-welcome-title">
          Welcome to First draft.
        </h2>
        <p className="wfc-welcome-sub">
          I turn release notes, tickets, and product signals into a first draft — popups, flows, smart tips, articles.
          You review before anything ships. Three quick questions to get started.
        </p>
      </div>

      <div className="wfc-welcome-pills">
        <span className="wfc-welcome-pill"><span className="wfc-welcome-pill-num">1</span>Your brand</span>
        <span className="wfc-welcome-pill-sep" aria-hidden="true">→</span>
        <span className="wfc-welcome-pill"><span className="wfc-welcome-pill-num">2</span>Writing rules</span>
        <span className="wfc-welcome-pill-sep" aria-hidden="true">→</span>
        <span className="wfc-welcome-pill"><span className="wfc-welcome-pill-num">3</span>Your sources</span>
      </div>
    </div>
  )
}
