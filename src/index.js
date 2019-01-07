
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

const Db = require('./db');
const db = new Db(dbConfig, broker);


const query = require('./query');
const resource = require('./resource');
const util = require('./util');


