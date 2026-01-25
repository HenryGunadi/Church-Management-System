const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/config");
const os = require("os");

class EventScheduleService {
  constructor(db, eventTokenService) {
    this.db = db;
    this.eventTokenService = eventTokenService;
  }

  /**
   * Get the actual server IP address for QR code generation
   */
  getServerBaseURL() {
    // If PUBLIC_URL is set in config, use it (for production)
    if (config.server.publicUrl) {
      return config.server.publicUrl;
    }

    // Otherwise, get the local network IP
    const port = config.server.port || 3000;
    let host = config.server.host;

    // If host is 0.0.0.0 or localhost, find the actual network IP
    if (host === "0.0.0.0" || host === "localhost" || host === "127.0.0.1") {
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // Skip internal (loopback) and non-IPv4 addresses
          if (net.family === "IPv4" && !net.internal) {
            host = net.address;
            break;
          }
        }
        if (
          host !== "0.0.0.0" &&
          host !== "localhost" &&
          host !== "127.0.0.1"
        ) {
          break;
        }
      }
    }

    return `http://${host}:${port}`;
  }

  /**
   * Create a new schedule and automatically generate QR code
   */
  async create(payload, trx = null) {
    const transaction = trx || (await this.db.transaction());
    const shouldCommit = !trx; // Only commit if we created the transaction

    try {
      // Create the schedule without QR code first
      const [id] = await transaction("event_schedules").insert({
        ...payload,
        qr_code: null, // Will be updated after generation
      });
      console.log("Schedule created with ID:", id);

      // Generate QR code for this schedule
      const qrCode = await this.generateQR(id, transaction);
      console.log("QR code generated for schedule:", id);

      // Update THIS schedule with the QR code
      await transaction("event_schedules")
        .where({ id })
        .update({ qr_code: qrCode });

      if (shouldCommit) {
        await transaction.commit();
      }

      return await this.view(id, undefined, this.db);
    } catch (err) {
      if (shouldCommit) {
        await transaction.rollback();
      }
      console.error("Create schedule error:", err);
      throw new Error(`Create event schedule failed: ${err.message}`);
    }
  }

  /**
   * Generate QR code for a schedule
   * Creates a unique token linked to the schedule
   */
  async generateQR(scheduleId, trx = null) {
    try {
      const queryBuilder = trx || this.db;
      const randomToken = uuidv4();
      const baseURL = this.getServerBaseURL();

      console.log("Generating QR code with base URL:", baseURL);

      // Create token linked to this schedule
      await this.eventTokenService.create(
        scheduleId,
        randomToken,
        queryBuilder
      );

      // Generate QR code with the token
      const url = `${baseURL}/scan?token=${randomToken}`;
      console.log("QR code URL:", url);

      return await QRCode.toDataURL(url);
    } catch (err) {
      console.error("Generate QR error:", err);
      throw new Error(`Generate QR error: ${err.message}`);
    }
  }

  /**
   * Update a schedule
   * Note: Does NOT regenerate QR code
   */
  async update(id, payload, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const schedule = await this.view(id, undefined, queryBuilder);

      if (!schedule) {
        throw new Error("Event schedule doesn't exist.");
      }

      await queryBuilder("event_schedules").where({ id }).update(payload);

      return {
        success: true,
        message: "Schedule updated successfully",
        data: await this.view(id, undefined, queryBuilder),
      };
    } catch (err) {
      throw new Error(`Update event schedule failed: ${err.message}`);
    }
  }

  /**
   * Delete a schedule
   * Token will be deleted automatically due to CASCADE
   */
  async delete(id, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const deleted = await queryBuilder("event_schedules").where({ id }).del();

      if (deleted === 0) {
        throw new Error("Event schedule not found or already deleted.");
      }

      return { success: true, message: "Schedule deleted successfully" };
    } catch (err) {
      throw new Error(`Delete event schedule failed: ${err.message}`);
    }
  }

  /**
   * View schedule(s)
   */
  async view(id = undefined, eventId = undefined, trx = null) {
    try {
      const queryBuilder = trx || this.db;
      const query = queryBuilder("event_schedules").select("*");

      if (id) {
        return await query.where({ id }).first();
      }

      if (eventId) {
        return await query
          .where({ event_id: eventId })
          .orderBy("start_time", "asc");
      }

      return await query.orderBy("start_time", "asc");
    } catch (err) {
      throw new Error(`View event schedule(s) failed: ${err.message}`);
    }
  }

  /**
   * View schedule with its QR token
   */
  async viewWithToken(id, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const schedule = await queryBuilder("event_schedules")
        .where({ "event_schedules.id": id })
        .leftJoin(
          "event_tokens",
          "event_schedules.id",
          "=",
          "event_tokens.schedule_id"
        )
        .select(
          "event_schedules.*",
          "event_tokens.token",
          "event_tokens.is_used",
          "event_tokens.id as token_id"
        )
        .first();

      return schedule;
    } catch (err) {
      throw new Error(`View schedule with token failed: ${err.message}`);
    }
  }

  /**
   * Get all schedules for an event
   */
  async getByEventId(eventId, trx = null) {
    try {
      const queryBuilder = trx || this.db;

      const schedules = await queryBuilder("event_schedules")
        .where({ event_id: eventId })
        .leftJoin(
          "event_tokens",
          "event_schedules.id",
          "=",
          "event_tokens.schedule_id"
        )
        .select(
          "event_schedules.*",
          "event_tokens.token",
          "event_tokens.is_used"
        )
        .orderBy("event_schedules.start_time", "asc");

      return schedules;
    } catch (err) {
      throw new Error(`Get schedules by event ID failed: ${err.message}`);
    }
  }

  /**
   * Regenerate QR code for a schedule (if needed)
   */
  async regenerateQR(scheduleId, trx = null) {
    const transaction = trx || (await this.db.transaction());
    const shouldCommit = !trx;

    try {
      // Delete old token
      await transaction("event_tokens")
        .where({ schedule_id: scheduleId })
        .del();

      // Generate new QR code
      const qrCode = await this.generateQR(scheduleId, transaction);

      // Update schedule's QR code
      await transaction("event_schedules")
        .where({ id: scheduleId })
        .update({ qr_code: qrCode });

      if (shouldCommit) {
        await transaction.commit();
      }

      return {
        success: true,
        message: "QR code regenerated successfully",
        qr_code: qrCode,
      };
    } catch (err) {
      if (shouldCommit) {
        await transaction.rollback();
      }
      throw new Error(`Regenerate QR failed: ${err.message}`);
    }
  }
}

module.exports = EventScheduleService;
