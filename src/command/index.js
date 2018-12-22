"use strict";
const debug = require('debug')('command');

/*
    This module handles the command to event mapping for the various actors
*/
debug('command loaded.');

const actors = require('./actors');
const commands = require('./commands');