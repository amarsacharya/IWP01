const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(async () => {
    // Seed default Admin if it doesn't exist
    try {
        const User = require('./models/User');
        const adminExists = await User.findOne({ email: 'admin@parixa.com' });
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'admin@parixa.com',
                password: 'admin',
                role: 'admin'
            });
            console.log('Default Admin Account seeded to database');
        }
    } catch (err) {
        console.error('Error seeding admin account:', err);
    }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main App Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Secure Server running on port ${PORT}`));
