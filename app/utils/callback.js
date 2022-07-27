const User = require('../models/User');
const Transaction = require('../models/Transaction');
const request = require('request');
const {initializePayment, verifyPayment} = require('../../config/paystack')(request);
const _ = require('lodash');
const transaction = require('./transaction');
const { response } = require('express');
const { method } = require('lodash');

let userObj = transaction.userObj
let fundOrTrans = transaction.fundOrTrans
let amountToRecord = transaction.amountToRecord
let user_choice = transaction.user_choice

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
		let newTransaction = {this_user, user_choice, amount, reference}
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
