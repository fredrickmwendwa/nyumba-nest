import { Badge } from './ui.jsx'

// Housing-cost meter: bands are always written as text as well as drawn.
export default function AffordabilityMeter({ share, band }) {
  const pct = Math.round(share * 100)
  const marker = Math.min(Math.max(share * 100, 7), 93)
  return (
    <div className="meter">
      <div className="meter__bar" role="img" aria-label={`${pct} percent of income. ${band.label}.`}>
        <i className="meter__seg meter__seg--ok" />
        <i className="meter__seg meter__seg--tight" />
        <i className="meter__seg meter__seg--over" />
      </div>
      <div className="meter__marker" style={{ left: `${marker}%` }} aria-hidden="true"><span>{pct}%</span></div>
      <ul className="meter__legend">
        <li>Under 30%: Comfortable</li>
        <li>30 to 40%: Tight</li>
        <li>Over 40%: Stretched</li>
      </ul>
    </div>
  )
}

export const BandBadge = ({ band }) => <Badge tone={band.tone}>{band.label}</Badge>
