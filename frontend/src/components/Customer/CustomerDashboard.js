import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../services/api';
import PaymentForm from './PaymentForm';
import Navbar from '../common/Navbar';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData || userData === 'undefined') {
            navigate('/login');
            return;
        }
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (e) {
            console.error('Failed to parse user:', e);
            navigate('/login');
            return;
        }
        loadTransactions();
    }, [navigate]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionService.getMyTransactions();
            setTransactions(response.data || []);
        } catch (err) {
            console.error('Load transactions error:', err);
            setError('Failed to load transaction history.');
        } finally {
            setLoading(false);
        }
    };

    const containerStyles = {
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
    };

    const contentStyles = {
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
    };

    const titleStyles = {
        marginBottom: '20px',
        color: '#333'
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

    const statusStyles = (status) => ({
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: status === 'Pending' ? '#fff3cd' : status === 'Verified' ? '#d4edda' : '#f8d7da',
        color: status === 'Pending' ? '#856404' : status === 'Verified' ? '#155724' : '#721c24'
    });

    return (
        <div style={containerStyles}>
            <Navbar user={user} />
            <div style={contentStyles}>
                <h2 style={titleStyles}>Welcome, {user?.username}!</h2>
                
                <PaymentForm onSuccess={loadTransactions} />
                
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '15px' }}>Transaction History</h3>
                    
                    {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No transactions yet. Make your first payment above!</div>
                    ) : (
                        <table style={tableStyles}>
                            <thead>
                                <tr>
                                    <th style={thStyles}>Date</th>
                                    <th style={thStyles}>Amount</th>
                                    <th style={thStyles}>Currency</th>
                                    <th style={thStyles}>Beneficiary</th>
                                    <th style={thStyles}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.transaction_id}>
                                        <td style={tdStyles}>{new Date(tx.created_at).toLocaleString()}</td>
                                        <td style={tdStyles}>{tx.amount}</td>
                                        <td style={tdStyles}>{tx.currency}</td>
                                        <td style={tdStyles}>{tx.beneficiary_name}</td>
                                        <td style={tdStyles}>
                                            <span style={statusStyles(tx.status)}>{tx.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;

