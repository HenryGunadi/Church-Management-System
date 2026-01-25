import { loadLayout } from "../layout";
import { authMiddleware } from "./authMiddleware";
import { PAGES } from "../../config/pages";

// Route definitions
export const routes = {
  "/": {
    html: PAGES.landing,
    css: [
      "/css/user/userNavbar.css",
      "/css/user/userFooter.css",
      "/css/user/landingPage.css",
    ],
    js: ["/src/js/user/dashboard.js", "/src/js/user/userFooter.js"],
    layout: "user",
  },

  "/register": {
    html: PAGES.register,
    layout: "user",
    css: "/css/user/register.css",
    js: ["/src/js/user/register.js"],
  },

  "/login": {
    html: PAGES.login,
    layout: "user",
    css: "/css/user/login.css",
    js: ["/src/js/user/login.js"],
  },

  "/scan": {
    html: PAGES.userScan,
    css: ["/css/user/scan.css"],
    js: ["/src/js/user/scan.js"],
    meta: { requiresAuth: true, role: "member" },
    layout: null, // No layout needed for scan page
  },

  "/admin/profile": {
    html: PAGES.adminProfile,
    layout: "admin",
    js: ["/src/js/admin/adminProfile.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/dashboard": {
    html: PAGES.adminDashboard,
    layout: "admin",
    css: ["/css/admin/adminSidebar.css", "/css/admin/dashboard.css"],
    js: ["/src/js/admin/dashboard.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/events": {
    html: PAGES.adminEvents,
    layout: "admin",
    css: ["/css/admin/adminSidebar.css", "/css/admin/event.css"],
    js: ["/src/js/admin/event.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/users": {
    html: PAGES.adminUsers,
    layout: "admin",
    css: ["/css/admin/adminSidebar.css", "/css/admin/users.css"],
    js: ["/src/js/admin/users.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/attendance": {
    html: PAGES.adminAttendance,
    layout: "admin",
    css: ["/css/admin/adminSidebar.css", "/css/admin/attendance.css"],
    js: ["/src/js/admin/attendance.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/schedules": {
    html: PAGES.adminEventSchedules,
    layout: "admin",
    css: [
      "/css/admin/adminSidebar.css",
      "/css/admin/event.css",
      "/css/admin/event_schedules.css",
    ],
    js: ["/src/js/admin/event_schedules.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/user/dashboard": {
    html: PAGES.userDashboard,
    css: [
      "/css/user/userNavbar.css",
      "/css/user/userFooter.css",
      "/css/user/landingPage.css",
    ],
    js: ["/src/js/user/dashboard.js", "/src/js/user/userFooter.js"],
    meta: { requiresAuth: true, role: "member" },
    layout: "user",
  },

  "/user/profile": {
    html: PAGES.userProfile,
    css: ["/css/user/userNavbar.css", "/css/user/userProfile.css"],
    js: ["/src/js/user/userProfile.js"],
    meta: { requiresAuth: true, role: "member" },
    layout: "user",
  },

  "/user/about": {
    html: PAGES.userAbout,
    css: [
      "/css/user/userNavbar.css",
      "/css/user/userFooter.css",
      "/css/user/abouts_us.css",
    ],
    js: ["/src/js/user/about.js", "/src/js/user/userFooter.js"],
    meta: { requiresAuth: true, role: "member" },
    layout: "user",
  },

  "/user/event": {
    html: PAGES.userEvent,
    css: [
      "/css/user/userNavbar.css",
      "/css/user/userFooter.css",
      "/css/user/event_page.css",
    ],
    js: ["/src/js/user/event.js"],
    meta: { requiresAuth: true, role: "member" },
    layout: "user",
  },

  "/user/worship": {
    html: PAGES.userWorship,
    css: [
      "/css/user/userNavbar.css",
      "/css/user/userFooter.css",
      "/css/user/worship_schedule.css",
    ],
    js: ["/src/js/user/worship_schedule.js"],
    meta: { requiresAuth: true, role: "member" },
    layout: "user",
  },

  "/user/scan": {
    html: PAGES.userScan,
    css: ["/css/user/scan.css"],
    js: ["/src/js/user/scan.js"],
    meta: { requiresAuth: true, role: "member" },
    layout: "user",
  },

  // not found
  "/404": {
    html: PAGES.notFound,
  },
};

// Register all JS modules (Vite)
const jsModules = import.meta.glob("/src/js/**/*.js");

// Load CSS dynamically
function loadCSS(cssFiles) {
  document
    .querySelectorAll("link[data-page-style]")
    .forEach((link) => link.remove());

  const files = Array.isArray(cssFiles) ? cssFiles : [cssFiles];

  files.forEach((href) => {
    if (href) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-page-style", "true");
      document.head.appendChild(link);
    }
  });
}

// Load JS dynamically
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

export async function router() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("#app not found");
    return;
  }

  const path = location.pathname;
  const route = routes[path] ?? routes["/404"];

  // Check authentication and role
  const result = await authMiddleware(route);
  if (!result.allow) {
    navigateTo(result.redirect);
    return;
  }

  // 1. Load CSS first
  if (route.css) {
    loadCSS(route.css);
  }

  // 2. Load page HTML
  try {
    const html = await fetch(route.html).then((r) => {
      if (!r.ok) throw new Error(`Failed to load page: ${r.status}`);
      return r.text();
    });
    app.innerHTML = html;
    console.log(`✅ Page HTML loaded: ${path}`);
  } catch (err) {
    console.error("❌ Error loading page HTML:", err);
    app.innerHTML = "<h1>Error loading page</h1>";
    return;
  }

  // 3. Wait for DOM to be ready (important!)
  await new Promise((resolve) => requestAnimationFrame(resolve));

  // 4. Load layout components AFTER DOM is ready
  if (route.layout) {
    console.log(`🔄 Loading layout: ${route.layout}`);
    await loadLayout(route.layout);
  }

  // 5. Load and initialize JavaScript last
  if (route.js?.length) {
    await loadJS(route.js);
  }
}

// Navigation
export function navigateTo(url) {
  history.pushState(null, "", url);
  router();
}

// Intercept SPA links
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;

  e.preventDefault();
  navigateTo(link.getAttribute("href"));
});

// Back / forward buttons
window.addEventListener("popstate", router);
