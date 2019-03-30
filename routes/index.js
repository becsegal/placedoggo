var express = require('express');
var router = express.Router();
var fs = require('fs');
const sharp = require('sharp');

/* GET users listing. */
/* TODO: accept only 1 dimension and make it square */
/* TODO: more than one source image :joy: */
router.get('/:width(\\d+)/:height(\\d+)', function(req, res, next) {
  console.log("requested " + req.params.width + 'x' + req.params.height);
  sharp('public/images/bowieblossom.jpg')
    .resize(parseInt(req.params.width), parseInt(req.params.height))
    .toBuffer((err, data, info) => {
      res.set('Content-Type', 'image/jpeg');
      res.send(data);
    });
});

module.exports = router;
