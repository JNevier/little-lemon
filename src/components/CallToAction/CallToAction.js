import './CallToAction.css';
import LinkButton from '../LinkButton/LinkButton';

// The hero at the top of the home page: name, location, short intro and the main booking action.
function CallToAction() {
  return (
    <section className="call-to-action">
      <div className="call-to-action-text">
        <h1>Little Lemon</h1>
        {/* A subtitle of the h1, not a new part of the page, so it's a paragraph. */}
        <p className="call-to-action-subtitle">Chicago</p>
        <p className="call-to-action-lead">
          We are a family owned Mediterranean restaurant, focused on traditional
          recipes served with a modern twist.
        </p>
        <LinkButton to="/reservations">Reserve a Table</LinkButton>
      </div>
      {/* No loading="lazy" here: this photo is visible as soon as the page opens, so it should load right away.
          It's the biggest thing on the first screen, so Lighthouse times it ("Largest Contentful Paint"). */}
      <img
        className="call-to-action-image"
        // Used by browsers that don't understand srcset (very old ones): the full-size photo.
        src="/images/restauranfood.jpg"
        // NEW: srcset lists the same photo in three widths ("480w" means 480 pixels wide).
        // The browser picks the smallest one that still looks sharp on this screen,
        // so a phone downloads about 60-130 KB instead of the full 290 KB.
        srcSet="/images/restauranfood-480.jpg 480w, /images/restauranfood-800.jpg 800w, /images/restauranfood.jpg 1200w"
        // NEW: sizes tells the browser how wide the photo will be shown, BEFORE the CSS has loaded,
        // so it can choose from srcset right away. Read it like if/else, top to bottom:
        // 1024px and wider: about 512px (half of the 64rem content); 768px and wider: half the screen;
        // otherwise (phones): the whole screen width.
        sizes="(min-width: 1024px) 512px, (min-width: 768px) 50vw, 100vw"
        // NEW: fetchPriority="high" tells the browser to download this image before other images,
        // because it's the first thing visitors see.
        fetchPriority="high"
        alt="A server in a black apron holding a slate tray of savoury éclairs topped with salmon, ham and vegetables"
        width="1200"
        height="1813"
      />
    </section>
  );
}

export default CallToAction;
