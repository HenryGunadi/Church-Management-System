const { db } = require("../db/db");
const { AuthRouter, UserRouter, EventRouter } = require("../routers");
const {
  AuthService,
  UserService,
  EventService,
  EventSchedules,
  EventTokens,
} = require("../services");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

class Server {
  constructor(port, host) {
    this.express = require("express");
    this.app = this.express();
    this.port = port || 3000;
    this.host = host || "localhost";
    this.db = db;

    // Middleware
    this.app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      })
    );

    this.app.use(
      "/uploads",
      this.express.static(path.join(__dirname, "../../uploads"))
    );

    const frontendDist = path.join(__dirname, "../../../client/dist");

    // Serve frontend
    this.app.use(this.express.static(frontendDist));

    this.app.use(this.express.json());
    this.app.use(cookieParser());

    // services
    const authService = new AuthService(this.db);
    const userService = new UserService(this.db);
    const eventScheduleService = new EventSchedules(this.db);
    const eventTokensService = new EventTokens(this.db);
    const eventService = new EventService(
      this.db,
      eventTokensService,
      eventScheduleService
    );

    // routes
    const authRouter = new AuthRouter(authService, this.express);
    const userRouter = new UserRouter(userService, this.express);
    const eventRouter = new EventRouter(eventService, this.express); // register routes

    this.app.use("/api/auth", authRouter.router);
    this.app.use("/api/user", userRouter.router);
    this.app.use("/api/events", eventRouter.router);

    // Health check
    this.app.get("/health", (req, res) => {
      res.send("Server is running!");
    });

    // SPA fallback (LAST — Express v5 safe)
    this.app.use((req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  run() {
    this.app.listen(this.port, this.host, () => {
      console.log(`Server running at http://${this.host}:${this.port}`);
    });
  }
}

module.exports = Server;