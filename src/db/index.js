"use strict";
/*
    This module handles the connection to the persisting store DAPI or direct DB connection
*/

const debug = require('debug')('db');
const lowdb = require('./lowdb.js');

const dbTypes = ['lowdb'];

debug('loading the db through the adapter...');
module.exports = function (dbType, config, broker) {
    switch (dbType) {
        case 'lowdb':
            if(!global.__cqrses_lowdb) global.__cqrses_lowdb = new lowdb(config, broker)
            return global.__cqrses_lowdb;
        // default:            
        //     return Promise.reject (`The provided db type is not known. Must be one of the following:${dbTypes.toString()}`);
    }
}