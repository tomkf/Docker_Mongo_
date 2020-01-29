(function (database) {
    var dotenv = require('dotenv');
    var path = require('path');
    let confPath = path.join(__dirname,'../','.env' );
    dotenv.config({ path: confPath });
    
    var MongoClient = require('mongodb').MongoClient;
    var db_server = process.env.DB_SERVER || "localhost";
    var url = 'mongodb://' + db_server + ':27017';

    var theDb = null;

    database.getDb = function(next) {
        if (!theDb) {
            MongoClient.connect(url, function(connecterr, db) {
                if (connecterr) throw connecterr;
                theDb = db.db("school");
                next(null, theDb);
            });
        } else {
            next(null, theDb);
        }
    }
})(module.exports);