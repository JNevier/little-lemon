import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import ErrorBoundary from './ErrorBoundary';

// A component that always throws while drawing, to stand in for a page with a bug.
function Broken() {
  throw new Error('Test error');
}

// When a component throws, React (and the boundary) write the error to the console.
// That's expected here, so it's silenced inside these tests only, and put back afterwards.
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

test('draws its children as normal when nothing goes wrong', () => {
  render(
    <MemoryRouter>
      <ErrorBoundary resetKey="/">
        <p>All good</p>
      </ErrorBoundary>
    </MemoryRouter>
  );

  expect(screen.getByText('All good')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('shows a friendly message, a Reload button and a link home instead of a blank page', () => {
  render(
    <MemoryRouter>
      <p>Header stays</p>
      <ErrorBoundary resetKey="/">
        <Broken />
      </ErrorBoundary>
    </MemoryRouter>
  );

  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/');
  // Only the part inside the boundary is replaced; what's outside it is still there.
  expect(screen.getByText('Header stays')).toBeInTheDocument();
});

test('tries again when the page address changes', () => {
  // Like Main: the boundary gets the current address as resetKey. "/broken" throws, "/" works.
  function Pages() {
    const { pathname } = useLocation();
    return (
      <ErrorBoundary resetKey={pathname}>
        <Routes>
          <Route path="/broken" element={<Broken />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </ErrorBoundary>
    );
  }
  render(
    <MemoryRouter initialEntries={['/broken']}>
      <Pages />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();

  // The fallback's own link goes home; the address changes, so the boundary draws the page again.
  fireEvent.click(screen.getByRole('link', { name: 'Back to the home page' }));

  expect(screen.getByText('Home page')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Something went wrong' })).not.toBeInTheDocument();
});
