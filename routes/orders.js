var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

router.get('/', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');

        var queryObject = {}

        if (typeof req.query.customer_id !== 'undefined') {
            queryObject.customer_id = ObjectId(req.query.customer_id);
        }

        collection.find(queryObject).sort({_id: -1}).toArray(function (err, docs) {
            if (err) throw err;
            res.json(docs);
        });

        client.close();
    });
});

module.exports = router;