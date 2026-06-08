import React, { useState } from 'react';
import { transactionService } from '../../services/api';
import InputWithValidation from '../common/InputWithValidation';

const PaymentForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        beneficiaryName: '',
        beneficiaryAccount: '',
        swiftCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const currencies = ['USD', 'EUR', 'GBP', 'ZAR', 'CAD', 'AUD', 'JPY', 'CHF'];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await transactionService.create(formData);
            setSuccess('Payment submitted successfully! Awaiting employee verification.');
            setFormData({ 
                amount: '', 
                currency: 'USD', 
                beneficiaryName: '', 
                beneficiaryAccount: '', 
                swiftCode: '' 
            });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Payment submission failed.');
        } finally {
            setLoading(false);
        }
    };

    const containerStyles = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    };

    const titleStyles = {
        marginBottom: '20px',
        color: '#333',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
    };

    const formRowStyles = {
        display: 'flex',
        gap: '15px'
    };

    const formRowItemStyles = {
        flex: 1
    };

    const selectStyles = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const labelStyles = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '500',
        color: '#333'
    };

    const buttonStyles = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px'
    };

    return (
        <div style={containerStyles}>
            <h3 style={titleStyles}>Make International Payment</h3>
            <form onSubmit={handleSubmit}>
                <div style={formRowStyles}>
                    <div style={formRowItemStyles}>
                        <InputWithValidation
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={(val) => handleChange('amount', val)}
                            placeholder="Amount"
                            patternName="amount"
                            step="0.01"
                        />
                    </div>
                    <div style={formRowItemStyles}>
                        <label style={labelStyles}>Currency:</label>
                        <select
                            value={formData.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            style={selectStyles}
                        >
                            {currencies.map(curr => (
                                <option key={curr} value={curr}>{curr}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <InputWithValidation
                    type="text"
                    name="beneficiaryName"
                    value={formData.beneficiaryName}
                    onChange={(val) => handleChange('beneficiaryName', val)}
                    placeholder="Beneficiary Name"
                    patternName="beneficiaryName"
                />
                
                <InputWithValidation
                    type="text"
                    name="beneficiaryAccount"
                    value={formData.beneficiaryAccount}
                    onChange={(val) => handleChange('beneficiaryAccount', val)}
                    placeholder="Beneficiary Account Number"
                    patternName="accountNumber"
                />
                
                <InputWithValidation
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={(val) => handleChange('swiftCode', val)}
                    placeholder="SWIFT/BIC Code"
                    patternName="swiftCode"
                />
                
                {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                {success && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}
                
                <button type="submit" disabled={loading} style={buttonStyles}>
                    {loading ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;