// ================================
// Register all JS modules (Vite)
// ================================
import { router } from "./routes/route";
import { PAGES } from "../config/pages";

// LOAD LANDING PAGE PERTAMA
fetch(PAGES.landing)
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("app").innerHTML = html;
  });
router();
