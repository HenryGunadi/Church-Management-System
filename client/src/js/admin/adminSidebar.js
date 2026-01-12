const API_URL = import.meta.env.VITE_API_URL;

// Admin Sidebar Component Logic
export async function loadSidebar() {
  const sidebarContainer = document.getElementById("adminSidebar");
  if (!sidebarContainer) return;

  try {
    const response = await fetch("/components/adminSidebar.html");
    const html = await response.text();

    // Jika sidebar belum pernah dimuat sebelumnya → isi HTML baru
    if (!sidebarContainer.dataset.loaded) {
      sidebarContainer.innerHTML = html;
      sidebarContainer.dataset.loaded = "true"; // flag agar tidak reload tiap kali
      initSidebar(); // ✅ pasang listener pertama kali
    } else {
      // Jika sudah ada, cukup update active menu
      setActiveMenu();
    }

  } catch (error) {
    console.error("Error loading sidebar:", error);
  }
}


function initSidebar() {
  // Set active menu based on current path
  setActiveMenu();

  // Load user profile data
  loadUserProfile();

  // Setup logout functionality
  setupLogout();

  // Setup menu click handlers
  setupMenuHandlers();
  window.addEventListener("popstate", setActiveMenu);

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
      setTimeout(setActiveMenu, 100);
    }
  });
}

// Set active menu item based on current URL
function setActiveMenu() {
  const currentPath = window.location.pathname;
  const menuLinks = document.querySelectorAll(".menu a");

  menuLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
}

// Load user profile from API or localStorage
async function loadUserProfile() {
  try {
    // Coba ambil dari API
    const response = await fetch(`${API_URL}/admin/profile`, {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      updateProfileUI(data);
    } else {
      // Fallback to default
      updateProfileUI({
        name: "Admin User",
        role: "Admin",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      });
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    // Fallback to default
    updateProfileUI({
      name: "Admin User",
      role: "Admin",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    });
  }
}

// Update profile UI
function updateProfileUI(userData) {
  const nameEl = document.getElementById("adminName");
  const roleEl = document.getElementById("adminRole");
  const avatarEl = document.getElementById("adminAvatar");

  if (nameEl) nameEl.textContent = userData.name || "Admin User";
  if (roleEl) roleEl.textContent = userData.role || "Admin";
  if (avatarEl && userData.avatar) avatarEl.src = userData.avatar;
}

// Setup logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // ✅ Cegah URL berubah ke #
    e.stopPropagation();

    const confirmLogout = confirm("Apakah Anda yakin ingin logout?");
    if (!confirmLogout) return;

    try {
      // Optional: tampilkan loading
      logoutBtn.style.opacity = "0.6";
      logoutBtn.style.pointerEvents = "none";

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Logout failed");

      // Bersihkan session/local storage
      localStorage.clear();
      sessionStorage.clear();

      // Redirect ke halaman login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Gagal logout, silakan coba lagi.");
    } finally {
      // Balikin tampilan tombol
      logoutBtn.style.opacity = "1";
      logoutBtn.style.pointerEvents = "auto";
    }
  });
}


// Setup menu click handlers
function setupMenuHandlers() {
  const menuLinks = document.querySelectorAll(".menu a");

  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Remove active from all
      menuLinks.forEach((l) => l.classList.remove("active"));
      // Add active to clicked
      this.classList.add("active");
    });
  });
}

// Export init function
export function init() {
  loadSidebar();
}