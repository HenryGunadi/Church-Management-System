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
      throw new Error(`Login failed: ${err.message}`);
    }
  }

  async register(name, email, password, role) {
    try {
      const existingUser = await this.db("users").where({ email }).first();
      if (existingUser) {
        throw new Error("Email already registered");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [insertId] = await this.db("users").insert({
        name,
        email,
        password: hashedPassword,
        role,
      });

      const newUser = await this.db("users")
        .where({ id: insertId })
        .select("id", "name", "email", "role", "created_at")
        .first();

      return newUser;
    } catch (err) {
      throw new Error(`Registration failed: ${err.message}`);
    }
  }
}

module.exports = AuthService;
