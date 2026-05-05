const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { signup, login, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post(
  '/signup',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
    body('email').isEmail().withMessage('Valid email required'),
    body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male/Female/Other'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  ],
  signup
);

router.post('/login', login);
router.post('/logout', protect, logout);

module.exports = router;
