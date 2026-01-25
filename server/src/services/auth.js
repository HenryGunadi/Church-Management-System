const bcrypt = require("bcrypt");
const config = require("../config/config");
const jwt = require("jsonwebtoken");

class AuthService {
  constructor(db) {
    this.db = db;
    this.jwtSecret = config.auth.jwt_secret;
    this.jwtExpiresIn = config.auth.jwt_exp;
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  async login(email, password) {
    try {
      const user = await this.db("users").where({ email }).first();

      if (!user) {
        return null;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return null;
      }

      delete user.password;

      // generate JWT
      const token = this.generateToken(user);

      return { user, token };
    } catch (err) {
      console.log("Login service error:", err.message);
      throw new Error(`Login failed: ${err.message}`);
    }
  }

  // ✅ FIXED: Added phone_number parameter
  async register(email, password, role, phone_number = null) {
    try {
      console.log("🔐 AuthService.register called");
      console.log("📧 Email:", email);
      console.log("📱 Phone:", phone_number);
      console.log("👤 Role:", role);

      const existingUser = await this.db("users").where({ email }).first();
      if (existingUser) {
        throw new Error("Email already registered");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ FIXED: Insert phone_number into database
      const [insertId] = await this.db("users").insert({
        email,
        phone_number, // ⚠️ Add phone_number field
        password: hashedPassword,
        role,
      });

      console.log("✅ User created with ID:", insertId);

      // ✅ FIXED: Select phone_number in response
      const newUser = await this.db("users")
        .where({ id: insertId })
        .select("id", "email", "phone_number", "role", "created_at")
        .first();

      return newUser;
    } catch (err) {
      console.log("❌ Register service error:", err.message);
      throw new Error(`Registration failed: ${err.message}`);
    }
  }
}

module.exports = AuthService;