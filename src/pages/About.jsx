import { agency } from '../config.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { Button, Alert } from '../components/ui.jsx'
import { whatsappUrl } from '../lib/contact.js'

const PRINCIPLES = [
  ['Specific listings', 'Each listing states the price, billing period, area and the amenities named in its description. No blanket claims about safety or water.'],
  ['Plain numbers', 'The calculators show their formula and what they leave out, so an estimate never looks like an offer.'],
  ['Honest next steps', 'Requesting a viewing prepares a message. We say so, and nothing is booked until the agency replies.'],
]

export default function About() {
  useDocumentMeta('About', 'How Nyumba Nest works: specific listings, plain affordability numbers and honest viewing requests. A fictional agency made for a design portfolio.')
  return (
    <>
      <section className="container about-hero">
        <div>
          <h1 className="text-display">Homes, explained plainly.</h1>
          <p className="text-lead muted about-hero__lead">Nyumba Nest helps people in Nairobi find a place they can imagine living in. We show the facts that matter, give you tools to check the numbers, and tell you what happens after you ask to see a home.</p>
          <div className="row-actions">
            <Button to="/properties?type=rent">Browse homes</Button>
            <Button href={whatsappUrl(`Hello ${agency.name}, I have a question.`)} target="_blank" rel="noopener noreferrer" variant="outline">Message on WhatsApp</Button>
          </div>
        </div>
        <Alert tone="info" title="A demonstration project">
          <p>Nyumba Nest is a fictional agency created for a design portfolio. The listings, phone number and email shown are sample content and do not represent real properties or people.</p>
        </Alert>
      </section>

      <section className="container section" aria-labelledby="principles">
        <h2 id="principles" className="visually-hidden">How we work</h2>
        <ul className="grid">
          {PRINCIPLES.map(([t, d]) => (
            <li key={t} className="panel"><h3 className="text-card">{t}</h3><p className="muted">{d}</p></li>
          ))}
        </ul>
      </section>

      <section className="container cta-wrap" aria-labelledby="contact">
        <div className="cta">
          <div>
            <h2 id="contact" className="text-section">Get in touch</h2>
            <p>Use WhatsApp for quick questions about a home, or email for longer ones.</p>
          </div>
          <ul className="contact-list">
            <li><strong>WhatsApp:</strong> {agency.displayPhone}</li>
            <li><strong>Email:</strong> {agency.email}</li>
            <li className="small">Placeholder details, set in one configuration file.</li>
          </ul>
        </div>
      </section>
    </>
  )
}
