const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/config");

class EventService {
  constructor(db, eventTokenService, eventScheduleService) {
    this.db = db;
    this.eventTokenService = eventTokenService;
    this.eventScheduleService = eventScheduleService;
  }

  async create(payload) {
    const trx = await this.db.transaction();

    try {
      console.log("Creating event with payload:", payload);

      const {
        event_name,
        event_type = "event",
        place,
        image_url,
        speaker,
        description,
      } = payload;

      if (!event_name || !place) {
        throw new Error("Missing required fields: event_name or place");
      }

      // Insert event ONLY - no schedule, no QR code
      const [eventId] = await trx("events").insert({
        event_name,
        event_type,
        place,
        image_url: image_url || null,
        description: description || null,
        speaker: speaker || null,
        // qr_code field removed from events table
      });

      console.log("Event created with ID:", eventId);

      await trx.commit();

      return await this.view(eventId);
    } catch (err) {
      await trx.rollback();
      console.error("Create event error:", err);
      throw new Error(`Create event failed: ${err.message}`);
    }
  }

  // QR generation is now ONLY for schedules, not events
  // This method should be removed or moved to EventScheduleService
  async generateQR(scheduleId, trx = null) {
    try {
      const randomToken = uuidv4();
      const baseURL =
        config.server.host && config.server.port
          ? `http://${config.server.host}:${config.server.port}`
          : "http://localhost:3000";

      // Create token service data - linked to schedule_id
      await this.eventTokenService.create(scheduleId, randomToken, trx);

      const url = `${baseURL}/scan?token=${randomToken}`;
      return await QRCode.toDataURL(url);
    } catch (err) {
      console.error("Generate QR error:", err);
      throw new Error(`Generate QR error: ${err.message}`);
    }
  }

  async update(payload) {
    const trx = await this.db.transaction();

    try {
      console.log("Updating event with payload:", payload);

      const {
        id,
        event_name,
        event_type,
        speaker,
        place,
        image_url,
        description,
      } = payload;

      if (!id) {
        throw new Error("Event ID is required for update");
      }

      const event = await this.view(id);

      if (!event) {
        throw new Error("Event doesn't exist.");
      }

      const eventUpdate = {};
      if (speaker !== undefined) eventUpdate.speaker = speaker;
      if (event_name !== undefined) eventUpdate.event_name = event_name;
      if (event_type !== undefined) eventUpdate.event_type = event_type;
      if (place !== undefined) eventUpdate.place = place;
      if (image_url !== undefined) eventUpdate.image_url = image_url;
      if (description !== undefined) eventUpdate.description = description;

      if (Object.keys(eventUpdate).length > 0) {
        await trx("events").where({ id }).update(eventUpdate);
        console.log("Event updated");
      }

      // ❌ REMOVED: Schedule updates don't belong in EventService
      // Schedules should be updated via EventScheduleService

      await trx.commit();

      return await this.viewDetailed(id);
    } catch (err) {
      await trx.rollback();
      console.error("Update event error:", err);
      throw new Error(`Update event failed: ${err.message}`);
    }
  }

  async delete(id = undefined) {
    try {
      const deletedEvent = await this.db("events").where({ id }).del();

      if (deletedEvent === 0) {
        throw new Error("Event not found or already deleted.");
      }

      return { success: true, message: "Event deleted successfully" };
    } catch (err) {
      console.error("Delete event error:", err);
      throw new Error(`Delete event failed: ${err.message}`);
    }
  }

  async view(id) {
    try {
      return await this.db("events").select("*").where({ id }).first();
    } catch (err) {
      console.error("View event error:", err);
      throw new Error(`View event failed: ${err.message}`);
    }
  }

  async viewAll() {
    try {
      console.log("Fetching all events...");

      const events = await this.db("events")
        .select("*")
        .orderBy("created_at", "desc");

      console.log(`Found ${events.length} events`);

      const schedules = await this.db("event_schedules").select("*"); // ✅ This already selects everything including qr_code

      console.log(`Found ${schedules.length} schedules`);

      const eventsWithSchedules = events.map((event) => {
        const eventSchedules = schedules
          .filter((schedule) => schedule.event_id === event.id)
          .map((schedule) => ({
            id: schedule.id,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            worship_topic: schedule.worship_topic,
            qr_code: schedule.qr_code, // ✅ ADD THIS LINE
          }));

        return {
          ...event,
          event_id: event.id,
          schedules: eventSchedules,
        };
      });

      console.log("Successfully formatted events with schedules");
      return eventsWithSchedules;
    } catch (err) {
      console.error("ViewAll error:", err);
      throw new Error(`View all events failed: ${err.message}`);
    }
  }

  async viewDetailed(id) {
    try {
      if (!id) throw new Error("Event ID is required for detailed view");

      console.log("Fetching detailed event:", id);

      try {
        const result = await this.db.raw(
          "SELECT get_event_details(?) as event_data",
          [id]
        );

        const eventData = result[0][0].event_data;

        if (!eventData) {
          return null;
        }

        const parsedData = JSON.parse(eventData);

        return {
          ...parsedData,
          event_id: parsedData.id,
        };
      } catch (funcError) {
        console.log("Stored procedure not found, using manual query");
        return await this.viewDetailedManual(id);
      }
    } catch (err) {
      console.error("ViewDetailed error:", err);
      throw new Error(`Detailed view failed: ${err.message}`);
    }
  }

  async viewDetailedManual(id) {
    try {
      const event = await this.db("events").select("*").where({ id }).first();

      if (!event) {
        return null;
      }

      const schedules = await this.db("event_schedules")
        .select("*")
        .where({ event_id: id });

      return {
        ...event,
        event_id: event.id,
        schedules: schedules.map((schedule) => ({
          schedule_id: schedule.id,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          worship_topic: schedule.worship_topic,
        })),
      };
    } catch (err) {
      console.error("ViewDetailedManual error:", err);
      throw new Error(`Manual detailed view failed: ${err.message}`);
    }
  }
}

module.exports = EventService;
