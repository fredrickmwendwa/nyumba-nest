import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { url } from '../config.js'

const PropertiesContext = createContext(null)

export function PropertiesProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', properties: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch(url('data/properties.json'), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Unexpected data format')
        setState({ status: 'ready', properties: data })
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', properties: [] })
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading', properties: [] })
    setAttempt((n) => n + 1)
  }, [])
  const value = useMemo(() => ({ ...state, retry }), [state, retry])
  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>
}

export function useProperties() {
  const ctx = useContext(PropertiesContext)
  if (!ctx) throw new Error('useProperties must be used inside PropertiesProvider')
  return ctx
}
