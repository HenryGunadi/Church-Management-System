// Navbar scroll effect
const navbar = document.getElementById("navbar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", function () {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile menu toggle
mobileMenuBtn.addEventListener("click", function () {
  navLinks.classList.toggle("active");
  const icon = mobileMenuBtn.querySelector("i");

  if (navLinks.classList.contains("active")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Close mobile menu when clicking on a link
const navLinksItems = document.querySelectorAll(".nav-links a");
navLinksItems.forEach((link) => {
  link.addEventListener("click", function () {
    if (window.innerWidth <= 968) {
      navLinks.classList.remove("active");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", function (e) {
  if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    navLinks.classList.remove("active");
    const icon = mobileMenuBtn.querySelector("i");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
});

// Gallery lightbox effect (simple implementation)
const galleryItems = document.querySelectorAll(".gallery-item");

galleryItems.forEach((item) => {
  item.addEventListener("click", function () {
    // Create lightbox overlay
    const lightbox = document.createElement("div");
    lightbox.style.position = "fixed";
    lightbox.style.top = "0";
    lightbox.style.left = "0";
    lightbox.style.width = "100%";
    lightbox.style.height = "100%";
    lightbox.style.background = "rgba(0, 0, 0, 0.9)";
    lightbox.style.zIndex = "10000";
    lightbox.style.display = "flex";
    lightbox.style.alignItems = "center";
    lightbox.style.justifyContent = "center";
    lightbox.style.cursor = "pointer";

    // Clone the image
    const img = this.querySelector("img");
    if (img) {
      const clonedImg = img.cloneNode(true);
      clonedImg.style.maxWidth = "90%";
      clonedImg.style.maxHeight = "90%";
      clonedImg.style.objectFit = "contain";
      clonedImg.style.borderRadius = "8px";

      lightbox.appendChild(clonedImg);
    }

    // Close lightbox on click
    lightbox.addEventListener("click", function () {
      document.body.removeChild(lightbox);
    });

    document.body.appendChild(lightbox);
  });
});

// Animate sections on scroll (Intersection Observer)
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe sections for animation
const sections = document.querySelectorAll(
  ".about, .events, .gallery, .contact"
);
sections.forEach((section) => {
  section.style.opacity = "0";
  section.style.transform = "translateY(30px)";
  section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(section);
});

// Event cards hover effect enhancement
const eventCards = document.querySelectorAll(".event-card");
eventCards.forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transition = "all 0.3s ease";
  });
});

// Add active state to nav links based on scroll position
window.addEventListener("scroll", function () {
  const sections = document.querySelectorAll("section[id]");
  const scrollPos = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      // Remove active class from all nav links
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.style.color = "#1a1a1a";
      });

      // Add active class to current nav link
      const activeLink = document.querySelector(
        `.nav-links a[href="#${sectionId}"]`
      );
      if (activeLink) {
        activeLink.style.color = "#ff6b00";
      }
    }
  });
});

// Optional: Auto-play functionality for events (if you want to make it a slider later)
// You can expand this to create a carousel for events

// Form validation for newsletter (if you add a form)
// This is a placeholder for future newsletter form functionality

console.log("Grace Chapel Landing Page loaded successfully!");

// Handle page load animations
window.addEventListener("load", function () {
  // Fade in hero content
  const heroContent = document.querySelector(".hero-content");
  heroContent.style.opacity = "0";
  heroContent.style.transform = "translateY(30px)";

  setTimeout(() => {
    heroContent.style.transition = "opacity 1s ease, transform 1s ease";
    heroContent.style.opacity = "1";
    heroContent.style.transform = "translateY(0)";
  }, 100);
});

// Prevent default behavior for event links (since they're placeholders)
document.querySelectorAll(".event-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    alert(
      "Event details coming soon! Please check back later or contact us for more information."
    );
  });
});
