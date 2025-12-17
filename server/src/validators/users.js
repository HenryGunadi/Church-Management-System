const { body, param, query } = require("express-validator");

const createUserValidation = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email").isEmail().withMessage("Email must be valid"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or member"),

  body("gender")
    .optional()
    .isIn(["Male", "Female"])
    .withMessage("Gender must be Male or Female"),

  body("birth_date")
    .optional()
    .isISO8601()
    .withMessage("Birth date must be a valid date (YYYY-MM-DD)"),

  body("phone_number")
    .optional()
    .isString()
    .withMessage("Phone number must be a string"),

  body("address").optional().isString().withMessage("Address must be a string"),
];

const updateUserValidation = [
  body("id").isInt().withMessage("User ID must be an integer"),

  body("name").optional().notEmpty().withMessage("Name cannot be empty"),

  body("email").optional().isEmail().withMessage("Email must be valid"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either admin or member"),

  body("gender")
    .optional()
    .isIn(["Male", "Female"])
    .withMessage("Gender must be Male or Female"),

  body("birth_date")
    .optional()
    .isISO8601()
    .withMessage("Birth date must be a valid date"),

  body("phone_number")
    .optional()
    .isString()
    .withMessage("Phone number must be a string"),

  body("address").optional().isString().withMessage("Address must be a string"),
];

const viewUserValidation = [
  query("id").optional().isInt().withMessage("User ID must be an integer"),
  query("email").optional().isEmail().withMessage("Email must be valid"),
];

const deleteUserValidation = [
  param("id").isInt().withMessage("User ID must be an integer"),
  param("email").optional().isEmail().withMessage("Email must be valid"),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  viewUserValidation,
  deleteUserValidation,
};
