const { body } = require("express-validator");

const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail(),

  // ✅ NEW: Phone number validation
  body("phone_number")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value) return true; // Allow empty/null
      
      // Remove spaces and dashes for validation
      const cleaned = value.replace(/[\s\-\(\)]/g, "");
      
      // Indonesian phone number format: +62xxx or 08xxx
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
      
      if (!phoneRegex.test(cleaned)) {
        throw new Error("Invalid Indonesian phone number format (e.g., +62812xxxx or 0812xxxx)");
      }
      
      return true;
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or member"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = {
  registerValidation,
  loginValidation,
};