"use strict";
const debug = require('debug')('broker');
const util = require('../util');

/*
    This module handles the connection to the broker for publishing events
*/
debug('broker loaded.');


"use strict";
const amqpmock = require('amqp-mock');

module.exports = function (config) {
    let defaultConfig = {};
    this.config = config || defaultConfig;

    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @returns {string} emmited - return emitted message
     */
    this.publish = async function publish(args) {
        let v = [];
        v.push(util.data.check.typeof({
            field: args,
            type: 'object',
            error: 'E_DB_ARGS_NOT_OBJECT'
        }));

        await Promise.all(v);

        return 'emitted';
    }
}