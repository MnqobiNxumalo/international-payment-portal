import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        accountNumber: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const result = await authService.customerLogin(formData);
        console.log('Login result:', result);
        
        // Check if token was stored
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('Final check - Token:', token ? 'Yes' : 'No');
        console.log('Final check - User:', user);
        
        if (token && user) {
            // Navigate directly without success message
            navigate('/dashboard');
        } else {
            setError('Login failed: Could not save session');
        }
    } catch (err) {
        console.error('Login error:', err);
        setError(err.message || 'Login failed. Invalid credentials.');
    } finally {
        setLoading(false);
    }
};

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        },
        card: {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px'
        },
        title: {
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333'
        },
        inputGroup: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
        },
        buttonDisabled: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed'
        },
        errorMsg: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
        },
        successMsg: {
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
        },
        link: {
            textAlign: 'center',
            marginTop: '15px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Customer Login</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Account Number:</label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    
                    {error && <div style={styles.errorMsg}>{error}</div>}
                    {success && <div style={styles.successMsg}>{success}</div>}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div style={styles.link}>
                    <Link to="/register">New customer? Register here</Link>
                    <br />
                    <Link to="/employee/login">Employee login</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;