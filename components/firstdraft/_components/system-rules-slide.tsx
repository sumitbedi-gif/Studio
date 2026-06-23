"use client"

import { useRef, useState } from "react"
import { FileText, FileType2, FileSpreadsheet, Paperclip, X, UploadCloud } from "lucide-react"

interface Props {
  titleId: string
  /** Free-form custom instructions, split into lines for the wire shape. */
  rules: string[]
  onChange: (rules: string[]) => void
  contextFiles: ContextFile[]
  onChangeFiles: (files: ContextFile[]) => void
}

export type ContextFile = {
  id: string
  name: string
  size: number
  kind: "pdf" | "doc" | "sheet" | "other"
}

/**
 * Demo dummy files inserted when the author clicks the dropzone. Two distinct
 * types so the file rows render with different icons + sizes — convinces the
 * audience that real ingestion is wired even though no upload happens.
 */
const DUMMY_FILES: ContextFile[] = [
  { id: "f-goals",  name: "Business-goals-FY26.pdf",     size: 184_000, kind: "pdf" },
  { id: "f-voice",  name: "Brand-voice-guidelines.docx", size:  92_000, kind: "doc" },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function FileTypeGlyph({ kind }: { kind: ContextFile["kind"] }) {
  const common = { size: 15, strokeWidth: 1.7 } as const
  if (kind === "pdf")   return <FileText {...common} color="#C74900" />
  if (kind === "doc")   return <FileType2 {...common} color="#0975D7" />
  if (kind === "sheet") return <FileSpreadsheet {...common} color="#15803D" />
  return <Paperclip {...common} color="#6B697B" />
}

/**
 * Step 2 of onboarding: free-form custom instructions plus a context-file
 * uploader. Replaces the previous structured "writing rules" list. Mirrors
 * the Claude Projects context surface — one big writing prompt + reference
 * files the agent should read before drafting.
 *
 * Wire shape stays compatible: instructions text serializes to lines so the
 * existing `rules: string[]` consumer downstream needs no changes.
 *
 * NB: filename kept for diff continuity; the export name still matches what
 * onboarding-modal.tsx already imports.
 */
export function SystemRulesSlide({
  titleId,
  rules,
  onChange,
  contextFiles,
  onChangeFiles,
}: Props) {
  // Hydrate the textarea from the persisted lines (re-entry case).
  const [text, setText] = useState<string>(() => rules.join("\n"))
  const dropRef = useRef<HTMLButtonElement | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleTextChange = (val: string) => {
    setText(val)
    // Split into lines, trim blank ones — the downstream shape is still
    // string[] so the rest of the app keeps working unchanged.
    const lines = val
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
    onChange(lines)
  }

  const addDummyFiles = () => {
    const taken = new Set(contextFiles.map((f) => f.id))
    const next = DUMMY_FILES.filter((f) => !taken.has(f.id))
    if (next.length === 0) return
    // Insert one per click so a second click adds the second file. Order is
    // preserved from the DUMMY_FILES list.
    onChangeFiles([...contextFiles, next[0]])
  }

  const removeFile = (id: string) => {
    onChangeFiles(contextFiles.filter((f) => f.id !== id))
  }

  return (
    <div className="wfc-slide">
      <div>
        <h2 id={titleId} className="wfc-slide-title">What should I know?</h2>
        <p className="wfc-slide-sub" style={{ marginTop: 6 }}>
          Add custom instructions and reference docs. I&apos;ll use them every time I draft.
        </p>
      </div>

      {/* Instructions: free-form prompt-as-textarea */}
      <label className="wfc-context-field">
        <span className="wfc-context-field-label">Custom instructions</span>
        <textarea
          className="wfc-context-textarea"
          rows={5}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={
            "How should I sound, what should I always include, what should I avoid?\n\n" +
            "e.g. Use active voice. Keep step titles under 8 words. Avoid jargon. " +
            "Our brand voice is confident, not corporate."
          }
        />
        <span className="wfc-context-field-hint">
          One thought per line. I follow these on every draft.
        </span>
      </label>

      {/* Context files: dropzone + file rows */}
      <div className="wfc-context-files">
        <div className="wfc-context-files-head">
          <span className="wfc-context-field-label">Context files</span>
          <span className="wfc-context-files-count">
            {contextFiles.length === 0
              ? "Optional"
              : `${contextFiles.length} attached`}
          </span>
        </div>

        <button
          ref={dropRef}
          type="button"
          className={`wfc-context-dropzone ${dragOver ? "is-dragover" : ""}`}
          onClick={addDummyFiles}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            addDummyFiles()
          }}
        >
          <UploadCloud size={18} strokeWidth={1.7} className="wfc-context-dropzone-icon" />
          <span className="wfc-context-dropzone-text">
            <span className="wfc-context-dropzone-primary">Drop files here, or browse</span>
            <span className="wfc-context-dropzone-secondary">
              Business goals, brand guides, product specs. PDF, DOCX, Markdown.
            </span>
          </span>
        </button>

        {contextFiles.length > 0 && (
          <ul className="wfc-context-file-list">
            {contextFiles.map((f) => (
              <li key={f.id} className="wfc-context-file-row">
                <span className="wfc-context-file-glyph" aria-hidden="true">
                  <FileTypeGlyph kind={f.kind} />
                </span>
                <span className="wfc-context-file-name">{f.name}</span>
                <span className="wfc-context-file-size">{formatSize(f.size)}</span>
                <button
                  type="button"
                  className="wfc-context-file-remove"
                  onClick={() => removeFile(f.id)}
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
