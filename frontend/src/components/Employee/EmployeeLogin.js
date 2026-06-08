import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import InputWithValidation from '../common/InputWithValidation';

const EmployeeLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        employeeNumber: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const response = await authService.employeeLogin(formData);
        console.log('Employee login successful, response:', response);
        
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('Stored token:', token ? 'Yes' : 'No');
        console.log('Stored user:', user);
        
        if (token && user) {
            navigate('/employee/queue');
        } else {
            setError('Login failed: Missing token or user data');
        }
    } catch (err) {
        console.error('Employee login error:', err);
        setError(err.message || 'Login failed. Invalid employee credentials.');
    } finally {
        setLoading(false);
    }
};

    const containerStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    };

    const cardStyles = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    };

    const titleStyles = {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
    };

    const buttonStyles = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer'
    };

    return (
        <div style={containerStyles}>
            <div style={cardStyles}>
                <h2 style={titleStyles}>Employee Login</h2>
                <form onSubmit={handleSubmit}>
                    <InputWithValidation
                        type="text"
                        name="employeeNumber"
                        value={formData.employeeNumber}
                        onChange={(val) => handleChange('employeeNumber', val)}
                        placeholder="Employee Number (e.g., EMP001)"
                        patternName="employeeNumber"
                    />
                    <InputWithValidation
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(val) => handleChange('password', val)}
                        placeholder="Password"
                    />
                    
                    {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                    
                    <button type="submit" disabled={loading} style={buttonStyles}>
                        {loading ? 'Logging in...' : 'Employee Login'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <Link to="/login">Customer login</Link>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;