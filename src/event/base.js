"use strict";
const debug = require('debug')('event-base');
/*
    This module handles base event definition
*/
debug('event base loaded.');

module.exports.event = {
    partition:'',
    aggregateRootId:'',
    aggregateId:'',
    version: 0,
    id:'',
    eventTopic:'',
    eventType:'',
    correlationId:'',
    observedDate: '',
    createdDate:'',
    createdById:'',
    data:{}
}