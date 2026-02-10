const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('./helpers');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || 'products';
    const uploadDir = path.join(__dirname, '..', 'uploads', type);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Doar imagini (JPG, PNG, GIF, WebP, SVG) sunt permise.'));
    }
  }
});

// POST /api/upload - upload single image (admin)
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Niciun fisier incarcat.' });
  }

  const type = req.query.type || 'products';
  const url = `/uploads/${type}/${req.file.filename}`;

  res.json({
    success: true,
    url,
    filename: req.file.filename,
    size: req.file.size
  });
});

// POST /api/upload/multiple - upload multiple images (admin)
router.post('/multiple', requireAuth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Niciun fisier incarcat.' });
  }

  const type = req.query.type || 'products';
  const files = req.files.map(f => ({
    url: `/uploads/${type}/${f.filename}`,
    filename: f.filename,
    size: f.size
  }));

  res.json({ success: true, files });
});

// DELETE /api/upload - delete image (admin)
router.delete('/', requireAuth, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL-ul este obligatoriu.' });

  const filePath = path.join(__dirname, '..', url);

  // Security: only allow deleting from uploads directory
  if (!filePath.includes(path.join(__dirname, '..', 'uploads'))) {
    return res.status(403).json({ error: 'Acces interzis.' });
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Fisierul nu a fost gasit.' });
  }
});

module.exports = router;
