import { showAlert } from "./alert";

// API
const apiUrl = import.meta.env.VITE_API_URL;

// ================================
// Init (called by router)
// ================================
export function init() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  if (form.dataset.initialized) return;
  form.dataset.initialized = "true";

  // Form elements
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");

  // Error elements
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  // Password strength
  const strengthBar = document.getElementById("strengthBar");

  // Eye toggles
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );

  // ================================
  // Helpers
  // ================================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  }

  function updatePasswordStrength() {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);

    strengthBar.classList.remove(
      "strength-weak",
      "strength-medium",
      "strength-strong"
    );

    if (!password) {
      strengthBar.style.width = "0";
    } else if (strength <= 2) {
      strengthBar.classList.add("strength-weak");
      strengthBar.style.width = "33%";
    } else if (strength <= 3) {
      strengthBar.classList.add("strength-medium");
      strengthBar.style.width = "66%";
    } else {
      strengthBar.classList.add("strength-strong");
      strengthBar.style.width = "100%";
    }
  }

  function showError(input, errorEl, message) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
    input.classList.add("error");
  }

  function hideError(input, errorEl) {
    errorEl.classList.remove("show");
    input.classList.remove("error");
  }

  // ================================
  // Eye toggles
  // ================================
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });

  toggleConfirmPassword.addEventListener("click", () => {
    const type = confirmPasswordInput.type === "password" ? "text" : "password";
    confirmPasswordInput.type = type;
    toggleConfirmPassword.textContent = type === "password" ? "👁️" : "🙈";
  });

  // ================================
  // Validation listeners
  // ================================
  emailInput.addEventListener("blur", () => {
    if (!emailInput.value) {
      showError(emailInput, emailError, "Email is required");
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, emailError, "Please enter a valid email");
    } else {
      hideError(emailInput, emailError);
    }
  });

  emailInput.addEventListener("input", () => hideError(emailInput, emailError));

  passwordInput.addEventListener("input", () => {
    updatePasswordStrength();
    hideError(passwordInput, passwordError);

    if (confirmPasswordInput.value) {
      passwordInput.value === confirmPasswordInput.value
        ? hideError(confirmPasswordInput, confirmPasswordError)
        : showError(
            confirmPasswordInput,
            confirmPasswordError,
            "Passwords do not match"
          );
    }
  });

  passwordInput.addEventListener("blur", () => {
    const strength = checkPasswordStrength(passwordInput.value);

    if (!passwordInput.value) {
      showError(passwordInput, passwordError, "Password is required");
    } else if (passwordInput.value.length < 8) {
      showError(
        passwordInput,
        passwordError,
        "Password must be at least 8 characters"
      );
    } else if (strength < 2) {
      showError(passwordInput, passwordError, "Password is too weak");
    } else {
      hideError(passwordInput, passwordError);
    }

    updatePasswordStrength();
  });

  confirmPasswordInput.addEventListener("blur", () => {
    if (!confirmPasswordInput.value) {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Please confirm your password"
      );
    } else if (passwordInput.value !== confirmPasswordInput.value) {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Passwords do not match"
      );
    } else {
      hideError(confirmPasswordInput, confirmPasswordError);
    }
  });

  // ================================
  // Submit
  // ================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    hideError(emailInput, emailError);
    hideError(passwordInput, passwordError);
    hideError(confirmPasswordInput, confirmPasswordError);

    let hasError = false;
    const strength = checkPasswordStrength(passwordInput.value);

    if (!emailInput.value || !validateEmail(emailInput.value)) {
      showError(emailInput, emailError, "Invalid email");
      hasError = true;
    }

    if (
      !passwordInput.value ||
      passwordInput.value.length < 8 ||
      strength < 2
    ) {
      showError(passwordInput, passwordError, "Weak password");
      hasError = true;
    }

    if (
      !confirmPasswordInput.value ||
      passwordInput.value !== confirmPasswordInput.value
    ) {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Passwords do not match"
      );
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value,
          role: "member",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // navigation
        history.pushState(null, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } else {
        showAlert({
          timer: true,
          type: "error",
          title: "Register Failed",
          message: data.message,
        });

        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      }
    } catch (err) {
      console.error(err);
      showError(
        emailInput,
        emailError,
        `An error occurred. Please try again : ${err.messagea}`
      );
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}
