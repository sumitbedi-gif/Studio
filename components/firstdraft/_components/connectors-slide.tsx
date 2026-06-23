"use client"

import { useState } from "react"
import { Check, Loader2, Plus } from "lucide-react"
import { CONNECTORS } from "../_state/mock-data"

interface Props {
  titleId: string
  connectors: string[]
  onChange: (connectors: string[]) => void
}

const FAVICON_DOMAIN: Record<string, string> = {
  servicenow: "servicenow.com",
  jira: "atlassian.com",
  confluence: "atlassian.com",
  sharepoint: "microsoft.com",
  zendesk: "zendesk.com",
  teams: "microsoft.com",
}

function connectorFavicon(id: string) {
  const domain = FAVICON_DOMAIN[id] ?? `${id}.com`
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

export function ConnectorsSlide({ titleId, connectors, onChange }: Props) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [hoveredConnected, setHoveredConnected] = useState<string | null>(null)

  const toggle = (id: string) => {
    if (connecting) return
    if (connectors.includes(id)) {
      onChange(connectors.filter((c) => c !== id))
      return
    }
    setConnecting(id)
    setTimeout(() => {
      setConnecting(null)
      onChange([...connectors, id])
    }, 700)
  }

  const count = connectors.length

  return (
    <div className="wfc-slide">
      <div>
        <h2 id={titleId} className="wfc-slide-title">Connect your sources.</h2>
        <p className="wfc-slide-sub" style={{ marginTop: 6 }}>
          I&apos;ll watch for tickets, releases, and docs that need guidance. Change any time.
        </p>
      </div>

      <div className="wfc-conn-grid">
        {CONNECTORS.map((c) => {
          const isConnected = connectors.includes(c.id)
          const isConnecting = connecting === c.id
          const isHovered = hoveredConnected === c.id
          return (
            <button
              key={c.id}
              type="button"
              className={`wfc-conn-tile ${isConnected ? "is-connected" : ""}`}
              onClick={() => toggle(c.id)}
              onMouseEnter={() => isConnected && setHoveredConnected(c.id)}
              onMouseLeave={() => setHoveredConnected(null)}
              disabled={isConnecting}
              aria-pressed={isConnected}
            >
              <div className="wfc-conn-row-top">
                <div className="wfc-conn-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={connectorFavicon(c.id)} alt="" />
                </div>
                {isConnected && (
                  <span className="wfc-conn-mark" aria-label="Connected">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </div>
              <span className="wfc-conn-name">{c.name}</span>
              <span className="wfc-conn-status">
                {isConnecting
                  ? <><Loader2 size={11} strokeWidth={2} className="wfc-spin" /> Connecting</>
                  : isConnected
                    ? (isHovered ? "Disconnect" : "Connected")
                    : "Connect"}
              </span>
            </button>
          )
        })}
      </div>

      <div className="wfc-conn-footer">
        <button type="button" className="wfc-browse-all">
          <Plus size={12} strokeWidth={2} />
          Browse all connectors
        </button>
        <span className="wfc-conn-count" aria-live="polite">
          {count} connected
        </span>
      </div>
    </div>
  )
}
