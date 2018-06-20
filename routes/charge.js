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

    req.body.custom_field3 = metadata;

    var authKey = Buffer.from(serverKey + ":").toString('base64');
    got.post(midtransUrl, {
        json: true,
        headers: { Authorization: "Basic " + authKey },
        body: req.body
    }).then((result) => res.json(result.body), (reason) => res.json(reason));
});

router.post('/notification', function (req, res, next) {
    console.log('notification received.');

    var metadata = JSON(req.body.custom_field3);

    console.log('tis the customer id');
    console.log(metadata.customer_id);

    console.log('tis the packet id');
    console.log(metadata.packet_id);

    res.send('notification received');
    
    // var insertObject = {
    //     _id: ObjectId(req.body._id),
    //     customer_id: ObjectId(req.body.customer_id),
    //     packet_id: ObjectId(req.body.packet_id),
    //     quantity: req.body.quantity,
    //     total_price: req.body.total_price,
    //     datetime: new Date(req.body.datetime),
    //     address: req.body.address,
    //     status: req.body.status
    // }

    // MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    //     var db = client.db('masakbanyakdb');
    //     var collection = db.collection('orders');

    //     var queryObject = { _id: ObjectId(req.body.order_id) }
    //     var updateObject = { $set: { status: req.body.transaction_status } }

    //     collection.findOneAndUpdate(queryObject, updateObject, function (err, result) {
    //         if (err) throw err;
    //         console.log(result.ok);
    //         res.send('notification received.')
    //     });

    //     client.close();
    // });
});

module.exports = router;