const jwt = require("jsonwebtoken");
const config = require("../config/config");

function authenticate(req, res, next) {
  try {
    const token = req.cookies?.auth_token;
    console.log("Received token:", token ? "YES" : "NO TOKEN");

    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    const secretKey = config.auth.jwt_secret;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    console.log("Authenticated user:", decoded.email, "as", decoded.role);
    next();
  } catch (err) {
    return res.status(403).json({ message: `Invalid token: ${err.message}` });
  }
}

function checkRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) throw new Error("User role not found.");

      if (!allowedRoles.includes(userRole)) {
        throw new Error(`Access denied for role: ${userRole}`);
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: `Access denied: ${err.message}` });
    }
  };
}

module.exports = {
  authenticate,
  checkRole,
};
