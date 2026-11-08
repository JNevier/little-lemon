// Small line icons, drawn with SVG right here, so no icon library is needed.
// They use stroke="currentColor", so they take the CSS text color of whatever they sit in.
// aria-hidden: they're decoration. The text next to each one says the same thing in words.
// Every icon shares the same frame (a 24x24 drawing area, 28px on screen, rounded line ends),
// so only the drawing inside changes.
function IconFrame({ children }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

// An open book: two pages meeting at the spine.
export function RecipeIcon() {
  return (
    <IconFrame>
      <path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5z" />
      <path d="M12 6v14" />
    </IconFrame>
  );
}

// A leaf with its middle vein, and a short stem.
export function LeafIcon() {
  return (
    <IconFrame>
      <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
      <path d="M5 19 14 10" />
    </IconFrame>
  );
}

// The lemon motif: an oval fruit, tilted, with a small leaf on top.
export function LemonIcon() {
  return (
    <IconFrame>
      <ellipse cx="12" cy="14" rx="7" ry="5.5" transform="rotate(-30 12 14)" />
      <path d="M15 6.5c.5-2 2-3 4-3-.3 2-1.6 3.3-4 3z" />
    </IconFrame>
  );
}

// A shared plate seen from above: a big circle with a smaller one inside.
export function PlateIcon() {
  return (
    <IconFrame>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </IconFrame>
  );
}

// A circle of two arrows chasing each other: "use it again", nothing wasted.
export function CycleIcon() {
  return (
    <IconFrame>
      <path d="M20 12a8 8 0 0 1-14 5.3" />
      <path d="M4 12a8 8 0 0 1 14-5.3" />
      <path d="M18 3v4h-4" />
      <path d="M6 21v-4h4" />
    </IconFrame>
  );
}

// Two people side by side: everyone is welcome.
export function PeopleIcon() {
  return (
    <IconFrame>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.2c2.8.2 5 2.4 5 5.8" />
    </IconFrame>
  );
}
