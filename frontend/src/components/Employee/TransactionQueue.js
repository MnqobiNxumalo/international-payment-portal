import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../services/api';
import Navbar from '../common/Navbar';

const TransactionQueue = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || userData === 'undefined') {
        navigate('/login');
        return;
    }
    try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.type !== 'employee') {
            navigate('/dashboard');
            return;
        }
        setUser(parsedUser);
    } catch (e) {
        console.error('Failed to parse user:', e);
        navigate('/login');
        return;
    }
    loadPendingTransactions();
    
    const interval = setInterval(loadPendingTransactions, 30000);
    return () => clearInterval(interval);
}, [navigate]);

    const loadPendingTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionService.getPending();
            setTransactions(response.data);
        } catch (err) {
            setError('Failed to load pending transactions.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (transactionId, action) => {
        try {
            await transactionService.verify(transactionId, action);
            loadPendingTransactions();
        } catch (err) {
            alert('Failed to ' + action + ' transaction.');
        }
    };

    const handleSubmitToSwift = async () => {
        if (!window.confirm('Submit all verified transactions to SWIFT?')) return;
        
        setSubmitting(true);
        try {
            await transactionService.submitToSwift();
            alert('Transactions submitted to SWIFT successfully.');
            loadPendingTransactions();
        } catch (err) {
            alert('Failed to submit to SWIFT.');
        } finally {
            setSubmitting(false);
        }
    };

    const containerStyles = {
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
    };

    const contentStyles = {
        padding: '30px',
        maxWidth: '1400px',
        margin: '0 auto'
    };

    const headerStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    };

    const titleStyles = {
        color: '#333'
    };

    const submitButtonStyles = {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    };

    const tableStyles = {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden'
    };

    const thStyles = {
        padding: '12px',
        textAlign: 'left',
        backgroundColor: '#2c3e50',
        color: 'white',
        fontWeight: '600'
    };

    const tdStyles = {
        padding: '12px',
        borderBottom: '1px solid #ddd'
    };

    const verifyButtonStyles = {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        marginRight: '5px'
    };

    const rejectButtonStyles = {
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer'
    };

    return (
        <div style={containerStyles}>
            <Navbar user={user} />
            <div style={contentStyles}>
                <div style={headerStyles}>
                    <h2 style={titleStyles}>Transaction Verification Queue</h2>
                    <button 
                        onClick={handleSubmitToSwift} 
                        disabled={submitting}
                        style={submitButtonStyles}
                    >
                        {submitting ? 'Submitting...' : 'Submit to SWIFT'}
                    </button>
                </div>
                
                {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading pending transactions...</div>
                ) : transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666', backgroundColor: 'white', borderRadius: '8px' }}>
                        No pending transactions to verify.
                    </div>
                ) : (
                    <table style={tableStyles}>
                        <thead>
                            <tr>
                                <th style={thStyles}>Date</th>
                                <th style={thStyles}>Customer</th>
                                <th style={thStyles}>Account</th>
                                <th style={thStyles}>Amount</th>
                                <th style={thStyles}>Currency</th>
                                <th style={thStyles}>Beneficiary</th>
                                <th style={thStyles}>SWIFT Code</th>
                                <th style={thStyles}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.TransactionID}>
                                    <td style={tdStyles}>{new Date(tx.CreatedAt).toLocaleString()}</td>
                                    <td style={tdStyles}>{tx.FullName}</td>
                                    <td style={tdStyles}>{tx.AccountNumber}</td>
                                    <td style={tdStyles}>{tx.Amount}</td>
                                    <td style={tdStyles}>{tx.Currency}</td>
                                    <td style={tdStyles}>
                                        {tx.BeneficiaryName}
                                        <br />
                                        <small>{tx.BeneficiaryAccount}</small>
                                    </td>
                                    <td style={tdStyles}>{tx.SwiftCode}</td>
                                    <td style={tdStyles}>
                                        <button 
                                            onClick={() => handleVerify(tx.TransactionID, 'approve')} 
                                            style={verifyButtonStyles}
                                        >
                                            Verified
                                        </button>
                                        <button 
                                            onClick={() => handleVerify(tx.TransactionID, 'reject')} 
                                            style={rejectButtonStyles}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TransactionQueue;