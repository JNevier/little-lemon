import './MenuPage.css';
import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import MenuItem from '../../components/MenuItem/MenuItem';

// The filter buttons, in the order they appear. "All" shows every dish.
// Outside the component because it never changes.
const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

// A section, not <main>: Main already wraps every page in the site's one <main>.
function MenuPage() {
  // SAMPLE DATA: the dishes in public/data/menu.json are made up for the capstone.
  // Files in public/ are served as they are, so the browser can fetch '/data/menu.json' like a real API.
  const { data: items, loading, error } = useFetch('/data/menu.json');
  // Which filter button is chosen. Only this is stored; the filtered list is worked out below.
  const [category, setCategory] = useState('All');

  // Derived data: computed from the state on every render, so it can never get out of sync.
  // `items ?? []` uses an empty list while the data hasn't arrived yet.
  const visibleItems = category === 'All'
    ? items ?? []
    : (items ?? []).filter((item) => item.category === category);

  return (
    <section className="menu-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Menu | Little Lemon</title>
      <h1>Our Menu</h1>
      <p>Traditional Mediterranean recipes with a modern twist. Prices are in US dollars.</p>

      {/* A group of buttons, named so screen readers say what they're for. */}
      <div className="menu-page-filters" role="group" aria-label="Filter the menu by category">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            className="menu-page-filter"
            // NEW: aria-pressed turns a button into a toggle button. Screen readers say
            // "Starters, toggle button, pressed", so the chosen filter is announced, not just colored.
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* role="status" reads the message out politely, without interrupting the user. */}
      {loading && <p role="status">Loading…</p>}

      {/* role="alert" reads the message out right away, because something went wrong. */}
      {error && (
        <p role="alert" className="menu-page-error">
          Sorry, we couldn't load the menu. Please check your connection and try again.
        </p>
      )}

      {/* Only show the list once the data has arrived. */}
      {items && (
        <ul className="menu-page-list">
          {/* key tells React which dish is which, so it can update the list correctly when the filter changes. */}
          {visibleItems.map((item) => (
            <MenuItem key={item.id} name={item.name} price={item.price} description={item.description} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default MenuPage;
