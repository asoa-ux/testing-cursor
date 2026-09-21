import { useState } from 'react'
import { Thumb } from './Thumb'
import type { CatalogItem } from './types'

const TABS = ['Attributes', 'Compare', 'Assets', 'PDX'] as const

export function DetailsPage({ item }: { item: CatalogItem | null }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Attributes')

  if (!item) {
    return (
      <main className="details-page">
        <div className="details-empty">
          <h2>Select an item</h2>
          <p>Choose a result in the list to see its content here.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="details-page">
      <header className="details-head">
        <Thumb item={item} size={56} />
        <div className="details-ident">
          <p className="card-path">{item.path}</p>
          <h2>{item.name}</h2>
          <p className="more-info">{item.sku ?? item.superType}</p>
        </div>
      </header>

      <div className="details-widgets">
        <div className="widget completeness">
          <Donut value={item.completeness} />
          <div>
            <h3>Completeness</h3>
            {item.completenessBars.map((b) => (
              <div key={b.label} className="bar-row">
                <span>{b.label}</span>
                <div className="bar">
                  <i style={{ width: `${b.value}%` }} />
                </div>
                <em>{b.value}%</em>
              </div>
            ))}
            <button type="button" className="linkish">
              See more
            </button>
          </div>
        </div>
        {item.workflows.length > 0 && (
          <div className="widget workflows">
            <h3>Workflows</h3>
            {item.workflows.map((w) => (
              <p key={w.name}>
                {w.name}
                <span>{w.state}</span>
              </p>
            ))}
            <button type="button" className="linkish">
              View workflows
            </button>
          </div>
        )}
      </div>

      <nav className="details-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>

      <div className="details-body">
        {tab === 'Attributes' &&
          item.groups.map((g) => (
            <section key={g.name} className="attr-group">
              <h3>{g.name}</h3>
              {g.rows.map((r) => (
                <div key={r.label} className="attr-row">
                  <span>{r.label}</span>
                  <span>{r.value}</span>
                </div>
              ))}
            </section>
          ))}
        {tab === 'Compare' && (
          <p className="placeholder-copy">
            Compare is not in this prototype. Select two items with checkboxes in a later journey.
          </p>
        )}
        {tab === 'Assets' && (
          <p className="placeholder-copy">
            {item.relatedIds?.length
              ? `Linked objects: ${item.relatedIds.length}. Use the assistant to jump to related assets.`
              : 'No linked assets on this object.'}
          </p>
        )}
        {tab === 'PDX' && (
          <p className="placeholder-copy">Channel / PDX preview is out of scope for this exploration.</p>
        )}
      </div>
    </main>
  )
}

function Donut({ value }: { value: number }) {
  const deg = Math.round((value / 100) * 360)
  return (
    <div
      className="donut"
      style={{ background: `conic-gradient(var(--accent) ${deg}deg, #d8dee2 0deg)` }}
    >
      <div className="donut-hole">
        <strong>{value}%</strong>
        <span>Complete</span>
      </div>
    </div>
  )
}
