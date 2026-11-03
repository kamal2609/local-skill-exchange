const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Local Skill Exchange API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;

