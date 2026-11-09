import './ErrorBoundary.css';
import { Component } from 'react';
import { Link } from 'react-router';

// NEW: an error boundary. If any component inside it throws an error while drawing the page,
// React would normally remove the WHOLE app and leave a blank white page. A boundary catches the error
// and draws a friendly message in its place instead. Main wraps the pages in one, so the header and
// footer stay on screen and the visitor can carry on.
//
// It's a class component (written with "class ... extends Component") because catching errors needs
// two special methods that only classes have: getDerivedStateFromError and componentDidCatch.
// This is the one thing React still needs a class for; everything else on this site is a function.
//
// What it does NOT catch: errors inside event handlers (like a button's onClick), in code that runs
// later (setTimeout, fetch), or in the boundary itself. Those don't happen while React is drawing,
// so they're handled where they happen (for example with try/catch, as useLocalStorage does).
class ErrorBoundary extends Component {
  // A class keeps its state in this.state. hasError starts false: draw the page as normal.
  state = { hasError: false };

  // React calls this when a component inside throws while drawing. The object it returns is merged
  // into this.state, so the next draw shows the fallback instead of the broken page.
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Also called after an error: a place to report it. Here it's written to the browser console,
  // so a developer can see what went wrong.
  componentDidCatch(error, info) {
    console.error('Little Lemon caught an error:', error, info.componentStack);
  }

  // Called after every update. Main passes the current page address as resetKey; when it changes
  // (the visitor used the header or the "Back to the home page" link), try drawing the new page again.
  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary page-fill">
          <div className="card error-boundary-card" role="alert">
            <h1>Something went wrong</h1>
            <p>Sorry, this page couldn't be shown. You can reload it, or go back to the home page.</p>
            <div className="error-boundary-actions">
              {/* Reloading starts the whole app again, which often clears a one-off problem. */}
              <button type="button" className="button button-primary" onClick={() => window.location.reload()}>
                Reload
              </button>
              <Link to="/" className="button button-secondary">Back to the home page</Link>
            </div>
          </div>
        </div>
      );
    }
    // No error: draw whatever was placed inside <ErrorBoundary> ... </ErrorBoundary>.
    return this.props.children;
  }
}

export default ErrorBoundary;
