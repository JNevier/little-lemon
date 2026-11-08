// NEW: Intl.NumberFormat is the browser's built-in number formatter.
// With style 'currency' and 'USD' it turns 5 into "$5.00" and 12.9 into "$12.90".
// We make it once, when the file loads, so it isn't rebuilt every time a price is shown.
const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Used by the menu page and the home page's specials, so every price on the site looks the same.
export function formatPrice(price) {
  return priceFormatter.format(price);
}
