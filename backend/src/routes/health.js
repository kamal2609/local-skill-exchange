const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbState = mongoose.connection.readyState;

  res.json({
    status: 'ok',
    service: 'Local Skill Exchange API (MERN)',
    version: '1.0.0',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
    modelsLoaded: Object.keys(mongoose.models).length,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
