import { loadUserNavbar } from "./userNavbar.js";
import { loadUserFooter } from "./userFooter.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function init() {
  console.log("🎉 Initializing events page...");

  // Load navbar and footer
  await loadUserNavbar();
  await loadUserFooter();

  // Load events
  await loadEvents();

  // Setup modal
  setupModal();

  console.log("✅ Events page initialized");
}

let currentUser = null;
let userAttendance = [];

async function loadEvents() {
  try {
    // Load user attendance status
    await loadUserAttendance();

    const response = await fetch(`${API_BASE_URL}/events/view`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Events loaded:", data);

    // Filter events: only show "event" and "other", exclude "worship"
    const filteredEvents = (data.data || []).filter(
      (event) => event.event_type === "event" || event.event_type === "other"
    );

    displayEvents(filteredEvents);
  } catch (error) {
    console.error("❌ Error loading events:", error);
    showError("Failed to load events. Please try again later.");
  }
}

async function loadUserAttendance() {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/my-attendance`, {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      userAttendance = data.data || [];
      console.log("✅ User attendance loaded:", userAttendance);
    }
  } catch (error) {
    console.error("❌ Error loading attendance:", error);
  }
}

function getUserAttendanceStatus(scheduleId) {
  const attendance = userAttendance.find((a) => a.schedule_id === scheduleId);
  if (!attendance) return null;

  // Check if user has scanned (attended) or just registered
  return attendance.status === "Present" ? "attended" : "registered";
}

function displayEvents(events) {
  const container = document.querySelector(".events-container");

  if (!container) {
    console.error("❌ Events container not found");
    return;
  }

  if (!events || events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No Upcoming Events</h3>
        <p>Stay tuned for exciting events and gatherings!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = events
    .map((event) => {
      // Get the first schedule (or handle multiple schedules if needed)
      const schedule = event.schedules && event.schedules[0];
      const startTime = schedule ? new Date(schedule.start_time) : null;
      const worshipTopic = schedule?.worship_topic || "";
      const status = schedule
        ? getUserAttendanceStatus(schedule.schedule_id)
        : null;

      const dateStr = startTime
        ? startTime.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Date TBA";

      const timeStr = startTime
        ? startTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Time TBA";

      return `
        <div class="event-card" onclick="openEventModal(${event.event_id})">
          <div class="event-card-image">
            ${
              event.image_url
                ? `<img src="${event.image_url}" alt="${event.event_name}" />`
                : `<div class="event-placeholder">${getEventIcon(
                    event.event_type
                  )}</div>`
            }
            ${
              status
                ? `<span class="status-badge ${status}">${
                    status === "attended" ? "Attended" : "Registered"
                  }</span>`
                : ""
            }
          </div>
          <div class="event-card-content">
            <div class="event-type">${event.event_type}</div>
            <h3 class="event-title">${event.event_name}</h3>
            <div class="event-meta">
              <div class="meta-item">📅 ${dateStr}</div>
              <div class="meta-item">🕐 ${timeStr}</div>
              <div class="meta-item">📍 ${event.place}</div>
            </div>
            ${
              event.speaker
                ? `<div class="event-speaker">🎤 Speaker: ${event.speaker}</div>`
                : ""
            }
            ${
              worshipTopic
                ? `<div class="event-topic">📖 Topic: ${worshipTopic}</div>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");

  // Store events globally for modal access
  window.eventsData = events;
}

function setupModal() {
  const modal = document.getElementById("eventModal");
  const closeBtn = document.querySelector(".modal-close");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeEventModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeEventModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeEventModal();
    }
  });
}

window.openEventModal = function (eventId) {
  const event = window.eventsData?.find((e) => e.event_id === eventId);
  if (!event) {
    console.error("Event not found:", eventId);
    return;
  }

  const modal = document.getElementById("eventModal");

  // Get the first schedule (primary schedule for the event)
  const schedule = event.schedules && event.schedules[0];
  const startTime = schedule ? new Date(schedule.start_time) : null;
  const endTime =
    schedule && schedule.end_time ? new Date(schedule.end_time) : null;
  const status = schedule
    ? getUserAttendanceStatus(schedule.schedule_id)
    : null;

  const dateStr = startTime
    ? startTime.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBA";

  const timeStr = startTime
    ? `${startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}${
        endTime
          ? ` - ${endTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : ""
      }`
    : "Time TBA";

  // Update modal content
  document.getElementById("modalEventName").textContent = event.event_name;
  document.getElementById("modalEventType").textContent = event.event_type;
  document.getElementById("modalDate").textContent = dateStr;
  document.getElementById("modalTime").textContent = timeStr;
  document.getElementById("modalPlace").textContent = event.place;
  document.getElementById("modalDescription").textContent =
    event.description || "No description available.";

  // Show worship topic if available
  if (schedule && schedule.worship_topic) {
    document.getElementById("modalTopic").textContent = schedule.worship_topic;
    document.getElementById("modalTopicRow").style.display = "flex";
  } else {
    document.getElementById("modalTopicRow").style.display = "none";
  }

  // Show speaker if available
  if (event.speaker) {
    document.getElementById("modalSpeaker").textContent = event.speaker;
    document.getElementById("modalSpeakerRow").style.display = "flex";
  } else {
    document.getElementById("modalSpeakerRow").style.display = "none";
  }

  // Set modal image
  const modalImage = document.getElementById("modalImage");
  if (event.image_url) {
    modalImage.innerHTML = `<img src="${event.image_url}" alt="${event.event_name}" />`;
  } else {
    modalImage.innerHTML = `<div class="modal-placeholder">${getEventIcon(
      event.event_type
    )}</div>`;
  }

  // Update register button based on attendance status
  const registerBtn = document.getElementById("registerBtn");

  // Check if schedule exists before enabling registration
  if (!schedule || !schedule.schedule_id) {
    registerBtn.innerHTML = "No Schedule Available";
    registerBtn.className = "btn-register disabled";
    registerBtn.disabled = true;
  } else if (status === "attended") {
    registerBtn.innerHTML = "✓ Attended";
    registerBtn.className = "btn-register attended";
    registerBtn.disabled = true;
  } else if (status === "registered") {
    registerBtn.innerHTML = "✓ Registered";
    registerBtn.className = "btn-register registered";
    registerBtn.disabled = true;
  } else {
    registerBtn.innerHTML = "Register Now";
    registerBtn.className = "btn-register";
    registerBtn.disabled = false;
    // Pass the schedule_id, not event_id
    registerBtn.onclick = () => registerForEvent(schedule.schedule_id);
  }

  // Show the modal
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

function closeEventModal() {
  const modal = document.getElementById("eventModal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

async function registerForEvent(scheduleId) {
  try {
    console.log("🎯 Registering for schedule:", scheduleId);

    // Validate scheduleId
    if (!scheduleId || typeof scheduleId !== "number") {
      console.error("❌ Invalid schedule ID:", scheduleId);
      showNotification("Invalid schedule ID", "error");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/attendance/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ schedule_id: scheduleId }),
    });

    const data = await response.json();

    if (response.ok) {
      showNotification(data.message || "Successfully registered!", "success");
      closeEventModal();
      // Reload events to update attendance status
      await loadEvents();
    } else {
      console.error("❌ Registration failed:", data);
      showNotification(
        data.message || data.errors?.[0]?.msg || "Registration failed",
        "error"
      );
    }
  } catch (error) {
    console.error("❌ Registration error:", error);
    showNotification("Failed to register. Please try again.", "error");
  }
}

function getEventIcon(eventType) {
  const icons = {
    worship: "⛪",
    event: "🎉",
    conference: "🎤",
    workshop: "🎨",
    fellowship: "🤝",
    service: "🙏",
    other: "📅",
  };
  return icons[eventType?.toLowerCase()] || "📅";
}

function showError(message) {
  const container = document.querySelector(".events-container");
  if (container) {
    container.innerHTML = `
      <div class="empty-state error">
        <div class="empty-icon">⚠️</div>
        <h3>Oops!</h3>
        <p>${message}</p>
      </div>
    `;
  }
}

function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      ${
        type === "success"
          ? '<path d="M16.7 5L7.5 14.2L3.3 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
          : '<path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" stroke-width="2"/>'
      }
    </svg>
    ${message}
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Auto-initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
