const BaseController = require('./BaseController');
const { Transaction, Customer, AuditLog } = require('../models');
const { validateInput } = require('../utils/regexPatterns');

class TransactionController extends BaseController {
    constructor() {
        super();
        this.createTransaction = this.createTransaction.bind(this);
        this.getCustomerTransactions = this.getCustomerTransactions.bind(this);
        this.getPendingTransactions = this.getPendingTransactions.bind(this);
        this.verifyTransaction = this.verifyTransaction.bind(this);
        this.submitToSwift = this.submitToSwift.bind(this);
    }

    /**
     * Create a new payment transaction
     * @route POST /api/transactions/create
     */
    async createTransaction(req, res) {
        try {
            const {
                amount,
                currency,
                provider = 'SWIFT',
                beneficiaryName,
                beneficiaryAccount,
                swiftCode
            } = req.body;

            // Validate all inputs against whitelist regex
            if (!validateInput(amount.toString(), 'amount') ||
                !validateInput(currency, 'currency') ||
                !validateInput(beneficiaryName, 'beneficiaryName') ||
                !validateInput(beneficiaryAccount, 'beneficiaryAccount') ||
                !validateInput(swiftCode, 'swiftCode')) {
                return this.error(res, new Error('Invalid input'), 'Invalid payment information format', 400);
            }

            const customerId = req.user.userId;

            // Create transaction
            const transaction = await Transaction.create({
                customer_id: customerId,
                amount: parseFloat(amount),
                currency: currency.toUpperCase(),
                provider,
                beneficiary_name: beneficiaryName,
                beneficiary_account: beneficiaryAccount,
                swift_code: swiftCode.toUpperCase(),
                status: 'Pending'
            });

            // Log audit trail
            await AuditLog.create({
                action: 'PAYMENT_CREATED',
                user_id: customerId,
                user_type: 'customer',
                details: `Payment of ${amount} ${currency} created. Transaction ID: ${transaction.transaction_id}`,
                ip_address: req.ip
            });

            return this.success(res, {
                transactionId: transaction.transaction_id,
                status: transaction.status
            }, 'Payment submitted successfully. Awaiting verification.', 201);

        } catch (error) {
            return this.error(res, error, 'Server error creating payment');
        }
    }

    /**
     * Get customer's transaction history
     * @route GET /api/transactions/my-transactions
     */
    async getCustomerTransactions(req, res) {
        try {
            const customerId = req.user.userId;

            const transactions = await Transaction.findAll({
                where: { customer_id: customerId },
                order: [['created_at', 'DESC']],
                attributes: ['transaction_id', 'amount', 'currency', 'provider', 'beneficiary_name', 'status', 'created_at']
            });

            return this.success(res, transactions, 'Transactions retrieved successfully');

        } catch (error) {
            return this.error(res, error, 'Server error fetching transactions');
        }
    }

    /**
     * Get pending transactions (Employee only)
     * @route GET /api/transactions/pending
     */
    async getPendingTransactions(req, res) {
        try {
            // Role check
            if (req.user.userType !== 'employee') {
                return this.error(res, new Error('Unauthorized'), 'Unauthorized access', 403);
            }

            const transactions = await Transaction.findAll({
                where: { 
                    status: 'Pending', 
                    submitted_to_swift: false 
                },
                include: [{
                    model: Customer,
                    attributes: ['full_name', 'account_number']
                }],
                order: [['created_at', 'ASC']]
            });

            // Format response
            const formattedTransactions = transactions.map(t => ({
                TransactionID: t.transaction_id,
                CreatedAt: t.created_at,
                FullName: t.Customer?.full_name,
                AccountNumber: t.Customer?.account_number,
                Amount: t.amount,
                Currency: t.currency,
                BeneficiaryName: t.beneficiary_name,
                BeneficiaryAccount: t.beneficiary_account,
                SwiftCode: t.swift_code
            }));

            return this.success(res, formattedTransactions, 'Pending transactions retrieved');

        } catch (error) {
            return this.error(res, error, 'Server error fetching pending transactions');
        }
    }

    /**
     * Verify or reject a transaction (Employee only)
     * @route POST /api/transactions/verify
     */
    async verifyTransaction(req, res) {
        try {
            const { transactionId, action } = req.body;

            if (req.user.userType !== 'employee') {
                return this.error(res, new Error('Unauthorized'), 'Unauthorized access', 403);
            }

            if (!['approve', 'reject'].includes(action)) {
                return this.error(res, new Error('Invalid action'), 'Action must be approve or reject', 400);
            }

            const newStatus = action === 'approve' ? 'Verified' : 'Rejected';

            // Find and verify the transaction
            const transaction = await Transaction.findOne({
                where: { 
                    transaction_id: transactionId, 
                    status: 'Pending' 
                }
            });

            if (!transaction) {
                return this.error(res, new Error('Transaction not found'), 'Transaction not found or already verified', 404);
            }

            // Update transaction
            await transaction.update({
                status: newStatus,
                employee_verified_by: req.user.userId,
                verified_at: new Date()
            });

            // Log verification
            await AuditLog.create({
                action: `PAYMENT_${action.toUpperCase()}`,
                user_id: req.user.userId,
                user_type: 'employee',
                details: `Transaction ${transactionId} ${action}d. Amount: ${transaction.amount} ${transaction.currency}`,
                ip_address: req.ip
            });

            return this.success(res, {
                transactionId,
                status: newStatus,
                action
            }, `Transaction ${action}d successfully`);

        } catch (error) {
            return this.error(res, error, 'Server error verifying transaction');
        }
    }

    // Get all transactions (for employee reporting)
async getAllTransactions(req, res) {
    try {
        if (req.user.userType !== 'employee') {
            return this.error(res, 'Unauthorized', 403);
        }
        
        const transactions = await Transaction.findAll({
            include: [{
                model: Customer,
                attributes: ['full_name', 'account_number', 'username']
            }],
            order: [['created_at', 'DESC']]
        });
        
        return this.success(res, transactions, 'All transactions retrieved');
    } catch (error) {
        return this.error(res, error, 'Server error');
    }
}

    /**
     * Submit verified transactions to SWIFT (Employee only)
     * @route POST /api/transactions/submit-to-swift
     */
    async submitToSwift(req, res) {
        try {
            if (req.user.userType !== 'employee') {
                return this.error(res, new Error('Unauthorized'), 'Unauthorized access', 403);
            }

            // Find all verified transactions not yet submitted
            const verifiedTransactions = await Transaction.findAll({
                where: { 
                    status: 'Verified', 
                    submitted_to_swift: false 
                }
            });

            if (verifiedTransactions.length === 0) {
                return this.error(res, new Error('No transactions'), 'No verified transactions to submit', 400);
            }

            // Update all to submitted
            const [updatedCount] = await Transaction.update({
                submitted_to_swift: true,
                status: 'Submitted'
            }, {
                where: { 
                    status: 'Verified', 
                    submitted_to_swift: false 
                }
            });

            // Log submission
            await AuditLog.create({
                action: 'SUBMIT_TO_SWIFT',
                user_id: req.user.userId,
                user_type: 'employee',
                details: `${updatedCount} verified transactions submitted to SWIFT`,
                ip_address: req.ip
            });

            return this.success(res, {
                submittedCount: updatedCount,
                transactions: verifiedTransactions.map(t => t.transaction_id)
            }, `${updatedCount} transactions submitted to SWIFT successfully`);

        } catch (error) {
            return this.error(res, error, 'Server error submitting to SWIFT');
        }
    }
}

module.exports = new TransactionController();