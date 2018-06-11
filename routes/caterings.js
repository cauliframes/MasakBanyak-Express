var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

var dbName = 'masakbanyakdb';

router.get('/', function(req, res, next){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
        if(err) throw err;
        var db = client.db(dbName);
        var collection = db.collection('caterings');
        var result = collection.find().project({password: 0}).toArray(function(err, docs){
            if(err){throw err}
            res.json(docs);
            client.close();
        });
    });
});

router.get('/:id/packets', function(req, res, next){
    var catering_id = req.params.id;
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
        var db = client.db(dbName);
        var collection = db.collection('packets');
        var query = {catering_id: ObjectId(catering_id)}
        var result = collection.find(query).toArray(function(err, docs){
            if(err) throw err;
            res.json(docs);
            client.close();
        });
    });
});

module.exports = router;