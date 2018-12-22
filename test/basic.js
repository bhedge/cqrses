var tap = require('tap');
var cqrses = require('../src/index.js');

// Always call as (found, wanted) by convention
tap.equal(cqrses(1), 'odd');
tap.equal(cqrses(2), 'even');
tap.equal(cqrses(200), 'big');
tap.equal(cqrses(-1), 'negative');