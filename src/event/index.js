"use strict";
const debug = require('debug')('event');
/*
    This module handles the event logic
*/
debug('event loaded.');
const eventBase = require('./base');

module.exports = class Event {  
    constructor(o) {
        Object.assign(this, eventBase.event, o);
        //this.title = title;
        //this.author = author;
    }

    async tryWrite(){
        if(this === null) return Promise.reject( new Error('E_EVENT_IS_NULL') );
        if(typeof this !== 'object') return Promise.reject( new Error('E_EVENT_NOT_OBJECT') );

        // ** present check ** //
        if(!("id" in this)) return Promise.reject( new Error('E_EVENT_ID_MISSING') );
        if(!("version" in this)) return Promise.reject( new Error('E_EVENT_VERSION_MISSING') );

        // ** typeof check ** //
        if(typeof this.version !== 'number') return Promise.reject( new Error('E_EVENT_VERSION_NOT_NUM') );

        // ** value check ** //
        if(this.id=='') return Promise.reject( new Error('E_EVENT_ID_BLANK') );
        if(this.version<0) return Promise.reject( new Error('E_EVENT_VERSION_BELOW_ZERO') );
        
        return; 
    }

    async doWrite(persist,broker) {
        await this.tryWrite();

        let status = {code:200};
        debug('write function called.');

        return status;
    }
}

// module.exports = function(event, persist, broker) {
//     debug('received event for processing: ', event);

// }