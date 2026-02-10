const express = require('express');
const { readJSON, writeJSON, requireAuth } = require('./helpers');
const router = express.Router();

// GET /api/settings - get all settings (admin)
router.get('/', requireAuth, (req, res) => {
  const settings = readJSON('settings.json');
  res.json(settings);
});

// PUT /api/settings - update settings (admin)
router.put('/', requireAuth, (req, res) => {
  const settings = readJSON('settings.json');
  const data = req.body;

  // Merge new values
  for (const [key, value] of Object.entries(data)) {
    settings[key] = value;
  }

  writeJSON('settings.json', settings);
  res.json(settings);
});

module.exports = router;
