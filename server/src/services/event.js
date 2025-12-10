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
      const { event_name, place, image_url, description, ...rest } = payload;

      const [eventId] = await trx("events").insert({
        event_name,
        place,
        image_url,
        description,
      });

      const qrCode = await this.generateQR(eventId, trx);

      await trx("events").where({ id: eventId }).update({ qr_code: qrCode });

      const scheduledPayload = {
        ...rest,
        event_id: eventId,
      };
      await this.eventScheduleService.create(scheduledPayload, trx);

      await trx.commit();

      return await this.viewDetailed(eventId);
    } catch (err) {
      await trx.rollback();
      throw new Error(`Create event failed: ${err.message}`);
    }
  }

  async generateQR(eventId, trx = null) {
    try {
      const randomToken = uuidv4();
      const baseURL =
        config.server.host && config.server.port
          ? `http://${config.server.host}:${config.server.port}`
          : "http://localhost:3000";

      // create token service data
      await this.eventTokenService.create(eventId, randomToken, trx);

      const url = `${baseURL}/scan?token=${randomToken}`;
      return await QRCode.toDataURL(url);
    } catch (err) {
      throw new Error(`Geneate QR error : ${err.message}`);
    }
  }

  async update(payload) {
    try {
      const event = await this.view(payload.id);

      if (!event) {
        throw new Error("Event doesn't exist.");
      }

      await this.db("events").where({ id: payload.id }).update(payload);

      return { success: true, message: "Event has been updated." };
    } catch (err) {
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
      throw new Error(`Delete event failed: ${err.message}`);
    }
  }

  async view(id = undefined) {
    try {
      const query = this.db("events").select("*");

      if (id) {
        return query.where({ id }).first();
      } else {
        return await query;
      }
    } catch (err) {
      throw new Error(`View events failed: ${err.message}`);
    }
  }

  async viewDetailed(id) {
    try {
      if (!id) throw new Error("Event ID is required for detailed view");
      console.log("Event id : ", id);
      const result = await this.db.raw(
        "SELECT get_event_details(?) as event_data",
        [id]
      );
      const eventData = result[0][0].event_data;

      console.log("Result : ", result);

      return eventData ? JSON.parse(eventData) : null;
    } catch (err) {
      throw new Error(`Detailed view failed: ${err.message}`);
    }
  }
}

module.exports = EventService;
