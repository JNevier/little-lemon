import './FeatureList.css';

// A row of short points, each with an icon in a peach circle, a title and one sentence.
// Used for "Why Little Lemon" on the home page and "What we believe" on the About page:
// the same look, with different words, passed in as `items`.
// Each item: { id, Icon, title, text }. Icon is a component (from components/Icons).
function FeatureList({ items }) {
  return (
    <ul className="feature-list">
      {/* The icon is a component stored in the object, so its name must start with a capital
          letter (Icon). React treats lowercase names as plain HTML tags. */}
      {items.map(({ id, Icon, title, text }) => (
        <li key={id} className="feature-list-item">
          <span className="feature-list-icon">
            <Icon />
          </span>
          <h3 className="feature-list-title">{title}</h3>
          <p className="feature-list-text">{text}</p>
        </li>
      ))}
    </ul>
  );
}

export default FeatureList;
