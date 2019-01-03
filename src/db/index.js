"use strict";
const debug = require('debug')('persist');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const util = require('../util');

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
        v.push( util.data.check.typeof({field: args, type: 'object', error:'E_DB_ARGS_NOT_OBJECT'}) );
        v.push( util.data.check.typeof({field: args.searchDoc, type: 'object', error:'E_DB_ARGSSEARCHDOC_NOT_OBJECT'}) );
        v.push( util.data.check.present({field:'aggregateId', logic: ("aggregateId" in args.searchDoc), error:'E_DB_AGGREGATIONID_MISSING'}) );
        
        await Promise.all( v );

        return db.get( args.collection )
            .find( args.searchDoc )
            .value();
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
        v.push( util.data.check.typeof({field: args, type: 'object', error:'E_DB_ARGS_NOT_OBJECT'}) );
        v.push( util.data.check.typeof({field: args.searchDoc, type: 'object', error:'E_DB_ARGSSEARCHDOC_NOT_OBJECT'}) );
        v.push( util.data.check.present({field:'aggregateRootId', logic: ("aggregateRootId" in args.searchDoc), error:'E_DB_AGGREGATIONROOTID_MISSING'}) );
        
        await Promise.all( v );

        return db.get( args.collection )
            .find( args.searchDoc )
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

