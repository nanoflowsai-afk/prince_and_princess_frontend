/**
 * Currency utility functions for Indian Rupees (₹)
 */

/**
 * Format price in Indian Rupees
 * @param priceInCents - Price in cents (from database)
 * @returns Formatted price string with ₹ symbol
 */
export function formatRupees(priceInCents: number): string {
  const priceInRupees = priceInCents / 100;
  return `₹${priceInRupees.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Format price in Indian Rupees without symbol (just number)
 * @param priceInCents - Price in cents (from database)
 * @returns Formatted price number string
 */
export function formatRupeesNumber(priceInCents: number): string {
  const priceInRupees = priceInCents / 100;
  return priceInRupees.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

/**
 * Get price in Rupees (number)
 * @param priceInCents - Price in cents (from database)
 * @returns Price in Rupees as number
 */
export function getPriceInRupees(priceInCents: number): number {
  return priceInCents / 100;
}

