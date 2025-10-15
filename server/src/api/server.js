const { db } = require('../db/db');
const AuthRouter = require('../routers/auth');
const AuthService = require('../services/auth');

class Server {
    constructor(port, host) {
        this.express = require('express');
        this.app = this.express();
        this.port = port || 3000;
        this.host = host || 'localhost';
        this.db = db;

        // Middleware
        this.app.use(this.express.json());

        // services
        const authService = new AuthService(this.db);

        // routes
        const authRouter = new AuthRouter(authService, this.express);

        // register routes
        this.app.use('/api/auth', authRouter.router);

        this.app.get('/', (req, res) => {
            res.send('Server is running!');
        });
    }

    run() {
        this.app.listen(this.port, this.host, () => {
            console.log(`Server running at http://${this.host}:${this.port}`);
        });
    }
}

module.exports = Server;
