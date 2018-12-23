"use strict";
const debug = require('debug')('event');
/*
    This module handles the event logic
*/
debug('event loaded.');
const eventBase = require('./base');
const util = require('.././util');

module.exports = class Event {  
    constructor(o) {
        Object.assign(this, eventBase.event, o);
        //this.title = title;
        //this.author = author;
    }

    async tryWrite(){
        // ** present check ** //
        await util.data.check.present({field:'id', logic: ("id" in this), error:'E_EVENT_ID_MISSING'});
        await util.data.check.present({field:'version', logic: ("version" in this), error:'E_EVENT_VERSION_MISSING'});

        // ** typeof check ** //
        if(typeof this.version !== 'number') return Promise.reject( new Error('E_EVENT_VERSION_NOT_NUM') );

        // ** value check ** //
        if(this.id=='') return Promise.reject( new Error('E_EVENT_ID_BLANK') );
        if(this.version<0) return Promise.reject( new Error('E_EVENT_VERSION_BELOW_ZERO') );
        
        return; 
    }

    async doWrite(persist,broker) {
        await this.tryWrite();

        let status = {status:200};
        debug('write function called.');

        return status;
    }
}

// module.exports = function(event, persist, broker) {
//     debug('received event for processing: ', event);

// }