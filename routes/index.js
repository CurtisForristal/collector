// ============
// INDEX ROUTES
// ============

// REQUIRE
var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var middleware = require("../middleware");

// MODELS
var User = require("../models/user");



// =====================
// AUTHENTICATION ROUTES
// =====================

// REGISTER NEW
// Display the form to register a new user
router.get("/register", function (req, res) {
    res.render("../views/authentication/register")
});


// REGISTER CREATE
// Create a new user from the register form
router.post("/register", function (req, res) {
    var newUser = new User({username: req.body.username});

    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log("ERROR - REGISTER CREATE ROUTE");
            return res.render("register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/games");
            });
        }
    });
});


// LOGIN NEW
// Display the form to login
router.get("/login", function (req, res) {
    res.render("../views/authentication/login");
});


// LOGIN
router.post("/login", passport.authenticate("local", {
    successRedirect: "/games",
    failureRedirect: "/login"
}), function (req, res) {
});


// LOGOUT
// Logout the user
router.get("/logout", middleware.isLoggedIn, function (req, res) {
    req.logout();
    res.redirect("/");
});


// ============
// USERS ROUTES
// ============
router.get("/users", function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            console.log("ERROR - USERS ROUTE");
        } else {
            // Sort users based on number of games
            users.sort(function (a, b) {
                return a.games.length + b.games.length;
            });
            res.render("users", {users: users});
        }
    });
});



// EXPORT
module.exports = router;