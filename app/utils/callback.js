const User = require('../models/User');
const Transaction = require('../models/Transaction');
const request = require('request');
const {initializePayment, verifyPayment} = require('../../config/paystack')(request);
const _ = require('lodash');
const transaction = require('./transaction');
const { response } = require('express');
const { method } = require('lodash');

exports.callback = (req, res, next) => {
    const ref = req.query.reference;
    const user_id = req.query.user_id;
    const transaction_type = req.query.type;

    verifyPayment(ref, async (error, body) => {

        if (error) {
            console.error(error);
            return res.json({ "error": error });
        }

        try {
            const resp = JSON.parse(body);

            const [reference, amount, email] = _.at(resp.data, ['reference', 'amount', 'customer.email']);

            const user = await User.findOne({ where: { id: user_id }})
            const recipient = await User.findOne({ where: { email }})

            const newTransaction = await Transaction.create({
                user_id,
                type: transaction_type,
                amount: amount/100,
                reference,
            });

            let senderUpdate = {};
            let recipientUpdate = {};

            if (newTransaction.type == 'fund') {
                senderUpdate = { id: user.id, balance: user.balance + newTransaction.amount };

            } else if (newTransaction.type == 'trans') {
                senderUpdate = { id: user.id, balance: user.balance - newTransaction.amount };
                recipientUpdate = { id: recipient.id, balance: recipient.balance + newTransaction.amount };
                await User.update(recipientUpdate, { where: { id: recipient.id } });
            } else {
                return res.json({ "Error": "No transaction recorded" });
            }

            await User.update(senderUpdate, { where: { id: user.id } });

            return res.json({
                "Success": "Transaction recorded successfully",
                "NewTransaction": newTransaction,
                "NewBalance": user.balance
            });            

        } catch (err) {
            console.error(err);
            return res.status(500).json({ "error": "An error occurred" });
        }
    });

};
