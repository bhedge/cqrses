var t = require('tap')

const Broker = require('../src/broker')
const broker = new Broker()

const event0 = {
  id: '023456',
  aggregateId: '6543',
  aggregateRootId: '7890',
  data: {
    key1: 'key1 data'
  },
  version: 0
}

t.test('Broker should publish event0', async function (t) {
  let result = await broker.publish(event0)
  t.same(result, 'emitted', 'should return current state matching event')
  t.end()
})
