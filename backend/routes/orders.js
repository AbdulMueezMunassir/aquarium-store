const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
    try {
        const { customer, items, totalAmount, address, phone } = req.body;
        const order = new Order({
            customer,
            items,
            totalAmount,
            address,
            phone
        });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'username email')
            .populate('items.fish')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
