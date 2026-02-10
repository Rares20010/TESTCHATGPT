/* ============================================
   SolarTech Pro - CMS Backend Server
   Lightweight admin panel like WordPress but simpler
   ============================================ */

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'solartech-cms-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// Static files - frontend store
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  extensions: ['html']
}));

// Static files - uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/products', require('./api/products'));
app.use('/api/categories', require('./api/categories'));
app.use('/api/blog', require('./api/blog'));
app.use('/api/orders', require('./api/orders'));
app.use('/api/settings', require('./api/settings'));
app.use('/api/upload', require('./api/upload'));
app.use('/api/dashboard', require('./api/dashboard'));

// Admin panel - serve after auth check
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/{*path}', (req, res) => {
  // Serve the admin SPA for all sub-routes
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Initialize data files if they don't exist
function initDataFiles() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const defaults = {
    'admin-users.json': [{
      id: 'admin-001',
      username: 'admin',
      // Default password: "admin123" - CHANGE IN PRODUCTION
      password: '$2b$10$Mlg6h62hlmsIa.wNVBAxtOKeC1gXzbW/7cve2/CZNgAyn0javhium',
      name: 'Administrator',
      role: 'admin',
      createdAt: new Date().toISOString()
    }],
    'categories.json': [
      { id: 'monocrystalline', name: 'Panouri Monocristaline', slug: 'monocrystalline', description: 'Panouri solare cu celule monocristaline de inalta eficienta', order: 1, active: true },
      { id: 'polycrystalline', name: 'Panouri Policristaline', slug: 'polycrystalline', description: 'Panouri solare cu celule policristaline, pret accesibil', order: 2, active: true },
      { id: 'inverter', name: 'Invertoare', slug: 'inverter', description: 'Invertoare solare hibride si string', order: 3, active: true },
      { id: 'battery', name: 'Baterii', slug: 'battery', description: 'Sisteme de stocare energie litiu-ion', order: 4, active: true },
      { id: 'mounting', name: 'Sisteme de Montaj', slug: 'mounting', description: 'Structuri de montaj pentru acoperis si sol', order: 5, active: true }
    ],
    'orders.json': [],
    'settings.json': {
      siteName: 'SolarTech Pro',
      siteDescription: 'Magazin online premium de panouri fotovoltaice',
      currency: 'RON',
      email: 'contact@solartech.ro',
      phone: '+40 721 234 567',
      address: 'Str. Energiei Nr. 42, Bucuresti',
      freeShippingThreshold: 5000,
      vatRate: 19,
      codFee: 10
    }
  };

  for (const [file, data] of Object.entries(defaults)) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  }
}

initDataFiles();

app.listen(PORT, () => {
  console.log(`\n  SolarTech Pro CMS Server`);
  console.log(`  ========================`);
  console.log(`  Store:    http://localhost:${PORT}`);
  console.log(`  Admin:    http://localhost:${PORT}/admin`);
  console.log(`  API:      http://localhost:${PORT}/api`);
  console.log(`\n  Default login: admin / admin123\n`);
});
