const { body, param } = require("express-validator");

const createEventValidation = [
  // Event validations
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

  // Event Schedule validations
  body("start_time")
    .notEmpty()
    .withMessage("Start time is required.")
    .isISO8601()
    .withMessage("Start time must be a valid datetime (ISO 8601 format)."),

  body("speaker")
    .optional()
    .isString()
    .withMessage("Speaker must be a string."),

  body("end_time")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid datetime (ISO 8601 format).")
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.start_time)) {
        throw new Error("End time must be after start time.");
      }
      return true;
    }),

  body("worship_topic")
    .optional()
    .isString()
    .withMessage("Topic must be a string."),
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
  body("start_time")
    .optional()
    .isISO8601()
    .withMessage("Start time must be a valid datetime."),
  body("end_time")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid datetime.")
    .custom((value, { req }) => {
      if (
        value &&
        req.body.start_time &&
        new Date(value) <= new Date(req.body.start_time)
      ) {
        throw new Error("End time must be after start time.");
      }
      return true;
    }),
  body("worship_topic")
    .optional()
    .isString()
    .withMessage("Worship topic must be a valid string"),

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

// Separate validation for updating schedules
const updateScheduleValidation = [
  param("id").notEmpty().withMessage("Schedule ID is required."),
  body("start_time")
    .optional()
    .isISO8601()
    .withMessage("Start time must be a valid datetime."),
  body("end_time")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid datetime.")
    .custom((value, { req }) => {
      if (
        req.body.start_time &&
        new Date(value) <= new Date(req.body.start_time)
      ) {
        throw new Error("End time must be after start time.");
      }
      return true;
    }),
  body("worship_topic")
    .optional()
    .isString()
    .withMessage("Worship topic must be a valid string"),
];

module.exports = {
  createEventValidation,
  updateEventValidation,
  deleteEventValidation,
  viewEventValidation,
  updateScheduleValidation,
};
