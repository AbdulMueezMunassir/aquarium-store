const mongoose = require('mongoose');

const FishSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    thresholdAlert: { type: Number, default: 5 },
    priceLKR: { type: Number, required: true },
    pricingType: { type: String, enum: ['one piece', 'pair'], default: 'one piece' },
    rating: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fish', FishSchema);
