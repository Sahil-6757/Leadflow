const express = require('express');
const {
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/', createUser);
router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;
