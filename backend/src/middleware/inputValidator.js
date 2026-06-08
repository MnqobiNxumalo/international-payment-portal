const { body, validationResult } = require('express-validator');
const { REGEX_PATTERNS } = require('../utils/regexPatterns');

const validateRegistration = [
    body('fullName')
        .matches(REGEX_PATTERNS.fullName)
        .withMessage('Full name must contain only letters and spaces (2-100 characters)'),
    body('idNumber')
        .matches(REGEX_PATTERNS.idNumber)
        .withMessage('ID number must be exactly 13 digits'),
    body('accountNumber')
        .matches(REGEX_PATTERNS.accountNumber)
        .withMessage('Account number must be 10-20 digits'),
    body('username')
        .matches(REGEX_PATTERNS.username)
        .withMessage('Username must be 3-50 characters (letters, numbers, underscore)'),
    body('password')
        .matches(REGEX_PATTERNS.password)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
];

const validatePayment = [
    body('amount')
        .matches(REGEX_PATTERNS.amount)
        .withMessage('Amount must be a valid number with up to 2 decimal places')
        .custom(value => parseFloat(value) > 0)
        .withMessage('Amount must be greater than 0'),
    body('currency')
        .matches(REGEX_PATTERNS.currency)
        .withMessage('Currency must be a 3-letter code (e.g., USD, EUR, ZAR)'),
    body('swiftCode')
        .matches(REGEX_PATTERNS.swiftCode)
        .withMessage('Invalid SWIFT code format'),
    body('beneficiaryName')
        .matches(REGEX_PATTERNS.beneficiaryName)
        .withMessage('Beneficiary name must contain only letters, spaces, and dots'),
    body('beneficiaryAccount')
        .matches(REGEX_PATTERNS.beneficiaryAccount)
        .withMessage('Invalid account number format')
];

const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateRegistration, validatePayment, checkValidation };