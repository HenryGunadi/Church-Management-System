// User Navbar Component Logic
const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function loadUserNavbar() {
  const navbarContainer = document.getElementById("userNavbar");

  if (!navbarContainer) {
    console.warn("userNavbar container not found in HTML");
    return;
  }

  try {
    // Load navbar HTML - FIXED PATH
    const response = await fetch("/components/userNavbar.html");

    if (!response.ok) {
      throw new Error(`Failed to load navbar: ${response.status}`);
    }

    const html = await response.text();
    navbarContainer.innerHTML = html;

    console.log("User navbar loaded successfully");

    // Wait for next frame to ensure DOM is ready
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Initialize navbar functionality
    initUserNavbar();
  } catch (error) {
    console.error("Error loading user navbar:", error);

    // Fallback: render basic navbar
    navbarContainer.innerHTML = `
      <nav class="navbar" id="navbar">
        <div class="nav-container">
          <a href="/user/dashboard" data-link class="logo">
            <div class="logo-icon">✟</div>
            <span class="logo-text">Grace Chapel</span>
          </a>
          <ul class="nav-links" id="navLinks">
            <li><a href="/user/dashboard" data-link>Home</a></li>
            <li><a href="/user/about" data-link>About</a></li>
            <li><a href="/user/event" data-link>Events</a></li>
          </ul>
        </div>
      </nav>
    `;
  }
}

function initUserNavbar() {
  console.log("🔧 Initializing user navbar...");

  // Wait for DOM to be fully rendered
  setTimeout(() => {
    // Initialize components
    handleMobileMenu();
    handleProfileDropdown();
    handleScrollEffect();
    checkAuthAndLoadProfile(); // Changed: Check auth first
    setupLogout();
    setActiveNavLink();

    console.log("User navbar initialized");
  }, 100);
}

// Mobile Menu Toggle
function handleMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  if (!mobileMenuBtn || !navLinks) {
    console.warn("Mobile menu elements not found");
    return;
  }

  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    // Change icon
    const icon = mobileMenuBtn.querySelector("i");
    if (navLinks.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });

  // Close mobile menu when clicking a link
  const navItems = navLinks.querySelectorAll("a[data-link]");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("active");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      navLinks.classList.remove("active");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });
}

// Profile Dropdown
function handleProfileDropdown() {
  const profileBtn = document.getElementById("profileBtn");
  const profileMenu = document.getElementById("profileMenu");

  if (!profileBtn || !profileMenu) {
    console.warn("Profile dropdown elements not found");
    return;
  }

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileBtn.classList.toggle("active");
    profileMenu.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
      profileBtn.classList.remove("active");
      profileMenu.classList.remove("active");
    }
  });
}

// Scroll Effect
function handleScrollEffect() {
  const navbar = document.getElementById("navbar");
  if (!navbar) {
    console.warn("Navbar element not found");
    return;
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// ✅ NEW: Check Authentication and Toggle UI
async function checkAuthAndLoadProfile() {
  try {
    console.log("Checking authentication status...");

    // Verify if user is logged in
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
      credentials: "include",
    });

    if (!verifyResponse.ok) {
      console.log("User not authenticated - showing login/signup buttons");
      showAuthButtons();
      return;
    }

    const verifyData = await verifyResponse.json();
    
    if (!verifyData.user || !verifyData.user.id) {
      console.log("No valid user data - showing login/signup buttons");
      showAuthButtons();
      return;
    }

    // User is authenticated - load profile
    console.log("User authenticated - showing profile");
    await loadUserProfile(verifyData.user.id, verifyData.user);

  } catch (error) {
    console.error("Error checking auth:", error);
    showAuthButtons();
  }
}

// ✅ Show Login/Sign Up Buttons (for guests)
function showAuthButtons() {
  const navProfile = document.querySelector(".nav-profile");
  const navCta = document.querySelector(".nav-cta");

  if (navProfile) {
    navProfile.style.display = "none";
  }

  if (navCta) {
    navCta.style.display = "flex";
  }

  console.log("✅ Showing auth buttons (Login/Sign Up)");
}

// ✅ Show Profile Dropdown (for logged-in users)
function showProfileDropdown() {
  const navProfile = document.querySelector(".nav-profile");
  const navCta = document.querySelector(".nav-cta");

  if (navProfile) {
    navProfile.style.display = "block";
  }

  if (navCta) {
    navCta.style.display = "none";
  }

  console.log("✅ Showing profile dropdown");
}

// ✅ Load User Profile - Updated to accept fallback data
async function loadUserProfile(userId, fallbackData) {
  try {
    console.log("Loading user profile for navbar...");

    // Try to fetch fresh data from database
    const userResponse = await fetch(`${API_BASE_URL}/user/view?id=${userId}`, {
      credentials: "include",
    });

    let userData;

    if (userResponse.ok) {
      const responseData = await userResponse.json();
      userData = responseData.user || fallbackData;
      console.log("Fresh user data from DB:", userData);
    } else {
      console.warn("Failed to fetch user data from DB, using fallback");
      userData = fallbackData;
    }

    updateProfileUI(userData);
    showProfileDropdown(); // Show profile UI

  } catch (error) {
    console.error("Error loading user profile:", error);
    updateProfileUI(fallbackData);
    showProfileDropdown(); // Still show profile UI with fallback data
  }
}

function updateProfileUI(userData) {
  console.log("📝 Updating navbar profile UI with:", userData);

  const userNameEl = document.getElementById("userName");
  const avatarCircleEl = document.getElementById("userAvatarCircle");

  if (userNameEl) {
    let displayName = "User";

    if (userData.name && userData.name.trim() !== "") {
      displayName = userData.name;
    } else if (userData.email) {
      displayName = userData.email.split("@")[0];
    }

    userNameEl.textContent = displayName;
    console.log("Navbar display name set to:", displayName);
  }

  if (avatarCircleEl) {
    let initials = "U";

    if (userData.name && userData.name.trim() !== "") {
      // Get initials from name
      const nameParts = userData.name.trim().split(" ");

      if (nameParts.length >= 2) {
        // First name + Last name initial
        initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
      } else {
        // Just first letter of name
        initials = nameParts[0][0];
      }
    } else if (userData.email) {
      // Use first letter of email
      initials = userData.email[0];
    }

    avatarCircleEl.textContent = initials.toUpperCase();
    console.log("Navbar initials set to:", initials.toUpperCase());
  }
}

// Set Active Nav Link
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-links a[data-link]");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
}

// Setup Logout
function setupLogout() {
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (!logoutBtn) {
    console.warn("Logout button not found");
    return;
  }

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (confirm("Are you sure you want to logout?")) {
      try {
        // Show loading
        logoutBtn.style.opacity = "0.6";
        logoutBtn.style.pointerEvents = "none";

        // Call logout API
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }

        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/login";
      } catch (error) {
        console.error("Logout error:", error);
        alert("Failed to logout. Please try again.");

        logoutBtn.style.opacity = "1";
        logoutBtn.style.pointerEvents = "auto";
      }
    }
  });
}

export async function refreshNavbarProfile() {
  console.log("Refreshing navbar profile...");
  await checkAuthAndLoadProfile();
}

export function init() {
  loadUserNavbar();
}