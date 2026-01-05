// ================================
// Register all JS modules (Vite)
// ================================
import { router } from "./routes/route";

// LOAD LANDING PAGE PERTAMA
fetch("/src/pages/user/landing_page.html")
  .then((res) => res.text())
  .then((html) => {
    app.innerHTML = html;
  });
router();
