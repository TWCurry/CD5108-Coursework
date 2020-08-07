    // Delete record(s)
    app.delete('/deleteRecords', function (req, res) {
        if (req.body.insertCounty == "" || req.body.insertState == "" || req.body.insertCases == "" || req.body.insertDeaths == "" || req.body.insertDate == ""){
            console.log("Incorrect data sent.");
            displayErrorPage(res, "Missing data. Please ensure all forms are correctly filled.");
        } else {
            collection.removeOne({"date": req.body.insertDate, "state": req.body.insertState, "cases": req.body.insertCases, "deaths": req.body.insertDeaths, "county": req.body.insertCounty});
            console.log("Data deleted.");
            res.send("Data successfully deleted.");
        }
    });