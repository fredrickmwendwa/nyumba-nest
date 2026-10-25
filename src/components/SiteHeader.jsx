import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSaved } from '../context/SavedContext.jsx'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
import Dialog from './Dialog.jsx'

function useNav() {
  const { pathname, search } = useLocation()
  const buying = new URLSearchParams(search).get('type') === 'buy'
  const onList = pathname === '/properties'
  return [
    { label: 'Rent', to: '/properties?type=rent', current: onList && !buying },
    { label: 'Buy', to: '/properties?type=buy', current: onList && buying },
    { label: 'Calculator', to: '/calculator', current: pathname === '/calculator' },
    { label: 'About', to: '/about', current: pathname === '/about' },
  ]
}

export default function SiteHeader() {
  const [menu, setMenu] = useState(false)
  const { count } = useSaved()
  const nav = useNav()
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav className="site-nav" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} className="site-nav__link" aria-current={n.current ? 'page' : undefined}>{n.label}</Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <NavLink to="/saved" className="saved-link" aria-label={`Saved ${count}`}>
            <Icon name="heart" size={20} />
            <span className="saved-link__text">Saved</span>{' '}
            <span className="saved-link__count">{count}</span>
          </NavLink>
          <button type="button" className="menu-button" onClick={() => setMenu(true)} aria-haspopup="dialog" aria-expanded={menu}>Menu</button>
        </div>
      </div>
      <Dialog open={menu} onClose={() => setMenu(false)} label="Site menu" className="dialog--menu">
        <div className="menu">
          <div className="menu__head">
            <Logo markSize={32} />
            <button type="button" className="icon-button" onClick={() => setMenu(false)} aria-label="Close menu"><Icon name="x" /></button>
          </div>
          <nav aria-label="Menu">
            <ul className="menu__list">
              {nav.map((n) => (
                <li key={n.label}><Link to={n.to} aria-current={n.current ? 'page' : undefined} onClick={() => setMenu(false)}>{n.label}</Link></li>
              ))}
              <li><Link to="/saved" onClick={() => setMenu(false)}>Saved homes ({count})</Link></li>
            </ul>
          </nav>
        </div>
      </Dialog>
    </header>
  )
}
