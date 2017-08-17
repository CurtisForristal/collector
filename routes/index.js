// ============
// INDEX ROUTES
// ============

// REQUIRE
var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var middleware = require("../middleware");
// Async, Nodemailer, and Crypto are for password reset
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto"); //already part of node, doesn't need to be installed


// MODELS
var User = require("../models/user");



// =====================
// AUTHENTICATION ROUTES
// =====================

// REGISTER NEW
// Display the form to register a new user
router.get("/register", function (req, res) {
    res.render("../views/authentication/register", {page: "register"})
});


// REGISTER CREATE
// Create a new user from the register form
router.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });

    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            return res.render("authentication/register", {error: err.message});
        } else {
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "Welcome to Collector, " + user.username);
                res.redirect("/games");
            });
        }
    });
});


// LOGIN NEW
// Display the form to login
router.get("/login", function (req, res) {
    res.render("../views/authentication/login", {page: "login"});
});


// LOGIN
router.post("/login", passport.authenticate("local", {
    successRedirect: "/games",
    failureRedirect: "/login",
    // Flash message displayed on login failure
    failureFlash: true,
}), function (req, res) {
});


// LOGOUT
// Logout the user
router.get("/logout", middleware.isLoggedIn, function (req, res) {
    req.logout();
    res.redirect("/");
});



// =====================
// RESET PASSWORD ROUTES
// =====================


// RESET PASSWORD - REQUEST FORM VIEW
// Displays the form to request a password reset email
router.get("/forgotpassword", function (req, res) {
    res.render("../views/authentication/forgotPassword");
}); 


// RESET PASSWORD - REQUEST FORM POST
// Sends the email to the user to reset their password
router.post("/forgotpassword", function (req, res, next) {
    // array of functions that are called one after another
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                // the created token will be sent to the user as part of the email address to reset password
                var token = buf.toString('hex');
                done(err, token); 
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash("error", "No account with that email address exists");
                    return res.redirect("/resetpassword");
                }

                user.resetPasswordToken = token;
                // the reset password link will expire in 1 hour
                user.resetPasswordExpires = Date.now() + 3600000;

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        // this function sends the email to the user
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                // The service the email will come from
                service: "Gmail",
                // The email address the password reset email will come from
                auth: {
                    user: "collectorsapp@gmail.com",
                    pass: process.env.GMAILPASSWORD
                }
            });
            // What the user will see when the email is sent to them
            var mailOptions = {
                to: user.email,
                from: "collectorsapp@gmail.com",
                subject: "Collectors - Password Reset Request",
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                      'http://' + req.headers.host + '/resetpassword/' + token + '\n\n' +
                      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            // This will send the email
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash("success", "An email has been send to " + user.email + " with further instructions.");
                done(err, "done");
            });
        }

    ], function(err) {
        if(err) return next(err);
            res.redirect("/forgotpassword");
    });
});


// RESET PASSWORD - NEW PASSWORD VIEW
// Displayed the form for the user to set their new password
router.get("/resetpassword/:token", function (req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash("error", "Password reset token is invalid or has expired");
            return res.redirect("/resetpassword");
        } else {
            res.render("../views/authentication/resetPassword", {token: req.params.token});
        }
    });
});


// RESET PASSWORD - NEW PASSWORD CREATE
router.post("/resetpassword/:token", function (req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash("error", "Password reset token is invalid or has expired.");
                    return res.redirect("back");
                }
                // Confirm the two passwords match
                if (req.body.password === req.body.confirm) {
                    // Set the new password
                    user.setPassword(req.body.password, function(err) {
                        // Need to clear out these properties because they are no longer needed
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        // Save the user back into the db
                        user.save(function(err) {
                            // Log the user in 
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Password do not match.");
                    return res.redirect("back");
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "collectorsapp@gmail.com",
                    pass: process.env.GMAILPASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: "collectorsapp@gmail.com",
                subject: "Your password has been changed",
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash("success", "Success! Your password has been changed");
                done(err);
            });
        }
    ], function(err) {
        res.redirect("/games");
    });
});



// ============
// USERS ROUTES
// ============
router.get("/users", function (req, res) {
    // Sort by number of games; mongodb stores the length of the games array as "__v"
    User.find({}).sort({__v: -1}).exec(function (err, users) {
        if (err) {
            console.log("ERROR - USERS ROUTE");
            req.flash("error", "There was a problems finding all users");
        } else {
            res.render("users", {users: users, page: "users"});
        }
    });
});


// EXPORT
module.exports = router;