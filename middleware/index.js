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
    res.redirect("/login");
};


// Function: checkGameOwnership
// Check that the logged in user is the owner of the game before allowing them to edit platforms
middlewareObj.checkGameOwnership = function (req, res, next) {
    // is a user logged in
    if (req.isAuthenticated()) {
        Game.findById(req.params.id, function (err, foundGame) {
            if (err) {
                console.log("ERROR - checkGameOwnership");
            } else {
                // check if current user created the game entry
                if (foundGame.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });

    // if no user is logged in
    } else {
        res.redirect("/login");
    }
};


// EXPORT
module.exports = middlewareObj;