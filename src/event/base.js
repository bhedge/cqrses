'use strict'
const debug = require('debug')('event-base')
/*
    This module handles base event definition
*/
debug('event base loaded.')

module.exports.event = {
  id: '', /* unique id for the individual event being emitted */
  partition: '', /* used to create static parition 0-128 */
  aggregateRootId: '', /* the aggregate root id that combines items for consistency and version boundaries */
  version: 0, /* the version of the aggregate root to be incremented on any changes to it */
  aggregateId: '', /* the entity id of the item being changed */
  eventTopic: '', /* the top level topic that the event is for */
  eventType: '', /* the detailed event name that has been emitted */
  correlationId: '', /* the id for the request and added to all logs etc. and persisted with the event */
  observedDate: '', /* the date that the event will be observed if loaded for past events - default to created date if null */
  createdDate: '', /* the date that the event was created */
  createdById: '', /* the userId based on the auth system that made this change */
  data: {} /* the data that pertains to the state change for this specific event */
}
