# Fluid Visibility Rules — Prototype Spec

## Purpose

This is a **clickable demo prototype** that showcases a redesigned visibility rules experience for Whatfix popups. The prototype is intended for internal demos and stakeholder presentations. It is **not production code** — all data is hardcoded, no API calls, no backend.

The prototype builds on top of an **existing vibe-coded Studio shell** that already has the initial landing screen (content type selection: Flow, Pop-up, etc.). The journey described in this spec **begins when the user clicks "Pop-up"** from that landing screen.

---

## Tech Stack

- React 18 + Vite + Tailwind CSS
- Single-page app, no routing library needed (use state-based view switching)
- No external API calls — everything is local state and hardcoded data
- Animations: Tailwind `transition` utilities + CSS keyframes for shimmer/loading

---

## Design Tokens (match existing Studio shell)

```
Primary brand:       #D4572A (Whatfix orange)
Primary dark:        #B7461F
Panel background:    #FFFFFF
Surface/secondary:   #F7F7F5
Border:              #E5E5E3
Text primary:        #1A1A1A
Text secondary:      #6B6B6B
Text tertiary:       #9B9B9B
AI accent:           #7C5CFC (purple, for sparkle/AI badge)
AI accent bg:        #F3F0FF
Success:             #16A34A
Info blue:           #2563EB
Info blue bg:        #EFF6FF
Focus ring:          #D4572A33
Border radius sm:    6px
Border radius md:    8px
Border radius lg:    12px
Font family:         'Inter', system-ui, sans-serif
```

---

## Screen Flow Overview

```
[Existing Studio Shell]
        │
        ▼ clicks "Pop-up"
[Screen 1] Template Selection
        │
        ▼ clicks a template card
[Screen 2] Popup Editor (Configurations tab)
        │  - Popup appears as overlay on the fake application page
        │  - Right panel shows Configurations / Visibility Rules tabs
        │
        ▼ clicks "Visibility Rules" tab
[Screen 3] Visibility Rules — AI Summary
        │  - Shows loading shimmer (1.5s)
        │  - Then reveals the AI summary card with pre-filled rules
        │  - "Customize" button and "Set it manually" link
        │
        ▼ clicks "Customize"
[Screen 4] Bottom Sheet — Prompt Input + Fluid UI
           - Prompt input with suggestion chips
           - On submit, AI interprets → renders Fluid UI form
           - On confirm, summary card updates
```

---

## Screen 1: Template Selection

### Layout
- Full panel width (same as current Studio panel area)
- Header: "Creating Popup" with back arrow, minimize, close icons
- Subheader: "Select Template" on left, "Theme" dropdown (decorative) on right
- Grid: 2 columns, 3 rows = 6 template cards visible

### Template Cards (hardcoded, 6 total)

Each card is a light gray rounded container (`#F7F7F5` background, `border: 1px solid #E5E5E3`, `border-radius: 12px`) showing a miniature popup preview inside.

| # | Template Name | Type | Preview Description |
|---|---------------|------|---------------------|
| 1 | Welcome to the team | Modal, Media+Text | Whatfix logo, heading, body text, orange "Alright" CTA |
| 2 | Say hello to new features! | Modal, Media+Text | Whatfix logo, heading, body text, orange "Alright!" CTA |
| 3 | Quick update | Snackbar, Only Text | Thin bar at bottom-left, text + "Okay" pill button |
| 4 | Let's get you familiar with the app | Modal, Media+Text | Whatfix logo, heading, body text, "Skip" + "Alright!" CTAs |
| 5 | Privacy policy has been updated | Modal, Only Text | No image, heading, body text, "Okay" + "Cancel" CTAs |
| 6 | Important notification | Modal, Only Text | Left-aligned heading, body text, "Okay" + "Cancel" CTAs |

### Interaction
- Hovering a card shows a subtle border highlight (`border-color: #D4572A40`)
- Clicking a card transitions to Screen 2 with a 200ms ease-out animation (panel content fades, new content fades in)

---

## Screen 2: Popup Editor (Configurations Tab)

### Layout — Two Zones

**Left zone: Fake Application Page (~65% width)**
- Renders a simple fake web application (e.g., a dashboard with a sidebar, top nav, some cards/tables)
- The selected popup template renders as an **overlay on this fake app**, centered, with a semi-transparent backdrop (`rgba(0,0,0,0.3)`)
- The popup is a static visual — not editable on the canvas (editing happens in the right panel)
- The fake app should include a **"Login" button** in the top nav area — this will be used later for the element picker demo

**Right zone: Configuration Panel (~35% width, max 380px)**
- Header: "Creating Popup" with back arrow, minimize, close icons
- Popup name input field (placeholder: "Enter Popup name")
- Two tabs: **CONFIGURATIONS** (active, orange underline) | **VISIBILITY RULES**
- Below tabs: accordion sections matching current Studio UI

### Configuration Accordions (all decorative/non-functional)

1. **Appearance** (expanded by default)
   - Background: Color | Image toggle (Color selected)
   - Color picker (shows white swatch)
   - Padding: "Uniform" toggle ON, slider at 20px
   - Border Radius: "Uniform" toggle ON, slider at 20px

2. **Position** (collapsed)
   - When expanded: 3×3 position grid, center selected (blue fill)

3. **Control** (collapsed)
   - When expanded: "Show close (X) button" toggle ON, "Don't show me again" toggle OFF

### Footer
- Left: "Discard" link (orange text)
- Right: "Save Pop-up" button (orange filled, `#D4572A`, white text, rounded)

### Interaction
- Clicking accordion headers toggles expand/collapse
- Clicking the **"VISIBILITY RULES"** tab transitions to Screen 3

---

## Screen 3: Visibility Rules — AI Summary Card

This is the **core new experience**. When the user clicks the "Visibility Rules" tab, they see a loading state followed by an AI-generated summary card.

### Loading State (1.5 seconds)

Inside the panel body, show a card-shaped container with:
- A shimmer animation (light gray bars pulsing left-to-right, like skeleton loading)
- Small text below the shimmer: "Generating recommended rules..." in `#9B9B9B`, 12px, with a subtle pulsing dot animation

### AI Summary Card (appears after loading)

A single card component:

```
┌─────────────────────────────────────┐
│ ✦ Recommended                       │
│                                     │
│ This popup will appear on           │
│ [current page URL] from             │
│ [May 1, 2026] to [May 31, 2026],   │
│ up to [4 times] per user, for       │
│ [All users].                        │
│                                     │
│          [ Customize ]              │
│                                     │
└─────────────────────────────────────┘
         Set it manually
```

#### Card Design Specs

- Container: `background: #FFFFFF`, `border: 1px solid #E5E5E3`, `border-radius: 12px`, `padding: 16px`
- Top-left badge: `✦ Recommended` — sparkle icon (✦ character or small SVG star) + text, `background: #F3F0FF`, `color: #7C5CFC`, `font-size: 11px`, `font-weight: 600`, `padding: 3px 10px`, `border-radius: 6px`
- Summary text: `font-size: 13px`, `line-height: 1.6`, `color: #1A1A1A`
- Inline highlights: The dynamic values (URL, dates, occurrence count, user group) should be styled as inline pills: `background: #EFF6FF`, `color: #2563EB`, `padding: 1px 6px`, `border-radius: 4px`, `font-size: 12px`, `font-weight: 500`
- The URL pill should show a **truncated URL** by default (e.g., `app.acme.com/dash...`) and on hover, show a tooltip with the full URL: `https://app.acme.com/dashboard/home`

#### Hardcoded Summary Values

| Field | Display Value | Tooltip/Full Value |
|-------|---------------|-------------------|
| URL | `app.acme.com/dash...` | `https://app.acme.com/dashboard/home` |
| Start date | `May 1, 2026` | — |
| End date | `May 31, 2026` | — |
| Occurrences | `4 times` | — |
| User group | `All users` | — |

#### Customize Button

- Centered below the summary text
- Style: `background: #1A1A1A`, `color: #FFFFFF`, `padding: 8px 24px`, `border-radius: 8px`, `font-size: 13px`, `font-weight: 500`
- On hover: `background: #333333`
- On click: opens the bottom sheet (Screen 4)

#### "Set it manually" Link

- Below the card, centered
- Style: `color: #9B9B9B`, `font-size: 12px`, `text-decoration: underline`
- On click: transitions the panel content to the current accordion-based VR UI (Where / When / Who accordions as shown in the uploaded screenshots). This is a fallback — for the demo, it can simply show the three collapsed accordions as a static view.

---

## Screen 4: Bottom Sheet — Prompt Input + Fluid UI

When the user clicks "Customize", a bottom sheet slides up from the bottom of the right panel.

### Bottom Sheet Container

- Slides up with a 250ms ease-out animation
- Takes up roughly the bottom 60% of the panel height
- Top: a small **drag handle** (32px wide, 4px tall, rounded, `#D3D3D3`) centered at the top
- Background: `#FFFFFF`
- Border-top: `1px solid #E5E5E3`
- Border-radius: `12px 12px 0 0` (top corners rounded)
- The AI summary card remains visible above the sheet (the sheet overlays from the bottom, not full-screen)

### Prompt Input Area

At the top of the sheet:

```
┌──────────────────────────────────────┐
│  ✦  What would you like to change?   │
│                                      │
│  ┌──────────────────────────┐ [Send] │
│  │ Type your changes...     │        │
│  └──────────────────────────┘        │
│                                      │
│  [Change date range]  [Add audience] │
│  [Show on specific page]             │
│  [Limit occurrences]                 │
└──────────────────────────────────────┘
```

#### Specs

- Sheet header: `✦ What would you like to change?` — sparkle icon + text, `font-size: 14px`, `font-weight: 500`, `color: #1A1A1A`, `margin-bottom: 12px`
- Input field: single-line text input, `border: 1px solid #E5E5E3`, `border-radius: 8px`, `padding: 8px 12px`, `font-size: 13px`, placeholder text: "Type your changes..."
- Send button: a small circular or square button next to the input, `background: #1A1A1A`, `color: #FFFFFF`, contains a send/arrow-up icon, `width: 32px`, `height: 32px`, `border-radius: 8px`
- Suggestion chips: below the input, horizontal wrap layout, each chip is `background: #F7F7F5`, `border: 1px solid #E5E5E3`, `border-radius: 20px`, `padding: 6px 14px`, `font-size: 12px`, `color: #6B6B6B`, `cursor: pointer`
- Clicking a chip auto-fills the input with a corresponding pre-written prompt

#### Chip → Prompt Mapping

| Chip Label | Auto-fills Input With |
|------------|----------------------|
| Change date range | "Change the date range to June 1 through June 15" |
| Add audience | "Show this only to Sales team users" |
| Show on specific page | "Show this only when the user clicks the Login button" |
| Limit occurrences | "Stop showing after 2 occurrences" |

---

## Fluid UI: How Prompts Generate Inline Forms

After the user types (or chip-fills) a prompt and hits Send, the system "processes" it (show a brief 800ms loading spinner in the sheet area), then renders a **Fluid UI form** directly inside the bottom sheet, below the prompt input. The prompt input remains visible and editable above.

There is no chat history. Each submit replaces the previous Fluid UI. The Fluid UI is scoped to exactly what the prompt asked for — nothing more.

### Fluid UI Scenario 1: Date Range Change

**Trigger prompt:** "Change the date range to June 1 through June 15" (or any date-related prompt)

**Fluid UI rendered:**

```
┌──────────────────────────────────────┐
│  📅 Date range                       │
│                                      │
│  Start date                          │
│  ┌────────────────────────┐          │
│  │  June 1, 2026       📅│          │
│  └────────────────────────┘          │
│                                      │
│  End date                            │
│  ┌────────────────────────┐          │
│  │  June 15, 2026      📅│          │
│  └────────────────────────┘          │
│                                      │
│     [ Cancel ]    [ Apply ]          │
└──────────────────────────────────────┘
```

- Section header: "Date range" with a calendar icon, `font-size: 13px`, `font-weight: 500`
- Two date input fields, pre-filled with the dates extracted from the prompt
- Date inputs: `border: 1px solid #E5E5E3`, `border-radius: 8px`, `padding: 8px 12px`, calendar icon on the right
- The date fields are editable (use native `<input type="date">` or a styled date picker)
- Cancel button: `background: transparent`, `border: 1px solid #E5E5E3`, `color: #6B6B6B`
- Apply button: `background: #1A1A1A`, `color: #FFFFFF`, `border-radius: 8px`

**On Apply:**
- Bottom sheet collapses (250ms slide-down)
- Summary card updates: the date portion now reads `June 1, 2026` to `June 15, 2026` instead of the original May dates
- A brief green flash/highlight on the changed portion of the summary text (200ms)

---

### Fluid UI Scenario 2: Element Picker (Click-Based Trigger)

**Trigger prompt:** "Show this only when the user clicks the Login button" (or any element/click-related prompt)

**Fluid UI rendered:**

```
┌──────────────────────────────────────┐
│  🎯 Select an element                │
│                                      │
│  Click on an element on the page     │
│  to set it as the trigger.           │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ● Waiting for selection...  │    │
│  └──────────────────────────────┘    │
│                                      │
│     [ Cancel ]                       │
└──────────────────────────────────────┘
```

- Section header: "Select an element" with a crosshair/target icon
- Instructional text: "Click on an element on the page to set it as the trigger." — `font-size: 12px`, `color: #6B6B6B`
- Status indicator: a pulsing dot (orange) + "Waiting for selection..." text

**Simultaneous behavior on the fake app page (left zone):**
- The page enters **element picker mode**: the cursor changes to crosshair
- As the user hovers over interactive elements on the fake app (buttons, links, nav items), a **red dashed border** (`2px dashed #EF4444`) appears around the hovered element with a small floating label showing the element type (e.g., "Button: Login")
- Specifically, hovering over the **"Login" button** in the top nav shows the red border + label

**On click (selecting "Login" button):**
- The red border becomes solid (`2px solid #EF4444`) briefly, then transitions to green (`2px solid #16A34A`) with a checkmark flash
- The Fluid UI in the bottom sheet updates:

```
┌──────────────────────────────────────┐
│  🎯 Element selected                 │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ✓ Button: "Login"           │    │
│  │    #top-nav > .btn-login     │    │
│  └──────────────────────────────┘    │
│                                      │
│     [ Cancel ]    [ Apply ]          │
└──────────────────────────────────────┘
```

- The status card now shows: green checkmark, element name ("Button: Login"), and a fake CSS selector (`#top-nav > .btn-login`) in monospace, `color: #9B9B9B`, `font-size: 11px`

**On Apply:**
- Bottom sheet collapses
- Summary card updates: now includes an additional line, e.g., "...when the user clicks `Login button`" — the element name appears as an inline pill

---

### Fluid UI Scenario 3: Compound Prompt (Date + Element)

**Trigger prompt:** "Show this popup only between June 1 and June 15, and only when the user clicks Login"

This demonstrates the system handling **multiple intents in a single prompt**. The Fluid UI renders a **multi-step progress experience** — similar to how Claude asks sequential questions.

**Fluid UI rendered — Step 1 of 2:**

```
┌──────────────────────────────────────┐
│  Processing 2 changes                │
│  ━━━━━━━━━━━━━░░░░░░░░  Step 1 of 2 │
│                                      │
│  📅 Date range                       │
│                                      │
│  Start date                          │
│  ┌────────────────────────┐          │
│  │  June 1, 2026       📅│          │
│  └────────────────────────┘          │
│                                      │
│  End date                            │
│  ┌────────────────────────┐          │
│  │  June 15, 2026      📅│          │
│  └────────────────────────┘          │
│                                      │
│              [ Next → ]              │
└──────────────────────────────────────┘
```

- Progress bar: a segmented bar at the top, `background: #E5E5E3`, filled portion `background: #7C5CFC` (AI purple)
- Step indicator: "Step 1 of 2" in `color: #9B9B9B`, `font-size: 11px`
- The date fields are pre-filled from the prompt
- "Next →" button advances to Step 2

**Fluid UI rendered — Step 2 of 2:**

```
┌──────────────────────────────────────┐
│  Processing 2 changes                │
│  ━━━━━━━━━━━━━━━━━━━━━━  Step 2 of 2 │
│                                      │
│  🎯 Select an element                │
│                                      │
│  Click on an element on the page     │
│  to set it as the trigger.           │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ● Waiting for selection...  │    │
│  └──────────────────────────────┘    │
│                                      │
│   [ ← Back ]         [ Apply all ]   │
└──────────────────────────────────────┘
```

- Progress bar fully filled
- Element picker mode activates on the fake app
- After selecting an element, "Apply all" becomes enabled

**On "Apply all":**
- Bottom sheet collapses
- Summary card updates with **both** changes: new dates AND the element trigger
- Updated summary reads something like: "This popup will appear on `app.acme.com/dash...` from `June 1, 2026` to `June 15, 2026`, when the user clicks `Login button`, up to `4 times` per user, for `All users`."

---

### Fluid UI Scenario 4: User Action / Audience Targeting

**Trigger prompt:** "Show this only to Sales team users" (or any audience/cohort prompt)

**Fluid UI rendered:**

```
┌──────────────────────────────────────┐
│  👥 Target audience                  │
│                                      │
│  User group                          │
│  ┌────────────────────────┐          │
│  │  Sales team          ▾│          │
│  └────────────────────────┘          │
│                                      │
│  Available groups:                   │
│  ○ All users                         │
│  ● Sales team                        │
│  ○ Engineering                       │
│  ○ Customer Success                  │
│  ○ Marketing                         │
│  ○ Executives                        │
│                                      │
│     [ Cancel ]    [ Apply ]          │
└──────────────────────────────────────┘
```

- Section header: "Target audience" with a people icon
- A dropdown/select pre-filled with the group mentioned in the prompt ("Sales team")
- Below: a radio list of dummy user groups, with "Sales team" pre-selected
- These are all hardcoded dummy values

**On Apply:**
- Summary card updates: "All users" changes to "Sales team" in the summary text

---

## Summary Card Update Animation

Every time an "Apply" action updates the summary card:

1. The bottom sheet slides down (250ms ease-out)
2. The summary card text performs a brief **crossfade** — old text fades out (100ms), new text fades in (200ms)
3. The specific changed pill(s) in the summary get a brief **pulse highlight**: a light green background flash (`#DCFCE7`) that fades to the normal blue pill background over 600ms
4. A small toast-like text appears below the card for 2 seconds: "✓ Rule updated" in `color: #16A34A`, `font-size: 11px`

---

## Fake Application Page (Left Zone)

The fake app serves as the backdrop for the popup overlay and the element picker interaction. It should look like a generic SaaS dashboard.

### Layout

```
┌─────────────────────────────────────────────┐
│  ACME Corp    Dashboard    Reports    Login  │  ← Top nav
├──────────┬──────────────────────────────────┤
│          │                                   │
│ Sidebar  │   Welcome back, Sarah             │
│          │                                   │
│ · Home   │   ┌──────┐  ┌──────┐  ┌──────┐  │
│ · Tasks  │   │ 1,234│  │  89% │  │  $42K│  │  ← Metric cards
│ · Team   │   │Users │  │Compl.│  │ Rev. │  │
│ · Reports│   └──────┘  └──────┘  └──────┘  │
│ · Settings│                                  │
│          │   Recent Activity                 │
│          │   ─────────────────               │
│          │   Row 1  |  Value  |  Status      │
│          │   Row 2  |  Value  |  Status      │
│          │   Row 3  |  Value  |  Status      │
│          │                                   │
└──────────┴──────────────────────────────────┘
```

### Key Interactive Elements (for element picker)

These elements should be detectable in element picker mode:

| Element | Location | Hover Label |
|---------|----------|-------------|
| "Login" button | Top nav, right side | `Button: Login` |
| "Dashboard" nav link | Top nav | `Link: Dashboard` |
| "Reports" nav link | Top nav | `Link: Reports` |
| "Home" sidebar link | Sidebar | `Link: Home` |
| First metric card | Main content | `Card: Users` |

The "Login" button is the **primary demo target** — it should be slightly more prominent (e.g., outlined button style) so the presenter naturally gravitates toward it.

---

## Element Picker Mode — Detailed Behavior

When element picker mode is active:

1. **Cursor**: changes to `crosshair` over the fake app area
2. **Hover effect**: a `2px dashed #EF4444` (red) border appears around the hovered element, with a small floating label above it:
   - Label: element type + name (e.g., "Button: Login")
   - Label style: `background: #1A1A1A`, `color: #FFFFFF`, `font-size: 11px`, `padding: 3px 8px`, `border-radius: 4px`, positioned just above the element, with a tiny triangle pointing down
3. **Click**: the dashed border becomes solid, flashes green (`#16A34A`) for 300ms, then the picker mode deactivates
4. **Escape key**: cancels picker mode, returns to the bottom sheet with "Waiting for selection..." state

---

## Edge Cases & Demo Notes

1. **No real AI processing** — all "AI responses" are hardcoded. The loading states (shimmer, spinner) are timed delays to simulate AI processing.

2. **Prompt matching** — use simple keyword matching to determine which Fluid UI to render:
   - Contains "date" or "June" or "March" or any month name → Date Range UI
   - Contains "click" or "button" or "element" or "login" → Element Picker UI
   - Contains "user" or "team" or "sales" or "audience" or "cohort" → Audience UI
   - Contains multiple categories → Compound (multi-step) UI
   - No match → Show a gentle fallback: "I couldn't understand that. Try one of the suggestions below." and re-show the chips

3. **Summary card is always the source of truth** — it updates cumulatively. If the user changes dates, then changes audience, the card reflects both changes.

4. **"Set it manually" view** — when clicked, replace the AI summary card with the three collapsed accordions from the current VR UI (Where / When / Who). This is static — no need to build functional accordion internals for the demo. Include a "← Back to AI summary" link at the top to return.

5. **Responsive behavior** — the prototype is designed for a **desktop viewport** (1440px+). The right panel is fixed-width (360–380px), the left zone takes the remaining space. No mobile responsiveness needed for the demo.

6. **"Save Pop-up" button** — always present in the footer. Clicking it shows a success toast: "Pop-up saved successfully" and does nothing else.

7. **Re-opening the bottom sheet** — if the user clicks "Customize" again after a previous Apply, the bottom sheet opens fresh (no previous Fluid UI, just the prompt input + chips). The prompt input is empty.

---

## Animation Summary

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Template card click → Editor | Fade transition | 200ms ease-out |
| Visibility Rules tab click → shimmer | Shimmer skeleton | 1500ms |
| Shimmer → Summary card | Fade in | 300ms ease-out |
| "Customize" click → Bottom sheet | Slide up from bottom | 250ms ease-out |
| Prompt submit → loading | Spinner / pulsing dots | 800ms |
| Loading → Fluid UI | Fade in | 200ms ease-out |
| "Apply" → Bottom sheet collapse | Slide down | 250ms ease-out |
| Summary text update | Crossfade (old out, new in) | 100ms + 200ms |
| Changed pill highlight | Green pulse → blue | 600ms |
| "✓ Rule updated" toast | Fade in, hold, fade out | 200ms + 2000ms + 200ms |
| Element hover (picker mode) | Border + label appear | Instant (no animation) |
| Element click (picker mode) | Red → Green border flash | 300ms |

---

## File Structure (Suggested)

```
src/
├── App.jsx                    # Root — state machine for screen switching
├── components/
│   ├── FakeApp.jsx            # The fake SaaS dashboard (left zone)
│   ├── StudioPanel.jsx        # Right panel container with tabs
│   ├── TemplateGrid.jsx       # Screen 1: template selection grid
│   ├── ConfigurationsTab.jsx  # Screen 2: accordion-based config UI
│   ├── VisibilityRulesTab.jsx # Screen 3: AI summary card + manual fallback
│   ├── SummaryCard.jsx        # The AI summary card component
│   ├── BottomSheet.jsx        # Screen 4: sliding bottom sheet container
│   ├── PromptInput.jsx        # Input field + suggestion chips
│   ├── FluidUI/
│   │   ├── DateRangeForm.jsx  # Scenario 1
│   │   ├── ElementPicker.jsx  # Scenario 2
│   │   ├── AudienceForm.jsx   # Scenario 4
│   │   └── CompoundFlow.jsx   # Scenario 3 (multi-step)
│   ├── ElementPickerOverlay.jsx  # Hover borders + labels on fake app
│   └── PopupOverlay.jsx       # The popup template rendered as overlay
├── data/
│   ├── templates.js           # Hardcoded template definitions
│   └── dummyGroups.js         # Dummy user groups for audience form
├── hooks/
│   └── useVisibilityRules.js  # State management for VR rules
└── utils/
    └── promptParser.js        # Simple keyword matcher for prompt → UI type
```

---

## State Shape (useVisibilityRules hook)

```javascript
{
  url: {
    display: "app.acme.com/dash...",
    full: "https://app.acme.com/dashboard/home"
  },
  dateRange: {
    start: "2026-05-01",
    end: "2026-05-31"
  },
  occurrences: 4,
  audience: "All users",
  elementTrigger: null,  // or { name: "Login", selector: "#top-nav > .btn-login" }
}
```

When any field changes, the summary sentence re-renders from this state object.

### Summary Sentence Template

```
This popup will appear on {url}
[if dateRange] from {start} to {end}[/if]
[if elementTrigger], when the user clicks {elementTrigger.name}[/if]
[if occurrences], up to {occurrences} times per user[/if]
, for {audience}.
```

---

## What NOT to Build

- No real AI/LLM calls
- No backend or database
- No authentication
- No actual popup rendering engine
- No drag-and-drop editing of popup content
- No filter functionality on the template grid
- No theme switching
- No mobile responsive layouts
- No accessibility (ARIA) beyond basic tab navigation — this is a demo, not production
