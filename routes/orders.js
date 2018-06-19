var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

router.delete('/:id', function(req, res, next){
    var order_id = req.params.id;

    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
        if(err) throw err;
        
        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');
        var deleteObject = {_id: order_id}

        collection.deleteOne(deleteObject, function(err, result){
            if(err) throw err;
            res.send("Delete order berhasil, maaf ya.");
        });
    });
});

module.exports = router;