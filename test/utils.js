var t = require('tap')
const util = require('../src/util')

const validArg = {
  field: 'name',
  error: 'E_ERROR_MESSAGE',
  logic: false
}

const validObject = {
  stringCheck: 'i am string',
  objectCheck: { test: 'i am object' },
  numberCheck: 999222,
  arrayCheck: [{ test: 'array object' }, 1, 'string']
}

t.test('util.data.check.present should return 200 on valid args', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.logic = ('field' in testArg)
  let result = await util.data.check.present(testArg)
  t.same(result, { status: 200 }, 'should return status 200')
  t.end()
})

t.test('util.data.check.typof should return 200 on valid args for object', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.field = validObject.objectCheck
  testArg.type = 'object'
  let result = await util.data.check.typeof(testArg)
  t.same(result, { status: 200 }, 'should return status 200')
  t.end()
})

t.test('util.data.check.typof should return 200 on valid args for string', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.field = validObject.stringCheck
  testArg.type = 'string'
  let result = await util.data.check.typeof(testArg)
  t.same(result, { status: 200 }, 'should return status 200')
  t.end()
})

t.test('util.data.check.typof should return 200 on valid args for number', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.field = validObject.numberCheck
  testArg.type = 'number'
  let result = await util.data.check.typeof(testArg)
  t.same(result, { status: 200 }, 'should return status 200')
  t.end()
})

t.test('util.data.check.value should return 200 on valid args', async function (t) {
  let testArg = Object.assign({}, validArg)
  let result = await util.data.check.value(testArg)
  t.same(result, { status: 200 }, 'should return status 200')
  t.end()
})

// ** present check ** //
t.test('util.data.check.present should throw error when no arg', async function (t) {
  t.rejects(util.data.check.present(), { message: 'E_UTIL_ARGS_IS_NULL' })
  t.end()
})

t.test('util.data.check.present should throw error when arg is null', async function (t) {
  t.rejects(util.data.check.present(null), { message: 'E_UTIL_ARGS_IS_NULL' })
  t.end()
})

t.test('util.data.check.present should throw error when arg.field is missing', async function (t) {
  let testArg = Object.assign({}, validArg)
  delete testArg.field
  t.rejects(util.data.check.present(testArg), { message: 'E_UTIL_ARGS_FIELD_MISSING' })
  t.end()
})

t.test('util.data.check.present should throw error when arg.error is missing', async function (t) {
  let testArg = Object.assign({}, validArg)
  delete testArg.error
  t.rejects(util.data.check.present(testArg), { message: 'E_UTIL_ARGS_ERROR_MISSING' })
  t.end()
})

t.test('util.data.check.typeof should throw error when arg.logic is missing', async function (t) {
  let testArg = Object.assign({}, validArg)
  delete testArg.type
  t.rejects(util.data.check.typeof(testArg), { message: 'E_UTIL_ARGS_TYPE_MISSING' })
  t.end()
})

t.test('util.data.check.value should throw error when arg.logic is missing', async function (t) {
  let testArg = Object.assign({}, validArg)
  delete testArg.logic
  t.rejects(util.data.check.value(testArg), { message: 'E_UTIL_ARGS_LOGIC_MISSING' })
  t.end()
})

// ** typeof check ** //
t.test('util.data.check.present should throw error when arg is not an object', async function (t) {
  let testArgs = 'nope'
  t.rejects(util.data.check.present(testArgs), { message: 'E_UTIL_ARGS_NOT_OBJECT' })
  t.end()
})

t.test('util.data.check.typeof should throw error when type check for object evaluates to false', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.field = validObject.stringCheck
  testArg.type = 'object'
  t.rejects(util.data.check.typeof(testArg), { message: validArg.error })
  t.end()
})

t.test('util.data.check.typeof should throw error when type check for string evaluates to false', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.field = validObject.objectCheck
  testArg.type = 'string'
  t.rejects(util.data.check.typeof(testArg), { message: validArg.error })
  t.end()
})

// ** value check ** //
t.test('util.data.check.present should throw error when logic evaluates to false', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.logic = false
  t.rejects(util.data.check.present(testArg), { message: validArg.error })
  t.end()
})

t.test('util.data.check.value should throw error when logic evaluates to true', async function (t) {
  let testArg = Object.assign({}, validArg)
  testArg.logic = true
  t.rejects(util.data.check.value(testArg), { message: validArg.error })
  t.end()
})

t.test('util.flakeId should generate a new id', async function (t) {
  t.resolves(util.flakeId())
  t.end()
})

t.test('util.sleep should resolve to a sleep promise', async function (t) {
  t.resolves(util.sleep(2))
  t.end()
})

// t.test('util.sleep should sleep the specified amount of time of 1000 ms', async function (t) {
//     const waitMilliSeconds = 1000;
//     const start = process.hrtime();

//     await util.sleep( waitMilliSeconds );
//     const elapsed = process.hrtime(start)[1] / 1000;
//     const drift = 900; /* added because setTimeout is unreliable and returns faster than specified time because node */

//     const isDelayed = (elapsed + drift >= waitMilliSeconds);

//     if(!isDelayed) console.error('util.sleep elapsed:', elapsed, 'waitMilliSeconds:',waitMilliSeconds)

//     t.equal(isDelayed, true, 'should be true to signify delay of at least amount' )
//     t.end()
// })

t.test('util.retry should resolve to a promise', async function (t) {
  let f = async function () {

  }

  t.resolves(util.retry(f, 1, 1))
  t.end()
})

t.test('util.retry should fail first and retry the promise call successfully', async function (t) {
  let mock1 = 0

  let f = async function () {
    if (mock1 % 2 === 0) {
      mock1++
      return 'success'
    } else {
      mock1++
      throw Error('ERROR THROWN ON ODD')
    }
  }

  let result = await util.retry(f, 2, 2)

  t.same(result, 'success', 'should equal success on retry')
  t.end()
})

t.test('util.retry should pass with the defaults for retry and delay ', async function (t) {
  let mock1 = 0

  let f = async function () {
    if (mock1 % 2 === 0) {
      mock1++
      return 'success'
    } else {
      mock1++
      throw Error('ERROR THROWN ON ODD')
    }
  }

  let result = await util.retry(f)

  t.same(result, 'success', 'should equal success on retry')
  t.end()
})

t.test('util.retry should fail thrice and retry the promise call successfully', async function (t) {
  let mock2 = 0

  let f = async function () {
    mock2++
    if (mock2 === 4) return 'success'
    throw Error('ERROR THROWN')
  }

  let result = await util.retry(f, 3, 500)

  t.same(result, 'success', 'should equal success on retry')
  t.end()
})

t.test('util.retry should fail thrice and then reject', async function (t) {
  let mock3 = 0

  let f = async function () {
    mock3++
    if (mock3 === 4) return 'success'
    throw Error('ERROR THROWN')
  }

  t.rejects(util.retry(f, 2, 500), 'should reject retry')
  t.end()
})
