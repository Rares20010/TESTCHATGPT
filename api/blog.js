const express = require('express');
const { readJSON, writeJSON, generateId, requireAuth } = require('./helpers');
const router = express.Router();

// GET /api/blog - list all (public)
router.get('/', (req, res) => {
  const posts = readJSON('blog-posts.json');
  const { category, limit } = req.query;

  let filtered = [...posts];
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (limit) filtered = filtered.slice(0, parseInt(limit));

  res.json(filtered);
});

// GET /api/blog/:id - single post (public)
router.get('/:id', (req, res) => {
  const posts = readJSON('blog-posts.json');
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Articolul nu a fost gasit.' });
  res.json(post);
});

// POST /api/blog - create (admin)
router.post('/', requireAuth, (req, res) => {
  const posts = readJSON('blog-posts.json');
  const data = req.body;

  const post = {
    id: generateId('post'),
    title: data.title || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    category: data.category || 'ghiduri',
    date: data.date || new Date().toISOString().split('T')[0],
    thumbnail: data.thumbnail || '',
    readTime: data.readTime || '5 min',
    author: data.author || req.session.user.name,
    published: data.published !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  posts.push(post);
  writeJSON('blog-posts.json', posts);
  res.status(201).json(post);
});

// PUT /api/blog/:id - update (admin)
router.put('/:id', requireAuth, (req, res) => {
  const posts = readJSON('blog-posts.json');
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Articolul nu a fost gasit.' });

  const data = req.body;
  const post = posts[index];

  if (data.title !== undefined) post.title = data.title;
  if (data.excerpt !== undefined) post.excerpt = data.excerpt;
  if (data.content !== undefined) post.content = data.content;
  if (data.category !== undefined) post.category = data.category;
  if (data.date !== undefined) post.date = data.date;
  if (data.thumbnail !== undefined) post.thumbnail = data.thumbnail;
  if (data.readTime !== undefined) post.readTime = data.readTime;
  if (data.published !== undefined) post.published = data.published;
  post.updatedAt = new Date().toISOString();

  posts[index] = post;
  writeJSON('blog-posts.json', posts);
  res.json(post);
});

// DELETE /api/blog/:id - delete (admin)
router.delete('/:id', requireAuth, (req, res) => {
  let posts = readJSON('blog-posts.json');
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Articolul nu a fost gasit.' });

  posts.splice(index, 1);
  writeJSON('blog-posts.json', posts);
  res.json({ success: true });
});

module.exports = router;
