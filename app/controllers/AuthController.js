const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const { workerData } = require('worker_threads');
const request = require('request');
const {initializePayment, verifyPayment} = require('../../config/paystack')(request);

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


exports.fund_account = (req, res, next) => {
	const validationErrors = [];
	// pass token here as variable, if exists - work, if not - don't
	if (req.body.amount < 0) validationErrors.push('Invalid amount.');
	if (validator.isEmpty(req.body.user_choice)) validationErrors.push('User choice cannot be blank.');
	if (validationErrors.length) {
		return res.json({ 'Error': validationErrors });
	}
	User.findOne({
		where: {
			email: req.body.user_choice
		}
	}).then(user => {
		if (user) {
			const form = _.pick(req.body,['user_choice', 'amount']);
			form.metadata = {
				user_choice : form.user_choice
			}
			form.amount *= 100;
			initializePayment(form, (error, body)=>{
				if(error){
					//handle errors
					console.log(error);
					return;
				}
				response = JSON.parse(body);
				res.redirect(response.data.authorization_url)
			});		
			return transaction.save()
		} 
		else {
			return res.json({ 'Error': 'Funding error' });
		}
	})
		.catch(err => console.log(err));
};
