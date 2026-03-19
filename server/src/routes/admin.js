const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.get("/stats", auth, adminController.stats);

router.get("/users", auth, adminController.getUsers);
router.post("/users", auth, adminController.addUser);
router.put("/users/:id", auth, adminController.updateUser);
router.put("/users/:id/password", auth, adminController.changePassword);
router.delete("/users/:id", auth, adminController.deleteUser);

module.exports = router;