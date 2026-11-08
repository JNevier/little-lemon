import './NotFoundPage.css';
import { Link } from 'react-router';
import LinkButton from '../../components/LinkButton/LinkButton';
import { LemonIcon } from '../../components/Icons/Icons';

// A plain div, not <main>: Main already wraps every page in the site's one <main>.
function NotFoundPage() {
  return (
    <div className="not-found-page page-fill">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Page Not Found | Little Lemon</title>
      <div className="card not-found-page-card">
        {/* The lemon motif in a peach circle, as on the home and About pages. Decoration only. */}
        <span className="not-found-page-icon">
          <LemonIcon />
        </span>
        <p className="eyebrow">Error 404</p>
        <h1>Page not found</h1>
        <p className="lead">We couldn't find that page. It may have moved, or the address may have a typo.</p>
        {/* The way back home is the main action; the menu is a second choice. */}
        <div className="not-found-page-actions">
          <LinkButton to="/">Back to the home page</LinkButton>
          <LinkButton to="/menu" variant="secondary">See the menu</LinkButton>
        </div>
        <p className="not-found-page-reserve">
          Looking to book? <Link to="/reservations">Reserve a table</Link>
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
