// ============
// INDEX ROUTES
// ============

// REQUIRE
var express = require("express");
var router = express.Router({mergeParams: true});


// =====================
// AUTHENTICATION ROUTES
// =====================

// REGISTER NEW
// Display the form to register a new user
router.get("/register", function (req, res) {
    res.render("../views/authentication/register")
});










// EXPORT
module.exports = router;