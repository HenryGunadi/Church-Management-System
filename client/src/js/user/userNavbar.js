// User Navbar Component Logic
const API_BASE_URL = 'http://localhost:3000';

export async function loadUserNavbar() {
  const navbarContainer = document.getElementById('userNavbar');
  
  if (!navbarContainer) {
    console.warn('userNavbar container not found in HTML');
    return;
  }

  try {
    // Load navbar HTML - FIXED PATH
    const response = await fetch('/src/components/userNavbar.html');
    
    if (!response.ok) {
      throw new Error(`Failed to load navbar: ${response.status}`);
    }
    
    const html = await response.text();
    navbarContainer.innerHTML = html;

    console.log('User navbar loaded successfully');

    // Wait for next frame to ensure DOM is ready
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Initialize navbar functionality
    initUserNavbar();
  } catch (error) {
    console.error('Error loading user navbar:', error);
    
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
  console.log('🔧 Initializing user navbar...');
  
  // Wait for DOM to be fully rendered
  setTimeout(() => {
    // Initialize components
    handleMobileMenu();
    handleProfileDropdown();
    handleScrollEffect();
    loadUserProfile();
    setupLogout();
    setActiveNavLink();
    
    console.log('User navbar initialized');
  }, 100); 
}

// Mobile Menu Toggle
function handleMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  
  if (!mobileMenuBtn || !navLinks) {
    console.warn('Mobile menu elements not found');
    return;
  }

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Change icon
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });

  // Close mobile menu when clicking a link
  const navItems = navLinks.querySelectorAll('a[data-link]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      navLinks.classList.remove('active');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });
}

// Profile Dropdown
function handleProfileDropdown() {
  const profileBtn = document.getElementById('profileBtn');
  const profileMenu = document.getElementById('profileMenu');
  
  if (!profileBtn || !profileMenu) {
    console.warn('Profile dropdown elements not found');
    return;
  }

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileBtn.classList.toggle('active');
    profileMenu.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
      profileBtn.classList.remove('active');
      profileMenu.classList.remove('active');
    }
  });
}

// Scroll Effect
function handleScrollEffect() {
  const navbar = document.getElementById('navbar');
  if (!navbar) {
    console.warn('Navbar element not found');
    return;
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ✅ Load User Profile - FIXED to fetch from database
async function loadUserProfile() {
  try {
    console.log('Loading user profile for navbar...');
    
    // First get user ID from token
    const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      credentials: 'include'
    });

    if (!verifyResponse.ok) {
      console.warn(' Auth verify failed:', verifyResponse.status);
      updateProfileUI({
        name: null,
        email: 'guest@example.com'
      });
      return;
    }

    const verifyData = await verifyResponse.json();
    console.log('Token verified:', verifyData);
    
    if (!verifyData.user || !verifyData.user.id) {
      console.warn('No user ID in token');
      updateProfileUI({
        name: null,
        email: verifyData.user?.email || 'guest@example.com'
      });
      return;
    }

    const userId = verifyData.user.id;

    const userResponse = await fetch(`${API_BASE_URL}/api/user/view?id=${userId}`, {
      credentials: 'include'
    });

    if (!userResponse.ok) {
      console.warn('Failed to fetch user data from DB');
      // Fallback to token data
      updateProfileUI(verifyData.user);
      return;
    }

    const userData = await userResponse.json();
    console.log('Fresh user data from DB:', userData);

    if (userData.user) {
      updateProfileUI(userData.user);
    } else {
      console.warn('No user data in response');
      updateProfileUI(verifyData.user);
    }

  } catch (error) {
    console.error('Error loading user profile:', error);
    updateProfileUI({
      name: null,
      email: 'user@example.com'
    });
  }
}

function updateProfileUI(userData) {
  console.log('📝 Updating navbar profile UI with:', userData);
  
  const userNameEl = document.getElementById('userName');
  const avatarCircleEl = document.getElementById('userAvatarCircle');

  if (userNameEl) {
    let displayName = 'User';
    
    if (userData.name && userData.name.trim() !== '') {
      displayName = userData.name;
    } else if (userData.email) {
      displayName = userData.email.split('@')[0];
    }
    
    userNameEl.textContent = displayName;
    console.log('Navbar display name set to:', displayName);
  }

  if (avatarCircleEl) {
    let initials = 'U';
    
    if (userData.name && userData.name.trim() !== '') {
      // Get initials from name
      const nameParts = userData.name.trim().split(' ');
      
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
    console.log('Navbar initials set to:', initials.toUpperCase());
  }
}

// Set Active Nav Link
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a[data-link]');

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// Setup Logout
function setupLogout() {
  const logoutBtn = document.getElementById('userLogoutBtn');
  if (!logoutBtn) {
    console.warn('Logout button not found');
    return;
  }

  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (confirm('Are you sure you want to logout?')) {
      try {
        // Show loading
        logoutBtn.style.opacity = '0.6';
        logoutBtn.style.pointerEvents = 'none';

        // Call logout API
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }

        localStorage.clear();
        sessionStorage.clear();

        window.location.href = '/login';
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');

        logoutBtn.style.opacity = '1';
        logoutBtn.style.pointerEvents = 'auto';
      }
    }
  });
}

export async function refreshNavbarProfile() {
  console.log('Refreshing navbar profile...');
  await loadUserProfile();
}

export function init() {
  loadUserNavbar();
}