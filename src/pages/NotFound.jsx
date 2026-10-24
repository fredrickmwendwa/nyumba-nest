import { Link } from 'react-router-dom'
import { useProperties } from '../context/PropertiesContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { areasOf } from '../lib/filters.js'
import { Mark } from '../components/Logo.jsx'
import { Button } from '../components/ui.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import SearchForm from '../components/SearchForm.jsx'

// kind "page": unknown URL. kind "home": a listing slug that does not exist.
export default function NotFound({ kind = 'page', slug = '' }) {
  const { properties } = useProperties()
  useDocumentMeta(kind === 'home' ? 'Home not found' : 'Page not found')
  const areas = areasOf(properties)
  const guess = areas.find((a) => slug.includes(a.toLowerCase().replace(/\s+/g, '-')))
  const nearby = guess ? properties.filter((p) => p.location.area === guess).slice(0, 3) : []

  return (
    <div className="container notfound">
      <Mark size={88} className="notfound__mark" />
      <h1 className="text-display">{kind === 'home' ? 'We could not find that home' : 'We could not find that page'}</h1>
      <p className="text-lead muted">
        {kind === 'home' ? 'It may have been rented or sold, or the link has changed.' : 'The link may be old, or the home may no longer be listed. Search again, or head to one of these.'}
      </p>
      {kind === 'page' && <SearchForm areas={areas} />}
      <div className="notfound__links">
        {guess && <Button to={`/properties?type=rent&q=${encodeURIComponent(guess)}`} variant="primary">More homes in {guess}</Button>}
        <Button to="/properties?type=rent" variant="outline">Homes to rent</Button>
        <Button to="/properties?type=buy" variant="outline">Homes for sale</Button>
        <Button to="/calculator" variant="outline">Calculator</Button>
        <Button to="/saved" variant="outline">Saved homes</Button>
      </div>
      {nearby.length > 0 && (
        <section className="notfound__nearby" aria-labelledby="nearby-title">
          <h2 id="nearby-title" className="text-section">Other homes in {guess}</h2>
          <ul className="grid">{nearby.map((p) => <li key={p.id}><PropertyCard property={p} /></li>)}</ul>
        </section>
      )}
    </div>
  )
}
