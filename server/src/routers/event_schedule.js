const { validationResult } = require("express-validator");
const {
  createScheduleValidation,
  updateScheduleValidation,
  deleteScheduleValidation,
  viewScheduleValidation,
} = require("../validators/event_schedules");
const { authenticate, checkRole } = require("../middlewares/auth");

class EventScheduleRouter {
  constructor(eventScheduleService, eventTokensService, express) {
    this.eventScheduleService = eventScheduleService;
    this.eventTokensService = eventTokensService;
    this.router = express.Router();
    this.registerRoutes();
  }

  registerRoutes() {
    // Admin only routes
    this.router.post(
      "/create",
      authenticate,
      checkRole("admin"),
      createScheduleValidation,
      this.create.bind(this)
    );

    this.router.patch(
      "/update",
      authenticate,
      checkRole("admin"),
      updateScheduleValidation,
      this.update.bind(this)
    );

    this.router.delete(
      "/delete/:id",
      authenticate,
      checkRole("admin"),
      deleteScheduleValidation,
      this.delete.bind(this)
    );

    this.router.get(
      "/view",
      authenticate,
      checkRole("admin"),
      viewScheduleValidation,
      this.view.bind(this)
    );

    this.router.get(
      "/view/:id",
      authenticate,
      checkRole("admin"),
      viewScheduleValidation,
      this.view.bind(this)
    );

    // ✅ NEW: Regenerate QR code for a schedule
    this.router.post(
      "/regenerate-qr/:id",
      authenticate,
      checkRole("admin"),
      this.regenerateQR.bind(this)
    );
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      console.log("📥 Creating schedule:", req.body);

      const { event_id, start_time, end_time, worship_topic } = req.body;

      // ✅ FIXED: No manual transaction, no manual token creation
      // EventScheduleService.create() handles everything automatically
      const schedule = await this.eventScheduleService.create({
        event_id,
        start_time,
        end_time: end_time || null,
        worship_topic: worship_topic || null,
      });

      console.log("✅ Schedule created with QR code:", schedule);

      res.status(201).json({
        message: "Schedule created successfully with QR code.",
        data: schedule,
      });
    } catch (err) {
      console.error("❌ Create schedule error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      console.log("📝 Updating schedule:", req.body);

      const { id, event_id, start_time, end_time, worship_topic } = req.body;

      const updateData = {};
      if (event_id !== undefined) updateData.event_id = event_id;
      if (start_time !== undefined) updateData.start_time = start_time;
      if (end_time !== undefined) updateData.end_time = end_time;
      if (worship_topic !== undefined) updateData.worship_topic = worship_topic;

      const result = await this.eventScheduleService.update(id, updateData);

      res.status(200).json({
        message: "Schedule updated successfully",
        data: result,
      });
    } catch (err) {
      console.error("❌ Update schedule error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      console.log("🗑️ Deleting schedule:", id);

      const result = await this.eventScheduleService.delete(id);

      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Delete schedule error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async view(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { event_id } = req.query;

      console.log("👁️ Viewing schedules - ID:", id, "Event ID:", event_id);

      const schedules = await this.eventScheduleService.view(id, event_id);

      res.status(200).json({
        message: "Schedules retrieved successfully",
        data: schedules,
      });
    } catch (err) {
      console.error("❌ View schedules error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  // ✅ NEW: Regenerate QR code endpoint
  async regenerateQR(req, res) {
    try {
      const { id } = req.params;

      console.log("🔄 Regenerating QR code for schedule:", id);

      const result = await this.eventScheduleService.regenerateQR(id);

      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Regenerate QR error:", err);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = EventScheduleRouter;
