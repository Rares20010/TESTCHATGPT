const express = require('express');
const bcrypt = require('bcryptjs');
const { readJSON, writeJSON, requireAuth } = require('./helpers');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username si parola sunt obligatorii.' });
    }

    const users = readJSON('admin-users.json');
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Credentiale invalide.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credentiale invalide.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };

    // Ensure session is saved before responding
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Eroare la salvarea sesiunii.' });
      }
      res.json({
        success: true,
        user: { id: user.id, username: user.username, name: user.name, role: user.role }
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Eroare interna la autentificare.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.json({ authenticated: false });
});

// PUT /api/auth/password - change password
router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Ambele campuri sunt obligatorii.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Parola noua trebuie sa aiba minim 6 caractere.' });
  }

  const users = readJSON('admin-users.json');
  const user = users.find(u => u.id === req.session.user.id);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Parola curenta este incorecta.' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  writeJSON('admin-users.json', users);

  res.json({ success: true, message: 'Parola a fost schimbata.' });
});

module.exports = router;
