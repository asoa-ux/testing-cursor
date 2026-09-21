import { matchedPhrase } from './lib/search'
import { Thumb } from './Thumb'
import type { CatalogItem, SearchState } from './types'

export function ResultList({
  items,
  state,
  suggestedIds,
  navMode,
  onSelect,
  onCheck,
  onCheckAll,
}: {
  items: CatalogItem[]
  state: SearchState
  suggestedIds: string[]
  navMode?: boolean
  onSelect: (id: string) => void
  onCheck: (id: string) => void
  onCheckAll: () => void
}) {
  const allChecked = items.length > 0 && items.every((i) => state.checkedIds.includes(i.id))
  const suggested = new Set(suggestedIds)

  return (
    <section className={`results ${navMode ? 'results-nav' : ''}`}>
      <header className="results-head">
        <div>
          <h2>{items.length} results</h2>
          <label className="select-all">
            <input type="checkbox" checked={allChecked} onChange={onCheckAll} />
            Select All
          </label>
        </div>
      </header>
      <div className="result-scroll">
        {items.map((item) => {
          const active = state.activeId === item.id
          const checked = state.checkedIds.includes(item.id)
          return (
            <article
              key={item.id}
              className={`card ${active ? 'active' : ''} ${suggested.has(item.id) ? 'suggested' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <label className="card-check" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={checked} onChange={() => onCheck(item.id)} />
              </label>
              <Thumb item={item} size={navMode ? 40 : 48} />
              <div className="card-body">
                <div className="card-title-row">
                  <h3>{item.name}</h3>
                  {suggested.has(item.id) && <span className="badge">Assistant pick</span>}
                </div>
                <p className="card-path">{item.path}</p>
                {!navMode && (
                  <>
                    <p className="card-match">
                      <span>Matched phrase</span> {matchedPhrase(item, state.query)}
                    </p>
                    <dl className="card-attrs">
                      {item.attributes.slice(0, 4).map((a) => (
                        <div key={a.label}>
                          <dt>{a.label}</dt>
                          <dd>{a.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </div>
            </article>
          )
        })}
        {items.length === 0 && (
          <p className="empty-results">No items match the current query and filters.</p>
        )}
      </div>
      <footer className="results-foot">
        {items.length} items, {state.checkedIds.length} selected
      </footer>
    </section>
  )
}
