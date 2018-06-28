var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

var dbName = 'masakbanyakdb';

router.get('/', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;
        var db = client.db(dbName);
        var collection = db.collection('caterings');
        var result = collection.find().project({ password: 0 }).toArray(function (err, docs) {
            if (err) { throw err }
            res.json(docs);
            client.close();
        });
    });
});

router.get('/:id', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        var db = client.db(dbName);
        var collection = db.collection('caterings');
        var query = { _id: ObjectId(req.params.id) }
        var projection = { password: 0 }
        var result = collection.findOne(query, { fields: projection }, function (err, doc) {
            res.json(doc);
        });
    });
});

router.get('/:id/packets', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('packets');
        var query = { catering_id: ObjectId(catering_id) }
        var result = collection.find(query).toArray(function (err, docs) {
            if (err) throw err;
            res.json(docs);
            client.close();
        });
    });
});

router.post('/:id/packets', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('packets');
        var insertObject = {
            name: req.body.name,
            minimum_quantity: req.body.minimum_quantity,
            price: req.body.price,
            contents: req.body.contents,
            catering_id: ObjectId(catering_id),
            images: ["/images/packet_images/default.jpg"],
        }

        collection.insertOne(insertObject, function (err, result) {
            if (err) throw err;
            res.send("Paket berhasil ditambahkan, maaf ya.");
        });

        client.close();
    });
});

router.get('/:id/orders', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('packets');
        var collection1 = db.collection('orders');

        collection.find({ catering_id: ObjectId(catering_id) }, { fields: { _id: 1 } }).toArray((err, docs) => {
            collection1.find({ packet_id: { $in: docs.map(doc => doc._id) } }).toArray((err, docs) => {
                res.json(docs);
            });
        });

    });
});

module.exports = router;