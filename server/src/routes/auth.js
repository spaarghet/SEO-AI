const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const auth = require('../middleware/auth');
router.get('/me', auth, me);
router.post('/login', login);
module.exports = router;