import { showAlert } from "./alert";

// API
const apiUrl = import.meta.env.VITE_API_URL || "http:localhost:3000/api";

// Form elements
const form = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");

// Error message elements
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

// Password strength indicator
const strengthBar = document.getElementById("strengthBar");

// Eye toggle buttons
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

  // Remove all strength classes
  strengthBar.classList.remove(
    "strength-weak",
    "strength-medium",
    "strength-strong"
  );

  if (password.length === 0) {
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

function showError(inputElement, errorElement, message) {
  errorElement.textContent = message;
  errorElement.classList.add("show");
  inputElement.classList.add("error");
}

function hideError(inputElement, errorElement) {
  errorElement.classList.remove("show");
  inputElement.classList.remove("error");
}

// Eye toggle functionality
togglePassword.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});

toggleConfirmPassword.addEventListener("click", function () {
  const type =
    confirmPasswordInput.getAttribute("type") === "password"
      ? "text"
      : "password";
  confirmPasswordInput.setAttribute("type", type);
  toggleConfirmPassword.textContent = type === "password" ? "👁️" : "🙈";
});

// Real-time validation
emailInput.addEventListener("blur", function () {
  if (!emailInput.value) {
    showError(emailInput, emailError, "Email is required");
  } else if (!validateEmail(emailInput.value)) {
    showError(emailInput, emailError, "Please enter a valid email address");
  } else {
    hideError(emailInput, emailError);
  }
});

emailInput.addEventListener("input", function () {
  if (emailError.classList.contains("show")) {
    hideError(emailInput, emailError);
  }
});

passwordInput.addEventListener("input", function () {
  updatePasswordStrength();
  if (passwordError.classList.contains("show")) {
    hideError(passwordInput, passwordError);
  }

  // Revalidate confirm password if it has a value
  if (confirmPasswordInput.value) {
    if (passwordInput.value === confirmPasswordInput.value) {
      hideError(confirmPasswordInput, confirmPasswordError);
    } else {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Passwords do not match"
      );
    }
  }
});

passwordInput.addEventListener("blur", function () {
  const strength = checkPasswordStrength(passwordInput.value);

  if (!passwordInput.value) {
    showError(passwordInput, passwordError, "Password is required");
  } else if (passwordInput.value.length < 8) {
    showError(
      passwordInput,
      passwordError,
      "Password must be at least 8 characters long"
    );
  } else if (strength < 2) {
    showError(
      passwordInput,
      passwordError,
      "Password is too weak. Use a mix of letters, numbers, and symbols"
    );
  } else {
    hideError(passwordInput, passwordError);
  }

  // Update strength bar on blur as well
  updatePasswordStrength();
});

confirmPasswordInput.addEventListener("input", function () {
  if (confirmPasswordError.classList.contains("show")) {
    hideError(confirmPasswordInput, confirmPasswordError);
  }
});

confirmPasswordInput.addEventListener("blur", function () {
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

// Form submission
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Clear all errors
  hideError(emailInput, emailError);
  hideError(passwordInput, passwordError);
  hideError(confirmPasswordInput, confirmPasswordError);

  let hasError = false;

  // Validate email
  if (!emailInput.value) {
    showError(emailInput, emailError, "Email is required");
    hasError = true;
  } else if (!validateEmail(emailInput.value)) {
    showError(emailInput, emailError, "Please enter a valid email address");
    hasError = true;
  }

  // Validate password
  const strength = checkPasswordStrength(passwordInput.value);
  if (!passwordInput.value) {
    showError(passwordInput, passwordError, "Password is required");
    hasError = true;
  } else if (passwordInput.value.length < 8) {
    showError(
      passwordInput,
      passwordError,
      "Password must be at least 8 characters long"
    );
    hasError = true;
  } else if (strength < 2) {
    showError(
      passwordInput,
      passwordError,
      "Password is too weak. Use a mix of letters, numbers, and symbols"
    );
    hasError = true;
  }

  // Validate confirm password
  if (!confirmPasswordInput.value) {
    showError(
      confirmPasswordInput,
      confirmPasswordError,
      "Please confirm your password"
    );
    hasError = true;
  } else if (passwordInput.value !== confirmPasswordInput.value) {
    showError(
      confirmPasswordInput,
      confirmPasswordError,
      "Passwords do not match"
    );
    hasError = true;
  }

  if (hasError) {
    return;
  }

  // Prepare payload
  const payload = {
    email: emailInput.value,
    password: passwordInput.value,
    role: "member",
  };

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";

  try {
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      // Registration successful
      // showAlert({
      //   timer: true,
      //   type: "success",
      //   title: "Register Success!",
      //   message: `${data}`,
      // });
      window.location.href = "login.html";
    } else {
      // Handle error
      console.log(data);
      showAlert({
        timer: true,
        type: "error",
        title: "Register Failed!",
        message: `${data.message}`,
      });

      // showError(emailInput, emailError, data.message || "Registration failed");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }

    // window.location.href = "login.html";
  } catch (error) {
    console.error("Registration error:", error);
    showError(emailInput, emailError, "An error occurred. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});
