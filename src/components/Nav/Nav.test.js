import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Nav from './Nav';

// Draws the nav as if the visitor were on `path`.
function renderNavAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Nav label="Main" listClassName="nav-list" />
    </MemoryRouter>
  );
  // The nav is a landmark named by its label, so screen readers can list it and jump to it.
  return screen.getByRole('navigation', { name: 'Main' });
}

test('has all six links, in order, pointing at the right pages', () => {
  const nav = renderNavAt('/');

  const links = within(nav).getAllByRole('link');
  expect(links.map((link) => link.textContent)).toEqual([
    'Home',
    'About',
    'Menu',
    'Reservations',
    'Order Online',
    'Login',
  ]);
  expect(links.map((link) => link.getAttribute('href'))).toEqual([
    '/',
    '/about',
    '/menu',
    '/reservations',
    '/order-online',
    '/login',
  ]);
});

test('marks only the current page with aria-current="page"', () => {
  const nav = renderNavAt('/menu');

  // NavLink adds aria-current="page" to the link for the page you're on,
  // so screen readers say "Menu, current page".
  expect(within(nav).getByRole('link', { name: 'Menu' })).toHaveAttribute('aria-current', 'page');
  // Home uses `end`, so it's only current on "/" itself, not on every page that starts with "/".
  expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  // Exactly one link is marked.
  const current = within(nav).getAllByRole('link').filter((link) => link.hasAttribute('aria-current'));
  expect(current).toHaveLength(1);
});

test('marks Home as current on the home page', () => {
  const nav = renderNavAt('/');
  expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
});
