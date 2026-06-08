const { Transaction, Customer, AuditLog } = require('../models');
const { validateInput } = require('../utils/regexPatterns');

const createTransaction = async (req, res) => {
    try {
        const {
            amount,
            currency,
            provider = 'SWIFT',
            beneficiaryName,
            beneficiaryAccount,
            swiftCode
        } = req.body;
        
        if (!validateInput(amount.toString(), 'amount') ||
            !validateInput(currency, 'currency') ||
            !validateInput(beneficiaryName, 'beneficiaryName') ||
            !validateInput(beneficiaryAccount, 'beneficiaryAccount') ||
            !validateInput(swiftCode, 'swiftCode')) {
            return res.status(400).json({ message: 'Invalid payment information format.' });
        }
        
        const transaction = await Transaction.create({
            customer_id: req.user.userId,
            amount: parseFloat(amount),
            currency: currency.toUpperCase(),
            provider,
            beneficiary_name: beneficiaryName,
            beneficiary_account: beneficiaryAccount,
            swift_code: swiftCode.toUpperCase(),
            status: 'Pending'
        });
        
        await AuditLog.create({
            action: 'PAYMENT_CREATED',
            user_id: req.user.userId,
            user_type: 'customer',
            details: `Payment of ${amount} ${currency} created. Transaction ID: ${transaction.transaction_id}`,
            ip_address: req.ip
        });
        
        res.status(201).json({ message: 'Payment submitted successfully. Awaiting verification.' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating payment.' });
    }
};

const getCustomerTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { customer_id: req.user.userId },
            order: [['created_at', 'DESC']],
            attributes: ['transaction_id', 'amount', 'currency', 'provider', 'beneficiary_name', 'status', 'created_at']
        });
        
        res.json(transactions);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching transactions.' });
    }
};

const getPendingTransactions = async (req, res) => {
    try {
        if (req.user.userType !== 'employee') {
            return res.status(403).json({ message: 'Unauthorized.' });
        }
        
        const transactions = await Transaction.findAll({
            where: { status: 'Pending', submitted_to_swift: false },
            include: [{
                model: Customer,
                attributes: ['full_name', 'account_number']
            }],
            order: [['created_at', 'ASC']]
        });
        
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
        
        res.json(formattedTransactions);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching pending transactions.' });
    }
};

const verifyTransaction = async (req, res) => {
    try {
        const { transactionId, action } = req.body;
        
        if (req.user.userType !== 'employee') {
            return res.status(403).json({ message: 'Unauthorized.' });
        }
        
        const newStatus = action === 'approve' ? 'Verified' : 'Rejected';
        
        await Transaction.update({
            status: newStatus,
            employee_verified_by: req.user.userId,
            verified_at: new Date()
        }, {
            where: { transaction_id: transactionId, status: 'Pending' }
        });
        
        await AuditLog.create({
            action: `PAYMENT_${action.toUpperCase()}`,
            user_id: req.user.userId,
            user_type: 'employee',
            details: `Transaction ${transactionId} ${action}d`,
            ip_address: req.ip
        });
        
        res.json({ message: `Transaction ${action}d successfully.` });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verifying transaction.' });
    }
};

const submitToSwift = async (req, res) => {
    try {
        if (req.user.userType !== 'employee') {
            return res.status(403).json({ message: 'Unauthorized.' });
        }
        
        await Transaction.update({
            submitted_to_swift: true,
            status: 'Submitted'
        }, {
            where: { status: 'Verified', submitted_to_swift: false }
        });
        
        await AuditLog.create({
            action: 'SUBMIT_TO_SWIFT',
            user_id: req.user.userId,
            user_type: 'employee',
            details: 'All verified transactions submitted to SWIFT',
            ip_address: req.ip
        });
        
        res.json({ message: 'Transactions submitted to SWIFT successfully.' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error submitting to SWIFT.' });
    }
};

module.exports = {
    createTransaction,
    getCustomerTransactions,
    getPendingTransactions,
    verifyTransaction,
    submitToSwift
};