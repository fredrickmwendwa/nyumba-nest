import { useState } from 'react'
import { Segmented, Button } from './ui.jsx'
import Icon from './Icon.jsx'
import { AmenityChecks, BedroomSelect, PriceFields, SearchBox, TypeSelect } from './filterControls.jsx'

const TYPES = [{ id: 'rent', label: 'Rent' }, { id: 'buy', label: 'Buy' }]

// Desktop bar (from 1024 px) and the compact bar for smaller screens share one set of controls.
export default function FilterBar({ f, update, drawerCount, onOpenSheet }) {
  const [more, setMore] = useState(false)
  return (
    <div className="filters">
      <div className="filters__compact">
        <Segmented label="Rent or buy" value={f.type} options={TYPES} onChange={(type) => update({ type })} />
        <SearchBox value={f.q} onCommit={(q) => update({ q })} />
        <Button variant="secondary" className="filters__open" onClick={onOpenSheet} aria-haspopup="dialog">
          <Icon name="sliders" size={18} /> Filters{drawerCount > 0 ? ` (${drawerCount})` : ''}
        </Button>
      </div>
      <div className="filters__full">
        <Segmented label="Rent or buy" value={f.type} options={TYPES} onChange={(type) => update({ type })} />
        <SearchBox value={f.q} onCommit={(q) => update({ q })} />
        <PriceFields f={f} onChange={update} />
        <BedroomSelect f={f} onChange={update} />
        <TypeSelect f={f} onChange={update} />
        <Button variant="outline" onClick={() => setMore((m) => !m)} aria-expanded={more} aria-controls="more-filters">
          More filters{f.amenities.length ? ` (${f.amenities.length})` : ''}
        </Button>
      </div>
      {more && (
        <div id="more-filters" className="filters__more">
          <AmenityChecks f={f} onChange={update} />
        </div>
      )}
    </div>
  )
}
