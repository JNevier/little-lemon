import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Footer from './Footer';

function renderFooter() {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
  return screen.getByRole('contentinfo'); // <footer> is the "contentinfo" landmark
}

test('has one compact row of links to the main pages', () => {
  renderFooter();
  const nav = screen.getByRole('navigation', { name: 'Footer' });

  const links = within(nav).getAllByRole('link');
  expect(links.map((link) => link.textContent)).toEqual(['Home', 'About', 'Menu', 'Reserve']);
  expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/about', '/menu', '/reservations']);
});

test('shows the address, hours and contact details', () => {
  const footer = renderFooter();

  expect(within(footer).getByRole('heading', { name: 'Visit' })).toBeInTheDocument();
  expect(within(footer).getByText(/678 Pisa Ave/)).toBeInTheDocument();
  // The hours must match the booking form, which offers tables from 17:00 to 23:30.
  expect(within(footer).getByText(/Daily, 5 pm to midnight/)).toBeInTheDocument();
  expect(within(footer).getByText(/Last table at 11:30 pm/)).toBeInTheDocument();
  expect(within(footer).getByRole('link', { name: '(312) 555-0123' })).toHaveAttribute('href', 'tel:+13125550123');
  expect(within(footer).getByRole('link', { name: 'hello@littlelemon.example' })).toHaveAttribute(
    'href',
    'mailto:hello@littlelemon.example'
  );
});

test('has no social links to generic sites', () => {
  const footer = renderFooter();
  // The old footer linked to facebook.com, instagram.com and x.com, which aren't Little Lemon's accounts.
  const external = within(footer)
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href').startsWith('http'));
  expect(external).toHaveLength(0);
});

test('credits the owners of the photos', () => {
  const footer = renderFooter();
  expect(within(footer).getByText(/Credits to the owners of the photos/)).toBeInTheDocument();
});
