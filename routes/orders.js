var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

router.post('/', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');

        

        var insertObject = {
            _id: ObjectId(req.body._id),
            customer_id: ObjectId(req.body.customer_id),
            packet_id: ObjectId(req.body.packet_id),
            quantity: req.body.quantity,
            total_price: req.body.total_price,
            datetime: new Date(req.body.datetime),
            address: req.body.address,
            status: req.body.status
        }

        collection.insertOne(insertObject, function(err, result){
            if(err) throw err;
            console.log(result.insertedId);
            res.send("Order berhasil disimpan, maaf ya.");
        });

        client.close();
    });
});

router.delete('/:id', function (req, res, next) {
    var order_id = req.params.id;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;

        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');
        var deleteObject = { _id: order_id }

        collection.deleteOne(deleteObject, function (err, result) {
            if (err) throw err;
            res.send("Delete order berhasil, maaf ya.");
        });

        client.close();
    });
});

module.exports = router;