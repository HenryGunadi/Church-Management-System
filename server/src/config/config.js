const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class Config {
  constructor() {
    this.server = {
      port: process.env.PORT || 3000,
      host: process.env.HOST || "localhost",
    };
    this.db = {
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
    };
    this.auth = {
      jwt_secret: process.env.JWT_SECRET,
      jwt_exp: process.env.JWT_EXP,
    };
    this.state_mode = process.env.STATE_MODE;
  }
}

const config = new Config();

module.exports = config;
