const bcrypt = require("bcrypt");

class UserService {
  constructor(db) {
    this.db = db;
  }

  async create(payload) {
    try {
      const user = await this.view(undefined, payload.email);

      if (user) {
        throw new Error("User already exists!");
      }

      const [id] = await this.db("users").insert(payload).returning("*");
      return await db("users").where({ id }).first();
    } catch (err) {
      throw new Error(`Create user failed: ${err.message}`);
    }
  }

  async update(payload) {
    try {
      const user = await this.view(payload.id);

      if (!user) {
        throw new Error("User doesn't exist!");
      }

      const { password, id, ...rest } = payload;
      const updatedFields = {
        ...rest,
        ...(password && { password: await bcrypt.hash(password, 10) }),
      };

      await this.db("users").where({ id: payload.id }).update(updatedFields);

      const updatedUser = await this.view(payload.id);
      delete updatedUser.password;
      return updatedUser;
    } catch (err) {
      throw new Error(`Update user failed: ${err.message}`);
    }
  }
  async delete(id = undefined, email = undefined) {
    try {
      if (!id && !email) {
        throw new Error("You must provide an id or email to delete a user");
      }

      const query = this.db("users");
      if (id) query.where({ id });
      else if (email) query.where({ email });

      const deletedRows = await query.del();

      if (deletedRows === 0) {
        throw new Error("User not found or already deleted");
      }

      return { success: true, message: "User deleted successfully" };
    } catch (err) {
      throw new Error(`Delete user failed: ${err.message}`);
    }
  }

  async view(id = undefined, email = undefined) {
    try {
      let user;
      if (id) {
        user = await this.db("users").where({ id: id }).select("*").first();
      } else if (email) {
        user = await this.db("users")
          .where({ email: email })
          .select("*")
          .first();
      }

      if (user) {
        delete user.password;
        return user;
      }

      const users = await this.db("users").select("*");
      return users.map((u) => {
        delete u.password;
        return u;
      });
    } catch (err) {
      throw new Error(`View users failed: ${err.message}`);
    }
  }
}

module.exports = UserService;
