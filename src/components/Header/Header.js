import './Header.css';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import Nav from '../Nav/Nav';

// On phones the six links take a third of the screen, so they hide behind a menu button.
// From 768px up the CSS always shows the links and hides the button (see Header.css),
// so `menuOpen` only matters on small screens.
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  // useRef gives us a direct handle on the button's DOM element, so we can move focus back to it.
  const menuButtonRef = useRef(null);
  const location = useLocation();

  // Close the menu whenever the page changes (a link was tapped, or the Back button was used).
  // The effect runs again each time the path changes, because it's in the dependency list.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Escape closes an open menu, a common keyboard shortcut for menus and pop-ups.
  // Focus goes back to the button, so keyboard users don't get lost on a link that just disappeared.
  function handleKeyDown(event) {
    if (event.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
      menuButtonRef.current.focus();
    }
  }

  return (
    // The key listener is on the whole header, so Escape works from the button or from any link.
    <header className="header" onKeyDown={handleKeyDown}>
      <img className="header-logo" src="/images/logo-green-yellow-lemon.png" alt="Little Lemon logo" />
      <button
        type="button"
        className="header-menu-button"
        ref={menuButtonRef}
        // Screen readers say "expanded" or "collapsed", so users know if the menu is open.
        aria-expanded={menuOpen}
        // Points at the element this button shows and hides.
        aria-controls="header-menu"
        // The button only has an icon, so this gives it a name. Not "Menu", because "Menu" is already
        // the name of the link to the food menu page.
        aria-label="Site navigation"
        // `!menuOpen` flips true to false and false to true.
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {/* Three lines (a "hamburger" icon). aria-hidden: the aria-label already names the button. */}
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {/* The class decides if the links show on phones: "header-menu-open" is added only when menuOpen is true. */}
      <div id="header-menu" className={menuOpen ? 'header-menu header-menu-open' : 'header-menu'}>
        <Nav label="Main" listClassName="nav-list" />
      </div>
    </header>
  );
}

export default Header;
