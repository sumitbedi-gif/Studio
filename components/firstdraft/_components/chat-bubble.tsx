"use client"

import { ReactNode } from "react"
import { FileText } from "lucide-react"

interface UserProps {
  text: string
  attachedFile?: string | null
}

export function UserBubble({ text, attachedFile }: UserProps) {
  return (
    <div className="wfc-msg wfc-msg-user wfc-fade-up">
      <div className="wfc-msg-user-content">
        {attachedFile && (
          <div className="wfc-msg-file">
            <FileText size={12} strokeWidth={1.8} />
            <span>{attachedFile}</span>
          </div>
        )}
        <p className="wfc-msg-text">{text}</p>
      </div>
    </div>
  )
}

interface AgentProps {
  children: ReactNode
  thinking?: boolean
  delay?: number
}

export function AgentBubble({ children, thinking, delay = 0 }: AgentProps) {
  return (
    <div
      className="wfc-msg wfc-msg-agent wfc-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {thinking ? (
        <div className="wfc-thinking-dots" aria-label="Agent thinking">
          <span /><span /><span />
        </div>
      ) : (
        <div className="wfc-msg-text">{children}</div>
      )}
    </div>
  )
}
