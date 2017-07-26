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
// Find the selected game
// Render all info about the that game
router.get("/games/:id", function (req, res) {
	Game.findById(req.params.id, function (err, foundGame) {
		if (err) {
			console.log("ERROR - GAMES SHOW ROUTE");
		} else {
				res.render("games/show", {game: foundGame});
		}
	});
});


// EDIT
// Receive the id from the edit button in the show view
// Find the game entry for that id
// Render the form to edit that entry
router.get("/games/:id/edit", function (req, res){
	Game.findById(req.params.id, function (err, foundGame) {
		if (err) {
			console.log ("ERROR - GAMES EDIT ROUTE");
		} else {
			res.render("games/edit", {game: foundGame});
		}
	});
});


// UPDATE
// Receive the edited entry ovject from edit.ejs
// Find the original entry and update it
// Redirect to that entry's show view
router.put("/games/:id", function (req, res) {
	Game.findByIdAndUpdate(req.params.id, req.body, function (err, updatedGame) {
		if (err) {
			console.log("ERROR - GAMES UPDATE ROUTE");
		} else {
			res.redirect("/games/" + req.params.id);
		}
	});
});


// DESTORY
// Find the selected game and delete it
// Redirect to the games index view
router.delete("/games/:id", function (req, res) {
	Game.findByIdAndRemove(req.params.id, function (err) {
		if (err) {
			console.log("ERROR - GAMES DESTORY ROUTE");
		} else {
			res.redirect("/games");
		}
	});
});


// EXPORT
module.exports = router;
