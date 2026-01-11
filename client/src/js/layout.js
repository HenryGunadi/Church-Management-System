const loadedCSS = new Set();

function loadCSSOnce(href) {
  if (loadedCSS.has(href)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-layout-style", "true");
  document.head.appendChild(link);

  loadedCSS.add(href);
}

export async function loadLayout(type) {
  if (type === "user") {
    loadCSSOnce("/css/user/userNavbar.css");
    loadCSSOnce("/css/user/userFooter.css");

    const navbarContainer = document.querySelector("#userNavbar");
    const footerContainer = document.querySelector("#userFooter");

    if (navbarContainer) {
      try {
        const navbarHTML = await fetch("/components/userNavbar.html").then(
          (r) => {
            if (!r.ok) throw new Error(`Failed to load navbar: ${r.status}`);
            return r.text();
          }
        );
        navbarContainer.innerHTML = navbarHTML;
        console.log("✅ Navbar loaded successfully");
      } catch (err) {
        console.error("❌ Error loading navbar:", err);
      }
    } else {
      console.warn("⚠️ #userNavbar container not found in DOM");
    }

    if (footerContainer) {
      try {
        const footerHTML = await fetch("/components/userFooter.html").then(
          (r) => {
            if (!r.ok) throw new Error(`Failed to load footer: ${r.status}`);
            return r.text();
          }
        );
        footerContainer.innerHTML = footerHTML;
        console.log("✅ Footer loaded successfully");
      } catch (err) {
        console.error("❌ Error loading footer:", err);
      }
    } else {
      console.warn("⚠️ #userFooter container not found in DOM");
    }
  }

  if (type === "admin") {
    loadCSSOnce("/css/admin/adminSidebar.css");

    const sidebarContainer = document.querySelector("#adminSidebar");
    if (sidebarContainer) {
      try {
        const sidebarHTML = await fetch("/components/adminSidebar.html").then(
          (r) => {
            if (!r.ok) throw new Error(`Failed to load sidebar: ${r.status}`);
            return r.text();
          }
        );
        sidebarContainer.innerHTML = sidebarHTML;
        console.log("✅ Admin sidebar loaded successfully");
      } catch (err) {
        console.error("❌ Error loading admin sidebar:", err);
      }
    } else {
      console.warn("⚠️ #adminSidebar container not found in DOM");
    }
  }
}
