import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
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

function mockMenuReply(menu = sampleMenu) {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => menu });
}

// Shows the current "?category=..." part of the address, so a test can check what the page wrote there.
function ShowSearch() {
  return <p data-testid="search">{useLocation().search}</p>;
}

// The menu page reads and writes the address (useSearchParams), so it needs a router around it.
// `path` is the address the test starts on, like typing it into the address bar.
function renderMenu(path = '/menu') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MenuPage />
      <ShowSearch />
    </MemoryRouter>
  );
}

test('shows a loading message, then the dishes with their prices', async () => {
  mockMenuReply();
  renderMenu();

  expect(screen.getByRole('heading', { level: 1, name: 'Our Menu' })).toBeInTheDocument();
  // While loading: a message for screen readers, and grey skeleton rows for everyone else.
  expect(screen.getByRole('status')).toHaveTextContent('Loading the menu…');
  expect(screen.getByTestId('menu-skeleton')).toBeInTheDocument();

  // findBy waits until the element appears (the fake fetch answers a moment later).
  expect(await screen.findByRole('heading', { name: 'Bruschetta' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByTestId('menu-skeleton')).not.toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
  // Prices are formatted as US dollars, with two decimals.
  expect(screen.getByText('$5.99')).toBeInTheDocument();
  expect(screen.getByText('$3.00')).toBeInTheDocument();
});

test('a filter button shows only its category and is announced as pressed', async () => {
  mockMenuReply();
  renderMenu();
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
  renderMenu();

  expect(await screen.findByRole('alert')).toHaveTextContent("Sorry, we couldn't load the menu.");
  // The page didn't crash: the heading is still there, and no list or loading message is shown.
  expect(screen.getByRole('heading', { level: 1, name: 'Our Menu' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

test('"All" shows one section per category, each with its own heading', async () => {
  mockMenuReply();
  renderMenu();
  await screen.findByRole('heading', { name: 'Bruschetta' });

  ['Starters', 'Mains', 'Desserts', 'Drinks'].forEach((name) => {
    const section = screen.getByRole('region', { name });
    expect(within(section).getByRole('heading', { level: 2, name })).toBeInTheDocument();
  });
  // Each dish sits in its own category's section.
  expect(within(screen.getByRole('region', { name: 'Desserts' })).getByRole('heading', { name: 'Baklava' }))
    .toBeInTheDocument();
});

test('the chosen filter is written to the address, and "All" removes it', async () => {
  mockMenuReply();
  renderMenu();
  await screen.findByRole('heading', { name: 'Bruschetta' });
  expect(screen.getByTestId('search')).toHaveTextContent(/^$/);

  fireEvent.click(screen.getByRole('button', { name: 'Mains' }));
  expect(screen.getByTestId('search')).toHaveTextContent('?category=Mains');
  // Only the Mains section is left.
  expect(screen.getByRole('region', { name: 'Mains' })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Starters' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'All' }));
  expect(screen.getByTestId('search')).toHaveTextContent(/^$/);
});

test('a link to /menu?category=Desserts opens on that filter', async () => {
  mockMenuReply();
  renderMenu('/menu?category=Desserts');
  await screen.findByRole('heading', { name: 'Baklava' });

  expect(screen.getByRole('button', { name: 'Desserts' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
});

test('an unknown category in the address falls back to "All"', async () => {
  mockMenuReply();
  renderMenu('/menu?category=Pizza');
  await screen.findByRole('heading', { name: 'Bruschetta' });

  expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
});

test('a dish shows its tags and, if it has one, its photo', async () => {
  mockMenuReply([
    {
      id: 'shakshuka', name: 'Shakshuka', category: 'Mains', price: 16, description: 'Eggs.',
      tags: ['Vegetarian'], image: '/images/shakshuka.jpg', imageAlt: 'A pan of shakshuka',
    },
    { id: 'tea', name: 'Mint Tea', category: 'Drinks', price: 3, description: 'Tea.', tags: [] },
  ]);
  renderMenu();

  const dish = (await screen.findByRole('heading', { name: 'Shakshuka' })).closest('li');
  expect(within(dish).getByRole('img', { name: 'A pan of shakshuka' })).toHaveAttribute('src', '/images/shakshuka.jpg');
  expect(within(dish).getByRole('list', { name: 'Dietary information' })).toHaveTextContent('Vegetarian');
  expect(within(dish).getByText('$16.00')).toBeInTheDocument();

  // No photo and no tags: no empty image or empty tag list.
  const tea = screen.getByRole('heading', { name: 'Mint Tea' }).closest('li');
  expect(within(tea).queryByRole('img')).not.toBeInTheDocument();
  expect(within(tea).queryByRole('list')).not.toBeInTheDocument();
});

test('"Try again" loads the menu again after an error', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true, json: async () => sampleMenu });
  renderMenu();

  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
  // The button disappears while the menu reloads, so keyboard focus moves to where the dishes will appear.
  expect(document.activeElement).toHaveClass('menu-page-content');

  // The error is gone, and the dishes arrive from the second request.
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Bruschetta' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('ends with a Reserve a Table call to action', () => {
  global.fetch = jest.fn(() => new Promise(() => {}));
  renderMenu();

  expect(screen.getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservations');
});

test('a dish with a small copy of its photo loads that copy at 96px, with the full photo as a sharper option', async () => {
  mockMenuReply([
    {
      id: 'shakshuka', name: 'Shakshuka', category: 'Mains', price: 16, description: 'Eggs.', tags: [],
      image: '/images/shakshuka.jpg', thumbnail: '/images/shakshuka-200.jpg', imageAlt: 'A pan of shakshuka',
    },
  ]);
  renderMenu();

  const photo = await screen.findByRole('img', { name: 'A pan of shakshuka' });
  expect(photo).toHaveAttribute('src', '/images/shakshuka-200.jpg');
  expect(photo).toHaveAttribute('srcset', '/images/shakshuka-200.jpg 200w, /images/shakshuka.jpg 640w');
  expect(photo).toHaveAttribute('sizes', '96px');
});
