const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:4000",
            process.env.CLIENT_URL
        ],
        credentials: true,
    })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;