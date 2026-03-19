const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, try again later." }
});