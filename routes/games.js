// ============
// GAMES ROUTES 
// ============

var express = require("express");
var router = express.Router({mergeParams: true});

// INCLUDE MODELS
var Game = require("../models/game");




// ROOT
// Render the landing page
router.get("/", function (req, res) {
	res.render("landing");
});


// INDEX
// Pull all of the users games from the db
// Render a list of their games
router.get("/games", function (req, res) {
	res.render("games/index");
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




// EXPORT
module.exports = router;
