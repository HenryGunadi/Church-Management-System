class Server {
  constructor(port, host) {
    this.express = require('express');
    this.app = this.express();
    this.port = port || 3000;
    this.host = host || 'localhost';

    // Middleware
    this.app.use(this.express.json());

    // routes
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
