// ============
// GAMES ROUTES
// ============

var express = require("express");
var router = express.Router({mergeParams: true});
var request = require("request");
var middleware = require("../middleware");


// INCLUDE MODELS
var Game = require("../models/game");
var User = require("../models/user");


// CONSTANTS
// ---------
// My GiantBomb.com API Key is stored in environment variable GIANTBOMBAPIKEY
var key = process.env.GIANTBOMBAPIKEY;


// GLOBAL VARIABLES
// ----------------
// By default, INDEX will sort the games by dateAdded before displaying the list
// sortBy will be changed by the "Sort By" clicking the sort carets on the INDEX view
var sortBy = "-dateAdded";


// ==========================================================================


// ======
// ROUTES
// ======

// ROOT
// Render the landing page
router.get("/", function (req, res) {
	res.render("landing");
});


// INDEX - Default sort by dateAdded
// Pull all of the users games from the db
// Render a list of their games
router.get("/games", middleware.isLoggedIn, function (req, res) {
	User.findOne({username: req.user.username}).populate("games").exec(function (err, user) {
		if (err) {
			console.log("ERROR - GAMES INDEX ROUTE");
			req.flash("error", "Cannot find that user");
		} else {
			var userGames = user.games;
			sortGames(userGames);
			res.render("games/index", { games: userGames, user: req.user.username, page: "games" });
		}
	});
});


// INDEX - USER'S GAMES
// List all games for a specific user
router.get("/games/users/:username", function (req, res) {
	User.findOne({username: req.params.username}).populate("games").exec(function (err, foundUser) {
		if (err) {
			console.log("ERROR - INDEX USER'S GAMES ROUTE");
			req.flash("error", "Cannot find that user");
		} else {
			var userGames = foundUser.games;
			sortGames(userGames);
			res.render("games/index", {games: userGames, user: req.params.username});
		}
	});
});


// INDEX/SORT/:SORTBY - Set the sort order, redirect back to /games/users
router.get("/games/sort/:user/:sortBy", function (req, res) {
	sortBy = req.params.sortBy;
	// Decide if order needs to be flopped with a -
	switch (sortBy) {
		case "titleAccending":
			sortBy = "-title";
			break;
		case "dateAddedDecending":
			sortBy = "-dateAdded";
			break;
		case "dateDecending":
			sortBy = "-date";
			break;
		case "platformAccending":
			sortBy = "-platform";
			break;
	}
		res.redirect("/games/users/" + req.params.user);
});


// RESULTS
// Use the GiantBomb API to search for video games in their database
// Render the results on games/new
router.get("/games/results", middleware.isLoggedIn, function (req, res) {
	// Receive search from the form on games/index
	var query = req.query.search;
	// Create url from the giantbomb search query url, my API key, and the query variable
	var url = "http://www.giantbomb.com/api/search/?api_key=" + key + "&format=json&query=" + query + "&resources=game";

	// Make the API reqeust on Giant Bomb using a Promise
	// After the request completes, "then" runs the callback using the parsed data from makeApiRequest
	makeApiRequest(url).then(function(data) {
		res.render("games/results", {data: data});
	});
});


// RESULTS SHOW
// Receive the game ID from the link in results.ejs
// Find that game in the Giant Bomb database
// Render a show page for that game with a link to add it to your collection
router.get("/results/:id", middleware.isLoggedIn, function (req, res) {
	var resourceId = req.params.id;
	var url = "http://www.giantbomb.com/api/game/" + resourceId + "/?api_key=" + key + "&format=json";

	// Make the API requst on Giant Bomb using a Promise
	// After the request completes, "then" runs the callback using the parsed data from makeApiRequest
	makeApiRequest(url).then(function (data) {
		res.render("games/resultsshow", {data: data, resourceId: resourceId});
	});
});


// CREATE
// Receive the data from NEW
// Add the new game to the user's list
// Redirect to INDEX
router.post("/games", middleware.isLoggedIn, function (req, res) {
	var title = req.body.title;
	var resourceId = req.body.resourceId;
	var date = req.body.date;
	var platforms = [];
	var author = {id: req.user._id, username: req.user.username};

	if (Array.isArray(req.body.platforms)) {
		req.body.platforms.forEach (function (platform) {
			platforms.push(platform);
		});
	} else {
		platforms.push(req.body.platforms);
	}


	var newGame = {
		title: title,
		resourceId: resourceId,
		date: date,
		platforms: platforms,
		author: author
	};


	Game.create(newGame, function (err, newlyCreated) {
		if (err) {
			console.log("ERROR - GAMES CREATE ROUTE");
			req.flash("error", "There was an error adding that game to your list");
		} else {
			// add an Object Reference of the game to the current user's games array
			User.findOne({username: req.user.username}, function(err, user) {
				if (err) {
					console.log("ERROR - GAME CREATE FIND CURRENT USER ROUTE");
					req.flash("error", "Cannot find that user");
				} else {
					user.games.push(newlyCreated);
					user.save(function (err, data) {
						if (err) {
							console.log("ERROR - GAMES CREATE SAVE TO USER");
							req.flash("error", "There was an error saving that game to your list");
						} else {
							req.flash("success", newlyCreated.title + " was added to your collection");
							res.redirect("/games");
						}
					});
				}
			});
		}
	});
});


// EDIT
// Receive the id from the edit button in the INDEX view
// Find the game entry for that id
// Also, use the stored resourceID to find the game on Giant Bomb to add additional platforms on edit page
// Render the form to edit that entry
router.get("/games/:id/edit", middleware.isLoggedIn, middleware.checkGameOwnership, function (req, res){
	Game.findById(req.params.id, function (err, foundGame) {
		if (err) {
			console.log ("ERROR - GAMES EDIT ROUTE");
			req.flash("error", "There was an error locating that game");
		} else {
			// Use resourceID to find game om Giant Bomb
			var url = "http://www.giantbomb.com/api/game/" + foundGame.resourceId + "/?api_key=" + key + "&format=json"; 
			makeApiRequest(url).then(function(data) {
				res.render("games/edit", {game: foundGame, data: data});
			});
		}
	});
});


// UPDATE
// Receive the edited entry object from edit.ejs
// Find the original entry and update it
// Redirect to the INDEX view
router.put("/games/:id", middleware.isLoggedIn, middleware.checkGameOwnership, function (req, res) {
	Game.findByIdAndUpdate(req.params.id, req.body, function (err, updatedGame) {
		if (err) {
			console.log("ERROR - GAMES UPDATE ROUTE");
			req.flash("error", "There was an error locating that game");
		} else {
			req.flash("success", updatedGame.title + " platforms updated");
			res.redirect("/games");
		}
	});
});


// DESTORY
// Find the selected game and delete it
// Redirect to the games index view
router.delete("/games/:id", middleware.isLoggedIn, middleware.checkGameOwnership, function (req, res) {
	Game.findByIdAndRemove(req.params.id, function (err, foundGame) {
		if (err) {
			console.log("ERROR - GAMES DESTORY ROUTE");
			req.flash("error", "There was an error locating that game");
		} else {
			// Find the Current User
			User.findByIdAndUpdate(req.user._id, 
				{
					// Remove the Object Reference of the game from the User's games array
					$pull: {
						games: req.params.id
					}
				}, function (err) {
					if (err) {
						req.flash("error", "There was an error locating that game");
						console.log("ERROR - GAME DESTROY ROUTE PART 2");
					} else {
						req.flash("error", foundGame.title + " was deleted from your collection");
						res.redirect("/games");
					}
				});
		}
	});
});


// ==========================================================================

// Function: makeApiRequest
// Uses Request to send API requests to giantbomb.com
// A Promise is used so the asynchronous process finishes before the next process begins 
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
				req.flash("error", "There was an error making the API request");
				res.redirect("/");
			}
		});
	});
}


// Function: sortGames
// Sort all of the current user's games according to the sort carets before displaying the list
var sortGames = function (userGames) {
	switch (sortBy) {
		case "title":
			userGames.sort(function (a, b) {
				if (a.title < b.title) {
					return -1;
				}
				if (a.title > b.title) {
					return 1;
				}
				return 0;
			});
			break;
		case "-title":
			userGames.sort(function (a, b) {
				if (a.title < b.title) {
					return 1;
				}
				if (a.title > b.title) {
					return -1;
				}
				return 0;
			});
			break;
		case "dateAdded":
			userGames.sort(function (a, b) {
				if (a.dateAdded < b.dateAdded) {
					return -1;
				}
				if (a.dateAdded > b.dateAdded) {
					return 1;
				}
				return 0;
			});
			break;
		case "-dateAdded":
			userGames.sort(function (a, b) {
				if (a.dateAdded < b.dateAdded) {
					return 1;
				}
				if (a.dateAdded > b.dateAdded) {
					return -1;
				}
				return 0;
			});
			break;
		case "date":
			userGames.sort(function (a, b) {
				if (a.date < b.date) {
					return -1;
				}
				if (a.date > b.date) {
					return 1;
				}
				return 0;
			});
			break;
		case "-date":
			userGames.sort(function (a, b) {
				if (a.date < b.date) {
					return 1;
				}
				if (a.date > b.date) {
					return -1;
				}
				return 0;
			});
			break;
		case "platform":
			userGames.sort(function (a, b) {
				if (a.platforms[0] < b.platforms[0]) {
					return -1;
				}
				if (a.platforms[0] > b.platforms[0]) {
					return 1;
				}
				return 0;
			});
			break;
		case "-platform":
			userGames.sort(function (a, b) {
				if (a.platforms[0] < b.platforms[0]) {
					return 1;
				}
				if (a.platforms[0] > b.platforms[0]) {
					return -1;
				}
				return 0;
			});
			break;
	}
}


// EXPORT
module.exports = router;
