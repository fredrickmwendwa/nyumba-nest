import { PAGE_SIZE, RENT_STEPS, BUY_STEPS } from '../config.js'
import { formatKsh } from './format.js'

const SORT_IDS = ['recommended', 'price-asc', 'price-desc', 'newest']
const int = (v) => (v !== null && v !== '' && Number.isFinite(Number(v)) ? Math.round(Number(v)) : null)

export function parseFilters(sp) {
  const sort = sp.get('sort')
  const beds = sp.get('beds')
  return {
    type: sp.get('type') === 'buy' ? 'buy' : 'rent',
    q: (sp.get('q') || '').trim(),
    min: int(sp.get('min')),
    max: int(sp.get('max')),
    beds: beds !== null && /^[0-4]$/.test(beds) ? Number(beds) : null,
    ptype: sp.get('ptype') || '',
    amenities: (sp.get('amenities') || '').split(',').filter(Boolean),
    sort: SORT_IDS.includes(sort) ? sort : 'recommended',
    page: Math.max(1, int(sp.get('page')) || 1),
  }
}

export function toSearchParams(f) {
  const sp = new URLSearchParams()
  sp.set('type', f.type)
  if (f.q) sp.set('q', f.q)
  if (f.min !== null) sp.set('min', String(f.min))
  if (f.max !== null) sp.set('max', String(f.max))
  if (f.beds !== null) sp.set('beds', String(f.beds))
  if (f.ptype) sp.set('ptype', f.ptype)
  if (f.amenities.length) sp.set('amenities', f.amenities.join(','))
  if (f.sort !== 'recommended') sp.set('sort', f.sort)
  if (f.page > 1) sp.set('page', String(f.page))
  return sp
}

const wanted = (f) => (f.type === 'buy' ? 'sale' : 'rent')

export function matches(p, f) {
  if (p.transaction !== wanted(f)) return false
  if (f.q) {
    const hay = `${p.title} ${p.location.area} ${p.location.description} ${p.propertyType}`.toLowerCase()
    if (!f.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false
  }
  if (f.min !== null && p.price.amount < f.min) return false
  if (f.max !== null && p.price.amount > f.max) return false
  if (f.beds !== null) {
    if (f.beds === 0 ? p.bedrooms !== 0 : p.bedrooms < f.beds) return false
  }
  if (f.ptype && p.propertyType !== f.ptype) return false
  if (f.amenities.length && !f.amenities.every((a) => p.amenities.includes(a))) return false
  return true
}

export function sortProperties(list, sort) {
  const out = [...list]
  const newest = (a, b) => b.listedAt.localeCompare(a.listedAt)
  if (sort === 'price-asc') out.sort((a, b) => a.price.amount - b.price.amount)
  else if (sort === 'price-desc') out.sort((a, b) => b.price.amount - a.price.amount)
  else if (sort === 'newest') out.sort(newest)
  else out.sort((a, b) => Number(b.featured) - Number(a.featured) || newest(a, b))
  return out
}

export const filterAndSort = (all, f) => sortProperties(all.filter((p) => matches(p, f)), f.sort)

export const visibleCount = (f) => f.page * PAGE_SIZE

// Filters shown as removable chips. Each has the patch that removes it.
export function activeFilters(f, typeLabel = (id) => id, amenityLabel = (id) => id) {
  const chips = []
  if (f.q) chips.push({ key: 'q', label: `"${f.q}"`, name: f.q, patch: { q: '' } })
  if (f.min !== null && f.max !== null) chips.push({ key: 'price', label: `${formatKsh(f.min)} to ${formatKsh(f.max)}`, name: 'price range', patch: { min: null, max: null } })
  else if (f.min !== null) chips.push({ key: 'min', label: `From ${formatKsh(f.min)}`, name: 'minimum price', patch: { min: null } })
  else if (f.max !== null) chips.push({ key: 'max', label: `Up to ${formatKsh(f.max)}`, name: 'maximum price', patch: { max: null } })
  if (f.beds !== null) chips.push({ key: 'beds', label: f.beds === 0 ? 'Studio' : `${f.beds}+ bedrooms`, name: 'bedrooms', patch: { beds: null } })
  if (f.ptype) chips.push({ key: 'ptype', label: typeLabel(f.ptype), name: 'property type', patch: { ptype: '' } })
  f.amenities.forEach((a) => chips.push({ key: `a-${a}`, label: amenityLabel(a), name: amenityLabel(a), patch: { amenities: f.amenities.filter((x) => x !== a) } }))
  return chips
}

export const priceSteps = (type) => (type === 'buy' ? BUY_STEPS : RENT_STEPS)

// If the maximum price is what leaves no results, find the nearest step that shows some.
export function suggestRaisedMax(all, f) {
  if (f.max === null) return null
  for (const step of priceSteps(f.type)) {
    if (step <= f.max) continue
    const count = all.filter((p) => matches(p, { ...f, max: step })).length
    if (count > 0) return { max: step, count }
  }
  return null
}

export const areasOf = (all) => [...new Set(all.map((p) => p.location.area))].sort()

export function similarTo(all, p, n = 3) {
  return all
    .filter((x) => x.id !== p.id && x.transaction === p.transaction)
    .map((x) => {
      let score = 0
      if (x.location.area === p.location.area) score += 3
      if (x.bedrooms === p.bedrooms) score += 2
      const ratio = Math.min(x.price.amount, p.price.amount) / Math.max(x.price.amount, p.price.amount)
      score += ratio * 2
      return { x, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((s) => s.x)
}
