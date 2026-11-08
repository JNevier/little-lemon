import './Highlights.css';

// Three small line icons, drawn with SVG right here, so no icon library is needed.
// They use stroke="currentColor", so they take the CSS text color of the circle they sit in.
// aria-hidden: they're decoration. The heading next to each one says the same thing in words.
function RecipeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {/* An open book: two pages meeting at the spine. */}
      <path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z" />
      <path d="M12 6v14" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {/* A leaf with its middle vein, and a short stem. */}
      <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
      <path d="M5 19 14 10" />
    </svg>
  );
}

function LemonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {/* The lemon motif: an oval fruit, tilted, with a small leaf on top. */}
      <ellipse cx="12" cy="14" rx="7" ry="5.5" transform="rotate(-30 12 14)" />
      <path d="M15 6.5c.5-2 2-3 4-3-.3 2-1.6 3.3-4 3z" />
    </svg>
  );
}

// SAMPLE DATA: Little Lemon is fictional. These are facts about the restaurant (what it does),
// not quotes from customers, so nothing here pretends to be a real review.
const highlights = [
  {
    id: 'recipes',
    Icon: RecipeIcon,
    title: 'Family recipes',
    text: 'Every dish starts from a recipe Mario and Adrian grew up with, cooked with a modern twist.',
  },
  {
    id: 'produce',
    Icon: LeafIcon,
    title: 'Fresh, seasonal produce',
    text: 'Our menu changes with the seasons, with vegetables and herbs from farms near Chicago.',
  },
  {
    id: 'bistro',
    Icon: LemonIcon,
    title: 'A neighborhood bistro',
    text: 'A relaxed room for date nights, families and friends, with tables for 1 to 10 guests.',
  },
];

// "Why Little Lemon": three short reasons to visit, each with an icon.
// aria-labelledby names the section after its heading, so screen readers list it as "Why Little Lemon".
function Highlights() {
  return (
    <section className="section highlights" aria-labelledby="highlights-title">
      <p className="eyebrow">Why Little Lemon</p>
      <h2 id="highlights-title">Simple food, made with care</h2>
      <ul className="highlights-list">
        {/* The icon is a component stored in the object, so its name must start with a capital
            letter (Icon). React treats lowercase names as plain HTML tags. */}
        {highlights.map(({ id, Icon, title, text }) => (
          <li key={id} className="highlights-item">
            <span className="highlights-icon">
              <Icon />
            </span>
            <h3 className="highlights-title">{title}</h3>
            <p className="highlights-text">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Highlights;
