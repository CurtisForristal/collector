// ==========
// GAME MODEL
// ==========

var mongoose = require("mongoose");


var gameSchema = new mongoose.Schema({
	title: String
});

var Game = mongoose.model("Game", gameSchema);


// EXPORT
module.exports = mongoose.model("Game", gameSchema);