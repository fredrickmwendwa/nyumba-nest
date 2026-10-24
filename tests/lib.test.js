import { describe, it, expect } from 'vitest'
import { monthlyPayment, mortgageEstimate, rentAffordability, bandFor } from '../src/lib/calc.js'
import { normalisePhone, isEmail, validateViewing, buildViewingMessage, whatsappUrl } from '../src/lib/contact.js'
import { parseFilters, toSearchParams, matches, filterAndSort, suggestRaisedMax } from '../src/lib/filters.js'
import { parseMoney, groupDigits, formatKsh, viewingDates } from '../src/lib/format.js'

const sample = [
  { id: 'a', transaction: 'rent', propertyType: 'apartment', title: 'Two bedroom apartment, Kilimani', location: { area: 'Kilimani', description: 'Yaya' }, price: { amount: 85000 }, bedrooms: 2, amenities: ['lift', 'parking'], featured: true, listedAt: '2026-09-01' },
  { id: 'b', transaction: 'rent', propertyType: 'studio', title: 'Studio, South B', location: { area: 'South B', description: '' }, price: { amount: 28000 }, bedrooms: 0, amenities: [], featured: false, listedAt: '2026-10-01' },
  { id: 'c', transaction: 'sale', propertyType: 'house', title: 'House, Ruiru', location: { area: 'Ruiru', description: '' }, price: { amount: 18500000 }, bedrooms: 4, amenities: ['garden'], featured: false, listedAt: '2026-08-01' },
]

describe('calculators', () => {
  it('matches the worked mortgage example', () => {
    expect(Math.round(monthlyPayment(11600000, 13, 20))).toBe(135903)
  })
  it('handles a zero rate', () => {
    expect(monthlyPayment(1200000, 0, 10)).toBe(10000)
  })
  it('estimates a mortgage with income', () => {
    const r = mortgageEstimate({ price: 14500000, deposit: 2900000, rate: 13, years: 20, income: 450000, other: 15000 })
    expect(r.ok).toBe(true)
    expect(Math.round(r.monthlyCost)).toBe(150903)
    expect(Math.round(r.share * 100)).toBe(34)
  })
  it('rejects a deposit larger than the price', () => {
    const r = mortgageEstimate({ price: 100, deposit: 200, rate: 10, years: 5, income: null, other: null })
    expect(r.ok).toBe(false)
    expect(r.errors.deposit).toBeTruthy()
  })
  it('rejects invalid rates and terms', () => {
    const r = mortgageEstimate({ price: 100, deposit: 0, rate: 90, years: 0, income: null, other: null })
    expect(r.errors.rate && r.errors.years).toBeTruthy()
  })
  it('computes rent affordability and bands', () => {
    const r = rentAffordability({ rent: 85000, other: 6000, income: 250000 })
    expect(r.total).toBe(91000)
    expect(r.remaining).toBe(159000)
    expect(r.band.id).toBe('tight')
    expect(bandFor(0.29).id).toBe('comfortable')
    expect(bandFor(0.41).id).toBe('stretched')
  })
  it('asks for missing rent inputs instead of returning zeros', () => {
    expect(rentAffordability({ rent: null, other: null, income: 0 }).ok).toBe(false)
  })
})

describe('contact helpers', () => {
  it('normalises Kenyan phone numbers', () => {
    expect(normalisePhone('0712 345 678')).toBe('+254712345678')
    expect(normalisePhone('+254 112 345 678')).toBe('+254112345678')
    expect(normalisePhone('254712345678')).toBe('+254712345678')
    expect(normalisePhone('12345')).toBe(null)
  })
  it('validates emails', () => {
    expect(isEmail('a@b.co')).toBe(true)
    expect(isEmail('a@b')).toBe(false)
  })
  it('requires an email only for the email route', () => {
    const v = { name: 'Wanjiru Kamau', phone: '0712345678', email: '', date: '2026-11-07', window: 'morning', message: '' }
    expect(validateViewing(v, 'whatsapp', ['2026-11-07'])).toEqual({})
    expect(validateViewing(v, 'email', ['2026-11-07']).email).toBeTruthy()
  })
  it('builds an encoded WhatsApp link with the message', () => {
    const p = { id: 'nn-001', title: 'Two bedroom apartment, Kilimani', price: { amount: 85000, period: 'month' } }
    const msg = buildViewingMessage(p, { name: 'Wanjiru', phone: '0712345678', email: '', window: 'morning', message: '' }, 'Sat 7 Nov')
    expect(msg).toContain('NN-001')
    expect(msg).toContain('+254712345678')
    expect(whatsappUrl(msg)).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  })
})

describe('filters', () => {
  it('round-trips URL params', () => {
    const f = parseFilters(new URLSearchParams('type=buy&max=20000000&beds=3&amenities=garden,lift&sort=price-asc&page=2'))
    expect(f).toMatchObject({ type: 'buy', max: 20000000, beds: 3, sort: 'price-asc', page: 2 })
    expect(toSearchParams(f).toString()).toContain('amenities=garden%2Clift')
  })
  it('defaults to rent and recommended', () => {
    const f = parseFilters(new URLSearchParams(''))
    expect(f.type).toBe('rent')
    expect(f.sort).toBe('recommended')
  })
  it('filters by type, price, bedrooms and amenities', () => {
    const base = parseFilters(new URLSearchParams('type=rent'))
    expect(filterAndSort(sample, base).map((p) => p.id)).toEqual(['a', 'b'])
    expect(filterAndSort(sample, { ...base, max: 30000 }).map((p) => p.id)).toEqual(['b'])
    expect(filterAndSort(sample, { ...base, beds: 0 }).map((p) => p.id)).toEqual(['b'])
    expect(filterAndSort(sample, { ...base, beds: 2 }).map((p) => p.id)).toEqual(['a'])
    expect(matches(sample[0], { ...base, amenities: ['lift', 'garden'] })).toBe(false)
    expect(matches(sample[0], { ...base, q: 'yaya kilimani' })).toBe(true)
  })
  it('sorts by price', () => {
    const base = parseFilters(new URLSearchParams('sort=price-asc'))
    expect(filterAndSort(sample, base).map((p) => p.id)).toEqual(['b', 'a'])
  })
  it('suggests a higher maximum when the cap leaves no results', () => {
    const f = { ...parseFilters(new URLSearchParams('type=rent')), max: 20000 }
    expect(suggestRaisedMax(sample, f)).toEqual({ max: 30000, count: 1 })
  })
})

describe('format helpers', () => {
  it('parses and groups money input', () => {
    expect(parseMoney('KSh 1,250,000')).toBe(1250000)
    expect(parseMoney('')).toBe(null)
    expect(groupDigits('1250000')).toBe('1,250,000')
    expect(formatKsh(85000)).toBe('KSh 85,000')
  })
  it('lists 30 viewing dates starting tomorrow', () => {
    const d = viewingDates(new Date(2026, 9, 24), 30)
    expect(d).toHaveLength(30)
    expect(d[0]).toEqual({ value: '2026-10-25', label: 'Sun 25 Oct' })
  })
})
