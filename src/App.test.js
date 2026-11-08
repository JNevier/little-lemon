import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';

test('renders the main heading', () => {
  // App needs a router around it, like BrowserRouter in index.js.
  // MemoryRouter keeps the URL in memory, so the test doesn't need a real address bar.
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  // getByRole finds an element the way a screen reader sees it, not by class name.
  const heading = screen.getByRole('heading', { level: 1, name: /little lemon/i });
  expect(heading).toBeInTheDocument();
});

// Draws the whole app at one address, like typing it into the address bar.
function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

test('every link on the home page and in the nav opens a real page, not the 404 page', () => {
  // The Menu page loads its dishes with fetch. This fake never answers, so the test doesn't need menu data.
  global.fetch = jest.fn(() => new Promise(() => {}));

  // Collect every in-app address that the home page links to: the header nav, the footer nav,
  // the hero and Specials buttons, and the "Order a delivery" links. A Set removes the repeats.
  const { unmount } = renderAppAt('/');
  const paths = new Set(
    screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href) => href.startsWith('/'))
  );
  unmount();

  // Sanity check: we found the six nav addresses (so the test can't pass by finding nothing).
  ['/', '/about', '/menu', '/reservations', '/order-online', '/login'].forEach((path) => {
    expect(paths).toContain(path);
  });

  paths.forEach((path) => {
    const page = renderAppAt(path);
    // Each page has its own h1, and it isn't the 404 heading.
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument();
    page.unmount();
  });

  delete global.fetch;
});

test('an unknown address still shows the 404 page', () => {
  renderAppAt('/no-such-page');
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
});
