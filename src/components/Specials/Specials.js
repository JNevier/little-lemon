import { Link } from 'react-router';
import SpecialCard from '../SpecialCard/SpecialCard';
import useFetch from '../../hooks/useFetch';
import './Specials.css';

// How many placeholder cards to show while the dishes load: the same as the number of specials,
// so the section is already the right size and the page doesn't jump when the real cards arrive.
const PLACEHOLDER_COUNT = 3;

function Specials() {
  // One source for every dish: the same file the Menu page reads. A dish with "featured": true
  // in public/data/menu.json appears here, with the same name, price and description as on the menu.
  const { data, loading, error } = useFetch('/data/menu.json');
  const featured = (data ?? []).filter((dish) => dish.featured);

  return (
    <section className="section section-muted specials" aria-labelledby="specials-title">
      {/* The title on the left and the menu link on the right, on wider screens. */}
      <div className="specials-header">
        <div>
          <p className="eyebrow">From our kitchen</p>
          <h2 id="specials-title">This week's specials</h2>
        </div>
        {/* A text link, not another button: the hero above already has the menu button. */}
        <Link to="/menu" className="specials-menu-link">
          View full menu <span aria-hidden="true">→</span>
        </Link>
      </div>

      {loading && (
        <>
          {/* Screen readers hear this. The grey boxes below are only for sighted users, so they're hidden from screen readers. */}
          <p role="status" className="visually-hidden">Loading this week's specials…</p>
          {/* NEW: a "skeleton": grey shapes the size of the real cards, shown while the data loads. */}
          <div className="specials-list" aria-hidden="true" data-testid="specials-skeleton">
            {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
              <div key={index} className="special-card-skeleton">
                <div className="skeleton-block skeleton-image" />
                <div className="skeleton-block skeleton-line" />
                <div className="skeleton-block skeleton-line skeleton-line-short" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* If the file can't load, a calm sentence with the way forward. Not role="alert":
          the rest of the page works, so nothing needs to interrupt the visitor. */}
      {error && (
        <p className="specials-error">
          We couldn't load this week's specials. You can still <Link to="/menu">see the full menu</Link>.
        </p>
      )}

      {data && (
        <ul className="specials-list">
          {featured.map((dish) => (
            <SpecialCard key={dish.id} dish={dish} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default Specials;
