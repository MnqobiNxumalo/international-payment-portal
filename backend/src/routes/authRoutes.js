const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { validateRegistration, checkValidation } = require('../middleware/inputValidator');
const { loginLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', validateRegistration, checkValidation, authController.registerCustomer);

// POST /api/auth/login/customer
router.post('/login/customer', loginLimiter, authController.loginCustomer);

// POST /api/auth/login/employee
router.post('/login/employee', loginLimiter, authController.loginEmployee);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;