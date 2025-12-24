let originalData = {
  name: "Nama Jemaat",
  email: "jemaat@gereja.com",
};

let currentPhotoUrl =
  "https://ui-avatars.com/api/?name=Nama+Jemaat&size=160&background=ff6b35&color=fff";

// Handle photo upload
document.getElementById("photoInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5000000) {
      showMessage("Ukuran file terlalu besar. Maksimal 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById("profilePhoto").src = event.target.result;
      currentPhotoUrl = event.target.result;
      showMessage(
        "✅ Foto berhasil dipilih. Jangan lupa simpan perubahan!",
        "success"
      );
    };
    reader.readAsDataURL(file);
  }
});

function enableEdit() {
  ["name", "email"].forEach((id) => {
    document.getElementById(id).disabled = false;
  });
  document.getElementById("editBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

function cancelEdit() {
  ["name", "email"].forEach((id) => {
    const field = document.getElementById(id);
    field.value = originalData[id] || "";
    field.disabled = true;
  });
  document.getElementById("editBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";
}

function saveChanges() {
  // Validasi data pribadi
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name) {
    showMessage("❌ Nama lengkap harus diisi", "error");
    return;
  }

  if (!email) {
    showMessage("❌ Email harus diisi", "error");
    return;
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("❌ Format email tidak valid", "error");
    return;
  }

  // Validasi password jika diisi
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword) {
      showMessage("❌ Masukkan password saat ini", "error");
      return;
    }
    if (!newPassword) {
      showMessage("❌ Masukkan password baru", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMessage("❌ Password baru minimal 6 karakter", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage("❌ Konfirmasi password tidak cocok", "error");
      return;
    }
  }

  // Simpan data
  originalData.name = name;
  originalData.email = email;

  // Disable fields
  ["name", "email"].forEach((id) => {
    document.getElementById(id).disabled = true;
  });

  // Reset buttons
  document.getElementById("editBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";

  // Reset password fields
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";

  showMessage("✅ Perubahan berhasil disimpan! Tuhan memberkati.", "success");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMessage(text, type) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;

  setTimeout(() => {
    messageEl.classList.remove("show");
  }, 5000);
}

export function init() {
  loadProfile();
}

async function loadProfile() {
  const res = await fetch("http://localhost:3000/api/users/me");
  const user = await res.json();

  document.getElementById("fullName").value = user.name;
  document.getElementById("email").value = user.email;
}
