const { body, param } = require("express-validator");

const createEventValidation = [
  body("event_name").notEmpty().withMessage("Event name is required."),
  body("place").notEmpty().withMessage("Place is required."),
  body("image_url")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL."),
  body("qr_code")
    .optional()
    .isString()
    .withMessage("QR code must be a string."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string."),
];

const updateEventValidation = [
  body("id").notEmpty().withMessage("Event ID is required."),
  body("event_name")
    .optional()
    .isString()
    .withMessage("Event name must be a string."),
  body("place").optional().isString().withMessage("Place must be a string."),
  body("image_url")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL."),
  body("qr_code")
    .optional()
    .isString()
    .withMessage("QR code must be a string."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string."),
];

const deleteEventValidation = [
  param("id").notEmpty().withMessage("Event ID is required."),
];

const viewEventValidation = [
  param("id").notEmpty().withMessage("Event ID is required."),
];

module.exports = {
  createEventValidation,
  updateEventValidation,
  deleteEventValidation,
  viewEventValidation,
};
