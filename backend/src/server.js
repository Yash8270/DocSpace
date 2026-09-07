import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { initSocketServer } from './services/socketService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io WebSockets for live collaboration & presence
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 DocSpace API Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSockets Live Collaboration active!`);
  console.log(`==================================================`);
});
