import { generalQuestion, mailtoUrl, whatsappUrl } from '../lib/contact.js'
import { priceParts } from '../lib/format.js'
import { Button } from './ui.jsx'
import FavouriteButton from './FavouriteButton.jsx'
import Icon from './Icon.jsx'

export const estimateLink = (p) => `/calculator?mode=${p.transaction === 'rent' ? 'rent' : 'buy'}&price=${p.price.amount}&from=${p.slug}`

// Sticky panel on desktop.
export function EnquiryPanel({ property: p }) {
  const { amount, suffix } = priceParts(p)
  const q = generalQuestion(p)
  return (
    <aside className="enquiry" aria-label="Enquire about this home">
      <p className="price price--lg"><span>{amount}</span>{suffix && <small>{suffix}</small>}</p>
      <Button to={`/properties/${p.slug}/viewing`} variant="primary" block>Request a viewing</Button>
      <Button href={whatsappUrl(q)} target="_blank" rel="noopener noreferrer" variant="outline" block><Icon name="message" size={18} /> Message on WhatsApp</Button>
      <div className="enquiry__row">
        <FavouriteButton property={p} variant="text" />
        <Button href={mailtoUrl(`Question about ${p.title} (${p.id.toUpperCase()})`, q)} variant="text"><Icon name="mail" size={18} /> Email us</Button>
      </div>
      <Button to={estimateLink(p)} variant="text" className="enquiry__estimate">See monthly estimate</Button>
      <div className="enquiry__next">
        <strong>What happens next</strong>
        <ol>
          <li>Choose a time window.</li>
          <li>We prepare a message for WhatsApp or email.</li>
          <li>You send it, and the agency replies to arrange the viewing.</li>
        </ol>
      </div>
      <p className="small muted">Ref {p.id.toUpperCase()}. Sample listing; contact details are placeholders.</p>
    </aside>
  )
}

// Sticky bar below 1024 px: price and the single primary action.
export function StickyBar({ property: p }) {
  const { amount, suffix } = priceParts(p)
  return (
    <div className="stickybar">
      <p className="price"><span>{amount}</span>{suffix && <small>{suffix}</small>}</p>
      <Button to={`/properties/${p.slug}/viewing`} variant="primary">Request a viewing</Button>
    </div>
  )
}
