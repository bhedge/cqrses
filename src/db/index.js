"use strict";
const debug = require('debug')('db');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const util = require('../util');

const _ = require('lodash');

/*
    This module handles the connection to the persisting store DAPI or direct DB connection
*/
debug('loaded.');

module.exports = function (config, broker) {
    let defaultConfig = {};
    defaultConfig.lowdb = {};
    defaultConfig.lowdb.defaultDB = {
        eventSource: [],
        count: 0
    };

    this.config = config || defaultConfig;
    this.dbType = 'lowdb'
    this.query = {};
    this.mutate = {};

    debug('config set to ', config);

    db.defaults(this.config.lowdb.defaultDB)
        .write();

    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @param {string} args.collection - The name of the collection to query i.e. eventSource
     * @param {Object} args.searchDoc - The search object for the fields to search by and values
     * @param {string} args.searchDoc.id - The primary key for the search
     * @returns {Object} event - the event returned from the search
     */
    this.query.readById = async function readById(args) {
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

        return Object.freeze(db.get(args.collection)
            .find(args.searchDoc)
            .value());
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
    this.query.readByAggregateId = async function readByAggregateId(args) {
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

        return Object.freeze(db.get(args.collection)
            .filter(args.searchDoc)
            .value());
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
    this.query.readByAggregateRootId = async function readByAggregateRootId(args) {
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

        return Object.freeze(
            db.get(args.collection)
            .filter(args.searchDoc)
            .value()
        );
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
    this.query.state = state;

    this.query.count = async function count() {
        return db.get('count')
            .value();
    }

    this.mutate.write = async function write(collection, event, pubBroker=broker) {
        const eventToPersist = Object.assign({}, event);

        // fetch current state
        const currentState = await state({collection: collection, searchDoc: { aggregateId: event.aggregateId } });
        const currentStateVersion = Object.assign({}, {version: -1}, currentState);

        if(!eventToPersist.version && currentStateVersion.version) eventToPersist.version = currentStateVersion.version + 1;
        if( (currentStateVersion.version + 1) != (eventToPersist.version ) ) return Promise.reject( new Error('E_DB_WRITE_EVENT_VERSION_MISMATCH') );

        // write to the DB
        await db.get(collection)
            .push( eventToPersist )
            .write();

        // increment count
        await db.update('count', n => n + 1)
        .write();

        let brokerPublish = () => pubBroker.publish( eventToPersist );

        try{
            let result = await util.retry(brokerPublish, 3, 500) ;
            return Object.freeze( Object.assign({}, currentState, eventToPersist) );
        } catch(err) {
            throw err;
        }
    }
};

const sortByVersion = async function (a) {
    return _.sortBy(a, 'version');;
}

let state = async function (args) {
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

    const results = await db.get(args.collection)
        .filter(args.searchDoc)
        .value();

    const sortedResults = await sortByVersion(results);
    return Object.freeze(Object.assign({}, ...sortedResults));
}