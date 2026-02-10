const express = require('express');
const { readJSON, writeJSON, generateId, requireAuth } = require('./helpers');
const router = express.Router();

// GET /api/orders - list all (admin)
router.get('/', requireAuth, (req, res) => {
  const orders = readJSON('orders.json');
  const { status } = req.query;

  let filtered = [...orders];
  if (status) filtered = filtered.filter(o => o.status === status);

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filtered);
});

// GET /api/orders/:id - single order (admin)
router.get('/:id', requireAuth, (req, res) => {
  const orders = readJSON('orders.json');
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Comanda nu a fost gasita.' });
  res.json(order);
});

// POST /api/orders - create from checkout (public)
router.post('/', (req, res) => {
  const orders = readJSON('orders.json');
  const data = req.body;

  const order = {
    id: 'ST-' + Date.now().toString(36).toUpperCase(),
    customer: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      county: data.county || '',
      zip: data.zip || '',
      notes: data.notes || ''
    },
    items: data.items || [],
    subtotal: parseFloat(data.subtotal) || 0,
    shipping: parseFloat(data.shipping) || 0,
    total: parseFloat(data.total) || 0,
    shippingMethod: data.shippingMethod || '',
    paymentMethod: data.paymentMethod || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.push(order);
  writeJSON('orders.json', orders);
  res.status(201).json(order);
});

// PUT /api/orders/:id/status - update status (admin)
router.put('/:id/status', requireAuth, (req, res) => {
  const orders = readJSON('orders.json');
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Comanda nu a fost gasita.' });

  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status invalid.' });
  }

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  writeJSON('orders.json', orders);

  res.json(orders[index]);
});

// DELETE /api/orders/:id - delete (admin)
router.delete('/:id', requireAuth, (req, res) => {
  let orders = readJSON('orders.json');
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Comanda nu a fost gasita.' });

  orders.splice(index, 1);
  writeJSON('orders.json', orders);
  res.json({ success: true });
});

module.exports = router;
