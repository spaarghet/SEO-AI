const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// simple user endpoint for updating role/quota (admin would normally do)
router.get("/me", auth, (req, res) => {
    const u = req.user;
    res.json({ user: { id: u._id, email: u.email, role: u.role, quota: u.quota, used: u.used } });
});

module.exports = router;