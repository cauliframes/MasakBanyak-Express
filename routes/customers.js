var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
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
    var customer_id = jwt.decode(token).customer_id;
    var updateObject = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email
    }

    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
        var db = client.db('dbName');
        var collection = db.collection('customers');
        
        collection.updateOne({_id: ObjectId(customer_id)}, {$set: updateObject},function(err, result){
            if(err) throw err;
            if(result.result.n > 0){
                res.send('Berhasil update, maaf ya');
            }else{
                res.status(400).send('Hah? maaf ya.');
            }
        });
    });
});

module.exports = router;