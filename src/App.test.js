import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';

// The home page (its specials) and the Menu page load dishes with fetch. This fake never answers,
// so these tests don't need menu data, and nothing changes on screen after a test has finished.
beforeEach(() => {
  global.fetch = jest.fn(() => new Promise(() => {}));
});

afterEach(() => {
  delete global.fetch;
});

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
  // Collect every in-app address that the home page links to: the header nav, the footer nav,
  // and the links in the home page's sections. A Set removes the repeats.
  const { unmount } = renderAppAt('/');
  const paths = new Set(
    screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href) => href.startsWith('/'))
  );
  unmount();

  // Sanity check: we found the four nav addresses (so the test can't pass by finding nothing).
  ['/', '/about', '/menu', '/reservations'].forEach((path) => {
    expect(paths).toContain(path);
  });
  // Order Online and Login were removed on purpose: nothing on the page links to them anymore.
  expect(paths).not.toContain('/order-online');
  expect(paths).not.toContain('/login');

  paths.forEach((path) => {
    const page = renderAppAt(path);
    // Each page has its own h1, and it isn't the 404 heading.
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument();
    page.unmount();
  });
});

test('an unknown address still shows the 404 page', () => {
  renderAppAt('/no-such-page');
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
});

test('the removed Order Online and Login pages fall through to the 404 page', () => {
  // Old bookmarks or shared links to these addresses get the normal "Page not found" page.
  ['/order-online', '/login'].forEach((path) => {
    const page = renderAppAt(path);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    page.unmount();
  });
});

describe('skip link', () => {
  test('is the first thing the Tab key reaches', () => {
    renderAppAt('/');
    // Every element the Tab key can reach, in page order (tabIndex -1 is left out on purpose).
    const focusable = document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusable[0]).toBe(screen.getByRole('link', { name: 'Skip to main content' }));
  });

  test('points at the main content and moves focus there when used', () => {
    renderAppAt('/');
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    const main = screen.getByRole('main');

    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(main).toHaveAttribute('id', 'main-content');

    fireEvent.click(skipLink);
    expect(main).toHaveFocus();
  });
});

test('every page has its own browser tab title', () => {
  const paths = ['/', '/about', '/menu', '/reservations', '/confirmed', '/my-reservations', '/no-such-page'];

  const titles = paths.map((path) => {
    const page = renderAppAt(path);
    const title = document.title;
    page.unmount();
    return title;
  });

  // Every title names the restaurant...
  titles.forEach((title) => expect(title).toMatch(/Little Lemon/));
  // ...and no two pages share a title (a Set drops repeats, so its size would shrink).
  expect(new Set(titles).size).toBe(paths.length);
});
