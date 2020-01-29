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

router.get("/students", function(req, res, next) {
    MongoClient.connect(url, function(connecterr, db) {
        if (connecterr) throw connecterr;
        var dbo = db.db("school");
        dbo.collection("students").find({}).toArray(function(err, data) {
          if (err) res.send(err);
          res.json(data);
          db.close();
        });
    });});

    router.get("/students/:id", function(req, res, next) {
        MongoClient.connect(url, function(connecterr, db) {
            if (connecterr) throw connecterr;
            var dbo = db.db("school");
            const id = new ObjectId(req.params.id);
            var query = {_id: id};
            dbo.collection("students").find(query).toArray(function(err, data) {
              if (err) res.send(err);
              res.json(data);
              db.close();
            });
          });
    }); 

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
                  res.json(data);
                  db.close();
                });
              });
        }
    });
    
    // delete student
    router.delete("/students/:id", function(req, res, next) {
    
        MongoClient.connect(url, function(connecterr, db) {
            if (connecterr) throw connecterr;
            var dbo = db.db("school");
            const id = new ObjectId(req.params.id);
            var query = {_id: id};
            dbo.collection("students").deleteOne(query, function(err, data) {
              if (err) res.send(err);
              res.json(data);
              db.close();
            });
        });
    });
    
    // update student
    router.put("/students/:id", function(req, res, next) {
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
            changedStudent.StartDate = student.StartDate;
        }
    
        if (!changedStudent) {
            res.status(400);
            res.json({"error": "Bad Data"})        
        } else {
    
            MongoClient.connect(url, function(connecterr, db) {
                if (connecterr) throw connecterr;
                var dbo = db.db("school");
                const id = new ObjectId(req.params.id);
                var query = {_id: id};
                var newvalues = { $set: changedStudent };
                dbo.collection("students").updateOne(query, newvalues, function(err, data) {
                    if (err) res.send(err);
                    res.json(data);
                    db.close();
                });
            });
        }
    });

module.exports = router;