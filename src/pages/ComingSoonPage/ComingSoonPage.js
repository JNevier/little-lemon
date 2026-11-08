import './ComingSoonPage.css';
import LinkButton from '../../components/LinkButton/LinkButton';

// One page for every feature that isn't built yet (Order Online, Login).
// The `title` prop says which feature it is, so we don't need a copy of this file per feature.
// A section, not <main>: Main already wraps every page in the site's one <main>.
function ComingSoonPage({ title }) {
  return (
    <section className="coming-soon-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>{`${title} | Little Lemon`}</title>
      <h1>{title}</h1>
      <p>
        {title} is coming soon. In the meantime, you can reserve a table online or call us
        at (312) 555-0123.
      </p>
      <LinkButton to="/">Back to Home</LinkButton>
    </section>
  );
}

export default ComingSoonPage;
