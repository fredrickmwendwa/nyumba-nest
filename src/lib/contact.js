import { agency, VIEWING_WINDOWS } from '../config.js'
import { formatKsh } from './format.js'

// Accepts 07xx, 01xx, 2547xx, 2541xx and +2547xx formats. Returns +254 form or null.
export function normalisePhone(input) {
  const raw = String(input || '').replace(/[\s\-().]/g, '')
  const m = raw.match(/^(?:\+254|254|0)([71]\d{8})$/)
  return m ? `+254${m[1]}` : null
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim())

export function priceText(p) {
  return `${formatKsh(p.price.amount)}${p.price.period === 'month' ? ' / month' : ''}`
}

export function validateViewing(values, route, validDates) {
  const errors = {}
  if (values.name.trim().length < 2) errors.name = 'Enter your full name.'
  if (!normalisePhone(values.phone)) errors.phone = 'Enter a Kenyan number, for example +254 712 345 678.'
  if (route === 'email' && !isEmail(values.email)) errors.email = 'Enter a full email address, such as name@example.com.'
  if (values.email.trim() && !isEmail(values.email)) errors.email = 'Enter a full email address, such as name@example.com.'
  if (!values.date || !validDates.includes(values.date)) errors.date = 'Choose a date in the next 30 days.'
  if (!VIEWING_WINDOWS.some((w) => w.id === values.window)) errors.window = 'Choose a time window.'
  return errors
}

export function buildViewingMessage(property, values, dateText) {
  const win = VIEWING_WINDOWS.find((w) => w.id === values.window)
  const parts = [
    `Hello ${agency.name}, I would like to request a viewing of ${property.title} (ref ${property.id.toUpperCase()}, ${priceText(property)}).`,
    `Preferred time: ${dateText}, ${win ? win.label.toLowerCase() : ''}.`,
    `Name: ${values.name.trim()}.`,
    `Phone: ${normalisePhone(values.phone)}.`,
  ]
  if (values.email.trim()) parts.push(`Email: ${values.email.trim()}.`)
  if (values.message.trim()) parts.push(`Message: ${values.message.trim()}`)
  return parts.join(' ')
}

export const whatsappUrl = (text) => `https://wa.me/${agency.whatsappNumber}?text=${encodeURIComponent(text)}`

export const mailtoUrl = (subject, body) =>
  `mailto:${agency.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export const viewingSubject = (p) => `Viewing request: ${p.title} (${p.id.toUpperCase()})`

export const generalQuestion = (p) =>
  `Hello ${agency.name}, I have a question about ${p.title} (ref ${p.id.toUpperCase()}, ${priceText(p)}).`
