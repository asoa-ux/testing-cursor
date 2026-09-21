import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

export function IconSearch(props: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconWorkflow(props: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="3" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="12" y="3" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="7" y="13" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7v2h10V7M10 9v4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function IconCollection(props: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M3 7.5 10 4l7 3.5v8L10 19l-7-3.5v-8Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 7.5 10 11l7-3.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function IconAction(props: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10 3.5v2.2M10 14.3v2.2M3.5 10h2.2M14.3 10h2.2M5.4 5.4l1.6 1.6M12.9 12.9l1.6 1.6M14.6 5.4l-1.6 1.6M7 12.9l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconExport(props: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M4 13v3h12v-3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 4v10M10 4 7 7M10 4l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function IconCustomize(props: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="6" r="1.4" fill="currentColor" />
      <circle cx="13" cy="10" r="1.4" fill="currentColor" />
      <circle cx="7" cy="14" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function IconDetails(props: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 4v12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function IconChat(props: P) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 5.5h12v8H8l-3.5 2.5V13.5H4v-8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconChevron(props: P) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M4 2.5 8 6 4 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function IconClose(props: P) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function IconBell(props: P) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 7.5a4 4 0 1 1 8 0c0 2.5 1 3.5 1 3.5H4s1-1 1-3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M8 14.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function IconGrid(props: P) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10" y="3" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="3" y="10" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10" y="10" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function IconGear(props: P) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9 3.2v1.6M9 13.2v1.6M3.2 9h1.6M13.2 9h1.6M5 5l1.1 1.1M11.9 11.9 13 13M13 5l-1.1 1.1M6.1 11.9 5 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconHelp(props: P) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.2 7.2a1.8 1.8 0 1 1 2.4 1.7c-.5.3-.8.7-.8 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="12.4" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function IconUser(props: P) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 14.2c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function IconSend(props: P) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconHamburger(props: P) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconBack(props: P) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path d="M11 4 6 9l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
