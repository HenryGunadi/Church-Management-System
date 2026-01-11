// server/src/validators/attendance.js

const { body, param } = require("express-validator");

const registerAttendanceValidation = [
  body("event_id")
    .notEmpty()
    .withMessage("Event ID is required")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer"),
];

const scanQRValidation = [
  body("token")
    .notEmpty()
    .withMessage("QR token is required")
    .isString()
    .withMessage("Token must be a string"),
];

const eventAttendanceValidation = [
  param("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer"),
];

const updateStatusValidation = [
  param("id")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isInt({ min: 1 })
    .withMessage("Attendance ID must be a positive integer"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Present", "Absent"])
    .withMessage("Status must be either 'Present' or 'Absent'"),
];

module.exports = {
  registerAttendanceValidation,
  scanQRValidation,
  eventAttendanceValidation,
  updateStatusValidation,
};
