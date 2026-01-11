const { body, param } = require("express-validator");

const createEventValidation = [
  // Event validations only (no schedule fields)
  body("event_name").notEmpty().withMessage("Event name is required."),
  body("event_type")
    .notEmpty()
    .withMessage("Event type is required.")
    .isIn(["event", "worship", "other"])
    .withMessage("Event type must be one of: event, worship, other"),
  body("place").notEmpty().withMessage("Place is required."),
  body("image_url")
    .optional()
    .isString()
    .withMessage("Image URL must be a string."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string."),
  body("speaker")
    .optional()
    .isString()
    .withMessage("Speaker must be a string."),
];

const updateEventValidation = [
  body("id").notEmpty().withMessage("Event ID is required."),
  body("event_name")
    .optional()
    .isString()
    .withMessage("Event name must be a string."),
  body("event_type")
    .optional()
    .isIn(["event", "worship", "other"])
    .withMessage("Event type must be one of: event, worship, other"),
  body("place").optional().isString().withMessage("Place must be a string."),
  body("image_url")
    .optional()
    .isString()
    .withMessage("Image URL must be a string."),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string."),
  body("speaker")
    .optional()
    .isString()
    .withMessage("Speaker must be a string."),
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
