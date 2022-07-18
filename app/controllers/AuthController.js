const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');
const { workerData } = require('worker_threads');
const request = require('request');
const {initializePayment, verifyPayment} = require('../../config/paystack')(request);
const _ = require('lodash');
const { response } = require('express');
const { method } = require('lodash');

exports.login = (req, res, next) => {
	try {
		const validationErrors = [];
		if (!validator.isEmail(req.body.inputEmail)) validationErrors.push('Please enter a valid email address.');
		if (validator.isEmpty(req.body.inputPassword)) validationErrors.push('Password cannot be blank.');
		if (validationErrors.length) {
			return res.json({ 'Error': validationErrors });
		}
		User.findOne({
			where: {
				email: req.body.inputEmail
			}
		}).then(user => {
			if (user) {
				bcrypt
					.compare(req.body.inputPassword, user.password)
					.then(doMatch => {
						if (doMatch) {
							const token = jwt.sign({ id: user.id }, process.env.JWT_KEY)
							return res.status(200).json({
								data: {
									token,
								},
								message: 'Logged In',
								status: 'success',
							})
						}
						return res.json({ 'Error': 'Invalid credentials' });
					})
					.catch(err => {
						console.log(err);
						return res.json({ 'Error': 'Something went wrong!' });
					});
			} else {
				return res.json({ 'Error': 'Invalid User' });
			}
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({
			message: 'An error occured',
			status: 'error',
		})
	}
};

exports.logout = (req, res, next) => {
	if (res.locals.isAuthenticated) {
		req.session.destroy(err => {
			return res.json({ 'Success': 'Logged Out' });
		});
	} else {
		return res.json({ 'Error': 'Not Logged In?' });
	}
};

exports.signUp = (req, res, next) => {
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if (!user) {
			return bcrypt
				.hash(req.body.password, 12)
				.then(hashedPassword => {
					const user = new User({
						fullName: req.body.fullName,
						email: req.body.email,
						phone: req.body.phone,
						balance: 0,
						password: hashedPassword,
					});
					
					return user.save();
				})
				.then(result => {
					return res.json({ 'Success': 'User created succesfully' });
				});
		} else {
			return res.json({ 'Error': 'User already exists.' });
		}
	})
		.catch(err => console.log(err));
};

exports.forgotPassword = (req, res, next) => {
	const validationErrors = [];
	if (!validator.isEmail(req.body.email)) validationErrors.push('Please enter a valid email address.');

	if (validationErrors.length) {
		return res.json({ 'Error': validationErrors });
	}
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.json({ 'Mssg': 'Forgot pwd page' });
		}
		const token = buffer.toString('hex');
		User.findOne({
			where: {
				email: req.body.email
			}
		})
			.then(user => {
				if (!user) {
					return res.json({ 'Error': 'No user found with that email' });
				}
				user.resetToken = token;
				user.resetTokenExpiry = Date.now() + 3600000;
				return user.save();
			}).then(result => {
				if (result) return res.json({ 'Mssg': 'Reset pwd link' });
			}).catch(err => { console.log(err) })
	});
};

let fundOrTrans = ''
let amountToRecord = 0

exports.transfer = (req, res, next) => {
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if (user) {
			const validationErrors = [];
			if (req.body.amount < 0) validationErrors.push('Invalid amount.');
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
			
		} else {
			return res.json({ 'Error': 'Invalid user choice.' });
		}
	})
	.catch(err => console.log(err));
};

bal = 0
let userObj = {}
user_choice = ''

exports.fundAccount = (req, res, next) => {
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if (user) {
			userObj = user
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
		else {
			return res.json({ 'Error': 'Invalid user choice.' });
		}
	})
	.catch(err => console.log(err));
};

exports.callback = (req, res, next) => {
	const ref = req.query.reference;
    verifyPayment(ref, (error,body)=>{
        if(error){
            console.log(error)
            return res.json({"error": error});
        }
        resp = JSON.parse(body);
        const data = _.at(resp.data, ['reference', 'amount','customer.email', 'metadata.full_name']);
        [reference, amount, email, full_name] = data;
		let this_user = email
		newTransaction = {this_user, user_choice, amount, reference}
        const transaction = new Transaction(newTransaction)
		console.log("Amount to record " + amountToRecord)

		if (fundOrTrans == 'fund'){
			User.upsert({
				id: userObj.id,
				balance: bal + amountToRecord,
			});
			return transaction.save()
		}
		else if (fundOrTrans == 'trans'){
			User.upsert({
				id: userObj.id,
				balance: bal -  amountToRecord,
			});
			return transaction.save()
		}
		else{
			return res.json({"Error": "No transaction recorded"})
		}
        
    })
};

