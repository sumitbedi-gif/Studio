import type { BrandKit } from './types'

const favicon = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

export const BRAND_KITS: Record<string, BrandKit> = {
  'salesforce.com': {
    domain: 'salesforce.com',
    name: 'Salesforce',
    faviconUrl: favicon('salesforce.com'),
    colors: { primary: '#0070D2', secondary: '#1B96FF', text: '#080707' },
    font: 'Salesforce Sans',
  },
  'slack.com': {
    domain: 'slack.com',
    name: 'Slack',
    faviconUrl: favicon('slack.com'),
    colors: { primary: '#611F69', secondary: '#ECB22E', text: '#1D1C1D' },
    font: 'Lato',
  },
  'github.com': {
    domain: 'github.com',
    name: 'GitHub',
    faviconUrl: favicon('github.com'),
    colors: { primary: '#24292F', secondary: '#0969DA', text: '#1F2328' },
    font: 'Inter',
  },
  'notion.so': {
    domain: 'notion.so',
    name: 'Notion',
    faviconUrl: favicon('notion.so'),
    colors: { primary: '#000000', secondary: '#2EAADC', text: '#37352F' },
    font: 'Inter',
  },
  'figma.com': {
    domain: 'figma.com',
    name: 'Figma',
    faviconUrl: favicon('figma.com'),
    colors: { primary: '#0ACF83', secondary: '#A259FF', text: '#1E1E1E' },
    font: 'Inter',
  },
}

export function lookupBrand(rawUrl: string): BrandKit {
  let domain = rawUrl.trim().toLowerCase()
  domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ?? domain
  if (BRAND_KITS[domain]) return BRAND_KITS[domain]
  return {
    domain,
    name: domain,
    faviconUrl: favicon(domain),
    colors: { primary: '#525066', secondary: '#8C899F', text: '#1F1F32' },
    font: 'system-ui',
  }
}
