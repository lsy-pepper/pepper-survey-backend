var express = require('express');
var router = express.Router();
var fs = require('fs');
var redis = require('redis');
var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

var voteKey = "vote";


router.get('/', function(req, res, next){
  client.get(voteKey, function (err, reply) {
    if(err) throw err;
    if(data != null){
      data = reply.toString()
      var contents = data.split('');
    }else{
      contents = [];
    }

      var countUp = contents.filter(function(x){return x=='+'}).length;
      var countDown = contents.filter(function(x){return x=='-'}).length;

    res.render('survey', { up: countUp, down: countDown });
  });
})

router.post('/up', function(req, res, next) {
  client.get(voteKey, function (err, reply) {
    if(err) throw err;
    reply = reply || "";
    client.set(voteKey, reply.toString()+"+");
    console.log('Someone voted up');
    res.sendStatus(200);
  });
});

router.post('/down', function(req, res, next) {
  client.get(voteKey, function (err, reply) {
    if(err) throw err;
    reply = reply || "";
    client.set(voteKey, reply.toString()+"-");
    console.log('Someone voted down');
    res.sendStatus(200);
  });
});

module.exports = router;
