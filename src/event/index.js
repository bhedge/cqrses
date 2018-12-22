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
        if(typeof this !== 'object') return Promise.reject( new Error('E_EVENT_NOT_OBJECT') );
        if(this === null) return Promise.reject( new Error('E_EVENT_IS_NULL') );
        if(!this.id || this.id=='') return Promise.reject( new Error('E_EVENT_NO_ID') );

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