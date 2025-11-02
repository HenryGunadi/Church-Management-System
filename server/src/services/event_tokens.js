const { v4: uuidv4 } = require("uuid");

class EventTokens {
  constructor(db) {
    this.db = db;
  }

  async create(eventId, token) {
    try {
      await this.db("event_tokens").insert({
        event_id: eventId,
        token: token,
      });

      return { message: "Token created successfully" };
    } catch (err) {
      throw new Error(`Create event token failed: ${err.message}`);
    }
  }

  async view(token) {
    try {
      const result = await this.db("event_tokens")
        .where({ token })
        .join("events", "event_tokens.event_id", "=", "events.id")
        .select("events.*", "event_tokens.token")
        .first();

      if (!result) {
        throw new Error("Invalid or expired token");
      }

      return result;
    } catch (err) {
      throw new Error(`View events failed: ${err.message}`);
    }
  }
}

module.exports = EventTokens;
