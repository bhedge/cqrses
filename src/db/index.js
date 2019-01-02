"use strict";
const debug = require('debug')('persist');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

/*
    This module handles the connection to the persisting store DAPI or direct DB connection
*/
debug('db loaded.');

module.exports = function (config) {
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

    db.defaults(this.config.lowdb.defaultDB)
        .write();

    this.query.readById = async function readById(collection, id) {
        return db.get(collection)
            .find({
                id: id
            })
            .value();
    }

    this.query.readByAggregateId = async function readByAggregateId(collection, aggregateId, version) {
        return db.get(collection)
            .find({
                aggregateId: aggregateId,
                version: version
            })
            .value();
    }

    this.query.readByAggregateRootId = async function readByAggregateRootId(collection, aggregateRootId, version) {
        return db.get(collection)
            .find({
                aggregateRootId: aggregateRootId,
                version: version
            })
            .value();
    }

    this.query.count = async function count() {
        return db.get('count')
            .value();
    }

    this.mutate.write = async function write(collection, event) {
        let status = {
            status: 200
        };

        // Increment count
        await db.update('count', n => n + 1)
            .write();

        await db.get(collection)
            .push(event)
            .write();

        return status;
    }
};

