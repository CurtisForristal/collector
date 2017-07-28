// ============
// GAMES ROUTES
// ============

var express = require("express");
var router = express.Router({mergeParams: true});
var request = require("request");

// INCLUDE MODELS
var Game = require("../models/game");

// CONSTANTS
// My API Key is stored in environment variable GIANTBOMBAPIKEY
var key = process.env.GIANTBOMBAPIKEY;


// ==========================================================================


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


// RESULTS
// Use the GiantBomb API to search for video games in their database
// Render the results on games/new
router.get("/games/results", function (req, res) {
	// Receive search from the form on games/index
	var query = req.query.search;
	// Create url from the giantbomb search query url, my API key, and the query variable
	var url = "http://www.giantbomb.com/api/search/?api_key=" + key + "&format=json&query=" + query + "&resources=game";

	// Make the API requst on Giant Bomb
	// Using a Promise
	// After the request completes, then runs the callback using the parsed data from makeApiRequest
	makeApiRequest(url).then(function(data) {
		res.render("games/results", {data: data});
	});
});


// RESULTS SHOW
// Receive the game ID from the link in results.ejs
// Find that game in the Giant Bomb database
// Render a show page for that game with a link to add it to your collection
router.get("/results/:id", function (req, res) {
	var id = req.params.id;
	var url = "http://www.giantbomb.com/api/game/" + id + "/?api_key=" + key + "&format=json";

	// Make the API requst on Giant Bomb
	// Using a Promise
	// After the request completes, then runs the callback using the parsed data from makeApiRequest
	makeApiRequest(url).then(function (data) {
		res.render("games/resultsShow", {data: data});
	});
});


// CREATE
// Receive the data from NEW
// Add the new game to their list
// Redirect to INDEX
router.post("/games", function (req, res) {
	var title = req.body.title;
	var date = req.body.date;
	var platforms = [];

	if (Array.isArray(req.body.platforms)) {
		req.body.platforms.forEach (function (platform) {
			platforms.push(platform);
		});
	} else {
		platforms.push(req.body.platforms);
	}


	var newGame = {
		title: title,
		date: date,
		platforms: platforms
	};


	Game.create(newGame, function (err, newlyCreated) {
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


// ==========================================================================

// Function: makeApiRequest
// Uses Request to send API requests to giantbomb.com
var makeApiRequest = function (url) {
	// Return a promise
	return new Promise(function(resolve, reject) {
		// Giant Bomb API requires a unique User-Agent HTTP header
		var options = {
			url: url,
			headers: {
				"User-Agent": "CurtisForristalTestProject"
			}
		};

		// User request to parse the data
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var data = JSON.parse(body);
				// Run the callback function now that the body has been parsed
				resolve(data);
			} else {
				reject("ERROR CODE" + response.statusCode);
			}
		});
	});
}



// EXPORT
module.exports = router;
