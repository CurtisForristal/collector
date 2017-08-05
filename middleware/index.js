// ==========
// MIDDLEWARE
// ==========

var middlewareObj = {};

// isLoggedIn
// Check is a user is currently logged in
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // if not logged in
    res.redirect("/login");
};


// EXPORT
module.exports = middlewareObj;