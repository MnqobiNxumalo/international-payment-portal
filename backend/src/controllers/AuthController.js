const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Customer, Employee, Session, AuditLog } = require('../models');

class AuthController {
    constructor() {
        this.registerCustomer = this.registerCustomer.bind(this);
        this.loginCustomer = this.loginCustomer.bind(this);
        this.loginEmployee = this.loginEmployee.bind(this);
        this.logout = this.logout.bind(this);
    }

    // Helper methods
    success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    error(res, message = 'Server error', statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            message
        });
    }

    // Customer Registration
    async registerCustomer(req, res) {
        try {
            const { fullName, idNumber, accountNumber, username, password } = req.body;

            console.log('Registration attempt:', { username, accountNumber });

            // Check if user exists
            const existingUser = await Customer.findOne({
                where: {
                    [Op.or]: [
                        { username },
                        { id_number: idNumber }
                    ]
                }
            });

            if (existingUser) {
                return this.error(res, 'Username or ID number already registered', 409);
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create customer
            const customer = await Customer.create({
                full_name: fullName,
                id_number: idNumber,
                account_number: accountNumber,
                username: username,
                password_hash: hashedPassword,
                is_active: true
            });

            console.log('Customer created:', customer.customer_id);

            return this.success(res, { customerId: customer.customer_id }, 'Registration successful', 201);

        } catch (error) {
            console.error('Registration error:', error);
            return this.error(res, error.message || 'Server error during registration', 500);
        }
    }

    // Customer Login
    async loginCustomer(req, res) {
        try {
            const { username, accountNumber, password } = req.body;

            console.log('Login attempt:', { username, accountNumber });

            // Find customer
            const customer = await Customer.findOne({
                where: { 
                    username: username,
                    account_number: accountNumber
                }
            });

            if (!customer) {
                console.log('Customer not found');
                return this.error(res, 'Invalid username, account number, or password', 401);
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, customer.password_hash);
            
            if (!isPasswordValid) {
                console.log('Invalid password for user:', username);
                return this.error(res, 'Invalid username, account number, or password', 401);
            }

            console.log('Password valid for:', username);

            // Generate session ID
            const sessionId = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);

            // Store session
            await Session.create({
                session_id: sessionId,
                user_id: customer.customer_id,
                user_type: 'customer',
                ip_address: req.ip || '127.0.0.1',
                user_agent: req.headers['user-agent'] || 'unknown',
                expires_at: expiresAt
            });

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: customer.customer_id,
                    username: customer.username,
                    userType: 'customer',
                    sessionId: sessionId
                },
                process.env.JWT_SECRET || 'your-secret-key-change-this',
                { expiresIn: '1h' }
            );

            console.log('Login successful for:', username);

            // Send response with token and user data
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: customer.customer_id,
                    username: customer.username,
                    type: 'customer'
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return this.error(res, error.message || 'Server error during login', 500);
        }
    }

    // Employee Login
    async loginEmployee(req, res) {
        try {
            const { employeeNumber, password } = req.body;

            console.log('Employee login attempt:', { employeeNumber });

            const employee = await Employee.findOne({
                where: { employee_number: employeeNumber }
            });

            if (!employee) {
                console.log('Employee not found:', employeeNumber);
                return this.error(res, 'Invalid employee credentials', 401);
            }

            const isPasswordValid = await bcrypt.compare(password, employee.password_hash);
            
            if (!isPasswordValid) {
                console.log('Invalid password for employee:', employeeNumber);
                return this.error(res, 'Invalid employee credentials', 401);
            }

            console.log('Employee password valid for:', employeeNumber);

            const sessionId = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 8);

            await Session.create({
                session_id: sessionId,
                user_id: employee.employee_id,
                user_type: 'employee',
                ip_address: req.ip || '127.0.0.1',
                user_agent: req.headers['user-agent'] || 'unknown',
                expires_at: expiresAt
            });

            const token = jwt.sign(
                {
                    userId: employee.employee_id,
                    employeeNumber: employee.employee_number,
                    userType: 'employee',
                    sessionId: sessionId
                },
                process.env.JWT_SECRET || 'your-secret-key-change-this',
                { expiresIn: '8h' }
            );

            console.log('Employee login successful:', employeeNumber);

            return res.status(200).json({
                success: true,
                message: 'Employee login successful',
                token: token,
                user: {
                    id: employee.employee_id,
                    employeeNumber: employee.employee_number,
                    type: 'employee'
                }
            });

        } catch (error) {
            console.error('Employee login error:', error);
            return this.error(res, error.message || 'Server error during employee login', 500);
        }
    }

    // Logout
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
                await Session.destroy({ 
                    where: { session_id: decoded.sessionId } 
                });
            }
            
            return this.success(res, null, 'Logged out successfully');

        } catch (error) {
            return this.success(res, null, 'Logged out');
        }
    }
}

module.exports = new AuthController();