const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Route: POST /api/auth/login
// Desc : Authenticate user & get secure JWT token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });

        // If user and password match the database's hashed password
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during login' });
    }
});

// Route: PUT /api/auth/change-password
// Desc : User can change their own password to something secure
router.put('/change-password', async (req, res) => {
    try {
        // Assume req.user comes from our future authMiddleware checking the JWT
        const { userId, oldPassword, newPassword } = req.body; // Currently relying on body since middleware isn't written yet

        const user = await User.findById(userId);
        
        if (user && (await user.matchPassword(oldPassword))) {
            // Because of our Mongoose pre-save hook, it will automatically
            // hash this new raw password during the save event
            user.password = newPassword;
            user.hasChangedPassword = true;
            await user.save();
            
            res.json({ message: 'Password updated successfully!' });
        } else {
            res.status(401).json({ message: 'Invalid old password or user not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error changing password' });
    }
});

module.exports = router;
