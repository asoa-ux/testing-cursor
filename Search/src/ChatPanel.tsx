import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { FACET_LABELS } from './data/catalog'
import { IconClose, IconSend } from './icons'
import { Thumb } from './Thumb'
import type { CatalogItem, ChatMessage, FacetKey } from './types'

const STARTERS = [
  'Find red running shoes in size 42',
  'Show approved Nike footwear',
  'Black running shoes, size 44',
]

export function ChatPanel({
  messages,
  busy,
  contextItem,
  onSend,
  onPickMention,
  onClose,
}: {
  messages: ChatMessage[]
  busy: boolean
  contextItem: CatalogItem | null
  onSend: (text: string) => void
  onPickMention: (id: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, busy])

  function submit(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    setDraft('')
    onSend(text)
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = draft.trim()
      if (!text || busy) return
      setDraft('')
      onSend(text)
    }
  }

  const last = messages.filter((m) => m.role === 'assistant').at(-1)
  const suggestions = last?.suggestions?.length ? last.suggestions : STARTERS

  return (
    <aside className="chat">
      <header className="chat-head">
        <div>
          <strong>Assistant</strong>
          <p>Maps natural language onto Search</p>
        </div>
        <button type="button" className="icon-quiet" onClick={onClose} aria-label="Close assistant">
          <IconClose />
        </button>
      </header>

      {contextItem && (
        <div className="chat-context">
          <Thumb item={contextItem} size={28} />
          <span>
            <em>Viewing</em>
            {contextItem.name}
          </span>
        </div>
      )}

      <div className="chat-log">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>
              Ask for products the way a specialist would say it. I will fill the query box, type tab, and
              facets on the left so you can see the mapping.
            </p>
            <div className="suggestions">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => onSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <article key={m.id} className={`bubble ${m.role}`}>
            {m.text.split('\n').map((line, i) => (
              <p key={`${m.id}-${i}`}>{line}</p>
            ))}
            {m.applied && (
              <div className="applied">
                <span>Applied to Search</span>
                {m.applied.query && <em>Query · {m.applied.query}</em>}
                <em>
                  Tab · {m.applied.tab === 'product' ? 'Products' : m.applied.tab} · {m.applied.resultCount}{' '}
                  hits
                </em>
                {(Object.keys(m.applied.facets) as FacetKey[]).map((k) =>
                  m.applied?.facets[k]?.length ? (
                    <em key={k}>
                      {FACET_LABELS[k]} · {m.applied.facets[k]?.join(', ')}
                    </em>
                  ) : null,
                )}
              </div>
            )}
            {m.mentions && m.mentions.length > 0 && (
              <div className="mentions">
                {m.mentions.map((hit) => (
                  <button key={hit.id} type="button" onClick={() => onPickMention(hit.id)}>
                    {hit.name}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
        {busy && (
          <article className="bubble assistant thinking">
            <span />
            <span />
            <span />
          </article>
        )}
        <div ref={endRef} />
      </div>

      {messages.length > 0 && !busy && (
        <div className="suggestions bar">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => onSend(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={submit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="Find red running shoes in size 42"
          rows={2}
        />
        <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
          <IconSend />
        </button>
      </form>
    </aside>
  )
}
