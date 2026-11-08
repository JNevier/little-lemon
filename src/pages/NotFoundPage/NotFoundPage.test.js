import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NotFoundPage from './NotFoundPage';

test('says the page was not found and links to Home, Menu and Reserve', () => {
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  expect(document.title).toBe('Page Not Found | Little Lemon');
  // The way home is the main (yellow) action; the menu is a second choice.
  expect(screen.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Back to the home page' })).toHaveClass('button-primary');
  expect(screen.getByRole('link', { name: 'See the menu' })).toHaveAttribute('href', '/menu');
  expect(screen.getByRole('link', { name: 'Reserve a table' })).toHaveAttribute('href', '/reservations');
});
