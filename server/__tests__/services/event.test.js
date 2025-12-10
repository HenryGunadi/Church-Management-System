const EventService = require("../../src/services/event");
const EventScheduleService = require("../../src/services/event_schedules");
const EventTokenService = require("../../src/services/event_tokens");

const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// Mocks
jest.mock("qrcode");
jest.mock("uuid", () => ({ v4: jest.fn() }));

describe("EventService.create()", () => {
  let mockDb, mockTrx;
  let eventService, eventScheduleService, eventTokenService;

  beforeEach(() => {
    // Mock transaction object
    mockTrx = jest.fn();
    mockTrx.where = jest.fn().mockReturnThis();
    mockTrx.insert = jest.fn();
    mockTrx.update = jest.fn();
    mockTrx.commit = jest.fn();
    mockTrx.rollback = jest.fn();

    mockTrx.mockReturnValue(mockTrx);

    // Mock main db (Knex)
    mockDb = jest.fn(() => mockDb);
    mockDb.transaction = jest.fn(() => mockTrx);
    mockDb.where = jest.fn().mockReturnThis();
    mockDb.insert = jest.fn();
    mockDb.update = jest.fn();
    mockDb.del = jest.fn();
    mockDb.select = jest.fn().mockReturnThis();
    mockDb.first = jest.fn();
    mockDb.raw = jest.fn();

    // Mock nested services
    eventScheduleService = new EventScheduleService(mockDb);
    eventTokenService = new EventTokenService(mockDb);
    eventService = new EventService(
      mockDb,
      eventTokenService,
      eventScheduleService
    );

    // Mock functions
    uuidv4.mockReturnValue("mocked-uuid");

    QRCode.toDataURL.mockResolvedValue("mocked-qrcode");
  });

  describe("create()", () => {
    test("should successfully create event, generate QR, schedule, and commit transaction", async () => {
      // Given
      const payload = {
        event_name: "Birthday",
        place: "Hall",
        image_url: "img.jpg",
        description: "desc",
        date: "2025-01-01",
        start_time: "10:00",
        end_time: "12:00",
      };

      // mock event insert returning event ID = 1
      mockTrx.insert.mockResolvedValueOnce([1]);

      // mock eventTokenService.create
      eventTokenService.create = jest.fn().mockResolvedValue({});

      // mock eventScheduleService.create
      eventScheduleService.create = jest.fn().mockResolvedValue({ id: 10 });

      // mock viewDetailed
      eventService.viewDetailed = jest.fn().mockResolvedValue({
        id: 1,
        event_name: "Birthday",
      });

      // When
      const result = await eventService.create(payload);

      // Then
      expect(mockDb.transaction).toHaveBeenCalled();

      // 1. Event created
      expect(mockTrx.insert).toHaveBeenCalledWith({
        event_name: "Birthday",
        place: "Hall",
        image_url: "img.jpg",
        description: "desc",
      });

      // 2. Token created
      expect(eventTokenService.create).toHaveBeenCalledWith(
        1,
        "mocked-uuid",
        mockTrx
      );

      // 3. QR generated
      expect(QRCode.toDataURL).toHaveBeenCalled();

      // 4. Update event with QR code
      expect(mockTrx.update).toHaveBeenCalledWith({ qr_code: "mocked-qrcode" });

      // 5. Schedule created
      expect(eventScheduleService.create).toHaveBeenCalledWith(
        {
          date: "2025-01-01",
          start_time: "10:00",
          end_time: "12:00",
          event_id: 1,
        },
        mockTrx
      );

      // 6. Commit
      expect(mockTrx.commit).toHaveBeenCalled();

      // 7. Final result
      expect(result).toEqual({
        id: 1,
        event_name: "Birthday",
      });
    });

    test("should rollback transaction when error occurs", async () => {
      mockTrx.insert.mockRejectedValue(new Error("Insert failed"));

      await expect(eventService.create({})).rejects.toThrow(
        "Create event failed: Insert failed"
      );

      expect(mockTrx.rollback).toHaveBeenCalled();
    });
  });

  describe("EventService.update()", () => {
    let eventService, mockDb;

    beforeEach(() => {
      mockDb = jest.fn(() => mockDb);

      mockDb.where = jest.fn().mockReturnThis();
      mockDb.update = jest.fn();
      mockDb.select = jest.fn().mockReturnThis();
      mockDb.first = jest.fn();

      eventService = new EventService(mockDb, {}, {});
    });

    test("should update event successfully when event exists", async () => {
      // mock event exists
      eventService.view = jest.fn().mockResolvedValue({ id: 1 });

      mockDb.update.mockResolvedValue(1);

      const payload = { id: 1, event_name: "Updated Name" };

      const result = await eventService.update(payload);

      expect(eventService.view).toHaveBeenCalledWith(1);
      expect(mockDb.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockDb.update).toHaveBeenCalledWith(payload);

      expect(result).toEqual({
        success: true,
        message: "Event has been updated.",
      });
    });

    test("should throw error when event does not exist", async () => {
      eventService.view = jest.fn().mockResolvedValue(null);

      await expect(eventService.update({ id: 99 })).rejects.toThrow(
        "Update event failed: Event doesn't exist."
      );
    });

    test("should throw error when DB update fails", async () => {
      eventService.view = jest.fn().mockResolvedValue({ id: 1 });

      mockDb.update.mockRejectedValue(new Error("DB failed"));

      await expect(eventService.update({ id: 1 })).rejects.toThrow(
        "Update event failed: DB failed"
      );
    });
  });

  describe("EventService.delete()", () => {
    let eventService, mockDb;

    beforeEach(() => {
      mockDb = jest.fn(() => mockDb);

      mockDb.where = jest.fn().mockReturnThis();
      mockDb.del = jest.fn();

      eventService = new EventService(mockDb, {}, {});
    });

    test("should delete event successfully", async () => {
      mockDb.del.mockResolvedValue(1); // 1 row deleted

      const result = await eventService.delete(5);

      expect(mockDb.where).toHaveBeenCalledWith({ id: 5 });
      expect(result).toEqual({
        success: true,
        message: "Event deleted successfully",
      });
    });

    test("should throw error when event not found", async () => {
      mockDb.del.mockResolvedValue(0); // no rows deleted

      await expect(eventService.delete(99)).rejects.toThrow(
        "Delete event failed: Event not found or already deleted."
      );
    });

    test("should throw error when DB error happens", async () => {
      mockDb.del.mockRejectedValue(new Error("DB crash"));

      await expect(eventService.delete(1)).rejects.toThrow(
        "Delete event failed: DB crash"
      );
    });
  });
});
