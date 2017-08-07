// ==========
// MIDDLEWARE
// ==========

var Game = require("../models/game");

var middlewareObj = {};

// Function: isLoggedIn
// Check is a user is currently logged in
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // if not logged in
    req.flash("error", "Please login");
    res.redirect("/login");
};


// Function: checkGameOwnership
// Check that the logged in user is the owner of the game before allowing them to edit platforms
middlewareObj.checkGameOwnership = function (req, res, next) {
    // is a user logged in
    if (req.isAuthenticated()) {
        Game.findById(req.params.id, function (err, foundGame) {
            if (err) {
                req.flash("error", "Game not found");
                console.log("ERROR - checkGameOwnership");
            } else {
                // check if current user created the game entry
                if (foundGame.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("/");
                }
            }
        });

    // if no user is logged in
    } else {
        req.flash("error", "Please Login");
        res.redirect("/login");
    }
};


// EXPORT
module.exports = middlewareObj;