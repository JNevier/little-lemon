import './AboutPage.css';
import LinkButton from '../../components/LinkButton/LinkButton';
import FeatureList from '../../components/FeatureList/FeatureList';
import { PlateIcon, CycleIcon, PeopleIcon } from '../../components/Icons/Icons';

// SAMPLE DATA: Little Lemon is fictional. The story, the values and the owners' bios are made up
// for the capstone (listed in the README under "Sample data"). No awards, press or quotes.

// "What we believe": different points from the home page's "Why Little Lemon", so the two pages
// don't repeat each other. Home says what you get; this says how the restaurant works.
const values = [
  {
    id: 'share',
    Icon: PlateIcon,
    title: 'Made to share',
    text: 'Plates go in the middle of the table, the way our families always ate.',
  },
  {
    id: 'waste',
    Icon: CycleIcon,
    title: 'Nothing wasted',
    text: 'We cook in small batches each day, so the kitchen throws away as little as possible.',
  },
  {
    id: 'welcome',
    Icon: PeopleIcon,
    title: 'Everyone at the table',
    text: "There's a vegetarian choice in every course, and we're glad to adapt a dish for an allergy.",
  },
];

const owners = [
  {
    id: 'mario',
    name: 'Mario',
    role: 'Chef and co-owner',
    bio: "Mario learned to cook in his grandmother's kitchen and still makes every sauce from her recipes. He runs the kitchen and plans the weekly specials.",
  },
  {
    id: 'adrian',
    name: 'Adrian',
    role: 'Co-owner and host',
    bio: 'Adrian added the modern twists to the menu and looks after the dining room, from the drinks list to your table.',
  },
];

// A plain div, not <main>: Main already wraps every page in the site's one <main>.
function AboutPage() {
  return (
    <div className="about-page">
      {/* React 19 moves this into the page's <head>, so the browser tab says where you are. */}
      <title>About | Little Lemon</title>

      <div className="page-header">
        <p className="eyebrow">About Little Lemon</p>
        <h1>Our story</h1>
        <p className="lead">A family-owned Mediterranean bistro in Chicago, run by two friends who love to cook.</p>
      </div>

      {/* The story: two short paragraphs next to the two overlapping photos of the owners. */}
      <section className="section about-story" aria-labelledby="about-story-title">
        <div className="about-story-text">
          <h2 id="about-story-title">From a family kitchen to Pisa Avenue</h2>
          <p>
            Little Lemon was opened by two friends, Mario and Adrian, who wanted to share the
            Mediterranean recipes they grew up with. Every dish starts from a family recipe and
            gets a modern twist in our kitchen.
          </p>
          <p>
            Today it's a relaxed neighborhood bistro with simple food and classic drinks. The menu
            follows the seasons, and a few dishes change every week.
          </p>
        </div>
        {/* Two photos that overlap, as in the course design.
            loading="lazy": they're below the first screen on phones, so they load as you scroll near them. */}
        <div className="about-story-photos">
          <img
            className="about-story-photo about-story-photo-back"
            src="/images/mario-and-adrian-a.jpg"
            alt="Mario and Adrian talking over a row of dishes in the restaurant kitchen"
            width="800"
            height="533"
            loading="lazy"
          />
          <img
            className="about-story-photo about-story-photo-front"
            src="/images/mario-and-adrian-b.jpg"
            alt="Mario and Adrian laughing together in the kitchen, next to a brick pizza oven"
            width="800"
            height="533"
            loading="lazy"
          />
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="about-values-title">
        <p className="eyebrow">What we believe</p>
        <h2 id="about-values-title">How we run our kitchen</h2>
        <FeatureList items={values} />
      </section>

      <section className="section" aria-labelledby="about-owners-title">
        <p className="eyebrow">Meet the owners</p>
        <h2 id="about-owners-title">Mario and Adrian</h2>
        <ul className="about-owners">
          {owners.map((owner) => (
            <li key={owner.id} className="card about-owner">
              {/* The first letter in a green circle, as a simple badge. It repeats the name next to it,
                  so screen readers skip it. */}
              <span className="about-owner-initial" aria-hidden="true">{owner.name[0]}</span>
              <div>
                <h3 className="about-owner-name">{owner.name}</h3>
                <p className="about-owner-role">{owner.role}</p>
                <p className="about-owner-bio">{owner.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* The closing band: a green panel with the one main action. It sits inside a white section,
          so it doesn't run straight into the green footer below. */}
      <section className="section" aria-labelledby="about-closing-title">
        <div className="about-closing">
          <h2 id="about-closing-title">Come hungry</h2>
          <p className="lead">Book a table and taste the recipes for yourself.</p>
          <LinkButton to="/reservations">Reserve a Table</LinkButton>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
