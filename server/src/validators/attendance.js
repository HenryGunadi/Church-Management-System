const { body, param } = require("express-validator");

// ✅ FIXED: Changed event_id to schedule_id
const registerAttendanceValidation = [
  body("schedule_id")
    .notEmpty()
    .withMessage("Schedule ID is required")
    .isInt({ min: 1 })
    .withMessage("Schedule ID must be a positive integer"),
];

// ✅ CORRECT: scanQR uses token (no changes needed)
const scanQRValidation = [
  body("token")
    .notEmpty()
    .withMessage("QR token is required")
    .isString()
    .withMessage("Token must be a string"),
];

// ✅ CORRECT: This can stay as eventId for getting all attendance across schedules
const eventAttendanceValidation = [
  param("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer"),
];

// ✅ NEW: Add validation for getting attendance by schedule
const scheduleAttendanceValidation = [
  param("scheduleId")
    .notEmpty()
    .withMessage("Schedule ID is required")
    .isInt({ min: 1 })
    .withMessage("Schedule ID must be a positive integer"),
];

// ✅ CORRECT: Update status validation (no changes needed)
const updateStatusValidation = [
  param("id")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isInt({ min: 1 })
    .withMessage("Attendance ID must be a positive integer"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Registered", "Present", "Absent"])
    .withMessage("Status must be 'Registered', 'Present', or 'Absent'"),
];

// ✅ NEW: Delete attendance validation
const deleteAttendanceValidation = [
  param("id")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isInt({ min: 1 })
    .withMessage("Attendance ID must be a positive integer"),
];

module.exports = {
  registerAttendanceValidation,
  scanQRValidation,
  eventAttendanceValidation,
  scheduleAttendanceValidation, // ✅ NEW
  updateStatusValidation,
  deleteAttendanceValidation, // ✅ NEW
};
