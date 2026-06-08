import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Customer/Register';
import Login from './components/Customer/Login';
import EmployeeLogin from './components/Employee/EmployeeLogin';
import CustomerDashboard from './components/Customer/CustomerDashboard';
import TransactionQueue from './components/Employee/TransactionQueue';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/employee/login" element={<EmployeeLogin />} />
                <Route path="/dashboard" element={
                    <PrivateRoute requiredType="customer">
                        <CustomerDashboard />
                    </PrivateRoute>
                } />
                <Route path="/employee/queue" element={
                    <PrivateRoute requiredType="employee">
                        <TransactionQueue />
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;