const { validationResult } = require("express-validator");
const {
  createEventValidation,
  updateEventValidation,
  deleteEventValidation,
  viewEventValidation,
} = require("../validators/event");
const { authenticate, checkRole } = require("../middlewares/auth");
const { upload } = require("../middlewares/multer");

class EventRouter {
  constructor(eventService, express) {
    this.eventService = eventService;
    this.router = express.Router();

    this.registerRoutes();
  }

  registerRoutes() {
    this.router.post(
      "/create",
      authenticate,
      checkRole("admin"),
      upload.single("image"),
      createEventValidation,
      this.create.bind(this)
    );

    this.router.patch(
      "/update",
      authenticate,
      checkRole("admin"),
      upload.single("image"),
      updateEventValidation,
      this.update.bind(this)
    );

    this.router.delete(
      "/delete/:id",
      authenticate,
      checkRole("admin"),
      deleteEventValidation,
      this.delete.bind(this)
    );

    this.router.get("/view", this.viewAll.bind(this));
    this.router.get("/view/:id", viewEventValidation, this.view.bind(this));
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      console.log("📥 Request body:", req.body);
      console.log("📎 Uploaded file:", req.file);

      if (req.file) {
        req.body.image_url = `/uploads/events/images/${req.file.filename}`;
      }

      const event = await this.eventService.create(req.body);

      res.status(201).json({
        message: "Event created successfully.",
        data: event,
      });
    } catch (err) {
      console.error("Create event error:", err);
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

      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      if (req.file) {
        req.body.image_url = `/uploads/events/images/${req.file.filename}`;
      }

      const updatedEvent = await this.eventService.update(req.body);

      res.status(200).json({
        message: "Event updated successfully",
        data: updatedEvent,
      });
    } catch (err) {
      console.error("Update event error:", err);
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

      const result = await this.eventService.delete(id);

      res.status(200).json(result);
    } catch (err) {
      console.error("Delete event error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async viewAll(req, res) {
    try {
      const events = await this.eventService.viewAll();

      res.status(200).json({
        message: "Events retrieved successfully",
        data: events,
      });
    } catch (err) {
      console.error("ViewAll error:", err);
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
      const event = await this.eventService.viewDetailed(id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.status(200).json({
        message: "Event retrieved successfully",
        data: event,
      });
    } catch (err) {
      console.error("View event error:", err);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = EventRouter;
