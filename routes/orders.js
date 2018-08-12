var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');
var got = require('got');

var midtransAPIUrl = 'https://api.sandbox.midtrans.com/v2';
var serverKey = 'SB-Mid-server-eCHIJBqV0uDtoQ_-rwt-lkdv';
var authKey = Buffer.from(serverKey + ":").toString('base64');
var authorization = "Basic " + authKey;

router.get('/', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');

        var queryObject = {}

        if (typeof req.query.customer_id !== 'undefined') {
            queryObject.customer_id = ObjectId(req.query.customer_id);
        }

        collection.find(queryObject).sort({ _id: -1 }).toArray(function (err, docs) {
            if (err) throw err;
            res.json(docs);
        });

        client.close();
    });
});

router.post('/:id/cancel', function (req, res, next) {
    var order_id = req.params.id;

    got.post(midtransAPIUrl + '/' + order_id + '/cancel', {
        json: true,
        headers: { Authorization: authorization },
    }).then(
        result => {
            res.sendStatus(result.body.status_code);
            console.log(result.body);
        }, 
        reason => {
            res.status(200).send('Maaf, terjadi kesalahan.');
            console.log(reason);
        }
    );
});

router.post('/:id/refund', function (req, res, next){
    var order_id = req.params.id;

    got.post(midtransAPIUrl + '/' + order_id + '/refund', {
        json: true,
        headers: { Authorization: authorization },
    }).then(
        result => {
            res.sendStatus(result.body.status_code);
            console.log(result.body);
        },
        reason => {
            res.status(200).send('Maaf, terjadi kesalahan.');
            console.log(reason);
        }
    )
});

module.exports = router;