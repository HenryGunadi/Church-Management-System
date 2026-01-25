const { validationResult } = require("express-validator");
const { authenticate, checkRole } = require("../middlewares/auth");
const {
  registerAttendanceValidation,
  scanQRValidation,
  eventAttendanceValidation,
  scheduleAttendanceValidation,
  updateStatusValidation,
  deleteAttendanceValidation,
} = require("../validators/attendance");

class AttendanceRouter {
  constructor(attendanceService, express) {
    this.attendanceService = attendanceService;
    this.router = express.Router();
    this.registerRoutes();
  }

  registerRoutes() {
    // User routes
    this.router.post(
      "/register",
      authenticate,
      registerAttendanceValidation,
      this.register.bind(this)
    );

    this.router.post(
      "/scan",
      authenticate,
      scanQRValidation,
      this.scanQR.bind(this)
    );

    // ✅ NEW: Check-in route (QR scan landing page)
    this.router.post("/checkin", authenticate, this.checkIn.bind(this));

    this.router.get(
      "/my-attendance",
      authenticate,
      this.getUserAttendance.bind(this)
    );

    // Admin routes
    this.router.get(
      "/schedule/:scheduleId",
      authenticate,
      checkRole("admin"),
      scheduleAttendanceValidation,
      this.getScheduleAttendance.bind(this)
    );

    this.router.get(
      "/schedule-stats/:scheduleId",
      authenticate,
      checkRole("admin"),
      scheduleAttendanceValidation,
      this.getScheduleStats.bind(this)
    );

    this.router.get(
      "/event/:eventId",
      authenticate,
      checkRole("admin"),
      eventAttendanceValidation,
      this.getEventAttendance.bind(this)
    );

    this.router.get(
      "/stats/:eventId",
      authenticate,
      checkRole("admin"),
      eventAttendanceValidation,
      this.getEventStats.bind(this)
    );

    this.router.patch(
      "/update-status/:id",
      authenticate,
      checkRole("admin"),
      updateStatusValidation,
      this.updateStatus.bind(this)
    );

    this.router.delete(
      "/delete/:id",
      authenticate,
      checkRole("admin"),
      deleteAttendanceValidation,
      this.delete.bind(this)
    );

    this.router.post(
      "/delete/:id",
      authenticate,
      checkRole("admin"),
      deleteAttendanceValidation,
      this.delete.bind(this)
    );
  }

  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { schedule_id } = req.body;
      const userId = req.user.id;

      const result = await this.attendanceService.register(userId, schedule_id);

      res.status(201).json(result);
    } catch (err) {
      console.error("Register attendance error:", err);
      res.status(400).json({ message: err.message });
    }
  }

  async scanQR(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.body;
      const userId = req.user.id;

      const result = await this.attendanceService.scanQR(userId, token);

      res.status(200).json(result);
    } catch (err) {
      console.error("Scan QR error:", err);
      res.status(400).json({ message: err.message });
    }
  }

  async checkIn(req, res) {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "QR code token is required",
        });
      }

      const result = await this.attendanceService.checkIn(token, userId);

      res.status(200).json(result);
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to check in",
      });
    }
  }

  async getUserAttendance(req, res) {
    try {
      const userId = req.user.id;

      const attendance = await this.attendanceService.getUserAttendance(userId);

      res.status(200).json({
        message: "Attendance history retrieved successfully",
        data: attendance,
      });
    } catch (err) {
      console.error("Get user attendance error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async getScheduleAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { scheduleId } = req.params;

      const attendance = await this.attendanceService.getScheduleAttendance(
        scheduleId
      );

      res.status(200).json({
        message: "Schedule attendance retrieved successfully",
        data: attendance,
      });
    } catch (err) {
      console.error("Get schedule attendance error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async getScheduleStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { scheduleId } = req.params;

      const stats = await this.attendanceService.getScheduleStats(scheduleId);

      res.status(200).json({
        message: "Schedule statistics retrieved successfully",
        data: stats,
      });
    } catch (err) {
      console.error("Get schedule stats error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async getEventAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventId } = req.params;

      const attendance = await this.attendanceService.getEventAttendance(
        eventId
      );

      res.status(200).json({
        message: "Event attendance retrieved successfully",
        data: attendance,
      });
    } catch (err) {
      console.error("Get event attendance error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async getEventStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventId } = req.params;

      const stats = await this.attendanceService.getEventStats(eventId);

      res.status(200).json({
        message: "Statistics retrieved successfully",
        data: stats,
      });
    } catch (err) {
      console.error("Get event stats error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;

      const result = await this.attendanceService.updateStatus(id, status);

      res.status(200).json(result);
    } catch (err) {
      console.error("Update status error:", err);
      res.status(400).json({ message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const result = await this.attendanceService.delete(id);

      res.status(200).json(result);
    } catch (err) {
      console.error("Delete attendance error:", err);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = AttendanceRouter;
