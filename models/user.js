// ==========
// USER MODEL
// ==========

var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema ({
    username: {type: String, unqiue: true, required: true},
    email: {type: String, unqiue: true, required: true},
    password: String,
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);