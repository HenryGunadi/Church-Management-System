// server/src/services/AttendanceService.js

class AttendanceService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Register user for an event
   */
  async register(userId, eventId) {
    try {
      // Check if event exists
      const event = await this.db("events").where({ id: eventId }).first();

      if (!event) {
        throw new Error("Event not found");
      }

      // Check if user already registered
      const existing = await this.db("attendance")
        .where({ user_id: userId, event_id: eventId })
        .first();

      if (existing) {
        throw new Error("You are already registered for this event");
      }

      // Register user
      const [id] = await this.db("attendance").insert({
        user_id: userId,
        event_id: eventId,
        status: "Present",
        scanned_at: this.db.fn.now(),
      });

      return {
        success: true,
        message: "Successfully registered for the event!",
        attendance_id: id,
      };
    } catch (err) {
      console.error("Register attendance error:", err);
      throw new Error(err.message || "Registration failed");
    }
  }

  /**
   * Scan QR code to mark attendance
   */
  async scanQR(userId, token) {
    const trx = await this.db.transaction();

    try {
      // Verify token and get event
      const eventToken = await trx("event_tokens").where({ token }).first();

      if (!eventToken) {
        throw new Error("Invalid QR code");
      }

      const eventId = eventToken.event_id;

      // Check if already scanned
      const existing = await trx("attendance")
        .where({ user_id: userId, event_id: eventId })
        .first();

      if (existing) {
        await trx.commit();
        return {
          success: true,
          message: "Attendance already recorded",
          attendance: existing,
        };
      }

      // Record attendance
      const [id] = await trx("attendance").insert({
        user_id: userId,
        event_id: eventId,
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
   */
  async getUserAttendance(userId) {
    try {
      const attendance = await this.db("attendance")
        .where({ user_id: userId })
        .join("events", "attendance.event_id", "=", "events.id")
        .leftJoin(
          "event_schedules",
          "events.id",
          "=",
          "event_schedules.event_id"
        )
        .select(
          "attendance.id as attendance_id",
          "attendance.status",
          "attendance.scanned_at",
          "events.id as event_id",
          "events.event_name",
          "events.event_type",
          "events.place",
          "events.speaker",
          "event_schedules.start_time",
          "event_schedules.end_time"
        )
        .orderBy("attendance.scanned_at", "desc");

      return attendance;
    } catch (err) {
      console.error("Get user attendance error:", err);
      throw new Error("Failed to retrieve attendance history");
    }
  }

  /**
   * Get all attendance for an event (Admin)
   */
  async getEventAttendance(eventId) {
    try {
      const attendance = await this.db("attendance")
        .where({ event_id: eventId })
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
      console.error("Get event attendance error:", err);
      throw new Error("Failed to retrieve event attendance");
    }
  }

  /**
   * Update attendance status (Admin)
   */
  async updateStatus(attendanceId, status) {
    try {
      if (!["Present", "Absent"].includes(status)) {
        throw new Error("Invalid status. Must be 'Present' or 'Absent'");
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
   * Get attendance statistics for an event
   */
  async getEventStats(eventId) {
    try {
      const stats = await this.db("attendance")
        .where({ event_id: eventId })
        .select(
          this.db.raw("COUNT(*) as total"),
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
        present: parseInt(stats.present) || 0,
        absent: parseInt(stats.absent) || 0,
      };
    } catch (err) {
      console.error("Get event stats error:", err);
      throw new Error("Failed to get attendance statistics");
    }
  }
}

module.exports = AttendanceService;
