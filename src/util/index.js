'use strict'
const debug = require('debug')('util')
/*
    This module combines all of the useful utilities
*/
debug('util loaded.')

const FlakeIdGen = require('flake-idgen')
const intformat = require('biguint-format')
const generator = new FlakeIdGen()

let util = {}
util.data = {}
util.data.check = {}

/**
 * Assign the args for the function
 * @param {Object} args - The arguments for the function
 * @param {string} args.field - The name of the field you are evaluating
 * @param {boolean} args.logic - The logic statement passed in should evaluate to true or false
 * @param {string} args.error - The error message to throw if logic evaluates to false
 */
util.data.check.present = async function (args) {
  await preReqCheck(args)
  if (!args.logic) return Promise.reject(new Error(args.error))
  return { status: 200 }
}

/**
 * Assign the args for the function
 * @param {Object} args - The arguments for the function
 * @param {string} args.field - The name of the field you are evaluating
 * @param {string} args.type - The typeof that the passed in field should be object, string, number or array
 * @param {string} args.error - The error message to throw if logic evaluates to false
 */
util.data.check.typeof = async function (args) {
  await preReqCheck(args)
  if (!('type' in args)) return Promise.reject(new Error('E_UTIL_ARGS_TYPE_MISSING'))

  switch (args.type) {
    case 'string':
      if (typeof args.field !== 'string') return Promise.reject(new Error(args.error))
      break
    case 'number':
      if (typeof args.field !== 'number') return Promise.reject(new Error(args.error))
      break
    case 'object':
      if (typeof args.field !== 'object') return Promise.reject(new Error(args.error))
      break
  }

  // if(typeof this.version !== 'number') return Promise.reject( new Error('E_EVENT_VERSION_NOT_NUM') );
  return { status: 200 }
}

/**
 * Assign the args for the function
 * @param {Object} args - The arguments for the function
 * @param {string} args.field - The name of the field you are evaluating
 * @param {boolean} args.logic - The logic statement passed in should evaluate to true or false
 * @param {string} args.error - The error message to throw if logic evaluates to false
 */
util.data.check.value = async function (args) {
  await preReqCheck(args)
  if (!('logic' in args)) return Promise.reject(new Error('E_UTIL_ARGS_LOGIC_MISSING'))
  if (args.logic) return Promise.reject(new Error(args.error))
  return { status: 200 }
}

/**
 * Assign the args for the function
 * @param {Object} args - The arguments for the function
 * @param {string} args.field - The name of the field you are evaluating
 * @param {string} args.error - The error message to throw if logic evaluates to false
 */
async function preReqCheck (args) {
  if (!args) return Promise.reject(new Error('E_UTIL_ARGS_IS_NULL'))
  if (typeof args !== 'object') return Promise.reject(new Error('E_UTIL_ARGS_NOT_OBJECT'))
  if (!('field' in args)) return Promise.reject(new Error('E_UTIL_ARGS_FIELD_MISSING'))
  if (!('error' in args)) return Promise.reject(new Error('E_UTIL_ARGS_ERROR_MISSING'))
}

util.flakeId = async function () {
  return intformat(generator.next(), 'hex', { prefix: '0x' })
}

/**
 * Sleep function to delay processing
 * @param {number} ms - The delay in milliseconds for the sleep process
 */
util.sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry function with infinite backoff
 * @param {number} retryCount - The number of times to retry
 * @param {function} f - The function to be called
 * @param {number} delay - The delay in milliseconds for the infinite backoff
 */
util.retry = (fn, retryCount = 3, delay = 500) =>
  fn().catch(err => retryCount >= 1
    ? util.sleep(delay).then(() => util.retry(fn, retryCount - 1, delay * 2))
    : Promise.reject(err))

// util.retry = async function (retryCount=3, fn, delay, err=null) {
//     if (!retryCount) {
//       return Promise.reject(err);
//     }
//     Promise.resolve(fn).catch(err => {
//         return util.sleep(delay).then(() => util.retry(retryCount -1, fn, delay * 2, err));
//     });
// }

module.exports = util
