// User Dashboard (Landing Page) Logic
import { loadUserNavbar } from './userNavbar.js';
import { loadUserFooter } from './userFooter.js';

// Export init function untuk dipanggil oleh router
export async function init() {
  console.log('🚀 Initializing user dashboard...');
  
  // Load navbar first
  await loadUserNavbar();
  await loadUserFooter();
  
  // Initialize dashboard components
  initDashboard();
  
  console.log('User dashboard initialized');
}

function initDashboard() {
  // Smooth scroll untuk internal links
  initSmoothScroll();
  
  // Load events dari API (optional)
  // loadUpcomingEvents();
  
  // Gallery lightbox (optional)
  // initGalleryLightbox();
}

// Smooth Scroll untuk anchor links
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Skip jika hanya "#" atau "#/"
      if (href === '#' || href === '#/') return;
      
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const navbarHeight = 70; // Height of fixed navbar
        const targetPosition = targetElement.offsetTop - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Load Upcoming Events (connect to API)
async function loadUpcomingEvents() {
  try {
    const response = await fetch('http://localhost:3000/api/events/view', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch events');
      return;
    }
    
    const data = await response.json();
    const events = data.data || [];
    
    // Get upcoming events only
    const now = new Date();
    const upcomingEvents = events.filter(event => {
      if (event.schedules && event.schedules.length > 0) {
        const startTime = new Date(event.schedules[0].start_time);
        return startTime > now;
      }
      return false;
    }).slice(0, 4); // Get first 4 upcoming events
    
    if (upcomingEvents.length > 0) {
      renderEvents(upcomingEvents);
    }
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

// Render Events to DOM
function renderEvents(events) {
  const eventsContainer = document.querySelector('.events-container');
  if (!eventsContainer) return;
  
  const eventsHTML = events.map(event => {
    const schedule = event.schedules[0];
    const eventDate = new Date(schedule.start_time);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
    
    return `
      <div class="event-card">
        <div class="event-content">
          <div class="event-date">${formattedDate}</div>
          <h3>${escapeHtml(event.event_name)}</h3>
          <p>${escapeHtml(event.description || 'Join us for this event')}</p>
          <a href="/user/event" data-link class="event-link">Learn More →</a>
        </div>
      </div>
    `;
  }).join('');
  
  eventsContainer.innerHTML = eventsHTML;
}

// Gallery Lightbox (optional enhancement)
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      
      // Create lightbox modal
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox-modal';
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <span class="lightbox-close">&times;</span>
          <img src="${img.src}" alt="${img.alt}">
        </div>
      `;
      
      document.body.appendChild(lightbox);
      document.body.style.overflow = 'hidden';
      
      // Close lightbox
      const closeBtn = lightbox.querySelector('.lightbox-close');
      const closeLightbox = () => {
        lightbox.remove();
        document.body.style.overflow = '';
      };
      
      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });
    });
  });
}

// Utility function
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}