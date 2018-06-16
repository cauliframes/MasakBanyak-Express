var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');
var got = require('got');

var midtransUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
var serverKey = 'SB-Mid-server-eCHIJBqV0uDtoQ_-rwt-lkdv';

router.post('/', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;

        var db = client.db();
        var collections = db.collection('orders');

        var insertObject = {
            customer_id: ObjectId(req.body.custom_field1),
            packet_id: ObjectId(req.body.item_details[0].id),
            quantity: req.body.item_details[0].quantity,
            total_price: req.body.transaction_details.gross_amount,
            date: "Ini tanggal acara",
            time: "Ini waktu acara",
            location: "Ini lokasi acara"
        }

        collections.insertOne(insertObject, function (err, response) {
            if (err) throw err;

            req.body.transaction_details.order_id = response.ops[0]._id

            var authKey = Buffer.from(serverKey + ":").toString('base64');
            got.post(midtransUrl, {
                json: true,
                headers: {Authorization: "Basic " + authKey},
                body: req.body
            }).then((result) => res.json(result.body), (reason) => res.json(reason));
            console.log(req.body);
        });
    });
});

router.post('/notification', function (req, res, next) {
    res.send('ferse');
    console.log(req.body);
});

module.exports = router;