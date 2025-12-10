const UserService = require("../../src/services/users");
const bcrypt = require("bcrypt");

jest.mock("bcrypt");

describe("UserService", () => {
  let mockDb, userService;

  beforeEach(() => {
    mockDb = jest.fn();

    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
    });

    userService = new UserService(mockDb);
  });

  // create user testing
  describe("create()", () => {
    test("should return user if successful", async () => {
      const mockUserPayload = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "secret123",
        role: "member",
        gender: "Male",
        birth_date: "1995-06-15",
        phone_number: "081234567890",
        address: "Jl. Merdeka No. 45, Jakarta",
      };

      const mockUserResult = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "member",
        gender: "Male",
        birth_date: "1995-06-15",
        phone_number: "081234567890",
        address: "Jl. Merdeka No. 45, Jakarta",
        joined_at: "2025-02-10T12:34:56.000Z",
        created_at: "2025-02-10T12:34:56.000Z",
        updated_at: "2025-02-10T12:34:56.000Z",
      };

      const query = mockDb();
      query.insert.mockResolvedValueOnce([1]);

      jest
        .spyOn(userService, "view")
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUserResult);

      const result = await userService.create(mockUserPayload);

      expect(result).toEqual(mockUserResult);
    });

    test("user already exists.", async () => {
      const mockUserResult = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "member",
        gender: "Male",
        birth_date: "1995-06-15",
        phone_number: "081234567890",
        address: "Jl. Merdeka No. 45, Jakarta",
        joined_at: "2025-02-10T12:34:56.000Z",
        created_at: "2025-02-10T12:34:56.000Z",
        updated_at: "2025-02-10T12:34:56.000Z",
      };
      const mockUserPayload = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "secret123",
        role: "member",
        gender: "Male",
        birth_date: "1995-06-15",
        phone_number: "081234567890",
        address: "Jl. Merdeka No. 45, Jakarta",
      };

      jest.spyOn(userService, "view").mockResolvedValueOnce(mockUserResult);

      await expect(userService.create(mockUserPayload)).rejects.toThrow(
        "Create user failed: User already exists!"
      );
    });
  });

  describe("update()", () => {
    test("user doesnt exist", async () => {
      const mockUpdatePayload = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        birth_date: "1995-06-15",
      };

      jest.spyOn(userService, "view").mockResolvedValueOnce(undefined);

      await expect(userService.update(mockUpdatePayload)).rejects.toThrow(
        "Update user failed: User doesn't exist!"
      );
    });

    test("should return updated user when all logic is successful", async () => {
      const query = mockDb();
      query.update();

      const mockUpdatePayload = {
        id: 1,
        name: "John Doe William",
      };

      const mockUserResult = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "member",
        gender: "Male",
        birth_date: "1995-06-15",
        phone_number: "081234567890",
        address: "Jl. Merdeka No. 45, Jakarta",
        joined_at: "2025-02-10T12:34:56.000Z",
        created_at: "2025-02-10T12:34:56.000Z",
        updated_at: "2025-02-10T12:34:56.000Z",
      };

      jest
        .spyOn(userService, "view")
        .mockResolvedValueOnce(mockUserResult)
        .mockResolvedValueOnce({
          ...mockUserResult,
          name: mockUpdatePayload.name,
        });

      bcrypt.hash.mockResolvedValue("xxxxxxxxxxxxx");

      const result = await userService.update(mockUpdatePayload);
      expect(result).toEqual({
        ...mockUserResult,
        name: mockUpdatePayload.name,
      });
    });
  });

  describe("delete()", () => {
    test("id or email is not provided.", async () => {
      await expect(userService.delete()).rejects.toThrow(
        "Delete user failed: You must provide an id or email to delete a user"
      );
    });

    test("no rows have been deleted", async () => {
      const query = mockDb();
      query.del.mockResolvedValue(0);
      const mockEmail = "john@gmail.com";

      await expect(userService.delete(undefined, mockEmail)).rejects.toThrow(
        "Delete user failed: User not found or already deleted"
      );
    });

    test("user deleted successfully", async () => {
      const query = mockDb();
      query.del.mockResolvedValue(1);
      const mockEmail = "john@gmail.com";
      const mockResult = {
        success: true,
        message: "User deleted successfully",
      };

      const result = await userService.delete(undefined, mockEmail);
      expect(result).toEqual(mockResult);
    });
  });
});
