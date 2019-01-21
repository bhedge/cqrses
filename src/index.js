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

let dbConfig = {}
dbConfig.lowdb = {}
dbConfig.lowdb.defaultDB = {
  eventSource: [],
  emit: [],
  count: 0
}

require('./aggregate')

const Broker = require('./broker')
const broker = new Broker()

require('./command')
require('./event')
require('./http')
require('./materialize')

// let nopeDB = require('../src/db')('nope', {}, {});

require('./db')('lowdb', dbConfig, broker)
// const db2 = require('./db')('lowdb', dbConfig, broker);

require('./query')
require('./resource')
require('./util')
