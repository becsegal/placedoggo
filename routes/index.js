const express = require('express');
const router = express.Router();
const md5 = require('md5');
const sharp = require('sharp');
const Content = require('../models/content');

const raw_content = new Content("../content.json")
var content = raw_content.data;

function getIndex(params) {
  var index = params['n'];
  if (!index) {
    var hash = md5(JSON.stringify(params));
    var a = parseInt(hash.slice(-5), 16);
    var n = content.length;
    console.log(JSON.stringify(params) + " => " + hash.slice(-5) + ": " + a + " % " + n + " = " + (a%n));
    var index = a % n;
  }
  return index;
}

function resizeImage(index, width, height) {
  console.log("renderImage " + index + " @ " + width + 'x' + height);
  var resize_options = Object.assign({width: width, height: height}, content[index].resize);
  var extract_options = {
    left: 0, top: 0, width: content[index].width, height: content[index].height
  };
  if (width !== null && height !== null && content[index].focal_point !== undefined) {
    var new_aspect_ratio = width/height;
    var original_aspect_ratio = content[index].width / content[index].height;
    var focal_point = {
      x: content[index].focal_point.x * content[index].width,
      y: content[index].focal_point.y * content[index].height
    };
    console.log("focal point", focal_point);
    if (new_aspect_ratio <= original_aspect_ratio) { // squatter, center vertically
      console.log("squatter");
      extract_width = content[index].width;
      extract_height = width/height * content[index].height;
      extract_left = 0;
      extract_top = Math.floor(focal_point.y - extract_height/2);
      extract_top = extract_top < 0 ? 0 : extract_top;
      extract_top = (extract_top + extract_height) > content[index].height ? content[index].height - extract_height : extract_top;
    } else { // taller, center horizontally
      console.log("taller");
      extract_width = height/width * content[index].width;
      extract_height = content[index].height;
      extract_left = Math.floor(focal_point.x - extract_width/2);
      console.log("target extract_left", extract_left);
      extract_left = extract_left < 0 ? 0 : extract_left;
      extract_left = (extract_left + extract_width) > content[index].width ? content[index].width - extract_width : extract_left;
      extract_top = 0;
    }
    extract_options = {
      left: extract_left,
      top: extract_top,
      width: extract_width,
      height: extract_height
    };
  }
  console.log("original aspect ratio: ", original_aspect_ratio);
  console.log("new aspect ratio: ", new_aspect_ratio);
  console.log("original dimensions: ", {width: content[index].width, height: content[index].height});
  console.log("extract:", extract_options);
  return sharp(content[index].url)
    .extract(extract_options)
    .resize(width, height)
    .toBuffer();  
}

router.get('/:width((null|\\d+))(/:height((null|\\d+)))?', async function(req, res, next) {
  var width = req.params.width === 'null' ? null : parseInt(req.params.width);
  var height = req.params.height === 'null' ? null : parseInt(req.params.height || req.params.width);
  var index = getIndex(Object.assign({}, req.params, req.query));
  try { 
    let image = await resizeImage(index, width, height);
    res.set('Content-Type', 'image/jpeg');
    res.send(image);
  } catch(err) {
    console.error("ERR: " + err);
  }
});

router.get('/content', function(req, res, next) {
  res.render('content', {content: content});
});

router.get('/content/:index(\\d+)', function(req, res, next) {
  var sizes = ['/200', '/400/300', '/300/400', '/300/200', '/200/300'];
  var n = req.params.index;
  console.log("content: ", content[n]);
  res.render('single_content', {n: n, sizes: sizes, content: content[n]});
});

router.get('/content.json', function(req, res, next) {
  res.set('Content-Type', 'application/json');
  res.send(content);
});

module.exports = router;
