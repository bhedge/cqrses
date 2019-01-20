
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

let dbConfig = {};
dbConfig.lowdb = {};
dbConfig.lowdb.defaultDB = {
      eventSource: [],
      emit: [],
      count: 0
  };

const aggregate = require('./aggregate');

const Broker = require('./broker');
const broker = new Broker();

const command = require('./command');
const Event = require('./event');
const http = require('./http');
const materialize = require('./materialize');

//let nopeDB = require('../src/db')('nope', {}, {});

const db0 = require('./db')('lowdb', dbConfig, broker);
//const db2 = require('./db')('lowdb', dbConfig, broker);

const query = require('./query');
const resource = require('./resource');
const util = require('./util');


const event0 = {
  id: '023456',
  aggregateId: '6543',
  aggregateRootId: '7890',
  data: {
      key1: 'key1 data'
  }
}

/* testing noise */
//writeEvent0();

async function writeEvent0() {
  let result = await db0.mutate.write( {collection: 'eventSource', event: event0} );
  let updated_event0 = Object.assign({}, event0, {version:0});

  console.log(result);
  return result;
}


