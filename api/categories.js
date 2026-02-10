const express = require('express');
const { readJSON, writeJSON, generateId, requireAuth } = require('./helpers');
const router = express.Router();

// GET /api/categories - list all (public)
router.get('/', (req, res) => {
  const categories = readJSON('categories.json');
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(categories);
});

// POST /api/categories - create (admin)
router.post('/', requireAuth, (req, res) => {
  const categories = readJSON('categories.json');
  const { name, description, order } = req.body;

  if (!name) return res.status(400).json({ error: 'Numele categoriei este obligatoriu.' });

  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const category = {
    id: slug || generateId('cat'),
    name,
    slug,
    description: description || '',
    order: parseInt(order) || categories.length + 1,
    active: true,
    createdAt: new Date().toISOString()
  };

  categories.push(category);
  writeJSON('categories.json', categories);
  res.status(201).json(category);
});

// PUT /api/categories/:id - update (admin)
router.put('/:id', requireAuth, (req, res) => {
  const categories = readJSON('categories.json');
  const index = categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Categoria nu a fost gasita.' });

  const { name, description, order, active } = req.body;
  if (name !== undefined) categories[index].name = name;
  if (description !== undefined) categories[index].description = description;
  if (order !== undefined) categories[index].order = parseInt(order);
  if (active !== undefined) categories[index].active = active;

  writeJSON('categories.json', categories);
  res.json(categories[index]);
});

// DELETE /api/categories/:id - delete (admin)
router.delete('/:id', requireAuth, (req, res) => {
  let categories = readJSON('categories.json');
  const index = categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Categoria nu a fost gasita.' });

  // Check if products use this category
  const products = readJSON('products.json');
  const used = products.filter(p => p.category === req.params.id).length;
  if (used > 0) {
    return res.status(400).json({
      error: `Nu se poate sterge. ${used} produse folosesc aceasta categorie.`
    });
  }

  categories.splice(index, 1);
  writeJSON('categories.json', categories);
  res.json({ success: true });
});

module.exports = router;
