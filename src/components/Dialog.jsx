import { useEffect, useRef } from 'react'

// Wraps the native <dialog> element: focus trap, Escape and inert background come from the browser.
export default function Dialog({ open, onClose, label, className = '', children, onKeyDown }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      document.documentElement.classList.add('is-locked')
    }
    if (!open && el.open) el.close()
    return () => document.documentElement.classList.remove('is-locked')
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-label={label}
      onClose={() => {
        document.documentElement.classList.remove('is-locked')
        onClose()
      }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      onKeyDown={onKeyDown}
    >
      {open ? children : null}
    </dialog>
  )
}
