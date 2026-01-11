const { validationResult } = require("express-validator");
const { registerValidation, loginValidation } = require("../validators/auth");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const { authenticate, checkRole } = require("../middlewares/auth");

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
    this.router.get("/verify", authenticate, (req, res) => {
      res.json({
        authenticated: true,
        user: req.user,
      });
    });

    this.router.get(
      "/admin-only",
      authenticate,
      checkRole("admin"),
      (req, res) => {
        res.json({
          message: "Admin access granted",
          user: req.user,
        });
      }
    );
  }

  async verify(req, res) {
    try {
      const token = req.cookies?.auth_token;
      if (!token) {
        return res
          .status(401)
          .json({ authenticated: false, message: "No token" });
      }

      const decoded = jwt.verify(token, config.auth.jwt_secret);

      res.status(200).json({
        authenticated: true,
        user: decoded,
      });
    } catch (err) {
      res.status(401).json({
        authenticated: false,
        message: "Invalid or expired token",
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log("Login attempt:", email);

      const result = await this.authService.login(email, password);
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { user, token } = result;

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Login success.", user });
    } catch (err) {
      console.error("Login error:", err.stack || err.message);
      res.status(500).json({ message: err.message });
    }
  }

  async register(req, res) {
    try {
      // Validate payload
      console.log("register terpanggil");
      console.log(req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await this.authService.register(email, password, "member");

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
