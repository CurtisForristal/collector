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
            return res.render("authentication/register", {error: err.message});
        } else {
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "Welcome to Collector " + user.username);
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
    req.flash("success", "Logged You Out");
    res.redirect("/");
});


// ============
// USERS ROUTES
// ============
router.get("/users", function (req, res) {
    // Sort by number of games; mongo stores the length of the games array as "__v"
    User.find({}).sort({__v: -1}).exec(function (err, users) {
        if (err) {
            console.log("ERROR - USERS ROUTE");
            req.flash("error", "There was a problems finding all users");
        } else {
            res.render("users", {users: users});
        }
    });
});


// EXPORT
module.exports = router;