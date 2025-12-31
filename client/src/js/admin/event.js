import { showAlert } from "../user/alert.js";
const API_BASE_URL = "http://localhost:3000";

class EventManagement {
  constructor() {
    this.events = [];
    this.currentEventId = null;
    this.currentImageFile = null;
    this.isEditMode = false;

    // API Endpoints - Replace with your actual endpoints
    this.API_ENDPOINTS = {
      // GET
      getEvents: `${API_BASE_URL}/api/events/view`,
      getEventDetailed: (id) => `${API_BASE_URL}/api/events/view/${id}`,

      // POST
      createEvent: `${API_BASE_URL}/api/events/create`,

      // PATCH
      updateEvent: `${API_BASE_URL}/api/events/update`,

      // DELETE
      deleteEvent: (id) => `${API_BASE_URL}/api/events/delete/${id}`,

      // UPLOAD
      uploadImage: `${API_BASE_URL}/api/upload/image`,
    };

    this.init();
  }

  init() {
    this.cacheDOMElements();
    this.attachEventListeners();
    this.loadEvents();
  }

  cacheDOMElements() {
    this.createEventBtn = document.getElementById("createEventBtn");
    this.closeModalBtn = document.getElementById("closeModal");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.submitBtn = document.getElementById("submitBtn");

    this.eventModal = document.getElementById("eventModal");
    this.qrModal = document.getElementById("qrModal");
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

    this.closeQrModal = document.getElementById("closeQrModal");
    this.qrCodeImage = document.getElementById("qrCodeImage");
    this.qrEventName = document.getElementById("qrEventName");
    this.qrEventDetails = document.getElementById("qrEventDetails");
    this.downloadQrBtn = document.getElementById("downloadQrBtn");

    this.closeDetailModal = document.getElementById("closeDetailModal");
    this.detailImage = document.getElementById("detailImage");
    this.detailEventName = document.getElementById("detailEventName");
    this.detailEventType = document.getElementById("detailEventType");
    this.detailDateTime = document.getElementById("detailDateTime");
    this.detailPlace = document.getElementById("detailPlace");
    this.detailWorshipTopic = document.getElementById("detailWorshipTopic");
    this.detailWorshipTopicContainer = document.getElementById(
      "detailWorshipTopicContainer"
    );
    this.detailDescription = document.getElementById("detailDescription");
    this.detailQrCode = document.getElementById("detailQrCode");
    this.detailDownloadQr = document.getElementById("detailDownloadQr");
    this.detailEditBtn = document.getElementById("detailEditBtn");
    this.detailDeleteBtn = document.getElementById("detailDeleteBtn");

    this.closeDeleteModal = document.getElementById("closeDeleteModal");
    this.deleteEventName = document.getElementById("deleteEventName");
    this.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    this.confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  }

  attachEventListeners() {
    this.createEventBtn.addEventListener("click", () => this.openCreateModal());

    this.closeModalBtn.addEventListener("click", () =>
      this.closeModal(this.eventModal)
    );
    this.cancelBtn.addEventListener("click", () =>
      this.closeModal(this.eventModal)
    );
    this.closeQrModal.addEventListener("click", () =>
      this.closeModal(this.qrModal)
    );
    this.closeDetailModal.addEventListener("click", () =>
      this.closeModal(this.detailModal)
    );
    this.closeDeleteModal.addEventListener("click", () =>
      this.closeModal(this.deleteModal)
    );
    this.cancelDeleteBtn.addEventListener("click", () =>
      this.closeModal(this.deleteModal)
    );

    [this.eventModal, this.qrModal, this.detailModal, this.deleteModal].forEach(
      (modal) => {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeModal(modal);
          }
        });
      }
    );

    this.eventForm.addEventListener("submit", (e) => this.handleFormSubmit(e));

    this.searchInput.addEventListener("input", () => this.filterEvents());
    this.typeFilter.addEventListener("change", () => this.filterEvents());

    this.fileUploadArea.addEventListener("click", () =>
      this.imageUpload.click()
    );
    this.imageUpload.addEventListener("change", (e) =>
      this.handleImageUpload(e)
    );
    this.removeImageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeImage();
    });

    this.fileUploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.fileUploadArea.style.borderColor = "var(--primary-orange)";
    });

    this.fileUploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      this.fileUploadArea.style.borderColor = "var(--dark-tertiary)";
    });

    this.fileUploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      this.fileUploadArea.style.borderColor = "var(--dark-tertiary)";
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.imageUpload.files = files;
        this.handleImageUpload({ target: { files } });
      }
    });

    this.downloadQrBtn.addEventListener("click", () =>
      this.downloadQRCodePDF()
    );
    this.detailDownloadQr.addEventListener("click", () =>
      this.downloadQRCodePDF()
    );

    this.detailEditBtn.addEventListener("click", () => {
      this.closeModal(this.detailModal);
      this.openEditModal(this.currentEventId);
    });

    this.detailDeleteBtn.addEventListener("click", () => {
      this.closeModal(this.detailModal);
      this.openDeleteModal(this.currentEventId);
    });

    this.confirmDeleteBtn.addEventListener("click", () => this.confirmDelete());
  }

  openModal(modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentEventId = null;
    this.modalTitle.textContent = "Create New Event";
    this.submitBtn.querySelector(".btn-text").textContent = "Create Event";
    this.eventForm.reset();
    this.removeImage();
    this.openModal(this.eventModal);
  }

  openEditModal(eventId) {
    this.isEditMode = true;
    this.currentEventId = eventId;
    this.modalTitle.textContent = "Edit Event";
    this.submitBtn.querySelector(".btn-text").textContent = "Update Event";
    this.loadEventForEdit(eventId);
    this.openModal(this.eventModal);
  }

  openDeleteModal(eventId) {
    const event = this.events.find((e) => e.event_id === eventId);
    if (event) {
      this.currentEventId = eventId;
      this.deleteEventName.textContent = event.event_name;
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
      this.events = data.data;

      this.renderEvents(this.events);
      this.updateShowingText();
    } catch (error) {
      console.error("Load events error:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to load events. Please try again.",
      });
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
      document.getElementById("description").value = event.description || "";

      if (event.schedules && event.schedules.length > 0) {
        const schedule = event.schedules[0];
        document.getElementById("startTime").value =
          this.formatDateTimeForInput(schedule.start_time);
        document.getElementById("endTime").value = schedule.end_time
          ? this.formatDateTimeForInput(schedule.end_time)
          : "";
        document.getElementById("worshipTopic").value =
          schedule.worship_topic || "";
      }

      if (event.image_url) {
        console.log("Image : ", `${API_BASE_URL}${event.image_url}`);
        this.previewImage.src = `${API_BASE_URL}${event.image_url}`;
        this.fileUploadArea.style.display = "none";
        this.filePreview.style.display = "block";
      }
    } catch (error) {
      console.error("Load event for edit error:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to load event details.",
      });
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.eventForm);
    const obj = Object.fromEntries(formData.entries());
    console.log("Request event : ", obj);

    // if (this.currentImageFile) {
    //   formData.append("image", this.currentImageFile);
    // }

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
        console.log("Formdata : ", formData);
        response = await fetch(this.API_ENDPOINTS.createEvent, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
      }

      if (!response.ok) {
        console.log("Error : ", response.json());
        throw new Error("Failed to save event");
      }

      const result = await response.json();

      showAlert({
        type: "success",
        title: "Success",
        message: this.isEditMode
          ? "Event updated successfully!"
          : "Event created successfully!",
      });

      this.closeModal(this.eventModal);

      if (!this.isEditMode && result.qr_code) {
        this.showQRModal(result);
      }

      await this.loadEvents();
    } catch (error) {
      console.error("Save event error:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to save event. Please try again.",
      });
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

      showAlert({
        type: "success",
        title: "Success",
        message: "Event deleted successfully!",
      });

      this.closeModal(this.deleteModal);
      await this.loadEvents();
    } catch (error) {
      console.error("Delete event error:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to delete event. Please try again.",
      });
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
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to load event details.",
      });
    }
  }

  // Continue in Part 2...
  renderEvents(events) {
    if (events.length === 0) {
      this.showEmptyState();
      return;
    }

    const html = events
      .map((event) => {
        const schedule = event.schedules && event.schedules[0];
        const status = this.getEventStatus(
          schedule?.start_time,
          schedule?.end_time
        );
        const typeClass = `type-${event.event_type}`;

        return `
                <tr data-event-id="${event.event_id}">
                    <td data-label="Event Name" class="event-name-cell">${this.escapeHtml(
                      event.event_name
                    )}</td>
                    <td data-label="Type">
                        <span class="event-type-badge ${typeClass}">${
          event.event_type
        }</span>
                    </td>
                    <td data-label="Date & Time" class="event-datetime">
                        ${
                          schedule
                            ? `
                            <span class="event-date">${this.formatDate(
                              schedule.start_time
                            )}</span>
                            <span class="event-time">${this.formatTime(
                              schedule.start_time
                            )}${
                                schedule.end_time
                                  ? " - " + this.formatTime(schedule.end_time)
                                  : ""
                              }</span>
                        `
                            : '<span class="event-time">No schedule</span>'
                        }
                    </td>
                    <td data-label="Place" class="event-place">${this.escapeHtml(
                      event.place
                    )}</td>
                    <td data-label="Status">
                        <span class="status-badge status-${status.toLowerCase()}">
                            <span class="status-dot"></span>
                            ${status}
                        </span>
                    </td>
                    <td data-label="Actions" class="action-buttons">
                        <button class="action-btn view-btn" onclick="eventManagement.viewEventDetails(${
                          event.event_id
                        })" title="View Details">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 4C4.5 4 1 10 1 10C1 10 4.5 16 10 16C15.5 16 19 10 19 10C19 10 15.5 4 10 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button class="action-btn edit-btn" onclick="eventManagement.openEditModal(${
                          event.event_id
                        })" title="Edit">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M14 2L17 5L6 16H3V13L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="action-btn delete-btn" onclick="eventManagement.openDeleteModal(${
                          event.event_id
                        })" title="Delete">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M3 5H17M8 9V15M12 9V15M4 5L5 17C5 17.5304 5.21071 18.0391 5.58579 18.4142C5.96086 18.7893 6.46957 19 7 19H13C13.5304 19 14.0391 18.7893 14.4142 18.4142C14.7893 18.0391 15 17.5304 15 17L16 5M7 5V3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H12C12.2652 2 12.5196 2.10536 12.7071 2.29289C12.8946 2.48043 13 2.73478 13 3V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

  showEmptyState(message = "Failed to load events") {
    this.eventsTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/>
                            <path d="M3 8H21M8 2V6M16 2V6" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <h3>${message}</h3>
                        <p>Create your first event to get started</p>
                        <button class="btn btn-primary" onclick="eventManagement.openCreateModal()">
                            Create Event
                        </button>
                    </div>
                </td>
            </tr>
        `;
  }

  showDetailModal(event) {
    this.currentEventId = event.event_id;
    console.log("Image : ", `${API_BASE_URL}${event.image_url}`);
    this.detailImage.src = `${API_BASE_URL}${event.image_url}`;

    this.detailEventName.textContent = event.event_name;
    this.detailEventType.textContent = event.event_type;
    this.detailEventType.className = `event-type-badge type-${event.event_type}`;

    if (event.schedules && event.schedules.length > 0) {
      const schedule = event.schedules[0];
      this.detailDateTime.textContent = `${this.formatDate(
        schedule.start_time
      )} at ${this.formatTime(schedule.start_time)}${
        schedule.end_time ? " - " + this.formatTime(schedule.end_time) : ""
      }`;

      if (schedule.worship_topic) {
        this.detailWorshipTopic.textContent = schedule.worship_topic;
        this.detailWorshipTopicContainer.style.display = "flex";
      } else {
        this.detailWorshipTopicContainer.style.display = "none";
      }
    }

    this.detailPlace.textContent = event.place;
    this.detailDescription.textContent =
      event.description || "No description provided";

    this.detailQrCode.src = event.qr_code;

    this.openModal(this.detailModal);
  }

  showQRModal(event) {
    this.qrEventName.textContent = event.event_name;

    if (event.schedules && event.schedules.length > 0) {
      this.qrEventDetails.textContent = `${event.place} • ${this.formatDate(
        event.schedules[0].start_time
      )}`;
    } else {
      this.qrEventDetails.textContent = event.place;
    }

    this.qrCodeImage.src = event.qr_code;
    this.currentEventId = event.event_id;
    this.openModal(this.qrModal);
  }

  handleImageUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert({
        type: "error",
        title: "Invalid File",
        message: "Please select an image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        type: "error",
        title: "File Too Large",
        message: "Image size must be less than 5MB.",
      });
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
    this.imageUpload.value = "";
    this.previewImage.src = "";
    this.fileUploadArea.style.display = "flex";
    this.filePreview.style.display = "none";
  }

  downloadQRCodePDF() {
    const qrCodeSrc = this.detailQrCode
      ? this.detailQrCode.src
      : this.qrCodeImage
      ? this.qrCodeImage.src
      : null;

    if (!qrCodeSrc || qrCodeSrc === "") {
      showAlert({
        type: "error",
        title: "Error",
        message: "QR code not available.",
      });
      return;
    }

    const event = this.events.find((e) => e.event_id === this.currentEventId);
    const eventName = event ? event.event_name : "Event";

    // Download the QR code
    const link = document.createElement("a");
    link.href = qrCodeSrc; // Use the image src that's currently displayed
    link.download = `${eventName.replace(/\s+/g, "-")}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert({
      type: "success",
      title: "Downloaded",
      message: "QR code downloaded successfully!",
    });
  }

  filterEvents() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const typeFilter = this.typeFilter.value;

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

  getEventStatus(startTime, endTime) {
    if (!startTime) return "Unknown";

    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    if (now < start) return "Upcoming";
    if (end && now > end) return "Ended";
    return "Ongoing";
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

  formatDateTimeForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  updateShowingText(count = null) {
    const total = count !== null ? count : this.events.length;
    this.showingText.textContent = `Showing ${total} ${
      total === 1 ? "event" : "events"
    }`;
  }

  setButtonLoading(button, isLoading) {
    const textEl = button.querySelector(".btn-text");
    const loaderEl = button.querySelector(".btn-loader");

    if (isLoading) {
      textEl.style.display = "none";
      loaderEl.style.display = "inline-flex";
      button.disabled = true;
    } else {
      textEl.style.display = "inline-flex";
      loaderEl.style.display = "none";
      button.disabled = false;
    }
  }
}

const eventManagement = new EventManagement();
window.eventManagement = eventManagement;

export default EventManagement;