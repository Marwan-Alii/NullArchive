import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router doesn't auto-scroll to #hash targets the way a plain
 * multi-page site does. This fixes links like /about#contributing so they
 * actually land on the right section instead of just the top of the page.
 */
export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Wait a tick for the new page's content to render before scrolling.
      const id = location.hash.slice(1);
      const timeout = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return () => clearTimeout(timeout);
    }
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  return null;
}
