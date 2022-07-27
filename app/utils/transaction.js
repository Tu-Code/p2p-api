const validator = require('validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const request = require('request');
const {initializePayment, verifyPayment} = require('../../config/paystack')(request);
const _ = require('lodash');
const { response } = require('express');
const { method } = require('lodash');

let fundOrTrans = ''
let amountToRecord = 0
let bal = 0
let userObj = {}
let user_choice = ''

exports.fundAccount = (req, res, next) => {
	const {email} = req.body
	const existingUser = await User.findOne({where: {email}})
	if(existingUser){
		userObj = existingUser
		const validationErrors = [];
		if (req.body.amount < 0) validationErrors.push('Invalid amount.');
		if (validator.isEmpty(req.body.email)) validationErrors.push('User choice cannot be blank.');
		if (validationErrors.length) {
			return res.json({ 'Error': validationErrors });
		}
		const form = _.pick(req.body,['email','amount','full_name']);
		if (form.email == user.email){
			form.metadata = {
				full_name : form.full_name
			}
			amountToRecord = form.amount
			form.amount *= 100;
			user_choice = form.email
			fundOrTrans = 'fund'
			initializePayment(form, (error, body)=>{
				if(error){
					console.log(error);
					return;
				}
				resp = JSON.parse(body);
				bal = user.balance
				
				return res.json({
					"Checkout link" : resp.data.authorization_url,
					"Account balance before fund": bal
				})
			});
		}
		else{
			return res.json({"Error": "Not your email."})
		}
	}
	else{
		return res.json({"Error": "User doesn't exist."})
	}
};

exports.transfer = (req, res, next) => {

	const {amount, email} = req.body
	const existingUser = await User.findOne({where: {email}})
	if(existingUser){
		const validationErrors = [];
		if (amount < 0) validationErrors.push('Invalid amount.');
		if (validator.isEmpty(req.body.email)) validationErrors.push('User choice cannot be blank.');
		if (validationErrors.length) {
			return res.json({ 'Error': validationErrors });
		}
		const form = _.pick(req.body,['email','amount','full_name']);
		form.metadata = {
			full_name : form.full_name
		}

		if (form.amount <= user.balance){
			fundOrTrans = 'trans'
			amountToRecord = form.amount
			form.amount *= 100;
			initializePayment(form, (error, body)=>{
				if(error){
					console.log(error);
					return;
				}
				resp = JSON.parse(body);
				bal = user.balance
				
				return res.json({
					"Checkout link" : resp.data.authorization_url,
					"Account balance before transfer": bal
				})
			});
		} else {
			return res.json({"Error": "Insufficient funds."})
		}
	}
	return  res.json({"Error": "User does not exist."})
	
};

exports.fundOrTrans = fundOrTrans;
exports.amountToRecord = amountToRecord;
exports.bal = bal;
exports.userObj = userObj;
exports.user_choice = user_choice;


