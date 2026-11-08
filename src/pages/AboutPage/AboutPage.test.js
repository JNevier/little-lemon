import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AboutPage from './AboutPage';

// The page has links, so it needs a router around it.
function renderAbout() {
  render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>
  );
}

test('has its own title and the sections in order', () => {
  renderAbout();

  expect(screen.getByRole('heading', { level: 1, name: 'Our story' })).toBeInTheDocument();
  expect(document.title).toBe('About | Little Lemon');
  const sectionTitles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
  expect(sectionTitles).toEqual([
    'From a family kitchen to Pisa Avenue',
    'How we run our kitchen',
    'Mario and Adrian',
    'Come hungry',
  ]);
});

test('no longer repeats the home page\'s "Little Lemon / Chicago" block', () => {
  renderAbout();
  expect(screen.queryByRole('heading', { name: 'Little Lemon' })).not.toBeInTheDocument();
});

test('the story shows both owner photos with descriptions', () => {
  renderAbout();
  const story = screen.getByRole('region', { name: 'From a family kitchen to Pisa Avenue' });
  expect(within(story).getAllByRole('img')).toHaveLength(2);
  within(story).getAllByRole('img').forEach((photo) => expect(photo).toHaveAccessibleName(/Mario and Adrian/));
});

test('lists three values that are different from the home page highlights', () => {
  renderAbout();
  const values = screen.getByRole('region', { name: 'How we run our kitchen' });
  const titles = within(values).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);

  expect(titles).toEqual(['Made to share', 'Nothing wasted', 'Everyone at the table']);
  // The home page's points, which shouldn't be repeated here.
  ['Family recipes', 'Fresh, seasonal produce', 'A neighborhood bistro'].forEach((homeTitle) => {
    expect(titles).not.toContain(homeTitle);
  });
});

test('introduces both owners with their role', () => {
  renderAbout();
  const owners = screen.getByRole('region', { name: 'Mario and Adrian' });

  expect(within(owners).getByRole('heading', { name: 'Mario' })).toBeInTheDocument();
  expect(within(owners).getByText('Chef and co-owner')).toBeInTheDocument();
  expect(within(owners).getByRole('heading', { name: 'Adrian' })).toBeInTheDocument();
  expect(within(owners).getByText('Co-owner and host')).toBeInTheDocument();
});

test('ends with a Reserve a Table button', () => {
  renderAbout();
  const closing = screen.getByRole('region', { name: 'Come hungry' });
  expect(within(closing).getByRole('link', { name: 'Reserve a Table' })).toHaveAttribute('href', '/reservations');
});
