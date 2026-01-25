// src/js/user/scan.js

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function init() {
  console.log("🎯 Initializing scan page...");
  await processCheckIn();
}

async function processCheckIn() {
  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    showError("Invalid QR code. No token found.");
    return;
  }

  try {
    console.log("🔄 Checking in with token:", token);

    // Call the check-in API endpoint
    const response = await fetch(`${API_BASE_URL}/attendance/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Check-in successful:", data);
      showSuccess(data);
    } else {
      console.error("❌ Check-in failed:", data);
      showError(data.message || "Failed to check in. Please contact support.");
    }
  } catch (error) {
    console.error("❌ Check-in error:", error);
    showError("Network error. Please check your connection and try again.");
  }
}

function showSuccess(data) {
  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("successState").classList.remove("hidden");

  // Display event information if available
  if (data.event) {
    const eventInfo = document.getElementById("eventInfo");
    eventInfo.innerHTML = `
      <h3>${data.event.event_name || "Event"}</h3>
      <p><strong>📅 Date:</strong> ${data.event.date || "N/A"}</p>
      <p><strong>🕒 Time:</strong> ${data.event.time || "N/A"}</p>
      <p><strong>📍 Location:</strong> ${data.event.place || "N/A"}</p>
    `;
  }
}

function showError(message) {
  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("errorState").classList.remove("hidden");
  document.getElementById("errorMessage").textContent = message;
}
