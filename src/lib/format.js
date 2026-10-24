export const formatNumber = (n) => Math.round(n).toLocaleString('en-US')
export const formatKsh = (n) => `KSh ${formatNumber(n)}`

export function priceParts(property) {
  return {
    amount: formatKsh(property.price.amount),
    suffix: property.price.period === 'month' ? '/ month' : '',
  }
}

export function bedroomLabel(n) {
  return n === 0 ? 'Studio' : `${n} bed`
}

export const areaLabel = (fa) => (fa ? `${formatNumber(fa.value)} sq m` : 'Area not stated')

// Parses "1,250,000" or "KSh 1250000" into a number. Returns null for empty or invalid input.
export function parseMoney(text) {
  if (text === null || text === undefined) return null
  const cleaned = String(text).replace(/[^\d.]/g, '')
  if (cleaned === '' || cleaned === '.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export const groupDigits = (text) => {
  const digits = String(text).replace(/[^\d]/g, '')
  return digits === '' ? '' : Number(digits).toLocaleString('en-US')
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const dateLabel = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`

// The next `count` days starting tomorrow.
export function viewingDates(from = new Date(), count = 30) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i + 1)
    return { value: toIso(d), label: dateLabel(d) }
  })
}
