import { Link } from 'react-router-dom'
import { agency } from '../config.js'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo markSize={32} />
          <p>Homes to rent and buy in Nairobi.</p>
        </div>
        <nav aria-label="Explore">
          <h2 className="site-footer__title">Explore</h2>
          <ul>
            <li><Link to="/properties?type=rent">Rent</Link></li>
            <li><Link to="/properties?type=buy">Buy</Link></li>
            <li><Link to="/calculator">Calculator</Link></li>
            <li><Link to="/saved">Saved</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="site-footer__title">Company</h2>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><a href={`https://wa.me/${agency.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href={`mailto:${agency.email}`}>Email</a></li>
          </ul>
        </nav>
        <div>
          <h2 className="site-footer__title">Demonstration site</h2>
          <p>Nyumba Nest is a fictional agency made for a design portfolio. Listings, phone number and email are sample content.</p>
        </div>
      </div>
    </footer>
  )
}
