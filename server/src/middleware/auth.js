const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        let token;

        // 1. Try to get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        // 2. Fallback: Try to get the token from the URL query (For EventSource/SSE)
        else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) return res.status(401).json({ error: "No token provided" });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ error: "Invalid token user" });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};