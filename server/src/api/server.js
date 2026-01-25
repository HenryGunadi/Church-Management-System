const os = require("os");
const { db } = require("../db/db");
const {
  AuthRouter,
  UserRouter,
  EventRouter,
  AttendanceRouter,
  EventScheduleRouter,
} = require("../routers");
const {
  AuthService,
  UserService,
  EventService,
  EventScheduleService,
  EventTokenService,
  AttendanceService,
} = require("../services");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

class Server {
  constructor(port, host) {
    this.express = require("express");
    this.app = this.express();
    this.port = port || 3000;
    this.host = host || "0.0.0.0";
    this.db = db;

    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );

    this.app.use(
      "/uploads",
      this.express.static(path.join(__dirname, "../../uploads"))
    );

    const frontendDist = path.join(__dirname, "../../../client/dist");
    console.log(frontendDist);

    // Serve frontend
    this.app.use(this.express.static(frontendDist));

    this.app.use(this.express.json());
    this.app.use(cookieParser());

    // services
    const authService = new AuthService(this.db);
    const userService = new UserService(this.db);
    const eventTokensService = new EventTokenService(this.db);
    const eventScheduleService = new EventScheduleService(
      this.db,
      eventTokensService
    );
    const attendanceService = new AttendanceService(this.db);
    const eventService = new EventService(
      this.db,
      eventTokensService,
      eventScheduleService
    );

    // routes
    const authRouter = new AuthRouter(authService, this.express);
    const userRouter = new UserRouter(userService, this.express);
    const eventRouter = new EventRouter(eventService, this.express); // register routes
    const eventScheduleRouter = new EventScheduleRouter(
      eventScheduleService,
      eventTokensService,
      this.express
    );
    const attendanceRouter = new AttendanceRouter(
      attendanceService,
      this.express
    );

    this.app.use("/api/auth", authRouter.router);
    this.app.use("/api/user", userRouter.router);
    this.app.use("/api/events", eventRouter.router);
    this.app.use("/api/attendance", attendanceRouter.router);
    this.app.use("/api/schedules", eventScheduleRouter.router);

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
      let displayHost = this.host;

      if (this.host === "0.0.0.0") {
        const nets = os.networkInterfaces();
        for (const name of Object.keys(nets)) {
          for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
              displayHost = net.address;
              break;
            }
          }
          if (displayHost !== "0.0.0.0") break;
        }
      }

      console.log(`Server running at http://${displayHost}:${this.port}`);
    });
  }
}

module.exports = Server;
