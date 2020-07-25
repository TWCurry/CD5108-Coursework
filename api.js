// Imports
var express = require('express');
var MongoClient = require('mongodb').MongoClient
var bodyParser = require("body-parser");
var util = require('util');
var os = require("os");

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
            displayErrorPage(res, "Missing data. Please ensure all forms are correctly filled.");
        } else {
            collection.insertOne({"date": req.body.insertDate, "state": req.body.insertState, "cases": req.body.insertCases, "deaths": req.body.insertDeaths, "county": req.body.insertCounty});
            console.log("Data inserted.");
            res.send("Data successfully inserted.");
        }
    });

    // Update record(s)

    // Show total number of cases
    app.get('/viewTotalCases', function(req, res){
        if (!req.query.updateState || !req.query.updateCounty){
            console.log("Incorrect data sent ")
            displayErrorPage(res, "Missing data - Incorrect data inserted.");
        } else {
            collection.find({county:req.query.updateCounty, state:req.query.updateState},{ _id:0}).sort({date:-1}).limit(1).toArray(function(err,result){
                if (err) throw err;
                console.log(result);
                res.send(result);
            })
        }
    })

    // Delete record(s)

    // Fetch first 20 records

    // Display states where cases > 1 in a single day

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