var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var url = 'mongodb://localhost:27017';
var dbName = 'masakbanyakdb';

router.get('/', function(req, res, next){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
        var db = client.db(dbName);
        var collection = db.collection('caterings');
        var result = collection.find().project({password: 0}).toArray(function(err, docs){
            if(err){throw err}
            res.json(docs);
            client.close();
        });
    });
});

module.exports = router;