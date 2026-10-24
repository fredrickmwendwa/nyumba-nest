import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STORAGE_KEY } from '../config.js'

const SavedContext = createContext(null)

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return { slugs: Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [], persistent: true }
  } catch {
    return { slugs: [], persistent: false }
  }
}

export function SavedProvider({ children }) {
  const [{ slugs, persistent }, setState] = useState(readStorage)
  const [removedCount, setRemovedCount] = useState(0)
  const persistentRef = useRef(persistent)

  const write = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      persistentRef.current = true
      return true
    } catch {
      persistentRef.current = false
      return false
    }
  }, [])

  const commit = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev.slugs) : updater
        const ok = write(next)
        return { slugs: next, persistent: ok }
      })
    },
    [write],
  )

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setState(readStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isSaved = useCallback((slug) => slugs.includes(slug), [slugs])
  const add = useCallback((slug) => commit((s) => (s.includes(slug) ? s : [...s, slug])), [commit])
  const remove = useCallback((slug) => commit((s) => s.filter((x) => x !== slug)), [commit])
  const toggle = useCallback((slug) => commit((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug])), [commit])
  const clear = useCallback(() => commit([]), [commit])

  // Drops saved slugs that no longer exist in the listing data.
  const prune = useCallback(
    (validSlugs) => {
      const valid = new Set(validSlugs)
      setState((prev) => {
        const kept = prev.slugs.filter((s) => valid.has(s))
        if (kept.length === prev.slugs.length) return prev
        setRemovedCount((n) => n + (prev.slugs.length - kept.length))
        write(kept)
        return { ...prev, slugs: kept }
      })
    },
    [write],
  )

  const value = useMemo(
    () => ({ slugs, count: slugs.length, persistent, isSaved, add, remove, toggle, clear, prune, removedCount, dismissRemoved: () => setRemovedCount(0) }),
    [slugs, persistent, isSaved, add, remove, toggle, clear, prune, removedCount],
  )
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used inside SavedProvider')
  return ctx
}
