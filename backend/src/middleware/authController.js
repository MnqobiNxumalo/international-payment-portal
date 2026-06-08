const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Customer, Employee, Session, AuditLog } = require('../models');
const { validateInput } = require('../utils/regexPatterns');

const registerCustomer = async (req, res) => {
    try {
        const { fullName, idNumber, accountNumber, username, password } = req.body;
        
        // Whitelist validation
        if (!validateInput(fullName, 'fullName') ||
            !validateInput(idNumber, 'idNumber') ||
            !validateInput(accountNumber, 'accountNumber') ||
            !validateInput(username, 'username')) {
            return res.status(400).json({ message: 'Invalid input format.' });
        }
        
        // Check existing user
        const existingUser = await Customer.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { username },
                    { id_number: idNumber }
                ]
            }
        });
        
        if (existingUser) {
            return res.status(409).json({ message: 'Username or ID number already registered.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
        
        await Customer.create({
            full_name: fullName,
            id_number: idNumber,
            account_number: accountNumber,
            username: username,
            password_hash: hashedPassword
        });
        
        res.status(201).json({ message: 'Registration successful. Please login.' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

const loginCustomer = async (req, res) => {
    try {
        const { username, accountNumber, password } = req.body;
        
        if (!validateInput(username, 'username') || !validateInput(accountNumber, 'accountNumber')) {
            return res.status(400).json({ message: 'Invalid input format.' });
        }
        
        const customer = await Customer.findOne({
            where: { username, account_number: accountNumber, is_active: true }
        });
        
        if (!customer) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, customer.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const sessionId = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.SESSION_EXPIRY_HOURS || 1));
        
        await Session.create({
            session_id: sessionId,
            user_id: customer.customer_id,
            user_type: 'customer',
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            expires_at: expiresAt
        });
        
        const token = jwt.sign(
            {
                userId: customer.customer_id,
                username: customer.username,
                userType: 'customer',
                sessionId: sessionId,
                ipAddress: req.ip
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_CUSTOMER_EXPIRY }
        );
        
        await AuditLog.create({
            action: 'CUSTOMER_LOGIN',
            user_id: customer.customer_id,
            user_type: 'customer',
            details: 'Customer logged in successfully',
            ip_address: req.ip
        });
        
        res.json({
            token,
            user: {
                id: customer.customer_id,
                username: customer.username,
                type: 'customer'
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

const loginEmployee = async (req, res) => {
    try {
        const { employeeNumber, password } = req.body;
        
        if (!validateInput(employeeNumber, 'employeeNumber')) {
            return res.status(400).json({ message: 'Invalid employee number format.' });
        }
        
        const employee = await Employee.findOne({
            where: { employee_number: employeeNumber }
        });
        
        if (!employee) {
            return res.status(401).json({ message: 'Invalid employee credentials.' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, employee.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid employee credentials.' });
        }
        
        const sessionId = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.EMPLOYEE_SESSION_EXPIRY_HOURS || 8));
        
        await Session.create({
            session_id: sessionId,
            user_id: employee.employee_id,
            user_type: 'employee',
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            expires_at: expiresAt
        });
        
        const token = jwt.sign(
            {
                userId: employee.employee_id,
                employeeNumber: employee.employee_number,
                userType: 'employee',
                sessionId: sessionId,
                ipAddress: req.ip
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EMPLOYEE_EXPIRY }
        );
        
        res.json({
            token,
            user: {
                id: employee.employee_id,
                employeeNumber: employee.employee_number,
                type: 'employee'
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during employee login.' });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            await Session.destroy({ where: { session_id: decoded.sessionId } });
        }
        res.json({ message: 'Logged out successfully.' });
    } catch (error) {
        res.json({ message: 'Logged out.' });
    }
};

module.exports = { registerCustomer, loginCustomer, loginEmployee, logout };