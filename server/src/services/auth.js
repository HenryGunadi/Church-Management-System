const bcrypt = require('bcrypt');

class AuthService {
    constructor(db) {
        this.db = db;
    }

    async login(email, password) {
        try {
            const user = await this.db('users').where({ email }).first();

            if (!user) {
                return null;
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return null;
            }

            delete user.password;

            return user;
        } catch (err) {
            throw new Error(`Login failed: ${err.message}`);
        }
    }

    async register(name, email, password, role) {
        try {
            const existingUser = await this.db('users')
                .where({ email })
                .first();
            if (existingUser) {
                throw new Error('Email already registered');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [insertId] = await this.db('users').insert({
                name,
                email,
                password: hashedPassword,
                role,
            });

            const newUser = await this.db('users')
                .where({ id: insertId })
                .select('id', 'name', 'email', 'role', 'created_at')
                .first();

            return newUser;
        } catch (err) {
            throw new Error(`Registration failed: ${err.message}`);
        }
    }
}

module.exports = AuthService;
