import { Link } from 'react-router';
import './StoryTeaser.css';

// A short taste of the restaurant's story, with one photo of the owners and a link to the full About page.
// SAMPLE DATA: the story is made up for the capstone (the same story as on the About page).
function StoryTeaser() {
  return (
    <section className="section story-teaser" aria-labelledby="story-title">
      {/* loading="lazy": this photo is far down the page, so it waits until the visitor scrolls near it. */}
      <img
        className="story-teaser-image"
        src="/images/mario-and-adrian-b.jpg"
        alt="Mario and Adrian laughing together in the kitchen, next to a brick pizza oven"
        width="800"
        height="533"
        loading="lazy"
      />
      <div className="story-teaser-text">
        <p className="eyebrow">Our story</p>
        <h2 id="story-title">Two friends, one family kitchen</h2>
        <p>
          Mario and Adrian opened Little Lemon to share the Mediterranean dishes they grew up with.
          Every plate still starts from a family recipe, and the kitchen gives it a modern twist.
        </p>
        <Link to="/about" className="story-teaser-link">
          Read our story <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export default StoryTeaser;
