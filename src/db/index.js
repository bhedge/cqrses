"use strict";
/*
    This module handles the connection to the persisting store DAPI or direct DB connection
*/

const debug = require('debug')('db');
const lowdb = require('./lowdb.js');

const dbTypes = ['lowdb'];

/**
 * defines the required database interface
 * @param {Object} database - The database object for the constructor
 * @param {Object} database.query - The database query object
 * @param {function} database.query.readById - async function to read by id
 * @param {function} database.query.readByAggregateId - async function to read by aggregate id
 * @param {function} database.query.readByAggregateRootId - async function to read by aggregate root id
 * @param {function} database.query.getState - async function to read the current state by aggregate or root id
 * @param {function} database.query.count - async function to count the total number of documents
 * @param {Object} database.mutate - The database mutator object
 * @param {function} database.mutate.write - async function to write the events to the database
 */
const dbInterface = function (database, broker) {
    this.query = {};
    this.mutate = {};

    /* query section */
    this.query.readById = database.query.readById;
    this.query.readByAggregateId = database.query.readByAggregateId; 
    this.query.readByAggregateRootId = database.query.readByAggregateRootId;
    this.query.getState = database.query.getState;
    this.query.count = database.query.count;

    /* mutate section */
    this.mutate.write = database.mutate.write;
};

debug('loading the db through the adapter...');
module.exports = function (dbType, config, broker) {
    switch (dbType) {
        case 'lowdb':
            if(!global.__cqrses_lowdb) global.__cqrses_lowdb = new lowdb(config, broker)
            return new dbInterface( global.__cqrses_lowdb, broker )
        default:            
            return `The provided db type is not known. Must be one of the following:${dbTypes.toString()}`
    }
}