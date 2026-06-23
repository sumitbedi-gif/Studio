"use client"

import { useEffect, useState } from "react"
import { Zap, Check } from "lucide-react"
import { ACTIVITY_STREAM } from "../_state/mock-data"
import type { ActivityEntry } from "../_state/types"

interface Props {
  onComplete: () => void
}

export function ActivityStream({ onComplete }: Props) {
  const [visible, setVisible] = useState<number>(0)

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    ACTIVITY_STREAM.forEach((entry, i) => {
      timeouts.push(
        setTimeout(() => {
          setVisible(i + 1)
          if (i === ACTIVITY_STREAM.length - 1) {
            // give the final "Plan ready" a beat before transitioning out
            timeouts.push(setTimeout(onComplete, 900))
          }
        }, entry.delay)
      )
    })
    return () => { timeouts.forEach(clearTimeout) }
  }, [onComplete])

  return (
    <div className="wfc-activity">
      <div className="wfc-activity-ambient" aria-hidden="true" />
      <div className="wfc-activity-list">
        {ACTIVITY_STREAM.slice(0, visible).map((entry, i) => (
          <ActivityRow key={i} entry={entry} />
        ))}
      </div>
    </div>
  )
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  if (entry.type === "main") {
    return (
      <div className="wfc-activity-row wfc-activity-main wfc-activity-in">
        <Zap size={12} strokeWidth={2} className="wfc-activity-icon-main" />
        <span>{entry.text}</span>
      </div>
    )
  }
  if (entry.type === "sub") {
    return (
      <div className="wfc-activity-row wfc-activity-sub wfc-activity-in">
        <span className="wfc-activity-elbow">└─</span>
        <span>{entry.text}</span>
      </div>
    )
  }
  if (entry.type === "sub-list") {
    return (
      <div className="wfc-activity-row wfc-activity-sublist wfc-activity-in">
        {entry.items.map((item, idx) => (
          <div key={idx} className="wfc-activity-sublist-item">
            <span className="wfc-activity-sublist-num">{idx + 1}.</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    )
  }
  // done
  return (
    <div className="wfc-activity-row wfc-activity-done wfc-activity-in">
      <Check size={12} strokeWidth={2.5} className="wfc-activity-icon-done" />
      <span>{entry.text}</span>
    </div>
  )
}
