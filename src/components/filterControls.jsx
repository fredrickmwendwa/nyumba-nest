import { useEffect, useState } from 'react'
import { AMENITIES, PROPERTY_TYPES } from '../config.js'
import { priceSteps } from '../lib/filters.js'
import { formatKsh } from '../lib/format.js'
import { SelectField, TextField } from './Field.jsx'

export const BED_OPTIONS = [
  { v: '', label: 'Any' },
  { v: '0', label: 'Studio' },
  { v: '1', label: '1+' },
  { v: '2', label: '2+' },
  { v: '3', label: '3+' },
  { v: '4', label: '4+' },
]

// Search text with a short delay, so the URL and results update once the person pauses.
export function SearchBox({ value, onCommit, label = 'Location or keyword' }) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
  useEffect(() => {
    if (text === value) return undefined
    const t = setTimeout(() => onCommit(text.trim()), 300)
    return () => clearTimeout(t)
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <TextField
      label={label}
      type="search"
      placeholder="Any area"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onCommit(text.trim()) } }}
      autoComplete="off"
      enterKeyHint="search"
    />
  )
}

function PriceSelect({ label, type, value, onChange }) {
  const steps = priceSteps(type)
  const custom = value !== null && !steps.includes(value)
  return (
    <SelectField label={label} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      <option value="">Any</option>
      {[...steps, ...(custom ? [value] : [])].sort((a, b) => a - b).map((s) => <option key={s} value={s}>{formatKsh(s)}</option>)}
    </SelectField>
  )
}

// Keeps min and max consistent: choosing a minimum above the maximum clears the maximum, and the reverse.
export function priceChange(f, which, value) {
  const patch = { [which]: value }
  if (which === 'min' && value !== null && f.max !== null && value > f.max) patch.max = null
  if (which === 'max' && value !== null && f.min !== null && value < f.min) patch.min = null
  return patch
}

export function PriceFields({ f, onChange }) {
  return (
    <>
      <PriceSelect label="Min price" type={f.type} value={f.min} onChange={(v) => onChange(priceChange(f, 'min', v))} />
      <PriceSelect label="Max price" type={f.type} value={f.max} onChange={(v) => onChange(priceChange(f, 'max', v))} />
    </>
  )
}

export function BedroomSelect({ f, onChange }) {
  return (
    <SelectField label="Bedrooms" value={f.beds === null ? '' : String(f.beds)} onChange={(e) => onChange({ beds: e.target.value === '' ? null : Number(e.target.value) })}>
      {BED_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
    </SelectField>
  )
}

export function TypeSelect({ f, onChange }) {
  return (
    <SelectField label="Type" value={f.ptype} onChange={(e) => onChange({ ptype: e.target.value })}>
      <option value="">Any</option>
      {PROPERTY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
    </SelectField>
  )
}

export function AmenityChecks({ f, onChange }) {
  const toggle = (id) => onChange({ amenities: f.amenities.includes(id) ? f.amenities.filter((a) => a !== id) : [...f.amenities, id] })
  return (
    <fieldset className="checks">
      <legend>Amenities (home must have all selected)</legend>
      <div className="checks__grid">
        {Object.entries(AMENITIES).map(([id, label]) => (
          <label key={id} className="check">
            <input type="checkbox" checked={f.amenities.includes(id)} onChange={() => toggle(id)} />
            <span className="check__box" aria-hidden="true" />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
