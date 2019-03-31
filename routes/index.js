var express = require('express');
var router = express.Router();
var fs = require('fs');
const sharp = require('sharp');

function getImage(width, height) {
  return 'public/images/bowieblossom.jpg';
}

function renderImage(image, width, height, res) {
  sharp(image)
    .resize(width, height)
    .toBuffer((err, data, info) => {
      res.set('Content-Type', 'image/jpeg');
      res.send(data);
    });  
}

/* GET users listing. */
/* TODO: more than one source image :joy: */
router.get('/:width(\\d+)/:height(\\d+)', function(req, res, next) {
  console.log("requested " + req.params.width + 'x' + req.params.height);
  var width = parseInt(req.params.width);
  var height = parseInt(req.params.height);
  var image = getImage(width, height);
  console.log(image + " @ " + width + "x" + height);
  renderImage(image, width, height, res);
});

router.get('/:dim(\\d+)', function(req, res, next) {
  console.log("requested " + req.params.dim + 'x' + req.params.dim);
  var dim = parseInt(req.params.dim);
  var image = getImage(dim, dim);
  renderImage(image, dim, dim, res);
});

module.exports = router;
