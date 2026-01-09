const bcrypt = require("bcrypt");

class UserService {
  constructor(db) {
    this.db = db;
  }

  async create(payload) {
    try {
      // Check if user with this email exists
      const existingUser = await this.db("users")
        .where({ email: payload.email })
        .select("*")
        .first();

      if (existingUser) {
        throw new Error("User already exists!");
      }

      // Hash password before saving
      if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, 10);
      }

      const [id] = await this.db("users").insert(payload);
      
      // Return the newly created user
      const newUser = await this.db("users")
        .where({ id })
        .select("*")
        .first();
      
      delete newUser.password;
      return newUser;
      
    } catch (err) {
      throw new Error(`Create user failed: ${err.message}`);
    }
  }

  async update(payload) {
    try {
      // Check if user exists
      const user = await this.db("users")
        .where({ id: payload.id })
        .select("*")
        .first();

      if (!user) {
        throw new Error("User doesn't exist!");
      }

      const { password, id, ...rest } = payload;
      const updatedFields = {
        ...rest,
        ...(password && { password: await bcrypt.hash(password, 10) }),
      };

      await this.db("users").where({ id: payload.id }).update(updatedFields);

      const updatedUser = await this.db("users")
        .where({ id: payload.id })
        .select("*")
        .first();
      
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
      // If id or email is provided, return single user
      if (id) {
        const user = await this.db("users")
          .where({ id })
          .select("*")
          .first();
        
        if (user) {
          delete user.password;
          return user;
        }
        return null; // Return null if not found
      }
      
      if (email) {
        const user = await this.db("users")
          .where({ email })
          .select("*")
          .first();
        
        if (user) {
          delete user.password;
          return user;
        }
        return null; // Return null if not found
      }

      // If no id or email provided, return all users
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