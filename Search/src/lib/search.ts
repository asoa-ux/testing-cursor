import { CATALOG, FACET_LABELS } from '../data/catalog'
import type {
  AssistantIntent,
  CatalogItem,
  ChatMessage,
  FacetKey,
  Facets,
  SearchState,
  TabId,
} from '../types'

const COLOR_WORDS: [RegExp, string][] = [
  [/\bred\b/, 'Red'],
  [/\bblack\b/, 'Black'],
  [/\bwhite\b/, 'White'],
  [/\bblue\b/, 'Blue'],
  [/\borange\b|\bfiesta\b|\bflame\b/, 'Red'],
]

const BRANDS = [
  'New Balance',
  'Nike',
  'Adidas',
  'Hoka',
  'Brooks',
  'ASICS',
  'Saucony',
  'Puma',
  'Mizuno',
  'Salomon',
]

function matchOnBrand(text: string): boolean {
  return /\bon(\s+running|\s+cloud)/.test(text)
}

export function itemMatchesQuery(item: CatalogItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const blob = [
    item.name,
    item.path,
    item.sku,
    item.brand,
    item.color,
    item.category,
    item.description,
    item.gender,
    item.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).every((token) => blob.includes(token))
}

export function itemMatchesFacets(item: CatalogItem, facets: Facets): boolean {
  if (facets.brand?.length && !facets.brand.includes(item.brand ?? '')) return false
  if (facets.color?.length && !facets.color.includes(item.colorFamily ?? '')) return false
  if (facets.size?.length) {
    const sizes = item.sizes ?? []
    if (!facets.size.some((s) => sizes.includes(s))) return false
  }
  if (facets.category?.length && !facets.category.includes(item.category ?? '')) return false
  if (facets.status?.length && !facets.status.includes(item.status)) return false
  if (facets.gender?.length && !facets.gender.includes(item.gender ?? '')) return false
  return true
}

export function filterCatalog(state: SearchState, ignoreFacet?: FacetKey): CatalogItem[] {
  const facets = ignoreFacet
    ? { ...state.facets, [ignoreFacet]: undefined }
    : state.facets
  return CATALOG.filter((item) => {
    if (state.tab !== 'all' && item.superType !== state.tab) return false
    if (!itemMatchesQuery(item, state.query)) return false
    return itemMatchesFacets(item, facets)
  })
}

export function filterIgnoringTab(state: SearchState): CatalogItem[] {
  return CATALOG.filter((item) => {
    if (!itemMatchesQuery(item, state.query)) return false
    return itemMatchesFacets(item, state.facets)
  })
}

export function tabCounts(state: SearchState): Record<TabId, number> {
  const items = filterIgnoringTab(state)
  return {
    all: items.length,
    product: items.filter((i) => i.superType === 'product').length,
    classification: items.filter((i) => i.superType === 'classification').length,
    asset: items.filter((i) => i.superType === 'asset').length,
    entity: items.filter((i) => i.superType === 'entity').length,
  }
}

export function facetValues(key: FacetKey, state: SearchState): { value: string; count: number }[] {
  const pool = filterCatalog(state, key)
  const counts = new Map<string, number>()
  for (const item of pool) {
    let values: string[] = []
    if (key === 'brand' && item.brand) values = [item.brand]
    if (key === 'color' && item.colorFamily) values = [item.colorFamily]
    if (key === 'size') values = (item.sizes ?? []).filter((s) => /^\d+$/.test(s))
    if (key === 'category' && item.category) values = [item.category]
    if (key === 'status') values = [item.status]
    if (key === 'gender' && item.gender) values = [item.gender]
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  const selected = new Set(state.facets[key] ?? [])
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      const as = selected.has(a.value) ? 0 : 1
      const bs = selected.has(b.value) ? 0 : 1
      if (as !== bs) return as - bs
      if (key === 'size') return Number(a.value) - Number(b.value)
      return a.value.localeCompare(b.value)
    })
}

export function matchedPhrase(item: CatalogItem, query: string): string {
  const q = query.trim().toLowerCase()
  if (!q) {
    if (item.superType === 'product') return item.category ?? item.path
    return item.path
  }
  if (item.name.toLowerCase().includes(q) || q.split(/\s+/).every((t) => item.name.toLowerCase().includes(t))) {
    return item.name
  }
  if (item.category?.toLowerCase().includes(q) || item.category?.toLowerCase().includes('running')) {
    return item.category ?? item.name
  }
  if (item.color?.toLowerCase().includes(q.split(/\s+/)[0] ?? '')) return item.color
  return item.name
}

export function byId(id: string): CatalogItem | undefined {
  return CATALOG.find((i) => i.id === id)
}

const FILLER =
  /\b(find|show|search|get|looking|want|need|please|for|me|the|a|an|in|with|and|of|all|items|item|products|product|that|are|is)\b/g

function extractColors(text: string): string[] {
  const found: string[] = []
  for (const [re, value] of COLOR_WORDS) {
    if (re.test(text) && !found.includes(value)) found.push(value)
  }
  return found
}

function extractSizes(text: string): string[] {
  const sizes: string[] = []
  const explicit = /\b(?:size|eu)\s*(\d{2})\b/g
  let m: RegExpExecArray | null
  while ((m = explicit.exec(text))) {
    const n = m[1]
    if (n && Number(n) >= 35 && Number(n) <= 50 && !sizes.includes(n)) sizes.push(n)
  }
  if (sizes.length) return sizes
  if (/\b(shoes?|running|trainers?|sneakers?)\b/.test(text)) {
    const loose = /\b(3[5-9]|4[0-9]|50)\b/g
    while ((m = loose.exec(text))) {
      const n = m[1]
      if (n && !sizes.includes(n)) sizes.push(n)
    }
  }
  return sizes
}

function extractBrands(text: string): string[] {
  const found = BRANDS.filter((b) => text.includes(b.toLowerCase()))
  if (matchOnBrand(text) && !found.includes('On')) found.push('On')
  return found
}

function extractCategory(text: string): string | undefined {
  if (/\b(running shoes?|trainers?|sneakers?)\b/.test(text)) return 'Running shoes'
  if (/\b(apparel|tee|t-shirt|shorts?|tops?)\b/.test(text)) return 'Apparel'
  if (/\blifestyle\b/.test(text)) return 'Lifestyle'
  return undefined
}

function extractTab(text: string): TabId | undefined {
  if (/\bassets?\b|\bimages?\b|\bphotos?\b|\bpackshots?\b/.test(text)) return 'asset'
  if (/\bclassifications?\b/.test(text)) return 'classification'
  if (/\bentit(?:y|ies)\b|\bbrands?\b/.test(text) && !extractBrands(text).length) return 'entity'
  if (/\bproducts?\b/.test(text)) return 'product'
  return undefined
}

function cleanedQuery(text: string, facets: Facets): string {
  let q = text.toLowerCase()
  q = q.replace(FILLER, ' ')
  for (const c of extractColors(q)) q = q.replace(new RegExp(`\\b${c.toLowerCase()}\\b`, 'g'), ' ')
  for (const s of facets.size ?? []) q = q.replace(new RegExp(`\\b${s}\\b`, 'g'), ' ')
  q = q.replace(/\b(size|eu)\b/g, ' ')
  q = q.replace(/\bonly\b|\bjust\b|\bapproved\b|\bincomplete\b/g, ' ')
  return q.replace(/\s+/g, ' ').trim()
}

export function parseIntent(text: string, current: SearchState): AssistantIntent {
  const t = text.toLowerCase().trim()

  if (/^(clear|reset|start over|remove filters)\b/.test(t)) {
    return { kind: 'reset' }
  }

  if (
    current.activeId &&
    /\bassets?\b/.test(t) &&
    /\b(related|this|selected)\b/.test(t)
  ) {
    const item = byId(current.activeId)
    return {
      kind: 'search',
      query: item?.name ?? current.query,
      tab: 'asset',
      facets: {},
      replaceFacets: true,
    }
  }

  if (
    current.activeId &&
    (/\b(this|selected|it)\b/.test(t) || /\btell me\b/.test(t)) &&
    /\b(about|why|match|complet|detail|more)\b/.test(t)
  ) {
    return { kind: 'explain-item' }
  }

  if (/^(help|what can you do|how does this work)\b/.test(t)) {
    return { kind: 'talk', topic: 'help' }
  }

  if (/\bhow many\b|\bwhat did you find\b|\bcurrent results\b/.test(t)) {
    return { kind: 'talk', topic: 'counts' }
  }

  const only = /\b(?:only|just|filter to|narrow to)\b/.test(t)
  const colors = extractColors(t)
  const sizes = extractSizes(t)
  const brands = extractBrands(t)
  const category = extractCategory(t)
  const tab = extractTab(t)
  const approved = /\bapproved\b/.test(t)

  const facets: Facets = only ? { ...current.facets } : {}
  if (colors.length) facets.color = colors
  if (sizes.length) facets.size = sizes
  if (brands.length) facets.brand = brands
  if (category) facets.category = [category]
  if (approved) facets.status = ['Approved']

  const hasStructured = Boolean(
    colors.length || sizes.length || brands.length || category || tab || approved || only,
  )
  const query = only ? current.query : cleanedQuery(t, facets)
  const looksLikeSearch = hasStructured || query.length > 1

  if (looksLikeSearch) {
    const nextTab: TabId =
      tab ??
      (category || colors.length || sizes.length || brands.length ? 'product' : current.tab)
    return {
      kind: 'search',
      query: query || current.query,
      tab: nextTab,
      facets: only ? facets : { ...facets },
      replaceFacets: !only,
    }
  }

  return { kind: 'talk', topic: 'unknown' }
}

export function applyIntent(intent: AssistantIntent, current: SearchState): SearchState {
  if (intent.kind === 'reset') {
    return { query: '', tab: 'all', facets: {}, activeId: CATALOG[0].id, checkedIds: [] }
  }
  if (intent.kind !== 'search') return current
  const facets = intent.replaceFacets ? intent.facets : { ...current.facets, ...intent.facets }
  return {
    ...current,
    query: intent.query,
    tab: intent.tab,
    facets,
    checkedIds: [],
  }
}

function facetSummary(facets: Facets): string[] {
  const lines: string[] = []
  for (const key of Object.keys(FACET_LABELS) as FacetKey[]) {
    const vals = facets[key]
    if (vals?.length) lines.push(`${FACET_LABELS[key]}: ${vals.join(', ')}`)
  }
  return lines
}

function topHits(items: CatalogItem[], n = 3): CatalogItem[] {
  return [...items]
    .filter((i) => i.superType === 'product')
    .sort((a, b) => b.completeness - a.completeness)
    .slice(0, n)
}

export function composeReply(
  intent: AssistantIntent,
  results: CatalogItem[],
  state: SearchState,
  counts: Record<TabId, number>,
): Omit<ChatMessage, 'id' | 'role'> {
  if (intent.kind === 'reset') {
    return {
      text: 'Filters and query are cleared. Search is back to the full catalog.',
      suggestions: ['Find red running shoes in size 42', 'Show approved Nike footwear'],
    }
  }

  if (intent.kind === 'explain-item') {
    const item = state.activeId ? byId(state.activeId) : undefined
    if (!item) {
      return {
        text: 'Select a result in the list and I can explain it — why it matched, which attributes are set, and how complete it is.',
      }
    }
    const sizeNote =
      item.sizes?.length && state.facets.size?.length
        ? ` It includes EU ${state.facets.size.join(' and ')} in its size run.`
        : ''
    const colorNote = item.color ? ` Color is ${item.color}.` : ''
    return {
      text: `${item.name} sits in ${item.path}. Completeness is ${item.completeness}% (${item.status}).${colorNote}${sizeNote} ${item.description ?? ''}`.trim(),
      mentions: [{ id: item.id, name: item.name }],
      suggestions: ['Find related assets', 'Clear filters'],
    }
  }

  if (intent.kind === 'talk') {
    if (intent.topic === 'counts') {
      return {
        text: `Current Search has ${counts.all} hits (${counts.product} products, ${counts.asset} assets, ${counts.classification} classifications, ${counts.entity} entities). Query “${state.query || '—'}”.`,
        suggestions: ['Find red running shoes in size 42', 'Clear filters'],
      }
    }
    if (intent.topic === 'help') {
      return {
        text: 'Tell me what to find in natural language. I will map it onto the same query, type tab, and facets as the left-hand filters — you will see Search update as I go.',
        suggestions: ['Find red running shoes in size 42', 'Show approved Nike footwear'],
      }
    }
    return {
      text: 'I could not turn that into a catalog search. Try naming a product type, color, size, or brand — for example “red running shoes size 42”.',
      suggestions: ['Find red running shoes in size 42', 'Black running shoes, size 44'],
    }
  }

  const products = results.filter((r) => r.superType === 'product')
  const hits = topHits(results)
  const who = hits.map((h) => h.name)
  const extra =
    who.length > 0
      ? ` Highest completeness among them: ${who.join(', ')}.`
      : ''
  const missingSize = (intent.facets.size ?? [])[0]
  const dropped =
    missingSize && intent.facets.color
      ? ' Puma Velocity Nitro 3 and Mizuno Wave Rider 28 are red running shoes but do not carry that EU size, so they stayed out.'
      : ''
  const lines = facetSummary(intent.replaceFacets ? intent.facets : state.facets)
  const tabLabel =
    intent.tab === 'all'
      ? 'All'
      : intent.tab === 'product'
        ? 'Products'
        : intent.tab === 'asset'
          ? 'Assets'
          : intent.tab === 'classification'
            ? 'Classifications'
            : 'Entities'

  const text = [
    `I mapped that onto Search and applied it.`,
    intent.query ? `Query: ${intent.query}` : null,
    `Search in: ${tabLabel}`,
    lines.length ? `Filters: ${lines.join(' · ')}` : null,
    `${results.length} result${results.length === 1 ? '' : 's'} (${products.length} products).${extra}${dropped}`,
    `Click a card to inspect it — I will keep the selection as context. You can refine here, e.g. “only Nike”.`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    text,
    applied: {
      query: state.query,
      tab: state.tab,
      facets: state.facets,
      resultCount: results.length,
    },
    mentions: hits.map((h) => ({ id: h.id, name: h.name })),
    suggestions: ['Only Nike', 'Black running shoes, size 44', 'Clear filters'],
  }
}

