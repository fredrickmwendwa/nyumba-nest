import { useEffect, useState } from 'react'
import { PROPERTY_TYPES } from '../config.js'
import { matches } from '../lib/filters.js'
import Dialog from './Dialog.jsx'
import Icon from './Icon.jsx'
import { Button, Segmented } from './ui.jsx'
import { TextField } from './Field.jsx'
import { AmenityChecks, BED_OPTIONS, PriceFields, priceChange } from './filterControls.jsx'

const TYPES = [{ id: 'rent', label: 'Rent' }, { id: 'buy', label: 'Buy' }]

function ChoiceGroup({ legend, options, value, onChange }) {
  return (
    <fieldset className="choices">
      <legend>{legend}</legend>
      <div className="choices__row">
        {options.map((o) => (
          <button key={o.v} type="button" className={`choice${value === o.v ? ' is-on' : ''}`} aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.label}</button>
        ))}
      </div>
    </fieldset>
  )
}

// Bottom sheet on phones, side drawer on tablets. Changes apply when the person presses the button.
export default function FilterSheet({ open, onClose, f, properties, onApply }) {
  const [draft, setDraft] = useState(f)
  useEffect(() => { if (open) setDraft(f) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const count = properties.filter((p) => matches(p, draft)).length
  const reset = () => setDraft((d) => ({ ...d, q: '', min: null, max: null, beds: null, ptype: '', amenities: [] }))

  return (
    <Dialog open={open} onClose={onClose} label="Filters" className="dialog--sheet">
      <form className="sheet" onSubmit={(e) => { e.preventDefault(); onApply(draft); onClose() }}>
        <div className="sheet__head">
          <h2 className="text-card">Filters</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close filters"><Icon name="x" /></button>
        </div>
        <div className="sheet__body">
          <Segmented label="Rent or buy" value={draft.type} options={TYPES} onChange={(type) => setDraft((d) => ({ ...d, type, min: null, max: null }))} />
          <TextField label="Location or keyword" type="search" placeholder="Any area" value={draft.q} onChange={(e) => set({ q: e.target.value })} autoComplete="off" />
          <div className="sheet__pair"><PriceFields f={draft} onChange={(patch) => set(patch)} /></div>
          <ChoiceGroup legend="Bedrooms" options={BED_OPTIONS} value={draft.beds === null ? '' : String(draft.beds)} onChange={(v) => set({ beds: v === '' ? null : Number(v) })} />
          <ChoiceGroup legend="Property type" options={[{ v: '', label: 'Any' }, ...PROPERTY_TYPES.map((t) => ({ v: t.id, label: t.label }))]} value={draft.ptype} onChange={(v) => set({ ptype: v })} />
          <AmenityChecks f={draft} onChange={set} />
        </div>
        <div className="sheet__foot">
          <Button variant="outline" onClick={reset}>Reset</Button>
          <Button type="submit" variant="primary" className="sheet__apply" disabled={count === 0}>
            {count === 0 ? 'No homes match' : `Show ${count} ${count === 1 ? 'home' : 'homes'}`}
          </Button>
        </div>
        <p className="visually-hidden" role="status">{count} {count === 1 ? 'home matches' : 'homes match'}</p>
      </form>
    </Dialog>
  )
}

export { priceChange }
