import { useMemo, useState } from 'react'
import { FACET_LABELS } from './data/catalog'
import { IconClose, IconSearch } from './icons'
import { facetValues } from './lib/search'
import type { FacetKey, SearchState } from './types'

const GROUPS: FacetKey[] = ['brand', 'color', 'size', 'category', 'status', 'gender']

export function FacetPanel({
  state,
  collapsed,
  onToggleCollapsed,
  onToggleValue,
  onClearAll,
  onClearGroup,
}: {
  state: SearchState
  collapsed: boolean
  onToggleCollapsed: () => void
  onToggleValue: (key: FacetKey, value: string) => void
  onClearAll: () => void
  onClearGroup: (key: FacetKey) => void
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    brand: true,
    color: true,
    size: true,
    category: false,
    status: false,
    gender: false,
  })
  const [brandQuery, setBrandQuery] = useState('')

  const chips = useMemo(() => {
    const list: { key: FacetKey; value: string }[] = []
    for (const key of GROUPS) {
      for (const value of state.facets[key] ?? []) list.push({ key, value })
    }
    return list
  }, [state.facets])

  if (collapsed) {
    return (
      <aside className="facets facets-collapsed">
        <button className="facets-rail" type="button" onClick={onToggleCollapsed} title="Open filters">
          Filters
        </button>
      </aside>
    )
  }

  return (
    <aside className="facets">
      <header className="facets-head">
        <strong>Filters</strong>
        <button type="button" className="icon-quiet" onClick={onToggleCollapsed} aria-label="Collapse filters">
          ‹
        </button>
      </header>
      {chips.length > 0 && (
        <div className="chip-block">
          <button type="button" className="linkish" onClick={onClearAll}>
            Clear all
          </button>
          <div className="chips">
            {chips.map((c) => (
              <button
                key={`${c.key}-${c.value}`}
                type="button"
                className="chip"
                onClick={() => onToggleValue(c.key, c.value)}
              >
                {c.value}
                <IconClose />
              </button>
            ))}
          </div>
        </div>
      )}
      {GROUPS.map((key) => {
        let values = facetValues(key, state)
        if (key === 'brand' && brandQuery.trim()) {
          const q = brandQuery.toLowerCase()
          values = values.filter((v) => v.value.toLowerCase().includes(q))
        }
        const selectedCount = state.facets[key]?.length ?? 0
        const isOpen = open[key] !== false
        return (
          <section key={key} className="facet-group">
            <div className="facet-label">
              <button
                type="button"
                className="facet-label-toggle"
                onClick={() => setOpen((s) => ({ ...s, [key]: !isOpen }))}
              >
                {FACET_LABELS[key]}
              </button>
              <span className="facet-label-right">
                {selectedCount > 0 && (
                  <button type="button" className="linkish" onClick={() => onClearGroup(key)}>
                    Clear ({selectedCount})
                  </button>
                )}
                <button
                  type="button"
                  className="icon-quiet"
                  onClick={() => setOpen((s) => ({ ...s, [key]: !isOpen }))}
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  <span className={`chev ${isOpen ? 'up' : ''}`}>▾</span>
                </button>
              </span>
            </div>
            {isOpen && (
              <div className="facet-body">
                {key === 'brand' && (
                  <label className="facet-search">
                    <input
                      value={brandQuery}
                      onChange={(e) => setBrandQuery(e.target.value)}
                      placeholder="Search"
                    />
                    <IconSearch />
                  </label>
                )}
                {values.map((v) => {
                  const checked = state.facets[key]?.includes(v.value) ?? false
                  return (
                    <label key={v.value} className="facet-option">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleValue(key, v.value)}
                      />
                      <span className="facet-option-name">{v.value}</span>
                      <span className="facet-count">{v.count}</span>
                    </label>
                  )
                })}
                {values.length === 0 && <p className="facet-empty">No values</p>}
              </div>
            )}
          </section>
        )
      })}
    </aside>
  )
}
