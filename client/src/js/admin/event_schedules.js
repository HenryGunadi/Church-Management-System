import { loadSidebar } from "./adminSidebar.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ScheduleManagement {
  constructor() {
    this.events = [];
    this.schedules = [];
    this.currentScheduleId = null;
    this.isEditMode = false;

    this.API_ENDPOINTS = {
      getEvents: `${API_BASE_URL}/events/view`,
      createSchedule: `${API_BASE_URL}/schedules/create`,
      updateSchedule: `${API_BASE_URL}/schedules/update`,
      deleteSchedule: (id) => `${API_BASE_URL}/schedules/delete/${id}`,
      getSchedules: `${API_BASE_URL}/schedules/view`,
      getSchedulesByEvent: (eventId) =>
        `${API_BASE_URL}/schedules/view?event_id=${eventId}`,
      regenerateQR: (id) => `${API_BASE_URL}/schedules/regenerate-qr/${id}`,
    };
  }

  async init() {
    await loadSidebar();
    this.cacheDOMElements();
    this.attachEventListeners();
    this.setMinDateTime();
    await this.loadEvents();
    await this.loadSchedules();
  }

  cacheDOMElements() {
    this.createScheduleBtn = document.getElementById("createScheduleBtn");
    this.closeModalBtn = document.getElementById("closeModal");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.submitBtn = document.getElementById("submitBtn");

    this.scheduleModal = document.getElementById("scheduleModal");
    this.qrModal = document.getElementById("qrModal");
    this.deleteModal = document.getElementById("deleteModal");

    this.scheduleForm = document.getElementById("scheduleForm");
    this.modalTitle = document.getElementById("modalTitle");

    this.schedulesTableBody = document.getElementById("schedulesTableBody");
    this.eventFilter = document.getElementById("eventFilter");
    this.showingText = document.getElementById("showingText");

    this.eventIdSelect = document.getElementById("eventId");
    this.startTimeInput = document.getElementById("startTime");
    this.endTimeInput = document.getElementById("endTime");
    this.worshipTopicInput = document.getElementById("worshipTopic");

    this.closeQrModal = document.getElementById("closeQrModal");
    this.qrCodeImage = document.getElementById("qrCodeImage");
    this.qrEventName = document.getElementById("qrEventName");
    this.qrScheduleDetails = document.getElementById("qrScheduleDetails");
    this.downloadQrBtn = document.getElementById("downloadQrBtn");

    this.closeDeleteModal = document.getElementById("closeDeleteModal");
    this.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    this.confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  }

  attachEventListeners() {
    if (this.createScheduleBtn) {
      this.createScheduleBtn.addEventListener("click", () =>
        this.openCreateModal()
      );
    }

    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () =>
        this.closeModal(this.scheduleModal)
      );
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () =>
        this.closeModal(this.scheduleModal)
      );
    }

    if (this.closeQrModal) {
      this.closeQrModal.addEventListener("click", () =>
        this.closeModal(this.qrModal)
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

    [this.scheduleModal, this.qrModal, this.deleteModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeModal(modal);
          }
        });
      }
    });

    if (this.scheduleForm) {
      this.scheduleForm.addEventListener("submit", (e) =>
        this.handleFormSubmit(e)
      );
    }

    if (this.eventFilter) {
      this.eventFilter.addEventListener("change", () => this.filterSchedules());
    }

    if (this.downloadQrBtn) {
      this.downloadQrBtn.addEventListener("click", () => this.downloadQRCode());
    }

    if (this.confirmDeleteBtn) {
      this.confirmDeleteBtn.addEventListener("click", () =>
        this.confirmDelete()
      );
    }

    if (this.startTimeInput) {
      this.startTimeInput.addEventListener("change", () =>
        this.validateStartTime()
      );
    }

    if (this.endTimeInput) {
      this.endTimeInput.addEventListener("change", () =>
        this.validateEndTime()
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
    this.currentScheduleId = null;
    if (this.modalTitle) this.modalTitle.textContent = "Add New Schedule";
    if (this.submitBtn) {
      const btnText = this.submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Create Schedule";
    }
    if (this.scheduleForm) this.scheduleForm.reset();
    this.openModal(this.scheduleModal);
  }

  openEditModal(scheduleId) {
    this.isEditMode = true;
    this.currentScheduleId = scheduleId;
    if (this.modalTitle) this.modalTitle.textContent = "Edit Schedule";
    if (this.submitBtn) {
      const btnText = this.submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = "Update Schedule";
    }
    this.loadScheduleForEdit(scheduleId);
    this.openModal(this.scheduleModal);
  }

  openDeleteModal(scheduleId) {
    this.currentScheduleId = scheduleId;
    this.openModal(this.deleteModal);
  }

  async loadEvents() {
    try {
      const response = await fetch(this.API_ENDPOINTS.getEvents, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load events");
      }

      const data = await response.json();
      this.events = data.data || [];

      // Populate event dropdowns
      this.populateEventDropdowns();
    } catch (error) {
      console.error("Load events error:", error);
    }
  }

  populateEventDropdowns() {
    // Populate create/edit modal dropdown
    if (this.eventIdSelect) {
      const options = this.events
        .map(
          (event) =>
            `<option value="${event.event_id}">${event.event_name} (${event.event_type})</option>`
        )
        .join("");
      this.eventIdSelect.innerHTML =
        '<option value="">Choose an event...</option>' + options;
    }

    // Populate filter dropdown
    if (this.eventFilter) {
      const options = this.events
        .map(
          (event) =>
            `<option value="${event.event_id}">${event.event_name}</option>`
        )
        .join("");
      this.eventFilter.innerHTML =
        '<option value="">All Events</option>' + options;
    }
  }

  async loadSchedules() {
    try {
      this.showLoadingState();

      // ✅ FIXED: Get events which include schedules
      const response = await fetch(this.API_ENDPOINTS.getEvents, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load schedules");
      }

      const data = await response.json();
      const events = data.data || [];

      // ✅ FIXED: Extract schedules with QR code from schedule, not event
      this.schedules = [];
      events.forEach((event) => {
        if (event.schedules && event.schedules.length > 0) {
          event.schedules.forEach((schedule) => {
            this.schedules.push({
              schedule_id: schedule.schedule_id,
              event_id: event.event_id,
              event_name: event.event_name,
              event_type: event.event_type,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              worship_topic: schedule.worship_topic,
              qr_code: schedule.qr_code, // ✅ QR code is now on schedule, not event
            });
          });
        }
      });

      this.renderSchedules(this.schedules);
      this.updateShowingText();
    } catch (error) {
      console.error("Load schedules error:", error);
      this.showEmptyState("Failed to load schedules");
    }
  }

  loadScheduleForEdit(scheduleId) {
    const schedule = this.schedules.find((s) => s.schedule_id === scheduleId);
    if (!schedule) return;

    if (this.eventIdSelect) this.eventIdSelect.value = schedule.event_id;
    if (this.startTimeInput)
      this.startTimeInput.value = this.formatDateTimeForInput(
        schedule.start_time
      );
    if (this.endTimeInput && schedule.end_time)
      this.endTimeInput.value = this.formatDateTimeForInput(schedule.end_time);
    if (this.worshipTopicInput)
      this.worshipTopicInput.value = schedule.worship_topic || "";
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateStartTime() || !this.validateEndTime()) {
      return;
    }

    const formData = new FormData(this.scheduleForm);
    const data = Object.fromEntries(formData.entries());

    // ✅ Convert event_id to integer
    data.event_id = parseInt(data.event_id);

    this.setButtonLoading(this.submitBtn, true);

    try {
      let response;

      if (this.isEditMode) {
        // ✅ FIXED: Send id in body for update
        data.id = this.currentScheduleId;
        response = await fetch(this.API_ENDPOINTS.updateSchedule, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });
      } else {
        // ✅ FIXED: Create endpoint now auto-generates QR
        response = await fetch(this.API_ENDPOINTS.createSchedule, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save schedule");
      }

      const result = await response.json();

      alert(
        this.isEditMode
          ? "Schedule updated successfully!"
          : "Schedule created successfully with QR code!"
      );

      this.closeModal(this.scheduleModal);
      await this.loadSchedules();
    } catch (error) {
      console.error("Save schedule error:", error);
      alert(error.message || "Failed to save schedule. Please try again.");
    } finally {
      this.setButtonLoading(this.submitBtn, false);
    }
  }

  async confirmDelete() {
    this.setButtonLoading(this.confirmDeleteBtn, true);

    try {
      const response = await fetch(
        this.API_ENDPOINTS.deleteSchedule(this.currentScheduleId),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete schedule");
      }

      alert("Schedule deleted successfully!");

      this.closeModal(this.deleteModal);
      await this.loadSchedules();
    } catch (error) {
      console.error("Delete schedule error:", error);
      alert(error.message || "Failed to delete schedule. Please try again.");
    } finally {
      this.setButtonLoading(this.confirmDeleteBtn, false);
    }
  }

  // ✅ NEW: Regenerate QR code for a schedule
  async regenerateQR(scheduleId) {
    if (
      !confirm(
        "Are you sure you want to regenerate the QR code for this schedule?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        this.API_ENDPOINTS.regenerateQR(scheduleId),
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to regenerate QR code");
      }

      alert("QR code regenerated successfully!");
      await this.loadSchedules();
    } catch (error) {
      console.error("Regenerate QR error:", error);
      alert(error.message || "Failed to regenerate QR code. Please try again.");
    }
  }

  renderSchedules(schedules) {
    if (schedules.length === 0) {
      this.showEmptyState();
      return;
    }

    // Sort schedules by start_time
    const sortedSchedules = [...schedules].sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    const html = sortedSchedules
      .map((schedule) => {
        const status = this.getScheduleStatus(
          schedule.start_time,
          schedule.end_time
        );
        const statusClass = status.toLowerCase();

        return `
        <tr data-schedule-id="${schedule.schedule_id}">
          <td class="event-name-cell">
            ${this.escapeHtml(schedule.event_name)}
            <span class="event-type-badge type-${schedule.event_type}">${
          schedule.event_type
        }</span>
          </td>
          <td class="schedule-datetime">
            <span class="schedule-date">${this.formatDate(
              schedule.start_time
            )}</span><br>
            <span class="schedule-time">${this.formatTime(
              schedule.start_time
            )}${
          schedule.end_time ? " - " + this.formatTime(schedule.end_time) : ""
        }</span>
          </td>
          <td class="schedule-topic">${
            schedule.worship_topic
              ? this.escapeHtml(schedule.worship_topic)
              : "-"
          }</td>
          <td>
            <span class="status-badge status-${statusClass}">
              <span class="status-dot"></span>
              ${status}
            </span>
          </td>
          <td>
            ${
              schedule.qr_code
                ? `<button class="qr-btn" onclick="scheduleManagement.showQRModal(${schedule.schedule_id})" title="View QR Code">
                    <i class="fas fa-qrcode"></i>
                  </button>`
                : '<span class="text-muted">Generating...</span>'
            }
          </td>
          <td class="action-buttons">
            <button class="action-btn edit-btn" onclick="scheduleManagement.openEditModal(${
              schedule.schedule_id
            })" title="Edit">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14 2L17 5L6 16H3V13L14 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            ${
              schedule.qr_code
                ? `<button class="action-btn regenerate-btn" onclick="scheduleManagement.regenerateQR(${schedule.schedule_id})" title="Regenerate QR">
                    <i class="fas fa-sync-alt"></i>
                  </button>`
                : ""
            }
            <button class="action-btn delete-btn" onclick="scheduleManagement.openDeleteModal(${
              schedule.schedule_id
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

    this.schedulesTableBody.innerHTML = html;
  }

  showLoadingState() {
    this.schedulesTableBody.innerHTML = `
      <tr class="loading-row">
        <td colspan="6">
          <div class="loading-spinner"></div>
          <p>Loading schedules...</p>
        </td>
      </tr>
    `;
  }

  showEmptyState(message = "No schedules found") {
    this.schedulesTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke-width="2"/>
            </svg>
            <h3>${message}</h3>
            <p>Create your first schedule to get started</p>
            <button class="btn btn-primary" onclick="scheduleManagement.openCreateModal()">
              <i class="fas fa-plus"></i> Add Schedule
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  showQRModal(scheduleId) {
    const schedule = this.schedules.find((s) => s.schedule_id === scheduleId);
    if (!schedule) return;

    if (this.qrEventName) this.qrEventName.textContent = schedule.event_name;
    if (this.qrScheduleDetails) {
      this.qrScheduleDetails.textContent = `${this.formatDate(
        schedule.start_time
      )} at ${this.formatTime(schedule.start_time)}`;
    }
    if (this.qrCodeImage && schedule.qr_code) {
      this.qrCodeImage.src = schedule.qr_code;
    }

    this.currentScheduleId = scheduleId;
    this.openModal(this.qrModal);
  }

  downloadQRCode() {
    const schedule = this.schedules.find(
      (s) => s.schedule_id === this.currentScheduleId
    );
    if (!schedule || !schedule.qr_code) {
      alert("QR code not available.");
      return;
    }

    const link = document.createElement("a");
    link.href = schedule.qr_code;
    link.download = `${schedule.event_name.replace(
      /\s+/g,
      "-"
    )}-${this.formatDate(schedule.start_time).replace(/\s+/g, "-")}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("QR code downloaded successfully!");
  }

  filterSchedules() {
    const eventFilter = this.eventFilter?.value || "";

    const filtered = this.schedules.filter((schedule) => {
      return !eventFilter || schedule.event_id == eventFilter;
    });

    this.renderSchedules(filtered);
    this.updateShowingText(filtered.length);
  }

  getScheduleStatus(startTime, endTime) {
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
    if (!this.showingText) return;
    const total = count !== null ? count : this.schedules.length;
    this.showingText.textContent = `Showing ${total} ${
      total === 1 ? "schedule" : "schedules"
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

  setMinDateTime() {
    const now = new Date();
    const minDateTime = this.formatDateTimeForInput(now.toISOString());

    if (this.startTimeInput) {
      this.startTimeInput.min = minDateTime;
    }

    if (this.endTimeInput) {
      this.endTimeInput.min = minDateTime;
    }
  }

  validateStartTime() {
    if (!this.startTimeInput || !this.startTimeInput.value) return true;

    const startTime = new Date(this.startTimeInput.value);
    const now = new Date();

    now.setMinutes(now.getMinutes() - 1);

    if (startTime < now && !this.isEditMode) {
      alert(
        "Start time cannot be in the past. Please select a future date and time."
      );
      this.startTimeInput.value = "";
      this.startTimeInput.focus();
      return false;
    }

    this.validateEndTime();
    return true;
  }

  validateEndTime() {
    if (!this.endTimeInput || !this.endTimeInput.value) return true;
    if (!this.startTimeInput || !this.startTimeInput.value) return true;

    const startTime = new Date(this.startTimeInput.value);
    const endTime = new Date(this.endTimeInput.value);
    const now = new Date();

    if (endTime < now && !this.isEditMode) {
      alert(
        "End time cannot be in the past. Please select a future date and time."
      );
      this.endTimeInput.value = "";
      this.endTimeInput.focus();
      return false;
    }

    if (endTime <= startTime) {
      alert(
        "End time must be after start time. Please select a valid end time."
      );
      this.endTimeInput.value = "";
      this.endTimeInput.focus();
      return false;
    }

    return true;
  }
}

// Create instance and make it globally accessible
let scheduleManagement;

// Export init function for router
export async function init() {
  scheduleManagement = new ScheduleManagement();
  await scheduleManagement.init();
  window.scheduleManagement = scheduleManagement;
}

export default ScheduleManagement;
