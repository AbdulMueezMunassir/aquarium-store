const mongoose = require('mongoose');
const Category = require('./models/Category');
const Fish = require('./models/Fish');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedData = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Category.deleteMany({});
    await Fish.deleteMany({});
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
        username: 'Admin',
        email: 'admin@aquastore.com',
        password: adminPassword,
        role: 'admin',
        address: 'Colombo, Sri Lanka',
        phone: '077-1234567'
    });

    const gouramiCat = await Category.create({ 
        name: 'Gourami', 
        image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400' 
    });
    const tetraCat = await Category.create({ 
        name: 'Tetra', 
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400' 
    });
    const rasboraCat = await Category.create({ 
        name: 'Rasboras', 
        image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400' 
    });

    await Fish.create([
        {
            category: gouramiCat._id,
            name: 'Pearl Gourami',
            imageUrl: 'https://images.unsplash.com/photo-1615934555811-92b4504c53c4?w=500',
            description: 'Peaceful, community tank fish.',
            size: '4-5 inches',
            stock: 12,
            thresholdAlert: 3,
            priceLKR: 450,
            pricingType: 'one piece'
        },
        {
            category: gouramiCat._id,
            name: 'Honey Gourami',
            imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a02?w=500',
            description: 'Very peaceful, a bit timid.',
            size: '2 inches',
            stock: 2,
            thresholdAlert: 4,
            priceLKR: 700,
            pricingType: 'pair'
        },
        {
            category: tetraCat._id,
            name: 'Neon Tetra',
            imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
            description: 'Peaceful schooling fish.',
            size: '1.5 inches',
            stock: 20,
            thresholdAlert: 5,
            priceLKR: 300,
            pricingType: 'one piece'
        },
        {
            category: rasboraCat._id,
            name: 'Harlequin Rasbora',
            imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500',
            description: 'Peaceful, active swimmer.',
            size: '2 inches',
            stock: 10,
            thresholdAlert: 3,
            priceLKR: 400,
            pricingType: 'one piece'
        }
    ]);

    console.log('✅ Demo data inserted successfully!');
    console.log('📧 Admin: admin@aquastore.com');
    console.log('🔑 Password: admin123');
    process.exit();
};

seedData();
