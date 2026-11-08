import './Nav.css';
import { NavLink } from 'react-router';

function Nav({ label, listClassName }) {
  return (
    <nav aria-label={label}>
      <ul className={listClassName}>
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/menu">Menu</NavLink></li>
        <li><NavLink to="/reservations">Reservations</NavLink></li>
      </ul>
    </nav>
  );
}

export default Nav;
