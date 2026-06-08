const { sequelize } = require('../config/database');
const Customer = require('./Customer');
const Employee = require('./Employee');
const Transaction = require('./Transaction');
const Session = require('./Session');
const AuditLog = require('./AuditLog');

// Define associations
Transaction.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Transaction, { foreignKey: 'customer_id' });

Transaction.belongsTo(Employee, { foreignKey: 'employee_verified_by' });

// Sync all models with database
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');
        
       
const employeeCount = await Employee.count();
if (employeeCount === 0) {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Employee@123', 10);
    
    // Create multiple employees
    await Employee.bulkCreate([
        {
            employee_number: 'EMP001',
            full_name: 'John Smith',
            password_hash: hashedPassword,
            role: 'Verifier'
        },
        {
            employee_number: 'EMP002',
            full_name: 'Sarah Johnson',
            password_hash: hashedPassword,
            role: 'Verifier'
        },
        {
            employee_number: 'EMP003',
            full_name: 'Mike Brown',
            password_hash: hashedPassword,
            role: 'Manager'
        }
    ]);
    console.log('Default employees created: EMP001, EMP002, EMP003 / Password: Employee@123');
}
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = {
    sequelize,
    Customer,
    Employee,
    Transaction,
    Session,
    AuditLog,
    syncDatabase
};