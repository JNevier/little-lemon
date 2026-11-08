import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Header from './Header';

// Header reads the current page with useLocation, so it needs a router around it.
function renderHeader() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Header />
    </MemoryRouter>
  );
}

// The CSS isn't loaded in tests, so we check what decides visibility: the button's
// aria-expanded and the "header-menu-open" class on the menu it controls.
function getMenu() {
  const button = screen.getByRole('button', { name: 'Site navigation' });
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  return { button, menu };
}

test('the menu button starts closed and points at the menu it controls', () => {
  renderHeader();
  const { button, menu } = getMenu();

  expect(button).toHaveAttribute('aria-expanded', 'false');
  // aria-controls must name a real element, and that element holds the main nav.
  expect(menu).not.toBeNull();
  expect(within(menu).getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  expect(menu).not.toHaveClass('header-menu-open');
});

test('clicking the button opens the menu, and clicking again closes it', () => {
  renderHeader();
  const { button, menu } = getMenu();

  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(menu).toHaveClass('header-menu-open');

  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(menu).not.toHaveClass('header-menu-open');
});

test('Escape closes the open menu and moves focus back to the button', () => {
  renderHeader();
  const { button, menu } = getMenu();
  fireEvent.click(button);

  // Press Escape while a link inside the menu has focus.
  const aboutLink = within(menu).getByRole('link', { name: 'About' });
  aboutLink.focus();
  fireEvent.keyDown(aboutLink, { key: 'Escape' });

  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveFocus();
});

test('going to another page closes the menu', () => {
  renderHeader();
  const { button, menu } = getMenu();
  fireEvent.click(button);

  fireEvent.click(within(menu).getByRole('link', { name: 'Menu' }));

  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(menu).not.toHaveClass('header-menu-open');
});
