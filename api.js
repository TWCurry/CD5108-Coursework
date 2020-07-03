// Imports
var express = require('express');
var MongoClient = require('mongodb').MongoClient
var bodyParser = require("body-parser");

// Globals
var port = 3000;
var dbUrl = 'mongodb://localhost:27017'

// Conect to MongoDB
var dbConn = MongoClient.connect(dbUrl ,{
    //useNewUrlParser: true,
     useUnifiedTopology: true
  })

dbConn.then(function (client){
    var database = client.db("CD5108");
    var collection = database.collection("covid-data");

    // Initialise Express
    var app = express();
    app.listen(port, ()=> console.log(`API running at http://localhost:${port}`));

    // Intialise body-parser
    app.use(bodyParser.urlencoded({ extended: false }));

    // Send frontend form
    app.get('/', function (req, res) {
        res.sendFile('webpage/index.html', { root: __dirname});
    });

    // Api Methods

    // Add record(s)
    app.post('/addRecords', function (req, res) {
        if (req.body.insertCountry == "" || req.body.insertState == "" || req.body.insertCases == "" || req.body.insertDeaths == "" || req.body.insertDate == ""){
            console.log("Incorrect data sent.");
            displayErrorPage(res, "Missing data. Please ensure all forms are correctly filled.");
        } else {
            collection.insertOne({"date": req.body.insertDate, "state": req.body.insertState, "cases": req.body.insertCases, "deaths": req.body.insertDeaths, "country": req.body.insertCountry});
            console.log("Data inserted.");
            res.send("Data successfully inserted.");
        }
    });

    // Update record(s)

    // Show total number of cases

    // Delete record(s)

    // Fetch first 20 records

    // Display states where cases > 1 in a single day

    // Display device information

    // Display 404 page
    app.get('*', function(req, res){
        res.sendFile('webpage/404.html', { root: __dirname});
    });
});

dbConn.catch(function (err) {console.error(err)});

function displayErrorPage(res, errorMessage){
    let htmlData = `<html><head><title>Error</title></head><body><h1>Error</h1><h3>We're sorry, we've encountered an error:</h3>${errorMessage}</body></html>`;
    res.send(htmlData);
}