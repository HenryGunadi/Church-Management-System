// Import navbar functionality
import { loadUserNavbar } from './userNavbar.js';
import { loadUserFooter } from './userFooter.js';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Init (called by router)
export async function init() {
  // ✅ LOAD NAVBAR FIRST
  await loadUserNavbar();
  await loadUserFooter();

  const navbar = document.getElementById("navbar");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  if (!navbar || !mobileMenuBtn || !navLinks) {
    console.warn("Navbar elements not found after loading");
    return;
  }

  // Load events from API
  await loadUpcomingEvents();

  // Navbar scroll effect
  window.addEventListener("scroll", onScrollNavbar);

  function onScrollNavbar() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  // Mobile menu toggle
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = mobileMenuBtn.querySelector("i");

    if (!icon) return;

    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });

  // Close mobile menu when clicking link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 968) {
        closeMobileMenu();
      }
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      closeMobileMenu();
    }
  });

  function closeMobileMenu() {
    navLinks.classList.remove("active");
    const icon = mobileMenuBtn.querySelector("i");
    if (!icon) return;

    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }

  // Smooth scroll for anchors
  document
    .querySelectorAll('a[href^="#"]:not([href^="#/"])')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");

        // Only handle real section anchors
        if (!targetId || targetId.startsWith("#/")) return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      });
    });

  // Gallery lightbox
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (!img) return;

      const lightbox = document.createElement("div");
      Object.assign(lightbox.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0.9)",
        zIndex: "10000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      });

      const clonedImg = img.cloneNode(true);
      Object.assign(clonedImg.style, {
        maxWidth: "90%",
        maxHeight: "90%",
        objectFit: "contain",
        borderRadius: "8px",
      });

      lightbox.appendChild(clonedImg);

      lightbox.addEventListener("click", () => {
        document.body.removeChild(lightbox);
      });

      document.body.appendChild(lightbox);
    });
  });

  // Section animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
  );

  document
    .querySelectorAll(".about, .events, .gallery, .contact")
    .forEach((section) => {
      section.style.opacity = "0";
      section.style.transform = "translateY(30px)";
      section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(section);
    });

  // Active nav link on scroll
  window.addEventListener("scroll", updateActiveNav);

  function updateActiveNav() {
    const scrollPos = window.scrollY + 100;

    document.querySelectorAll("section[id], div[id]").forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.id;

      const link = document.querySelector(`.nav-links a[href="#${id}"]`);

      if (!link) return;

      link.style.color =
        scrollPos >= top && scrollPos < top + height ? "#ff6b00" : "#1a1a1a";
    });
  }

  // Hero animation
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.style.opacity = "0";
    heroContent.style.transform = "translateY(30px)";

    setTimeout(() => {
      heroContent.style.transition = "opacity 1s ease, transform 1s ease";
      heroContent.style.opacity = "1";
      heroContent.style.transform = "translateY(0)";
    }, 100);
  }

  console.log("✅ Landing page initialized with navbar");
}

// ✅ NEW: Load Upcoming Events from API
async function loadUpcomingEvents() {
  try {
    console.log("📅 Loading upcoming events...");

    const response = await fetch(`${API_BASE_URL}/events/view`, {
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("Failed to fetch events:", response.status);
      return;
    }

    const data = await response.json();
    const allEvents = data.data || [];

    console.log("✅ Events loaded:", allEvents.length);

    // Filter: only "event" and "other" types, exclude "worship"
    const filteredEvents = allEvents.filter(
      (event) => event.event_type === "event" || event.event_type === "other"
    );

    // Get only upcoming events (future dates)
    const now = new Date();
    const upcomingEvents = filteredEvents
      .filter((event) => {
        if (event.schedules && event.schedules.length > 0) {
          const startTime = new Date(event.schedules[0].start_time);
          return startTime > now;
        }
        return false;
      })
      .sort((a, b) => {
        // Sort by start time (earliest first)
        const timeA = new Date(a.schedules[0].start_time);
        const timeB = new Date(b.schedules[0].start_time);
        return timeA - timeB;
      })
      .slice(0, 4); // Show only 4 upcoming events

    if (upcomingEvents.length > 0) {
      displayEvents(upcomingEvents);
    } else {
      showNoEvents();
    }
  } catch (error) {
    console.error("❌ Error loading events:", error);
    showNoEvents();
  }
}

function displayEvents(events) {
  const container = document.querySelector(".events-container");
  
  if (!container) {
    console.warn("Events container not found");
    return;
  }

  container.innerHTML = events
    .map((event) => {
      const schedule = event.schedules[0];
      const startTime = new Date(schedule.start_time);

      const dateStr = startTime.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).toUpperCase();

      const timeStr = startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
        <div class="event-card">
          <div class="event-content">
            <div class="event-date">${dateStr}</div>
            <h3>${escapeHtml(event.event_name)}</h3>
            <p>${escapeHtml(event.description || "Join us for this special event!")}</p>
            <div class="event-meta-info">
              <span>🕐 ${timeStr}</span>
              <span>📍 ${escapeHtml(event.place)}</span>
            </div>
            <a href="/user/event" data-link class="event-link">Learn More →</a>
          </div>
        </div>
      `;
    })
    .join("");
}

function showNoEvents() {
  const container = document.querySelector(".events-container");
  
  if (!container) return;

  container.innerHTML = `
    <div class="no-events-message">
      <div class="no-events-icon">📅</div>
      <h3>No Upcoming Events</h3>
      <p>Check back soon for exciting events and gatherings!</p>
    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}