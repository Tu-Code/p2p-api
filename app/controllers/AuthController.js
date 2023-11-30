const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
	try {
		const {email, password} = req.body
		const existingUser = await User.findOne({where: {email}})
		if(existingUser){
			if(bcrypt.compare(existingUser.password, password)){
				const token = jwt.sign({ id: existingUser.id }, process.env.JWT_KEY)
				return res.status(200).json({
					data: {
						token,
					},
					message: 'Logged In',
					status: 'success',
				})
			}
			else{
				return res.json({ 'Error': 'Invalid Password.' });
			}
		}
		return res.json({ 'Error': 'User does not exist.' });
	} 
	catch (error) {
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

exports.signUp = async (req, res, next) => {
	try{
		const {fullName, email, phone, password} = req.body
		const existingUser = await User.findOne({where: {email}})
		if(existingUser){
			return res.json({ 'Error': 'User already exists.' });
		}

		const saltRounds = 10;
        if (!password) {
            return res.status(400).json({ 'Error': 'Password is missing.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

		const newUser = await User.create({
            fullName,
            email,
            phone,
            balance: 0,
            password: hashedPassword,
        });

		return res.json({ 'Success': 'User created succesfully' , data: newUser});
	}
	catch (error) {
		console.log(error)
		return res.status(500).json({
			message: 'An error occured',
			status: 'error',
		})
	}
};

exports.forgotPassword = (req, res, next) => {
	const validationErrors = [];
	if (!validator.isEmail(req.body.email)) validationErrors.push('Please enter a valid email address.');

	if (validationErrors.length) {
		return res.json({ 'Error': validationErrors });
	}
	crypto.randomBytes(32, async (err, buffer) => {
		if (err) {
			console.log(err);
			return res.json({ 'Mssg': 'Forgot pwd page' });
		}
		const token = buffer.toString('hex');
		const existingUser = await User.findOne({where: {email}})
		if(!existingUser){
			return res.json({ 'Error': 'No user found with that email' });
		}
		user.resetToken = token;
		user.resetTokenExpiry = Date.now() + 3600000;
		return user.save();

	});
};

exports.users = async (req, res, next) => {
	try {
		const users = await User.findAll(); // Fetch all users from the database
        
		return res.json({ users });

        // if (users && users.length > 0) {
        //     return res.json({ users });
        // } else {
        //     return res.json({ 'Error': 'No users found.' });
        // }
	} 
	catch (error) {
		console.log(error)
		return res.status(500).json({
			message: 'An error occured',
			status: 'error',
		})
	}
};

exports.jwtGenerate = async (req, res, next) => {
	try {
		const jwtSecret = crypto.randomBytes(32).toString('hex');
		console.log(
			jwtSecret
		)
		return jwtSecret;
	} 
	catch (error) {
		console.log(error)
		return res.status(500).json({
			message: 'An error occured',
			status: 'error',
		})
	}
};
