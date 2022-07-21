const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store); // initalize sequelize with session store
const cors = require('cors');
const cookieParser = require('cookie-parser')

const app = express();
env.config();

const webRoutes = require('./routes/web');
const sequelize = require('./config/database');
const errorController = require('./app/controllers/ErrorController');
// const csrfProtection = require('./app/middlewares/crsf');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
	store: new SequelizeStore({
		db: sequelize,
		table: "sessions",
	}),
}));
// app.use(csrfProtection);

// app.post('/test', csrfProtection, function (req, res) {
// 	console.log(req.body);
// 	res.send("Seen")
// })


// app.use((req, res, next) => {
// 	res.locals.isAuthenticated = req.session.isLoggedIn;
// 	res.locals.csrfToken = req.csrfToken();
// 	next();
// });

app.use(webRoutes);
app.use(errorController.pageNotFound);

sequelize
	// .sync({force : true})
	.sync()
	.then(() => {
		app.listen(process.env.PORT || 3000);
		//pending set timezone
		console.log("App listening on port " + process.env.PORT);
	})
	.catch(err => {
		console.log(err);
	});
