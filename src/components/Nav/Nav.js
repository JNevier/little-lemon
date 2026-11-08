import './Nav.css';
import { NavLink } from 'react-router';

// The site's main navigation: three page links, then the one main action, "Reserve a Table".
// NavLink adds class="active" and aria-current="page" to the link for the page you're on,
// so screen readers say "current page" and the CSS can underline it.
function Nav({ label }) {
  return (
    <nav aria-label={label}>
      <ul className="nav-list">
        {/* `end`: Home is only "current" on "/" itself, not on every page that starts with "/". */}
        <li><NavLink to="/" end className="nav-link">Home</NavLink></li>
        <li><NavLink to="/about" className="nav-link">About</NavLink></li>
        <li><NavLink to="/menu" className="nav-link">Menu</NavLink></li>
        {/* The main action looks like the yellow button, so it stands out from the plain links.
            It replaces the old "Reservations" text link: one clear way to book, in the same place on every page. */}
        <li className="nav-cta-item">
          <NavLink to="/reservations" className="button button-primary nav-cta">
            Reserve a Table
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
