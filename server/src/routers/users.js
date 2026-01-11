const { validationResult, check } = require("express-validator");
const {
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
  viewUserValidation,
} = require("../validators/users");
const { authenticate, checkRole } = require("../middlewares/auth");

class UserRouter {
  constructor(userService, express) {
    this.userService = userService;
    this.router = express.Router();

    // register routes
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.post(
      "/create",
      authenticate,
      checkRole("admin"),
      createUserValidation,
      this.create.bind(this)
    );

    this.router.patch(
      "/profile",
      authenticate, 
      updateUserValidation, 
      this.updateProfile.bind(this)
    );

    this.router.delete(
      "/delete/:id/:email",
      authenticate,
      checkRole("admin"),
      deleteUserValidation,
      this.delete.bind(this)
    );

    this.router.get(
      "/view",
      authenticate, 
      checkRole("admin", "member"), 
      viewUserValidation,
      this.view.bind(this)
    );
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await this.userService.create(req.body);

      res.status(201).json({ message: "User created successfully.", user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const loggedInUser = req.user; // dari middleware authenticate
      const payload = req.body;

      // pastikan user hanya update dirinya sendiri
      if (payload.id !== loggedInUser.id) {
        return res.status(403).json({ message: "Access denied: cannot update another user's data" });
      }

      const updatedUser = await this.userService.update(payload);

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
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

      const updatedUser = await this.userService.update(req.body);

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser, // Changed from 'updatedUser' to 'user' for consistency
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

      const { id, email } = req.params;

      const result = await this.userService.delete(id, email);

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

      // Get id and email from query params (not params)
      const { id, email } = req.query;
      const user = await this.userService.view(id, email);

      res.status(200).json({
        message: "User viewed successfully",
        user,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = UserRouter;