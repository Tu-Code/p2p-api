const path = require('path');
const env = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store); // initalize sequelize with session store
const cors = require('cors');
const cookieParser = require('cookie-parser')

const webRoutes = require('./routes/web');
const sequelize = require('./config/database');


const app = express();
env.config();

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

app.use(webRoutes);

sequelize
	// .sync({force : true})
	.sync()
	.then(() => {
		app.listen(process.env.PORT);
		//pending set timezone
		console.log("App listening on port " + process.env.PORT);
	})
	.catch(err => {
		console.log(err);
	});
