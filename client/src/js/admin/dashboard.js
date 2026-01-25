import { loadSidebar } from "./adminSidebar.js";
import Chart from "chart.js/auto";

// const API_URL = import.meta.env.VITE_API_URL;

// Export init function untuk dipanggil oleh router
export async function init() {
  // Load sidebar first
  await loadSidebar();

  // Then initialize dashboard components
  initChart();
  initThemeToggle();
  initNotifications();
  initSearch();
}

// Inisialisasi Chart
function initChart() {
  const canvas = document.getElementById("visitorChart");
  if (!canvas) {
    console.warn("Chart canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
      datasets: [
        {
          label: "Pengunjung",
          data: [120, 190, 300, 500, 200, 300, 450],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#3498db",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + " orang";
            },
          },
        },
      },
    },
  });
}

// Inisialisasi Dark Mode Toggle
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) {
    console.warn("Theme toggle button not found");
    return;
  }

  // Load saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    const icon = themeToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
  }

  // Toggle theme on click
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = themeToggle.querySelector("i");

    if (document.body.classList.contains("dark-mode")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      localStorage.setItem("theme", "light");
    }
  });
}

// Inisialisasi Notifications
function initNotifications() {
  const notificationBtn = document.querySelector(".notification-btn");
  if (!notificationBtn) {
    console.warn("Notification button not found");
    return;
  }

  notificationBtn.addEventListener("click", () => {
    // TODO: Replace with actual notification modal/dropdown
    alert("Anda memiliki 3 notifikasi baru!");

    // Optional: Clear badge
    const badge = notificationBtn.querySelector(".badge");
    if (badge) {
      // badge.style.display = 'none';
    }
  });
}

// Inisialisasi Search
function initSearch() {
  const searchInput = document.querySelector(".search-bar input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    // TODO: Implement actual search functionality
    console.log("Searching for:", searchTerm);

    // Example: Filter table rows
    const tableRows = document.querySelectorAll(".recent-orders tbody tr");
    tableRows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });
}
