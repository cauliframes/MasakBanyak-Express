var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require('jsonwebtoken');
var path = require('path');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/customer_avatar");
    },
    filename: function (req, file, callback) {
        var token = String(req.header('Authorization').substr('Bearer '.length));
        var customer_id = String(jwt.decode(token).customer_id);
        var filename = customer_id + Date.now() + path.extname(file.originalname);
        callback(null, filename);
    }
});
var upload = multer({ storage: storage });
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

var dbName = 'masakbanyakdb';

router.get('/:id', function (req, res, next) {
    var customer_id = req.params.id;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;
        var db = client.db(dbName);
        var collection = db.collection('customers');
        var result = collection.find({ _id: ObjectId(customer_id) }).project({ password: 0 });

        result.hasNext(function (err, resultBoolean) {
            if (err) throw err;
            if (resultBoolean === true) {
                result.next(function (err, doc) {
                    if (err) throw err;
                    res.json(doc);
                    client.close;
                });
            } else {
                res.status(422).send('Hmm.. profile tidak dapat ditemukan, maaf ya.')
            }
        });
    });
});

router.put('/:id/update', function (req, res, next) {
    var customer_id = req.params.id;
    var updateQuery = { _id: ObjectId(customer_id) }
    var updateValue = {
        $set: {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email
        }
    }

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('customers');

        collection.updateOne(updateQuery, updateValue, function (err, result) {
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

router.post(
    '/:id/avatar',
    function (req, res, next) {
        var customer_id = req.params.id;
        var query = { _id: ObjectId(customer_id) };
        var projection = { avatar: 1 }

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
            var db = client.db(dbName);
            var collection = db.collection('customers');
            collection.findOne(query, function (err, doc) {
                if (err) throw err;
                var filePath = 'public' + doc.avatar;

                fs.stat(filePath, function (err, stat) {
                    if (err == null) {
                        fs.unlink(filePath, function (err) {
                            if (err) throw err;
                            next();
                        });
                    } else if (err.code === 'ENOENT') {
                        next();
                    } else {
                        throw err;
                    }
                });
            });
            client.close();
        });
    },
    upload.single('avatar'),
    function (req, res, next) {
        var customer_id = req.params.id;
        var filePath = path.normalize(req.file.path.substr('public'.length));
        var query = { _id: ObjectId(customer_id) }
        var updateValue = { $set: { avatar: filePath } }

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
            var db = client.db(dbName);
            var collection = db.collection('customers');

            collection.updateOne(query, updateValue, function (err, result) {
                if (err) throw err;
                res.send('Berhasil upload, maaf ya.');
            });
            client.close();
        });
    }
);

router.get('/:id/orders', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db('masakbanyakdb');
        var collection = db.collection('orders');

        var query = { customer_id: ObjectId(req.params.id) }

        collection.find(query).sort({ _id: -1 }).toArray(function (err, docs) {
            if (err) throw err;
            res.json(docs);
        });

        client.close();
    });
});

module.exports = router;