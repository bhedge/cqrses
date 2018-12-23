var t = require('tap');
const util = require('../src/util');

const validArg = {
    name: 'test_args',
    field: 'name',
    error: 'E_ERROR_MESSAGE',
    logic: true
}

const validObject = {
    stringCheck: 'i am string',
    objectCheck: {test: 'i am object'},
    numberCheck: 999222,
    arrayCheck: [{test:'array object'}, 1, 'string']
}

t.test('util.data.check.present should return 200 on valid args', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.logic = ("name" in testArg);
    let result = await util.data.check.present(testArg);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

t.test('util.data.check.typof should return 200 on valid args for object', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.field = validObject.objectCheck;
    testArg.type = 'object';
    let result = await util.data.check.typeof(testArg);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

t.test('util.data.check.typof should return 200 on valid args for string', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.field = validObject.stringCheck;
    testArg.type = 'string';
    let result = await util.data.check.typeof(testArg);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

t.test('util.data.check.typof should return 200 on valid args for number', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.field = validObject.numberCheck;
    testArg.type = 'number';
    let result = await util.data.check.typeof(testArg);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})

t.test('util.data.check.value should return 200 on valid args', async function (t) {
    let testArg = Object.assign({}, validArg);
    let result = await util.data.check.value(testArg);
    t.same(result, {status: 200}, 'should return status 200');
    t.end()
})



// ** present check ** //
t.test('util.data.check.present should throw error when no arg', async function (t) {
    t.rejects( util.data.check.present() , {message:'E_UTIL_ARGS_IS_NULL'})
    t.end()
})

t.test('util.data.check.present should throw error when arg is null', async function (t) {
    t.rejects( util.data.check.present(null) , {message:'E_UTIL_ARGS_IS_NULL'})
    t.end()
})

t.test('util.data.check.present should throw error when arg.name is missing', async function (t) {
    let testArg = Object.assign({}, validArg);
    delete testArg.name;
    t.rejects( util.data.check.present(testArg) , {message:'E_UTIL_ARGS_NAME_MISSING'})
    t.end()
})

t.test('util.data.check.present should throw error when arg.field is missing', async function (t) {
    let testArg = Object.assign({}, validArg);
    delete testArg.field;
    t.rejects( util.data.check.present(testArg) , {message:'E_UTIL_ARGS_FIELD_MISSING'})
    t.end()
})

t.test('util.data.check.present should throw error when arg.error is missing', async function (t) {
    let testArg = Object.assign({}, validArg);
    delete testArg.error;
    t.rejects( util.data.check.present(testArg) , {message:'E_UTIL_ARGS_ERROR_MISSING'})
    t.end()
})

t.test('util.data.check.typeof should throw error when arg.logic is missing', async function (t) {
    let testArg = Object.assign({}, validArg);
    delete testArg.type;
    t.rejects( util.data.check.typeof(testArg) , {message:'E_UTIL_ARGS_TYPE_MISSING'})
    t.end()
})

t.test('util.data.check.value should throw error when arg.logic is missing', async function (t) {
    let testArg = Object.assign({}, validArg);
    delete testArg.logic;
    t.rejects( util.data.check.value(testArg) , {message:'E_UTIL_ARGS_LOGIC_MISSING'})
    t.end()
})

// ** typeof check ** //
t.test('util.data.check.present should throw error when arg is not an object', async function (t) {
    let testArgs = 'nope';
    t.rejects( util.data.check.present(testArgs) , {message:'E_UTIL_ARGS_NOT_OBJECT'})
    t.end()
})

t.test('util.data.check.typeof should throw error when type check for string evaluates to false', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.field = validObject.stringCheck;
    testArg.type = 'object';
    t.rejects( util.data.check.typeof(testArg) , {message: validArg.error })
    t.end()
})

// t.test('Event should throw error when id not a number', async function (t) {
//     let testEvent = Object.assign({}, validEvent);
//     testEvent.version = 'nope';
//     let event = new Event( testEvent );
//     t.rejects( event.tryWrite() , {message:'E_EVENT_VERSION_NOT_NUM'})
//     t.end()
// })

// ** value check ** //
t.test('util.data.check.present should throw error when name is blank', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.name = '';

    t.rejects( util.data.check.present(testArg) , {message:'E_UTIL_ARGS_NAME_BLANK'})
    t.end()
})

t.test('util.data.check.present should throw error when logic evaluates to false', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.logic = false;
    t.rejects( util.data.check.present(testArg) , {message: validArg.error })
    t.end()
})

t.test('util.data.check.value should throw error when logic evaluates to false', async function (t) {
    let testArg = Object.assign({}, validArg);
    testArg.logic = false;
    t.rejects( util.data.check.value(testArg) , {message: validArg.error })
    t.end()
})



