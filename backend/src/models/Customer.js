const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
    customer_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            is: /^[A-Za-z\s]{2,100}$/ // Whitelist validation
        }
    },
    id_number: {
        type: DataTypes.STRING(13),
        allowNull: false,
        unique: true,
        validate: {
            is: /^[0-9]{13}$/
        }
    },
    account_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            is: /^[0-9]{10,20}$/
        }
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            is: /^[A-Za-z0-9_]{3,50}$/
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Customer;