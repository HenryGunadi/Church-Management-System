import { loadSidebar } from "./adminSidebar.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class EventManagement {
  constructor() {
    this.events = [];
    this.currentEventId = null;
    this.currentImageFile = null;
    this.isEditMode = false;

    this.API_ENDPOINTS = {
      getEvents: `${API_BASE_URL}/events/view`,
      getEventDetailed: (id) => `${API_BASE_URL}/events/view/${id}`,
      createEvent: `${API_BASE_URL}/events/create`,
      updateEvent: `${API_BASE_URL}/events/update`,
      deleteEvent: (id) => `${API_BASE_URL}/events/delete/${id}`,
    };
  }

  async init() {
    // Load sidebar first
    await loadSidebar();

    // Then initialize event management
    this.cacheDOMElements();
    this.attachEventListeners();
    await this.loadEvents();
  }

  cacheDOMElements() {
    this.createEventBtn = document.getElementById("createEventBtn");
    this.closeModalBtn = document.getElementById("closeModal");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.submitBtn = document.getElementById("submitBtn");

    this.eventModal = document.getElementById("eventModal");
    this.detailModal = document.getElementById("detailModal");
    this.deleteModal = document.getElementById("deleteModal");

    this.eventForm = document.getElementById("eventForm");
    this.modalTitle = document.getElementById("modalTitle");

    this.eventsTableBody = document.getElementById("eventsTableBody");
    this.searchInput = document.getElementById("searchInput");
    this.typeFilter = document.getElementById("typeFilter");
    this.showingText = document.getElementById("showingText");

    this.imageUpload = document.getElementById("imageUpload");
    this.fileUploadArea = document.getElementById("fileUploadArea");
    this.filePreview = document.getElementById("filePreview");
    this.previewImage = document.getElementById("previewImage");
    this.removeImageBtn = document.getElementById("removeImage");

    this.closeDetailModal = document.getElementById("closeDetailModal");
    this.detailImage = document.getElementById("detailImage");
    this.detailEventName = document.getElementById("detailEventName");
    this.detailEventType = document.getElementById("detailEventType");
    this.detailPlace = document.getElementById("detailPlace");
    this.detailSpeaker = document.getElementById("detailSpeaker");
    this.detailSpeakerContainer = document.getElementById(
      "detailSpeakerContainer"
    );
    this.detailDescription = document.getElementById("detailDescription");
    this.detailSchedules = document.getElementById("detailSchedules");
    this.detailEditBtn = document.getElementById("detailEditBtn");
    this.detailDeleteBtn = document.getElementById("detailDeleteBtn");

    this.closeDeleteModal = document.getElementById("closeDeleteModal");
    this.deleteEventName = document.getElementById("deleteEventName");
    this.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    this.confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  }

  attachEventListeners() {
    if (this.createEventBtn) {
      this.createEventBtn.addEventListener("click", () =>
        this.openCreateModal()
      );
    }

    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () =>
        this.closeModal(this.eventModal)
      );
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () =>
        this.closeModal(this.eventModal)
      );
    }

    if (this.closeDetailModal) {
      this.closeDetailModal.addEventListener("click", () =>
        this.closeModal(this.detailModal)
      );
    }

    if (this.closeDeleteModal) {
      this.closeDeleteModal.addEventListener("click", () =>
        this.closeModal(this.deleteModal)
      );
    }

    if (this.cancelDeleteBtn) {
      this.cancelDeleteBtn.addEventListener("click", () =>
        this.closeModal(this.deleteModal)
      );
    }

    [this.eventModal, this.detailModal, this.deleteModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeModal(modal);
          }
        });
      }
    });

    if (this.eventForm) {
      this.eventForm.addEventListener("submit", (e) =>
        this.handleFormSubmit(e)
      );
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => this.filterEvents());
    }

    if (this.typeFilter) {
      this.typeFilter.addEventListener("change", () => this.filterEvents());
    }

    if (this.fileUploadArea && this.imageUpload) {
      this.fileUploadArea.addEventListener("click", () =>
        this.imageUpload.click()
      );
      this.imageUpload.addEventListener("change", (e) =>
        this.handleImageUpload(e)
      );
    }

    if (this.removeImageBtn) {
      this.removeImageBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeImage();
      });
    }

    if (this.detailEditBtn) {
      this.detailEditBtn.addEventListener("click", () => {
        this.closeModal(this.detailModal);
        this.openEditModal(this.currentEventId);
      });
    }

    if (this.detailDeleteBtn) {
      this.detailDeleteBtn.addEventListener("click", () => {
        this.closeModal(this.detailModal);
        this.openDeleteModal(this.currentEventId);
      });
    }

    if (this.confirmDeleteBtn) {
      this.confirmDeleteBtn.addEventListener("click", () =>
        this.confirmDelete()
      );
    }
  }

  openModal(modal) {
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentEventId = null;
    if (this.modalTitle) this.modalTitle.textContent = "Create New Event";
    if (this.submitBtn) {
      const btnText = this.submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Create Event";
    }
    if (this.eventForm) this.eventForm.reset();
    this.removeImage();
    this.openModal(this.eventModal);
  }

  openEditModal(eventId) {
    this.isEditMode = true;
    this.currentEventId = eventId;
    if (this.modalTitle) this.modalTitle.textContent = "Edit Event";
    if (this.submitBtn) {
      const btnText = this.submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Update Event";
    }
    this.loadEventForEdit(eventId);
    this.openModal(this.eventModal);
  }

  openDeleteModal(eventId) {
    const event = this.events.find((e) => e.event_id === eventId);
    if (event) {
      this.currentEventId = eventId;
      if (this.deleteEventName) {
        this.deleteEventName.textContent = event.event_name;
      }
      this.openModal(this.deleteModal);
    }
  }

  async loadEvents() {
    try {
      this.showLoadingState();

      const response = await fetch(this.API_ENDPOINTS.getEvents, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load events");
      }

      const data = await response.json();
      this.events = data.data || [];

      this.renderEvents(this.events);
      this.updateShowingText();
    } catch (error) {
      console.error("Load events error:", error);
      this.showEmptyState("Failed to load events");
    }
  }

  async loadEventForEdit(eventId) {
    try {
      const response = await fetch(
        this.API_ENDPOINTS.getEventDetailed(eventId),
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load event details");
      }

      const json = await response.json();
      const event = json.data;

      document.getElementById("eventName").value = event.event_name || "";
      document.getElementById("eventType").value = event.event_type || "";
      document.getElementById("place").value = event.place || "";
      document.getElementById("speaker").value = event.speaker || "";
      document.getElementById("description").value = event.description || "";

      if (event.image_url) {
        this.previewImage.src = event.image_url;
        this.fileUploadArea.style.display = "none";
        this.filePreview.style.display = "block";
      }
    } catch (error) {
      console.error("Load event for edit error:", error);
      alert("Failed to load event details.");
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.eventForm);

    this.setButtonLoading(this.submitBtn, true);

    try {
      let response;

      if (this.isEditMode) {
        formData.append("id", this.currentEventId);
        response = await fetch(this.API_ENDPOINTS.updateEvent, {
          method: "PATCH",
          body: formData,
          credentials: "include",
        });
      } else {
        response = await fetch(this.API_ENDPOINTS.createEvent, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      const result = await response.json();

      alert(
        this.isEditMode
          ? "Event updated successfully!"
          : "Event created successfully!"
      );

      this.closeModal(this.eventModal);
      await this.loadEvents();
    } catch (error) {
      console.error("Save event error:", error);
      alert("Failed to save event. Please try again.");
    } finally {
      this.setButtonLoading(this.submitBtn, false);
    }
  }

  async confirmDelete() {
    this.setButtonLoading(this.confirmDeleteBtn, true);

    try {
      const response = await fetch(
        this.API_ENDPOINTS.deleteEvent(this.currentEventId),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      alert("Event deleted successfully!");

      this.closeModal(this.deleteModal);
      await this.loadEvents();
    } catch (error) {
      console.error("Delete event error:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      this.setButtonLoading(this.confirmDeleteBtn, false);
    }
  }

  async viewEventDetails(eventId) {
    try {
      const response = await fetch(
        this.API_ENDPOINTS.getEventDetailed(eventId),
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load event details");
      }

      const event = await response.json();
      this.showDetailModal(event.data);
    } catch (error) {
      console.error("View event details error:", error);
      alert("Failed to load event details.");
    }
  }

  renderEvents(events) {
    if (events.length === 0) {
      this.showEmptyState();
      return;
    }

    const html = events
      .map((event) => {
        const scheduleCount = event.schedules ? event.schedules.length : 0;
        const typeClass = `type-${event.event_type}`;

        return `
        <tr data-event-id="${event.event_id}">
          <td class="event-name-cell">${this.escapeHtml(event.event_name)}</td>
          <td>
            <span class="event-type-badge ${typeClass}">${
          event.event_type
        }</span>
          </td>
          <td class="event-place">${this.escapeHtml(event.place)}</td>
          <td class="event-speaker">${
            event.speaker ? this.escapeHtml(event.speaker) : "-"
          }</td>
          <td>
            <span class="schedule-count-badge">
              <i class="fas fa-calendar"></i>
              ${scheduleCount} ${scheduleCount === 1 ? "schedule" : "schedules"}
            </span>
          </td>
          <td class="action-buttons">
            <button class="action-btn view-btn" onclick="eventManagement.viewEventDetails(${
              event.event_id
            })" title="View Details">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4C4.5 4 1 10 1 10C1 10 4.5 16 10 16C15.5 16 19 10 19 10C19 10 15.5 4 10 4Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="action-btn edit-btn" onclick="eventManagement.openEditModal(${
              event.event_id
            })" title="Edit">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14 2L17 5L6 16H3V13L14 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" onclick="eventManagement.openDeleteModal(${
              event.event_id
            })" title="Delete">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M8 9V15M12 9V15M4 5L5 17C5 17.5 5.2 18 5.6 18.4C6 18.8 6.5 19 7 19H13C13.5 19 14 18.8 14.4 18.4C14.8 18 15 17.5 15 17L16 5M7 5V3C7 2.7 7.1 2.5 7.3 2.3C7.5 2.1 7.7 2 8 2H12C12.3 2 12.5 2.1 12.7 2.3C12.9 2.5 13 2.7 13 3V5" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    this.eventsTableBody.innerHTML = html;
  }

  showLoadingState() {
    this.eventsTableBody.innerHTML = `
      <tr class="loading-row">
        <td colspan="6">
          <div class="loading-spinner"></div>
          <p>Loading events...</p>
        </td>
      </tr>
    `;
  }

  showEmptyState(message = "No events found") {
    this.eventsTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/>
              <path d="M3 8H21M8 2V6M16 2V6" stroke-width="2"/>
            </svg>
            <h3>${message}</h3>
            <p>Create your first event to get started</p>
            <button class="btn btn-primary" onclick="eventManagement.openCreateModal()">
              <i class="fas fa-plus"></i> Create Event
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  showDetailModal(event) {
    this.currentEventId = event.event_id;

    if (this.detailImage && event.image_url) {
      this.detailImage.src = event.image_url;
    }

    if (this.detailEventName)
      this.detailEventName.textContent = event.event_name;
    if (this.detailEventType) {
      this.detailEventType.textContent = event.event_type;
      this.detailEventType.className = `event-type-badge type-${event.event_type}`;
    }

    if (this.detailPlace) this.detailPlace.textContent = event.place;

    if (event.speaker && this.detailSpeaker) {
      this.detailSpeaker.textContent = event.speaker;
      if (this.detailSpeakerContainer) {
        this.detailSpeakerContainer.style.display = "flex";
      }
    } else if (this.detailSpeakerContainer) {
      this.detailSpeakerContainer.style.display = "none";
    }

    if (this.detailDescription) {
      this.detailDescription.textContent =
        event.description || "No description provided";
    }

    // Display schedules
    if (this.detailSchedules) {
      if (event.schedules && event.schedules.length > 0) {
        const schedulesHtml = event.schedules
          .map((schedule) => {
            const startTime = new Date(schedule.start_time);
            const endTime = schedule.end_time
              ? new Date(schedule.end_time)
              : null;

            return `
              <div class="schedule-item">
                <div class="schedule-item-header">
                  <span class="schedule-date">
                    <i class="fas fa-calendar"></i>
                    ${this.formatDate(schedule.start_time)}
                  </span>
                  <span class="schedule-time">
                    <i class="fas fa-clock"></i>
                    ${this.formatTime(schedule.start_time)}${
              endTime ? ` - ${this.formatTime(schedule.end_time)}` : ""
            }
                  </span>
                </div>
                ${
                  schedule.worship_topic
                    ? `
                  <div class="schedule-topic">
                    <i class="fas fa-bible"></i>
                    <strong>Topic:</strong> ${schedule.worship_topic}
                  </div>
                `
                    : ""
                }
              </div>
            `;
          })
          .join("");
        this.detailSchedules.innerHTML = schedulesHtml;
      } else {
        this.detailSchedules.innerHTML = `
          <p class="no-schedules">No schedules created yet. Add schedules in the Schedule Management page.</p>
        `;
      }
    }

    this.openModal(this.detailModal);
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    this.currentImageFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage.src = e.target.result;
      this.fileUploadArea.style.display = "none";
      this.filePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.currentImageFile = null;
    if (this.imageUpload) this.imageUpload.value = "";
    if (this.previewImage) this.previewImage.src = "";
    if (this.fileUploadArea) this.fileUploadArea.style.display = "flex";
    if (this.filePreview) this.filePreview.style.display = "none";
  }

  filterEvents() {
    const searchTerm = this.searchInput?.value.toLowerCase() || "";
    const typeFilter = this.typeFilter?.value || "";

    const filtered = this.events.filter((event) => {
      const matchesSearch =
        event.event_name.toLowerCase().includes(searchTerm) ||
        event.place.toLowerCase().includes(searchTerm);
      const matchesType = !typeFilter || event.event_type === typeFilter;
      return matchesSearch && matchesType;
    });

    this.renderEvents(filtered);
    this.updateShowingText(filtered.length);
  }

  formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatTime(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  updateShowingText(count = null) {
    if (!this.showingText) return;
    const total = count !== null ? count : this.events.length;
    this.showingText.textContent = `Showing ${total} ${
      total === 1 ? "event" : "events"
    }`;
  }

  setButtonLoading(button, isLoading) {
    if (!button) return;

    const textEl = button.querySelector(".btn-text");
    const loaderEl = button.querySelector(".btn-loader");

    if (isLoading) {
      if (textEl) textEl.style.display = "none";
      if (loaderEl) loaderEl.style.display = "inline-flex";
      button.disabled = true;
    } else {
      if (textEl) textEl.style.display = "inline-flex";
      if (loaderEl) loaderEl.style.display = "none";
      button.disabled = false;
    }
  }
}

// Create instance and make it globally accessible
let eventManagement;

// Export init function for router
export async function init() {
  eventManagement = new EventManagement();
  await eventManagement.init();
  window.eventManagement = eventManagement;
}

export default EventManagement;
