// ================================
// Route definitions
// ================================
export const routes = {
  "/": {
    html: "/src/pages/user/landing_page.html",
    css: "/src/css/user/landingPage.css",
    js: ["/src/js/user/landingPage.js"],
  },
  "/register": {
    html: "/src/pages/user/register.html",
    css: "/src/css/user/register.css",
    js: ["/src/js/user/register.js"],
  },
  "/login": {
    html: "/src/pages/user/login.html",
    css: "/src/css/user/login.css",
    js: ["/src/js/user/login.js"],
  },
  "/about": {
    html: "/src/pages/user/about.html",
    css: "/src/css/about.css",
    js: [],
  },
};

// ================================
// Register all JS modules (Vite)
// ================================
const jsModules = import.meta.glob("/src/js/**/*.js");

// ================================
// Load CSS dynamically
// ================================
function loadCSS(href) {
  const link = document.getElementById("page-style");
  if (link) link.href = href || "";
}

// ================================
// Load JS dynamically
// ================================
async function loadJS(jsFiles = []) {
  for (const path of jsFiles) {
    const loader = jsModules[path];

    if (!loader) {
      console.warn(`[router] JS module not found: ${path}`);
      continue;
    }

    const module = await loader();
    if (typeof module.init === "function") {
      module.init();
    }
  }
}

// ================================
// Router
// ================================
export async function router() {
  const path = location.pathname;
  const route = routes[path] || routes["/"];

  // Load HTML
  const html = await fetch(route.html).then((r) => r.text());
  document.getElementById("app").innerHTML = html;

  // Load CSS
  loadCSS(route.css);

  // Load JS
  if (route.js?.length) {
    await loadJS(route.js);
  }
}

// ================================
// Navigation
// ================================
function navigateTo(url) {
  history.pushState(null, "", url);
  router();
}

// ================================
// Intercept SPA links
// ================================
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  e.preventDefault();
  navigateTo(link.getAttribute("href"));
});

// ================================
// Back / forward buttons
// ================================
window.addEventListener("popstate", router);
