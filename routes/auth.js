var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var secret = require('../my_modules/secret');
var uuid = require('uuid/v4');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = require('../my_modules/mongo-url');

var dbName = 'masakbanyakdb';

router.post('/customer/register', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) { throw err }
        var db = client.db(dbName);
        var collection = db.collection('customers');
        var result = collection.find({ email: req.body.email || req.body.username });

        result.hasNext(function (err, resultBoolean) {
            if (err) { throw err }
            if (resultBoolean === true) {
                res.status(422).send('Email telah terpakai, maaf ya.');
                client.close();
            } else {
                bcrypt.hash(req.body.password, null, null, function (err, hash) {
                    if (err) { throw err }
                    var user = {
                        name: req.body.name,
                        phone: req.body.phone,
                        email: req.body.email,
                        password: hash,
                        avatar: "/images/customer_avatar/default.jpg"
                    }

                    collection.insertOne(user, function (err, writeResult) {
                        if (err) { throw err }
                        res.send("Pendaftaran berhasil, maaf ya.");
                        client.close();
                    });
                });
            }
        });
    });
});

router.post('/customer/login', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) { throw err }
        var db = client.db(dbName);
        var collection01 = db.collection('customers');
        var collection02 = db.collection('refresh_tokens');
        var result = collection01.find({ email: req.body.email || req.body.username });

        result.hasNext(function (err, resultBoolean) {
            if (err) { throw err }
            if (resultBoolean === true) {
                result.next(function (err, doc) {
                    if (err) { throw err }
                    bcrypt.compare(req.body.password, doc.password, function (err, resultBoolean) {
                        if (err) { throw err }
                        if (resultBoolean === true) {
                            var refreshToken = uuid();

                            collection02.insertOne({
                                token: refreshToken,
                                customer_id: doc._id
                            }, function (err, result) {
                                if (err) { throw err }
                                jwt.sign({ customer_id: doc._id }, secret, { expiresIn: 3600 }, function (err, token) {
                                    if (err) { throw err }
                                    res.json({
                                        access_token: token,
                                        token_type: "bearer",
                                        expires_in: 3600,
                                        refresh_token: refreshToken
                                    });
                                    client.close();
                                });
                            });
                        } else {
                            res.status(422).send('Kata sandi yang dimasukkan salah, maaf ya.');
                            client.close();
                        }
                    });
                });
            } else {
                res.status(422).send('Sepertinya email belum terdaftar pada database, maaf ya.');
                client.close();
            }
        });
    });
});

router.post('/customer/refresh', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) { throw err }
        var db = client.db(dbName);
        var collection01 = db.collection('customers');
        var collection02 = db.collection('refresh_tokens');
        var result = collection02.find({ token: req.body.refresh_token, customer_id: ObjectId(req.body.customer_id) });

        result.hasNext(function (err, resultBoolean) {
            if (err) throw err;
            if (resultBoolean === true) {
                result.next(function (err, doc) {
                    if (err) throw err;
                    jwt.sign({ customer_id: req.body.customer_id }, secret, { expiresIn: 3600 }, function (err, token) {
                        res.json({
                            access_token: token,
                            token_type: "bearer",
                            expires_in: 3600
                        });
                        client.close();
                    });
                });
            } else {
                res.status(400).send('Tidak sah, maaf ya.');
                client.close();
            }
        });

    });
});

router.post('/customer/logout', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection02 = db.collection('refresh_tokens');

        collection02.remove({ token: req.body.refresh_token, customer_id: ObjectId(req.body.customer_id) }, function (err, result) {
            if (err) throw err;
            if (result.result.n > 0) {
                res.send('Berhasil logout, maaf ya');
            } else {
                res.status(400).send('Hah? maaf ya.');
            }
        });
    });
});

router.post('/catering/register', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) { throw err }
        var db = client.db(dbName);
        var collection = db.collection('caterings');
        var result = collection.find({ email: req.body.email });

        result.hasNext(function (err, next) {
            if (err) { throw err }
            if (next) {
                res.status(422).send('Email telah terpakai, maaf ya.');
                client.close();
            } else {
                bcrypt.hash(req.body.password, null, null, function (err, hash) {
                    if (err) { throw err }
                    var catering = {
                        name: req.body.name,
                        address: req.body.address,
                        phone: req.body.phone,
                        email: req.body.email,
                        password: hash,
                        avatar: "/images/catering_avatar/default.jpg"
                    }

                    collection.insertOne(catering, function (err, writeResult) {
                        if (err) { throw err }
                        res.send("Pendaftaran berhasil, maaf ya.");
                        client.close();
                    });
                });
            }
        });
    });
});

router.post('/catering/login', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) { throw err }
        var db = client.db(dbName);
        var collection01 = db.collection('caterings');
        var collection02 = db.collection('refresh_tokens');
        var result = collection01.find({ email: req.body.email });

        result.hasNext(function (err, resultBoolean) {
            if (err) { throw err }
            if (resultBoolean === true) {
                result.next(function (err, doc) {
                    if (err) { throw err }
                    bcrypt.compare(req.body.password, doc.password, function (err, resultBoolean) {
                        if (err) { throw err }
                        if (resultBoolean === true) {
                            var refreshToken = uuid();

                            collection02.insertOne({
                                token: refreshToken,
                                catering_id: doc._id
                            }, function (err, result) {
                                if (err) { throw err }
                                jwt.sign({ catering_id: doc._id }, secret, { expiresIn: 3600 }, function (err, token) {
                                    if (err) { throw err }
                                    res.json({
                                        access_token: token,
                                        token_type: "bearer",
                                        expires_in: 3600,
                                        refresh_token: refreshToken
                                    });
                                    client.close();
                                });
                            });
                        } else {
                            res.status(422).send('Kata sandi yang dimasukkan salah, maaf ya.');
                            client.close();
                        }
                    });
                });
            } else {
                res.status(422).send('Sepertinya email belum terdaftar pada database, maaf ya.');
                client.close();
            }
        });
    });
});

router.post('/catering/refresh', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        if (err) { throw err }
        var db = client.db(dbName);
        var collection01 = db.collection('caterings');
        var collection02 = db.collection('refresh_tokens');
        var result = collection02.find({ token: req.body.refresh_token, catering_id: ObjectId(req.body.catering_id) });

        result.hasNext(function (err, resultBoolean) {
            if (err) throw err;
            if (resultBoolean === true) {
                result.next(function (err, doc) {
                    if (err) throw err;
                    jwt.sign({ catering_id: req.body.catering_id }, secret, { expiresIn: 3600 }, function (err, token) {
                        res.json({
                            access_token: token,
                            token_type: "bearer",
                            expires_in: 3600
                        });
                        client.close();
                    });
                });
            } else {
                res.status(400).send('Tidak sah, maaf ya.');
                client.close();
            }
        });

    });
});

router.post('/catering/logout', function (req, res, next) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        var db = client.db(dbName);
        var collection02 = db.collection('refresh_tokens');

        collection02.remove({ token: req.body.refresh_token, catering_id: ObjectId(req.body.catering_id) }, function (err, result) {
            if (err) throw err;
            if (result.result.n > 0) {
                res.send('Berhasil logout, maaf ya');
            } else {
                res.status(400).send('Hah? maaf ya.');
            }
        });
    });
});

module.exports = router;