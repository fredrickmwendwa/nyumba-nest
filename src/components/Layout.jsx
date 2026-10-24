import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import SiteHeader from './SiteHeader.jsx'
import Footer from './Footer.jsx'

const positions = new Map()

// Restores scroll on Back, scrolls to top on new pages, and moves focus to the main region.
function RouteEffects() {
  const { pathname, key } = useLocation()
  const navType = useNavigationType()
  const previous = useRef(null)

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    const onScroll = () => positions.set(key, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [key])

  useEffect(() => {
    if (previous.current !== null && previous.current !== pathname) {
      if (navType === 'POP') {
        const y = positions.get(key) ?? 0
        const restore = () => window.scrollTo(0, y)
        restore()
        setTimeout(restore, 120)
        setTimeout(restore, 400)
      } else {
        window.scrollTo(0, 0)
        document.getElementById('main')?.focus({ preventScroll: true })
      }
    }
    previous.current = pathname
  }, [pathname, key, navType])

  return null
}

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <RouteEffects />
    </>
  )
}
