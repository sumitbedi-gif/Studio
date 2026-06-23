import type { ActivityEntry, Connector, FlowStep, Journey } from './types'

export const CANONICAL_PROMPT =
  'Generate guidance for the new Approval Bot feature from these release notes.'

export const CANONICAL_FILE = {
  name: 'Approval-Bot-Release-Notes-Q1-2026.pdf',
  size: 240_000,
  type: 'application/pdf',
}

export const CLARIFICATION = {
  question:
    "Got it. Quick check — is this aimed at Sales Reps who'll use the bot during deal close, or Admins who'll configure approval routing?",
  options: ['Sales Reps', 'Admins'] as const,
}

export const DEFAULT_RULES: string[] = [
  'Use active voice',
  'Say "and" instead of "&"',
  'Keep step titles under 8 words',
]

export const RULE_SUGGESTIONS: string[] = [
  'Avoid jargon',
  'Second-person voice',
  'No exclamations',
]

export const CONNECTORS: Connector[] = [
  { id: 'servicenow', name: 'ServiceNow' },
  { id: 'jira', name: 'Jira' },
  { id: 'confluence', name: 'Confluence' },
  { id: 'sharepoint', name: 'SharePoint' },
  { id: 'zendesk', name: 'Zendesk' },
  { id: 'teams', name: 'Teams' },
]

/**
 * Templates render as a 2x2 card grid below the composer.
 * `label` is the card title (one line), `description` is a short body line,
 * `prompt` is what populates the composer on click. All entries are
 * create-themed so the grid reads as a coherent "Create X from Y" set.
 */
export const TEMPLATE_CARDS: Array<{
  id: string
  label: string
  description: string
  prompt: string
}> = [
  {
    id: 'doc',
    label: 'Create guidance from a doc',
    description: 'Turn release notes into popups, flows, and tooltips.',
    prompt: 'Generate guidance for the new feature from these release notes.',
  },
  {
    id: 'onboarding',
    label: 'Create an onboarding journey',
    description: 'Walk new users through their first few minutes.',
    prompt:
      'Create an onboarding journey for a new user signing up for our product for the first time.',
  },
  {
    id: 'release',
    label: 'Create a release campaign',
    description: 'Sequence announce, walkthrough, and reinforcement.',
    prompt:
      'Plan a launch campaign for the Einstein Approval Bot feature shipping Friday.',
  },
  {
    id: 'jira',
    label: 'Create from a Jira ticket',
    description: 'Build the guidance from the acceptance criteria.',
    prompt:
      'Read this Jira ticket and create the guidance described in the acceptance criteria.',
  },
]

export const ACTIVITY_STREAM: ActivityEntry[] = [
  { delay: 0, type: 'main', text: 'Reading Approval-Bot-Release-Notes-Q1-2026.pdf' },
  { delay: 200, type: 'sub', text: '12 pages, 4,200 words, 8 sections' },
  { delay: 800, type: 'main', text: 'Identifying user jobs' },
  { delay: 1000, type: 'sub', text: 'Found 4 candidate intents' },
  {
    delay: 1400,
    type: 'sub-list',
    items: [
      'Introduce the feature to first-time users',
      'Walk users through one-time setup',
      'Reinforce key field-level rules',
      'Provide a reference for the help center',
    ],
  },
  { delay: 2400, type: 'main', text: 'Selecting content types' },
  { delay: 2600, type: 'sub', text: 'Pop-up + Flow + Smart Tip + Article' },
  { delay: 3400, type: 'main', text: 'Composing journey' },
  { delay: 3600, type: 'sub', text: 'Sequencing announce → configure → use → reference' },
  { delay: 4400, type: 'main', text: 'Rendering previews' },
  { delay: 4600, type: 'sub', text: 'Generating with Salesforce brand kit' },
  { delay: 6000, type: 'done', text: 'Plan ready' },
]

export const FLOW_STEPS: FlowStep[] = [
  { num: 1,  anchor: { top: '6%',  left: '92%' }, anchorLabel: 'Setup gear icon',     title: 'Open Setup',                body: 'Start by clicking the gear icon in the top-right and selecting Setup.' },
  { num: 2,  anchor: { top: '14%', left: '20%' }, anchorLabel: 'Setup search bar',    title: 'Search for Approval Bot',   body: 'Type "Approval Bot" in the Quick Find search to jump straight to the right page.' },
  { num: 3,  anchor: { top: '24%', left: '22%' }, anchorLabel: 'Approval Bot menu',   title: 'Open Approval Bot settings',body: 'This is where you configure routing, rules, and notifications.' },
  { num: 4,  anchor: { top: '32%', left: '54%' }, anchorLabel: 'Enable toggle',       title: 'Enable Approval Bot',       body: 'Flip this toggle to activate Bot for your org. You can disable any time.' },
  { num: 5,  anchor: { top: '40%', left: '60%' }, anchorLabel: 'Rule type dropdown',  title: 'Choose how rules apply',    body: 'Decide whether rules cascade by amount, by team, or by deal type.' },
  { num: 6,  anchor: { top: '48%', left: '50%' }, anchorLabel: 'Amount threshold',    title: 'Set the approval threshold',body: 'Deals above this amount will require approval. Default is $50,000.' },
  { num: 7,  anchor: { top: '54%', left: '46%' }, anchorLabel: 'Approver field',      title: 'Assign approvers',          body: 'Pick the user or role that should approve each tier. You can chain multiple approvers.' },
  { num: 8,  anchor: { top: '60%', left: '58%' }, anchorLabel: 'Escalation timer',    title: 'Set escalation timing',     body: "If an approver doesn't respond within this window, Bot escalates. Default is 24 hours." },
  { num: 9,  anchor: { top: '66%', left: '50%' }, anchorLabel: 'Fallback approver',   title: 'Add a fallback',            body: 'If everyone in the primary chain is out, Bot routes here.' },
  { num: 10, anchor: { top: '70%', left: '64%' }, anchorLabel: 'Notification settings', title: 'Configure notifications', body: 'Choose which approvers get pinged on Slack, email, or both.' },
]

export const JOURNEY: Journey = {
  cards: [
    {
      id: 'popup-1',
      type: 'popup',
      title: 'Meet Approval Bot',
      confidence: 'high',
      body: 'Routing deal approvals just got faster. See it in action with a guided walkthrough.',
      cta: { primary: 'Show me how →', secondary: 'Maybe later' },
      audience: 'Profile = Sales Rep',
    },
    {
      id: 'flow-1',
      type: 'flow',
      title: 'Configure Approval Bot',
      confidence: 'high',
      steps: FLOW_STEPS,
      audience: 'Profile = Sales Manager + System Administrator',
    },
    {
      id: 'tip-1',
      type: 'smarttip',
      title: 'Approvals route through Bot',
      confidence: 'high',
      anchorLabel: 'Request Approval button',
      body: 'Average response time: 2 minutes. Bot will auto-route based on amount.',
      audience: 'Profile = Sales Rep',
      alternative: 'Submit for approval link in the action ribbon',
    },
    {
      id: 'article-1',
      type: 'article',
      title: 'How Approval Bot works',
      confidence: 'high',
      audience: 'All Sales users',
      sections: [
        {
          heading: 'What is Approval Bot?',
          body: "Approval Bot is Salesforce Einstein's new agent that routes deal approvals automatically based on amount, team, and deal type. It replaces the manual workflow your admin used to maintain in Process Builder.",
        },
        {
          heading: 'Setting it up',
          body: 'Sales Managers or Admins configure Bot in Setup. You decide which deals require approval, who approves them, and how long approvers have before Bot escalates.',
        },
        {
          heading: "When you'll see it",
          body: 'Approval Bot kicks in automatically when a Sales Rep clicks Request Approval on an Opportunity that meets your rules. Reps see a confirmation; approvers get pinged where they work.',
        },
        {
          heading: 'Common questions',
          body: 'How long does approval take? Usually under two minutes. Can I override Bot? Yes, admins can manually re-route any pending approval. Who configures the rules? Sales Managers and System Administrators.',
        },
      ],
    },
  ],
}

export const BUILD_TIMINGS = {
  cardDuration: 1200,
  pauseBetweenCards: 200,
  totalEstimate: 4200,
}

// Refresh variants — when the user clicks the Refresh icon on a card, the
// content swaps to one of these alternates. We keep 1 alternate per card.
export const POPUP_VARIANT = {
  title: 'Approval Bot is live',
  body: 'Deal approvals now route through Bot. A quick tour takes 2 minutes.',
  cta: { primary: 'Take the tour →', secondary: 'Skip' },
}

export const SMARTTIP_VARIANT = {
  title: 'Routed through Approval Bot',
  body: 'Bot auto-routes by amount. Most approvals come back in under 2 minutes.',
}

export const ARTICLE_VARIANT_SECTIONS = [
  {
    heading: 'Meet Approval Bot',
    body: "Salesforce's new approval agent — it handles routing automatically, so reps don't have to chase managers and managers don't have to chase reps.",
  },
  {
    heading: 'How to turn it on',
    body: "Sales Managers and Admins enable Bot from Setup. You'll define the rules (amount thresholds, escalation timing, fallback approvers) once.",
  },
  {
    heading: 'What changes for reps',
    body: 'When you click Request Approval on an Opportunity, Bot picks the right approver and routes immediately. You can track status on the deal page.',
  },
  {
    heading: 'FAQ',
    body: 'Override an approval? Admins can re-route any pending request. Audit log? Always on — visit Reports → Approvals.',
  },
]

