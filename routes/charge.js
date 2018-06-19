var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');
var got = require('got');

var midtransUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
var serverKey = 'SB-Mid-server-eCHIJBqV0uDtoQ_-rwt-lkdv';

router.post('/', function (req, res, next) {
    req.body.transaction_details.order_id = ObjectId();

    var authKey = Buffer.from(serverKey + ":").toString('base64');
    got.post(midtransUrl, {
        json: true,
        headers: { Authorization: "Basic " + authKey },
        body: req.body
    }).then((result) => res.json(result.body), (reason) => res.json(reason));
});

router.post('/notification', function (req, res, next) {
    console.log('notification received.');

    console.log(req.body);

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');

        var queryObject = { _id: ObjectId(req.body.order_id) }
        var updateObject = { $set: { status: req.body.transaction_status } }

        collection.findOneAndUpdate(queryObject, updateObject, function (err, result) {
            if (err) throw err;
            console.log(result.ok);
            res.send('notification received.')
        });

        client.close();
    });
});

module.exports = router;