# Authoring Agent — Prototype Spec

**For:** Claude Code (CLAUDE.md handoff)
**Output:** Extension to the existing Studio prototype. Single self-contained HTML artifact.
**Framework:** HTML + JS (prototype pattern); Prompt Kit components assumed available (`PromptInput`, `Message`, `MessageContent`, `PromptSuggestion`, etc.)
**Behaviour:** Fully mocked — no real API calls, only timed animations. All copy below is the real copy to render.

---

## 1. Entry point

Existing Studio prototype has a vertical icon rail on the right edge. Add **one new icon** at the top of that rail:

- **Icon:** sparkle / AI glyph (Lucide `Sparkles` or equivalent)
- **Label on hover:** "Authoring Agent"
- **State:** selected by default when spec is loaded (for demo convenience)
- **Click behaviour:** swaps the Studio side panel content for the Authoring Agent surface. Same panel width, same header frame, same close behaviour. Not a modal. Not a new page.

Everything else in the existing prototype (ACME Corp dashboard on the left, other rail icons, Studio header) stays exactly as it is.

---

## 2. Surface states

The agent surface has **four states**. One is visible at a time. Transitions are animated.

| State | Trigger |
|---|---|
| `IDLE` | Panel just opened, no conversation yet |
| `PLANNING` | User hit Send; agent is "thinking" |
| `PLAN_READY` | Plan cards rendered, awaiting user action |
| `CREATING` | User hit Create; agent is generating experiences |

---

## 3. State 1 — IDLE (empty state)

### Layout (top → bottom)

**Header (inside the panel, below the Studio frame)**
- Small eyebrow text: `AUTHORING AGENT`
- Big heading: `What do you want to build today?`
- Subtext, one line: `Drop in a file, connect a source, or just describe what you need.`

**Centered PromptInput** (Prompt Kit `PromptInput`)
- Placeholder: `Ask, describe, or paste a source…`
- Left-side action: **`+` button** (file upload trigger — see §5)
- Left-side indicator: typing `/` anywhere in the input opens the connector picker (see §6)
- Right-side action: **Send button** (paper-plane icon, disabled until input has text or an attachment)

**Suggestion chips** (Prompt Kit `PromptSuggestion`, rendered in a row below the input)

Four chips, exact copy:

1. `📄 Analyze this release note and propose guidance`
2. `🎫 Find recurring issues in my support tickets`
3. `📘 Turn this SOP into a journey`
4. `🔁 What content is going stale?`

Clicking a chip populates the PromptInput with the chip text (so the user can see it land) but does **not** auto-send. The user still hits Send.

---

## 4. The dummy happy path

The demo runs one canned interaction. Wire it so any Send action from IDLE triggers this same flow, regardless of what was typed.

**What the user "does" (mock this):**

1. Clicks the `+` button → file picker opens → selects `nCino_Q1_Release_Notes.pdf` → file appears as an attachment chip above the input
2. Types `/` → connector menu opens → clicks **ServiceNow** → a ServiceNow reference chip appears next to the file
3. Types this prompt: `Analyze the release notes and the last 4 weeks of ServiceNow tickets tagged EZ-Mod. Tell me what guidance we should build.`
4. Hits Send

---

## 5. File upload (`+` button)

Clicking `+` opens a native file picker. The picker is real (for feel), but no actual file read happens. Regardless of what the user selects, render this attachment chip:

- Icon: PDF icon
- Name: `nCino_Q1_Release_Notes.pdf`
- Size: `1.2 MB`
- `×` to remove

The chip sits **above** the PromptInput, left-aligned, with a small "Attached:" label.

Support showing multiple chips in a row if the user adds more (for the demo, one is enough).

---

## 6. Connector picker (`/` trigger)

Typing `/` inside the PromptInput opens a dropdown above the input. Prompt Kit's command palette pattern works well here.

**Dropdown header:** `Reference a connector`

**Six connector rows**, each with a small logo, name, and short descriptor:

| Logo | Name | Descriptor |
|---|---|---|
| ServiceNow green diamond | **ServiceNow** | Tickets, knowledge base |
| Zendesk green dot | **Zendesk** | Support tickets |
| Jira blue | **Jira** | Issues, sprints |
| Confluence blue | **Confluence** | Docs, pages |
| SharePoint blue | **SharePoint** | Files, sites |
| Google Drive multicolor | **Google Drive** | Docs, sheets, slides |

Use brand-accurate colors. If official logos aren't available in the sandbox, use a colored rounded square with the first letter.

**On click:** the dropdown closes, a connector reference chip appears in the same row as the file attachment chip:
- Small logo + name (e.g., `🟢 ServiceNow`)
- `×` to remove

Typing more `/` after one is already referenced allows adding more.

---

## 7. State 2 — PLANNING (thinking)

Triggered by Send. Animate the transition:

- The PromptInput **moves from center to the bottom** of the panel (anchored there for the rest of the conversation)
- The user's message appears at the **top** of the conversation area, rendered as a Prompt Kit `Message` with `role="user"`:
  - The attachment chips (file + ServiceNow) render inside the message
  - The typed text below them
- Below the user message, the agent's "thinking" state appears as a `Message` with `role="assistant"`

**Assistant thinking message — staged reveal** (each line appears 600–900ms after the previous):

```
🔍  Reading nCino_Q1_Release_Notes.pdf…
🔍  Pulling ServiceNow tickets (last 28 days, tag: EZ-Mod)…
🧠  Identifying intents…
✏️  Proposing a journey…
```

Use a subtle shimmer/pulse on the active line. Previous lines fade to a "done" state with a check mark.

Total duration: ~4 seconds before advancing to `PLAN_READY`.

---

## 8. State 3 — PLAN_READY (the plan cards)

Once planning completes, the thinking message collapses into a one-line summary:

> `✓ Analyzed 1 document and 47 ServiceNow tickets. Identified 1 intent.`

Below that, render the **plan block** — the core artifact.

### Plan block header

- Title: `Proposed journey: EZ-Mod rollout for commercial lending users`
- Subtitle: `4 experiences across 2 screens · ~12 min to build`
- Right-aligned pill: confidence badge `High confidence`

### Plan cards

Four stacked cards. Each card has:
- Left rail color indicator (different per content type)
- Type badge at top-left (e.g., `POP-UP`, `FLOW`, `SMART TIP`, `ARTICLE`)
- Card title
- One-line placement description
- Small chevron (`>`) on the right to expand rationale
- A checkbox on the left (checked by default) — lets user deselect before Create

**Card 1 — POP-UP**
- **Title:** Introduce EZ-Mod to commercial lenders
- **Placement:** First visit to the Loans dashboard after Apr 28
- **Audience:** Commercial Loan Relationship Managers
- **Rationale (expanded):** Release notes describe EZ-Mod as a new top-level capability for existing loan modifications. 12 tickets in the last 4 weeks asked "where do I change loan terms without re-origination?" — a Pop-up on first visit sets the mental model and links to the Flow. Chosen over a Beacon because the feature is high-impact and deserves explicit introduction, not just a hint.

**Card 2 — FLOW**
- **Title:** Modify an existing loan with EZ-Mod
- **Placement:** Loan detail page → "Modify Terms" button
- **Steps:** 7
- **Audience:** Commercial Loan Relationship Managers, Loan Assistants
- **Rationale (expanded):** This is the primary procedural path the release unlocks. 18 of the 47 tickets were step-by-step confusion about the new modal's flow. A Flow (not a set of Smart Tips) is the right shape because users asked for navigational hand-holding, not field-level clarification. Branching on loan type (Secured vs Unsecured) proposed at step 4 — see visibility rule.

**Card 3 — SMART TIP**
- **Title:** Explain the "Effective Date" field
- **Placement:** EZ-Mod modal → "Effective Date" input
- **Audience:** All users on the modal
- **Rationale (expanded):** 9 tickets specifically asked whether Effective Date is the modification signing date or the interest accrual date. This is a field-level clarification — a Smart Tip sits next to the input and resolves the question in context, without interrupting flow.

**Card 4 — ARTICLE**
- **Title:** EZ-Mod vs full re-origination: when to use each
- **Placement:** Self-Help search result for "modify loan", "change terms", "EZ-Mod"
- **Audience:** All commercial lending users
- **Rationale (expanded):** 8 tickets were policy questions, not procedural — "am I allowed to use EZ-Mod for this?" An Article in Self-Help answers the policy question without cluttering in-app guidance. Links to the Flow for users who decide EZ-Mod is the right path.

### Plan-level CTAs (bottom of the plan block)

Two buttons, right-aligned:

- **`Edit`** (secondary) — lets the user deselect cards via checkboxes, remove cards via the `×` icon that appears on hover, and add a note. When clicked, the buttons flip to:
  - Helper text on the left: `Uncheck to exclude, × to remove, or refine:`
  - A small input: `Refine the plan in your own words…`
  - **`Update plan`** (primary) — triggers a brief re-planning animation (~1.5s) and refreshes the card list
  - **`Cancel`** (secondary) — returns to the default PLAN_READY view
- **`Create`** (primary) — advances to `CREATING` state

---

## 9. State 4 — CREATING (building animation)

Clicking Create:

1. The plan block header updates to: `Creating 4 experiences…`
2. Each card gains a **status strip** at the bottom:
   - Starts as `⏳ Queued`
   - Progresses to `🔨 Building…` (with an animated shimmer on the strip)
   - Completes to `✓ Created` + a CTA: **`View in Studio →`**
3. Cards complete **sequentially**, not all at once — staggered 1.2s apart, each takes ~2s to build. Total: ~10 seconds.
4. Once all four complete, the plan block header updates to:

> `✓ All 4 experiences created in Draft. Review and publish from Studio.`

And a summary strip appears below the plan block:

> `Created: 1 Pop-up, 1 Flow, 1 Smart Tip, 1 Article. Grouped as journey "EZ-Mod rollout for commercial lending users". Nothing is live yet.`

The PromptInput at the bottom becomes active again for follow-up. Placeholder changes to: `Ask a follow-up or start a new request…`

---

## 10. Visual/interaction notes

- **Typography:** inherit the existing Studio prototype's type stack. Don't restyle globally.
- **Color:** neutral panel background; use Whatfix brand accent only for primary CTAs and the AI icon on the rail.
- **Content-type color coding** (use consistent accents on card left rails, badges, and type icons):
  - Pop-up → violet
  - Flow → blue
  - Smart Tip → amber
  - Article → slate
  - Beacon (for future) → pink
  - Launcher (for future) → teal
- **Animations:** subtle. Fade + slight upward translate (8–12px) for message appearances. Shimmer (CSS keyframes, ~1.5s cycle) for active "building" state.
- **Spacing:** plan cards should feel scannable, not cramped — 16px between cards, 20px internal padding.
- **Rationale expand:** smooth height transition (~200ms). One card expanded at a time is fine; or allow multiple — builder's call.

---

## 11. Scope boundaries (do NOT build)

- No actual file parsing, no actual LLM calls, no actual API calls of any kind
- No real Studio content creation — `View in Studio →` can be a no-op or link to `#`
- No user authentication, no account switching
- No mobile layout — desktop only, assume ≥1280px viewport
- No persistence — refresh resets to IDLE
- No plan history, no sidebar of past conversations (out of scope for this demo)
- Do not touch the left side of the existing prototype (dashboard, nav, user menu)

---

## 12. Acceptance — the demo runs end-to-end

A reviewer should be able to:

1. Open the prototype
2. Click the new AI icon on the right rail → panel opens to IDLE state
3. Click a suggestion chip → prompt populates
4. Click `+` → file picker → any file selected → `nCino_Q1_Release_Notes.pdf` chip appears
5. Type `/` in the input → connector menu opens → click ServiceNow → chip appears
6. Type the dummy prompt (or leave the populated chip text) → hit Send
7. Watch the thinking animation (~4s)
8. See the plan render with 4 cards
9. Expand a card → read rationale
10. Optional: click Edit → uncheck one card → Update plan (brief animation, the unchecked card disappears)
11. Click Create → watch the 4 cards build sequentially (~10s total)
12. See the final "All 4 experiences created in Draft" state

No console errors. Smooth transitions. Feels like a product, not a storyboard.
