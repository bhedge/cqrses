'use strict'

const debug = require('debug')('db-lowdb');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const util = require('../util');

const _ = require('lodash');

debug('lowdb loaded.');

module.exports = function (config, broker) {
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

    this.config = config;
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
    this.query.getState = getState;

    this.query.count = async function count() {
        return db.get('count')
            .value();
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
    this.mutate.write = async function write(args) {
        const dbWriter = args.dbWriter || db;
        const eventToPersist = Object.assign({}, args.event);
  
        let dbWrites = [];
        dbWrites.push(
            dbWriter.get('emit')
            .push({
                id: eventToPersist.id,
                mutatedDate: new Date().toISOString()
            })
            .write()
        );
        dbWrites.push(
            dbWriter.get(args.collection)
            .push(eventToPersist)
            .write()
        );
        dbWrites.push(
            dbWriter.update('count', n => n + 1)
            .write()
        );
        await Promise.all(dbWrites);
        return;
    }

    this.mutate.removeEmit = async function removeEmit(args) {
        const dbWriter = args.dbWriter || db;
        dbWriter.get('emit')
                .remove({
                    id: args.event.id
                })
                .write();
        return;
    }
};

const sortByVersion = async function (a) {
    return _.sortBy(a, 'version');;
}

let getState = async function (args) {
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


