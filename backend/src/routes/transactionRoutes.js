const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/TransactionController');
const { verifyToken, requireEmployee } = require('../middleware/auth');
const { validatePayment, checkValidation } = require('../middleware/inputValidator');
const { paymentLimiter } = require('../middleware/rateLimiter');

// POST /api/transactions/create - Customer creates payment
router.post('/create', verifyToken, validatePayment, checkValidation, paymentLimiter, transactionController.createTransaction);

// GET /api/transactions/my-transactions - Customer views history
router.get('/my-transactions', verifyToken, transactionController.getCustomerTransactions);

// GET /api/transactions/pending - Employee views pending (requires employee auth)
router.get('/pending', verifyToken, requireEmployee, transactionController.getPendingTransactions);

// POST /api/transactions/verify - Employee verifies/rejects
router.post('/verify', verifyToken, requireEmployee, transactionController.verifyTransaction);

// POST /api/transactions/submit-to-swift - Employee submits to SWIFT
router.post('/submit-to-swift', verifyToken, requireEmployee, transactionController.submitToSwift);

// GET /api/transactions/all - Employee views all transactions
router.get('/all', verifyToken, requireEmployee, transactionController.getAllTransactions);

module.exports = router;