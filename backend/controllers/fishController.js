const Category = require('../models/Category');
const Fish = require('../models/Fish');

// Create Category
exports.createCategory = async (req, res) => {
    try {
        const { name, image } = req.body;
        let category = await Category.findOne({ name });
        if (category) return res.status(400).json({ msg: 'Category already exists' });

        category = new Category({ name, image });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Get All Categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        await Fish.deleteMany({ category: req.params.id });
        res.json({ msg: 'Category and related fish deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Add Fish
exports.addFish = async (req, res) => {
    try {
        const { categoryId, name, imageUrl, description, size, stock, thresholdAlert, priceLKR, pricingType } = req.body;
        
        const fish = new Fish({
            category: categoryId,
            name,
            imageUrl: imageUrl || 'https://picsum.photos/seed/fish' + Date.now() + '/500/350',
            description,
            size,
            stock: stock || 0,
            thresholdAlert: thresholdAlert || 5,
            priceLKR,
            pricingType: pricingType || 'one piece'
        });

        await fish.save();
        res.status(201).json(fish);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Get Fishes by Category
exports.getFishesByCategory = async (req, res) => {
    try {
        const fishes = await Fish.find({ category: req.params.categoryId });
        res.json(fishes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Get All Fishes
exports.getAllFishes = async (req, res) => {
    try {
        const fishes = await Fish.find().populate('category', 'name');
        res.json(fishes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Update Fish
exports.updateFish = async (req, res) => {
    try {
        const { name, description, size, stock, priceLKR, imageUrl } = req.body;
        const fish = await Fish.findByIdAndUpdate(
            req.params.id,
            { name, description, size, stock, priceLKR, imageUrl },
            { new: true }
        );
        res.json(fish);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Delete Fish
exports.deleteFish = async (req, res) => {
    try {
        await Fish.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Fish deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Update Stock
exports.updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        const fish = await Fish.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true }
        );
        res.json(fish);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};