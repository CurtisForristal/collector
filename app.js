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
	request 				= require("request");


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
mongoose.connect("mongodb://localhost/collector", {useMongoClient: true});


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
	next();
});


// ======
// ROUTES
// ======
app.use(gamesRoutes);
app.use(indexRoutes);


// ==================
// START LOCAL SERVER
// ==================
app.listen(27017, function() {
	console.log("Server Started");
});
