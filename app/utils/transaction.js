const User = require('../models/User');
const request = require('request');
const {
	initializePayment,
} = require('../../config/paystack')(request);

const validator = require('validator');
const Transaction = require('../models/Transaction');
const _ = require('lodash');
const { response } = require('express');
const { method } = require('lodash');

exports.pay = async (req, res, next) => {
    const {
        email,
        amount,
    } = req.body;

	const user_id = req.user_id
    const currentUser = await User.findOne({id: user_id})

	const existingUser = await User.findOne({
		where: {
			email
		}
	});

	const full_name = currentUser.fullName;

	const validationErrors = [];
	if (amount < 0) validationErrors.push('Invalid amount.');

	if (validationErrors.length) {
		return res.json({
			'Error': validationErrors
		});
	}

	const form = {
		email,
		amount: amount * 100,
		metadata: {
			full_name
		}
	};

    if (currentUser.email == email) {
        initializePayment(form, (error, body) => {
            if (error) {
                console.log(error);
                return res.json({ 'Error': 'Payment initialization failed.' });
            }
            const resp = JSON.parse(body);

            return res.json({
                'Checkout link': resp.data.authorization_url,
                'data': resp.data,
                'type': 'fund',
                'Account balance before fund': currentUser.balance
            });
        });
		
    } 
	
	else if (existingUser) {
		if (amount > currentUser.balance) validationErrors.push('Balance too low.');

		initializePayment(form, (error, body) => {
            if (error) {
                console.log(error);
                return res.json({ 'Error': 'Payment initialization failed.' });
            }
            const resp = JSON.parse(body);

            return res.json({
                'Checkout link': resp.data.authorization_url,
				'recipient': email,
                'data': resp.data,
                'type': 'transfer',
                'Account balance before transfer': currentUser.balance
            });
        });
    }

	else{
		return res.json({
			"Error": "No such user"
		})
	}
};