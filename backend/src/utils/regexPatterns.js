// Simplified regex patterns for development
const REGEX_PATTERNS = {
    // Customer registration fields - made less strict
    fullName: /^[A-Za-z\s]{2,100}$/,
    idNumber: /^[0-9]{13}$/,
    accountNumber: /^[0-9]{10,20}$/,
    username: /^[A-Za-z0-9_]{3,50}$/,
    password: /^.{8,}$/,  // Just requires 8+ characters for now
    
    // Payment fields
    amount: /^\d+(\.\d{1,2})?$/,
    currency: /^[A-Z]{3}$/,
    swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    beneficiaryName: /^[A-Za-z\s\.]{2,100}$/,
    beneficiaryAccount: /^[0-9A-Za-z]{5,50}$/,
    
    // Employee fields
    employeeNumber: /^EMP[0-9]{3,10}$/i
};

function validateInput(value, patternName) {
    const pattern = REGEX_PATTERNS[patternName];
    if (!pattern) return true; // Skip validation if pattern doesn't exist
    if (!value) return false;
    return pattern.test(String(value));
}

function sanitizeInput(value, type) {
    if (!value) return '';
    return String(value).trim();
}

module.exports = { REGEX_PATTERNS, validateInput, sanitizeInput };