const User = require("../models/User");
const Generation = require("../models/Generation");
const bcrypt = require("bcryptjs");

// Helper to check admin
const isAdmin = (req) => req.user.role === "admin";

exports.stats = async (req, res, next) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
        const totalUsers = await User.countDocuments();
        const totalGenerations = await Generation.countDocuments();
        const perUser = await Generation.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);
        res.json({ totalUsers, totalGenerations, perUser });
    } catch (err) {
        next(err);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
        const users = await User.find().select("-passwordHash");
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.addUser = async (req, res, next) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
        const { email, password, name, role, quota } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash: hash, name, role: role || "free", quota: quota || 5 });

        user.passwordHash = undefined;
        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
        const { email, name, role, quota } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { email, name, role, quota },
            { new: true }
        ).select("-passwordHash");

        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
        const { password } = req.body;

        const hash = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.params.id, { passwordHash: hash });

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (err) {
        next(err);
    }
};