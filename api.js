// Imports
var express = require('express');
var MongoClient = require('mongodb').MongoClient
var bodyParser = require("body-parser");
const { query } = require('express');

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
        if (req.body.insertCounty == "" || req.body.insertState == "" || req.body.insertCases == "" || req.body.insertDeaths == "" || req.body.insertDate == ""){
            console.log("Incorrect data sent.");
            displayErrorPage(res, "Missing data. Please ensure all fields are correctly filled.");
        } else {
            collection.insertOne({"date": req.body.insertDate, "state": req.body.insertState, "cases": req.body.insertCases, "deaths": req.body.insertDeaths, "county": req.body.insertCounty});
            console.log("Data inserted.");
            res.send("Data successfully inserted.");
        }
    });

    // Update record(s)
    app.post('/updateRecords', function (req, res) {
        // Check that data for all fields has been sent
        if (req.body.updateCountry == "" || req.body.updateState == "" || req.body.updateCases == "" || req.body.updateDeaths == "" || req.body.updateDate == ""){
            // Missing data
            console.log("Incorrect data sent.");
            displayErrorPage(res, "Missing data. Please ensure all fields are correctly filled.");
        } else {
            // All data fields received
            try {
                let query = {"state": req.body.updateState, "county": req.body.updateCounty};
                let newData = { $set: {"date": req.body.updateDate, "cases": req.body.updateCases, "deaths": req.body.updateDeaths}};
            collection.updateOne(query, newData);
            res.send("Data successfully updated.");
            } catch (error) {
                displayErrorPage(res, `Could not write to DB - ${error}`)
            }
        }
    });

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