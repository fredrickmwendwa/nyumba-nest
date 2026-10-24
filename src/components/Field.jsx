import { useId } from 'react'
import Icon from './Icon.jsx'

function Wrap({ id, label, hint, error, children, className = '' }) {
  return (
    <div className={`field ${className}${error ? ' is-invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
    </div>
  )
}

const describedBy = (id, hint, error) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

export function TextField({ label, hint, error, className, inputRef, prefix, ...rest }) {
  const id = useId()
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className}>
      <div className="input-wrap">
        {prefix && <span className="input-prefix" aria-hidden="true">{prefix}</span>}
        <input id={id} ref={inputRef} className={`input${prefix ? ' input--prefixed' : ''}`} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
      </div>
    </Wrap>
  )
}

export function SelectField({ label, hint, error, className, children, selectRef, ...rest }) {
  const id = useId()
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className}>
      <select id={id} ref={selectRef} className="input input--select" aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy(id, hint, error)} {...rest}>{children}</select>
    </Wrap>
  )
}

export function TextAreaField({ label, hint, error, className, ...rest }) {
  const id = useId()
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className}>
      <textarea id={id} className="input input--area" rows={4} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
    </Wrap>
  )
}
