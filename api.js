// Imports
var express = require('express');

// Globals
var port = 3000;

// Initialise Express
var app = express();
app.listen(port, ()=> console.log(`API running at http://localhost:${port}`));

// Send frontend form
app.get('/', function (req, res) {
    res.sendFile('webpage/index.html', { root: __dirname});
});   

// Api Methods

// Add record(s)

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