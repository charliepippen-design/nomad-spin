import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";
import { loadLocale } from "./i18n/dictionary";
import { parsePath } from "./i18n/paths";

// Load the language of the URL before the first paint, so a translated page
// never flashes empty while its text is fetched.
loadLocale(parsePath(window.location.pathname).locale)
  .catch(() => undefined)
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <>
        <App />
        <Analytics />
      </>,
    );
  });
