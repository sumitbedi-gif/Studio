# Whatfix Studio — First Draft (document-to-flows)

register: product

## Product Purpose

Studio is Whatfix's in-app authoring surface. It lives in a 383px side panel
docked over the customer's own application, so every pixel competes with the
host app behind it.

**First Draft** is the AI agent inside Studio. A user uploads SOPs, policies,
or handbooks; the agent reads them, finds the step-by-step processes inside,
and drafts each one as a Whatfix Flow (an in-app guided walkthrough) ready for
review.

This branch (`feat/document-to-flows-q3`) covers: the landing/empty state, the
upload + clarifier conversation, the analysis pass, the proposed-flows plan,
the conversational build, the flow review view, plus two announcement sheets
(first-run intro, build-in-progress guard).

## Users

Enterprise content authors and admins — L&D teams, ops leads, IT trainers at
large companies (Salesforce, ServiceNow, SAP customers). They are not
designers or developers. They write documentation for a living and are
measured on adoption of the tools they document.

They are busy, interrupted often, and skeptical of AI output. They need to
verify what the agent produced, not admire it. A build of ten flows must be
scannable in seconds, not read like a transcript.

## Brand

- **Whatfix orange** `#C74900` — brand moments only (primary CTAs on the host
  app surface, logo, active nav). Never a semantic state.
- **Primary blue** `#0975D7` — the agent's color. Links, focus, active tabs,
  the AI surfaces. This is what First Draft "wears".
- **Cream/warm neutrals** — the panel canvas. Cool grey-blue text neutrals
  (`#1F1F32` primary, `#6B697B` tertiary, `#8C899F` muted).
- Green `#22C55E` for done states, amber `#D89A16` for caution/interrupt.

## Tone

Plain, direct, colleague-not-butler. The agent explains what it did and why in
one sentence, never two. No exclamation marks, no "Great question!", no
personality performance. When it interrupts to ask something, it says why it
is asking.

## Anti-references

- **Chat transcripts.** The failure mode we keep fighting: N artifacts
  producing N × 5 blocks of prose. Artifacts must be scannable objects, not
  narrated events.
- **Left accent spines** on cards. Reads as AI-generated decoration.
- **Sparkle-icon-on-gradient** as the universal "AI feature" visual.
- **Nested cards.** A card inside a card inside a bubble.
- Dense SaaS dashboards. This is a narrow panel, not a control room.

## Strategic principles

1. **Constant chat, variable output.** 3 flows or 20, the thread should grow
   by a predictable, scannable amount. Repeated structure renders as a list,
   never as prose.
2. **The artifact is the unit of attention.** Cards are what the user came
   for. Chrome around them stays quiet.
3. **Show the work, collapsed.** Reasoning must be recoverable (expandable)
   but never the default state.
4. **Verification over admiration.** Every generated flow needs a one-click
   path to "is this right?"
5. **The panel is 383px.** Horizontal space is the scarcest resource; never
   spend it on decoration.
