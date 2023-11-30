const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./User')

const Transaction = sequelize.define('transactions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

Transaction.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });

module.exports = Transaction;