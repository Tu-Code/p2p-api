const express = require('express');
const router = express.Router();
// const HomeController = require('../app/controllers/HomeController');
const AuthController = require('../app/controllers/AuthController');
const isAuth = require('../app/middlewares/isAuth');

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/sign-up', AuthController.signUp);
router.post('/fund-account', isAuth, AuthController.fundAccount);
router.post('/transfer', isAuth, AuthController.transfer);
router.post('/forgot-password', isAuth, AuthController.forgotPassword);

router.get('/', AuthController.home);
router.get('/callback', AuthController.callback);
router.get('/locked-endpoint', isAuth, (req, res) => {
	res.send("Logged in, welcome, user id is: " + req.user_id)
});

module.exports = router;