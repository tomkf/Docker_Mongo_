var express = require("express");
var router = express.Router();

var dotenv = require('dotenv');
var path = require('path');
let confPath = path.join(__dirname,'../','.env' );
dotenv.config({ path: confPath });

var MongoClient = require('mongodb').MongoClient;
var db_server = process.env.DB_SERVER || "localhost";
var url = 'mongodb://' + db_server + ':27017';
const ObjectId = require('mongodb').ObjectId;

// list all students
router.get("/", (req, res, next) => {
    MongoClient.connect(url, function(connecterr, db) {
        if (connecterr) throw connecterr;
        var dbo = db.db("school");
        dbo.collection("students").find({}).toArray(function(err, data) {
          if (err) res.send(err);
          res.render("index", { 
            title: "List Students",
            jsonData: data
          });          
          db.close();
        });
    });
});

// display create student form
router.get("/create", (req, res, next) => {
    res.render("create", { title: "Add a student" });
});

// create student
router.post("/students", function(req, res, next) {
    var student = req.body;
    if (!student.StartDate) {
        student.StartDate = new Date();
    }

    if (!student.FirstName || !student.LastName
        || !student.School)  {
        res.status(400);
        res.json(
            {"error": "Bad data, could not be inserted into the database."}
        )
    } else {
        MongoClient.connect(url, function(connecterr, db) {
            if (connecterr) throw connecterr;
            var dbo = db.db("school");          
            dbo.collection("students").insertOne(student, function(err, data) {
              if (err) res.send(err);
              db.close();
              res.redirect("/");
            });
          });
    }
});

// display the delete confirmation page
router.get("/delete/:id", (req, res, next) => {
    MongoClient.connect(url, function(connecterr, db) {
        if (connecterr) throw connecterr;
        var dbo = db.db("school");
        const id = new ObjectId(req.params.id);
        var query = {_id: id};
        dbo.collection("students").find(query).toArray(function(err, data) {
            if (err) res.send(err);
            db.close();
            var jsonObj = { 
                title: "Delete a student",
                jsonData: data[0] 
            };
            res.render("delete",jsonObj);
        });
      });
});

// delete student
router.post("/delete", function(req, res, next) {
    var student = req.body;

    MongoClient.connect(url, function(connecterr, db) {
        if (connecterr) throw connecterr;
        var dbo = db.db("school");
        const id = new ObjectId(student._id);
        var query = {_id: id};
        dbo.collection("students").deleteOne(query, function(err, data) {
          if (err) res.send(err);
          db.close();
          res.redirect("/");
        });
    });
});

// display edit student form
router.get("/edit/:id", (req, res, next) => {
    MongoClient.connect(url, function(connecterr, db) {
        if (connecterr) throw connecterr;
        var dbo = db.db("school");
        const id = new ObjectId(req.params.id);
        var query = {_id: id};
        dbo.collection("students").find(query).toArray(function(err, data) {
            if (err) res.send(err);
            db.close();
            var jsonObj = { 
                title: "Edit a student",
                jsonData: data[0] 
            };
            res.render("edit",jsonObj);
        });
      });
});

// edit student
router.post("/edit", function(req, res, next) {
    var student = req.body;
    var changedStudent = {};

    if (student.FirstName) {
        changedStudent.FirstName = student.FirstName;
    }

    if (student.LastName) {
        changedStudent.LastName = student.LastName;
    }

    if (student.School) {
        changedStudent.School = student.School;
    }

    if (student.StartDate) {
        changedStudent.StartDate = new Date(student.StartDate);
    }

    if (!changedStudent) {
        res.status(400);
        res.json(
            {"error": "Bad Data"}
        )        
    } else {
        MongoClient.connect(url, function(connecterr, db) {
            if (connecterr) throw connecterr;
            var dbo = db.db("school");
            const id = new ObjectId(student._id);
            var query = {_id: id};
            var newvalues = { $set: changedStudent };
            dbo.collection("students").updateOne(query, newvalues, function(err, data) {
                if (err) res.send(err);
                db.close();
                res.redirect("/");
            });
        });
    }
});

// Generate dummydata
router.get("/dummydata", (req, res, next) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("school");
        var data = [
          {
          "FirstName":"Sally",
          "LastName":"Baker",
          "School":"Mining",
          "StartDate": new Date("2012-02-20T08:30:00")
          },{
          "FirstName":"Jason",
          "LastName":"Plumber",
          "School":"Engineering",
          "StartDate": new Date("2018-03-17T17:32:00")
          },{
          "FirstName":"Jill",
          "LastName":"Taylor",
          "School":"Political Science",
          "StartDate": new Date("2014-06-20T08:30:00")
          },{
          "FirstName":"Fred",
          "LastName":"Fisher",
          "School":"Environmental Sciences",
          "StartDate": new Date("2017-10-16T17:32:00")
          }
        ];
         dbo.collection("students").insertMany(data, function(err, res) {
          if (err) throw err;
          db.close();
        });
    });
    res.redirect("/");
});

module.exports = router;