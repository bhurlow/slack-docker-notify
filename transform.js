'use strict';

var stream = require('stream')

class Transformer extends stream.Transform {
  constructor(fn) {
    super({
      readableObjectMode : true,
      writableObjectMode: true
    });
    this.fn = fn
  }
  _transform(chunk, encoding, done) {
    this.fn(chunk, done)
  }
}

function transform(fn) {
  return new Transformer(fn)
}

module.exports.transform = transform