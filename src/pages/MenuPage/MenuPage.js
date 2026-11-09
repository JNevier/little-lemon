import './MenuPage.css';
import { useRef } from 'react';
import { useSearchParams } from 'react-router';
import useFetch from '../../hooks/useFetch';
import MenuItem from '../../components/MenuItem/MenuItem';
import LinkButton from '../../components/LinkButton/LinkButton';

// The filter buttons, in the order they appear. "All" shows every dish.
// Outside the component because it never changes.
const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

// How many grey placeholder rows to show while the menu loads.
const PLACEHOLDER_ROWS = 4;

function MenuPage() {
  // SAMPLE DATA: the dishes in public/data/menu.json are made up for the capstone.
  // Files in public/ are served as they are, so the browser can fetch '/data/menu.json' like a real API.
  const { data: items, loading, error, retry } = useFetch('/data/menu.json');

  // NEW: useSearchParams reads and writes the "?category=Mains" part of the address (the "query string").
  // The chosen filter lives in the address instead of in useState, so:
  //  - the Back button undoes a filter click (each click adds a step to the browser's history), and
  //  - a shared or bookmarked link like /menu?category=Desserts opens on that filter.
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('category');
  // Anything that isn't a real category (a typo, or no ?category at all) means "All".
  const category = categories.includes(requested) ? requested : 'All';

  // A ref to the dish list, so the page can scroll back to its top or move focus there.
  const contentRef = useRef(null);

  function chooseCategory(name) {
    // "All" is the normal view, so it gets the plain /menu address with no ?category.
    setSearchParams(name === 'All' ? {} : { category: name });
    // If the visitor has scrolled down past the start of the list, a shorter list could leave them
    // looking at the footer. Bring the top of the list back into view, under the sticky filter bar.
    const content = contentRef.current;
    if (content && content.getBoundingClientRect().top < 0) {
      content.scrollIntoView({ block: 'start' });
    }
  }

  function tryAgain() {
    retry();
    // The "Try again" button disappears while the menu reloads. Without this, keyboard focus would
    // fall back to the top of the page; instead it moves to where the dishes will appear.
    contentRef.current?.focus();
  }

  // The sections to show: every category for "All", or just the chosen one. Each section gets its own
  // dishes, and a category with no dishes is left out (so there's never an empty heading).
  const sections = categories
    .filter((name) => name !== 'All' && (category === 'All' || category === name))
    .map((name) => ({ name, dishes: (items ?? []).filter((item) => item.category === name) }))
    .filter((section) => section.dishes.length > 0);

  return (
    <div className="menu-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Menu | Little Lemon</title>

      <div className="page-header">
        <h1>Our Menu</h1>
        <p className="lead">Traditional Mediterranean recipes with a modern twist. Prices are in US dollars.</p>
      </div>

      {/* The filter bar and the dishes share one box. A sticky element only sticks inside its parent,
          so the bar stops at the end of the dishes instead of covering the "Reserve" band below. */}
      <div className="menu-page-body">
        {/* A group of buttons, named so screen readers say what they're for. */}
        <div className="menu-page-filters" role="group" aria-label="Filter the menu by category">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className="menu-page-filter"
              // aria-pressed turns a button into a toggle button. Screen readers say
              // "Starters, toggle button, pressed", so the chosen filter is announced, not just shown.
              aria-pressed={category === name}
              onClick={() => chooseCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* tabIndex={-1}: the code can move focus here (after "Try again"), but the Tab key skips it. */}
        <div className="menu-page-content" ref={contentRef} tabIndex={-1}>
          {loading && (
            <>
              {/* role="status" reads the message out politely, without interrupting the user. */}
              <p role="status" className="visually-hidden">Loading the menu…</p>
              {/* A skeleton: grey rows shaped like dishes, so the page has its shape while it loads. */}
              <div className="menu-page-skeleton" aria-hidden="true" data-testid="menu-skeleton">
                {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
                  <div key={index} className="menu-page-skeleton-row">
                    <div className="skeleton-block skeleton-line" />
                    <div className="skeleton-block skeleton-line skeleton-line-short" />
                  </div>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="menu-page-error">
              {/* role="alert" reads the message out right away, because something went wrong. */}
              <p role="alert">
                Sorry, we couldn't load the menu. Please check your connection and try again.
              </p>
              <button type="button" className="button button-secondary" onClick={tryAgain}>
                Try again
              </button>
            </div>
          )}

          {/* One section per category, each with its own heading and list of dishes. */}
          {items && sections.map((section) => (
            <section key={section.name} className="menu-page-section" aria-labelledby={`menu-${section.name}`}>
              <h2 id={`menu-${section.name}`} className="menu-page-section-title">{section.name}</h2>
              <ul className="menu-page-list">
                {/* key tells React which dish is which, so it can update the list correctly when the filter changes. */}
                {section.dishes.map((item) => (
                  <MenuItem
                    key={item.id}
                    name={item.name}
                    price={item.price}
                    description={item.description}
                    tags={item.tags}
                    image={item.image}
                    imageAlt={item.imageAlt}
                  thumbnail={item.thumbnail}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {/* The page ends with the one main action. */}
      <section className="section section-muted menu-page-cta" aria-labelledby="menu-cta-title">
        <h2 id="menu-cta-title">Found something you like?</h2>
        <p className="lead">Booking a table online takes about a minute.</p>
        <LinkButton to="/reservations">Reserve a Table</LinkButton>
      </section>
    </div>
  );
}

export default MenuPage;
