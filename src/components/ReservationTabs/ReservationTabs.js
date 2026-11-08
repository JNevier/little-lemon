import './ReservationTabs.css';
import { NavLink } from 'react-router';

// Two tabs shared by the booking page and My Reservations, so you can switch between them in one click.
// They're real links (they go to another page), inside a <nav> named "Reservations".
// NavLink adds class="active" and aria-current="page" to the tab for the page you're on,
// so screen readers say "current page" and the CSS can underline it.
function ReservationTabs() {
  return (
    <nav className="reservation-tabs" aria-label="Reservations">
      <NavLink to="/reservations" className="reservation-tab">Book a table</NavLink>
      <NavLink to="/my-reservations" className="reservation-tab">My reservations</NavLink>
    </nav>
  );
}

export default ReservationTabs;
