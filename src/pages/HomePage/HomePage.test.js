import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import HomePage from './HomePage';

// A small fake menu: two featured dishes and one that isn't, so we can check that only featured ones appear.
const sampleMenu = [
  {
    id: 'bruschetta', name: 'Bruschetta', category: 'Starters', price: 5.99, description: 'Toast.',
    tags: ['Vegetarian'], image: '/images/bruschetta.png', imageAlt: 'Toasted bread', featured: true,
  },
  {
    id: 'lemon-dessert', name: 'Lemon Dessert', category: 'Desserts', price: 5, description: 'Tart.',
    tags: [], image: '/images/lemon-dessert.png', imageAlt: 'A slice of lemon tart', featured: true,
  },
  { id: 'mint-tea', name: 'Mint Tea', category: 'Drinks', price: 3, description: 'Tea.', tags: ['Vegan'] },
];

// HomePage has links, so it needs a router around it.
function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

afterEach(() => {
  delete global.fetch;
});

test('shows the hero, then each section with its own heading', () => {
  // A fetch that never answers: this test is only about the page's structure.
  global.fetch = jest.fn(() => new Promise(() => {}));
  renderHome();

  expect(screen.getByRole('heading', { level: 1, name: 'Little Lemon' })).toBeInTheDocument();
  ['Simple food, made with care', "This week's specials", 'Two friends, one family kitchen', 'Come in for dinner']
    .forEach((name) => {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    });

  // The hero has the main action and a second one.
  expect(screen.getByRole('link', { name: 'See the menu' })).toHaveAttribute('href', '/menu');
  const reserveLinks = screen.getAllByRole('link', { name: 'Reserve a Table' });
  reserveLinks.forEach((link) => expect(link).toHaveAttribute('href', '/reservations'));
  // The story teaser leads to the About page.
  expect(screen.getByRole('link', { name: /read our story/i })).toHaveAttribute('href', '/about');
});

test('has no invented reviews or ratings', () => {
  global.fetch = jest.fn(() => new Promise(() => {}));
  renderHome();

  expect(screen.queryByRole('heading', { name: /what our customers say/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/★/)).not.toBeInTheDocument();
});

test('shows a loading skeleton, then only the featured dishes from menu.json', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => sampleMenu });
  renderHome();

  // While loading: a message for screen readers and grey placeholder cards for everyone else.
  expect(screen.getByRole('status')).toHaveTextContent("Loading this week's specials…");
  expect(screen.getByTestId('specials-skeleton')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/data/menu.json', expect.anything());

  // findBy waits until the fake fetch has answered.
  const bruschetta = await screen.findByRole('link', { name: 'Bruschetta' });
  expect(bruschetta).toHaveAttribute('href', '/menu');
  expect(screen.getByRole('link', { name: 'Lemon Dessert' })).toBeInTheDocument();
  // Not featured, so not on the home page.
  expect(screen.queryByText('Mint Tea')).not.toBeInTheDocument();
  expect(screen.queryByTestId('specials-skeleton')).not.toBeInTheDocument();

  // Each card: its photo, its price as US dollars, and its tags.
  const card = bruschetta.closest('li');
  expect(within(card).getByRole('img', { name: 'Toasted bread' })).toBeInTheDocument();
  expect(within(card).getByText('$5.99')).toBeInTheDocument();
  expect(within(card).getByText('Vegetarian')).toBeInTheDocument();
  // A dish without tags has no empty tag list.
  const dessertCard = screen.getByRole('link', { name: 'Lemon Dessert' }).closest('li');
  expect(within(dessertCard).queryByRole('list', { name: 'Dietary information' })).not.toBeInTheDocument();
});

test('if the dishes cannot load, shows a calm message with a link to the menu', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
  renderHome();

  expect(await screen.findByText(/couldn't load this week's specials/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'see the full menu' })).toHaveAttribute('href', '/menu');
  // The rest of the page still works, so nothing interrupts the visitor.
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('the Visit us section shows the address, hours and a phone link', () => {
  global.fetch = jest.fn(() => new Promise(() => {}));
  renderHome();

  const visit = screen.getByRole('region', { name: 'Come in for dinner' });
  expect(within(visit).getByText(/678 Pisa Ave/)).toBeInTheDocument();
  expect(within(visit).getByText(/Daily, 5 pm to midnight/)).toBeInTheDocument();
  expect(within(visit).getByRole('link', { name: '(312) 555-0123' })).toHaveAttribute('href', 'tel:+13125550123');
  expect(within(visit).getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservations');
});
