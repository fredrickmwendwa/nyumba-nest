import { useId, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { priceSteps, toSearchParams, parseFilters } from '../lib/filters.js'
import { formatKsh } from '../lib/format.js'
import { Button, Segmented } from './ui.jsx'
import { SelectField, TextField } from './Field.jsx'

const TYPES = [{ id: 'rent', label: 'Rent' }, { id: 'buy', label: 'Buy' }]
const BEDS = [['', 'Any'], ['0', 'Studio'], ['1', '1+'], ['2', '2+'], ['3', '3+'], ['4', '4+']]

// Hero search: sends the visitor to the results page with filters in the URL.
export default function SearchForm({ areas = [] }) {
  const navigate = useNavigate()
  const listId = useId()
  const [type, setType] = useState('rent')
  const [q, setQ] = useState('')
  const [max, setMax] = useState('')
  const [beds, setBeds] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const f = parseFilters(new URLSearchParams())
    const params = toSearchParams({ ...f, type, q: q.trim(), max: max ? Number(max) : null, beds: beds === '' ? null : Number(beds) })
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <form className="search" onSubmit={submit} role="search" aria-label="Search homes">
      <Segmented label="Rent or buy" value={type} options={TYPES} onChange={(t) => { setType(t); setMax('') }} />
      <div className="search__fields">
        <TextField label="Location" placeholder="Any area" value={q} onChange={(e) => setQ(e.target.value)} list={listId} autoComplete="off" />
        <datalist id={listId}>{areas.map((a) => <option key={a} value={a} />)}</datalist>
        <SelectField label="Max budget" value={max} onChange={(e) => setMax(e.target.value)}>
          <option value="">Any</option>
          {priceSteps(type).map((s) => <option key={s} value={s}>{formatKsh(s)}</option>)}
        </SelectField>
        <SelectField label="Bedrooms" value={beds} onChange={(e) => setBeds(e.target.value)}>
          {BEDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </SelectField>
      </div>
      <div className="search__foot">
        <p className="search__popular">
          Popular:{' '}
          {['Kilimani', 'Westlands', 'Ruaka', 'Syokimau'].map((a, i) => (
            <span key={a}>{i > 0 && ', '}<Link to={`/properties?type=rent&q=${encodeURIComponent(a)}`}>{a}</Link></span>
          ))}
        </p>
        <Button type="submit" variant="primary" className="search__submit">Search homes</Button>
      </div>
    </form>
  )
}
