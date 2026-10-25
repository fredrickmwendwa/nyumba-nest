import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AMENITIES, PAGE_SIZE, PROPERTY_TYPES, SORTS } from '../config.js'
import { useProperties } from '../context/PropertiesContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { activeFilters, filterAndSort, parseFilters, suggestRaisedMax, toSearchParams } from '../lib/filters.js'
import { formatKsh } from '../lib/format.js'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import FilterBar from '../components/FilterBar.jsx'
import FilterSheet from '../components/FilterSheet.jsx'
import PropertyCard from '../components/PropertyCard.jsx'
import { Button, Chip, EmptyState, ErrorState, SkeletonCard } from '../components/ui.jsx'
import { SelectField } from '../components/Field.jsx'

const typeLabel = (id) => PROPERTY_TYPES.find((t) => t.id === id)?.label ?? id
const plural = (n) => `${n} ${n === 1 ? 'home' : 'homes'}`

export default function Listings() {
  const [sp, setSp] = useSearchParams()
  const f = useMemo(() => parseFilters(sp), [sp])
  const { status, properties, retry } = useProperties()
  const [sheet, setSheet] = useState(false)
  const focusIndex = useRef(null)

  const update = useCallback(
    (patch, keepPage = false) => {
      setSp(
        (prev) => {
          const cur = parseFilters(prev)
          const next = { ...cur, ...patch }
          if (!keepPage) next.page = 1
          if (patch.type && patch.type !== cur.type) { next.min = null; next.max = null }
          return toSearchParams(next)
        },
        { replace: true },
      )
    },
    [setSp],
  )

  const results = useMemo(() => filterAndSort(properties, f), [properties, f])
  const visible = results.slice(0, f.page * PAGE_SIZE)
  const chips = activeFilters(f, typeLabel, (id) => AMENITIES[id] ?? id)
  const drawerCount = chips.filter((c) => c.key !== 'q').length
  const rent = f.type === 'rent'
  const heading = rent ? 'Homes to rent' : 'Homes for sale'

  useDocumentMeta(
    f.q ? `${heading} matching "${f.q}"` : `${heading} in Nairobi`,
    status === 'ready' ? `${plural(results.length)} ${rent ? 'to rent' : 'for sale'} in Nairobi and around. Filter by area, price, bedrooms and amenities.` : undefined,
  )

  const loadMore = () => {
    focusIndex.current = visible.length
    update({ page: f.page + 1 }, true)
  }
  useEffect(() => {
    if (focusIndex.current === null) return
    document.querySelector(`[data-index="${focusIndex.current}"] .card__link`)?.focus()
    focusIndex.current = null
  }, [visible.length])

  const resetAll = () => update({ q: '', min: null, max: null, beds: null, ptype: '', amenities: [] })
  const removeChip = (c) => update(c.patch)
  const suggestion = status === 'ready' && results.length === 0 ? suggestRaisedMax(properties, f) : null

  const countText = status === 'loading' ? 'Loading homes' : status === 'error' ? '' : chips.length ? `${plural(results.length)} match your filters` : `${plural(results.length)} ${rent ? 'to rent' : 'for sale'}`

  return (
    <div className="container listings">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: heading }]} />
      <div className="listings__head">
        <h1 className="text-page">{heading}</h1>
        <p className="muted listings__count" role="status">{countText}</p>
      </div>

      <FilterBar f={f} update={update} drawerCount={drawerCount} onOpenSheet={() => setSheet(true)} />

      <div className="listings__tools">
        <div className="chips" role="group" aria-label="Active filters">
          {chips.map((c) => <Chip key={c.key} label={c.label} name={c.name} onRemove={() => removeChip(c)} />)}
          {chips.length > 0 && <Button variant="text" size="sm" onClick={resetAll}>Reset all</Button>}
        </div>
        <SelectField className="sort" label="Sort" value={f.sort} onChange={(e) => update({ sort: e.target.value })}>
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </SelectField>
      </div>

      <h2 className="visually-hidden">Results</h2>
      {status === 'error' && <ErrorState onRetry={retry} />}

      {status === 'loading' && (
        <ul className="grid" aria-busy="true">{[0, 1, 2, 3, 4, 5].map((i) => <li key={i}><SkeletonCard /></li>)}</ul>
      )}

      {status === 'ready' && results.length === 0 && (
        <EmptyState
          title="No homes match these filters"
          actions={
            <>
              <Button variant="primary" onClick={resetAll}>Reset all filters</Button>
              <Button to={`/properties?type=${rent ? 'buy' : 'rent'}`} variant="outline">Browse homes {rent ? 'for sale' : 'to rent'}</Button>
            </>
          }
        >
          {chips.length > 0 ? 'Your filters leave no results. Remove one to see more.' : 'There are no homes in this category yet.'}
        </EmptyState>
      )}
      {status === 'ready' && results.length === 0 && (
        <div className="noresults">
          {chips.length > 0 && <div className="chips">{chips.map((c) => <Chip key={c.key} label={c.label} name={c.name} onRemove={() => removeChip(c)} />)}</div>}
          {suggestion && (
            <p className="muted">
              Try this: raising the maximum to {formatKsh(suggestion.max)} shows {plural(suggestion.count)}.{' '}
              <button type="button" className="link-button" onClick={() => update({ max: suggestion.max })}>Raise the maximum</button>
            </p>
          )}
        </div>
      )}

      {status === 'ready' && results.length > 0 && (
        <>
          <ul className="grid">
            {visible.map((p, i) => <li key={p.id}><PropertyCard property={p} index={i} /></li>)}
          </ul>
          <div className="loadmore">
            <p className="muted">Showing {visible.length} of {plural(results.length)}</p>
            <div className="loadmore__bar" aria-hidden="true"><i style={{ width: `${(visible.length / results.length) * 100}%` }} /></div>
            {visible.length < results.length && <Button variant="outline" onClick={loadMore}>Load more homes</Button>}
          </div>
        </>
      )}

      <FilterSheet open={sheet} onClose={() => setSheet(false)} f={f} properties={properties} onApply={(d) => update({ type: d.type, q: d.q.trim(), min: d.min, max: d.max, beds: d.beds, ptype: d.ptype, amenities: d.amenities })} />
    </div>
  )
}
