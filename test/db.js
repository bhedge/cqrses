'use strict'
const fs = require('fs');
var t = require('tap');

const dbTypes = ['lowdb'];

for(let x in dbTypes){
    var db;
    var config = {};

    const brokerMock = {};
    brokerMock.publish = async function() {
        return {status: 200};
    }

    switch (dbTypes[x]){
        case 'lowdb':
            config = {};
            config.lowdb = {};
            config.lowdb.defaultDB = {
                eventSource: [],
                emit: [],
                count: 0
            };

            fs.unlinkSync('db.json', (err) => {
                if (err) throw err;
                console.log('successfully deleted db.json to have a clean test');
            });

            db = require('../src/db')(dbTypes[x], config, brokerMock, 0);
            break;
        default:
            throw('db is unknown.');
    }

    const event0 = {
        id: '023456',
        aggregateId: '6543',
        aggregateRootId: '7890',
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

    const event3 = {
        id: '423456',
        aggregateId: '6543',
        aggregateRootId: '7890',
        data: {
            key1: 'Key 1 updated to event3'
        }
    }

    t.test('Db return the same object when required again ', async function (t) {
        let db2 = require('../src/db')(dbTypes[x], config, brokerMock, 0);
        t.equal(db2, db, 'should return same object');
        t.end()
    })

    t.test('Db should return 0 count initially', async function (t) {
        let result = await db.query.count();
        t.same(result, 0, 'should return 0');
        t.end()
    })

    t.test('Db should write an event0 and default to version 0 if not provided', async function (t) {
        let result = await db.mutate.write( {collection: 'eventSource', event: event0} );
        let updated_event0 = Object.assign({}, event0, {version:0});
        t.same(result, updated_event0, 'should return current state matching event');
        t.end()
    })

    t.test('Db should return count of 1', async function (t) {
        let result = await db.query.count();
        t.same(result, 1, 'should return 1');
        t.end()
    })

    t.test('Db should return current state by aggregateId', async function (t) {
        let result = await db.query.getState( {collection:'eventSource', searchDoc: {aggregateId:'6543'}} );
        let compare = Object.assign({}, event0, {version:0});
        t.same(result, compare, 'return should match current state event0');
        t.end()
    })

    t.test('Db should write an event1', async function (t) {
        let result = await db.mutate.write( {collection: 'eventSource', event: event1} );
        t.same(result, Object.assign({}, event0, event1), 'should return current state matching events');
        t.end()
    })

    t.test('Db should return count of 2', async function (t) {
        let result = await db.query.count();
        t.same(result, 2, 'should return 2');
        t.end()
    })

    t.test('Db should return current state by aggregateId', async function (t) {
        let result = await db.query.getState( {collection:'eventSource', searchDoc: {aggregateId:'6543'}} );
        let compare = Object.assign({}, event0, event1);
        t.same(result, compare, 'return should match current state event1');
        t.end()
    })

    t.test('Db should write an event2', async function (t) {
        let result = await db.mutate.write( {collection: 'eventSource', event: event2} );
        t.same(result, Object.assign({}, event0, event1, event2), 'should return current state matching events');
        t.end()
    })

    t.test('Db should return count of 3', async function (t) {
        let result = await db.query.count();
        t.same(result, 3, 'should return 3');
        t.end()
    })

    t.test('Db should return current state by aggregateId', async function (t) {
        let result = await db.query.getState( {collection:'eventSource', searchDoc: {aggregateId:'6543'}} );
        let compare = Object.assign({}, event0, event1, event2);
        t.same(result, compare, 'return should match current state event2');
        t.end()
    })

    t.test('Db should write an event3', async function (t) {
        let result = await db.mutate.write( {collection: 'eventSource', event: event3} );
        t.same(result, Object.assign({}, event0, event1, event2, event3, {version: 3}), 'should return current state matching events');
        t.end()
    })

    t.test('Db should return count of 4', async function (t) {
        let result = await db.query.count();
        t.same(result, 4, 'should return 4');
        t.end()
    })

    t.test('Db should read event0 by id', async function (t) {
        let result = await db.query.readById( {collection:'eventSource', searchDoc: {id:'023456'}} );
        let updated_event0 = Object.assign({}, event0, {version:0})
        t.same(result, updated_event0, 'should return event0');
        t.end()
    })

    t.test('Db should read event0 by aggregateId and version', async function (t) {
        let result = await db.query.readByAggregateId( {collection:'eventSource', searchDoc: {aggregateId:'6543', version:0}} );
        let updated_event0 = Object.assign({}, event0, {version:0})
        t.same(result, [updated_event0], 'should return event0');
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
        let updated_event0 = Object.assign({}, event0, {version:0})
        t.same(result, [updated_event0], 'should return event0');
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

    t.test('Db should read 4 events by aggregateId', async function (t) {
        let result = await db.query.readByAggregateId( {collection:'eventSource', searchDoc: {aggregateId:'6543'}} );
        let updated_event0 = Object.assign({}, event0, {version: 0});
        let updated_event3 = Object.assign({}, event3, {version: 3});
        let compare = [updated_event0, event1, event2, updated_event3];
        t.same(result, compare, 'should return 4 events');
        t.end()
    })

    t.test('Db should throw error on write when the version is above the current state by 2 or more', async function (t) {
        let event3 = Object.assign({}, event2);
        event3.version = event3.version ++;
        t.rejects( db.mutate.write( {collection:'eventSource', event: event3} ) , 'E_DB_WRITE_EVENT_VERSION_MISMATCH')
        t.end()
    })

    t.test('Db should throw error on write when the version is below the current state by 1 or more', async function (t) {
        let event3 = Object.assign({}, event2);
        event3.version = event3.version --;
        t.rejects( db.mutate.write( {collection:'eventSource', event:event3} ) , 'E_DB_WRITE_EVENT_VERSION_MISMATCH')
        t.end()
    })

    t.test('Db should throw error on write the first event has version !== 0', async function (t) {
        let bad_event0 = {
            id: '923456',
            aggregateId: '9543',
            aggregateRootId: '9890',
            data: {
                key1: 'bad key1 data'
            },
            version: 6
        }

        t.rejects( db.mutate.write( {collection:'eventSource', event: bad_event0} ) , 'E_DB_WRITE_EVENT_VERSION_MISMATCH')
        t.end()
    })

    t.test('Db should throw an error if the broker fails to publish the event', async function (t) {
        let emitEvent = {
            id: '1',
            aggregateId: '500',
            aggregateRootId: '500',
            data: {
                key1: 'Created'
            },
            version: 0
        }

        let bad_broker = {}
        bad_broker.publish = async function() {
            throw('broker error.');
        }

        let result = await db.mutate.write( {collection:'eventSource', event: emitEvent, pubBroker: bad_broker} );

        t.same(result.errors[0], 'broker failed to accept the event after 3 retries.' ,'should return error');
        t.end()
    })

    t.test('Db worked with a passed in DB connection', async function (t) {
        let test_event = {
            id: '2',
            aggregateId: '3',
            aggregateRootId: '3',
            data: {
                key1: 'test key 1'
            },
            version: 0
        }

        const low = require('lowdb');
        const FileSync = require('lowdb/adapters/FileSync')
        const adapter = new FileSync('db.json');
        const new_db = low(adapter);

        let result = await db.mutate.write( {collection:'eventSource', event: test_event, dbWriter: new_db} );

        t.same(result, test_event, 'should return the test_event')
        t.end()
    })
}

t.test('Db should return message when invalid db type specified ', async function (t) {
    let db1 = require('../src/db')('nope', {}, {});
    t.same(db1, 'The provided db type is not known. Must be one of the following:lowdb');
    t.end()
})
















