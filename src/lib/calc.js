export const BANDS = {
  comfortable: { id: 'comfortable', label: 'Comfortable', tone: 'success' },
  tight: { id: 'tight', label: 'Tight', tone: 'warning' },
  stretched: { id: 'stretched', label: 'Stretched', tone: 'error' },
}

export function bandFor(share) {
  if (share < 0.3) return BANDS.comfortable
  if (share <= 0.4) return BANDS.tight
  return BANDS.stretched
}

// Rent: rent and income are required; other costs are optional (blank counts as 0).
export function rentAffordability({ rent, other, income }) {
  const errors = {}
  if (rent === null || rent <= 0) errors.rent = 'Enter the monthly rent.'
  if (income === null || income <= 0) errors.income = 'Enter your monthly income.'
  if (other !== null && other < 0) errors.other = 'Other costs cannot be negative.'
  if (Object.keys(errors).length) return { ok: false, errors }
  const total = rent + (other ?? 0)
  const share = total / income
  return { ok: true, total, share, remaining: income - total, band: bandFor(share) }
}

// Standard repayment formula: M = P r (1 + r)^n / ((1 + r)^n - 1). If r is 0, M = P / n.
export function monthlyPayment(principal, annualRatePercent, years) {
  const n = Math.round(years * 12)
  const r = annualRatePercent / 100 / 12
  if (r === 0) return principal / n
  const f = Math.pow(1 + r, n)
  return (principal * r * f) / (f - 1)
}

export function mortgageEstimate({ price, deposit, rate, years, income, other }) {
  const errors = {}
  if (price === null || price <= 0) errors.price = 'Enter the property price.'
  if (deposit === null) deposit = 0
  if (deposit < 0) errors.deposit = 'The deposit cannot be negative.'
  else if (price !== null && price > 0 && deposit >= price) errors.deposit = 'The deposit must be less than the property price.'
  if (rate === null) errors.rate = 'Enter a rate between 0 and 40.'
  else if (rate < 0 || rate > 40) errors.rate = 'Enter a rate between 0 and 40.'
  if (years === null || !Number.isInteger(years) || years < 1 || years > 30) errors.years = 'Enter a term from 1 to 30 years.'
  if (other !== null && other !== undefined && other < 0) errors.other = 'Other costs cannot be negative.'
  if (income !== null && income !== undefined && income <= 0) errors.income = 'Income must be more than zero, or leave it blank.'
  if (Object.keys(errors).length) return { ok: false, errors }

  const loan = price - deposit
  const payment = monthlyPayment(loan, rate, years)
  const totalRepaid = payment * years * 12
  const monthlyCost = payment + (other ?? 0)
  const share = income ? monthlyCost / income : null
  return {
    ok: true,
    loan,
    payment,
    totalRepaid,
    interest: totalRepaid - loan,
    monthlyCost,
    depositShare: deposit / price,
    share,
    band: share === null ? null : bandFor(share),
  }
}
