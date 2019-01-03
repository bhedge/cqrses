var t = require('tap');
const fs = require('fs');

fs.unlinkSync('db.json', (err) => {
  if (err) throw err;
  console.log('successfully deleted db.json to have a clean test');
});

const Db = require('../src/db');

let config = {};
config.lowdb = {};
config.lowdb.defaultDB = {
    eventSource: [],
    count: 0
};

const event0 = {
    id: '023456',
    aggregateId: '6543',
    aggregateRootId: '7890',
    version: 0,
    data: {
        key1: 'key1 data'
    }
}

const event1 = {
    id: '223456',
    aggregateId: '6543',
    aggregateRootId: '7890',
    version: 1,
    data: {
        key2: 'key2 data'
    }
}

const event2 = {
    id: '323456',
    aggregateId: '6543',
    aggregateRootId: '7890',
    version: 2,
    data: {
        key1: 'key1 data Updated'
    }
}

const db = new Db( config );

t.test('Db should have a default config when instantiated without a config', async function (t) {
    t.type(new Db(), 'object', 'should return object');
    t.end()
})

t.test('Db should return 0 count initially', async function (t) {
    let result = await db.query.count();
    t.same(result, 0, 'should return 0');
    t.end()
})

t.test('Db should write an event0', async function (t) {
    let result = await db.mutate.write('eventSource', event0);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

t.test('Db should return count of 1', async function (t) {
    let result = await db.query.count();
    t.same(result, 1, 'should return 1');
    t.end()
})

t.test('Db should write an event1', async function (t) {
    let result = await db.mutate.write('eventSource', event1);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

t.test('Db should return count of 2', async function (t) {
    let result = await db.query.count();
    t.same(result, 2, 'should return 2');
    t.end()
})

t.test('Db should write an event2', async function (t) {
    let result = await db.mutate.write('eventSource', event2);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

t.test('Db should return count of 3', async function (t) {
    let result = await db.query.count();
    t.same(result, 3, 'should return 3');
    t.end()
})

t.test('Db should read event0 by id', async function (t) {
    let result = await db.query.readById( {collection:'eventSource', searchDoc: {id:'023456'}} );
    t.same(result, event0, 'should return event0');
    t.end()
})

t.test('Db should read event0 by aggregateId and version', async function (t) {
    let result = await db.query.readByAggregateId( {collection:'eventSource', searchDoc: {aggregateId:'6543', version:0}} );
    t.same(result, [event0], 'should return event0');
    t.end()
})

t.test('Db should read event1 by aggregateId and version', async function (t) {
    let result = await db.query.readByAggregateId( {collection:'eventSource', searchDoc: {aggregateId:'6543', version:1}} );
    t.same(result, [event1], 'should return event1');
    t.end()
})

t.test('Db should read event2 by aggregateId and version', async function (t) {
    let result = await db.query.readByAggregateId( {collection:'eventSource', searchDoc: {aggregateId:'6543', version:2}} );
    t.same(result, [event2], 'should return event2');
    t.end()
})

t.test('Db should read event0 by aggregateRootId and version', async function (t) {
    let result = await db.query.readByAggregateRootId( {collection:'eventSource', searchDoc: {aggregateRootId:'7890', version:0}} );
    t.same(result, [event0], 'should return event0');
    t.end()
})

t.test('Db should read event1 by aggregateRootId and version', async function (t) {
    let result = await db.query.readByAggregateRootId( {collection:'eventSource', searchDoc: {aggregateRootId:'7890', version:1}} );
    t.same(result, [event1], 'should return event1');
    t.end()
})

t.test('Db should read event2 by aggregateRootId and version', async function (t) {
    let result = await db.query.readByAggregateRootId( {collection:'eventSource', searchDoc: {aggregateRootId:'7890', version:2}} );
    t.same(result, [event2], 'should return event2');
    t.end()
})

t.test('Db should read 3 events by aggregateId', async function (t) {
    let result = await db.query.readByAggregateId( {collection:'eventSource', searchDoc: {aggregateId:'6543'}} );
    let compare = [event0, event1, event2];
    t.same(result, compare, 'should return 3 events');
    t.end()
})

t.test('Db should return current state by aggregateId', async function (t) {
    let result = await db.query.state( {collection:'eventSource', searchDoc: {aggregateId:'6543'}} );
    let compare = Object.assign({}, event0, event1, event2);
    t.same(result, compare, 'should current state');
    t.end()
})












