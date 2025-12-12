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

    this.app.get("/", (req, res) => {
      res.send("Server is running!");
    });
  }

  run() {
    this.app.listen(this.port, this.host, () => {
      console.log(`Server running at http://${this.host}:${this.port}`);
    });
  }
}

module.exports = Server;
