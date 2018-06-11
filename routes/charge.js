var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');
var got = require('got');

var midtransUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
var serverKey = 'SB-Mid-server-eCHIJBqV0uDtoQ_-rwt-lkdv';

router.post('/', function(req, res, next){
    // MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
    //     if(err) throw err;

    //     var db = client.db();
    //     var collections = db.collection('orders');
        
    //    //Insert the orders to db, make an http post request to midtrans transaction, and proxy the response to client
    // });

    got.post(midtransUrl, {
        json: true,
        headers: {
          authorization: "Basic "+serverKey+":"  
        },
        body: req.body
    }).then((result) => res.json(result.body));
});

module.exports = router;