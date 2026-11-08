import { render, screen, fireEvent } from '@testing-library/react';
import MenuPage from './MenuPage';

// A small fake menu: one dish per category, so filtering is easy to check.
const sampleMenu = [
  { id: 'bruschetta', name: 'Bruschetta', category: 'Starters', price: 5.99, description: 'Toast.' },
  { id: 'souvlaki', name: 'Lamb Souvlaki', category: 'Mains', price: 21.5, description: 'Skewers.' },
  { id: 'baklava', name: 'Baklava', category: 'Desserts', price: 6.5, description: 'Pastry.' },
  { id: 'lemonade', name: 'Fresh Lemonade', category: 'Drinks', price: 3, description: 'Lemons.' },
];

// Each test sets its own fake fetch; this removes it afterwards.
afterEach(() => {
  delete global.fetch;
});

function mockMenuReply() {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => sampleMenu });
}

test('shows a loading message, then the dishes with their prices', async () => {
  mockMenuReply();
  render(<MenuPage />);

  expect(screen.getByRole('heading', { level: 1, name: 'Our Menu' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Loading…');

  // findBy waits until the element appears (the fake fetch answers a moment later).
  expect(await screen.findByRole('heading', { name: 'Bruschetta' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
  // Prices are formatted as US dollars, with two decimals.
  expect(screen.getByText('$5.99')).toBeInTheDocument();
  expect(screen.getByText('$3.00')).toBeInTheDocument();
});

test('a filter button shows only its category and is announced as pressed', async () => {
  mockMenuReply();
  render(<MenuPage />);
  await screen.findByRole('heading', { name: 'Bruschetta' });

  // "All" starts pressed.
  expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(screen.getByRole('button', { name: 'Drinks' }));

  expect(screen.getByRole('button', { name: 'Drinks' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'Fresh Lemonade' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Bruschetta' })).not.toBeInTheDocument();

  // Back to everything.
  fireEvent.click(screen.getByRole('button', { name: 'All' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
});

test('shows an error message when the menu cannot be loaded', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
  render(<MenuPage />);

  expect(await screen.findByRole('alert')).toHaveTextContent("Sorry, we couldn't load the menu.");
  // The page didn't crash: the heading is still there, and no list or loading message is shown.
  expect(screen.getByRole('heading', { level: 1, name: 'Our Menu' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});
