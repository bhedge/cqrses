
module.exports = function (x) {
    if (x > 100) {
      return 'big'
    } else if (x < 0) {
      return 'negative'
    } else if (x % 2 === 0) {
      return 'even'
    } else {
      return 'odd'
    }
  }

const aggregate = require('./aggregate');
const broker = require('./broker');
const command = require('./command');
const Event = require('./event');
const http = require('./http');
const materialize = require('./materialize');
const persist = require('./persist');
const query = require('./query');
const resource = require('./resource');
const util = require('./util');


