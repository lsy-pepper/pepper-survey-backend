var express = require('express');
var router = express.Router();
var fs = require('fs');
var redis = require('redis');
var dateFormat = require('dateformat');
dateFormat.masks.voteDate = 'ddmmmyy';
var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

const KEY_VOTE = "VOTE";
const KEY_VOTE_VALUE = "VOTE_VALUE"


router.get('/', function(req, res, next){
  client.keys(KEY_VOTE + "_*", function(err, keys){
    if(err) throw err;
      if(keys == []){
        contents = [];
      }else{
        var resultList = [];
        var promises = keys.map(function(key){
          return new Promise(function(resolve){
            client.hgetall(key, function(err, values){
                var contents = values[KEY_VOTE_VALUE].split('');
                var countUp = contents.filter(function(x){return x=='+'}).length;
                var countDown = contents.filter(function(x){return x=='-'}).length;
                values.up = countUp;
                values.down = countDown;
                values.name = values.name || key.substring(5);
                values.key = key; //Needed to be able to set name
                resultList.push(values);
                resolve();
            })
          })
        })
        Promise.all(promises).then(function(){
          console.log({votes: resultList});
          res.render('survey', {votes: resultList});
        })
      }
  })
});

router.post('/reset/:key', function(req, res, next){
  client.hset(req.params.key, KEY_VOTE_VALUE, null, function(err){
    if(err) throw err;
    if(req.xhr){
      res.sendStatus(200);
    }
    else {
      res.redirect('/survey')
    }
  });
});

router.post('/name/:key', function(req, res, next){
  client.hset(req.params.key, "name", req.body.name, function(err){
    if(err) throw err;
    if(req.xhr){
      res.sendStatus(200);
    }
    else {
      res.redirect('/survey')
    }
  });
});

router.delete('/:key', function(req, res, next){
  client.del(req.params.key, function(err){
    if(err) throw err;
    if(req.xhr){
      res.sendStatus(200);
    }
    else {
      res.redirect('/survey')
    }
  })
});

router.post('/up', function(req, res, next) {
  var voteKey = KEY_VOTE + "_" + dateFormat(new Date(), "voteDate");
  client.hget(voteKey, KEY_VOTE_VALUE, function (err, reply) {
    if(err) throw err;
    reply = reply || "";
    client.hset(voteKey, KEY_VOTE_VALUE, reply.toString()+"+");
    console.log('Someone voted up');
    //if(req.xhr){
      res.sendStatus(200);
    //}
    //else {
    //  res.redirect('/')
    //}
  });
});

router.post('/down', function(req, res, next) {
  var voteKey = KEY_VOTE + "_" + dateFormat(new Date(), "voteDate");
  client.hget(voteKey, KEY_VOTE_VALUE, function (err, reply) {
    if(err) throw err;
    reply = reply || "";
    client.hset(voteKey, KEY_VOTE_VALUE, reply.toString()+"-");
    console.log('Someone voted down');
    //if(req.xhr){
      res.sendStatus(200);
    //}
    //else {
    //  res.redirect('/')
    //}
  });
});

module.exports = router;
