import './SkipLink.css';

// A "Skip to main content" link: the very first thing a keyboard user reaches with Tab.
// It lets them jump over the logo and the six nav links on every page (WCAG 2.4.1 "Bypass Blocks").
// It's hidden off-screen until it gets focus (see SkipLink.css), so mouse users never see it.
function SkipLink() {
  // href="#main-content" works on its own: the browser jumps to the element with that id.
  // The click handler also moves keyboard focus there, so the NEXT Tab press continues from the
  // page content (some browsers only scroll on a # link and leave focus behind). preventDefault
  // stops "#main-content" from being added to the address bar.
  function handleClick(event) {
    event.preventDefault();
    document.getElementById('main-content').focus();
  }

  return (
    <a href="#main-content" className="skip-link" onClick={handleClick}>
      Skip to main content
    </a>
  );
}

export default SkipLink;
