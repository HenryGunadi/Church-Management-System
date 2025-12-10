const AuthService = require("../../src/services/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  let mockDb, authService;

  beforeEach(() => {
    mockDb = jest.fn();

    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn(),
    });

    authService = new AuthService(mockDb);
  });

  // login test
  describe("login()", () => {
    test("should return null if user is not found", async () => {
      const query = mockDb();
      query.first.mockResolvedValue(null);

      const result = await authService.login("email@test.com", "pass");

      expect(result).toBeNull();
    });

    test("should return null if password doesn't match", async () => {
      const query = mockDb();
      query.first.mockResolvedValue({
        id: 1,
        email: "test@gmail.com",
        password: "hashed",
        role: "user",
      });

      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.login("test@gmail.com", "wrong");

      expect(result).toBeNull();
    });

    test("should return user + token if login is successful", async () => {
      const mockUser = {
        id: 1,
        email: "test@gmail.com",
        password: "hashed-pass",
        role: "user",
      };

      const query = mockDb();
      query.first.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake_jwt_token");

      const result = await authService.login("test@gmail.com", "correct");

      const { password, ...safeUser } = mockUser;

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();

      expect(result).toEqual({
        user: safeUser,
        token: "fake_jwt_token",
      });
    });
  });

  // register test
  describe("register()", () => {
    test("should throw error if email already registered", async () => {
      const query = mockDb();
      query.first.mockResolvedValue({ id: 1 });

      await expect(
        authService.register("test@gmail.com", "123", "user")
      ).rejects.toThrow("Email already registered");
    });

    test("should register and return new user", async () => {
      const query = mockDb();

      query.first.mockResolvedValueOnce(null);

      query.insert.mockResolvedValueOnce([10]);

      const newUser = {
        id: 10,
        email: "test@gmail.com",
        role: "user",
        created_at: "2025-01-01",
      };

      query.first.mockResolvedValueOnce(newUser);

      bcrypt.hash.mockResolvedValue("hashed-pass");

      const result = await authService.register(
        "test@gmail.com",
        "123",
        "user"
      );

      expect(query.insert).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual(newUser);
    });
  });
});
