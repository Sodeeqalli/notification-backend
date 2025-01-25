const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserDetails, updateUserProfile } = require('../controllers/UserController');
const authenticate = require('../middlewares/Authenticate');

// User Registration Route
router.post('/register', registerUser);

// User Login Route
router.post('/login', loginUser);

// Get User Details (Protected Route)
router.get('/me', authenticate, getUserDetails);

// Update User Profile (Only name can be updated)
router.put('/me', authenticate, updateUserProfile);

module.exports = router;
