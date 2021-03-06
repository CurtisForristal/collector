// ==============================
// COLLECTOR
// =============================
// App.js
// Entry Point for Collector app
// ==============================

// Set if you want to run the Local/Dev Server or the Hosted/Production server
// Change the server variable to 0 for Local/Dev (on port 27017) 
// or 1 for Hosted/Production (using Heroku/mLab)
var server = 1;


// ================
// REQUIRE PACKAGES
// ================
var passportLocalMongoose 	= require("passport-local-mongoose"),
	methodOverride 			= require("method-override"),
	LocalStrategy 			= require("passport-local"),
	session 				= require("express-session"),
	MongoStore              = require("connect-mongo")(session),
	bodyParser 				= require("body-parser"),
	flash 					= require("connect-flash"),
	mongoose 				= require("mongoose"),
	passport 				= require("passport"),
	express 				= require("express"),
	request 				= require("request"),
	moment					= require("moment");


// ==============
// REQUIRE ROUTES
// ==============
var gamesRoutes = require("./routes/games");
var indexRoutes = require("./routes/index")


// ==============
// REQUIRE MODELS
// ==============
var Game = require("./models/game");
var User = require("./models/user");


// =========
// APP SETUP
// =========
var app = express();
app.set("view engine", "ejs");
// Serve public dir for css files
app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
// For RESTful PUT and DELETE routes
app.use(methodOverride("_method"));
// For flash messages
app.use(flash());


// ==============
// DATABASE SETUP
// ==============
mongoose.Promise = global.Promise
mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});



// ==============
// PASSPORT SETUP
// ==============
app.use(require("express-session") ({
	secret: "Making another video game collection app is quite unnecessary",
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		// Store the session for 14 days
		ttl: 14 * 24 * 60 * 60
	})
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ==============
// LOCALS PASSING
// ==============
app.use(function (req, res, next) {
	// Pass user through to all routes
	res.locals.currentUser = req.user;
	// use Moment for displaying Date Added
	res.locals.moment = require("moment");
	// For flash messages with connect-flash
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


// ======
// ROUTES
// ======
app.use(gamesRoutes);
app.use(indexRoutes);


// ============
// START SERVER
// ============
// Starts the server
// If the "server" variable is 0, app will run on a local/dev server
// If the "server" variable is 1, app willrun on the hosted/production server using Heroku/mLab
runServer();
function runServer() {
	if (server === 0) {
		app.listen(27017, function() {
			console.log("Server Started");
		});
	}
	if (server === 1) {
		app.listen(process.env.PORT, process.env.IP, function() {
			console.log("Server Started");
		});
	}
}

