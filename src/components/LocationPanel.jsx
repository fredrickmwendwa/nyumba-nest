import { useState } from 'react'
import { Button } from './ui.jsx'
import { Mark } from './Logo.jsx'

// The map loads only when asked, so no third-party request is made until the visitor chooses to. No API key needed.
export default function LocationPanel({ property }) {
  const [show, setShow] = useState(false)
  const { area, description, coordinates: c } = property.location

  if (!c) {
    const q = encodeURIComponent(`${area}, Nairobi, Kenya`)
    return (
      <div className="location">
        <div className="location__box location__box--text">
          <Mark size={32} />
          <p><strong>{area}</strong><br />{description}</p>
        </div>
        <Button variant="outline" href={`https://www.openstreetmap.org/search?query=${q}`} target="_blank" rel="noopener noreferrer">Search this area on the map</Button>
        <p className="muted small">Exact coordinates are not published for this listing.</p>
      </div>
    )
  }

  const bbox = [c.lng - 0.008, c.lat - 0.005, c.lng + 0.008, c.lat + 0.005].join('%2C')
  return (
    <div className="location">
      <div className="location__box">
        {show ? (
          <iframe title={`Map of ${area}`} loading="lazy" referrerPolicy="no-referrer" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${c.lat}%2C${c.lng}`} />
        ) : (
          <div className="location__ask">
            <p><strong>{area}</strong>, shown approximately</p>
            <Button variant="secondary" onClick={() => setShow(true)}>Load map</Button>
            <p className="muted small">Loading the map contacts OpenStreetMap.</p>
          </div>
        )}
      </div>
      <div className="row-actions">
        <Button variant="outline" href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=15/${c.lat}/${c.lng}`} target="_blank" rel="noopener noreferrer">Open in maps</Button>
        <p className="muted small">The exact address is shared when a viewing is arranged.</p>
      </div>
    </div>
  )
}
