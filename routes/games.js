// ============
// GAMES ROUTES 
// ============

var express = require("express");
var router = express.Router({mergeParams: true});

// INCLUDE MODELS
var Game = require("../models/game");



// ======
// ROUTES 
// ======

// ROOT
// Render the landing page
router.get("/", function (req, res) {
	res.render("landing");
});


// INDEX
// Pull all of the users games from the db
// Render a list of their games
router.get("/games", function (req, res) {
	Game.find({}, function (err, games) {
		if (err) {
			console.log("ERROR - GAMES INDEX ROUTE");
		} else {
			res.render("games/index", {games: games});			
		}
	});
});


// NEW
// Display form to add a new game to their list
router.get("/games/new", function (req, res) {
	res.render("games/new");
});


// CREATE
// Receive the data from NEW
// Add the new game to their list
// Redirect to INDEX
router.post("/games", function (req, res) {
	Game.create(req.body.game, function (err, newGame) {
		if (err) {
			console.log("ERROR - GAMES CREATE ROUTE");
		} else {
			res.redirect("/games");
		}
	});
});

// SHOW
// Render all info about the selected game
router.get("/games/:id", function (req, res) {
	res.send("SHOW PAGE");
});



// EXPORT
module.exports = router;
