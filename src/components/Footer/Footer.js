import './Footer.css';
import { Link } from 'react-router';

// The links in the footer's bottom row. A short list, because the header already has the full navigation.
const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/reservations', label: 'Reserve' },
];

// SAMPLE DATA: Little Lemon is a fictional restaurant. The address, hours, phone number and email are made up.
// - 555-01xx phone numbers are reserved for fiction, so they never reach a real person.
// - ".example" is a reserved domain, so the email can't belong to anyone either.
// - The hours match the booking form: the course API offers tables from 17:00 to 23:30.
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
            678 Pisa Ave
            <br />
            Chicago, IL 60611
          </address>
        </div>

        <div className="footer-block">
          <h2 className="footer-heading">Hours</h2>
          <p className="footer-text">
            Daily, 5 pm to midnight
            <br />
            Last table at 11:30 pm
          </p>
        </div>

        <div className="footer-block footer-contact">
          <h2 className="footer-heading">Contact</h2>
          {/* "tel:" and "mailto:" links open the phone app or email app.
              Side by side on phones (to keep the footer short), stacked on wider screens. */}
          <p className="footer-text footer-contact-links">
            <a href="tel:+13125550123">(312) 555-0123</a>
            <a href="mailto:hello@littlelemon.example">hello@littlelemon.example</a>
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
        <p className="footer-copyright">© 2026 Little Lemon · A fictional restaurant</p>
      </div>
    </footer>
  );
}

export default Footer;
