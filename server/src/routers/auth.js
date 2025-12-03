const { validationResult } = require("express-validator");
const { registerValidation, loginValidation } = require("../validators/auth");
const config = require("../config/config");

class AuthRouter {
  constructor(authService, express) {
    this.authService = authService;
    this.router = express.Router();

    // register routes
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.post("/login", loginValidation, this.login.bind(this));
    this.router.post("/register", registerValidation, this.register.bind(this));
  }

  async login(req, res) {
    try {
      // Validate payload
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { user, token } = result;

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Login success.", user });
    } catch (err) {
      console.log("Login error : ", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async register(req, res) {
    try {
      // Validate payload
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;
      const user = await this.authService.register(email, password, role);

      res.status(201).json({
        message: "Your account has been created successfully.",
        user,
      });
    } catch (err) {
      console.log("Register error : ", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = AuthRouter;
