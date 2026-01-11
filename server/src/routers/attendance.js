const { validationResult } = require("express-validator");
const { authenticate, checkRole } = require("../middlewares/auth");
const {
  registerAttendanceValidation,
  scanQRValidation,
  eventAttendanceValidation,
  updateStatusValidation,
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

    this.router.get(
      "/my-attendance",
      authenticate,
      this.getUserAttendance.bind(this)
    );

    // Admin routes
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
      this.delete.bind(this)
    );
  }

  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { event_id } = req.body;
      const userId = req.user.id;

      const result = await this.attendanceService.register(userId, event_id);

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
