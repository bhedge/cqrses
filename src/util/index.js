"use strict";
const debug = require('debug')('util');
/*
    This module combines all of the useful utilities
*/
debug('util loaded.');

let util = {};
util.data = {};
util.data.check = {};

util.data.check.present = async function(args) {
    await preReqCheck(args);
    if(!args.logic) return Promise.reject( new Error(args.error) );
    return {status: 200};
};

util.data.check.typeof = async function(args) {
    await preReqCheck(args);
    if(!("type" in args)) return Promise.reject( new Error('E_UTIL_ARGS_TYPE_MISSING') );
    if(typeof args.field !== args.type) return Promise.reject( new Error(args.error) );
    //if(typeof this.version !== 'number') return Promise.reject( new Error('E_EVENT_VERSION_NOT_NUM') );
    return {status: 200};
};

util.data.check.value = async function(args) {
    await preReqCheck(args);
    if(!("logic" in args)) return Promise.reject( new Error('E_UTIL_ARGS_LOGIC_MISSING') );
    if(!args.logic) return Promise.reject( new Error(args.error) );
    return {status: 200};
};

async function preReqCheck(args){
    if(!args) return Promise.reject( new Error('E_UTIL_ARGS_IS_NULL') );
    if(typeof args !== 'object') return Promise.reject( new Error('E_UTIL_ARGS_NOT_OBJECT') );
    if(!("name" in args)) return Promise.reject( new Error('E_UTIL_ARGS_NAME_MISSING') );
    if(!("error" in args)) return Promise.reject( new Error('E_UTIL_ARGS_ERROR_MISSING') );
    if(args.name === '') return Promise.reject( new Error('E_UTIL_ARGS_NAME_BLANK') );
    if(!("field" in args)) return Promise.reject( new Error('E_UTIL_ARGS_FIELD_MISSING') );

    return;
}

module.exports = util;