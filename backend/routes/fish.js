const express = require('express');
const router = express.Router();
const fishController = require('../controllers/fishController');
const auth = require('../middleware/auth');

// Category Routes
router.post('/category', auth, fishController.createCategory);
router.get('/categories', fishController.getCategories);
router.delete('/category/:id', auth, fishController.deleteCategory);

// Fish Routes
router.post('/add', auth, fishController.addFish);
router.get('/category/:categoryId', fishController.getFishesByCategory);
router.get('/all', fishController.getAllFishes);
router.put('/:id', auth, fishController.updateFish);
router.delete('/:id', auth, fishController.deleteFish);
router.put('/stock/:id', auth, fishController.updateStock);

module.exports = router;