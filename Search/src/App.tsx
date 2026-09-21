import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ChatPanel } from './ChatPanel'
import { CATALOG, TAB_LABELS } from './data/catalog'
import { DetailsPage } from './DetailsPage'
import { FacetPanel } from './FacetPanel'
import {
  IconAction,
  IconBack,
  IconBell,
  IconChat,
  IconCollection,
  IconCustomize,
  IconDetails,
  IconExport,
  IconGear,
  IconGrid,
  IconHamburger,
  IconHelp,
  IconSearch,
  IconUser,
  IconWorkflow,
} from './icons'
import {
  applyIntent,
  byId,
  composeReply,
  filterCatalog,
  parseIntent,
  tabCounts,
} from './lib/search'
import { ResultList } from './ResultList'
import { PANEL_DEFAULT_WIDTH, ResizeHandle } from './ResizeHandle'
import type { ChatMessage, FacetKey, LayoutVariant, SearchState, TabId } from './types'

const INITIAL: SearchState = {
  query: '',
  tab: 'all',
  facets: {},
  activeId: CATALOG[0].id,
  checkedIds: [],
}

const LAYOUTS: { id: LayoutVariant; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'overlay', label: 'Chat overlay' },
  { id: 'compact', label: 'Compact filters' },
]

const TABS: TabId[] = ['all', 'product', 'classification', 'asset', 'entity']

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function App() {
  const [layout, setLayout] = useState<LayoutVariant>('default')
  const [search, setSearch] = useState<SearchState>(INITIAL)
  const searchRef = useRef(search)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [busy, setBusy] = useState(false)
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])
  const [panelWidths, setPanelWidths] = useState({
    filters: PANEL_DEFAULT_WIDTH,
    list: PANEL_DEFAULT_WIDTH,
    chat: PANEL_DEFAULT_WIDTH,
  })

  useEffect(() => {
    searchRef.current = search
  }, [search])

  const results = useMemo(() => filterCatalog(search), [search])
  const counts = useMemo(() => tabCounts(search), [search])
  const selectedId =
    (search.activeId && results.some((item) => item.id === search.activeId)
      ? search.activeId
      : results[0]?.id) ?? null
  const activeItem = selectedId ? (byId(selectedId) ?? null) : null
  const listState = { ...search, activeId: selectedId }

  const showChat = chatOpen
  const showDetailsPage = detailsOpen

  function toggleFacet(key: FacetKey, value: string) {
    setSearch((s) => {
      const current = s.facets[key] ?? []
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      return { ...s, facets: { ...s.facets, [key]: next.length ? next : undefined } }
    })
  }

  function send(text: string) {
    if (busy) return
    const userMsg: ChatMessage = { id: uid(), role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setBusy(true)
    window.setTimeout(() => {
      const current = searchRef.current
      const intent = parseIntent(text, current)
      const next = applyIntent(intent, current)
      const nextResults = filterCatalog(next)
      const nextCounts = tabCounts(next)
      const resolved =
        next.activeId && nextResults.some((r) => r.id === next.activeId)
          ? next
          : { ...next, activeId: nextResults[0]?.id ?? next.activeId }
      const reply = composeReply(intent, nextResults, resolved, nextCounts)
      searchRef.current = resolved
      setSearch(resolved)
      setSuggestedIds(reply.mentions?.map((x) => x.id) ?? [])
      setMessages((m) => [...m, { id: uid(), role: 'assistant', ...reply }])
      setBusy(false)
    }, 700)
  }

  function resetDemo() {
    searchRef.current = INITIAL
    setSearch(INITIAL)
    setMessages([])
    setSuggestedIds([])
    setDetailsOpen(false)
    setChatOpen(false)
    setFiltersCollapsed(false)
    setBusy(false)
    setPanelWidths({
      filters: PANEL_DEFAULT_WIDTH,
      list: PANEL_DEFAULT_WIDTH,
      chat: PANEL_DEFAULT_WIDTH,
    })
  }

  function selectItem(id: string) {
    setSearch((s) => ({ ...s, activeId: id }))
  }

  const workspaceClass = [
    'workspace',
    `layout-${layout}`,
    showChat ? 'chat-on' : '',
    showDetailsPage ? 'page-details' : 'page-list',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="app">
      <div className="lab-bar">
        <span className="lab-tag">Prototype</span>
        <label>
          Layout
          <select
            value={layout}
            onChange={(e) => {
              const v = e.target.value as LayoutVariant
              setLayout(v)
              setFiltersCollapsed(v === 'compact')
            }}
          >
            {LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" disabled={busy} onClick={() => send('Find red running shoes in size 42')}>
          Play journey · red running shoes 42
        </button>
        <button type="button" className="ghost" onClick={resetDemo}>
          Reset
        </button>
        <span className="lab-hint">
          List view is filters + results. Details is a page (nav list + content). Assistant is a right-hand panel.
        </span>
      </div>

      <header className="topbar">
        <div className="topbar-left">
          <button type="button" className="top-icon" aria-label="Menu">
            <IconHamburger />
          </button>
          <button type="button" className="top-icon" aria-label="Back">
            <IconBack />
          </button>
          <h1>Search</h1>
        </div>
        <div className="topbar-right">
          <span>English (US)</span>
          <span>Main</span>
          <button
            type="button"
            className={`topbar-assistant ${chatOpen ? 'pressed' : ''}`}
            aria-pressed={chatOpen}
            onClick={() => setChatOpen((v) => !v)}
          >
            <IconChat />
            Assistant
          </button>
          <button type="button" className="top-icon" aria-label="Notifications">
            <IconBell />
            <i className="dot" />
          </button>
          <button type="button" className="top-icon" aria-label="Apps">
            <IconGrid />
          </button>
          <button type="button" className="top-icon" aria-label="Settings">
            <IconGear />
          </button>
          <button type="button" className="top-icon" aria-label="Help">
            <IconHelp />
          </button>
          <button type="button" className="top-icon" aria-label="Account">
            <IconUser />
          </button>
        </div>
      </header>

      <div className="toolbar">
        <label className="search-field">
          <input
            value={search.query}
            onChange={(e) => setSearch((s) => ({ ...s, query: e.target.value }))}
            placeholder="Search"
          />
          <IconSearch />
        </label>
        <div className="toolbar-actions">
          <ToolbarBtn icon={<IconWorkflow />} label="Add to workflow" disabled={search.checkedIds.length === 0} />
          <ToolbarBtn icon={<IconCollection />} label="Collection" disabled={search.checkedIds.length === 0} />
          <ToolbarBtn icon={<IconAction />} label="Business action" disabled />
          <ToolbarBtn icon={<IconExport />} label="Export" disabled={search.checkedIds.length === 0} />
        </div>
        <div className="toolbar-end">
          <ToolbarBtn icon={<IconCustomize />} label="Customize" />
          <ToolbarBtn
            icon={<IconDetails />}
            label="Details"
            pressed={detailsOpen}
            onClick={() => setDetailsOpen((v) => !v)}
          />
        </div>
      </div>

      <nav className="type-tabs" aria-label="Search in">
        <span>Search in:</span>
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            className={search.tab === id ? 'on' : ''}
            onClick={() => setSearch((s) => ({ ...s, tab: id }))}
          >
            {TAB_LABELS[id]}
            <em>{counts[id]}</em>
          </button>
        ))}
      </nav>

      <div
        className={workspaceClass}
        style={
          {
            '--filters-width': `${panelWidths.filters}px`,
            '--list-width': `${panelWidths.list}px`,
            '--chat-width': `${panelWidths.chat}px`,
          } as CSSProperties
        }
      >
        <FacetPanel
          state={search}
          collapsed={filtersCollapsed}
          onToggleCollapsed={() => setFiltersCollapsed((v) => !v)}
          onToggleValue={toggleFacet}
          onClearAll={() => setSearch((s) => ({ ...s, facets: {} }))}
          onClearGroup={(key) =>
            setSearch((s) => {
              const facets = { ...s.facets }
              delete facets[key]
              return { ...s, facets }
            })
          }
        />
        {!filtersCollapsed && (
          <ResizeHandle
            value={panelWidths.filters}
            onChange={(filters) => setPanelWidths((w) => ({ ...w, filters }))}
            label="Resize filters"
          />
        )}
        <ResultList
          items={results}
          state={listState}
          suggestedIds={suggestedIds}
          navMode={showDetailsPage}
          onSelect={selectItem}
          onCheck={(id) =>
            setSearch((s) => ({
              ...s,
              checkedIds: s.checkedIds.includes(id)
                ? s.checkedIds.filter((x) => x !== id)
                : [...s.checkedIds, id],
            }))
          }
          onCheckAll={() =>
            setSearch((s) => {
              const ids = results.map((r) => r.id)
              const all = ids.every((id) => s.checkedIds.includes(id))
              return { ...s, checkedIds: all ? [] : ids }
            })
          }
        />
        {showDetailsPage && (
          <ResizeHandle
            value={panelWidths.list}
            onChange={(list) => setPanelWidths((w) => ({ ...w, list }))}
            label="Resize nav list"
          />
        )}
        {showDetailsPage && <DetailsPage item={activeItem} />}
        {showChat && layout !== 'overlay' && (
          <ResizeHandle
            value={panelWidths.chat}
            onChange={(chat) => setPanelWidths((w) => ({ ...w, chat }))}
            invert
            label="Resize assistant"
          />
        )}
        {showChat && layout !== 'overlay' && (
          <ChatPanel
            messages={messages}
            busy={busy}
            contextItem={activeItem}
            onSend={send}
            onPickMention={selectItem}
            onClose={() => setChatOpen(false)}
          />
        )}
        {showChat && layout === 'overlay' && (
          <div className="chat-overlay">
            <ResizeHandle
              value={panelWidths.chat}
              onChange={(chat) => setPanelWidths((w) => ({ ...w, chat }))}
              invert
              label="Resize assistant"
            />
            <ChatPanel
              messages={messages}
              busy={busy}
              contextItem={activeItem}
              onSend={send}
              onPickMention={selectItem}
              onClose={() => setChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ToolbarBtn({
  icon,
  label,
  pressed,
  disabled,
  onClick,
}: {
  icon: ReactNode
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className={`tbtn ${pressed ? 'pressed' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}
