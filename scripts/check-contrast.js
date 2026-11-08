// Checks the color contrast of every text/background pair the site uses, against WCAG 2.1 level AA.
// Run it with:  node scripts/check-contrast.js
// No packages: it's the math from the WCAG spec, written out by hand.
//
// AA rules:
//   - normal text needs at least 4.5:1
//   - large text (24px+, or 18.66px+ bold) and UI parts (borders, focus rings, icons) need at least 3:1

// The brand colors. Keep these the same as the variables in src/index.css.
const colors = {
  green: '#495e57',
  yellow: '#f4ce14',
  salmon: '#ee9972',
  peach: '#fbdabb',
  light: '#edefee',
  dark: '#333333',
  white: '#ffffff',
  // A deep terracotta from the salmon family, for error marks. Salmon itself is too light (2.2:1 on white).
  error: '#b8501f',
};

// Every pair used on the site: [text or part color, background color, 'text' or 'large' or 'ui', where it's used].
const pairs = [
  ['dark', 'white', 'text', 'Body text on the page'],
  ['dark', 'light', 'text', 'Body text on grey bands'],
  ['dark', 'peach', 'text', 'Text on peach header bands'],
  ['green', 'white', 'text', 'Links, prices, secondary buttons on white'],
  ['green', 'light', 'text', 'Links and prices on grey bands'],
  ['green', 'peach', 'text', 'Links on peach, secondary button hover'],
  ['dark', 'yellow', 'text', 'Primary button text'],
  ['dark', 'salmon', 'text', 'Primary button hover'],
  ['white', 'green', 'text', 'Text on green bands and the footer'],
  ['light', 'green', 'text', 'Footer text'],
  ['yellow', 'green', 'large', 'Hero title on green (large text only)'],
  ['yellow', 'green', 'ui', 'Focus ring on green'],
  ['green', 'white', 'ui', 'Focus rings, borders, active underline on white'],
  ['dark', 'yellow', 'ui', 'Focus ring around the yellow button'],
  ['error', 'white', 'ui', 'Error bar and icon beside a message (the text says what is wrong too)'],
  ['error', 'light', 'ui', 'Error bar on a grey band'],
  ['error', 'white', 'text', 'Error heading text on white'],
];

// WCAG "relative luminance": how bright a color looks, from 0 (black) to 1 (white).
function luminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// The contrast ratio: (lighter + 0.05) / (darker + 0.05). It goes from 1:1 (same color) to 21:1 (black on white).
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const needed = { text: 4.5, large: 3, ui: 3 };
let failures = 0;

console.log('| Foreground | Background | Ratio | Needs | Result | Used for |');
console.log('| --- | --- | --- | --- | --- | --- |');
for (const [fg, bg, kind, use] of pairs) {
  const ratio = contrast(colors[fg], colors[bg]);
  const pass = ratio >= needed[kind];
  if (!pass) failures += 1;
  console.log(`| ${fg} | ${bg} | ${ratio.toFixed(2)}:1 | ${needed[kind]}:1 | ${pass ? 'Pass' : 'FAIL'} | ${use} |`);
}

// A non-zero exit code makes the command "fail", so it would stop a script or a CI check.
if (failures > 0) {
  console.error(`\n${failures} pair(s) fail WCAG AA.`);
  process.exit(1);
}
