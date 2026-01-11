const API_URL = import.meta.env.VITE_API_URL;

// Admin Sidebar Component Logic
export async function loadSidebar() {
  const sidebarContainer = document.getElementById("adminSidebar");
  if (!sidebarContainer) return;

  try {
    // Load sidebar HTML
    const response = await fetch("/components/adminSidebar.html");
    const html = await response.text();
    sidebarContainer.innerHTML = html;

    // Initialize sidebar functionality
    initSidebar();
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
}

// Set active menu item based on current URL
function setActiveMenu() {
  const currentPath = window.location.pathname;
  const menuLinks = document.querySelectorAll(".menu a");

  menuLinks.forEach((link) => {
    link.classList.remove("active");

    const href = link.getAttribute("href");

    // cocokkan sebagian path agar /admin/attendance match
    if (currentPath.startsWith(href)) {
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
    e.preventDefault();

    if (confirm("Apakah Anda yakin ingin logout?")) {
      try {
        // Show loading state
        logoutBtn.style.opacity = "0.6";
        logoutBtn.style.pointerEvents = "none";

        // Call logout API
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }

        const result = await response.json();
        console.log("Logout successful:", result);

        // Clear any local storage/session storage
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login page
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout error:", error);
        alert("Terjadi kesalahan saat logout. Silakan coba lagi.");

        // Reset button state
        logoutBtn.style.opacity = "1";
        logoutBtn.style.pointerEvents = "auto";
      }
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