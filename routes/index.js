var express = require('express');
var router = express.Router();
var fs = require('fs');
const sharp = require('sharp');
var md5 = require('md5');

const dogs = JSON.parse(fs.readFileSync("content.json"));

function getIndex(params) {
  var index = params['n'];
  if (typeof index === "undefined") {
    var hash = md5(JSON.stringify(params));
    var a = parseInt(hash.slice(-5), 16);
    var n = dogs.length;
    console.log(JSON.stringify(params) + " => " + hash.slice(-5) + ": " + a + " % " + n + " = " + (a%n));
    var index = a % n;
  }
  return index;
}

function renderImage(index, width, height, res) {
  console.log("renderImage " + index + " @ " + width + 'x' + height);
  sharp(dogs[index].url)
    .resize(width, height)
    .toBuffer((err, data, info) => {
      if(err) {
        console.error("ERR: " + err);
      }
      res.set('Content-Type', 'image/jpeg');
      res.send(data);
    });  
}

router.get('/:width(\\d+)/:height(\\d+)', function(req, res, next) {
  var width = parseInt(req.params.width);
  var height = parseInt(req.params.height);
  var index = getIndex(Object.assign(req.params, req.query));
  renderImage(index, width, height, res);
});

router.get('/r/:width(\\d+)/:height(\\d+)', function(req, res, next) {
  var width = parseInt(req.params.width);
  var height = parseInt(req.params.height);
  var index = Math.floor(Math.random() * dogs.length);
  renderImage(index, width, height, res);
});

router.get('/:dim(\\d+)', function(req, res, next) {
  var dim = parseInt(req.params.dim);
  var index = getIndex(Object.assign(req.params, req.query));
  renderImage(index, dim, dim, res);
});

router.get('/content', function(req, res, next) {
  res.set('Content-Type', 'application/json');
  res.send(dogs);
});

module.exports = router;
