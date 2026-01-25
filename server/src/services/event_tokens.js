const { v4: uuidv4 } = require("uuid");

class EventTokenService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new token for a schedule
   * Token is automatically linked to schedule_id
   */
  async create(scheduleId, token, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      // Verify schedule exists
      const schedule = await queryBuilder("event_schedules")
        .where({ id: scheduleId })
        .first();

      if (!schedule) {
        throw new Error("Schedule not found");
      }

      // Check if token already exists for this schedule
      const existing = await queryBuilder("event_tokens")
        .where({ schedule_id: scheduleId })
        .first();

      if (existing) {
        throw new Error(
          "Token already exists for this schedule. Use regenerate instead."
        );
      }

      // Create the token
      const [id] = await queryBuilder("event_tokens").insert({
        schedule_id: scheduleId,
        token: token,
        is_used: false,
        created_at: queryBuilder.fn.now(),
      });

      console.log(`Token created for schedule ${scheduleId}:`, token);

      return {
        success: true,
        message: "Token created successfully",
        token_id: id,
        token: token,
      };
    } catch (err) {
      console.error("Create token error:", err);
      throw new Error(`Create event token failed: ${err.message}`);
    }
  }

  /**
   * View event and schedule details by token
   * Used when scanning QR code
   */
  async view(token) {
    try {
      const result = await this.db("event_tokens")
        .where({ "event_tokens.token": token })
        .join(
          "event_schedules",
          "event_tokens.schedule_id",
          "=",
          "event_schedules.id"
        )
        .join("events", "event_schedules.event_id", "=", "events.id")
        .select(
          "events.id as event_id",
          "events.event_name",
          "events.event_type",
          "events.place",
          "events.speaker",
          "events.description",
          "events.image_url",
          "event_schedules.id as schedule_id",
          "event_schedules.start_time",
          "event_schedules.end_time",
          "event_schedules.worship_topic",
          "event_tokens.token",
          "event_tokens.is_used",
          "event_tokens.created_at as token_created_at"
        )
        .first();

      if (!result) {
        throw new Error("Invalid or expired token");
      }

      return result;
    } catch (err) {
      throw new Error(`View event by token failed: ${err.message}`);
    }
  }

  /**
   * Get token details by schedule ID
   */
  async getByScheduleId(scheduleId, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const result = await queryBuilder("event_tokens")
        .where({ schedule_id: scheduleId })
        .select("*")
        .first();

      return result;
    } catch (err) {
      throw new Error(`Get token by schedule ID failed: ${err.message}`);
    }
  }

  /**
   * Validate if a token is valid and active
   * Checks:
   * 1. Token exists
   * 2. Schedule exists and is active
   * 3. Optionally check time boundaries
   */
  async validate(token, checkTime = true) {
    try {
      const tokenData = await this.view(token);

      if (!tokenData) {
        return {
          valid: false,
          message: "Invalid token",
        };
      }

      // Optional: Check if schedule is within time bounds
      if (checkTime) {
        const now = new Date();
        const startTime = new Date(tokenData.start_time);
        const endTime = tokenData.end_time
          ? new Date(tokenData.end_time)
          : null;

        // Check if current time is before start time
        if (now < startTime) {
          return {
            valid: false,
            message: "Session has not started yet",
            data: tokenData,
          };
        }

        // Check if current time is after end time
        if (endTime && now > endTime) {
          return {
            valid: false,
            message: "Session has ended",
            data: tokenData,
          };
        }
      }

      return {
        valid: true,
        message: "Token is valid",
        data: tokenData,
      };
    } catch (err) {
      return {
        valid: false,
        message: err.message,
      };
    }
  }

  /**
   * Mark token as used (optional feature)
   */
  async markAsUsed(token, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const updated = await queryBuilder("event_tokens")
        .where({ token })
        .update({ is_used: true });

      if (updated === 0) {
        throw new Error("Token not found");
      }

      return {
        success: true,
        message: "Token marked as used",
      };
    } catch (err) {
      throw new Error(`Mark token as used failed: ${err.message}`);
    }
  }

  /**
   * Delete token by schedule ID
   * Useful when regenerating tokens
   */
  async delete(scheduleId, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const deleted = await queryBuilder("event_tokens")
        .where({ schedule_id: scheduleId })
        .del();

      if (deleted === 0) {
        throw new Error("Token not found or already deleted.");
      }

      return { success: true, message: "Token deleted successfully" };
    } catch (err) {
      throw new Error(`Delete event token failed: ${err.message}`);
    }
  }

  /**
   * Delete token by token string
   */
  async deleteByToken(token, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const deleted = await queryBuilder("event_tokens").where({ token }).del();

      if (deleted === 0) {
        throw new Error("Token not found or already deleted.");
      }

      return { success: true, message: "Token deleted successfully" };
    } catch (err) {
      throw new Error(`Delete token failed: ${err.message}`);
    }
  }

  /**
   * Get all tokens with their schedule and event info
   * Useful for admin dashboard
   */
  async viewAll() {
    try {
      const tokens = await this.db("event_tokens")
        .join(
          "event_schedules",
          "event_tokens.schedule_id",
          "=",
          "event_schedules.id"
        )
        .join("events", "event_schedules.event_id", "=", "events.id")
        .select(
          "event_tokens.id as token_id",
          "event_tokens.token",
          "event_tokens.is_used",
          "event_tokens.created_at as token_created_at",
          "event_schedules.id as schedule_id",
          "event_schedules.start_time",
          "event_schedules.end_time",
          "event_schedules.worship_topic",
          "events.id as event_id",
          "events.event_name",
          "events.event_type"
        )
        .orderBy("event_schedules.start_time", "desc");

      return tokens;
    } catch (err) {
      throw new Error(`View all tokens failed: ${err.message}`);
    }
  }

  /**
   * Get all tokens for a specific event (across all schedules)
   */
  async getByEventId(eventId) {
    try {
      const tokens = await this.db("event_tokens")
        .join(
          "event_schedules",
          "event_tokens.schedule_id",
          "=",
          "event_schedules.id"
        )
        .where({ "event_schedules.event_id": eventId })
        .select(
          "event_tokens.*",
          "event_schedules.start_time",
          "event_schedules.end_time",
          "event_schedules.worship_topic"
        )
        .orderBy("event_schedules.start_time", "asc");

      return tokens;
    } catch (err) {
      throw new Error(`Get tokens by event ID failed: ${err.message}`);
    }
  }

  /**
   * Clean up expired tokens (optional maintenance function)
   * Deletes tokens for schedules that have ended
   */
  async cleanupExpired() {
    try {
      const now = new Date();

      const deleted = await this.db("event_tokens")
        .join(
          "event_schedules",
          "event_tokens.schedule_id",
          "=",
          "event_schedules.id"
        )
        .where("event_schedules.end_time", "<", now)
        .del();

      return {
        success: true,
        message: `Cleaned up ${deleted} expired tokens`,
        deleted_count: deleted,
      };
    } catch (err) {
      throw new Error(`Cleanup expired tokens failed: ${err.message}`);
    }
  }
}

module.exports = EventTokenService;
