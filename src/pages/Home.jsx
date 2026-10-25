import { Link } from 'react-router-dom'
import { useProperties } from '../context/PropertiesContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { areasOf } from '../lib/filters.js'
import { rentAffordability } from '../lib/calc.js'
import { formatKsh } from '../lib/format.js'
import { generalQuestion, whatsappUrl } from '../lib/contact.js'
import { agency, url } from '../config.js'
import SearchForm from '../components/SearchForm.jsx'
import PropertyCard, { locationLine } from '../components/PropertyCard.jsx'
import AffordabilityMeter, { BandBadge } from '../components/AffordabilityMeter.jsx'
import { Button, ErrorState, SkeletonCard } from '../components/ui.jsx'
import SafeImage from '../components/SafeImage.jsx'

function Hero({ areas, spotlight }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__text">
          <h1 id="hero-title" className="text-display">Find the door you want to open.</h1>
          <p className="text-lead hero__lead">Search rentals and homes for sale across Kilimani, Westlands, Ruaka and more. Check the monthly cost, save what you like, then ask to see it.</p>
        </div>
        <div className="hero__search"><SearchForm areas={areas} /></div>
        <div className="hero__art">
          <figure className="arch">
            <div className="arch__frame" />
            <div className="arch__photo">
              <img src={url('images/listings/hero.jpg')} alt="Living room with a curved sofa, seen through an arched frame" width="1200" height="900" decoding="async" />
            </div>
          </figure>
          {spotlight && (
            <div className="arch__card">
              <strong>{spotlight.title.split(',')[0]}</strong>
              <span>{spotlight.location.area} &middot; {formatKsh(spotlight.price.amount)}{spotlight.price.period ? ' / month' : ''}</span>
              <Link to={`/properties/${spotlight.slug}`}>View home<span className="visually-hidden">: {spotlight.title}</span></Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function AreaList({ properties }) {
  const rows = areasOf(properties)
    .map((area) => {
      const homes = properties.filter((p) => p.location.area === area)
      const rent = homes.filter((p) => p.transaction === 'rent').length
      return { area, count: homes.length, type: rent >= homes.length / 2 ? 'rent' : 'buy' }
    })
    .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area))
    .slice(0, 8)
  return (
    <ul className="area-list">
      {rows.map((r) => (
        <li key={r.area}>
          <Link to={`/properties?type=${r.type}&q=${encodeURIComponent(r.area)}`} className="area-list__row">
            <span className="area-list__name">{r.area}</span>
            <span className="area-list__count">{r.count} {r.count === 1 ? 'home' : 'homes'}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Home() {
  const { status, properties, retry } = useProperties()
  useDocumentMeta('Homes to rent and buy in Nairobi', 'Search apartments, maisonettes and houses to rent or buy in Kilimani, Westlands, Ruaka and more. Check affordability and request a viewing.')
  const featured = properties.filter((p) => p.featured).slice(0, 3)
  const example = rentAffordability({ rent: 85000, other: 0, income: 250000 })

  return (
    <>
      <Hero areas={areasOf(properties)} spotlight={featured[0]} />

      <section className="section container" aria-labelledby="featured-title">
        <div className="section__head">
          <h2 id="featured-title" className="text-page">Homes to look at first</h2>
          <Button to="/properties?type=rent" variant="outline">See all homes</Button>
        </div>
        {status === 'error' ? (
          <ErrorState onRetry={retry} />
        ) : (
          <ul className="grid" aria-busy={status === 'loading'}>
            {status === 'loading'
              ? [0, 1, 2].map((i) => <li key={i}><SkeletonCard /></li>)
              : featured.map((p) => <li key={p.id}><PropertyCard property={p} /></li>)}
          </ul>
        )}
        <p className="muted small section__note">All listings are demonstration content.</p>
      </section>

      <section className="section container split" aria-labelledby="areas-title">
        <div className="split__lead">
          <h2 id="areas-title" className="text-page">Start with where you want to live</h2>
          <p className="muted">Each area opens the results already filtered. Counts come from the sample listings.</p>
        </div>
        {status === 'ready' ? <AreaList properties={properties} /> : <div className="skeleton__line" style={{ height: 240 }} aria-hidden="true" />}
      </section>

      <section className="section container split split--center" aria-labelledby="how-title">
        <div className="split__lead">
          <h2 id="how-title" className="text-page">Four steps, nothing hidden</h2>
          <ol className="steps">
            <li><span><strong>Search</strong> by area, budget and bedrooms.</span></li>
            <li><span><strong>Save</strong> homes to a shortlist on this device.</span></li>
            <li><span><strong>Check the numbers</strong> with the rent or mortgage estimate.</span></li>
            <li><span><strong>Request a viewing.</strong> We prepare a WhatsApp message or email. Nothing is booked until the agency replies.</span></li>
          </ol>
          <Button to="/calculator" variant="outline" className="split__cta">Open the calculator</Button>
        </div>
        <div className="panel example" aria-label="Example rent estimate">
          <h3 className="text-card">Example: rent</h3>
          <dl className="example__inputs">
            <div><dt>Monthly rent</dt><dd>KSh 85,000</dd></div>
            <div><dt>Monthly income</dt><dd>KSh 250,000</dd></div>
          </dl>
          <p className="example__result"><span className="text-price">{Math.round(example.share * 100)}% of income</span> <BandBadge band={example.band} /></p>
          <AffordabilityMeter share={example.share} band={example.band} />
          <p className="muted small">A common rule of thumb, not advice. Try your own numbers in the calculator.</p>
        </div>
      </section>

      <section className="container cta-wrap" aria-labelledby="cta-title">
        <div className="cta">
          <div>
            <h2 id="cta-title" className="text-section">Prefer to talk it through?</h2>
            <p>Message the agency on WhatsApp, or open a home and request a viewing. This is a demonstration site, so the contact details are placeholders.</p>
          </div>
          <div className="cta__actions">
            <Button to="/properties?type=rent" variant="primary">Browse homes</Button>
            <Button href={whatsappUrl(`Hello ${agency.name}, I would like to ask about a home.`)} target="_blank" rel="noopener noreferrer" variant="on-dark">Message on WhatsApp</Button>
          </div>
        </div>
      </section>
    </>
  )
}
