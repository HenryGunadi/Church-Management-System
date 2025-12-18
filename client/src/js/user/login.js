import { showAlert } from "./alert";

// API
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ================================
// Init (called by router)
// ================================
export function init() {
  // Form elements
  const form = document.getElementById("loginForm");
  if (!form) return; // page not loaded yet or wrong route

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberMeCheckbox = document.getElementById("rememberMe");
  const submitBtn = document.getElementById("submitBtn");

  // Error elements
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // ================================
  // Helpers
  // ================================
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showError(element, message) {
    element.textContent = message;
    element.classList.add("show");
    element.previousElementSibling?.classList.add("error");
  }

  function hideError(element) {
    element.classList.remove("show");
    element.previousElementSibling?.classList.remove("error");
  }

  // ================================
  // Load remembered email
  // ================================
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMeCheckbox.checked = true;
  }

  // ================================
  // Event listeners
  // ================================
  emailInput.addEventListener("blur", () => {
    if (!emailInput.value) {
      showError(emailError, "Email is required");
    } else if (!validateEmail(emailInput.value)) {
      showError(emailError, "Please enter a valid email address");
    } else {
      hideError(emailError);
    }
  });

  emailInput.addEventListener("input", () => {
    hideError(emailError);
  });

  passwordInput.addEventListener("blur", () => {
    if (!passwordInput.value) {
      showError(passwordError, "Password is required");
    } else {
      hideError(passwordError);
    }
  });

  passwordInput.addEventListener("input", () => {
    hideError(passwordError);
  });

  // ================================
  // Form submit
  // ================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    hideError(emailError);
    hideError(passwordError);

    let hasError = false;

    if (!emailInput.value) {
      showError(emailError, "Email is required");
      hasError = true;
    } else if (!validateEmail(emailInput.value)) {
      showError(emailError, "Please enter a valid email address");
      hasError = true;
    }

    if (!passwordInput.value) {
      showError(passwordError, "Password is required");
      hasError = true;
    }

    if (hasError) return;

    // Remember me
    if (rememberMeCheckbox.checked) {
      localStorage.setItem("rememberedEmail", emailInput.value);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    const payload = {
      email: emailInput.value,
      password: passwordInput.value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing In...";

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert({
          timer: true,
          title: "Success",
          message: String(data.message),
          type: "success",
        });

        if (data.user?.role === "admin") {
          history.pushState(null, "", "/admin");
          window.dispatchEvent(new PopStateEvent("popstate"));
        } else {
          history.pushState(null, "", "/");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      } else {
        showAlert({
          timer: true,
          title: "Login Failed!",
          message: String(data.message),
          type: "error",
        });

        submitBtn.disabled = false;
        submitBtn.textContent = "Sign In";
      }
    } catch (err) {
      console.error("Login error:", err);
      showError(emailError, "An error occurred. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
}
