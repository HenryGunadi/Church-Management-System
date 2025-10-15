const { validationResult } = require('express-validator');
const { registerValidation, loginValidation } = require('../validators/auth');

class AuthRouter {
    constructor(authService, express) {
        this.authService = authService;
        this.router = express.Router();

        // register routes
        this.registerRoutes();
    }

    registerRoutes() {
        this.router.post('/login', loginValidation, this.login.bind(this));
        this.router.post(
            '/register',
            registerValidation,
            this.register.bind(this)
        );
    }

    async login(req, res) {
        try {
            // Validate payload
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            const user = await this.authService.login(email, password);

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            res.json({ message: 'Login successful', user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async register(req, res) {
        try {
            // Validate payload
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password, role } = req.body;
            const user = await this.authService.register(
                name,
                email,
                password,
                role
            );

            res.status(201).json({
                message: 'User registered successfully',
                user,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = AuthRouter;
