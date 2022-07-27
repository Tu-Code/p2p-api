const express = require('express');
const router = express.Router();
const AuthController = require('../app/controllers/AuthController');
const transaction = require('../app/utils/transaction');
const callback = require('../app/utils/callback');
const isAuth = require('../app/middlewares/isAuth');
const User = require('../app/models/User')

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/sign-up', AuthController.signUp);
router.post('/forgot-password', isAuth, AuthController.forgotPassword);
router.post('/fund-account', isAuth, transaction.fundAccount);
router.post('/transfer', isAuth, transaction.transfer);

// router.get('/', AuthController.home);
router.get('/callback', callback.callback);
router.get('/locked-endpoint', isAuth, (req, res) => {
	res.send("Logged in, welcome, user id is: " + req.user_id)
});

module.exports = router;