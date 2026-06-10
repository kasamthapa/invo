export function generateVariantCode(
  productCode: string,
  attributes: Record<string, string>
): string {
  const keys = Object.keys(attributes).sort()
  if (keys.length === 0) return `${productCode}-DEFAULT`

  const suffix = keys
    .map((k) => attributes[k].toUpperCase().replace(/\s+/g, '-'))
    .join('-')

  return `${productCode}-${suffix}`
}

export function isVariantCodeUnique(
  variantCode: string,
  existingCodes: string[]
): boolean {
  return !existingCodes.includes(variantCode)
}
