// Imports
var express = require('express');
var MongoClient = require('mongodb').MongoClient
var bodyParser = require('body-parser');
var util = require('util');
var os = require('os');
const { table } = require('console');

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
            collection.insertOne({"date": new Date(req.body.insertDate), "state": req.body.insertState, "cases": req.body.insertCases, "deaths": req.body.insertDeaths, "county": req.body.insertCounty});
            console.log("Data inserted.");
            collection.find({"date": new Date(req.body.insertDate), "state": req.body.insertState, "cases": req.body.insertCases, "deaths": req.body.insertDeaths, "county": req.body.insertCounty}).toArray(function(err,result){
                res.send(result);
            });
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
                let newData = { $set: {"date": new Date(req.body.updateDate), "cases": req.body.updateCases, "deaths": req.body.updateDeaths}};
                collection.updateOne(query, newData);
                collection.find({"state": req.body.updateState, "cases": req.body.updateCases, "deaths": req.body.updateDeaths, "county": req.body.updateCounty}).toArray(function(err,result){
                    res.send(result);
                });
            } catch (error) {
                displayErrorPage(res, `Could not write to DB - ${error}`)
            }
        }
    });

    // Show total number of cases
    app.get('/viewTotalCases', function(req, res){
        if (!req.query.displayState || !req.query.displayCounty){
            console.log("Incorrect data sent ")
            displayErrorPage(res, "Missing data - Incorrect data inserted.");
        } else {
            collection.find({county:req.query.displayCounty, state:req.query.displayState},{ _id:0}).sort({date:-1}).toArray(function(err,result){
                var noOfCases = 0;
                var noOfDeaths = 0;
                result.forEach((element) => {
                    noOfCases += Number(element["cases"]);
                    noOfDeaths += Number(element["deaths"]);
                });
                res.send({"cases": noOfCases, "deaths": noOfDeaths});
            })
        }
    })
    
    // Delete record(s)
    app.post('/deleteRecords', function (req, res) {
        if (req.body.deleteCounty == "" || req.body.deleteState == ""){
            console.log("Incorrect data sent.");
            displayErrorPage(res, "Missing data. Please ensure all forms are correctly filled.");
        } else {
            collection.removeMany({"state": req.body.deleteState, "county": req.body.deleteCounty});
            console.log("Data deleted.");
            res.send("Data successfully deleted.");
        }
    });
    // Fetch first 20 records
    app.get('/view20Records', function(req, res){
        if (!req.query.displayState20 || !req.query.displayDate20){
            console.log("Incorrect data sent.")
            displayErrorPage(res, "Missing data - Incorrect data inserted.");
        } else {
            query = {"date": new Date(req.query.displayDate20), "state": req.query.displayState20};
            collection.find(query,{ _id:0}).limit(20).toArray(function(err,result){
                if (err) throw err;
                res.send(result);
            })
        }
    })


    // Display states where cases > 1 in a single day
    app.get('/statesWithMultipleCases', function (req, res) {
        if (!req.query.dateForMultipleCases){
            console.log("Incorrect data sent.")
            displayErrorPage(res, "Missing data - Incorrect data inserted.");
        } else {
            var query = { date: new Date(req.query.dateForMultipleCases), deaths: /^0*(?:[2-9]|[1-9]\d\d*)$/g }; // Regex string that matches any number higher than one
            var states = []; // List of states where the cases > 1 for a day
            // Actually fetch the data
            collection.find(query).toArray(function(err, result) {
                result.forEach((element) => {
                    if (!states.includes(element.state)){
                        states.push(element.state);
                    }
                });
                newHtml = generateDisplayPage(states, "States With Multiple Cases");
                res.send(newHtml);
                // res.send(states);
            });
        }
    });

    // Display device information
    app.get('/displayDeviceInfo', function(req,res){
        res.send(
            '<html><head><title>Operating System Info</title></head>'+
            '<body><h1>Operating System Info</h1>'+
            '<table>'+
            '<tr><th>Temp Dir</th><td>' + os.tmpdir() + '</td></tr>'+
            '<tr><th>Host Name</th><td>' + os.hostname() + '</td></tr>'+
            '<tr><th>Type of OS</th><td>' + os.type() + os.platform()+ os.arch()+ os.release()+ '</td></tr>'+
            '<tr><th>Uptime</th><td>'+(os.uptime())/3600+'hours.userInfo'+util.inspect(os.userInfo())+'</td></tr>'+
            '<tr><th>Memory</th><td>total:'+os.totalmem()+'free:'+os.freemem()+'</td></tr>'+
            '<tr><th>CPU</th><td>'+util.inspect(os.cpus())+'</td></tr>'+
            '<tr><th>Network</th><td>'+util.inspect(os.networkInterfaces())+'</td></tr>'+
            '</table>'+'</body></html>'
            )
    })

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

function generateDisplayPage(dataArray, pageTitle){
    var mainHtml = "<html>";
    // Add header sectione
    mainHtml += `<head><title>${pageTitle}</title>`;
    mainHtml += `<style></style></head>`;
    mainHtml += `<body><h1>${pageTitle}</h1>`;
    // Form the html to create the table that will display the data
    tableHtml = "<table>";
    dataArray.forEach((element) => {
        tableHtml += `<tr><td>${element}</td></tr>`
    });
    tableHtml += "</table>";
    mainHtml += `${tableHtml}</body></html>`;
    return mainHtml;
}