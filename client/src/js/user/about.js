import { loadUserNavbar } from "./userNavbar.js";
import { loadUserFooter } from "./userFooter.js";

export async function init() {
  console.log("Initializing About Us page...");

  // Load navbar and footer
  await loadUserNavbar();
  await loadUserFooter();

  // Initialize scroll animations
  initScrollAnimations();

  // Initialize smooth scroll for CTA buttons
  initSmoothScroll();

  console.log("About Us page loaded successfully");
}

// Initialize scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe all section cards
  const sectionCards = document.querySelectorAll(".section-card");
  sectionCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    observer.observe(card);
  });

  // Observe CTA section
  const ctaSection = document.querySelector(".cta-section");
  if (ctaSection) {
    ctaSection.style.opacity = "0";
    ctaSection.style.transform = "translateY(30px)";
    ctaSection.style.transition = "opacity 1s ease, transform 1s ease";
    observer.observe(ctaSection);
  }
}

// Initialize smooth scroll for internal links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Auto-initialize when the module loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
