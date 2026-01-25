import { showAlert } from "./alert";

// API
const apiUrl = import.meta.env.VITE_API_URL;

export function init() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  if (form.dataset.initialized) return;
  form.dataset.initialized = "true";

  // Form elements
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phoneNumber"); // NEW
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");

  // Error elements
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError"); // NEW
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  // Password strength
  const strengthBar = document.getElementById("strengthBar");

  // Eye toggles
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

  // ================================
  // VALIDATION FUNCTIONS
  // ================================

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // NEW: Phone validation for Indonesian numbers
  function validatePhone(phone) {
    // Remove all spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    // Check if it's a valid Indonesian phone number
    // Format: +62xxx or 08xxx (minimum 10 digits after country code)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
    
    return phoneRegex.test(cleanPhone);
  }

  // NEW: Format phone number for display
  function formatPhoneNumber(phone) {
    // Remove all non-digits except +
    let cleaned = phone.replace(/[^\d+]/g, "");
    
    // If starts with 0, keep it
    // If starts with 62, add +
    if (cleaned.startsWith("62") && !cleaned.startsWith("+62")) {
      cleaned = "+" + cleaned;
    }
    
    return cleaned;
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
    input.classList.remove("valid");
  }

  function hideError(input, errorEl) {
    errorEl.classList.remove("show");
    input.classList.remove("error");
  }

  // ================================
  // EYE TOGGLE HANDLERS
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
  // EMAIL VALIDATION
  // ================================

  emailInput.addEventListener("blur", () => {
    if (!emailInput.value) {
      showError(emailInput, emailError, "Email is required");
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, emailError, "Please enter a valid email");
    } else {
      hideError(emailInput, emailError);
      emailInput.classList.add("valid");
    }
  });

  emailInput.addEventListener("input", () => {
    hideError(emailInput, emailError);
  });

  // ================================
  // PHONE NUMBER VALIDATION - NEW
  // ================================

  phoneInput.addEventListener("input", () => {
    hideError(phoneInput, phoneError);
    
    // Auto-format as user types
    const formatted = formatPhoneNumber(phoneInput.value);
    if (formatted !== phoneInput.value) {
      const cursorPos = phoneInput.selectionStart;
      phoneInput.value = formatted;
      phoneInput.setSelectionRange(cursorPos, cursorPos);
    }
  });

  phoneInput.addEventListener("blur", () => {
    if (!phoneInput.value) {
      showError(phoneInput, phoneError, "Phone number is required");
    } else if (!validatePhone(phoneInput.value)) {
      showError(
        phoneInput,
        phoneError,
        "Please enter a valid Indonesian phone number (e.g., +62812xxxx or 0812xxxx)"
      );
    } else {
      hideError(phoneInput, phoneError);
      phoneInput.classList.add("valid");
    }
  });

  // ================================
  // PASSWORD VALIDATION
  // ================================

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
      passwordInput.classList.add("valid");
    }

    updatePasswordStrength();
  });

  confirmPasswordInput.addEventListener("input", () => {
    hideError(confirmPasswordInput, confirmPasswordError);
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
      confirmPasswordInput.classList.add("valid");
    }
  });

  // ================================
  // FORM SUBMIT
  // ================================

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear all errors
    hideError(emailInput, emailError);
    hideError(phoneInput, phoneError);
    hideError(passwordInput, passwordError);
    hideError(confirmPasswordInput, confirmPasswordError);

    let hasError = false;
    const strength = checkPasswordStrength(passwordInput.value);

    // Validate email
    if (!emailInput.value || !validateEmail(emailInput.value)) {
      showError(emailInput, emailError, "Invalid email");
      hasError = true;
    }

    // Validate phone number - NEW
    if (!phoneInput.value || !validatePhone(phoneInput.value)) {
      showError(
        phoneInput,
        phoneError,
        "Invalid phone number format"
      );
      hasError = true;
    }

    // Validate password
    if (
      !passwordInput.value ||
      passwordInput.value.length < 8 ||
      strength < 2
    ) {
      showError(passwordInput, passwordError, "Weak password");
      hasError = true;
    }

    // Validate confirm password
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

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      // Format phone number for database
      const phoneFormatted = formatPhoneNumber(phoneInput.value);

      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: emailInput.value,
          phone_number: phoneFormatted, // NEW: Send to backend
          password: passwordInput.value,
          role: "member",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Show success message
        showAlert({
          timer: true,
          type: "success",
          title: "Registration Successful!",
          message: "Please login to continue",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          history.pushState(null, "", "/login");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }, 2000);
      } else {
        showAlert({
          timer: true,
          type: "error",
          title: "Registration Failed",
          message: data.message || "Please try again",
        });

        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      showAlert({
        timer: true,
        type: "error",
        title: "Connection Error",
        message: "Unable to connect to server. Please try again.",
      });

      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });

  console.log("✅ Register form initialized with phone validation");
}