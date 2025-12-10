const { body } = require("express-validator");

const registerValidation = [
  body("email").isEmail().withMessage("Email must be valid"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or guest"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email must be valid"),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerValidation,
  loginValidation,
};
