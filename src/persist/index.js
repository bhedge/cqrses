"use strict";
const debug = require('debug')('persist');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

/*
    This module handles the connection to the persisting store DAPI or direct DB connection
*/
debug('persist loaded.');

class DataStore {
    constructor(config) {
        if (!config) config = {};
        if (!config.lowdb) config.lowdb = {};
        if (!config.lowdb.defaultDB) {
            config.lowdb.defaultDB = {
                eventSource: [],
                count: 0
            }
        };
        if (!DataStore.instance) {
            // intialize the lowDB database for local dev
            db.defaults(config.lowdb.defaultDB)
                .write();

            this.config = config;
            this.dbType = 'lowdb'

            DataStore.instance = this;
        }

        return DataStore.instance;
    }

    readById(collection, id) {
        return db.get(collection)
            .find({
                id: id
            })
            .value();
    }

    readByAggregateId(collection, aggregateId) {
        return db.get(collection)
            .find({
                aggregateId: aggregateId
            })
            .value();
    }

    readByRootAggregateId(collection, rootAggregateId) {
        return db.get(collection)
            .find({
                rootAggregateId: rootAggregateId
            })
            .value();
    }

    count(collection) {
        return db.get(collection)
        .size()
        .value()
    }

    write(collection, event) {
        // Increment count
        db.update('count', n => n + 1)
            .write();

        db.get(collection)
            .push(event)
            .write();

        return;
    }
}

const instance = new DataStore();
Object.freeze(instance);

export default instance;