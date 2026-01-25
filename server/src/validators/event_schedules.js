const { body, param, query } = require("express-validator");

const createScheduleValidation = [
  body("event_id")
    .notEmpty()
    .withMessage("Event ID is required.")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a valid integer."),
  body("start_time")
    .notEmpty()
    .withMessage("Start time is required.")
    .isISO8601()
    .withMessage("Start time must be a valid datetime (ISO 8601 format)."),
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
    .withMessage("Worship topic must be a string."),
];

const updateScheduleValidation = [
  body("id").notEmpty().withMessage("Schedule ID is required."),
  body("event_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Event ID must be a valid integer."),
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
    .withMessage("Worship topic must be a valid string."),
];

const deleteScheduleValidation = [
  param("id").notEmpty().withMessage("Schedule ID is required."),
];

const viewScheduleValidation = [
  param("id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Schedule ID must be a valid integer."),
  query("event_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Event ID must be a valid integer."),
];

module.exports = {
  createScheduleValidation,
  updateScheduleValidation,
  deleteScheduleValidation,
  viewScheduleValidation,
};
