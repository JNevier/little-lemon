import { formatPrice } from './price';

test('formats a number as US dollars with two decimals', () => {
  expect(formatPrice(5)).toBe('$5.00');
  expect(formatPrice(12.9)).toBe('$12.90');
  expect(formatPrice(5.99)).toBe('$5.99');
});
