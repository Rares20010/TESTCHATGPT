const express = require('express');
const { readJSON, writeJSON, generateId, requireAuth } = require('./helpers');
const router = express.Router();

// GET /api/products - list all (public)
router.get('/', (req, res) => {
  const products = readJSON('products.json');
  const { category, brand, search, sort, limit } = req.query;

  let filtered = [...products];

  if (category) filtered = filtered.filter(p => p.category === category);
  if (brand) filtered = filtered.filter(p => p.brand === brand);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.shortDescription || '').toLowerCase().includes(q)
    );
  }

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (limit) filtered = filtered.slice(0, parseInt(limit));

  res.json(filtered);
});

// GET /api/products/:id - single product (public)
router.get('/:id', (req, res) => {
  const products = readJSON('products.json');
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produsul nu a fost gasit.' });
  res.json(product);
});

// POST /api/products - create (admin)
router.post('/', requireAuth, (req, res) => {
  const products = readJSON('products.json');
  const data = req.body;

  const product = {
    id: generateId('prod'),
    name: data.name || '',
    brand: data.brand || '',
    category: data.category || '',
    price: parseFloat(data.price) || 0,
    originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
    currency: 'RON',
    images: data.images || [],
    shortDescription: data.shortDescription || '',
    description: data.description || '',
    specs: data.specs || {},
    rating: parseFloat(data.rating) || 0,
    reviewCount: parseInt(data.reviewCount) || 0,
    inStock: data.inStock !== false,
    featured: data.featured === true,
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.push(product);
  writeJSON('products.json', products);

  res.status(201).json(product);
});

// PUT /api/products/:id - update (admin)
router.put('/:id', requireAuth, (req, res) => {
  const products = readJSON('products.json');
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produsul nu a fost gasit.' });

  const data = req.body;
  const product = products[index];

  // Update only provided fields
  if (data.name !== undefined) product.name = data.name;
  if (data.brand !== undefined) product.brand = data.brand;
  if (data.category !== undefined) product.category = data.category;
  if (data.price !== undefined) product.price = parseFloat(data.price);
  if (data.originalPrice !== undefined) product.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
  if (data.images !== undefined) product.images = data.images;
  if (data.shortDescription !== undefined) product.shortDescription = data.shortDescription;
  if (data.description !== undefined) product.description = data.description;
  if (data.specs !== undefined) product.specs = data.specs;
  if (data.rating !== undefined) product.rating = parseFloat(data.rating);
  if (data.reviewCount !== undefined) product.reviewCount = parseInt(data.reviewCount);
  if (data.inStock !== undefined) product.inStock = data.inStock;
  if (data.featured !== undefined) product.featured = data.featured;
  if (data.tags !== undefined) product.tags = data.tags;
  product.updatedAt = new Date().toISOString();

  products[index] = product;
  writeJSON('products.json', products);

  res.json(product);
});

// DELETE /api/products/:id - delete (admin)
router.delete('/:id', requireAuth, (req, res) => {
  let products = readJSON('products.json');
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produsul nu a fost gasit.' });

  products.splice(index, 1);
  writeJSON('products.json', products);

  res.json({ success: true, message: 'Produsul a fost sters.' });
});

// POST /api/products/:id/duplicate - duplicate product (admin)
router.post('/:id/duplicate', requireAuth, (req, res) => {
  const products = readJSON('products.json');
  const original = products.find(p => p.id === req.params.id);
  if (!original) return res.status(404).json({ error: 'Produsul nu a fost gasit.' });

  const duplicate = {
    ...original,
    id: generateId('prod'),
    name: original.name + ' (Copie)',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.push(duplicate);
  writeJSON('products.json', products);

  res.status(201).json(duplicate);
});

module.exports = router;
