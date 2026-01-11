import { loadUserNavbar } from "./userNavbar.js";
import { loadUserFooter } from "./userFooter.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Slide state
let currentSlide = 0;
let worshipEvents = [];
let allSchedules = [];

// Export init function
export async function init() {
  console.log("🚀 Initializing worship schedule page...");

  // Load navbar and footer
  await loadUserNavbar();
  await loadUserFooter();

  // Load worship events
  await loadWorshipEvents();

  console.log("✅ Worship schedule page initialized");
}

// Load worship events from API
async function loadWorshipEvents() {
  try {
    console.log("📡 Fetching worship events...");

    const response = await fetch(`${API_BASE_URL}/events/view`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Events loaded:", data);

    // Filter only worship events
    worshipEvents = (data.data || []).filter(
      (event) => event.event_type === "worship"
    );

    console.log(`🎵 Found ${worshipEvents.length} worship events`);

    if (worshipEvents.length === 0) {
      showEmptyState();
      return;
    }

    // Extract and filter non-expired schedules
    const now = new Date();
    allSchedules = [];

    worshipEvents.forEach((event) => {
      if (event.schedules && event.schedules.length > 0) {
        event.schedules.forEach((schedule) => {
          const endTime = schedule.end_time
            ? new Date(schedule.end_time)
            : new Date(schedule.start_time);

          // Only include schedules that haven't ended yet
          if (endTime >= now) {
            allSchedules.push({
              ...schedule,
              event_name: event.event_name,
              event_id: event.event_id,
              place: event.place,
              speaker: event.speaker,
              description: event.description,
            });
          }
        });
      }
    });

    // Sort schedules by start_time
    allSchedules.sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    console.log(`📅 Found ${allSchedules.length} active schedules`);

    if (allSchedules.length === 0) {
      showEmptyState("No upcoming worship schedules available.");
      return;
    }

    // Initialize slider and display schedules
    initSlider();
    displaySchedules();
  } catch (error) {
    console.error("❌ Error loading worship events:", error);
    showError("Failed to load worship schedules. Please try again later.");
  }
}

// Initialize slider
function initSlider() {
  // Expose changeSlide to global scope for onclick
  window.changeSlide = function (direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = allSchedules.length - 1;
    if (currentSlide >= allSchedules.length) currentSlide = 0;

    updateSlideContent();
    updateIndicators();
  };

  // Create indicators
  createIndicators();

  // Set initial slide
  updateSlideContent();
  updateIndicators();

  // Auto slide every 6 seconds
  setInterval(() => {
    window.changeSlide(1);
  }, 6000);
}

// Create slide indicators
function createIndicators() {
  const indicatorsContainer = document.getElementById("slideIndicators");
  if (!indicatorsContainer) return;

  indicatorsContainer.innerHTML = "";

  allSchedules.forEach((_, index) => {
    const indicator = document.createElement("div");
    indicator.className = "slide-indicator";
    indicator.onclick = () => {
      currentSlide = index;
      updateSlideContent();
      updateIndicators();
    };
    indicatorsContainer.appendChild(indicator);
  });
}

// Update slide indicators
function updateIndicators() {
  const indicators = document.querySelectorAll(".slide-indicator");
  indicators.forEach((indicator, index) => {
    if (index === currentSlide) {
      indicator.classList.add("active");
    } else {
      indicator.classList.remove("active");
    }
  });
}

// Update slide content
function updateSlideContent() {
  if (allSchedules.length === 0) return;

  const schedule = allSchedules[currentSlide];
  const startTime = new Date(schedule.start_time);
  const endTime = schedule.end_time ? new Date(schedule.end_time) : null;

  const slideElement = document.querySelector(".slide");
  if (!slideElement) return;

  // Get day name
  const dayName = startTime.toLocaleDateString("en-US", { weekday: "long" });

  // Format time
  const timeStr = `${startTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}${
    endTime
      ? ` - ${endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : ""
  }`;

  // Format date
  const dateStr = startTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Update content
  const title = document.getElementById("slideTitle");
  const subtitle = document.getElementById("slideSubtitle");
  const date = document.getElementById("slideDate");
  const description = document.getElementById("slideDescription");

  if (title) {
    title.textContent = schedule.worship_topic
      ? `"${schedule.worship_topic}"`
      : `"${schedule.event_name}"`;
  }

  if (subtitle) {
    subtitle.textContent = dayName;
  }

  if (date) {
    date.innerHTML = `${timeStr}<br>${dateStr}`;
  }

  if (description) {
    description.textContent =
      schedule.description ||
      "Join us for this worship service as we gather together to worship, pray, and grow in faith.";
  }

  // Add slide animation
  slideElement.style.animation = "none";
  setTimeout(() => {
    slideElement.style.animation = "fadeIn 0.5s ease-in";
  }, 10);
}

// Display schedules in grid
function displaySchedules() {
  const gridContainer = document.getElementById("scheduleGrid");
  if (!gridContainer) return;

  if (allSchedules.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No Upcoming Schedules</h3>
        <p>Check back soon for upcoming worship schedules!</p>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = allSchedules
    .map((schedule, index) => {
      const startTime = new Date(schedule.start_time);
      const endTime = schedule.end_time ? new Date(schedule.end_time) : null;

      const dayName = startTime.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const timeStr = `${startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}${
        endTime
          ? ` - ${endTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : ""
      }`;

      const dateStr = startTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return `
        <div class="schedule-card" style="animation-delay: ${index * 0.1}s">
          <div class="schedule-card-header">
            <div class="schedule-icon">⛪</div>
            <div class="schedule-title">
              <h3>${schedule.event_name}</h3>
              <div class="schedule-day">${dayName}</div>
            </div>
          </div>
          
          <div class="schedule-details">
            <div class="detail-row">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16 3H4C2.9 3 2 3.9 2 5V17C2 18.1 2.9 19 4 19H16C17.1 19 18 18.1 18 17V5C18 3.9 17.1 3 16 3Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M14 1V5M6 1V5M2 8H18" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span><strong>Date:</strong> ${dateStr}</span>
            </div>
            
            <div class="detail-row">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 5V10L13 12" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span><strong>Time:</strong> ${timeStr}</span>
            </div>
            
            <div class="detail-row">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18C10 18 17 13 17 7.5C17 4.5 14.5 2 11.5 2C8.5 2 6 4.5 6 7.5C6 13 10 18 10 18Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="10" cy="7.5" r="2" fill="currentColor"/>
              </svg>
              <span><strong>Location:</strong> ${schedule.place}</span>
            </div>
            
            ${
              schedule.speaker
                ? `
              <div class="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11Z" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M4 17C4 14.2386 6.23858 12 9 12H11C13.7614 12 16 14.2386 16 17" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span><strong>Speaker:</strong> ${schedule.speaker}</span>
              </div>
            `
                : ""
            }
          </div>
          
          ${
            schedule.worship_topic
              ? `
            <div class="schedule-topic">
              <h4>WORSHIP TOPIC</h4>
              <p>${schedule.worship_topic}</p>
            </div>
          `
              : ""
          }
        </div>
      `;
    })
    .join("");
}

// Show empty state
function showEmptyState(message = "No worship events available at this time.") {
  const gridContainer = document.getElementById("scheduleGrid");
  if (gridContainer) {
    gridContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⛪</div>
        <h3>No Worship Schedules</h3>
        <p>${message}</p>
      </div>
    `;
  }

  // Update slider with placeholder
  const slideTitle = document.getElementById("slideTitle");
  const slideSubtitle = document.getElementById("slideSubtitle");
  const slideDate = document.getElementById("slideDate");
  const slideDescription = document.getElementById("slideDescription");

  if (slideTitle) slideTitle.textContent = '"Join Us"';
  if (slideSubtitle) slideSubtitle.textContent = "Worship Services";
  if (slideDate) slideDate.textContent = "Coming Soon";
  if (slideDescription) {
    slideDescription.textContent = message;
  }

  // Hide slider navigation
  const sliderNavs = document.querySelectorAll(".slider-nav");
  sliderNavs.forEach((nav) => (nav.style.display = "none"));
}

// Show error
function showError(message) {
  const gridContainer = document.getElementById("scheduleGrid");
  if (gridContainer) {
    gridContainer.innerHTML = `
      <div class="empty-state error">
        <div class="empty-icon">⚠️</div>
        <h3>Error</h3>
        <p>${message}</p>
      </div>
    `;
  }
}
