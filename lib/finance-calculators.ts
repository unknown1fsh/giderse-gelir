export function parseNumber(input: string): number | null {
  const normalized = input.replace(/\s/g, '').replace(',', '.')
  if (!normalized) {
    return null
  }
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function inflationRealValue(
  amount: number,
  annualInflationRate: number,
  years: number
): number {
  // V_reel = V / (1+i)^t
  return amount / Math.pow(1 + annualInflationRate, years)
}

export function inflationRequiredNominal(
  amount: number,
  annualInflationRate: number,
  years: number
): number {
  // V_nominal = V * (1+i)^t
  return amount * Math.pow(1 + annualInflationRate, years)
}

export function compoundFutureValue(params: {
  principal: number
  annualRate: number
  years: number
  compoundsPerYear: number
  monthlyContribution?: number
}): number {
  const { principal, annualRate, years, compoundsPerYear, monthlyContribution = 0 } = params
  const n = compoundsPerYear
  const t = years
  const r = annualRate

  const fvPrincipal = principal * Math.pow(1 + r / n, n * t)

  // Monthly contributions are treated as end-of-month deposits with monthly compounding approximation.
  const monthlyRate = r / 12
  const months = Math.round(t * 12)
  const fvContrib =
    monthlyContribution === 0 || monthlyRate === 0
      ? monthlyContribution * months
      : monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  return fvPrincipal + fvContrib
}

export function loanMonthlyPayment(params: {
  principal: number
  annualRate: number
  months: number
}): number {
  const { principal, annualRate, months } = params
  const r = annualRate / 12
  const n = months
  if (r === 0) {
    return principal / n
  }
  // PMT = P * r(1+r)^n / ((1+r)^n - 1)
  const pow = Math.pow(1 + r, n)
  return principal * ((r * pow) / (pow - 1))
}

export function budget503020(netMonthlyIncome: number): {
  needs: number
  wants: number
  savings: number
} {
  return {
    needs: netMonthlyIncome * 0.5,
    wants: netMonthlyIncome * 0.3,
    savings: netMonthlyIncome * 0.2,
  }
}

export function currencyConvert(amount: number, rate: number): number {
  return amount * rate
}
