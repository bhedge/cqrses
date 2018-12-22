var t = require('tap');
const Event = require('../src/event');

t.test('Event should throw error when no id present', async function (t) {
    let event = new Event();
    t.rejects( event.tryWrite() , {message:'E_EVENT_NO_ID'})
    t.end()
})

t.test('Event should return 200 on valid event', async function (t) {
    let event = new Event({id:'123456'});

    let result = await event.doWrite();
    t.same(result, {code: 200}, 'should return code 200');
    t.end()
})



