import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredType }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('PrivateRoute check - token:', token ? 'exists' : 'missing');
    console.log('PrivateRoute check - userStr:', userStr);
    
    let user = null;
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
            user = JSON.parse(userStr);
            console.log('PrivateRoute - parsed user:', user);
        } catch (e) {
            console.error('Failed to parse user:', e);
            user = null;
        }
    }
    
    if (!token || !user) {
        console.log('PrivateRoute - redirecting to login');
        return <Navigate to="/login" />;
    }
    
    if (requiredType && user.type !== requiredType) {
        console.log('PrivateRoute - wrong user type, redirecting');
        return <Navigate to="/dashboard" />;
    }
    
    console.log('PrivateRoute - rendering children');
    return children;
};

export default PrivateRoute;