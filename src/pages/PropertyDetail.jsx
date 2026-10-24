import { useParams } from 'react-router-dom'
import { AMENITIES } from '../config.js'
import { useProperties } from '../context/PropertiesContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { similarTo } from '../lib/filters.js'
import { areaLabel, formatKsh, priceParts } from '../lib/format.js'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import Gallery from '../components/Gallery.jsx'
import { EnquiryPanel, StickyBar, estimateLink } from '../components/EnquiryPanel.jsx'
import LocationPanel from '../components/LocationPanel.jsx'
import PropertyCard, { locationLine } from '../components/PropertyCard.jsx'
import FavouriteButton from '../components/FavouriteButton.jsx'
import { Badge, Button, ErrorState } from '../components/ui.jsx'
import NotFound from './NotFound.jsx'

function DetailSkeleton() {
  return (
    <div className="container detail" aria-busy="true">
      <div className="skeleton__line" style={{ height: 320, marginTop: 24 }} />
      <div className="skeleton__line" style={{ height: 40, width: '60%', marginTop: 24 }} />
      <p className="visually-hidden" role="status">Loading home</p>
    </div>
  )
}

export default function PropertyDetail() {
  const { slug } = useParams()
  const { status, properties, retry } = useProperties()
  const p = properties.find((x) => x.slug === slug)

  useDocumentMeta(p ? p.title : status === 'ready' ? 'Home not found' : 'Loading home', p ? `${p.summary} ${p.description[0]}`.slice(0, 158) : undefined)

  if (status === 'loading') return <DetailSkeleton />
  if (status === 'error') return <div className="container"><ErrorState onRetry={retry} /></div>
  if (!p) return <NotFound kind="home" slug={slug} />

  const rent = p.transaction === 'rent'
  const { amount, suffix } = priceParts(p)
  const similar = similarTo(properties, p)
  const listPath = `/properties?type=${rent ? 'rent' : 'buy'}`

  const facts = [
    ['Bedrooms', p.bedrooms === 0 ? 'Studio' : p.bedrooms],
    ['Bathrooms', p.bathrooms],
    ['Floor area', areaLabel(p.floorArea)],
  ]
  const terms = rent
    ? [['Deposit', p.deposit ? formatKsh(p.deposit) : 'Not stated'], ['Service charge', p.serviceCharge ? `${formatKsh(p.serviceCharge)} a month` : 'Not stated'], ['Billing', 'Monthly']]
    : [['Asking price', formatKsh(p.price.amount)], ['Service charge', p.serviceCharge ? `${formatKsh(p.serviceCharge)} a month` : 'Not stated'], ['Type', p.propertyType]]

  return (
    <div className="container detail">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: rent ? 'Homes to rent' : 'Homes for sale', to: listPath }, { label: p.location.area, to: `${listPath}&q=${encodeURIComponent(p.location.area)}` }, { label: p.title }]} />
      <div className="detail__grid">
        <div className="detail__main">
          <Gallery images={p.images} />

          <header className="detail__head">
            <div className="detail__badges">
              <Badge>{rent ? 'For rent' : 'For sale'}</Badge>
              {p.isDemo && <Badge tone="outline">Demonstration listing</Badge>}
            </div>
            <h1 className="text-page">{p.title}</h1>
            <p className="muted">{locationLine(p)}, Nairobi</p>
            <div className="detail__mobile-price">
              <p className="price price--lg"><span>{amount}</span>{suffix && <small>{suffix}</small>}</p>
              <FavouriteButton property={p} variant="text" />
            </div>
          </header>

          <dl className="facts">
            {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>

          <section aria-labelledby="about-title" className="detail__section">
            <h2 id="about-title" className="text-section">About this home</h2>
            {p.description.map((para, i) => <p key={i}>{para}</p>)}
          </section>

          <section aria-labelledby="amenities-title" className="detail__section">
            <h2 id="amenities-title" className="text-section">Amenities</h2>
            {p.amenities.length ? (
              <ul className="amenities">{p.amenities.map((a) => <li key={a}>{AMENITIES[a] ?? a}</li>)}</ul>
            ) : <p className="muted">No amenities are listed.</p>}
            <p className="muted small">Only amenities stated in the listing are shown.</p>
          </section>

          <section aria-labelledby="terms-title" className="detail__section">
            <h2 id="terms-title" className="text-section">Good to know</h2>
            <dl className="facts facts--terms">
              {terms.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <Button to={estimateLink(p)} variant="text" className="detail__estimate">See monthly estimate</Button>
          </section>

          <section aria-labelledby="location-title" className="detail__section">
            <h2 id="location-title" className="text-section">Location</h2>
            <LocationPanel property={p} />
          </section>
        </div>

        <div className="detail__side"><EnquiryPanel property={p} /></div>
      </div>

      {similar.length > 0 && (
        <section className="detail__similar" aria-labelledby="similar-title">
          <h2 id="similar-title" className="text-section">Similar homes</h2>
          <ul className="grid">{similar.map((s) => <li key={s.id}><PropertyCard property={s} /></li>)}</ul>
        </section>
      )}
      <StickyBar property={p} />
    </div>
  )
}
