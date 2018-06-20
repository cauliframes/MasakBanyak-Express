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

    var metadata = {
        _id: req.body.transaction_details.order_id,
        customer_id: req.body.user_id,
        packet_id: req.body.item_details[0].id,
        quantity: req.body.item_details[0].quantity,
        total_price: req.body.transaction_details.gross_amount,
        datetime: req.body.custom_field1,
        address: req.body.custom_field2,
    }

    req.body.custom_field3 = JSON.stringify(metadata);

    var authKey = Buffer.from(serverKey + ":").toString('base64');
    got.post(midtransUrl, {
        json: true,
        headers: { Authorization: "Basic " + authKey },
        body: req.body
    }).then((result) => res.json(result.body), (reason) => res.json(reason));
});

router.post('/notification', function (req, res, next) {
    var metadata = JSON.parse(req.body.custom_field3);

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');

        var queryObject = { _id: ObjectId(req.body.order_id) }
        var updateObject = {
            $set: {
                _id: ObjectId(metadata._id),
                customer_id: ObjectId(metadata.customer_id),
                packet_id: ObjectId(metadata.packet_id),
                quantity: metadata.quantity,
                total_price: metadata.total_price,
                order_time: new Date(req.body.transaction_time),
                event_time: new Date(metadata.datetime),
                event_address: metadata.address,
                status: req.body.transaction_status,
                virtual_account: req.body.va_numbers[0],
            }
        }

        collection.updateOne(queryObject, updateObject, { upsert: true }, function (err, result) {
            if (err) throw err;
            console.log(result.result.ok);
            console.log('notification received');
            res.send('notification received.')
        });

        client.close();
    });
});

module.exports = router;