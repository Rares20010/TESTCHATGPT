const express = require('express');
const { readJSON, requireAuth } = require('./helpers');
const router = express.Router();

// GET /api/dashboard - dashboard stats (admin)
router.get('/', requireAuth, (req, res) => {
  const products = readJSON('products.json');
  const orders = readJSON('orders.json');
  const posts = readJSON('blog-posts.json');
  const categories = readJSON('categories.json');

  // Calculate stats
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const ordersByStatus = {};
  orders.forEach(o => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
  });

  const productsByCategory = {};
  products.forEach(p => {
    productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
  });

  const outOfStock = products.filter(p => !p.inStock).length;

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.json({
    stats: {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      totalPosts: posts.length,
      totalCategories: categories.length,
      outOfStock,
      pendingOrders: ordersByStatus['pending'] || 0
    },
    ordersByStatus,
    productsByCategory,
    recentOrders
  });
});

module.exports = router;
