/** Formatting helpers shared across the UI. */

/** Format an integer paise amount as an Indian-Rupee string, e.g. 2480000 → "₹ 24,800". */
export function formatPriceFromPaise(priceInPaise: number): string {
  const rupees = priceInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
    .format(rupees)
    .replace("₹", "₹ ");
}
