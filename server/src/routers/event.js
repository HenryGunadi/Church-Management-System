const { validationResult } = require("express-validator");
const {
  createEventValidation,
  updateEventValidation,
  deleteEventValidation,
  viewEventValidation,
} = require("../validators/event");
const { authenticate, checkRole } = require("../middlewares/auth");

class EventRouter {
  constructor(eventService, express) {
    this.eventService = eventService;
    this.router = express.Router();

    this.registerRoutes();
  }

  registerRoutes() {
    this.router.post(
      "/create",
      [authenticate, checkRole("admin")],
      createEventValidation,
      this.create.bind(this)
    );
    this.router.patch(
      "/update",
      [authenticate, checkRole("admin")],
      updateEventValidation,
      this.update.bind(this)
    );
    this.router.delete(
      "/delete/:id",
      deleteEventValidation,
      [authenticate, checkRole("admin")],
      this.delete.bind(this)
    );
    this.router.get("/view/:id", viewEventValidation, this.view.bind(this));
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await this.eventService.create(req.body);

      res.status(201).json({ message: "Event created successfully.", event });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updatedEvent = await this.eventService.update(req.body);

      res.status(200).json({
        message: "Event updated successfully",
        updatedEvent,
      });
    } catch (err) {
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
      const event = await this.eventService.view(id);

      res.status(200).json({
        message: "Event retrieved successfully",
        event,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = EventRouter;
