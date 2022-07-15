const express = require('express');
const router = express.Router();
// const HomeController = require('../app/controllers/HomeController');
const AuthController = require('../app/controllers/AuthController');
const isAuth = require('../app/middlewares/isAuth');

// router.get('/', HomeController.homePage);
// router.get('/login', AuthController.loginPage);
router.post('/login', AuthController.login);

router.post('/logout', AuthController.logout);
// router.get('/sign-up', AuthController.signUpPage);
router.post('/sign-up', AuthController.signUp);
// router.get('/forgot-password', AuthController.forgotPasswordPage);
router.post('/fund-account', AuthController.fund_account);
router.get('/locked-endpoint', isAuth, (req, res) => {
	res.send("Logged in, welcome, user id is: " + req.user_id)
});

module.exports = router;