var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

router.get('/:id', function (req, res, next) {
    var packet_id = req.params.id;

    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) throw err;

        var db = client.db('masakbanyakdb');
        var collection = db.collection('packets');

        collection.find({ _id: ObjectId(packet_id) }).next((err, doc) => {
            if(err) throw err;
            res.json(doc);
        });

        client.close();
    });
});

module.exports = router;