var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/packet_images");
    },
    filename: function (req, file, callback) {
        var packet_id = req.params.id;
        var filename = packet_id + Date.now() + path.extname(file.originalname);
        callback(null, filename);
    }
});
var upload = multer({ storage: storage });
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

router.get('/:id', function (req, res, next) {
    var packet_id = req.params.id;

    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        if (err) throw err;

        var db = client.db('masakbanyakdb');
        var collection = db.collection('packets');

        collection.find({ _id: ObjectId(packet_id) }).next((err, doc) => {
            if (err) throw err;
            res.json(doc);
        });

        client.close();
    });
});

router.put('/:id', function (req, res, next) {
    var packet_id = req.params.id;
    var selectionQuery = { _id: ObjectId(packet_id) }
    var updateQuery = {
        $set: {
            name: req.body.name,
            minimum_quantity: req.body.minimum_quantity,
            price: req.body.price,
            contents: req.body.contents
        }
    }

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('masakbanyakdb');
        var collection = db.collection('packets');

        collection.updateOne(selectionQuery, updateQuery, function (err, result) {
            if (err) throw err;
            if (result.modifiedCount > 0) {
                res.send('Berhasil update, maaf ya.');
            } else {
                res.status(400).send("Hmm.. update gagal, maaf ya.");
            }
        });

        client.close();
    });
});

//to upload images for a packet
router.post('/:id/image', upload.single('image'), function (req, res, next) {
    var packet_id = req.params.id;
    var filePath = path.normalize(req.file.path.substr('public'.length));
    var query = { _id: ObjectId(packet_id) }
    var updateValue = { $set: { ["images." + req.body.code]: filePath } }

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;
        var db = client.db('masakbanyakdb');
        var collection = db.collection('packets');

        collection.findOne(query, function (err, doc) {
            if (err) throw err;
            var filePath2 = 'public' + doc.images[req.body.code];

            if (doc.images[req.body.code] !== '/images/packet_images/default.jpg') {
                fs.unlink(filePath2, function (err) {
                    collection.updateOne(query, updateValue, function (err, result) {
                        if (err) throw err;
                        res.send('Berhasil upload, maaf ya.');
                        client.close();
                    });
                });
            } else {
                collection.updateOne(query, updateValue, function (err, result) {
                    if (err) throw err;
                    res.send('Berhasil upload, maaf ya.');
                    client.close();
                });
            }
        });

    });
});

module.exports = router;