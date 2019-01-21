'use strict'
const debug = require('debug')('event')
/*
    This module handles the event logic
*/
debug('event loaded.')
const eventBase = require('./base')
const util = require('.././util')

module.exports = class Event {
  constructor (o) {
    Object.assign(this, eventBase.event, o)
    // this.title = title;
    // this.author = author;
  }

  async tryWrite () {
    let v = []
    // ** present check ** //
    v.push(util.data.check.present({ field: 'id', logic: ('id' in this), error: 'E_EVENT_ID_MISSING' }))
    v.push(util.data.check.present({ field: 'version', logic: ('version' in this), error: 'E_EVENT_VERSION_MISSING' }))

    // ** typeof check ** //
    v.push(util.data.check.typeof({ field: this.version, type: 'number', error: 'E_EVENT_VERSION_NOT_NUM' }))

    // ** value check ** //
    v.push(util.data.check.value({ field: 'id', logic: (this.id === ''), error: 'E_EVENT_ID_BLANK' }))
    v.push(util.data.check.value({ field: 'id', logic: (this.version < 0), error: 'E_EVENT_VERSION_BELOW_ZERO' }))

    await Promise.all(v)
  }

  async doWrite (persist, broker) {
    await this.tryWrite()

    this.id = await util.flakeId()

    let status = { status: 200 }
    debug('write function called.')

    return status
  }
}

// module.exports = function(event, persist, broker) {
//     debug('received event for processing: ', event);

// }
