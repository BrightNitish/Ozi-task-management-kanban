const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// THIS LINE IS CRITICAL:
module.exports = router;