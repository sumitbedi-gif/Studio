"use client"

/**
 * Welcome illustration — layered hero scene.
 *
 * Inputs (doc, ticket, signal) flow through curved paths into a glowing
 * agent core, which projects outward to four output artifacts (popup, flow,
 * smart tip, article). All elements have a stable position and the paths
 * connect each source's visual center to the agent's edge.
 */
export function WelcomeIllustration() {
  // Layout anchors (SVG coords, viewBox 400 × 200).
  // Core: (200, 100), radius 26.
  // Inputs (left column, x ~ 50):
  const INPUTS = [
    { y: 38, type: "doc" as const },
    { y: 88, type: "ticket" as const },
    { y: 142, type: "signal" as const },
  ]
  // Outputs (right column). Icons are 32x32; translate puts their top-left,
  // so center = (icon_x + 16, icon_y + 16). x = 332 → center 348.
  const OUTPUTS = [
    { y: 22,  type: "popup" as const,    delay: 700 },
    { y: 70,  type: "flow" as const,     delay: 900 },
    { y: 118, type: "smarttip" as const, delay: 1100 },
    { y: 166, type: "article" as const,  delay: 1300 },
  ]

  return (
    <div className="wfc-welcome-illo" aria-hidden="true">
      <svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="wfc-illo-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0975D7" stopOpacity="0.28" />
            <stop offset="40%" stopColor="#0975D7" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#0975D7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="wfc-illo-core-fill" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#5AA7E8" />
            <stop offset="60%" stopColor="#0975D7" />
            <stop offset="100%" stopColor="#0A5FAE" />
          </radialGradient>

          <linearGradient id="wfc-illo-flow-in" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0975D7" stopOpacity="0" />
            <stop offset="50%" stopColor="#0975D7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0975D7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="wfc-illo-flow-out" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0" />
            <stop offset="50%" stopColor="#22C55E" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="wfc-illo-particle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0975D7" stopOpacity="1" />
            <stop offset="100%" stopColor="#0975D7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient floating dots */}
        <g opacity="0.5">
          <circle cx="100" cy="22" r="1.4" fill="#C4DCF4">
            <animate attributeName="cy" values="22;18;22" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="20" r="1.2" fill="#C4DCF4">
            <animate attributeName="cy" values="20;15;20" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="14" r="1.3" fill="#C4DCF4">
            <animate attributeName="cy" values="14;10;14" dur="7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="188" r="1.4" fill="#C4DCF4">
            <animate attributeName="cy" values="188;192;188" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Agent core aura */}
        <circle cx="200" cy="100" r="80" fill="url(#wfc-illo-aura)">
          <animate
            attributeName="r"
            values="76;86;76"
            dur="4.5s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </circle>

        {/* Input source paths — each starts at the source's visual center, ends at core's left edge (~174,100) */}
        <g stroke="#D8D7D2" strokeWidth="1" fill="none" opacity="0.75">
          {/* Doc center: (68, 58) → core left-top edge ~(180, 85) */}
          <path d="M 68 58 Q 124 70, 178 88" />
          {/* Ticket center: (62, 106) → core left edge (174, 100) */}
          <path d="M 62 106 Q 118 103, 174 100" />
          {/* Signal center: (68, 160) → core left-bottom edge ~(180, 116) */}
          <path d="M 68 160 Q 124 130, 178 114" />
        </g>

        {/* Flowing particles on input paths */}
        <g fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M 68 58 Q 124 70, 178 88" stroke="url(#wfc-illo-flow-in)" strokeDasharray="3 14">
            <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M 62 106 Q 118 103, 174 100" stroke="url(#wfc-illo-flow-in)" strokeDasharray="3 14">
            <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.8s" repeatCount="indefinite" />
          </path>
          <path d="M 68 160 Q 124 130, 178 114" stroke="url(#wfc-illo-flow-in)" strokeDasharray="3 14">
            <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.2s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Output paths — core right edge (~226, 100) → icon centers (~340, y+16) */}
        <g stroke="#D8D7D2" strokeWidth="1" fill="none" opacity="0.75">
          <path d="M 222 88 Q 282 65, 336 38" />
          <path d="M 226 96 Q 286 90, 336 86" />
          <path d="M 226 104 Q 286 110, 336 134" />
          <path d="M 222 112 Q 282 145, 336 182" />
        </g>

        {/* Flowing particles on output paths */}
        <g fill="none" strokeWidth="2" strokeLinecap="round">
          <path d="M 222 88 Q 282 65, 336 38" stroke="url(#wfc-illo-flow-out)" strokeDasharray="3 14">
            <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.6s" repeatCount="indefinite" begin="0.6s" />
          </path>
          <path d="M 226 96 Q 286 90, 336 86" stroke="url(#wfc-illo-flow-out)" strokeDasharray="3 14">
            <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.4s" repeatCount="indefinite" begin="0.8s" />
          </path>
          <path d="M 226 104 Q 286 110, 336 134" stroke="url(#wfc-illo-flow-out)" strokeDasharray="3 14">
            <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.8s" repeatCount="indefinite" begin="1.0s" />
          </path>
          <path d="M 222 112 Q 282 145, 336 182" stroke="url(#wfc-illo-flow-out)" strokeDasharray="3 14">
            <animate attributeName="stroke-dashoffset" from="34" to="0" dur="2.5s" repeatCount="indefinite" begin="1.2s" />
          </path>
        </g>

        {/* INPUT — Document (center 68, 58) */}
        <g transform="translate(52 38)">
          <rect width="32" height="40" rx="4" fill="#fff" stroke="#D8D7D2" strokeWidth="1" />
          <path d="M 24 0 L 32 8 L 24 8 Z" fill="#F6F6F4" stroke="#D8D7D2" strokeWidth="1" />
          <line x1="6" y1="14" x2="24" y2="14" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6" y1="19" x2="24" y2="19" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6" y1="24" x2="20" y2="24" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6" y1="29" x2="24" y2="29" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* INPUT — Ticket / connector (center 62, 106) */}
        <g transform="translate(46 90)">
          <rect width="32" height="32" rx="5" fill="#fff" stroke="#D8D7D2" strokeWidth="1" />
          <circle cx="10" cy="12" r="3" fill="#0975D7" opacity="0.65" />
          <line x1="16" y1="10" x2="26" y2="10" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="14" x2="22" y2="14" stroke="#B4B2A9" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6" y1="22" x2="26" y2="22" stroke="#B4B2A9" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="6" y1="26" x2="20" y2="26" stroke="#B4B2A9" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* INPUT — Pulsing signal (center 68, 160) */}
        <g transform="translate(52 144)">
          <circle cx="16" cy="16" r="16" fill="#fff" stroke="#D8D7D2" strokeWidth="1" />
          <circle cx="16" cy="16" r="5" fill="none" stroke="#0975D7" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" from="5" to="14" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="16" r="5" fill="none" stroke="#0975D7" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" from="5" to="14" dur="2s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" begin="0.7s" />
          </circle>
          <circle cx="16" cy="16" r="4.5" fill="#0975D7">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* AGENT CORE (center 200, 100) */}
        <g transform="translate(200 100)">
          <g opacity="0.4">
            <circle r="48" fill="none" stroke="#C4DCF4" strokeWidth="0.8" strokeDasharray="2 6" />
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="40s" repeatCount="indefinite" />
          </g>
          <circle r="40" fill="none" stroke="#0975D7" strokeWidth="0.8" opacity="0.25" />
          <circle r="34" fill="none" stroke="#0975D7" strokeWidth="1" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle r="30" fill="#fff" opacity="0.9" />
          <circle r="24" fill="url(#wfc-illo-core-fill)" />
          <ellipse cx="-5" cy="-7" rx="9" ry="4" fill="#fff" opacity="0.35" />
          <g stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M 0 -9 L 0 9" />
            <path d="M -9 0 L 9 0" />
            <path d="M -6.5 -6.5 L 6.5 6.5" opacity="0.6" />
            <path d="M 6.5 -6.5 L -6.5 6.5" opacity="0.6" />
          </g>
          <circle r="30" fill="none" stroke="#0975D7" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" from="30" to="52" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="30" fill="none" stroke="#0975D7" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" from="30" to="52" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
            <animate attributeName="opacity" from="0.5" to="0" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
          </circle>
        </g>

        {/* OUTPUTS — staggered entry. Icons are 32x32, centered on x=348 (translate x=332). */}
        {OUTPUTS.map(({ y, type, delay }) => (
          <g
            key={type}
            transform={`translate(332 ${y})`}
            className="wfc-illo-out"
            style={{ animationDelay: `${delay}ms` }}
          >
            <OutputIcon type={type} />
          </g>
        ))}
      </svg>
    </div>
  )

  // (INPUTS used implicitly above for the doc/ticket/signal positions.)
  void INPUTS // keep linter happy if we add references later
}

function OutputIcon({ type }: { type: "popup" | "flow" | "smarttip" | "article" }) {
  // Outline icons. Each rendered inside a 32×32 box, centered.
  // Stroke: blue accent. No background card — just the icon itself.
  const stroke = "#0975D7"
  const sw = 1.5

  if (type === "popup") {
    // Popup window — top bar with dots + content area
    return (
      <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="26" height="22" rx="3" />
        <line x1="3" y1="11" x2="29" y2="11" />
        <circle cx="6.5" cy="8" r="0.8" fill={stroke} stroke="none" />
        <circle cx="9.5" cy="8" r="0.8" fill={stroke} stroke="none" />
        <line x1="7" y1="16" x2="22" y2="16" opacity="0.55" />
        <line x1="7" y1="20" x2="18" y2="20" opacity="0.55" />
      </g>
    )
  }

  if (type === "flow") {
    // Signpost — pole with two arrow signs pointing right
    return (
      <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <line x1="11" y1="3" x2="11" y2="29" />
        <path d="M 11 7 L 25 7 L 28 10 L 25 13 L 11 13" />
        <path d="M 11 17 L 22 17 L 25 20 L 22 23 L 11 23" opacity="0.7" />
      </g>
    )
  }

  if (type === "smarttip") {
    // Lightbulb — bulb + filament hint + base
    return (
      <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 16 4 C 11 4, 7 8, 7 13 C 7 16, 8.5 18.5, 11 20.5 L 11 23 L 21 23 L 21 20.5 C 23.5 18.5, 25 16, 25 13 C 25 8, 21 4, 16 4 Z" />
        <line x1="12" y1="26" x2="20" y2="26" />
        <line x1="14" y1="29" x2="18" y2="29" opacity="0.7" />
        <path d="M 13 14 L 16 11 L 19 14" opacity="0.55" />
      </g>
    )
  }

  // article — document with horizontal lines (clean outline)
  return (
    <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M 7 4 L 22 4 L 27 9 L 27 28 L 7 28 Z" />
      <path d="M 22 4 L 22 9 L 27 9" />
      <line x1="11" y1="15" x2="23" y2="15" opacity="0.7" />
      <line x1="11" y1="19" x2="23" y2="19" opacity="0.55" />
      <line x1="11" y1="23" x2="20" y2="23" opacity="0.55" />
    </g>
  )
}
