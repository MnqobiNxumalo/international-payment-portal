import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import InputWithValidation from '../common/InputWithValidation';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        accountNumber: '',
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await authService.register(formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        maxWidth: '450px'
    };

    const titleStyles = {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
    };

    const buttonStyles = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer'
    };

    return (
        <div style={containerStyles}>
            <div style={cardStyles}>
                <h2 style={titleStyles}>Customer Registration</h2>
                <form onSubmit={handleSubmit}>
                    <InputWithValidation
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(val) => handleChange('fullName', val)}
                        placeholder="Full Name"
                        patternName="fullName"
                    />
                    <InputWithValidation
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={(val) => handleChange('idNumber', val)}
                        placeholder="ID Number (13 digits)"
                        patternName="idNumber"
                    />
                    <InputWithValidation
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={(val) => handleChange('accountNumber', val)}
                        placeholder="Account Number"
                        patternName="accountNumber"
                    />
                    <InputWithValidation
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={(val) => handleChange('username', val)}
                        placeholder="Username"
                        patternName="username"
                    />
                    <InputWithValidation
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(val) => handleChange('password', val)}
                        placeholder="Password"
                        patternName="password"
                    />
                    
                    {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
                    {success && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}
                    
                    <button type="submit" disabled={loading} style={buttonStyles}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;