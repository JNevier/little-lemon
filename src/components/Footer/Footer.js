import './Footer.css';
import { Link } from 'react-router';
import restaurant from '../../data/restaurant';

// The links in the footer's bottom row. A short list, because the header already has the full navigation.
const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/reservations', label: 'Reserve' },
];

// The address, hours and contact details are sample data, kept in src/data/restaurant.js
// (the home page's "Visit us" section shows the same details).
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          {/* The yellow lemon icon is decoration (empty alt); the words "Little Lemon" name the link. */}
          <Link to="/" className="footer-wordmark">
            <img className="footer-wordmark-icon" src="/images/lemon-yellow.png" alt="" width="20" height="34" />
            Little Lemon
          </Link>
          <p className="footer-tagline">A family-owned Mediterranean bistro in Chicago.</p>
        </div>

        {/* The footer's small headings are real h2s, so screen readers can jump between them. */}
        <div className="footer-block">
          <h2 className="footer-heading">Visit</h2>
          {/* <address> marks contact details for the site's owner. */}
          <address className="footer-text">
            {restaurant.street}
            <br />
            {restaurant.city}
          </address>
        </div>

        <div className="footer-block">
          <h2 className="footer-heading">Hours</h2>
          <p className="footer-text">
            {restaurant.hours}
            <br />
            {restaurant.lastTable}
          </p>
        </div>

        <div className="footer-block footer-contact">
          <h2 className="footer-heading">Contact</h2>
          {/* "tel:" and "mailto:" links open the phone app or email app.
              Side by side on phones (to keep the footer short), stacked on wider screens. */}
          <p className="footer-text footer-contact-links">
            <a href={restaurant.phoneLink}>{restaurant.phone}</a>
            <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <nav aria-label="Footer">
          <ul className="footer-links">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* The photos on this site belong to the people who took them, not to Little Lemon.
            The README's Credits section has the details. */}
        <p className="footer-copyright">
          © 2026 Little Lemon · A fictional restaurant · Credits to the owners of the photos
        </p>
      </div>
    </footer>
  );
}

export default Footer;
