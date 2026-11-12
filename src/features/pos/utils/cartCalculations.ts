const DECIMAL_PATTERN = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i

interface DecimalFraction {
  numerator: bigint
  denominator: bigint
}

const parseDecimalFraction = (value: string | number): DecimalFraction | null => {
  const match = String(value).trim().match(DECIMAL_PATTERN)
  if (!match) return null

  const [, sign, whole, decimal = '', exponentText = '0'] = match
  const exponent = Number(exponentText)
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 30) return null

  const digits = BigInt(`${whole}${decimal}`)
  const scale = decimal.length - exponent
  const signedNumerator = sign === '-' ? -digits : digits

  if (scale <= 0) {
    return {
      numerator: signedNumerator * 10n ** BigInt(-scale),
      denominator: 1n
    }
  }

  if (scale > 30) return null

  return {
    numerator: signedNumerator,
    denominator: 10n ** BigInt(scale)
  }
}

const roundPositiveDivision = (numerator: bigint, denominator: bigint) =>
  (numerator + denominator / 2n) / denominator

export const addQuantities = (left: number, right: number) => {
  const leftFraction = parseDecimalFraction(left)
  const rightFraction = parseDecimalFraction(right)
  if (!leftFraction || !rightFraction) return Number.NaN

  const commonDenominator = leftFraction.denominator > rightFraction.denominator
    ? leftFraction.denominator
    : rightFraction.denominator
  const numerator =
    leftFraction.numerator * (commonDenominator / leftFraction.denominator) +
    rightFraction.numerator * (commonDenominator / rightFraction.denominator)

  return Number(numerator) / Number(commonDenominator)
}

export const getPriceInCents = (price: string): number | null => {
  const fraction = parseDecimalFraction(price)
  if (!fraction || fraction.numerator < 0n) return null

  const cents = roundPositiveDivision(
    fraction.numerator * 100n,
    fraction.denominator
  )

  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return Number(cents)
}

export const getLineSubtotalInCents = (
  unitPrice: string,
  quantity: number
): number | null => {
  const priceInCents = getPriceInCents(unitPrice)
  const quantityFraction = parseDecimalFraction(quantity)
  if (
    priceInCents === null ||
    !quantityFraction ||
    quantityFraction.numerator < 0n
  ) {
    return null
  }

  const subtotal = roundPositiveDivision(
    BigInt(priceInCents) * quantityFraction.numerator,
    quantityFraction.denominator
  )

  if (subtotal > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return Number(subtotal)
}

export const centsToAmount = (cents: number) => cents / 100
