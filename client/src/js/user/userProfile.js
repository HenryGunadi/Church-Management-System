import { loadUserNavbar, refreshNavbarProfile } from "./userNavbar.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;
let originalData = {};
let userId = null;

// Export init function
export async function init() {
  console.log("Initializing user profile page...");

  await loadUserNavbar();
  await loadProfile();
  initEventListeners();

  console.log("User profile page initialized");
}

// Initialize event listeners
function initEventListeners() {
  const editBtn = document.getElementById("editBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");

  if (editBtn) editBtn.addEventListener("click", enableEdit);
  if (cancelBtn) cancelBtn.addEventListener("click", cancelEdit);
  if (saveBtn) saveBtn.addEventListener("click", saveChanges);
}

// Load user profile from backend
async function loadProfile() {
  try {
    console.log("Loading user profile...");

    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
      credentials: "include",
    });

    if (!verifyResponse.ok) throw new Error("Failed to verify user");

    const verifyData = await verifyResponse.json();
    const tokenUserId = verifyData.user.id;

    const response = await fetch(
      `${API_BASE_URL}/user/view?id=${tokenUserId}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to load profile");

    const data = await response.json();
    const user = data.user;

    console.log("User data loaded:", user);

    originalData = {
      name: user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      address: user.address || "",
      gender: user.gender ? user.gender.toLowerCase() : "",
    };
    userId = user.id;

    updateProfileUI(user);
  } catch (error) {
    console.error("Error loading profile:", error);
    showMessage("Gagal memuat data profil. Silakan refresh halaman.", "error");
  }
}

// Update profile UI
function updateProfileUI(user) {
  // Avatar
  const avatarEl = document.getElementById("userAvatarLarge");
  if (avatarEl && user.name) {
    const parts = user.name.trim().split(" ");
    let initials =
      parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0][0];
    avatarEl.textContent = initials.toUpperCase();
  }

  // Display name/email
  document.getElementById("displayName").textContent =
    user.name || user.email?.split("@")[0] || "User";
  document.getElementById("displayEmail").textContent = user.email || "";

  // Form fields
  document.getElementById("fullName").value = user.name || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone_number || "";
  document.getElementById("address").value = user.address || "";

  const normalizedGender = user.gender ? user.gender.toLowerCase() : "";

  if (normalizedGender === "male") {
    document.getElementById("genderMale").checked = true;
    document.getElementById("genderFemale").checked = false;
  } else if (normalizedGender === "female") {
    document.getElementById("genderMale").checked = false;
    document.getElementById("genderFemale").checked = true;
  } else {
    document.getElementById("genderMale").checked = false;
    document.getElementById("genderFemale").checked = false;
  }
}

// Enable edit mode
function enableEdit() {
  const fields = ["fullName", "phone", "address"];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });

  document.getElementById("genderMale").disabled = false;
  document.getElementById("genderFemale").disabled = false;

  // Email tetap disabled
  document.getElementById("email").disabled = true;

  document.getElementById("editBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "inline-block";

  showMessage("Mode edit diaktifkan. Ubah data Anda dan simpan.", "success");
}

// Cancel edit
function cancelEdit() {
  // Restore original
  document.getElementById("fullName").value = originalData.name || "";
  document.getElementById("email").value = originalData.email || "";
  document.getElementById("phone").value = originalData.phone_number || "";
  document.getElementById("address").value = originalData.address || "";

  if (originalData.gender === "male") {
    document.getElementById("genderMale").checked = true;
    document.getElementById("genderFemale").checked = false;
  } else if (originalData.gender === "female") {
    document.getElementById("genderMale").checked = false;
    document.getElementById("genderFemale").checked = true;
  } else {
    document.getElementById("genderMale").checked = false;
    document.getElementById("genderFemale").checked = false;
  }

  // Disable again
  const fields = ["fullName", "email", "phone", "address"];
  fields.forEach((id) => (document.getElementById(id).disabled = true));
  document.getElementById("genderMale").disabled = true;
  document.getElementById("genderFemale").disabled = true;

  document.getElementById("editBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "none";

  showMessage("Perubahan dibatalkan.", "error");
}

// Save changes
async function saveChanges() {
  try {
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    const genderElement = document.querySelector(
      'input[name="gender"]:checked'
    );
    const gender = genderElement ? genderElement.value : null;

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name) return showMessage("Nama lengkap harus diisi", "error");
    if (!email) return showMessage("Email harus diisi", "error");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return showMessage("Format email tidak valid", "error");

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword)
        return showMessage("Masukkan password saat ini", "error");
      if (!newPassword) return showMessage("Masukkan password baru", "error");
      if (newPassword.length < 6)
        return showMessage("Password baru minimal 6 karakter", "error");
      if (newPassword !== confirmPassword)
        return showMessage("Konfirmasi password tidak cocok", "error");
    }

    const updateData = {
      id: parseInt(userId),
      name,
      email,
      phone_number: phone || null,
      address: address || null,
      gender,
    };

    if (newPassword) updateData.password = newPassword;

    console.log("📤 Updating profile:", updateData);

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    console.log("📤 Sending update request with data:", updateData);

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updateData),
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error response:", error);
      throw new Error(error.message || "Gagal menyimpan perubahan");
    }

    const result = await response.json();
    console.log("✅ Backend response:", result);
    console.log("✅ Updated user data:", result.user);

    await loadProfile();
    await refreshNavbarProfile();

    originalData = {
      name,
      email,
      phone_number: phone,
      address,
      gender: gender ? gender.toLowerCase() : "",
    };

    // Disable fields
    const fields = ["fullName", "email", "phone", "address"];
    fields.forEach((id) => (document.getElementById(id).disabled = true));
    document.getElementById("genderMale").disabled = true;
    document.getElementById("genderFemale").disabled = true;

    document.getElementById("editBtn").style.display = "inline-block";
    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "none";

    // Clear password fields
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    showMessage("✅ Perubahan berhasil disimpan! Tuhan memberkati.", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    showMessage(`Gagal menyimpan: ${error.message}`, "error");
  } finally {
    const saveBtn = document.getElementById("saveBtn");
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Semua Perubahan';
  }
}

// Show message
function showMessage(text, type) {
  const messageEl = document.getElementById("message");
  if (!messageEl) return;

  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;

  setTimeout(() => {
    messageEl.classList.remove("show");
  }, 5000);
}
