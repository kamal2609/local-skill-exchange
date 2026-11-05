

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);





require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Try connecting to database if config exists
try {
  const connectDB = require('./config/db');
  if (typeof connectDB === 'function') {
    connectDB().catch((err) => {
      console.warn('Initial MongoDB connection attempt deferred:', err.message);
    });
  }
} catch (e) {
  // DB config not yet present in Wave 1
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Local Skill Exchange Server running on http://localhost:${PORT}`);
  console.log(`📡 Health endpoint available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

module.exports = server;

