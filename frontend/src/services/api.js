import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const authService = {
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },
    
    customerLogin: async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login/customer`, credentials);
            console.log('Full response:', response.data);
            
            // The token and user are at the root level (not inside data)
            if (response.data && response.data.token) {
                const token = response.data.token;
                const user = response.data.user;
                
                console.log('Token received:', token.substring(0, 50) + '...');
                console.log('User received:', user);
                
                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                console.log('Token stored successfully');
                console.log('User stored:', localStorage.getItem('user'));
                
                return { success: true, user: user };
            } else {
                console.error('No token in response:', response.data);
                throw new Error('No token received from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error.response?.data || { message: 'Login failed' };
        }
    },
    
    employeeLogin: async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login/employee`, credentials);
            console.log('Employee login response:', response.data);
            
            if (response.data && response.data.token) {
                const token = response.data.token;
                const user = response.data.user;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                return { success: true, user: user };
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Employee login error:', error);
            throw error.response?.data || { message: 'Employee login failed' };
        }
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('Logged out, storage cleared');
    }
};

// Get auth token for API calls
const getToken = () => localStorage.getItem('token');

export const transactionService = {
    create: async (paymentData) => {
        const token = getToken();
        console.log('Creating transaction with token:', token ? 'Yes' : 'No');
        
        const response = await axios.post(`${API_BASE_URL}/transactions/create`, paymentData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    
    getMyTransactions: async () => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/transactions/my-transactions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    
    getPending: async () => {
        const token = getToken();
        const response = await axios.get(`${API_BASE_URL}/transactions/pending`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    
    verify: async (transactionId, action) => {
        const token = getToken();
        const response = await axios.post(`${API_BASE_URL}/transactions/verify`, { transactionId, action }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    
    submitToSwift: async () => {
        const token = getToken();
        const response = await axios.post(`${API_BASE_URL}/transactions/submit-to-swift`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};