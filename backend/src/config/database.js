const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false, // Set to console.log for debugging
    define: {
        timestamps: true,
        underscored: true
    }
});

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to database:', error);
    }
};

module.exports = { sequelize, DataTypes, testConnection };