// ==========
// USER MODEL
// ==========

var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema ({
    username: String,
    password: String,
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);