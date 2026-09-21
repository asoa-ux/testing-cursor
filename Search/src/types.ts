export type SuperType = 'product' | 'classification' | 'asset' | 'entity'
export type TabId = 'all' | SuperType
export type LayoutVariant = 'default' | 'overlay' | 'compact'
export type FacetKey = 'brand' | 'color' | 'size' | 'category' | 'status' | 'gender'

export type CatalogItem = {
  id: string
  superType: SuperType
  name: string
  path: string
  sku?: string
  brand?: string
  color?: string
  colorFamily?: string
  sizes?: string[]
  category?: string
  gender?: string
  status: 'Approved' | 'In progress' | 'Draft'
  completeness: number
  material?: string
  season?: string
  description?: string
  price?: string
  relatedIds?: string[]
  attributes: { label: string; value: string }[]
  groups: { name: string; rows: { label: string; value: string }[] }[]
  completenessBars: { label: string; value: number }[]
  workflows: { name: string; state: string }[]
  swatch: string
  thumbKind: 'shoe' | 'apparel' | 'asset' | 'folder' | 'org'
}

export type Facets = Partial<Record<FacetKey, string[]>>

export type SearchState = {
  query: string
  tab: TabId
  facets: Facets
  activeId: string | null
  checkedIds: string[]
}

export type AssistantIntent =
  | { kind: 'search'; query: string; tab: TabId; facets: Facets; replaceFacets: boolean }
  | { kind: 'explain-item' }
  | { kind: 'reset' }
  | { kind: 'talk'; topic: 'help' | 'counts' | 'unknown' }

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  applied?: { query: string; tab: TabId; facets: Facets; resultCount: number }
  mentions?: { id: string; name: string }[]
  suggestions?: string[]
}
