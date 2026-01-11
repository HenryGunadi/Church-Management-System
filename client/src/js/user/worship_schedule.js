import { loadUserNavbar } from './userNavbar.js';
import { loadUserFooter } from './userFooter.js';

// Slide state
let currentSlide = 0;
const slides = [
  {
    title: '"We RISE"',
    subtitle: "Sunday",
    date: "09:00-10:30<br>11:00-12:30",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: '"Growing Together"',
    subtitle: "Wednesday",
    date: "19:00-20:30",
    text: "Join us for our midweek service where we dive deeper into God's Word and encourage one another in faith. Experience meaningful fellowship and spiritual growth in a welcoming environment.",
  },
  {
    title: '"Youth Ignite"',
    subtitle: "Friday",
    date: "18:00-19:30",
    text: "A dynamic service designed for our youth community. Experience powerful worship, relevant teaching, and connect with peers who share your faith journey. Come as you are and be inspired!",
  },
];

// Export init function
export async function init() {
  console.log('🚀 Initializing worship schedule page...');
  
  // Load navbar
  await loadUserNavbar();
  await loadUserFooter();
  
  // Initialize page components
  initSlider();
  initDropdowns();
  
  console.log('✅ Worship schedule page initialized');
}

// Initialize slider
function initSlider() {
  // Expose changeSlide to global scope for onclick
  window.changeSlide = function(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    if (currentSlide >= slides.length) currentSlide = 0;

    updateSlideContent();
  };

  // Auto slide every 5 seconds (optional)
  setInterval(() => {
    window.changeSlide(1);
  }, 5000);
}

// Update slide content
function updateSlideContent() {
  const slide = slides[currentSlide];
  const slideElement = document.querySelector('.slide');
  
  if (!slideElement) return;

  const h2 = slideElement.querySelector('h2');
  const h3 = slideElement.querySelector('h3');
  const date = slideElement.querySelector('.date');
  const text = slideElement.querySelector('p:last-child');

  if (h2) h2.textContent = slide.title;
  if (h3) h3.textContent = slide.subtitle;
  if (date) date.innerHTML = slide.date;
  if (text) text.textContent = slide.text;

  // Add slide animation
  slideElement.style.animation = 'fadeIn 0.5s ease-in';
  setTimeout(() => {
    slideElement.style.animation = '';
  }, 500);
}

// Initialize dropdowns
function initDropdowns() {
  // Expose toggleDropdown to global scope for onclick
  window.toggleDropdown = function(element) {
    const content = element.querySelector('.dropdown-content');
    const icon = element.querySelector('.dropdown-icon');

    if (!content || !icon) return;

    // Close all other dropdowns
    document.querySelectorAll('.schedule-dropdown').forEach((dropdown) => {
      if (dropdown !== element) {
        dropdown.classList.remove('active');
        const dropContent = dropdown.querySelector('.dropdown-content');
        const dropIcon = dropdown.querySelector('.dropdown-icon');
        if (dropContent) dropContent.classList.remove('open');
        if (dropIcon) dropIcon.classList.remove('open');
      }
    });

    // Toggle current dropdown
    element.classList.toggle('active');
    content.classList.toggle('open');
    icon.classList.toggle('open');
  };

  // Add click handlers to View Schedule buttons
  const scheduleButtons = document.querySelectorAll('.community-button');
  scheduleButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Smooth scroll to schedule section
      const scheduleSection = document.querySelector('.schedule-section');
      if (scheduleSection) {
        scheduleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);