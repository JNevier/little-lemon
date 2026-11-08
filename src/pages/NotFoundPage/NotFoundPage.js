import './NotFoundPage.css';
import LinkButton from '../../components/LinkButton/LinkButton';

// A section, not <main>: Main already wraps every page in the site's one <main>.
function NotFoundPage() {
  return (
    <section className="not-found-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>Page Not Found | Little Lemon</title>
      <h1>Page not found</h1>
      <p>We couldn't find that page.</p>
      {/* A LinkButton, like the other pages: big enough to tap easily on a phone. */}
      <LinkButton to="/">Back to the home page</LinkButton>
    </section>
  );
}

export default NotFoundPage;
