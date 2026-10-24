import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const paused = useRef(false)

  const dismiss = useCallback(() => {
    clearTimeout(timer.current)
    setToast(null)
  }, [])

  const schedule = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (!paused.current) setToast(null)
    }, 5000)
  }, [])

  const show = useCallback(
    (next) => {
      setToast({ ...next, id: Date.now() })
      schedule()
    },
    [schedule],
  )

  useEffect(() => () => clearTimeout(timer.current), [])
  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div
            className="toast"
            key={toast.id}
            onMouseEnter={() => { paused.current = true }}
            onMouseLeave={() => { paused.current = false; schedule() }}
            onFocus={() => { paused.current = true }}
            onBlur={() => { paused.current = false; schedule() }}
          >
            <span>{toast.message}</span>
            {toast.action && toast.action.to && (
              <Link className="toast__action" to={toast.action.to} onClick={dismiss}>{toast.action.label}</Link>
            )}
            {toast.action && toast.action.onClick && (
              <button type="button" className="toast__action" onClick={() => { toast.action.onClick(); dismiss() }}>{toast.action.label}</button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
