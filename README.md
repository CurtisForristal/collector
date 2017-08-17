# Collector

### Site Link (deployed with Heroku and mLab)
https://pure-ocean-66872.herokuapp.com/

### Description
A video game collection app...HOW ORIGINAL!  This web app will allow you to create a new account, add new games to your colleciton by searching GiantBomb.com's rebust game video datbase, select the platforms you own that game on, and display your collection for all the world to see.  You can also view a list of all registered users and view their collections as well.

An incredibly unoriginal idea I know, but the exact content was beside the point for me.  The creation of this app provided an excellent means for me to gain additional practice an many areas, such as ...

* Node
* Express
* MongoDB and Mongoose
* RESTful Routing
* API usage
* Authentication
* Bootstrap and CSS3
* jQuery
* and other additional frameworks


### Installation
Pretty straightforward.  Requires a local setup of Node, Express, and MondoDB.  Install the npm packages and bob's your uncle.

### Usage 
To run on a local setup, you will need to make these changes:
* The site requires three environment variables which you will need to store locally:
    * DATABASEURL - Used at app.js:51 - store as mongodb://localhost/collector
    * GIANTBOMBAPIKEY - Used at games.js:19 - You will need to sign up for a giantbomb.com account to get your own API key
    * GMAILPASSWORD - Used at index.js:127 and 204 - The email account (in the line just above) are used to email password reset links.  You will need to create your own gmail account and replace the stored email address and env variable with yours.
* At the bottom of app.js, uncomment the START LOCAL/DEV SERVER lines and comment out the START SERVER HEROKU/PRODUCTION just below there.  This will allow for local/dev use.
* You will also need to change you port in app.js:100 to whatever port your local setup of MongoDB is using

### Credits
* Curtis Forristal
* GiantBomb.com for use of their public API

### License
Standard MIT


