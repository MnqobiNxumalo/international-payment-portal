const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    transaction_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'customer_id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        validate: {
            is: /^[A-Z]{3}$/
        }
    },
    provider: {
        type: DataTypes.STRING(10),
        defaultValue: 'SWIFT'
    },
    beneficiary_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            is: /^[A-Za-z\s\.]{2,100}$/
        }
    },
    beneficiary_account: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            is: /^[0-9A-Za-z]{5,50}$/
        }
    },
    swift_code: {
        type: DataTypes.STRING(11),
        allowNull: false,
        validate: {
            is: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
        }
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Pending',
        validate: {
            isIn: [['Pending', 'Verified', 'Rejected', 'Submitted']]
        }
    },
    employee_verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    submitted_to_swift: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Transaction;