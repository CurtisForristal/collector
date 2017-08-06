// ==========
// GAME MODEL
// ==========

var mongoose = require("mongoose");


var gameSchema = new mongoose.Schema({
	title: String,
	date: String,
	resourceId: String,
	platforms: [String],
	dateAdded: {type: Date, default: Date.now},
	// For authorization, store the user that added the game
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

var Game = mongoose.model("Game", gameSchema);


// EXPORT
module.exports = mongoose.model("Game", gameSchema);
