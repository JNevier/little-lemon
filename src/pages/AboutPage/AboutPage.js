import './AboutPage.css';
import Chicago from '../../components/Chicago/Chicago';
import LinkButton from '../../components/LinkButton/LinkButton';

// A section, not <main>: Main already wraps every page in the site's one <main>.
// It reuses the Chicago section from the home page, so the "about" text lives in one place.
function AboutPage() {
  return (
    <section className="about-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>About | Little Lemon</title>
      <div className="about-page-intro">
        <h1>About Little Lemon</h1>
        {/* SAMPLE DATA: this story is made up for the capstone. */}
        <p>
          Little Lemon was opened by two friends, Mario and Adrian, who wanted to share the
          Mediterranean recipes they grew up with. Every dish starts from a family recipe and
          gets a modern twist in our kitchen.
        </p>
      </div>
      <Chicago />
      <div className="about-page-action">
        <p>Want to taste it for yourself?</p>
        <LinkButton to="/reservations">Reserve a Table</LinkButton>
      </div>
    </section>
  );
}

export default AboutPage;
