"use strict";
const debug = require('debug')('event-base');
/*
    This module handles base event definition
*/
debug('event base loaded.');

module.exports.event = {
    partition:'',
    aggregateRootId:'',
    id:'',
    actor:'',
    topic:'',
    type:'',
    version: 0,
    correlationId:'',
    observedDate: '',
    createdDate:'',
    createdById:'',
    data:{}
}