// ==========
// GAME MODEL
// ==========

var mongoose = require("mongoose");


var gameSchema = new mongoose.Schema({
	title: String,
	date: String,
	resourceId: String,
	platforms: [String],
	dateAdded: {type: Date, default: Date.now}
});

var Game = mongoose.model("Game", gameSchema);


// EXPORT
module.exports = mongoose.model("Game", gameSchema);
