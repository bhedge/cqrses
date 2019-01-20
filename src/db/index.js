"use strict";
/*
    This module handles the connection to the persisting store DAPI or direct DB connection
*/

const debug = require('debug')('db');
const util = require('../util');

const dbTypes = ['lowdb'];
const lowdb = require('./lowdb.js');

const _ = require('lodash');

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
const dbInterface = function (database, connectionId, broker) {
    this.query = {};
    this.mutate = {};

    this.dbType = database.dbType;
    this.connectionId = connectionId;

    const db = database;

    /* query section */
    this.query.readById = dbReadById;
    this.query.readByAggregateId = dbReadByAggregateId; 
    this.query.readByAggregateRootId = dbReadByAggregateRootId;
    this.query.getState = dbGetState;
    this.query.count = db.query.count;

    /* mutate section */
    this.mutate.write = dbWrite;
    this.mutate.removeEmit = db.mutate.removeEmit;


    /* function section */

    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @param {string} args.collection - The name of the collection to query i.e. eventSource
     * @param {Object} args.searchDoc - The search object for the fields to search by and values
     * @param {string} args.searchDoc.id - The primary key for the search
     * @returns {Object} event - the event returned from the search
     */
    async function dbReadById(args){
        await preFlightDbReadById(args)
        const result = await db.query.readById(args);
        return result;
    }

    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @param {string} args.collection - The name of the collection to query i.e. eventSource
     * @param {Object} args.searchDoc - The search object for the fields to search by and values
     * @param {string} args.searchDoc.aggregateId - The primary key for the search
     * @param {string=} args.searchDoc.version - Optional version to get a specific version
     * @returns {Object} event - the events returned from the search
     */
    async function dbReadByAggregateId(args){
        await preFlightDbReadByAggregateId(args);
        const result = await db.query.readByAggregateId(args);
        return result;
    }

    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @param {string} args.collection - The name of the collection to query i.e. eventSource
     * @param {Object} args.searchDoc - The search object for the fields to search by and values
     * @param {string} args.searchDoc.aggregateRootId - The primary key for the search
     * @param {string=} args.searchDoc.version - Optional version to get a specific version
     * @returns {Object} event - the events returned from the search
     */
    async function dbReadByAggregateRootId(args){
        await preFlightDbReadByAggregateRootId(args)
        const result = await db.query.readByAggregateRootId(args)
        return result
    }

    const sortByVersion = async function (a) {
        return _.sortBy(a, 'version');;
    }

    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @param {string} args.collection - The name of the collection to query i.e. eventSource
     * @param {Object} args.searchDoc - The search object for the fields to search by and values
     * @param {string=} args.searchDoc.aggregateRootId - The primary key for the search
     * @param {string=} args.searchDoc.aggregateId - The primary key for the search
     * @returns {Object} events - the events returned from the search
     */
    async function dbGetState (args) {
        await preFlightDbGetState(args);
        const results = await dbReadByAggregateId(args);
        const sortedResults = await sortByVersion(results);
        return Object.freeze(Object.assign({}, ...sortedResults));
    }
    
    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @param {string} args.collection - The name of the collection to query i.e. eventSource
     * @param {Object} args.event - The event to be persisted
     * @param {Object=} args.pubBroker - The broker to use to emit the persisted event
     * @param {Object=} args.dbWriter - The db connection to persist the event to
     * @returns {Object} events - the events returned from the search
     */
    async function dbWrite(args){
        await preFlightDbWrite(args);
    
        const pubBroker = args.pubBroker || broker;
        const eventToPersist = Object.assign({}, args.event);

        const currentState = await dbGetState({
            collection: args.collection,
            searchDoc: {
                aggregateId: args.event.aggregateId
            }
        });

        const currentStateVersion = Object.assign({}, {
            version: -1
        }, currentState);
    
        if (!eventToPersist.version && currentStateVersion.version) eventToPersist.version = currentStateVersion.version + 1;
        if ((currentStateVersion.version + 1) != (eventToPersist.version)) return Promise.reject(new Error('E_DB_WRITE_EVENT_VERSION_MISMATCH'));
    
        const updatedArgs = Object.assign({}, args, {event: eventToPersist});
        await db.mutate.write(updatedArgs);
        
        const brokerPublish = () => pubBroker.publish(eventToPersist);
        try {
            let result = await util.retry(brokerPublish, 3, 500); 
            await db.mutate.removeEmit(args);    
            return Object.freeze(Object.assign({}, currentState, eventToPersist));
        } catch (err) {
            let output = {};
            output.event = Object.freeze(Object.assign({}, currentState, eventToPersist));
            output.errors = [];
            output.errors.push('broker failed to accept the event after 3 retries.');
    
            return output;
        }
    }
};

debug('loading the db through the adapter...');
module.exports = function (dbType, config, broker, connectionId=0) {
    switch (dbType) {
        case 'lowdb':
            let v = [];
            v.push(util.data.check.typeof({
                field: config,
                type: 'object',
                error: 'E_DB_CONFIG_NOT_OBJECT'
            }));

            v.push(util.data.check.typeof({
                field: broker,
                type: 'object',
                error: 'E_DB_BROKER_NOT_OBJECT'
            }));

            Promise.all( v );

            if(!global.__cqrses_lowdb) global.__cqrses_lowdb = {dbType:'lowdb'};
            
            if(!global.__cqrses_lowdb[ connectionId ]) {
                const newLowdb = new lowdb(config, broker);
                global.__cqrses_lowdb[ connectionId ] = Object.freeze( new dbInterface( newLowdb, connectionId, broker ) );  
            }

            return global.__cqrses_lowdb[ connectionId ];
        default:            
            return `The provided db type is not known. Must be one of the following:${dbTypes.toString()}`
    }
}

async function preFlightDbReadById(args){
    let v = [];
    v.push(util.data.check.typeof({
        field: args,
        type: 'object',
        error: 'E_DB_ARGS_NOT_OBJECT'
    }));
    v.push(util.data.check.typeof({
        field: args.searchDoc,
        type: 'object',
        error: 'E_DB_ARGSSEARCHDOC_NOT_OBJECT'
    }));
    v.push(util.data.check.present({
        field: 'id',
        logic: ("id" in args.searchDoc),
        error: 'E_DB_ID_MISSING'
    }));

    await Promise.all(v);
    return;
}

async function preFlightDbGetState(args) {
    let v = [];
    v.push(util.data.check.typeof({
        field: args,
        type: 'object',
        error: 'E_DB_ARGS_NOT_OBJECT'
    }));
    v.push(util.data.check.typeof({
        field: args.searchDoc,
        type: 'object',
        error: 'E_DB_ARGSSEARCHDOC_NOT_OBJECT'
    }));
    v.push(util.data.check.present({
        field: 'aggregateRootId || aggregateId',
        logic: ("aggregateRootId" in args.searchDoc || "aggregateId" in args.searchDoc),
        error: 'E_DB_AGGREGATIONROOTID_AND_AGGREGATIONID_MISSING'
    }));

    await Promise.all(v);
    return;
}

async function preFlightDbReadByAggregateId(args){
    let v = [];
    v.push(util.data.check.typeof({
        field: args,
        type: 'object',
        error: 'E_DB_ARGS_NOT_OBJECT'
    }));
    v.push(util.data.check.typeof({
        field: args.searchDoc,
        type: 'object',
        error: 'E_DB_ARGSSEARCHDOC_NOT_OBJECT'
    }));
    v.push(util.data.check.present({
        field: 'aggregateId',
        logic: ("aggregateId" in args.searchDoc),
        error: 'E_DB_AGGREGATIONID_MISSING'
    }));

    await Promise.all(v);
    return;
}

async function preFlightDbReadByAggregateRootId(args){
    let v = [];
    v.push(util.data.check.typeof({
        field: args,
        type: 'object',
        error: 'E_DB_ARGS_NOT_OBJECT'
    }));
    v.push(util.data.check.typeof({
        field: args.searchDoc,
        type: 'object',
        error: 'E_DB_ARGSSEARCHDOC_NOT_OBJECT'
    }));
    v.push(util.data.check.present({
        field: 'aggregateRootId',
        logic: ("aggregateRootId" in args.searchDoc),
        error: 'E_DB_AGGREGATIONROOTID_MISSING'
    }));

    await Promise.all(v);
    return;
}

async function preFlightDbWrite(args) {
    let v = [];
    v.push(util.data.check.typeof({
        field: args,
        type: 'object',
        error: 'E_DB_ARGS_NOT_OBJECT'
    }));
    v.push(util.data.check.typeof({
        field: args.event,
        type: 'object',
        error: 'E_DB_EVENT_NOT_OBJECT'
    }));
    if (args.pubBroker) {
        v.push(util.data.check.typeof({
            field: args.pubBroker,
            type: 'object',
            error: 'E_DB_PUBBROKER_NOT_OBJECT'
        }));
    }
    if (args.dbWriter) {
        v.push(util.data.check.typeof({
            field: args.dbWriter,
            type: 'object',
            error: 'E_DB_DBWRITER_NOT_OBJECT'
        }));
    }
    v.push(util.data.check.present({
        field: 'collection',
        logic: ("collection" in args),
        error: 'E_DB_COLLECTION_MISSING'
    }));

    await Promise.all(v);
    return;
}