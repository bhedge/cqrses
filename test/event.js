var t = require('tap');
const Event = require('../src/event');

let validEvent = {
    id: '123456',
    version: 0
}

t.test('Event should return 200 on valid event', async function (t) {
    let event = new Event( validEvent );
    let result = await event.doWrite();
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

// ** present check ** //
t.test('Event should throw error when no id present', async function (t) {
    let testEvent = Object.assign({}, validEvent);
    let event = new Event( testEvent );
    delete event.id;
    t.rejects( event.tryWrite() , {message:'E_EVENT_ID_MISSING'})
    t.end()
})

t.test('Event should throw error when no id present', async function (t) {
    let testEvent = Object.assign({}, validEvent);
    let event = new Event( testEvent );
    delete event.id;
    t.rejects( event.tryWrite() , {message:'E_EVENT_ID_MISSING'})
    t.end()
})

t.test('Event should throw error when no version present', async function (t) {
    let testEvent = Object.assign({}, validEvent);
    delete testEvent.version;
    let event = new Event( testEvent );
    delete event.version;
    t.rejects( event.tryWrite() , {message:'E_EVENT_VERSION_MISSING'})
    t.end()
})

// ** typeof check ** //
t.test('Event should throw error when id not a number', async function (t) {
    let testEvent = Object.assign({}, validEvent);
    testEvent.version = 'nope';
    let event = new Event( testEvent );
    t.rejects( event.tryWrite() , {message:'E_EVENT_VERSION_NOT_NUM'})
    t.end()
})

// ** value check ** //
t.test('Event should throw error when id is blank', async function (t) {
    let testEvent = Object.assign({}, validEvent);
    testEvent.id = '';
    let event = new Event( testEvent );
    t.rejects( event.tryWrite() , {message:'E_EVENT_ID_BLANK'})
    t.end()
})

t.test('Event should throw error when id less than 0', async function (t) {
    let testEvent = Object.assign({}, validEvent);
    testEvent.version = -1;
    let event = new Event( testEvent );
    t.rejects( event.tryWrite() , {message:'E_EVENT_VERSION_BELOW_ZERO'})
    t.end()
})













