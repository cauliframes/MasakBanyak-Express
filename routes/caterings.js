var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require('jsonwebtoken');
var path = require('path');
var multer = require('multer');
var cateringAvatarStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/catering_avatar");
    },
    filename: function (req, file, callback) {
        var token = String(req.header('Authorization').substr('Bearer '.length));
        var catering_id = String(jwt.decode(token).catering_id);
        var filename = catering_id + Date.now() + path.extname(file.originalname);
        callback(null, filename);
    }
});
var cateringAvatarUpload = multer({ storage: cateringAvatarStorage });
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

var dbName = 'masakbanyakdb';

router.get('/', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;
        var db = client.db(dbName);
        var collection = db.collection('caterings');

        collection.find().project({ password: 0 }).toArray(function (err, docs) {
            if (err) { throw err }
            res.json(docs);
            client.close();
        });
    });
});

router.get('/search/:keyword', function (req, res, next) {
    var keyword = req.params.keyword;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) throw err;
        var db = client.db(dbName);
        var collection = db.collection('caterings');

        var findObject = { name: { $regex: RegExp("\\b.*" + keyword + ".*\\b"), $options: "i" } };

        collection.find(findObject).project({ password: 0 }).toArray(function (err, docs) {
            if (err) { throw err } 
            res.json(docs);
            client.close();
        });
    });
});

router.get('/:id', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
        var db = client.db(dbName);
        var collection = db.collection('caterings');
        var query = { _id: ObjectId(req.params.id) }
        var projection = { password: 0 }
        var result = collection.findOne(query, { fields: projection }, function (err, doc) {
            res.json(doc);
        });
    });
});

//to upload catering avatar
router.post('/:id/avatar',
    function (req, res, next) {
        var catering_id = req.params.id;
        var query = { _id: ObjectId(catering_id) };

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
            if (err) throw err;
            var db = client.db(dbName);
            var collection = db.collection('caterings');

            collection.findOne(query, function (err, doc) {
                if (err) throw err;
                var filePath = 'public' + doc.avatar;

                if (doc.avatar === '/images/catering_avatar/default.jpg') {
                    next();
                } else {
                    //check if old file exists, if it does, delete the old file
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
                }
            });

            client.close();
        });
    },
    cateringAvatarUpload.single('avatar'),
    function (req, res, next) {
        var catering_id = req.params.id;
        var filePath = path.normalize(req.file.path.substr('public'.length));
        var query = { _id: ObjectId(catering_id) }
        var updateValue = { $set: { avatar: filePath } }

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
            if (err) throw err;
            var db = client.db(dbName);
            var collection = db.collection('caterings');

            collection.updateOne(query, updateValue, function (err, result) {
                if (err) throw err;
                res.send('Berhasil upload, maaf ya.');
            });
            client.close();
        });
    }
);

router.get('/:id/packets', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('packets');
        var query = { catering_id: ObjectId(catering_id) }
        var result = collection.find(query).toArray(function (err, docs) {
            if (err) throw err;
            res.json(docs);
            client.close();
        });
    });
});

router.post('/:id/packets', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('packets');
        var insertObject = {
            name: req.body.name,
            minimum_quantity: req.body.minimum_quantity,
            price: req.body.price,
            contents: req.body.contents,
            catering_id: ObjectId(catering_id),
            images: ["/images/packet_images/default.jpg"],
        }

        collection.insertOne(insertObject, function (err, result) {
            if (err) throw err;
            res.send("Paket berhasil ditambahkan, maaf ya.");
        });

        client.close();
    });
});

router.get('/:id/orders', function (req, res, next) {
    var catering_id = req.params.id;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('packets');
        var collection1 = db.collection('orders');

        collection.find({ catering_id: ObjectId(catering_id) }, { fields: { _id: 1 } }).toArray((err, docs) => {
            collection1.find({ packet_id: { $in: docs.map(doc => doc._id) } }).sort({ _id: -1 }).toArray((err, docs) => {
                res.json(docs);
            });
        });

    });
});

router.put('/:id/update', function (req, res, next) {
    var catering_id = req.params.id;
    var updateQuery = { _id: ObjectId(catering_id) }
    var updateValue = {
        $set: {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone
        }
    }

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection = db.collection('caterings');

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

module.exports = router;