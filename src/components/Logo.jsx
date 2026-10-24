import { Link } from 'react-router-dom'

// Two nested arches: a doorway inside a doorway, which also reads as an "n".
export function Mark({ size = 32, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 36V19a14 14 0 0 1 28 0v17" />
      <path d="M15 36V20a5 5 0 0 1 10 0v16" />
    </svg>
  )
}

export default function Logo({ markSize = 36, className = '', showWordmark = true }) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Nyumba Nest, home">
      <Mark size={markSize} />
      {showWordmark && <span className="logo__word">nyumba nest</span>}
    </Link>
  )
}
