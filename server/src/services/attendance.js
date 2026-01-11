class AttendanceService {
  constructor(db, eventTokenService) {
    this.db = db;
    this.eventTokenService = eventTokenService;
  }

  /**
   * Register user for a specific schedule/session
   * Users register for a SESSION, not just an event
   */
  async register(userId, scheduleId) {
    try {
      // Check if schedule exists and get event info
      const schedule = await this.db("event_schedules")
        .where({ "event_schedules.id": scheduleId })
        .join("events", "event_schedules.event_id", "=", "events.id")
        .select("event_schedules.*", "events.event_name", "events.event_type")
        .first();

      if (!schedule) {
        throw new Error("Schedule not found");
      }

      // Check if user already registered for this schedule
      const existing = await this.db("attendance")
        .where({ user_id: userId, schedule_id: scheduleId })
        .first();

      if (existing) {
        throw new Error("You are already registered for this session");
      }

      // Register user with "Registered" status (not Present yet)
      const [id] = await this.db("attendance").insert({
        user_id: userId,
        schedule_id: scheduleId,
        status: "Registered",
        scanned_at: this.db.fn.now(),
      });

      return {
        success: true,
        message: "Successfully registered for the session!",
        attendance_id: id,
      };
    } catch (err) {
      console.error("Register attendance error:", err);
      throw new Error(err.message || "Registration failed");
    }
  }

  /**
   * Scan QR code to mark attendance
   * QR tokens are linked to schedule_id
   */
  async scanQR(userId, token) {
    const trx = await this.db.transaction();

    try {
      // Verify token and get schedule info
      const tokenData = await trx("event_tokens")
        .where({ token })
        .join(
          "event_schedules",
          "event_tokens.schedule_id",
          "=",
          "event_schedules.id"
        )
        .select(
          "event_tokens.*",
          "event_schedules.id as schedule_id",
          "event_schedules.event_id",
          "event_schedules.start_time",
          "event_schedules.end_time"
        )
        .first();

      if (!tokenData) {
        throw new Error("Invalid QR code");
      }

      const scheduleId = tokenData.schedule_id;

      // Check if user already has attendance record for this schedule
      const existing = await trx("attendance")
        .where({ user_id: userId, schedule_id: scheduleId })
        .first();

      if (existing) {
        // If status is "Registered", update to "Present" (attended)
        if (existing.status === "Registered") {
          await trx("attendance").where({ id: existing.id }).update({
            status: "Present",
            scanned_at: trx.fn.now(),
          });

          await trx.commit();

          return {
            success: true,
            message: "Attendance marked successfully! You are now Present.",
            attendance: { ...existing, status: "Present" },
          };
        }

        // Already Present
        if (existing.status === "Present") {
          await trx.commit();
          return {
            success: true,
            message: "Attendance already recorded as Present",
            attendance: existing,
          };
        }

        // If Absent, update to Present
        if (existing.status === "Absent") {
          await trx("attendance").where({ id: existing.id }).update({
            status: "Present",
            scanned_at: trx.fn.now(),
          });

          await trx.commit();

          return {
            success: true,
            message: "Attendance updated to Present",
            attendance: { ...existing, status: "Present" },
          };
        }
      }

      // No existing record - create new with Present status
      const [id] = await trx("attendance").insert({
        user_id: userId,
        schedule_id: scheduleId,
        status: "Present",
        scanned_at: trx.fn.now(),
      });

      const attendance = await trx("attendance").where({ id }).first();

      await trx.commit();

      return {
        success: true,
        message: "Attendance marked successfully!",
        attendance,
      };
    } catch (err) {
      await trx.rollback();
      console.error("Scan QR error:", err);
      throw new Error(err.message || "Failed to mark attendance");
    }
  }

  /**
   * Get user's attendance history
   * Shows all sessions the user has attended
   */
  async getUserAttendance(userId) {
    try {
      const attendance = await this.db("attendance")
        .where({ "attendance.user_id": userId })
        .join(
          "event_schedules",
          "attendance.schedule_id",
          "=",
          "event_schedules.id"
        )
        .join("events", "event_schedules.event_id", "=", "events.id")
        .select(
          "attendance.id as attendance_id",
          "attendance.status",
          "attendance.scanned_at",
          "attendance.schedule_id",
          "event_schedules.start_time",
          "event_schedules.end_time",
          "event_schedules.worship_topic",
          "events.id as event_id",
          "events.event_name",
          "events.event_type",
          "events.place",
          "events.speaker"
        )
        .orderBy("event_schedules.start_time", "desc");

      return attendance;
    } catch (err) {
      console.error("Get user attendance error:", err);
      throw new Error("Failed to retrieve attendance history");
    }
  }

  /**
   * Get all attendance for a specific schedule/session (Admin)
   */
  async getScheduleAttendance(scheduleId) {
    try {
      const attendance = await this.db("attendance")
        .where({ schedule_id: scheduleId })
        .join("users", "attendance.user_id", "=", "users.id")
        .select(
          "attendance.id as attendance_id",
          "attendance.status",
          "attendance.scanned_at",
          "users.id as user_id",
          "users.name",
          "users.email",
          "users.phone"
        )
        .orderBy("attendance.scanned_at", "desc");

      return attendance;
    } catch (err) {
      console.error("Get schedule attendance error:", err);
      throw new Error("Failed to retrieve schedule attendance");
    }
  }

  /**
   * Get all attendance for an event (all sessions combined) (Admin)
   */
  async getEventAttendance(eventId) {
    try {
      const attendance = await this.db("attendance")
        .join(
          "event_schedules",
          "attendance.schedule_id",
          "=",
          "event_schedules.id"
        )
        .where({ "event_schedules.event_id": eventId })
        .join("users", "attendance.user_id", "=", "users.id")
        .select(
          "attendance.id as attendance_id",
          "attendance.status",
          "attendance.scanned_at",
          "attendance.schedule_id",
          "event_schedules.start_time",
          "event_schedules.end_time",
          "users.id as user_id",
          "users.name",
          "users.email",
          "users.phone"
        )
        .orderBy("event_schedules.start_time", "desc");

      return attendance;
    } catch (err) {
      console.error("Get event attendance error:", err);
      throw new Error("Failed to retrieve event attendance");
    }
  }

  /**
   * Update attendance status (Admin)
   */
  async updateStatus(attendanceId, status) {
    try {
      if (!["Registered", "Present", "Absent"].includes(status)) {
        throw new Error(
          "Invalid status. Must be 'Registered', 'Present' or 'Absent'"
        );
      }

      const updated = await this.db("attendance")
        .where({ id: attendanceId })
        .update({ status });

      if (updated === 0) {
        throw new Error("Attendance record not found");
      }

      return {
        success: true,
        message: "Status updated successfully",
      };
    } catch (err) {
      console.error("Update status error:", err);
      throw new Error(err.message || "Failed to update status");
    }
  }

  /**
   * Delete attendance record (Admin)
   */
  async delete(attendanceId) {
    try {
      const deleted = await this.db("attendance")
        .where({ id: attendanceId })
        .del();

      if (deleted === 0) {
        throw new Error("Attendance record not found");
      }

      return {
        success: true,
        message: "Attendance record deleted successfully",
      };
    } catch (err) {
      console.error("Delete attendance error:", err);
      throw new Error("Failed to delete attendance record");
    }
  }

  /**
   * Get attendance statistics for a specific schedule/session
   */
  async getScheduleStats(scheduleId) {
    try {
      const stats = await this.db("attendance")
        .where({ schedule_id: scheduleId })
        .select(
          this.db.raw("COUNT(*) as total"),
          this.db.raw(
            "SUM(CASE WHEN status = 'Registered' THEN 1 ELSE 0 END) as registered"
          ),
          this.db.raw(
            "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present"
          ),
          this.db.raw(
            "SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent"
          )
        )
        .first();

      return {
        total: parseInt(stats.total) || 0,
        registered: parseInt(stats.registered) || 0,
        present: parseInt(stats.present) || 0,
        absent: parseInt(stats.absent) || 0,
      };
    } catch (err) {
      console.error("Get schedule stats error:", err);
      throw new Error("Failed to get attendance statistics");
    }
  }

  /**
   * Get attendance statistics for an event (all sessions combined)
   */
  async getEventStats(eventId) {
    try {
      const stats = await this.db("attendance")
        .join(
          "event_schedules",
          "attendance.schedule_id",
          "=",
          "event_schedules.id"
        )
        .where({ "event_schedules.event_id": eventId })
        .select(
          this.db.raw("COUNT(*) as total"),
          this.db.raw(
            "SUM(CASE WHEN status = 'Registered' THEN 1 ELSE 0 END) as registered"
          ),
          this.db.raw(
            "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present"
          ),
          this.db.raw(
            "SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent"
          )
        )
        .first();

      return {
        total: parseInt(stats.total) || 0,
        registered: parseInt(stats.registered) || 0,
        present: parseInt(stats.present) || 0,
        absent: parseInt(stats.absent) || 0,
      };
    } catch (err) {
      console.error("Get event stats error:", err);
      throw new Error("Failed to get attendance statistics");
    }
  }

  async checkIn(token, userId) {
    const trx = await this.db.transaction();

    try {
      // 1. Find the token and get schedule_id
      const eventToken = await trx("event_tokens").where({ token }).first();

      if (!eventToken) {
        throw new Error("Invalid QR code token.");
      }

      const scheduleId = eventToken.schedule_id;

      // 2. Get event type to determine if registration is required
      const schedule = await trx("event_schedules")
        .where({ "event_schedules.id": scheduleId })
        .join("events", "event_schedules.event_id", "=", "events.id")
        .select(
          "events.id as event_id",
          "events.event_name",
          "events.event_type",
          "events.place",
          "event_schedules.start_time",
          "event_schedules.end_time"
        )
        .first();

      if (!schedule) {
        throw new Error("Event schedule not found.");
      }

      // 3. Check if user already has an attendance record
      let attendance = await trx("attendance")
        .where({
          user_id: userId,
          schedule_id: scheduleId,
        })
        .first();

      // 4. Handle different event types
      if (schedule.event_type === "worship") {
        // WORSHIP: Auto-register if not exists, or check if already present
        if (!attendance) {
          // Auto-register for worship
          await trx("attendance").insert({
            user_id: userId,
            schedule_id: scheduleId,
            status: "Present",
          });

          await trx.commit();

          return {
            success: true,
            message: "Welcome to worship! Your attendance has been recorded.",
            event: formatEventResponse(schedule),
          };
        } else if (attendance.status === "Present") {
          // Already checked in
          throw new Error(
            "You have already checked in for this worship service."
          );
        } else {
          // Was registered but not present, update to Present
          await trx("attendance")
            .where({
              user_id: userId,
              schedule_id: scheduleId,
            })
            .update({ status: "Present" });

          await trx.commit();

          return {
            success: true,
            message: "Welcome! Your attendance has been recorded.",
            event: formatEventResponse(schedule),
          };
        }
      } else {
        // REGULAR EVENTS (event/other): Must be registered first
        if (!attendance) {
          throw new Error(
            "You are not registered for this event. Please register first before checking in."
          );
        }

        if (attendance.status === "Present") {
          throw new Error("You have already checked in for this event.");
        }

        // Update status to Present
        await trx("attendance")
          .where({
            user_id: userId,
            schedule_id: scheduleId,
          })
          .update({ status: "Present" });

        await trx.commit();

        return {
          success: true,
          message: "Check-in successful! Your attendance has been recorded.",
          event: formatEventResponse(schedule),
        };
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

function formatEventResponse(schedule) {
  return {
    event_name: schedule.event_name,
    place: schedule.place,
    date: new Date(schedule.start_time).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: new Date(schedule.start_time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

module.exports = AttendanceService;
