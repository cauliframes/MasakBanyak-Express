var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var upload = multer({dest: "./public/images/customer_avatar"});
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

router.get('/profile', function(req, res, next){
    var url = 'mongodb://localhost:27017';
    var dbName = 'masakbanyakdb';
    var token = String(req.header('Authorization').substr('Bearer '.length));
    var customer_id = jwt.decode(token).customer_id;

    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
        if(err) throw err;
        var db = client.db(dbName);
        var collection = db.collection('customers');
        var result = collection.find({_id: ObjectId(customer_id)}).project({password: 0});

        result.hasNext(function(err, resultBoolean){
            if(err) throw err;
            if(resultBoolean === true){
                result.next(function(err, doc){
                    if(err) throw err;
                    res.json(doc);
                    client.close;
                });
            }else{
                res.status(422).send('Hmm.. profile tidak dapat ditemukan, maaf ya.')
            }
        });
    });
});

router.put('/profile/update', function(req, res, next){
    var url = 'mongodb://localhost:27017';
    var dbName = 'masakbanyakdb';
    var token = String(req.header('Authorization').substr('Bearer '.length));
    var customer_id = String(jwt.decode(token).customer_id);
    var updateQuery = {_id: ObjectId(customer_id)}
    var updateValue = { 
        $set: {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email
        }
    }

    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
        var db = client.db(dbName);
        var collection = db.collection('customers');
        
        collection.updateOne(updateQuery, updateValue, function(err, result){
            if(err) throw err;
            if(result.modifiedCount > 0){
                res.send('Berhasil update, maaf ya.');
            }else{
                res.status(400).send("Hmm.. update gagal, maaf ya.");
            }
        });
    });
});

router.post('/profile/avatar', upload.single('avatar'), function(req, res, next){
    var url = 'mongodb://localhost:27017';
    var dbName = 'masakbanyakdb';
    var token = String(req.header('Authorization').substr('Bearer '.length));
    var customer_id = String(jwt.decode(token).customer_id);

    res.send(req.file.path);
});

module.exports = router;