import React, { useState } from 'react';

const VALIDATION_PATTERNS = {
    fullName: /^[A-Za-z\s]{2,100}$/,
    idNumber: /^[0-9]{13}$/,
    accountNumber: /^[0-9]{10,20}$/,
    username: /^[A-Za-z0-9_]{3,50}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    amount: /^\d+(\.\d{1,2})?$/,
    currency: /^[A-Z]{3}$/,
    swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    beneficiaryName: /^[A-Za-z\s\.]{2,100}$/
};

const ERROR_MESSAGES = {
    fullName: 'Full name must contain only letters and spaces (2-100 characters)',
    idNumber: 'ID number must be exactly 13 digits',
    accountNumber: 'Account number must be 10-20 digits',
    username: 'Username must be 3-50 characters (letters, numbers, underscore)',
    password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    amount: 'Enter a valid amount (e.g., 100.00)',
    currency: 'Enter a 3-letter currency code (USD, EUR, ZAR)',
    swiftCode: 'Enter a valid SWIFT/BIC code (8 or 11 characters)',
    beneficiaryName: 'Beneficiary name must contain only letters, spaces, and dots'
};

const InputWithValidation = ({
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = true,
    patternName,
    step
}) => {
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    const validate = (inputValue) => {
        if (required && !inputValue) {
            setError(placeholder + ' is required');
            return false;
        }
        
        if (patternName && VALIDATION_PATTERNS[patternName] && inputValue) {
            if (!VALIDATION_PATTERNS[patternName].test(inputValue)) {
                setError(ERROR_MESSAGES[patternName] || 'Invalid format');
                return false;
            }
        }
        
        setError('');
        return true;
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
        if (touched) {
            validate(newValue);
        }
    };

    const handleBlur = () => {
        setTouched(true);
        validate(value);
    };

    const inputStyles = {
        width: '100%',
        padding: '10px',
        border: error ? '1px solid #dc3545' : '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none'
    };

    const labelStyles = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '500',
        color: '#333'
    };

    const errorStyles = {
        color: '#dc3545',
        fontSize: '12px',
        marginTop: '5px',
        display: 'block'
    };

    return (
        <div style={{ marginBottom: '15px' }}>
            <label htmlFor={name} style={labelStyles}>
                {placeholder}:
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                style={inputStyles}
                step={step}
            />
            {error && <span style={errorStyles}>{error}</span>}
        </div>
    );
};

export default InputWithValidation;