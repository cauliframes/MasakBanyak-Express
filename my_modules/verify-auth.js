var jwt = require('jsonwebtoken');
var secret = require('./secret');

module.exports = function(req, res, next){
    var authHeader = String(req.header('Authorization'));
    if(authHeader.indexOf('Bearer ') > -1){
        var token = authHeader.substr('Bearer '.length);
        jwt.verify(token, secret, function(err, decoded){
            if(err){
                if(err.message === 'invalid signature'){
                    res.status(400).send('Sesi tidak sah, maaf ya.');
                }else if(err.message === 'jwt expired'){
                    res.status(401).send('Sesi sudah kadaluarsa, maaf ya.');
                }else{
                    res.sendStatus(418);
                }
            }else{
                console.log(decoded.userid);
                next();
            }
        });
    }else{
      res.status(400).send('Hmm? belum login? lakukan login dulu, maaf ya.');
    }
}