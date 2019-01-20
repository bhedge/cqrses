'use strict'

const debug = require('debug')('db-lowdb');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

debug('lowdb loaded.');

module.exports = function (config) {
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
        return Object.freeze(
            db.get(args.collection)
            .filter(args.searchDoc)
            .value()
        );
    }

    this.query.count = async function count() {
        return db.get('count')
            .value();
    }

    /**
     * Assign the args for the function
     * @param {Object} args - The arguments for the function
     * @param {string} args.collection - The name of the collection to query i.e. eventSource
     * @param {Object} args.event - The event to be persisted
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

