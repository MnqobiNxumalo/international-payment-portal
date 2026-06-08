import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (onLogout) onLogout();
        navigate('/login');
    };

    const navbarStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        backgroundColor: '#2c3e50',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };

    const logoStyles = {
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        textDecoration: 'none'
    };

    const navLinksStyles = {
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    };

    const linkStyles = {
        color: 'white',
        textDecoration: 'none',
        padding: '8px 15px',
        borderRadius: '4px'
    };

    const userInfoStyles = {
        marginRight: '15px',
        fontSize: '14px'
    };

    const logoutButtonStyles = {
        backgroundColor: '#e74c3c',
        border: 'none',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    return (
        <nav style={navbarStyles}>
            <Link to={user?.type === 'customer' ? '/dashboard' : '/employee/queue'} style={logoStyles}>
                💱 International Payments Portal
            </Link>
            <div style={navLinksStyles}>
                {user && (
                    <>
                        <span style={userInfoStyles}>
                            Welcome, {user.username || user.employeeNumber}
                        </span>
                        {user.type === 'customer' && (
                            <Link to="/dashboard" style={linkStyles}>Dashboard</Link>
                        )}
                        {user.type === 'employee' && (
                            <Link to="/employee/queue" style={linkStyles}>Transaction Queue</Link>
                        )}
                        <button onClick={handleLogout} style={logoutButtonStyles}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;