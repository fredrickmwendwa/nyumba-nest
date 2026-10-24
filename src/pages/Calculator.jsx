import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProperties } from '../context/PropertiesContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { mortgageEstimate, rentAffordability } from '../lib/calc.js'
import { formatKsh, groupDigits, parseMoney } from '../lib/format.js'
import { TextField } from '../components/Field.jsx'
import AffordabilityMeter, { BandBadge } from '../components/AffordabilityMeter.jsx'
import { Alert, Button, Segmented } from '../components/ui.jsx'

const MODES = [{ id: 'rent', label: 'Rent' }, { id: 'buy', label: 'Mortgage' }]
const RENT_EXAMPLE = { rent: '85,000', other: '6,000', income: '250,000' }
const BUY_EXAMPLE = { price: '14,500,000', deposit: '2,900,000', rate: '13', years: '20', income: '450,000', other: '15,000' }

function Money({ label, hint, value, onChange, onBlur, error }) {
  return <TextField label={label} hint={hint} error={error} inputMode="numeric" autoComplete="off" prefix="KSh" value={value} onChange={(e) => onChange(groupDigits(e.target.value))} onBlur={onBlur} />
}

export default function Calculator() {
  const [sp, setSp] = useSearchParams()
  const mode = sp.get('mode') === 'buy' ? 'buy' : 'rent'
  const urlPrice = Number(sp.get('price')) || null
  const from = sp.get('from')
  const { properties } = useProperties()
  const fromProp = properties.find((p) => p.slug === from)

  const [rent, setRent] = useState({ rent: mode === 'rent' && urlPrice ? groupDigits(urlPrice) : '', other: '', income: '' })
  const [buy, setBuy] = useState({
    price: mode === 'buy' && urlPrice ? groupDigits(urlPrice) : '',
    deposit: mode === 'buy' && urlPrice ? groupDigits(Math.round(urlPrice * 0.2)) : '',
    rate: '13', years: '20', income: '', other: '',
  })
  const [touched, setTouched] = useState({})
  const [announce, setAnnounce] = useState('')

  useDocumentMeta('Affordability calculator', 'Check what a rental costs against your income, or estimate a monthly mortgage repayment in KSh. Estimates only, not financial advice.')

  const v = mode === 'rent' ? rent : buy
  const setV = (k) => (val) => (mode === 'rent' ? setRent((s) => ({ ...s, [k]: val })) : setBuy((s) => ({ ...s, [k]: val })))
  const blur = (k) => () => setTouched((t) => ({ ...t, [`${mode}.${k}`]: true }))

  const res = mode === 'rent'
    ? rentAffordability({ rent: parseMoney(rent.rent), other: parseMoney(rent.other), income: parseMoney(rent.income) })
    : mortgageEstimate({ price: parseMoney(buy.price), deposit: parseMoney(buy.deposit), rate: parseMoney(buy.rate), years: parseMoney(buy.years), income: parseMoney(buy.income), other: parseMoney(buy.other) })

  // Show a field's error once it has been left, or as soon as it holds an invalid value.
  const err = {}
  if (!res.ok) for (const [k, msg] of Object.entries(res.errors)) if (touched[`${mode}.${k}`] || v[k] !== '') err[k] = msg
  const errCount = Object.keys(err).length

  const summary = !res.ok ? '' : mode === 'rent'
    ? `Housing costs are ${formatKsh(res.total)} a month, ${Math.round(res.share * 100)} percent of your income. ${res.band.label}.`
    : `Estimated monthly repayment ${formatKsh(res.payment)}.${res.band ? ` ${Math.round(res.share * 100)} percent of income. ${res.band.label}.` : ''}`
  useEffect(() => {
    const t = setTimeout(() => setAnnounce(summary), 700)
    return () => clearTimeout(t)
  }, [summary])

  const example = () => { if (mode === 'rent') setRent(RENT_EXAMPLE); else setBuy(BUY_EXAMPLE); setTouched({}) }
  const setMode = (m) => setSp((p) => { const n = new URLSearchParams(p); n.set('mode', m); n.delete('price'); return n }, { replace: true })

  const years = parseMoney(buy.years)
  const depositPct = res.ok && mode === 'buy' ? Math.round(res.depositShare * 100) : null

  return (
    <div className="container calc">
      <h1 className="text-page">Affordability calculator</h1>
      <p className="muted calc__lead">A quick estimate to help you decide. It is not financial advice or a lender offer. Results update as you type.</p>
      <Segmented label="Calculator type" value={mode} options={MODES} onChange={setMode} />

      <div className="calc__grid">
        <form className="panel calc__form" onSubmit={(e) => e.preventDefault()} noValidate>
          {fromProp && (
            <p className="calc__for"><span>For: <strong>{fromProp.title}</strong></span> <Button to={`/properties/${fromProp.slug}`} variant="text" size="sm">View home</Button></p>
          )}
          {mode === 'rent' ? (
            <>
              <Money label="Monthly rent" value={rent.rent} onChange={setV('rent')} onBlur={blur('rent')} error={err.rent} />
              <Money label="Other monthly housing costs" hint="For example service charge, water or internet" value={rent.other} onChange={setV('other')} onBlur={blur('other')} error={err.other} />
              <Money label="Monthly income, before or after tax" hint="Use the same basis you plan to budget with" value={rent.income} onChange={setV('income')} onBlur={blur('income')} error={err.income} />
            </>
          ) : (
            <>
              <Money label="Property price" value={buy.price} onChange={setV('price')} onBlur={blur('price')} error={err.price} />
              <div className="calc__pair">
                <Money label="Deposit" hint={depositPct !== null ? `${depositPct} percent of the price` : undefined} value={buy.deposit} onChange={setV('deposit')} onBlur={blur('deposit')} error={err.deposit} />
                <TextField label="Interest rate a year (%)" hint="Example only; use your lender's rate" inputMode="decimal" value={buy.rate} onChange={(e) => setV('rate')(e.target.value.replace(/[^\d.]/g, ''))} onBlur={blur('rate')} error={err.rate} />
              </div>
              <TextField label="Loan term (years)" inputMode="numeric" value={buy.years} onChange={(e) => setV('years')(e.target.value.replace(/\D/g, ''))} onBlur={blur('years')} error={err.years} />
              <Money label="Other monthly ownership costs, optional" hint="For example service charge and insurance" value={buy.other} onChange={setV('other')} onBlur={blur('other')} error={err.other} />
              <Money label="Monthly household income, optional" value={buy.income} onChange={setV('income')} onBlur={blur('income')} error={err.income} />
            </>
          )}
          <Button variant="text" size="sm" onClick={example} className="calc__example">Use example numbers</Button>
        </form>

        <div className="calc__results">
          <p className="visually-hidden" role="status" aria-live="polite">{announce}</p>
          {!res.ok && (
            <div className="panel result result--empty">
              <h2 className="text-card">No estimate yet</h2>
              <p className="muted">{errCount > 0 ? `Fix the ${errCount} ${errCount === 1 ? 'field' : 'fields'} on the left and your estimate will appear here.` : 'Fill in the fields on the left and your estimate will appear here.'}</p>
            </div>
          )}

          {res.ok && mode === 'rent' && (
            <div className="panel result">
              <h2 className="result__label">Your estimate</h2>
              <p className="result__big">{formatKsh(res.total)}</p>
              <p className="muted">total monthly housing cost</p>
              <p className="result__share"><strong>{Math.round(res.share * 100)}% of your income</strong> <BandBadge band={res.band} /></p>
              <AffordabilityMeter share={res.share} band={res.band} />
              <p className="muted">After housing costs, about <strong>{formatKsh(res.remaining)}</strong> a month remains. Many people aim to keep housing under 30 percent. That is a common guideline, not a rule, and your situation may differ.</p>
              <div className="row-actions">
                <Button to={`/properties?type=rent&max=${Math.ceil(res.total / 1000) * 1000}`} variant="primary">See homes up to {formatKsh(Math.ceil(res.total / 1000) * 1000)}</Button>
                {fromProp && <Button to={`/properties/${fromProp.slug}`} variant="text">Back to the home</Button>}
              </div>
            </div>
          )}

          {res.ok && mode === 'buy' && (
            <>
              <div className="panel result">
                <h2 className="result__label">Estimated monthly repayment</h2>
                <p className="result__big">{formatKsh(res.payment)}</p>
                <dl className="result__rows">
                  <div><dt>Loan amount</dt><dd>{formatKsh(res.loan)}</dd></div>
                  <div><dt>Total interest over {years} {years === 1 ? 'year' : 'years'}</dt><dd>{formatKsh(res.interest)}</dd></div>
                  <div><dt>Total repaid to the lender</dt><dd>{formatKsh(res.totalRepaid)}</dd></div>
                  {parseMoney(buy.other) > 0 && <div><dt>Repayment plus ownership costs</dt><dd>{formatKsh(res.monthlyCost)}</dd></div>}
                  {res.share !== null && <div><dt>Share of income</dt><dd>{Math.round(res.share * 100)}% <BandBadge band={res.band} /></dd></div>}
                </dl>
                {res.share !== null && <AffordabilityMeter share={res.share} band={res.band} />}
                {fromProp && <Button to={`/properties/${fromProp.slug}`} variant="text">Back to the home</Button>}
              </div>
              <Alert tone="warning" title="Assumptions and exclusions">
                <p>Repayment = P x r x (1 + r)^n / ((1 + r)^n - 1), where P is the loan, r the monthly rate (the annual rate divided by 12) and n the number of months. The rate is fixed for the whole term and payments are equal. Not included: stamp duty, legal and valuation fees, lender fees, mortgage insurance and land rates. This is an estimate, not a lender offer or financial advice.</p>
              </Alert>
            </>
          )}
          {res.ok && mode === 'rent' && <p className="small muted">Bands are a common rule of thumb: under 30% Comfortable, 30 to 40% Tight, over 40% Stretched.</p>}
        </div>
      </div>
    </div>
  )
}
