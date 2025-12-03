// Alert Component
class AlertNotification {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (!document.getElementById("alert-container")) {
      this.container = document.createElement("div");
      this.container.id = "alert-container";
      this.container.className = "alert-container";
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById("alert-container");
    }
  }

  show({ timer = true, type = "info", message = "", title = "" }) {
    const validTypes = ["error", "warning", "success", "info"];
    if (!validTypes.includes(type)) {
      console.error(`Invalid alert type: ${type}`);
      type = "info";
    }

    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-enter`;

    const icon = this.getIcon(type);

    alert.innerHTML = `
      <div class="alert-icon">${icon}</div>
      <div class="alert-content">
        ${title ? `<div class="alert-title">${title}</div>` : ""}
        <div class="alert-message">${message}</div>
      </div>
      <button class="alert-close" aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      ${timer ? '<div class="alert-progress"></div>' : ""}
    `;

    this.container.appendChild(alert);

    setTimeout(() => {
      alert.classList.remove("alert-enter");
    }, 10);

    const closeBtn = alert.querySelector(".alert-close");
    closeBtn.addEventListener("click", () => {
      this.close(alert);
    });

    if (timer) {
      const progressBar = alert.querySelector(".alert-progress");
      progressBar.style.animation = "progress 5s linear forwards";

      setTimeout(() => {
        this.close(alert);
      }, 5000);
    }

    return alert;
  }

  close(alert) {
    alert.classList.add("alert-exit");
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 300);
  }

  getIcon(type) {
    const icons = {
      success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 20H22L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    };
    return icons[type] || icons.info;
  }
}

const alertNotification = new AlertNotification();

export function showAlert({
  timer = true,
  type = "info",
  message = "",
  title = "",
}) {
  return alertNotification.show({ timer, type, message, title });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { AlertNotification, showAlert };
}
