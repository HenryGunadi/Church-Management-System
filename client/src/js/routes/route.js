import { authMiddleware } from "./authMiddleware";

// Route definitions
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

  "/admin/profile": {
    html: "/src/pages/admin/adminProfile.html",
    js: ["/src/js/admin/adminProfile.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/dashboard": {
    html: "/src/pages/admin/dashboard.html",
    css: [
      "/src/css/admin/adminSidebar.css",  
      "/src/css/admin/dashboard.css"
    ],
    js: ["/src/js/admin/dashboard.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/events": {
    html: "/src/pages/admin/event.html",
    css: [
      "/src/css/admin/adminSidebar.css",
      "/src/css/admin/event.css"
    ],
    js: ["/src/js/admin/event.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/admin/users": {
    html: "/src/pages/admin/users.html",
    css: [
      "/src/css/admin/adminSidebar.css",
      "/src/css/admin/users.css"
    ],
    js: ["/src/js/admin/users.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

    "/admin/attendance": {
    html: "/src/pages/admin/attendance.html",
    css: [
      "/src/css/admin/adminSidebar.css",
      "/src/css/admin/attendance.css"
    ],
    js: ["/src/js/admin/attendance.js"],
    meta: { requiresAuth: true, role: "admin" },
  },

  "/user/dashboard": {
    html: "/src/pages/user/dashboard.html",
    css: "/src/css/user/landingPage.css",
    js: ["/src/js/user/dashboard.js"],
    meta: { requiresAuth: true, role: "member" },
  },

  "/user/profile": {
    html: "/src/pages/user/userProfile.html",
    css: "/src/css/user/userProfile.css",
    js: ["/src/js/user/userProfile.js"],
    meta: { requiresAuth: true, role: "member" },
  },

  "/user/about": {
    html: "/src/pages/user/about_us.html",
    css: "/src/css/user/abouts_us.css",
    js: [],
    meta: { requiresAuth: true, role: "member" },
  },

  "/user/event": {
    html: "/src/pages/user/event_page.html",
    css: "/src/css/user/event_page.css",
    js: [],
    meta: { requiresAuth: true, role: "member" },
  },

   "/user/Ministries": {
    html: "/src/pages/user/ministries.html",
    css: "/src/css/user/ministries.css",
    js: ["/src/js/user/ministries.js"],
    meta: { requiresAuth: true, role: "member" },
  },

  "/user/Worship": {
    html: "/src/pages/user/worship_schedule.html",
    css: "/src/css/user/worship_schedule.css",
    js: ["/src/js/user/worship_schedule.js"],
    meta: { requiresAuth: true, role: "member" },
  },
};

// Register all JS modules (Vite)
const jsModules = import.meta.glob("/src/js/**/*.js");

// Load CSS dynamically
// Load CSS dynamically
function loadCSS(cssFiles) {
  // Remove existing page styles
  document.querySelectorAll('link[data-page-style]').forEach(link => link.remove());
  
  // Handle array or single CSS
  const files = Array.isArray(cssFiles) ? cssFiles : [cssFiles];
  
  files.forEach(href => {
    if (href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-page-style', 'true');
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
  const path = location.pathname;
  const route = routes[path] || routes["/"];

  // Cek autentikasi dan role
  const result = await authMiddleware(route);
  if (!result.allow) {
    navigateTo(result.redirect);
    return;
  }

  // Ambil HTML halaman
  const html = await fetch(route.html).then((r) => r.text());
  document.getElementById("app").innerHTML = html;

  // Load CSS dinamis
  loadCSS(route.css);

  // Load JS dinamis
  if (route.js?.length) {
    await loadJS(route.js);
  }

  /* 🧠 Tambahkan logika khusus di bawah sini */
  // Jika halaman admin events → panggil initEventPage() dari event.js
  if (path === "/admin/events") {
    try {
      const { initEventPage } = await import("/src/js/admin/event.js");
      await initEventPage();
    } catch (err) {
      console.error("❌ Gagal inisialisasi halaman event:", err);
    }
  }
}

// Navigation
function navigateTo(url) {
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

async function checkAuth() {
  try {
    const res = await fetch("http://localhost:3000/api/auth/verify", {
      credentials: "include",
    });

    if (!res.ok) return { authenticated: false };
    return res.json();
  } catch (err) {
    return { authenticated: false };
  }
}
