import { Link } from 'react-router';

// A link that looks like a button. It goes to another page, so it's a real link (<a>), not a <button>.
// "children" is whatever you put between <LinkButton> and </LinkButton>, for example "Reserve a Table".
// variant: "primary" (yellow, the ONE main action on a screen) or "secondary" (green outline).
// The looks come from the shared .button classes in src/index.css, so links and real buttons match.
function LinkButton({ to, children, variant = 'primary' }) {
  return (
    <Link to={to} className={`button button-${variant}`}>
      {children}
    </Link>
  );
}

export default LinkButton;
