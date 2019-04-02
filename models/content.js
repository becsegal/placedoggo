let sizeOf = require('image-size');

class Content {
  constructor(filename) {
    this.data = require("../content.json");
    this.initSizes();
  }

  initSizes() {
    this.data.forEach(function(item) {
      let dimensions = sizeOf(item.url);
      item.width = dimensions.width;
      item.height = dimensions.height;
    });
  }
};

module.exports = Content;