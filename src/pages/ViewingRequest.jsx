import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { agency, VIEWING_WINDOWS } from '../config.js'
import { useProperties } from '../context/PropertiesContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { buildViewingMessage, isEmail, mailtoUrl, validateViewing, viewingSubject, whatsappUrl } from '../lib/contact.js'
import { areaLabel, bedroomLabel, priceParts, viewingDates } from '../lib/format.js'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import SafeImage from '../components/SafeImage.jsx'
import Icon from '../components/Icon.jsx'
import { Alert, Badge, Button, ErrorState } from '../components/ui.jsx'
import { SelectField, TextAreaField, TextField } from '../components/Field.jsx'
import NotFound from './NotFound.jsx'

const EMPTY = { name: '', phone: '', email: '', date: '', window: 'morning', message: '' }
const ORDER = ['name', 'phone', 'email', 'date', 'window']

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      document.body.removeChild(ta)
    }
  }
}

export default function ViewingRequest() {
  const { slug } = useParams()
  const { status, properties, retry } = useProperties()
  const p = properties.find((x) => x.slug === slug)
  const dates = useMemo(() => viewingDates(new Date(), 30), [])
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [stage, setStage] = useState({ name: 'form' })
  const [copied, setCopied] = useState('')
  const summaryRef = useRef(null)
  const headingRef = useRef(null)
  const formRef = useRef(null)

  useDocumentMeta(p ? `Request a viewing: ${p.title}` : 'Request a viewing', 'Prepare a viewing request for WhatsApp or email. Nothing is booked until the agency replies.')

  useEffect(() => { if (stage.name !== 'form') headingRef.current?.focus() }, [stage.name])

  if (status === 'loading') return <div className="container detail"><p role="status">Loading home</p></div>
  if (status === 'error') return <div className="container"><ErrorState onRetry={retry} /></div>
  if (!p) return <NotFound kind="home" slug={slug} />

  const { amount, suffix } = priceParts(p)
  const set = (k) => (e) => { setValues((v) => ({ ...v, [k]: e.target.value })); if (errors[k]) setErrors((er) => { const n = { ...er }; delete n[k]; return n }) }
  const dateText = (v) => dates.find((d) => d.value === v.date)?.label ?? ''

  const openWhatsApp = (text) => {
    const w = window.open(whatsappUrl(text), '_blank')
    if (w) { try { w.opener = null } catch { /* ignore */ } return true }
    return false
  }

  const submit = (route) => {
    const errs = validateViewing(values, route, dates.map((d) => d.value))
    setErrors(errs)
    if (Object.keys(errs).length) {
      setTimeout(() => summaryRef.current?.focus(), 0)
      return
    }
    const text = buildViewingMessage(p, values, dateText(values))
    if (route === 'whatsapp') {
      setStage(openWhatsApp(text) ? { name: 'ready', route, text } : { name: 'failed', route, text })
    } else {
      window.location.assign(mailtoUrl(viewingSubject(p), text))
      setStage({ name: 'ready', route, text })
    }
  }

  const copy = async (text) => setCopied((await copyText(text)) ? 'Message copied.' : 'Could not copy. Select the text above and copy it.')

  const emailInstead = (text) => {
    if (!isEmail(values.email)) {
      setErrors({ email: 'Enter a full email address, such as name@example.com.' })
      setStage({ name: 'form' })
      return
    }
    window.location.assign(mailtoUrl(viewingSubject(p), text))
    setStage({ name: 'ready', route: 'email', text })
  }

  const errorList = ORDER.filter((k) => errors[k]).map((k) => errors[k])

  const summary = (
    <aside className="summary" aria-label="Selected home">
      <div className="summary__card card">
        <SafeImage image={p.images[0]} ratio="16 / 9" />
        <div className="card__body">
          <Badge>{p.transaction === 'rent' ? 'For rent' : 'For sale'}</Badge>
          <p className="price"><span>{amount}</span>{suffix && <small>{suffix}</small>}</p>
          <strong>{p.title}</strong>
          <p className="muted small">{bedroomLabel(p.bedrooms)}, {p.bathrooms} bath, {areaLabel(p.floorArea)}</p>
          <Link to={`/properties/${p.slug}`} className="link-small">Change property</Link>
        </div>
      </div>
      <div className="panel panel--tight">
        <strong>What happens next</strong>
        <ol className="small muted">
          <li>You send the prepared message.</li>
          <li>The agency replies to confirm a time.</li>
          <li>Nothing is booked until you get that reply.</li>
        </ol>
      </div>
    </aside>
  )

  const crumbs = <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: p.title, to: `/properties/${p.slug}` }, { label: 'Request a viewing' }]} />

  if (stage.name !== 'form') {
    const failed = stage.name === 'failed'
    const viaEmail = stage.route === 'email'
    return (
      <div className="container viewing">
        {crumbs}
        <div className="viewing__grid">
          <div className="viewing__main handoff">
            <h1 className="text-page" ref={headingRef} tabIndex={-1}>{failed ? 'We could not open WhatsApp' : 'Your message is ready'}</h1>
            {failed ? (
              <Alert tone="warning" role="alert">Your browser may have blocked it, or WhatsApp is not installed. Nothing has been sent.</Alert>
            ) : viaEmail ? (
              <Alert tone="success">Your email app should have opened with a draft. We cannot tell whether it did. <strong>We only receive it once you send it.</strong></Alert>
            ) : (
              <Alert tone="success">WhatsApp should have opened with your message. <strong>We only receive it once you send it.</strong></Alert>
            )}
            <div className="panel preview">
              <strong>Message preview</strong>
              <p>{stage.text}</p>
            </div>
            <div className="row-actions">
              <Button variant="secondary" onClick={() => copy(stage.text)}><Icon name="copy" size={18} /> Copy message</Button>
              {failed ? (
                <Button variant="outline" href={whatsappUrl(stage.text)} target="_blank" rel="noopener noreferrer">Open WhatsApp on the web</Button>
              ) : viaEmail ? (
                <Button variant="outline" href={mailtoUrl(viewingSubject(p), stage.text)}>Open email draft again</Button>
              ) : (
                <Button variant="outline" onClick={() => { if (!openWhatsApp(stage.text)) setStage({ name: 'failed', route: 'whatsapp', text: stage.text }) }}>Open WhatsApp again</Button>
              )}
            </div>
            <p className="small muted" role="status">{copied}</p>
            <div className="row-actions">
              {(failed || !viaEmail) && <Button variant="text" onClick={() => emailInstead(stage.text)}>{failed ? 'Prepare email instead' : 'Send by email instead'}</Button>}
              {viaEmail && <Button variant="text" onClick={() => { const t = stage.text; if (!openWhatsApp(t)) setStage({ name: 'failed', route: 'whatsapp', text: t }); else setStage({ name: 'ready', route: 'whatsapp', text: t }) }}>Send on WhatsApp instead</Button>}
              <Button variant="text" onClick={() => { setStage({ name: 'form' }); setCopied('') }}>Edit details</Button>
              <Button to={`/properties/${p.slug}`} variant="text">Back to the home</Button>
            </div>
            {failed && <p className="small muted">Placeholder contact: {agency.displayPhone}, {agency.email}</p>}
          </div>
          {summary}
        </div>
      </div>
    )
  }

  return (
    <div className="container viewing">
      {crumbs}
      <div className="viewing__grid">
        <div className="viewing__main">
          <h1 className="text-page">Request a viewing</h1>
          <p className="muted viewing__lead">Tell us when suits you. We prepare the message; you send it on WhatsApp or by email, and the agency replies to arrange a time.</p>

          {errorList.length > 0 && (
            <Alert tone="error" title={`Fix ${errorList.length} ${errorList.length === 1 ? 'thing' : 'things'} before sending`} ref={summaryRef} tabIndex={-1} role="alert">
              <ul className="alert__list">{errorList.map((m) => <li key={m}>{m}</li>)}</ul>
            </Alert>
          )}

          <form ref={formRef} noValidate onSubmit={(e) => { e.preventDefault(); submit('whatsapp') }} className="form">
            <div className="form__pair">
              <TextField label="Full name" name="name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
              <TextField label="Phone number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+254 712 345 678" hint="Used for the WhatsApp message" value={values.phone} onChange={set('phone')} error={errors.phone} />
            </div>
            <TextField label="Email (only needed to send by email)" name="email" type="email" autoComplete="email" placeholder="name@example.com" value={values.email} onChange={set('email')} error={errors.email} />
            <SelectField label="Preferred date" name="date" hint="Dates in the next 30 days" value={values.date} onChange={set('date')} error={errors.date} className="form__date">
              <option value="">Choose a date</option>
              {dates.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </SelectField>

            <fieldset className="windows">
              <legend>Preferred time</legend>
              <div className="windows__row">
                {VIEWING_WINDOWS.map((w) => (
                  <label key={w.id} className={`window${values.window === w.id ? ' is-on' : ''}`}>
                    <input type="radio" name="window" value={w.id} checked={values.window === w.id} onChange={set('window')} />
                    <strong>{w.label}</strong>
                    <span>{w.hours}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <TextAreaField label="Message (optional)" name="message" placeholder="Anything the agency should know" value={values.message} onChange={set('message')} maxLength={500} />

            <div className="form__actions">
              <Button type="submit" variant="primary"><Icon name="message" size={18} /> Send on WhatsApp</Button>
              <Button variant="outline" onClick={() => submit('email')}><Icon name="mail" size={18} /> Prepare email</Button>
            </div>
            <p className="small muted form__privacy">Privacy: your details are used only to write the message on this device. They are not saved or sent to a server by this site. Sending the message shares them with the agency through the app you choose.</p>
          </form>
        </div>
        {summary}
      </div>
    </div>
  )
}
