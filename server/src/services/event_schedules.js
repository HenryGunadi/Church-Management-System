class EventScheduleService {
  constructor(db) {
    this.db = db;
  }

  async create(payload, trx = null) {
    try {
      const queryBuilder = trx || this.db;
      const [id] = await queryBuilder("event_schedules").insert(payload);
      return await this.view(id);
    } catch (err) {
      throw new Error(`Create event schedule failed: ${err.message}`);
    }
  }

  async update(id, payload) {
    try {
      const schedule = await this.view(id);

      if (!schedule) {
        throw new Error("Event schedule doesn't exist.");
      }

      await this.db("event_schedules").where({ id }).update(payload);
      return { success: true, message: "Schedule updated successfully" };
    } catch (err) {
      throw new Error(`Update event schedule failed: ${err.message}`);
    }
  }

  async delete(id) {
    try {
      const deleted = await this.db("event_schedules").where({ id }).del();

      if (deleted === 0) {
        throw new Error("Event schedule not found or already deleted.");
      }

      return { success: true, message: "Schedule deleted successfully" };
    } catch (err) {
      throw new Error(`Delete event schedule failed: ${err.message}`);
    }
  }

  async view(id = undefined, eventId = undefined) {
    try {
      const query = this.db("event_schedules").select("*");

      if (id) {
        return await query.where({ id }).first();
      }

      if (eventId) {
        return await query.where({ event_id: eventId });
      }

      return await query;
    } catch (err) {
      throw new Error(`View event schedule(s) failed: ${err.message}`);
    }
  }
}

module.exports = EventScheduleService;
