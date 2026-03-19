const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "User already exists" });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash: hash, name, role: "free", quota: 5 });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
        res.json({ token, user: { id: user._id, email: user.email, quota: user.quota, used: user.used, role: user.role } });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
        res.json({ token, user: { id: user._id, email: user.email, quota: user.quota, used: user.used, role: user.role } });
    } catch (err) {
        next(err);
    }
};

exports.me = async (req, res, next) => {
    try {
        const u = req.user;
        res.json({ user: { id: u._id, email: u.email, quota: u.quota, used: u.used, role: u.role } });
    } catch (err) {
        next(err);
    }
};