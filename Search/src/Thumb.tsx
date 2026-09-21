import type { CatalogItem } from './types'

export function Thumb({ item, size = 48 }: { item: CatalogItem; size?: number }) {
  const style = { width: size, height: size, background: item.swatch }
  if (item.thumbKind === 'asset') {
    return (
      <div className="thumb thumb-asset" style={style} aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <rect x="10" y="14" width="28" height="20" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.85)" />
          <circle cx="18" cy="22" r="3" fill="rgba(255,255,255,0.85)" />
          <path d="M14 32 22 24l6 5 8-9 4 12H14Z" fill="rgba(255,255,255,0.75)" />
        </svg>
      </div>
    )
  }
  if (item.thumbKind === 'folder') {
    return (
      <div className="thumb thumb-folder" style={style} aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="M10 18h10l3 3h15v13H10V18Z" fill="rgba(255,255,255,0.88)" />
          <path d="M10 21h28v13H10Z" fill="rgba(255,255,255,0.7)" />
        </svg>
      </div>
    )
  }
  if (item.thumbKind === 'org') {
    return (
      <div className="thumb thumb-org" style={style} aria-hidden="true">
        <span>{item.name.slice(0, 1)}</span>
      </div>
    )
  }
  if (item.thumbKind === 'apparel') {
    return (
      <div className="thumb" style={style} aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path
            d="M16 14 24 17l8-3 5 4-5 3v14H16V21l-5-3 5-4Z"
            fill="rgba(255,255,255,0.82)"
          />
        </svg>
      </div>
    )
  }
  return (
    <div className="thumb" style={style} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path
          d="M8 30c6-10 12-14 22-14 9 0 14 3 18 10v6H10l-2-2Z"
          fill="rgba(255,255,255,0.88)"
        />
        <path d="M10 32h30v3H12l-2-3Z" fill="rgba(0,0,0,0.18)" />
      </svg>
    </div>
  )
}
