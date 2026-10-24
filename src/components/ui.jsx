import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

// A button that renders as a router link, an external anchor or a native button.
export function Button({ variant = 'primary', size, block, to, href, className = '', children, ...rest }) {
  const cls = `btn btn--${variant}${size ? ` btn--${size}` : ''}${block ? ' btn--block' : ''} ${className}`.trim()
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button type="button" className={cls} {...rest}>{children}</button>
}

export const Badge = ({ tone = 'brand', children }) => <span className={`tag tag--${tone}`}>{children}</span>

export function Chip({ label, name, onRemove }) {
  return (
    <span className="chip">
      {label}
      <button type="button" className="chip__remove" onClick={onRemove} aria-label={`Remove ${name || label} filter`}>
        <Icon name="x" size={16} />
      </button>
    </span>
  )
}

export function Segmented({ label, value, options, onChange }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className={value === o.id ? 'is-on' : ''} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

const ALERT_ICON = { error: 'alert', warning: 'alert', success: 'check', info: 'info' }
export function Alert({ tone = 'info', title, children, className = '', ...rest }) {
  return (
    <div className={`alert alert--${tone} ${className}`} {...rest}>
      <span className="alert__icon" aria-hidden="true"><Icon name={ALERT_ICON[tone]} size={16} /></span>
      <div>
        {title && <strong className="alert__title">{title}</strong>}
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, children, actions, mark }) {
  return (
    <div className="empty">
      {mark}
      <h2 className="text-section">{title}</h2>
      {children && <p className="text-lead muted">{children}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  )
}

export function ErrorState({ title = 'We could not load the listings', onRetry, children }) {
  return (
    <div className="empty empty--error" role="alert">
      <h2 className="text-section">{title}</h2>
      <p className="text-lead muted">{children || 'Check your connection and try again, or message us on WhatsApp.'}</p>
      <div className="empty__actions">
        {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="skeleton__img" />
      <div className="card__body">
        <div className="skeleton__line" style={{ width: '55%', height: 24 }} />
        <div className="skeleton__line" style={{ width: '90%', height: 18 }} />
        <div className="skeleton__line" style={{ width: '45%', height: 14 }} />
      </div>
    </div>
  )
}
