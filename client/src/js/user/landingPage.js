// Init (called by router)
export function init() {
  const navbar = document.getElementById("navbar");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  if (!navbar || !mobileMenuBtn || !navLinks) return;


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

    document.querySelectorAll("section[id]").forEach((section) => {
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


  // Placeholder event links
  document.querySelectorAll(".event-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Event details coming soon! Please check back later.");
    });
  });

  console.log("Landing page initialized");
}
