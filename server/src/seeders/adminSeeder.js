require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seedAdmin() {
    try {
        await connectDB();

        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin@123";

        // Check if admin exists
        const exists = await User.findOne({ email: adminEmail });
        if (exists) {
            console.log("Admin user already exists. Skipping seeding.");
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await User.create({
            email: adminEmail,
            passwordHash: passwordHash,
            name: "Master Admin",
            role: "admin",
            quota: 9999, // High quota for admin
            used: 0
        });

        console.log(`Successfully seeded Admin: ${adminEmail}`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding admin:", err.message);
        process.exit(1);
    }
}

seedAdmin();