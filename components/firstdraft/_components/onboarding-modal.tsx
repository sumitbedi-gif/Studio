"use client"

import { useEffect, useRef, useState } from "react"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import type { BrandKit } from "../_state/types"
import { WelcomeSlide } from "./welcome-slide"
import { BrandFetch } from "./brand-fetch"
import { SystemRulesSlide, type ContextFile } from "./system-rules-slide"
import { ConnectorsSlide } from "./connectors-slide"

export type { ContextFile }

export type OnboardingResult = {
  brandKit: BrandKit | null
  rules: string[]
  contextFiles: ContextFile[]
  connectors: string[]
}

interface Props {
  initial: OnboardingResult
  isReentry: boolean
  onClose: () => void
  onDone: (result: OnboardingResult) => void
}

type Step = 0 | 1 | 2 | 3

const STEP_LABELS = ["Brand", "Context", "Connectors"]

export function OnboardingModal({ initial, isReentry, onClose, onDone }: Props) {
  // Re-entry skips the welcome prelude; first-run starts at welcome.
  const [step, setStep] = useState<Step>(isReentry ? 1 : 0)
  const [brandKit, setBrandKit] = useState<BrandKit | null>(initial.brandKit)
  const [rules, setRules] = useState<string[]>(initial.rules)
  const [contextFiles, setContextFiles] = useState<ContextFile[]>(initial.contextFiles)
  const [connectors, setConnectors] = useState<string[]>(initial.connectors)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const isLast = step === 3
  const isWelcome = step === 0

  const next = () => {
    if (isLast) {
      onDone({ brandKit, rules, contextFiles, connectors })
      return
    }
    setStep((s) => ((s + 1) as Step))
  }

  const skip = () => {
    if (isLast) {
      onDone({ brandKit, rules, contextFiles, connectors })
      return
    }
    setStep((s) => ((s + 1) as Step))
  }

  // Back moves to the previous content step. Hidden on step 1 (no content step
  // before it) and on the welcome slide.
  const back = () => {
    setStep((s) => (Math.max(1, s - 1) as Step))
  }
  const canGoBack = step > 1

  return (
    <div
      className="wfc-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="wfc-modal wfc-modal-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wfc-modal-title"
      >
        {!isWelcome && (
          <div className="wfc-modal-header">
            <div className="wfc-modal-brand">
              <span>First draft</span>
              {isReentry && <span className="wfc-modal-brand-suffix">· Edit setup</span>}
            </div>
            <button type="button" className="wfc-modal-close" onClick={onClose} aria-label="Close">
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        )}

        {isWelcome && (
          <button
            type="button"
            className="wfc-modal-close wfc-modal-close-floating"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}

        {!isWelcome && (
          <div
            className="wfc-modal-steps"
            aria-label={`Step ${step} of 3: ${STEP_LABELS[step - 1]}`}
          >
            {[1, 2, 3].map((n, i) => (
              <div key={n} className="wfc-modal-steps-segment" data-last={i === 2 ? "true" : "false"}>
                <div className={`wfc-step-dot ${step === n ? "active" : step > n ? "done" : ""}`} />
                {i < 2 && (
                  <div
                    className="wfc-step-bar"
                    style={{ ["--bar-fill" as string]: step > n ? "100%" : "0%" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`wfc-modal-body${isWelcome ? " wfc-modal-body-welcome" : ""}`}>
          {step === 0 && <WelcomeSlide titleId="wfc-modal-title" />}
          {step === 1 && (
            <BrandFetch
              titleId="wfc-modal-title"
              initial={brandKit}
              skipAnimation={isReentry && Boolean(brandKit)}
              onResolved={setBrandKit}
            />
          )}
          {step === 2 && (
            <SystemRulesSlide
              titleId="wfc-modal-title"
              rules={rules}
              onChange={setRules}
              contextFiles={contextFiles}
              onChangeFiles={setContextFiles}
            />
          )}
          {step === 3 && (
            <ConnectorsSlide
              titleId="wfc-modal-title"
              connectors={connectors}
              onChange={setConnectors}
            />
          )}
        </div>

        <div className="wfc-modal-footer">
          {isWelcome ? (
            <>
              <button type="button" className="wfc-skip-link" onClick={onClose}>
                Maybe later
              </button>
              <button type="button" className="wfc-modal-next" onClick={next}>
                Let&apos;s set up <ArrowRight size={14} strokeWidth={2} />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="wfc-skip-link" onClick={skip}>
                {isReentry ? "Cancel" : isLast ? "Done" : "Skip this step"}
              </button>
              <div className="wfc-modal-footer-end">
                {canGoBack && (
                  <button type="button" className="wfc-modal-back" onClick={back}>
                    <ArrowLeft size={14} strokeWidth={2} /> Back
                  </button>
                )}
                <button type="button" className="wfc-modal-next" onClick={next}>
                  {isReentry && isLast ? "Save" : isLast ? "Done" : (
                    <>
                      Next <ArrowRight size={14} strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
