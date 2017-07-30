// ============
// INDEX ROUTES
// ============

// REQUIRE
var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");

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








// EXPORT
module.exports = router;