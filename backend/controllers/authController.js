const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup
exports.signup = async (req, res) => {
    try {
        const { username, email, password, address, phone, role } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({ 
            username: username || email.split('@')[0],
            email, 
            password, 
            address: address || '',
            phone: phone || '',
            role: role || 'customer' 
        });
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();
        
        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email, 
                role: user.role, 
                address: user.address,
                phone: user.phone
            } 
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email, 
                role: user.role, 
                address: user.address,
                phone: user.phone
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};