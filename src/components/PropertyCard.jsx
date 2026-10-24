import { Link } from 'react-router-dom'
import { areaLabel, bedroomLabel, priceParts } from '../lib/format.js'
import { Badge, Button } from './ui.jsx'
import SafeImage from './SafeImage.jsx'
import FavouriteButton from './FavouriteButton.jsx'

export const locationLine = (p) => {
  const { area, description } = p.location
  return description.toLowerCase().includes(area.toLowerCase()) ? description : `${description}, ${area}`
}

// Variants: grid (default), compact (horizontal, for similar homes) and saved (adds explicit actions).
export default function PropertyCard({ property: p, variant = 'grid', index, onRemove }) {
  const { amount, suffix } = priceParts(p)
  const to = `/properties/${p.slug}`
  return (
    <article className={`card card--${variant}`} data-index={index}>
      <div className="card__media">
        <SafeImage image={p.images[0]} ratio={variant === 'compact' ? '7 / 6' : '4 / 3'} />
        {variant !== 'compact' && <span className="card__badge"><Badge>{p.transaction === 'rent' ? 'For rent' : 'For sale'}</Badge></span>}
        {variant === 'grid' && <FavouriteButton property={p} className="card__fav" />}
      </div>
      <div className="card__body">
        <p className="price">
          <span>{amount}</span>
          {suffix && <small>{suffix}</small>}
        </p>
        <h3 className="card__title">
          <Link to={to} className="card__link">{p.title}</Link>
        </h3>
        <p className="card__location">{locationLine(p)}</p>
        <p className="card__meta">
          <span>{bedroomLabel(p.bedrooms)}</span>
          <span>{p.bathrooms} bath</span>
          <span>{areaLabel(p.floorArea)}</span>
        </p>
        {variant === 'saved' && (
          <div className="card__actions">
            <Button to={to} variant="secondary" size="sm">View home</Button>
            <Button variant="outline" size="sm" onClick={onRemove} aria-label={`Remove ${p.title} from saved`}>Remove</Button>
          </div>
        )}
      </div>
    </article>
  )
}
