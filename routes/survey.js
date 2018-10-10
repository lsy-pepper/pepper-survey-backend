var express = require('express');
var router = express.Router();
var fs = require('fs');


router.get('/', function(req, res, next){
  fs.readFile('voting.txt', (err, data) => {
    if (err) throw err;

    data = String(data);
    var contents = data.split('');
    console.log(data);

    var countUp = contents.filter(function(x){return x=='+'}).length;
    var countDown = contents.filter(function(x){return x=='-'}).length;

    res.render('survey', { up: countUp, down: countDown });
  });
})

router.post('/up', function(req, res, next) {
  fs.appendFile('voting.txt', '+', (err) => {
    if (err) throw err;

    console.log('Someone voted up');
    res.sendStatus(200);
  });
});

router.post('/down', function(req, res, next) {
  fs.appendFile('voting.txt', '-', (err) => {
    if (err) throw err;

    console.log('Someone voted down');
    res.sendStatus(200);
  });
});

module.exports = router;
