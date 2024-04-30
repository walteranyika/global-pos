(function () {
'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global_1 =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});

var functionBindNative = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var call = Function.prototype.call;

var functionCall = functionBindNative ? call.bind(call) : function () {
  return call.apply(call, arguments);
};

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

var objectPropertyIsEnumerable = {
	f: f
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var FunctionPrototype = Function.prototype;
var call$1 = FunctionPrototype.call;
var uncurryThisWithBind = functionBindNative && FunctionPrototype.bind.bind(call$1, call$1);

var functionUncurryThis = functionBindNative ? uncurryThisWithBind : function (fn) {
  return function () {
    return call$1.apply(fn, arguments);
  };
};

var toString = functionUncurryThis({}.toString);
var stringSlice = functionUncurryThis(''.slice);

var classofRaw = function (it) {
  return stringSlice(toString(it), 8, -1);
};

var $Object = Object;
var split = functionUncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
var isNullOrUndefined = function (it) {
  return it === null || it === undefined;
};

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings



var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var documentAll = typeof document == 'object' && document.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var isCallable = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};

var isObject = function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global_1[namespace]) : global_1[namespace] && global_1[namespace][method];
};

var objectIsPrototypeOf = functionUncurryThis({}.isPrototypeOf);

var engineUserAgent = typeof navigator != 'undefined' && String(navigator.userAgent) || '';

var process = global_1.process;
var Deno$1 = global_1.Deno;
var versions = process && process.versions || Deno$1 && Deno$1.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && engineUserAgent) {
  match = engineUserAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = engineUserAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

var engineV8Version = version;

/* eslint-disable es/no-symbol -- required for testing */




var $String = global_1.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && engineV8Version && engineV8Version < 41;
});

/* eslint-disable es/no-symbol -- required for testing */


var useSymbolAsUid = symbolConstructorDetection
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var $Object$1 = Object;

var isSymbol = useSymbolAsUid ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && objectIsPrototypeOf($Symbol.prototype, $Object$1(it));
};

var $String$1 = String;

var tryToString = function (argument) {
  try {
    return $String$1(argument);
  } catch (error) {
    return 'Object';
  }
};

var $TypeError$1 = TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable = function (argument) {
  if (isCallable(argument)) return argument;
  throw new $TypeError$1(tryToString(argument) + ' is not a function');
};

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};

var $TypeError$2 = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = functionCall(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = functionCall(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = functionCall(fn, input))) return val;
  throw new $TypeError$2("Can't convert object to primitive value");
};

var isPure = false;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

var defineGlobalProperty = function (key, value) {
  try {
    defineProperty(global_1, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global_1[key] = value;
  } return value;
};

var sharedStore = createCommonjsModule(function (module) {




var SHARED = '__core-js_shared__';
var store = module.exports = global_1[SHARED] || defineGlobalProperty(SHARED, {});

(store.versions || (store.versions = [])).push({
  version: '3.37.0',
  mode:  'global',
  copyright: '© 2014-2024 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.37.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});
});

var shared = function (key, value) {
  return sharedStore[key] || (sharedStore[key] = value || {});
};

var $Object$2 = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject = function (argument) {
  return $Object$2(requireObjectCoercible(argument));
};

var hasOwnProperty = functionUncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};

var id = 0;
var postfix = Math.random();
var toString$1 = functionUncurryThis(1.0.toString);

var uid = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$1(++id + postfix, 36);
};

var Symbol$1 = global_1.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = useSymbolAsUid ? Symbol$1['for'] || Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

var wellKnownSymbol = function (name) {
  if (!hasOwnProperty_1(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = symbolConstructorDetection && hasOwnProperty_1(Symbol$1, name)
      ? Symbol$1[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

var $TypeError$3 = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = functionCall(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw new $TypeError$3("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};

var document$1 = global_1.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document$1) && isObject(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !descriptors && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
var f$1 = descriptors ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (ie8DomDefine) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwnProperty_1(O, P)) return createPropertyDescriptor(!functionCall(objectPropertyIsEnumerable.f, O, P), O[P]);
};

var objectGetOwnPropertyDescriptor = {
	f: f$1
};

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = descriptors && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});

var $String$2 = String;
var $TypeError$4 = TypeError;

// `Assert: Type(argument) is Object`
var anObject = function (argument) {
  if (isObject(argument)) return argument;
  throw new $TypeError$4($String$2(argument) + ' is not an object');
};

var $TypeError$5 = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
var f$2 = descriptors ? v8PrototypeDefineBug ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError$5('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var objectDefineProperty = {
	f: f$2
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var FunctionPrototype$1 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = descriptors && Object.getOwnPropertyDescriptor;

var EXISTS$1 = hasOwnProperty_1(FunctionPrototype$1, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS$1 && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE$1 = EXISTS$1 && (!descriptors || (descriptors && getDescriptor(FunctionPrototype$1, 'name').configurable));

var functionName = {
  EXISTS: EXISTS$1,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE$1
};

var functionToString = functionUncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(sharedStore.inspectSource)) {
  sharedStore.inspectSource = function (it) {
    return functionToString(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap = global_1.WeakMap;

var weakMapBasicDetection = isCallable(WeakMap) && /native code/.test(String(WeakMap));

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$1 = global_1.TypeError;
var WeakMap$1 = global_1.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError$1('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (weakMapBasicDetection || sharedStore.state) {
  var store = sharedStore.state || (sharedStore.state = new WeakMap$1());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError$1(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwnProperty_1(it, STATE)) throw new TypeError$1(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwnProperty_1(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwnProperty_1(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

var makeBuiltIn_1 = createCommonjsModule(function (module) {





var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;



var enforceInternalState = internalState.enforce;
var getInternalState = internalState.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = functionUncurryThis(''.slice);
var replace = functionUncurryThis(''.replace);
var join = functionUncurryThis([].join);

var CONFIGURABLE_LENGTH = descriptors && !fails(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwnProperty_1(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (descriptors) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwnProperty_1(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwnProperty_1(options, 'constructor') && options.constructor) {
      if (descriptors) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwnProperty_1(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');
});

var defineBuiltIn = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable(value)) makeBuiltIn_1(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else objectDefineProperty.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
var mathTrunc = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : mathTrunc(number);
};

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

var min$1 = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength = function (argument) {
  var len = toIntegerOrInfinity(argument);
  return len > 0 ? min$1(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike = function (obj) {
  return toLength(obj.length);
};

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    if (length === 0) return !IS_INCLUDES && -1;
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var indexOf = arrayIncludes.indexOf;


var push = functionUncurryThis([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwnProperty_1(hiddenKeys, key) && hasOwnProperty_1(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwnProperty_1(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
	f: f$3
};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
var f$4 = Object.getOwnPropertySymbols;

var objectGetOwnPropertySymbols = {
	f: f$4
};

var concat = functionUncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwnProperty_1(target, key) && !(exceptions && hasOwnProperty_1(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global_1;
  } else if (STATIC) {
    target = global_1[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = global_1[TARGET] && global_1[TARGET].prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

var toStringTagSupport = String(test) === '[object z]';

var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
var $Object$3 = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof = toStringTagSupport ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object$3(it), TO_STRING_TAG$1)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};

var $String$3 = String;

var toString_1 = function (argument) {
  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String$3(argument);
};

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
var f$5 = descriptors && !v8PrototypeDefineBug ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) objectDefineProperty.f(O, key = keys[index++], props[key]);
  return O;
};

var objectDefineProperties = {
	f: f$5
};

var html = getBuiltIn('document', 'documentElement');

/* global ActiveXObject -- old IE, WSH */








var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : objectDefineProperties.f(result, Properties);
};

var arraySlice = functionUncurryThis([].slice);

/* eslint-disable es/no-object-getownpropertynames -- safe */


var $getOwnPropertyNames = objectGetOwnPropertyNames.f;


var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames(it);
  } catch (error) {
    return arraySlice(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var f$6 = function getOwnPropertyNames(it) {
  return windowNames && classofRaw(it) === 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames(toIndexedObject(it));
};

var objectGetOwnPropertyNamesExternal = {
	f: f$6
};

var defineBuiltInAccessor = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn_1(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn_1(descriptor.set, name, { setter: true });
  return objectDefineProperty.f(target, name, descriptor);
};

var f$7 = wellKnownSymbol;

var wellKnownSymbolWrapped = {
	f: f$7
};

var path = global_1;

var defineProperty$1 = objectDefineProperty.f;

var wellKnownSymbolDefine = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!hasOwnProperty_1(Symbol, NAME)) defineProperty$1(Symbol, NAME, {
    value: wellKnownSymbolWrapped.f(NAME)
  });
};

var symbolDefineToPrimitive = function () {
  var Symbol = getBuiltIn('Symbol');
  var SymbolPrototype = Symbol && Symbol.prototype;
  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
    // `Symbol.prototype[@@toPrimitive]` method
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
    // eslint-disable-next-line no-unused-vars -- required for .length
    defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function (hint) {
      return functionCall(valueOf, this);
    }, { arity: 1 });
  }
};

var defineProperty$2 = objectDefineProperty.f;



var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

var setToStringTag = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwnProperty_1(target, TO_STRING_TAG$2)) {
    defineProperty$2(target, TO_STRING_TAG$2, { configurable: true, value: TAG });
  }
};

var functionUncurryThisClause = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return functionUncurryThis(fn);
};

var bind = functionUncurryThisClause(functionUncurryThisClause.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : functionBindNative ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray = Array.isArray || function isArray(argument) {
  return classofRaw(argument) === 'Array';
};

var noop = function () { /* empty */ };
var construct = getBuiltIn('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec = functionUncurryThis(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  try {
    construct(noop, [], argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  switch (classof(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor = !construct || fails(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var SPECIES = wellKnownSymbol('species');
var $Array = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor = function (originalArray) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array : C;
};

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

var push$1 = functionUncurryThis([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$1 = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = indexedObject(O);
    var length = lengthOfArrayLike(self);
    var boundFunction = functionBindContext(callbackfn, that);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push$1(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$1(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$1(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$1(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$1(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$1(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$1(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$1(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$1(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod$1(7)
};

var $forEach = arrayIteration.forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';

var setInternalState = internalState.set;
var getInternalState = internalState.getterFor(SYMBOL);

var ObjectPrototype = Object[PROTOTYPE$1];
var $Symbol = global_1.Symbol;
var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE$1];
var RangeError = global_1.RangeError;
var TypeError$2 = global_1.TypeError;
var QObject = global_1.QObject;
var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var nativeDefineProperty = objectDefineProperty.f;
var nativeGetOwnPropertyNames = objectGetOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = objectPropertyIsEnumerable.f;
var push$2 = functionUncurryThis([].push);

var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var WellKnownSymbolsStore$1 = shared('wks');

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var fallbackDefineProperty = function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
};

var setSymbolDescriptor = descriptors && fails(function () {
  return objectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a !== 7;
}) ? fallbackDefineProperty : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = objectCreate(SymbolPrototype);
  setInternalState(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!descriptors) symbol.description = description;
  return symbol;
};

var $defineProperty$1 = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty$1(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPropertyKey(P);
  anObject(Attributes);
  if (hasOwnProperty_1(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!hasOwnProperty_1(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, objectCreate(null)));
      O[HIDDEN][key] = true;
    } else {
      if (hasOwnProperty_1(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!descriptors || functionCall($propertyIsEnumerable$1, properties, key)) $defineProperty$1(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
};

var $propertyIsEnumerable$1 = function propertyIsEnumerable(V) {
  var P = toPropertyKey(V);
  var enumerable = functionCall(nativePropertyIsEnumerable, this, P);
  if (this === ObjectPrototype && hasOwnProperty_1(AllSymbols, P) && !hasOwnProperty_1(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !hasOwnProperty_1(this, P) || !hasOwnProperty_1(AllSymbols, P) || hasOwnProperty_1(this, HIDDEN) && this[HIDDEN][P]
    ? enumerable : true;
};

var $getOwnPropertyDescriptor$2 = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPropertyKey(P);
  if (it === ObjectPrototype && hasOwnProperty_1(AllSymbols, key) && !hasOwnProperty_1(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && hasOwnProperty_1(AllSymbols, key) && !(hasOwnProperty_1(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames$1 = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!hasOwnProperty_1(AllSymbols, key) && !hasOwnProperty_1(hiddenKeys, key)) push$2(result, key);
  });
  return result;
};

var $getOwnPropertySymbols = function (O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (hasOwnProperty_1(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwnProperty_1(ObjectPrototype, key))) {
      push$2(result, AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!symbolConstructorDetection) {
  $Symbol = function Symbol() {
    if (objectIsPrototypeOf(SymbolPrototype, this)) throw new TypeError$2('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : toString_1(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      var $this = this === undefined ? global_1 : this;
      if ($this === ObjectPrototype) functionCall(setter, ObjectPrototypeSymbols, value);
      if (hasOwnProperty_1($this, HIDDEN) && hasOwnProperty_1($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
      var descriptor = createPropertyDescriptor(1, value);
      try {
        setSymbolDescriptor($this, tag, descriptor);
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
        fallbackDefineProperty($this, tag, descriptor);
      }
    };
    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  SymbolPrototype = $Symbol[PROTOTYPE$1];

  defineBuiltIn(SymbolPrototype, 'toString', function toString() {
    return getInternalState(this).tag;
  });

  defineBuiltIn($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  objectPropertyIsEnumerable.f = $propertyIsEnumerable$1;
  objectDefineProperty.f = $defineProperty$1;
  objectDefineProperties.f = $defineProperties;
  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor$2;
  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames$1;
  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

  wellKnownSymbolWrapped.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (descriptors) {
    // https://github.com/tc39/proposal-Symbol-description
    defineBuiltInAccessor(SymbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        return getInternalState(this).description;
      }
    });
    {
      defineBuiltIn(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable$1, { unsafe: true });
    }
  }
}

_export({ global: true, constructor: true, wrap: true, forced: !symbolConstructorDetection, sham: !symbolConstructorDetection }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
  wellKnownSymbolDefine(name);
});

_export({ target: SYMBOL, stat: true, forced: !symbolConstructorDetection }, {
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

_export({ target: 'Object', stat: true, forced: !symbolConstructorDetection, sham: !descriptors }, {
  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty$1,
  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor$2
});

_export({ target: 'Object', stat: true, forced: !symbolConstructorDetection }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames$1
});

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
symbolDefineToPrimitive();

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;

/* eslint-disable es/no-symbol -- safe */
var symbolRegistryDetection = symbolConstructorDetection && !!Symbol['for'] && !!Symbol.keyFor;

var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');

// `Symbol.for` method
// https://tc39.es/ecma262/#sec-symbol.for
_export({ target: 'Symbol', stat: true, forced: !symbolRegistryDetection }, {
  'for': function (key) {
    var string = toString_1(key);
    if (hasOwnProperty_1(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = getBuiltIn('Symbol')(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  }
});

var SymbolToStringRegistry$1 = shared('symbol-to-string-registry');

// `Symbol.keyFor` method
// https://tc39.es/ecma262/#sec-symbol.keyfor
_export({ target: 'Symbol', stat: true, forced: !symbolRegistryDetection }, {
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw new TypeError(tryToString(sym) + ' is not a symbol');
    if (hasOwnProperty_1(SymbolToStringRegistry$1, sym)) return SymbolToStringRegistry$1[sym];
  }
});

var FunctionPrototype$2 = Function.prototype;
var apply = FunctionPrototype$2.apply;
var call$2 = FunctionPrototype$2.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (functionBindNative ? call$2.bind(apply) : function () {
  return call$2.apply(apply, arguments);
});

var push$3 = functionUncurryThis([].push);

var getJsonReplacerFunction = function (replacer) {
  if (isCallable(replacer)) return replacer;
  if (!isArray(replacer)) return;
  var rawLength = replacer.length;
  var keys = [];
  for (var i = 0; i < rawLength; i++) {
    var element = replacer[i];
    if (typeof element == 'string') push$3(keys, element);
    else if (typeof element == 'number' || classofRaw(element) === 'Number' || classofRaw(element) === 'String') push$3(keys, toString_1(element));
  }
  var keysLength = keys.length;
  var root = true;
  return function (key, value) {
    if (root) {
      root = false;
      return value;
    }
    if (isArray(this)) return value;
    for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
  };
};

var $String$4 = String;
var $stringify = getBuiltIn('JSON', 'stringify');
var exec$1 = functionUncurryThis(/./.exec);
var charAt = functionUncurryThis(''.charAt);
var charCodeAt = functionUncurryThis(''.charCodeAt);
var replace = functionUncurryThis(''.replace);
var numberToString = functionUncurryThis(1.0.toString);

var tester = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var WRONG_SYMBOLS_CONVERSION = !symbolConstructorDetection || fails(function () {
  var symbol = getBuiltIn('Symbol')('stringify detection');
  // MS Edge converts symbol values to JSON as {}
  return $stringify([symbol]) !== '[null]'
    // WebKit converts symbol values to JSON as null
    || $stringify({ a: symbol }) !== '{}'
    // V8 throws on boxed symbols
    || $stringify(Object(symbol)) !== '{}';
});

// https://github.com/tc39/proposal-well-formed-stringify
var ILL_FORMED_UNICODE = fails(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

var stringifyWithSymbolsFix = function (it, replacer) {
  var args = arraySlice(arguments);
  var $replacer = getJsonReplacerFunction(replacer);
  if (!isCallable($replacer) && (it === undefined || isSymbol(it))) return; // IE8 returns string on undefined
  args[1] = function (key, value) {
    // some old implementations (like WebKit) could pass numbers as keys
    if (isCallable($replacer)) value = functionCall($replacer, this, $String$4(key), value);
    if (!isSymbol(value)) return value;
  };
  return functionApply($stringify, null, args);
};

var fixIllFormed = function (match, offset, string) {
  var prev = charAt(string, offset - 1);
  var next = charAt(string, offset + 1);
  if ((exec$1(low, match) && !exec$1(hi, next)) || (exec$1(hi, match) && !exec$1(low, prev))) {
    return '\\u' + numberToString(charCodeAt(match, 0), 16);
  } return match;
};

if ($stringify) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  _export({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = arraySlice(arguments);
      var result = functionApply(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify, null, args);
      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace(result, tester, fixIllFormed) : result;
    }
  });
}

// V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FORCED = !symbolConstructorDetection || fails(function () { objectGetOwnPropertySymbols.f(1); });

// `Object.getOwnPropertySymbols` method
// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
_export({ target: 'Object', stat: true, forced: FORCED }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    var $getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject(it)) : [];
  }
});

var NativeSymbol = global_1.Symbol;
var SymbolPrototype$1 = NativeSymbol && NativeSymbol.prototype;

if (descriptors && isCallable(NativeSymbol) && (!('description' in SymbolPrototype$1) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString_1(arguments[0]);
    var result = objectIsPrototypeOf(SymbolPrototype$1, this)
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };

  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  SymbolWrapper.prototype = SymbolPrototype$1;
  SymbolPrototype$1.constructor = SymbolWrapper;

  var NATIVE_SYMBOL = String(NativeSymbol('description detection')) === 'Symbol(description detection)';
  var thisSymbolValue = functionUncurryThis(SymbolPrototype$1.valueOf);
  var symbolDescriptiveString = functionUncurryThis(SymbolPrototype$1.toString);
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  var replace$1 = functionUncurryThis(''.replace);
  var stringSlice$1 = functionUncurryThis(''.slice);

  defineBuiltInAccessor(SymbolPrototype$1, 'description', {
    configurable: true,
    get: function description() {
      var symbol = thisSymbolValue(this);
      if (hasOwnProperty_1(EmptyStringDescriptionStore, symbol)) return '';
      var string = symbolDescriptiveString(symbol);
      var desc = NATIVE_SYMBOL ? stringSlice$1(string, 7, -1) : replace$1(string, regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  _export({ global: true, constructor: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
wellKnownSymbolDefine('asyncIterator');

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
wellKnownSymbolDefine('iterator');

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
wellKnownSymbolDefine('toPrimitive');

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
symbolDefineToPrimitive();

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
wellKnownSymbolDefine('toStringTag');

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag(getBuiltIn('Symbol'), 'Symbol');

var $TypeError$6 = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

var doesNotExceedSafeInteger = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError$6('Maximum allowed index exceeded');
  return it;
};

var createProperty = function (object, key, value) {
  if (descriptors) objectDefineProperty.f(object, key, createPropertyDescriptor(0, value));
  else object[key] = value;
};

var SPECIES$1 = wellKnownSymbol('species');

var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return engineV8Version >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED$1 = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
_export({ target: 'Array', proto: true, arity: 1, forced: FORCED$1 }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike(E);
        doesNotExceedSafeInteger(n + len);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        doesNotExceedSafeInteger(n + 1);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var $filter = arrayIteration.filter;


var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var defineProperty$3 = objectDefineProperty.f;

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] === undefined) {
  defineProperty$3(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: objectCreate(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

var $find = arrayIteration.find;


var FIND = 'find';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-find -- testing
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
_export({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND);

var $includes = arrayIncludes.includes;



// FF99+ bug
var BROKEN_ON_SPARSE = fails(function () {
  // eslint-disable-next-line es/no-array-prototype-includes -- detection
  return !Array(1).includes();
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
_export({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

var iterators = {};

var correctPrototypeGetter = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var IE_PROTO$1 = sharedKey('IE_PROTO');
var $Object$4 = Object;
var ObjectPrototype$1 = $Object$4.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
var objectGetPrototypeOf = correctPrototypeGetter ? $Object$4.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwnProperty_1(object, IE_PROTO$1)) return object[IE_PROTO$1];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object$4 ? ObjectPrototype$1 : null;
};

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable(IteratorPrototype[ITERATOR])) {
  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





var returnThis = function () { return this; };

var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
  iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

var functionUncurryThisAccessor = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return functionUncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

var isPossiblePrototype = function (argument) {
  return isObject(argument) || argument === null;
};

var $String$5 = String;
var $TypeError$7 = TypeError;

var aPossiblePrototype = function (argument) {
  if (isPossiblePrototype(argument)) return argument;
  throw new $TypeError$7("Can't set " + $String$5(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */





// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = functionUncurryThisAccessor(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    requireObjectCoercible(O);
    aPossiblePrototype(proto);
    if (!isObject(O)) return O;
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var PROPER_FUNCTION_NAME = functionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;
var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$1 = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis$1 = function () { return this; };

var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  iteratorCreateConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS$1 && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    }

    return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$1]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
        if (objectSetPrototypeOf) {
          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR$1])) {
          defineBuiltIn(CurrentIteratorPrototype, ITERATOR$1, returnThis$1);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if ( CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return functionCall(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
      }
    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
    defineBuiltIn(IterablePrototype, ITERATOR$1, defaultIterator, { name: DEFAULT });
  }
  iterators[NAME] = defaultIterator;

  return methods;
};

// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
var createIterResultObject = function (value, done) {
  return { value: value, done: done };
};

var defineProperty$4 = objectDefineProperty.f;





var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$1 = internalState.set;
var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
var es_array_iterator = iteratorDefine(Array, 'Array', function (iterated, kind) {
  setInternalState$1(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$1(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject(undefined, true);
  }
  switch (state.kind) {
    case 'keys': return createIterResultObject(index, false);
    case 'values': return createIterResultObject(target[index], false);
  } return createIterResultObject([index, target[index]], false);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = iterators.Arguments = iterators.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

// V8 ~ Chrome 45- bug
if ( descriptors && values.name !== 'values') try {
  defineProperty$4(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

var $map = arrayIteration.map;


var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('slice');

var SPECIES$2 = wellKnownSymbol('species');
var $Array$1 = Array;
var max$1 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = lengthOfArrayLike(O);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor(Constructor) && (Constructor === $Array$1 || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES$2];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === $Array$1 || Constructor === undefined) {
        return arraySlice(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? $Array$1 : Constructor)(max$1(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var $TypeError$8 = TypeError;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

// Safari < 13 does not throw an error in this case
var SILENT_ON_NON_WRITABLE_LENGTH_SET = descriptors && !function () {
  // makes no sense without proper strict mode support
  if (this !== undefined) return true;
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).length = 1;
  } catch (error) {
    return error instanceof TypeError;
  }
}();

var arraySetLength = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
  if (isArray(O) && !getOwnPropertyDescriptor$2(O, 'length').writable) {
    throw new $TypeError$8('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};

var $TypeError$9 = TypeError;

var deletePropertyOrThrow = function (O, P) {
  if (!delete O[P]) throw new $TypeError$9('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
};

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('splice');

var max$2 = Math.max;
var min$2 = Math.min;

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min$2(max$2(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    }
    doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow(O, to);
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow(O, k - 1);
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow(O, to);
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    arraySetLength(O, len - actualDeleteCount + insertCount);
    return A;
  }
});

var $TypeError$a = TypeError;

// `Date.prototype[@@toPrimitive](hint)` method implementation
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
var dateToPrimitive = function (hint) {
  anObject(this);
  if (hint === 'string' || hint === 'default') hint = 'string';
  else if (hint !== 'number') throw new $TypeError$a('Incorrect hint');
  return ordinaryToPrimitive(this, hint);
};

var TO_PRIMITIVE$1 = wellKnownSymbol('toPrimitive');
var DatePrototype = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!hasOwnProperty_1(DatePrototype, TO_PRIMITIVE$1)) {
  defineBuiltIn(DatePrototype, TO_PRIMITIVE$1, dateToPrimitive);
}

var FUNCTION_NAME_EXISTS = functionName.EXISTS;



var FunctionPrototype$3 = Function.prototype;
var functionToString$1 = functionUncurryThis(FunctionPrototype$3.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec = functionUncurryThis(nameRE.exec);
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (descriptors && !FUNCTION_NAME_EXISTS) {
  defineBuiltInAccessor(FunctionPrototype$3, NAME, {
    configurable: true,
    get: function () {
      try {
        return regExpExec(nameRE, functionToString$1(this))[1];
      } catch (error) {
        return '';
      }
    }
  });
}

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag(global_1.JSON, 'JSON', true);

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag(Math, 'Math', true);

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) objectSetPrototypeOf($this, NewTargetPrototype);
  return $this;
};

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
var thisNumberValue = functionUncurryThis(1.0.valueOf);

// a string of all valid unicode whitespaces
var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var replace$2 = functionUncurryThis(''.replace);
var ltrim = RegExp('^[' + whitespaces + ']+');
var rtrim = RegExp('(^|[^' + whitespaces + '])[' + whitespaces + ']+$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$2 = function (TYPE) {
  return function ($this) {
    var string = toString_1(requireObjectCoercible($this));
    if (TYPE & 1) string = replace$2(string, ltrim, '');
    if (TYPE & 2) string = replace$2(string, rtrim, '$1');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$2(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$2(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$2(3)
};

var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
var defineProperty$5 = objectDefineProperty.f;

var trim = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = global_1[NUMBER];
var PureNumberNamespace = path[NUMBER];
var NumberPrototype = NativeNumber.prototype;
var TypeError$3 = global_1.TypeError;
var stringSlice$2 = functionUncurryThis(''.slice);
var charCodeAt$1 = functionUncurryThis(''.charCodeAt);

// `ToNumeric` abstract operation
// https://tc39.es/ecma262/#sec-tonumeric
var toNumeric = function (value) {
  var primValue = toPrimitive(value, 'number');
  return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
};

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive(argument, 'number');
  var first, third, radix, maxCode, digits, length, index, code;
  if (isSymbol(it)) throw new TypeError$3('Cannot convert a Symbol value to a number');
  if (typeof it == 'string' && it.length > 2) {
    it = trim(it);
    first = charCodeAt$1(it, 0);
    if (first === 43 || first === 45) {
      third = charCodeAt$1(it, 2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (charCodeAt$1(it, 1)) {
        // fast equal of /^0b[01]+$/i
        case 66:
        case 98:
          radix = 2;
          maxCode = 49;
          break;
        // fast equal of /^0o[0-7]+$/i
        case 79:
        case 111:
          radix = 8;
          maxCode = 55;
          break;
        default:
          return +it;
      }
      digits = stringSlice$2(it, 2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = charCodeAt$1(digits, index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

var FORCED$2 = isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

var calledWithNew = function (dummy) {
  // includes check on 1..constructor(foo) case
  return objectIsPrototypeOf(NumberPrototype, dummy) && fails(function () { thisNumberValue(dummy); });
};

// `Number` constructor
// https://tc39.es/ecma262/#sec-number-constructor
var NumberWrapper = function Number(value) {
  var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
  return calledWithNew(this) ? inheritIfRequired(Object(n), this, NumberWrapper) : n;
};

NumberWrapper.prototype = NumberPrototype;
if (FORCED$2 && !isPure) NumberPrototype.constructor = NumberWrapper;

_export({ global: true, constructor: true, wrap: true, forced: FORCED$2 }, {
  Number: NumberWrapper
});

// Use `internal/copy-constructor-properties` helper in `core-js@4`
var copyConstructorProperties$1 = function (target, source) {
  for (var keys = descriptors ? getOwnPropertyNames(source) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
    // ESNext
    'fromString,range'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (hasOwnProperty_1(source, key = keys[j]) && !hasOwnProperty_1(target, key)) {
      defineProperty$5(target, key, getOwnPropertyDescriptor$3(source, key));
    }
  }
};
if (FORCED$2 || isPure) copyConstructorProperties$1(path[NUMBER], NativeNumber);

var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;


var FORCED$3 = !descriptors || fails(function () { nativeGetOwnPropertyDescriptor$1(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
_export({ target: 'Object', stat: true, forced: FORCED$3, sham: !descriptors }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject(it), key);
  }
});

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
_export({ target: 'Object', stat: true, sham: !descriptors }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject(object);
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
    var keys = ownKeys(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty(result, key, descriptor);
    }
    return result;
  }
});

var FAILS_ON_PRIMITIVES = fails(function () { objectGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !correctPrototypeGetter }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return objectGetPrototypeOf(toObject(it));
  }
});

var FAILS_ON_PRIMITIVES$1 = fails(function () { objectKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1 }, {
  keys: function keys(it) {
    return objectKeys(toObject(it));
  }
});

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
_export({ target: 'Object', stat: true }, {
  setPrototypeOf: objectSetPrototypeOf
});

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = toStringTagSupport ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!toStringTagSupport) {
  defineBuiltIn(Object.prototype, 'toString', objectToString, { unsafe: true });
}

var engineIsNode = classofRaw(global_1.process) === 'process';

var SPECIES$3 = wellKnownSymbol('species');

var setSpecies = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);

  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
    defineBuiltInAccessor(Constructor, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var $TypeError$b = TypeError;

var anInstance = function (it, Prototype) {
  if (objectIsPrototypeOf(Prototype, it)) return it;
  throw new $TypeError$b('Incorrect invocation');
};

var $TypeError$c = TypeError;

// `Assert: IsConstructor(argument) is true`
var aConstructor = function (argument) {
  if (isConstructor(argument)) return argument;
  throw new $TypeError$c(tryToString(argument) + ' is not a constructor');
};

var SPECIES$4 = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || isNullOrUndefined(S = anObject(C)[SPECIES$4]) ? defaultConstructor : aConstructor(S);
};

var $TypeError$d = TypeError;

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw new $TypeError$d('Not enough arguments');
  return passed;
};

// eslint-disable-next-line redos/no-vulnerable -- safe
var engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(engineUserAgent);

var set$1 = global_1.setImmediate;
var clear = global_1.clearImmediate;
var process$1 = global_1.process;
var Dispatch = global_1.Dispatch;
var Function$1 = global_1.Function;
var MessageChannel = global_1.MessageChannel;
var String$1 = global_1.String;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var $location, defer, channel, port;

fails(function () {
  // Deno throws a ReferenceError on `location` access without `--location` flag
  $location = global_1.location;
});

var run = function (id) {
  if (hasOwnProperty_1(queue, id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var eventListener = function (event) {
  run(event.data);
};

var globalPostMessageDefer = function (id) {
  // old engines have not location.origin
  global_1.postMessage(String$1(id), $location.protocol + '//' + $location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$1 || !clear) {
  set$1 = function setImmediate(handler) {
    validateArgumentsLength(arguments.length, 1);
    var fn = isCallable(handler) ? handler : Function$1(handler);
    var args = arraySlice(arguments, 1);
    queue[++counter] = function () {
      functionApply(fn, undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (engineIsNode) {
    defer = function (id) {
      process$1.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !engineIsIos) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = eventListener;
    defer = functionBindContext(port.postMessage, port);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global_1.addEventListener &&
    isCallable(global_1.postMessage) &&
    !global_1.importScripts &&
    $location && $location.protocol !== 'file:' &&
    !fails(globalPostMessageDefer)
  ) {
    defer = globalPostMessageDefer;
    global_1.addEventListener('message', eventListener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
    defer = function (id) {
      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task = {
  set: set$1,
  clear: clear
};

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$4 = Object.getOwnPropertyDescriptor;

// Avoid NodeJS experimental warning
var safeGetBuiltIn = function (name) {
  if (!descriptors) return global_1[name];
  var descriptor = getOwnPropertyDescriptor$4(global_1, name);
  return descriptor && descriptor.value;
};

var Queue = function () {
  this.head = null;
  this.tail = null;
};

Queue.prototype = {
  add: function (item) {
    var entry = { item: item, next: null };
    var tail = this.tail;
    if (tail) tail.next = entry;
    else this.head = entry;
    this.tail = entry;
  },
  get: function () {
    var entry = this.head;
    if (entry) {
      var next = this.head = entry.next;
      if (next === null) this.tail = null;
      return entry.item;
    }
  }
};

var queue$1 = Queue;

var engineIsIosPebble = /ipad|iphone|ipod/i.test(engineUserAgent) && typeof Pebble != 'undefined';

var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(engineUserAgent);

var macrotask = task.set;






var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
var document$2 = global_1.document;
var process$2 = global_1.process;
var Promise$1 = global_1.Promise;
var microtask = safeGetBuiltIn('queueMicrotask');
var notify, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!microtask) {
  var queue$2 = new queue$1();

  var flush = function () {
    var parent, fn;
    if (engineIsNode && (parent = process$2.domain)) parent.exit();
    while (fn = queue$2.get()) try {
      fn();
    } catch (error) {
      if (queue$2.head) notify();
      throw error;
    }
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!engineIsIos && !engineIsNode && !engineIsWebosWebkit && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (!engineIsIosPebble && Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$1.resolve(undefined);
    // workaround of WebKit ~ iOS Safari 10.1 bug
    promise.constructor = Promise$1;
    then = functionBindContext(promise.then, promise);
    notify = function () {
      then(flush);
    };
  // Node.js without promises
  } else if (engineIsNode) {
    notify = function () {
      process$2.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessage
  // - onreadystatechange
  // - setTimeout
  } else {
    // `webpack` dev server bug on IE global methods - use bind(fn, global)
    macrotask = functionBindContext(macrotask, global_1);
    notify = function () {
      macrotask(flush);
    };
  }

  microtask = function (fn) {
    if (!queue$2.head) notify();
    queue$2.add(fn);
  };
}

var microtask_1 = microtask;

var hostReportErrors = function (a, b) {
  try {
    // eslint-disable-next-line no-console -- safe
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  } catch (error) { /* empty */ }
};

var perform = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var promiseNativeConstructor = global_1.Promise;

/* global Deno -- Deno case */
var engineIsDeno = typeof Deno == 'object' && Deno && typeof Deno.version == 'object';

var engineIsBrowser = !engineIsDeno && !engineIsNode
  && typeof window == 'object'
  && typeof document == 'object';

var NativePromisePrototype = promiseNativeConstructor && promiseNativeConstructor.prototype;
var SPECIES$5 = wellKnownSymbol('species');
var SUBCLASSING = false;
var NATIVE_PROMISE_REJECTION_EVENT = isCallable(global_1.PromiseRejectionEvent);

var FORCED_PROMISE_CONSTRUCTOR = isForced_1('Promise', function () {
  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(promiseNativeConstructor);
  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(promiseNativeConstructor);
  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
  // We can't detect it synchronously, so just check versions
  if (!GLOBAL_CORE_JS_PROMISE && engineV8Version === 66) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (!engineV8Version || engineV8Version < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
    // Detect correctness of subclassing with @@species support
    var promise = new promiseNativeConstructor(function (resolve) { resolve(1); });
    var FakePromise = function (exec) {
      exec(function () { /* empty */ }, function () { /* empty */ });
    };
    var constructor = promise.constructor = {};
    constructor[SPECIES$5] = FakePromise;
    SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
    if (!SUBCLASSING) return true;
  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
  } return !GLOBAL_CORE_JS_PROMISE && (engineIsBrowser || engineIsDeno) && !NATIVE_PROMISE_REJECTION_EVENT;
});

var promiseConstructorDetection = {
  CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR,
  REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT,
  SUBCLASSING: SUBCLASSING
};

var $TypeError$e = TypeError;

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw new $TypeError$e('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable(resolve);
  this.reject = aCallable(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
var f$8 = function (C) {
  return new PromiseCapability(C);
};

var newPromiseCapability = {
	f: f$8
};

var task$1 = task.set;









var PROMISE = 'Promise';
var FORCED_PROMISE_CONSTRUCTOR$1 = promiseConstructorDetection.CONSTRUCTOR;
var NATIVE_PROMISE_REJECTION_EVENT$1 = promiseConstructorDetection.REJECTION_EVENT;
var NATIVE_PROMISE_SUBCLASSING = promiseConstructorDetection.SUBCLASSING;
var getInternalPromiseState = internalState.getterFor(PROMISE);
var setInternalState$2 = internalState.set;
var NativePromisePrototype$1 = promiseNativeConstructor && promiseNativeConstructor.prototype;
var PromiseConstructor = promiseNativeConstructor;
var PromisePrototype = NativePromisePrototype$1;
var TypeError$4 = global_1.TypeError;
var document$3 = global_1.document;
var process$3 = global_1.process;
var newPromiseCapability$1 = newPromiseCapability.f;
var newGenericPromiseCapability = newPromiseCapability$1;

var DISPATCH_EVENT = !!(document$3 && document$3.createEvent && global_1.dispatchEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;

var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && isCallable(then = it.then) ? then : false;
};

var callReaction = function (reaction, state) {
  var value = state.value;
  var ok = state.state === FULFILLED;
  var handler = ok ? reaction.ok : reaction.fail;
  var resolve = reaction.resolve;
  var reject = reaction.reject;
  var domain = reaction.domain;
  var result, then, exited;
  try {
    if (handler) {
      if (!ok) {
        if (state.rejection === UNHANDLED) onHandleUnhandled(state);
        state.rejection = HANDLED;
      }
      if (handler === true) result = value;
      else {
        if (domain) domain.enter();
        result = handler(value); // can throw
        if (domain) {
          domain.exit();
          exited = true;
        }
      }
      if (result === reaction.promise) {
        reject(new TypeError$4('Promise-chain cycle'));
      } else if (then = isThenable(result)) {
        functionCall(then, result, resolve, reject);
      } else resolve(result);
    } else reject(value);
  } catch (error) {
    if (domain && !exited) domain.exit();
    reject(error);
  }
};

var notify$1 = function (state, isReject) {
  if (state.notified) return;
  state.notified = true;
  microtask_1(function () {
    var reactions = state.reactions;
    var reaction;
    while (reaction = reactions.get()) {
      callReaction(reaction, state);
    }
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document$3.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global_1.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_PROMISE_REJECTION_EVENT$1 && (handler = global_1['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  functionCall(task$1, global_1, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (engineIsNode) {
          process$3.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = engineIsNode || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (state) {
  functionCall(task$1, global_1, function () {
    var promise = state.facade;
    if (engineIsNode) {
      process$3.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$1 = function (fn, state, unwrap) {
  return function (value) {
    fn(state, value, unwrap);
  };
};

var internalReject = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify$1(state, true);
};

var internalResolve = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (state.facade === value) throw new TypeError$4("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask_1(function () {
        var wrapper = { done: false };
        try {
          functionCall(then, value,
            bind$1(internalResolve, wrapper, state),
            bind$1(internalReject, wrapper, state)
          );
        } catch (error) {
          internalReject(wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify$1(state, false);
    }
  } catch (error) {
    internalReject({ done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED_PROMISE_CONSTRUCTOR$1) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance(this, PromisePrototype);
    aCallable(executor);
    functionCall(Internal, this);
    var state = getInternalPromiseState(this);
    try {
      executor(bind$1(internalResolve, state), bind$1(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };

  PromisePrototype = PromiseConstructor.prototype;

  // eslint-disable-next-line no-unused-vars -- required for `.length`
  Internal = function Promise(executor) {
    setInternalState$2(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: new queue$1(),
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };

  // `Promise.prototype.then` method
  // https://tc39.es/ecma262/#sec-promise.prototype.then
  Internal.prototype = defineBuiltIn(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
    var state = getInternalPromiseState(this);
    var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
    state.parent = true;
    reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
    reaction.fail = isCallable(onRejected) && onRejected;
    reaction.domain = engineIsNode ? process$3.domain : undefined;
    if (state.state === PENDING) state.reactions.add(reaction);
    else microtask_1(function () {
      callReaction(reaction, state);
    });
    return reaction.promise;
  });

  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalPromiseState(promise);
    this.promise = promise;
    this.resolve = bind$1(internalResolve, state);
    this.reject = bind$1(internalReject, state);
  };

  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if ( isCallable(promiseNativeConstructor) && NativePromisePrototype$1 !== Object.prototype) {
    nativeThen = NativePromisePrototype$1.then;

    if (!NATIVE_PROMISE_SUBCLASSING) {
      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
      defineBuiltIn(NativePromisePrototype$1, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          functionCall(nativeThen, that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });
    }

    // make `.constructor === Promise` work for native promise-based APIs
    try {
      delete NativePromisePrototype$1.constructor;
    } catch (error) { /* empty */ }

    // make `instanceof Promise` work for native promise-based APIs
    if (objectSetPrototypeOf) {
      objectSetPrototypeOf(NativePromisePrototype$1, PromisePrototype);
    }
  }
}

_export({ global: true, constructor: true, wrap: true, forced: FORCED_PROMISE_CONSTRUCTOR$1 }, {
  Promise: PromiseConstructor
});

setToStringTag(PromiseConstructor, PROMISE, false);
setSpecies(PROMISE);

var ITERATOR$2 = wellKnownSymbol('iterator');
var ArrayPrototype$1 = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$2] === it);
};

var ITERATOR$3 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR$3)
    || getMethod(it, '@@iterator')
    || iterators[classof(it)];
};

var $TypeError$f = TypeError;

var getIterator = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(functionCall(iteratorMethod, argument));
  throw new $TypeError$f(tryToString(argument) + ' is not iterable');
};

var iteratorClose = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = functionCall(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject(innerResult);
  return value;
};

var $TypeError$g = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = functionBindContext(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (!iterFn) throw new $TypeError$g(tryToString(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && objectIsPrototypeOf(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = functionCall(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && objectIsPrototypeOf(ResultPrototype, result)) return result;
  } return new Result(false);
};

var ITERATOR$4 = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$4] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
  try {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$4] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var FORCED_PROMISE_CONSTRUCTOR$2 = promiseConstructorDetection.CONSTRUCTOR;

var promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR$2 || !checkCorrectnessOfIteration(function (iterable) {
  promiseNativeConstructor.all(iterable).then(undefined, function () { /* empty */ });
});

// `Promise.all` method
// https://tc39.es/ecma262/#sec-promise.all
_export({ target: 'Promise', stat: true, forced: promiseStaticsIncorrectIteration }, {
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aCallable(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        functionCall($promiseResolve, C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var FORCED_PROMISE_CONSTRUCTOR$3 = promiseConstructorDetection.CONSTRUCTOR;





var NativePromisePrototype$2 = promiseNativeConstructor && promiseNativeConstructor.prototype;

// `Promise.prototype.catch` method
// https://tc39.es/ecma262/#sec-promise.prototype.catch
_export({ target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR$3, real: true }, {
  'catch': function (onRejected) {
    return this.then(undefined, onRejected);
  }
});

// makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
if ( isCallable(promiseNativeConstructor)) {
  var method = getBuiltIn('Promise').prototype['catch'];
  if (NativePromisePrototype$2['catch'] !== method) {
    defineBuiltIn(NativePromisePrototype$2, 'catch', method, { unsafe: true });
  }
}

// `Promise.race` method
// https://tc39.es/ecma262/#sec-promise.race
_export({ target: 'Promise', stat: true, forced: promiseStaticsIncorrectIteration }, {
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability.f(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aCallable(C.resolve);
      iterate(iterable, function (promise) {
        functionCall($promiseResolve, C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var FORCED_PROMISE_CONSTRUCTOR$4 = promiseConstructorDetection.CONSTRUCTOR;

// `Promise.reject` method
// https://tc39.es/ecma262/#sec-promise.reject
_export({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR$4 }, {
  reject: function reject(r) {
    var capability = newPromiseCapability.f(this);
    var capabilityReject = capability.reject;
    capabilityReject(r);
    return capability.promise;
  }
});

var promiseResolve = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var FORCED_PROMISE_CONSTRUCTOR$5 = promiseConstructorDetection.CONSTRUCTOR;


var PromiseConstructorWrapper = getBuiltIn('Promise');

// `Promise.resolve` method
// https://tc39.es/ecma262/#sec-promise.resolve
_export({ target: 'Promise', stat: true, forced:  FORCED_PROMISE_CONSTRUCTOR$5 }, {
  resolve: function resolve(x) {
    return promiseResolve( this, x);
  }
});

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags = function () {
  var that = anObject(this);
  var result = '';
  if (that.hasIndices) result += 'd';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.unicodeSets) result += 'v';
  if (that.sticky) result += 'y';
  return result;
};

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp = global_1.RegExp;

var UNSUPPORTED_Y = fails(function () {
  var re = $RegExp('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') !== null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY = UNSUPPORTED_Y || fails(function () {
  return !$RegExp('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y || fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') !== null;
});

var regexpStickyHelpers = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY,
  UNSUPPORTED_Y: UNSUPPORTED_Y
};

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp$1 = global_1.RegExp;

var regexpUnsupportedDotAll = fails(function () {
  var re = $RegExp$1('.', 's');
  return !(re.dotAll && re.test('\n') && re.flags === 's');
});

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp$2 = global_1.RegExp;

var regexpUnsupportedNcg = fails(function () {
  var re = $RegExp$2('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */







var getInternalState$2 = internalState.get;



var nativeReplace = shared('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$1 = functionUncurryThis(''.charAt);
var indexOf$1 = functionUncurryThis(''.indexOf);
var replace$3 = functionUncurryThis(''.replace);
var stringSlice$3 = functionUncurryThis(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  functionCall(nativeExec, re1, 'a');
  functionCall(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$1 = regexpStickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1 || regexpUnsupportedDotAll || regexpUnsupportedNcg;

if (PATCH) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState$2(re);
    var str = toString_1(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = functionCall(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y$1 && re.sticky;
    var flags = functionCall(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace$3(flags, 'y', '');
      if (indexOf$1(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$3(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$1(str, re.lastIndex - 1) !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = functionCall(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice$3(match.input, charsAdded);
        match[0] = stringSlice$3(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
      functionCall(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = objectCreate(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

var regexpExec = patchedExec;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
  exec: regexpExec
});

var RegExpPrototype = RegExp.prototype;

var regexpGetFlags = function (R) {
  var flags = R.flags;
  return flags === undefined && !('flags' in RegExpPrototype) && !hasOwnProperty_1(R, 'flags') && objectIsPrototypeOf(RegExpPrototype, R)
    ? functionCall(regexpFlags, R) : flags;
};

var PROPER_FUNCTION_NAME$1 = functionName.PROPER;






var TO_STRING = 'toString';
var RegExpPrototype$1 = RegExp.prototype;
var nativeToString = RegExpPrototype$1[TO_STRING];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME$1 && nativeToString.name !== TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  defineBuiltIn(RegExpPrototype$1, TO_STRING, function toString() {
    var R = anObject(this);
    var pattern = toString_1(R.source);
    var flags = toString_1(regexpGetFlags(R));
    return '/' + pattern + '/' + flags;
  }, { unsafe: true });
}

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) === 'RegExp');
};

var $TypeError$h = TypeError;

var notARegexp = function (it) {
  if (isRegexp(it)) {
    throw new $TypeError$h("The method doesn't accept regular expressions");
  } return it;
};

var MATCH$1 = wellKnownSymbol('match');

var correctIsRegexpLogic = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (error1) {
    try {
      regexp[MATCH$1] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (error2) { /* empty */ }
  } return false;
};

var stringIndexOf = functionUncurryThis(''.indexOf);

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
_export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~stringIndexOf(
      toString_1(requireObjectCoercible(this)),
      toString_1(notARegexp(searchString)),
      arguments.length > 1 ? arguments[1] : undefined
    );
  }
});

var charAt$2 = functionUncurryThis(''.charAt);
var charCodeAt$2 = functionUncurryThis(''.charCodeAt);
var stringSlice$4 = functionUncurryThis(''.slice);

var createMethod$3 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString_1(requireObjectCoercible($this));
    var position = toIntegerOrInfinity(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt$2(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt$2(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt$2(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$4(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$3(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$3(true)
};

var charAt$3 = stringMultibyte.charAt;





var STRING_ITERATOR = 'String Iterator';
var setInternalState$3 = internalState.set;
var getInternalState$3 = internalState.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
iteratorDefine(String, 'String', function (iterated) {
  setInternalState$3(this, {
    type: STRING_ITERATOR,
    string: toString_1(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$3(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt$3(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});

// TODO: Remove from `core-js@4` since it's moved to entry points








var SPECIES$6 = wellKnownSymbol('species');
var RegExpPrototype$2 = RegExp.prototype;

var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegExp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) !== 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES$6] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () {
      execCalled = true;
      return null;
    };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    FORCED
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      var $exec = regexp.exec;
      if ($exec === regexpExec || $exec === RegExpPrototype$2.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: functionCall(nativeRegExpMethod, regexp, str, arg2) };
        }
        return { done: true, value: functionCall(nativeMethod, str, regexp, arg2) };
      }
      return { done: false };
    });

    defineBuiltIn(String.prototype, KEY, methods[0]);
    defineBuiltIn(RegExpPrototype$2, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty(RegExpPrototype$2[SYMBOL], 'sham', true);
};

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
// eslint-disable-next-line es/no-object-is -- safe
var sameValue = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
};

var $TypeError$i = TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (isCallable(exec)) {
    var result = functionCall(exec, R, S);
    if (result !== null) anObject(result);
    return result;
  }
  if (classofRaw(R) === 'RegExp') return functionCall(regexpExec, R, S);
  throw new $TypeError$i('RegExp#exec called on incompatible receiver');
};

// @@search logic
fixRegexpWellKnownSymbolLogic('search', function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.es/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible(this);
      var searcher = isNullOrUndefined(regexp) ? undefined : getMethod(regexp, SEARCH);
      return searcher ? functionCall(searcher, regexp, O) : new RegExp(regexp)[SEARCH](toString_1(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
    function (string) {
      var rx = anObject(this);
      var S = toString_1(string);
      var res = maybeCallNative(nativeSearch, rx, S);

      if (res.done) return res.value;

      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regexpExecAbstract(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`


var classList = documentCreateElement('span').classList;
var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;

var domTokenListPrototype = DOMTokenListPrototype === Object.prototype ? undefined : DOMTokenListPrototype;

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

var $forEach$1 = arrayIteration.forEach;


var STRICT_METHOD = arrayMethodIsStrict('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var handlePrototype = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
  } catch (error) {
    CollectionPrototype.forEach = arrayForEach;
  }
};

for (var COLLECTION_NAME in domIterables) {
  if (domIterables[COLLECTION_NAME]) {
    handlePrototype(global_1[COLLECTION_NAME] && global_1[COLLECTION_NAME].prototype);
  }
}

handlePrototype(domTokenListPrototype);

var ITERATOR$5 = wellKnownSymbol('iterator');
var ArrayValues = es_array_iterator.values;

var handlePrototype$1 = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$5] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR$5, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$5] = ArrayValues;
    }
    setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
    if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME$1 in domIterables) {
  handlePrototype$1(global_1[COLLECTION_NAME$1] && global_1[COLLECTION_NAME$1].prototype, COLLECTION_NAME$1);
}

handlePrototype$1(domTokenListPrototype, 'DOMTokenList');

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pos"],{

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js":(
/*!*******************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js ***!
  \*******************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcViewsAppPagesPosVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! nprogress */"./node_modules/nprogress/nprogress.js");
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_0___default=/*#__PURE__*/__webpack_require__.n(nprogress__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
/* harmony import */var vue_easy_print__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! vue-easy-print */"./node_modules/vue-easy-print/src/index.js");
/* harmony import */var vue_barcode__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(/*! vue-barcode */"./node_modules/vue-barcode/index.js");
/* harmony import */var vue_barcode__WEBPACK_IMPORTED_MODULE_3___default=/*#__PURE__*/__webpack_require__.n(vue_barcode__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */var vue_flag_icon__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(/*! vue-flag-icon */"./node_modules/vue-flag-icon/index.js");
/* harmony import */var _utils__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__(/*! ./../../../utils */"./resources/src/utils/index.js");
/* harmony import */var _stripe_stripe_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__(/*! @stripe/stripe-js */"./node_modules/@stripe/stripe-js/dist/stripe.esm.js");
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}
function _regeneratorRuntime(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */_regeneratorRuntime=function _regeneratorRuntime(){return e;};var t,e={},r=Object.prototype,n=r.hasOwnProperty,o=Object.defineProperty||function(t,e,r){t[e]=r.value;},i="function"==typeof Symbol?Symbol:{},a=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",u=i.toStringTag||"@@toStringTag";function define(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e];}try{define({},"");}catch(t){define=function define(t,e,r){return t[e]=r;};}function wrap(t,e,r,n){var i=e&&e.prototype instanceof Generator?e:Generator,a=Object.create(i.prototype),c=new Context(n||[]);return o(a,"_invoke",{value:makeInvokeMethod(t,r,c)}),a;}function tryCatch(t,e,r){try{return {type:"normal",arg:t.call(e,r)};}catch(t){return {type:"throw",arg:t};}}e.wrap=wrap;var h="suspendedStart",l="suspendedYield",f="executing",s="completed",y={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}var p={};define(p,a,function(){return this;});var d=Object.getPrototypeOf,v=d&&d(d(values([])));v&&v!==r&&n.call(v,a)&&(p=v);var g=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(p);function defineIteratorMethods(t){["next","throw","return"].forEach(function(e){define(t,e,function(t){return this._invoke(e,t);});});}function AsyncIterator(t,e){function invoke(r,o,i,a){var c=tryCatch(t[r],t,o);if("throw"!==c.type){var u=c.arg,h=u.value;return h&&"object"==_typeof(h)&&n.call(h,"__await")?e.resolve(h.__await).then(function(t){invoke("next",t,i,a);},function(t){invoke("throw",t,i,a);}):e.resolve(h).then(function(t){u.value=t,i(u);},function(t){return invoke("throw",t,i,a);});}a(c.arg);}var r;o(this,"_invoke",{value:function value(t,n){function callInvokeWithMethodAndArg(){return new e(function(e,r){invoke(t,n,e,r);});}return r=r?r.then(callInvokeWithMethodAndArg,callInvokeWithMethodAndArg):callInvokeWithMethodAndArg();}});}function makeInvokeMethod(e,r,n){var o=h;return function(i,a){if(o===f)throw Error("Generator is already running");if(o===s){if("throw"===i)throw a;return {value:t,done:!0};}for(n.method=i,n.arg=a;;){var c=n.delegate;if(c){var u=maybeInvokeDelegate(c,n);if(u){if(u===y)continue;return u;}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===h)throw o=s,n.arg;n.dispatchException(n.arg);}else "return"===n.method&&n.abrupt("return",n.arg);o=f;var p=tryCatch(e,r,n);if("normal"===p.type){if(o=n.done?s:l,p.arg===y)continue;return {value:p.arg,done:n.done};}"throw"===p.type&&(o=s,n.method="throw",n.arg=p.arg);}};}function maybeInvokeDelegate(e,r){var n=r.method,o=e.iterator[n];if(o===t)return r.delegate=null,"throw"===n&&e.iterator["return"]&&(r.method="return",r.arg=t,maybeInvokeDelegate(e,r),"throw"===r.method)||"return"!==n&&(r.method="throw",r.arg=new TypeError("The iterator does not provide a '"+n+"' method")),y;var i=tryCatch(o,e.iterator,r.arg);if("throw"===i.type)return r.method="throw",r.arg=i.arg,r.delegate=null,y;var a=i.arg;return a?a.done?(r[e.resultName]=a.value,r.next=e.nextLoc,"return"!==r.method&&(r.method="next",r.arg=t),r.delegate=null,y):a:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,y);}function pushTryEntry(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e);}function resetTryEntry(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e;}function Context(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(pushTryEntry,this),this.reset(!0);}function values(e){if(e||""===e){var r=e[a];if(r)return r.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,i=function next(){for(;++o<e.length;)if(n.call(e,o))return next.value=e[o],next.done=!1,next;return next.value=t,next.done=!0,next;};return i.next=i;}}throw new TypeError(_typeof(e)+" is not iterable");}return GeneratorFunction.prototype=GeneratorFunctionPrototype,o(g,"constructor",{value:GeneratorFunctionPrototype,configurable:!0}),o(GeneratorFunctionPrototype,"constructor",{value:GeneratorFunction,configurable:!0}),GeneratorFunction.displayName=define(GeneratorFunctionPrototype,u,"GeneratorFunction"),e.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return !!e&&(e===GeneratorFunction||"GeneratorFunction"===(e.displayName||e.name));},e.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,GeneratorFunctionPrototype):(t.__proto__=GeneratorFunctionPrototype,define(t,u,"GeneratorFunction")),t.prototype=Object.create(g),t;},e.awrap=function(t){return {__await:t};},defineIteratorMethods(AsyncIterator.prototype),define(AsyncIterator.prototype,c,function(){return this;}),e.AsyncIterator=AsyncIterator,e.async=function(t,r,n,o,i){void 0===i&&(i=Promise);var a=new AsyncIterator(wrap(t,r,n,o),i);return e.isGeneratorFunction(r)?a:a.next().then(function(t){return t.done?t.value:a.next();});},defineIteratorMethods(g),define(g,u,"Generator"),define(g,a,function(){return this;}),define(g,"toString",function(){return "[object Generator]";}),e.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function next(){for(;r.length;){var t=r.pop();if(t in e)return next.value=t,next.done=!1,next;}return next.done=!0,next;};},e.values=values,Context.prototype={constructor:Context,reset:function reset(e){if(this.prev=0,this.next=0,this.sent=this._sent=t,this.done=!1,this.delegate=null,this.method="next",this.arg=t,this.tryEntries.forEach(resetTryEntry),!e)for(var r in this)"t"===r.charAt(0)&&n.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=t);},stop:function stop(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval;},dispatchException:function dispatchException(e){if(this.done)throw e;var r=this;function handle(n,o){return a.type="throw",a.arg=e,r.next=n,o&&(r.method="next",r.arg=t),!!o;}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return handle("end");if(i.tryLoc<=this.prev){var c=n.call(i,"catchLoc"),u=n.call(i,"finallyLoc");if(c&&u){if(this.prev<i.catchLoc)return handle(i.catchLoc,!0);if(this.prev<i.finallyLoc)return handle(i.finallyLoc);}else if(c){if(this.prev<i.catchLoc)return handle(i.catchLoc,!0);}else {if(!u)throw Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return handle(i.finallyLoc);}}}},abrupt:function abrupt(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break;}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,y):this.complete(a);},complete:function complete(t,e){if("throw"===t.type)throw t.arg;return "break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),y;},finish:function finish(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),resetTryEntry(r),y;}},"catch":function _catch(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;resetTryEntry(r);}return o;}}throw Error("illegal catch attempt");},delegateYield:function delegateYield(e,r,n){return this.delegate={iterator:values(e),resultName:r,nextLoc:n},"next"===this.method&&(this.arg=t),y;}},e;}
function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else {Promise.resolve(value).then(_next,_throw);}}
function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise(function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value);}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err);}_next(undefined);});};}
function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable;})),t.push.apply(t,o);}return t;}
function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r));});}return e;}
function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}
function _toPropertyKey(t){var i=_toPrimitive(t,"string");return "symbol"==_typeof(i)?i:i+"";}
function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return ("string"===r?String:Number)(t);}







/* harmony default export */__webpack_exports__["default"]={
components:{
vueEasyPrint:vue_easy_print__WEBPACK_IMPORTED_MODULE_2__["default"],
barcode:vue_barcode__WEBPACK_IMPORTED_MODULE_3___default.a,
FlagIcon:vue_flag_icon__WEBPACK_IMPORTED_MODULE_4__["default"]
},
metaInfo:{
title:"POS"
},
data:function data(){
return {
langs:["en","fr","ar","de","es","it","Ind","thai","tr_ch","sm_ch","tur","ru","hn","vn"],
stripe:{},
stripe_key:'',
cardElement:{},
paymentProcessing:false,
payment:{
amount:"",
Reglement:"",
notes:"",
print_receipt:"1"
},
isLoading:true,
GrandTotal:0,
tendered:0,
change:0,
total:0,
Ref:"",
SearchProduct:"",
SearchBarcode:"",
clients:[],
warehouses:[],
products:[],
details:[],
detail:{},
heldItemComment:{},
categories:[],
brands:[],
product_currentPage:1,
paginated_Products:"",
product_perPage:500,
product_totalRows:"",
paginated_Brands:"",
brand_currentPage:1,
brand_perPage:6,
paginated_Category:"",
category_currentPage:1,
category_perPage:6,
barcodeFormat:"CODE128",
invoice_pos:{
sale:{
Ref:"",
client_name:"",
discount:"",
taxe:"",
date:"",
tax_rate:"",
shipping:"",
GrandTotal:"",
tendered:0
},
details:[],
//
setting:{
logo:"",
CompanyName:"",
CompanyAdress:"",
email:"",
CompanyPhone:""
}
},
sale:{
warehouse_id:"",
client_id:"",
tax_rate:0,
shipping:0,
discount:0,
TaxNet:0
},
client:{
id:"",
name:"",
code:"",
email:"default@gmail.com",
phone:"0720000000",
country:"Kenya",
city:"Webuye",
adresse:"Western Kenya"
},
category_id:"",
brand_id:"",
product:{
id:"",
code:"",
current:"",
quantity:"",
check_qty:"",
discount:"",
DiscountNet:"",
discount_Method:"",
name:"",
unitSale:"",
Net_price:"",
Unit_price:"",
Total_price:"",
subtotal:"",
product_id:"",
detail_id:"",
taxe:"",
tax_percent:"",
tax_method:"",
product_variant_id:""
},
sound:"/audio/Beep.wav",
audio:new Audio("/audio/Beep.wav"),
display:"list",
held_items:[],
held_item_id:""
};
},
computed:_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_1__["mapGetters"])(["currentUser","currentUserPermissions"])),{},{
brand_totalRows:function brand_totalRows(){
return this.brands.length;
},
category_totalRows:function category_totalRows(){
return this.categories.length;
},
totalChange:function totalChange(){
if(this.tendered<this.GrandTotal){
return 0;
}
return this.tendered-this.GrandTotal;
}
}),
//calculate_change  invoice_pos.sale.tendered
mounted:function mounted(){
this.changeSidebarProperties();
this.paginate_products(this.product_perPage,0);
this.Get_Held_Items();
},
methods:_objectSpread(_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_1__["mapActions"])(["changeSidebarProperties","changeThemeMode","logout"])),Object(vuex__WEBPACK_IMPORTED_MODULE_1__["mapGetters"])(["currentUser","currentUserPermissions"])),{},{
logoutUser:function logoutUser(){
this.$store.dispatch("logout");
},
loadStripe_payment:function loadStripe_payment(){
var _this=this;
return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(){
var elements;
return _regeneratorRuntime().wrap(function _callee$(_context){
while(1)switch(_context.prev=_context.next){
case 0:
_context.next=2;
return Object(_stripe_stripe_js__WEBPACK_IMPORTED_MODULE_6__["loadStripe"])("".concat(_this.stripe_key));
case 2:
_this.stripe=_context.sent;
elements=_this.stripe.elements();
_this.cardElement=elements.create("card",{
classes:{
base:"bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 text-base outline-none text-gray-700 p-3 leading-8 transition-colors duration-200 ease-in-out"
}
});
_this.cardElement.mount("#card-element");
case 6:
case"end":
return _context.stop();
}
},_callee);
}))();
},
//---------------------- Event Select Payment Method ------------------------------\\
Selected_PaymentMethod:function Selected_PaymentMethod(value){
var _this2=this;
if(value=="credit card"){
setTimeout(function(){
_this2.loadStripe_payment();
},500);
}
},
SetLocal:function SetLocal(locale){
this.$i18n.locale=locale;
this.$store.dispatch("language/setLanguage",locale);
Fire.$emit("ChangeLanguage");
},
handleFullScreen:function handleFullScreen(){
_utils__WEBPACK_IMPORTED_MODULE_5__["default"].toggleFullScreen();
},
/*    logoutUser() {
          this.logout();
        },*/
// ------------------------ Paginate Products --------------------\\
Product_paginatePerPage:function Product_paginatePerPage(){
this.paginate_products(this.product_perPage,0);
},
paginate_products:function paginate_products(pageSize,pageNumber){
//console.log(this.products)
var itemsToParse=this.products;
this.paginated_Products=itemsToParse.slice(pageNumber*pageSize,(pageNumber+1)*pageSize);
},
Product_onPageChanged:function Product_onPageChanged(page){
this.paginate_products(this.product_perPage,page-1);
this.getProducts(page);
},
// ------------------------ Paginate Brands --------------------\\
BrandpaginatePerPage:function BrandpaginatePerPage(){
this.paginate_Brands(this.brand_perPage,0);
},
paginate_Brands:function paginate_Brands(pageSize,pageNumber){
var itemsToParse=this.brands;
this.paginated_Brands=itemsToParse.slice(pageNumber*pageSize,(pageNumber+1)*pageSize);
},
BrandonPageChanged:function BrandonPageChanged(page){
this.paginate_Brands(this.brand_perPage,page-1);
},
// ------------------------ Paginate Categories --------------------\\
Category_paginatePerPage:function Category_paginatePerPage(){
this.paginate_Category(this.category_perPage,0);
},
paginate_Category:function paginate_Category(pageSize,pageNumber){
var itemsToParse=this.categories;
this.paginated_Category=itemsToParse.slice(pageNumber*pageSize,(pageNumber+1)*pageSize);
},
Category_onPageChanged:function Category_onPageChanged(page){
this.paginate_Category(this.category_perPage,page-1);
},
//--- Submit Validate Create Sale
Submit_Pos:function Submit_Pos(){
var _this3=this;
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
this.$refs.create_pos.validate().then(function(success){
if(!success){
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
if(_this3.sale.client_id==""||_this3.sale.client_id===null){
_this3.makeToast("danger",_this3.$t("Choose_Customer"),_this3.$t("Failed"));
}else if(_this3.sale.warehouse_id==""||_this3.sale.warehouse_id===null){
_this3.makeToast("danger",_this3.$t("Choose_Warehouse"),_this3.$t("Failed"));
}else {
_this3.makeToast("danger",_this3.$t("Please_fill_the_form_correctly"),_this3.$t("Failed"));
}
}else {
if(_this3.verifiedForm()){
Fire.$emit("pay_now");
}else {
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
}
}
});
},
//---Submit Validation Update Detail
submit_Update_Detail:function submit_Update_Detail(){
var _this4=this;
this.$refs.Update_Detail.validate().then(function(success){
if(!success){
return;
}else {
_this4.Update_Detail();
}
});
},
submit_held_comment_update:function submit_held_comment_update(){
var _this5=this;
console.log("Saving comment");
axios.post("update/comment",{
id:this.heldItemComment.id,
comment:this.heldItemComment.comment
}).then(function(response){
if(response.data.success===true){
_this5.Get_Held_Items();
// Complete the animation of the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this5.makeToast("success",'Updated comment successfully','Updated');
_this5.Reset_Pos();
_this5.$bvModal.hide("form_held_item_update");
}
})["catch"](function(error){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this5.makeToast("danger",'Could not update. Please try again',_this5.$t("Failed"));
});
},
//------ Validate Form Submit_Payment
Submit_Payment:function Submit_Payment(){
var _this6=this;
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
this.$refs.Add_payment.validate().then(function(success){
if(!success){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this6.makeToast("danger",_this6.$t("Please_fill_the_form_correctly"),_this6.$t("Failed"));
}else {
_this6.CreatePOS();
}
});
},
//------------- Submit Validation Create & Edit Customer
Submit_Customer:function Submit_Customer(){
var _this7=this;
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
this.$refs.Create_Customer.validate().then(function(success){
if(!success){
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this7.makeToast("danger",_this7.$t("Please_fill_the_form_correctly"),_this7.$t("Failed"));
}else {
_this7.Create_Client();
}
});
},
//---------------------------------------- Create new Customer -------------------------------\\
Create_Client:function Create_Client(){
var _this8=this;
axios.post("clients",{
name:this.client.name,
email:this.client.email,
phone:this.client.phone,
country:this.client.country,
city:this.client.city,
adresse:this.client.adresse
}).then(function(response){
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this8.makeToast("success",_this8.$t("Create.TitleCustomer"),_this8.$t("Success"));
_this8.Get_Client_Without_Paginate();
_this8.$bvModal.hide("New_Customer");
})["catch"](function(error){
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this8.makeToast("danger",_this8.$t("InvalidData"),_this8.$t("Failed"));
});
},
//------------------------------ New Model (create Customer) -------------------------------\\
New_Client:function New_Client(){
this.reset_Form_client();
this.$bvModal.show("New_Customer");
},
//-------------------------------- reset Form -------------------------------\\
reset_Form_client:function reset_Form_client(){
this.client={
id:"",
name:"",
email:"info@gmail.com",
phone:"0723444555",
country:"Kenya",
city:"Kenya",
adresse:"Kenya"
};
},
//------------------------------------ Get Clients Without Paginate -------------------------\\
Get_Client_Without_Paginate:function Get_Client_Without_Paginate(){
var _this9=this;
axios.get("Get_Clients_Without_Paginate").then(function(_ref){
var data=_ref.data;
return _this9.clients=data;
});
},
//---Validate State Fields
getValidationState:function getValidationState(_ref2){
var dirty=_ref2.dirty,
validated=_ref2.validated,
_ref2$valid=_ref2.valid,
valid=_ref2$valid===void 0?null:_ref2$valid;
return dirty||validated?valid:null;
},
//------ Toast
makeToast:function makeToast(variant,msg,title){
this.$root.$bvToast.toast(msg,{
title:title,
variant:variant,
solid:true
});
},
//---------------------- Event Select Warehouse ------------------------------\\
Selected_Warehouse:function Selected_Warehouse(value){
this.Get_Products_By_Warehouse(value);
},
//------------------------------------ Get Products By Warehouse -------------------------\\
Get_Products_By_Warehouse:function Get_Products_By_Warehouse(id){
var _this10=this;
axios.get("Products/Warehouse/"+id+"?stock="+1).then(function(_ref3){
var data=_ref3.data;
return _this10.products=data;
});
},
Get_Held_Items:function Get_Held_Items(){
var _this11=this;
axios.get("held/items").then(function(_ref4){
var data=_ref4.data;
return _this11.held_items=data.items;
});
},
populateHoldItemsToPOS:function populateHoldItemsToPOS(id){
var item=this.held_items.find(function(element){
return element.id===id;
});
this.details=item.items;
this.sale.client_id=item.client.id;
this.$bvModal.hide("Show_held_items");
this.held_item_id=id;
this.CaclulTotal();
},
deleteHeldItemBtn:function deleteHeldItemBtn(id){
var _this12=this;
axios.post("delete/held/sale",{
id:id
}).then(function(response){
if(response.data.success===true){
_this12.Get_Held_Items();
// Complete the animation of the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this12.makeToast("success",'Deleted successfully','Deleted');
_this12.Reset_Pos();
}
})["catch"](function(error){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this12.makeToast("danger",'Could not delete. Please try again',_this12.$t("Failed"));
});
},
//----------------------------------------- Add Detail of Sale -------------------------\\
add_product:function add_product(code){
this.audio.play();
if(this.details.length===0){
this.tendered=0;
}
if(this.details.some(function(detail){
return detail.code===code;
})){
var element=this.details.find(function(detail){
return detail.code===code;
});
element.quantity+=1;
//console.log("Quantity changed")
//this.makeToast("warning", this.$t("AlreadyAdd"), this.$t("Warning"));
// Complete the animation of the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
}else {
if(this.details.length>0){
this.order_detail_id();
}else if(this.details.length===0){
this.product.detail_id=1;
}
this.details.push(this.product);
}
// this.SearchBarcode = '';
this.$refs.autocomplete.value="";
this.$refs.autocomplete.$refs.input.focus();
//console.log(this.$refs.autocomplete.$refs.input)
},
//-------------------------------- order detail id -------------------------\\
order_detail_id:function order_detail_id(){
this.product.detail_id=0;
var len=this.details.length;
this.product.detail_id=this.details[len-1].detail_id+1;
},
//-------------------------------- Show Modal Poduct Detail -------------------------\\
Modal_Update_Detail:function Modal_Update_Detail(detail){
this.detail={};
this.detail.name=detail.name;
this.detail.detail_id=detail.detail_id;
this.detail.Unit_price=detail.Unit_price;
this.detail.tax_method=detail.tax_method;
this.detail.discount_Method=detail.discount_Method;
this.detail.discount=detail.discount;
this.detail.quantity=detail.quantity;
this.detail.tax_percent=detail.tax_percent;
this.detail.taxe=detail.taxe;
this.$bvModal.show("form_Update_Detail");
},
Modal_Update_Held_Item_Comment:function Modal_Update_Held_Item_Comment(heldItemComment){
this.heldItemComment={};
this.heldItemComment.user=heldItemComment.user;
this.heldItemComment.id=heldItemComment.id;
this.heldItemComment.total=heldItemComment.total;
this.heldItemComment.comment=heldItemComment.comment;
this.heldItemComment.client=heldItemComment.client.name;
this.$bvModal.show("form_held_item_update");
},
//-------------------------------- Update Poduct Detail -------------------------\\
Update_Detail:function Update_Detail(){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id===this.detail.detail_id){
this.details[i].tax_percent=this.detail.tax_percent;
this.details[i].Unit_price=this.detail.Unit_price;
this.details[i].quantity=this.detail.quantity;
this.details[i].tax_method=this.detail.tax_method;
this.details[i].discount_Method=this.detail.discount_Method;
this.details[i].discount=this.detail.discount;
if(this.details[i].discount_Method=="2"){
//Fixed
this.details[i].DiscountNet=this.detail.discount;
}else {
//Percentage %
this.details[i].DiscountNet=parseFloat(this.detail.Unit_price*this.details[i].discount/100);
}
if(this.details[i].tax_method=="1"){
//Exclusive
this.details[i].Net_price=parseFloat(this.detail.Unit_price-this.details[i].DiscountNet);
this.details[i].taxe=parseFloat(this.detail.tax_percent*(this.detail.Unit_price-this.details[i].DiscountNet)/100);
this.details[i].Total_price=parseFloat(this.details[i].Net_price+this.details[i].taxe);
}else {
//Inclusive
this.details[i].Net_price=parseFloat((this.detail.Unit_price-this.details[i].DiscountNet)/(this.detail.tax_percent/100+1));
this.details[i].taxe=parseFloat(this.detail.Unit_price-this.details[i].Net_price-this.details[i].DiscountNet);
this.details[i].Total_price=parseFloat(this.details[i].Net_price+this.details[i].taxe);
}
this.$forceUpdate();
}
}
this.CaclulTotal();
this.$bvModal.hide("form_Update_Detail");
},
//-- check Qty of  details order if Null or zero
verifiedForm:function verifiedForm(){
if(this.details.length<=0){
this.makeToast("warning",this.$t("AddProductToList"),this.$t("Warning"));
return false;
}else {
var count=0;
for(var i=0;i<this.details.length;i++){
if(this.details[i].quantity==""||this.details[i].quantity===0){
count+=1;
}
}
if(count>0){
this.makeToast("warning",this.$t("AddQuantity"),this.$t("Warning"));
return false;
}else {
return true;
}
}
},
//-------------------- print invoice Pos
print_pos:function print_pos(){

//this.$refs.Show_invoice.print(); //disables printer on browser
},formatAMPM:function formatAMPM(date){
var hours=date.getHours();
var minutes=date.getMinutes();
var ampm=hours>=12?'pm':'am';
hours=hours%12;
hours=hours?hours:12;// the hour '0' should be '12'
minutes=minutes<10?'0'+minutes:minutes;
var strTime=hours+':'+minutes+' '+ampm;
return strTime;
},
//-------------------------------- Invoice POS ------------------------------\\
Invoice_POS:function Invoice_POS(id){
var _this13=this;
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
axios.get("Sales/Print_Invoice/"+id).then(function(response){
_this13.invoice_pos=response.data;
setTimeout(function(){
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this13.$bvModal.show("Show_invoice");
},500);
setTimeout(function(){
return _this13.print_pos();
},1000);
})["catch"](function(){
// Complete the animation of the  progress bar.
setTimeout(function(){
return nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
},500);
});
},
//----------------------------------Process Payment ------------------------------\\
processPayment:function processPayment(){
var _this14=this;
return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(){
var _yield$_this14$stripe,token,error;
return _regeneratorRuntime().wrap(function _callee2$(_context2){
while(1)switch(_context2.prev=_context2.next){
case 0:
_this14.paymentProcessing=true;
_context2.next=3;
return _this14.stripe.createToken(_this14.cardElement);
case 3:
_yield$_this14$stripe=_context2.sent;
token=_yield$_this14$stripe.token;
error=_yield$_this14$stripe.error;
if(error){
_this14.paymentProcessing=false;
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this14.makeToast("danger",_this14.$t("InvalidData"),_this14.$t("Failed"));
}else {
axios.post("pos/CreatePOS",{
client_id:_this14.sale.client_id,
warehouse_id:_this14.sale.warehouse_id,
tax_rate:_this14.sale.tax_rate,
TaxNet:_this14.sale.TaxNet,
discount:_this14.sale.discount,
shipping:_this14.sale.shipping,
details:_this14.details,
GrandTotal:_this14.GrandTotal,
payment:_this14.payment,
token:token.id
}).then(function(response){
_this14.paymentProcessing=false;
if(response.data.success===true){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this14.Invoice_POS(response.data.id);
_this14.$bvModal.hide("Add_Payment");
_this14.Reset_Pos();
}
})["catch"](function(error){
_this14.paymentProcessing=false;
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this14.makeToast("danger",_this14.$t("InvalidData"),_this14.$t("Failed"));
});
}
case 7:
case"end":
return _context2.stop();
}
},_callee2);
}))();
},
//----------------------------------Create POS ------------------------------\\
CreatePOS:function CreatePOS(){
var _this15=this;
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
if(this.payment.Reglement=='credit card'){
if(this.stripe_key!=''){
this.processPayment();
}else {
this.makeToast("danger",this.$t("credit_card_account_not_available"),this.$t("Failed"));
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
}
}else {
axios.post("pos/CreatePOS",{
client_id:this.sale.client_id,
warehouse_id:this.sale.warehouse_id,
tax_rate:this.sale.tax_rate,
TaxNet:this.sale.TaxNet,
discount:this.sale.discount,
shipping:this.sale.shipping,
details:this.details,
GrandTotal:this.GrandTotal,
payment:this.payment
}).then(function(response){
if(response.data.success===true){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this15.Invoice_POS(response.data.id);
_this15.$bvModal.hide("Add_Payment");
_this15.Reset_Pos();
}
})["catch"](function(error){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this15.makeToast("danger",_this15.$t("InvalidData"),_this15.$t("Failed"));
});
}
},
//------------------------------Formetted Numbers -------------------------\\
formatNumber:function formatNumber(number,dec){
var value=(typeof number==="string"?number:number.toString()).split(".");
if(dec<=0)return value[0];
var formated=value[1]||"";
if(formated.length>dec)return "".concat(value[0],".").concat(formated.substr(0,dec));
while(formated.length<dec)formated+="0";
return "".concat(value[0],".").concat(formated);
},
//---------------------------------Get Product Details ------------------------\\
Get_Product_Details:function Get_Product_Details(product,product_id){
var _this16=this;
axios.get("Products/"+product_id).then(function(response){
_this16.product.discount=0;
_this16.product.DiscountNet=0;
_this16.product.discount_Method="2";
_this16.product.product_id=response.data.id;
_this16.product.name=response.data.name;
_this16.product.Net_price=response.data.Net_price;
_this16.product.Total_price=response.data.Total_price;
_this16.product.Unit_price=response.data.Unit_price;
_this16.product.taxe=response.data.tax_price;
_this16.product.tax_method=response.data.tax_method;
_this16.product.tax_percent=response.data.tax_percent;
_this16.product.unitSale=response.data.unitSale;
_this16.product.product_variant_id=product.product_variant_id;
_this16.product.code=product.code;
_this16.add_product(product.code);
_this16.CaclulTotal();
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
});
},
//----------- Calcul Total
CaclulTotal:function CaclulTotal(){
this.total=0;
for(var i=0;i<this.details.length;i++){
var tax=this.details[i].taxe*this.details[i].quantity;
this.details[i].subtotal=parseFloat(this.details[i].quantity*this.details[i].Net_price+tax);
this.total=parseFloat(this.total+this.details[i].subtotal);
}
var total_without_discount=parseFloat(this.total-this.sale.discount);
this.sale.TaxNet=parseFloat(total_without_discount*this.sale.tax_rate/100);
this.GrandTotal=parseFloat(total_without_discount+this.sale.TaxNet+this.sale.shipping);
},
//-------Verified QTY
Verified_Qty:function Verified_Qty(detail,id){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id===id){
if(isNaN(detail.quantity)){
this.details[i].quantity=detail.current;
}
if(detail.quantity>detail.current){
this.makeToast("warning",this.$t("LowStock"),this.$t("Warning"));
this.details[i].quantity=detail.current;
}else {
this.details[i].quantity=detail.quantity;
}
}
}
this.$forceUpdate();
this.CaclulTotal();
},
//----------------------------------- Increment QTY ------------------------------\\
increment:function increment(detail,id){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id==id){
if(this.details[i].quantity+1>this.details[i].current){
this.makeToast("warning",this.$t("LowStock"),this.$t("Warning"));
}else {
this.details[i].quantity++;
}
}
}
this.CaclulTotal();
this.$forceUpdate();
},
//----------------------------------- decrement QTY ------------------------------\\
decrement:function decrement(detail,id){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id==id){
if(detail.quantity-1>detail.current||detail.quantity-1<1){
this.makeToast("warning",this.$t("LowStock"),this.$t("Warning"));
}else {
this.details[i].quantity--;
}
}
}
this.CaclulTotal();
this.$forceUpdate();
},
//---------- keyup OrderTax
keyup_OrderTax:function keyup_OrderTax(){
if(isNaN(this.sale.tax_rate)){
this.sale.tax_rate=0;
}else {
this.CaclulTotal();
}
},
//---------- keyup Discount
keyup_Discount:function keyup_Discount(){
if(isNaN(this.sale.discount)){
this.sale.discount=0;
}else {
this.CaclulTotal();
}
},
//---------- keyup Shipping
keyup_Shipping:function keyup_Shipping(){
if(isNaN(this.sale.shipping)){
this.sale.shipping=0;
}else {
this.CaclulTotal();
}
},
//-----------------------------------Delete Detail Product ------------------------------\\
delete_Product_Detail:function delete_Product_Detail(id){
for(var i=0;i<this.details.length;i++){
if(id===this.details[i].detail_id){
this.details.splice(i,1);
this.CaclulTotal();
}
}
},
//----------Reset Pos
Reset_Pos:function Reset_Pos(){
this.details=[];
this.product={};
this.sale.tax_rate=0;
this.sale.TaxNet=0;
this.sale.shipping=0;
this.sale.discount=0;
this.GrandTotal=0;
this.total=0;
this.category_id="";
this.brand_id="";
this.held_item_id="";
this.sale.client_id=1;
this.getProducts(1);
},
Hold_Pos:function Hold_Pos(){
var _this17=this;
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
if(this.details.length===0){
this.makeToast("danger",'No products in the ticket to hold',this.$t("Failed"));
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
}else {
axios.post("pos/hold",{
details:this.details,
id:this.held_item_id,
client_id:this.sale.client_id
}).then(function(response){
if(response.data.success===true){
_this17.Get_Held_Items();
// Complete the animation of the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this17.makeToast("success",'Items held successfully','Held');
_this17.Reset_Pos();
}
})["catch"](function(error){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this17.makeToast("danger",'Could not hold the items. Please try again',_this17.$t("Failed"));
});
}
},
//show modal
Held_List:function Held_List(){
//get all held sales and display
this.$bvModal.show("Show_held_items");
},
deleteHeldSale:function deleteHeldSale(){
var _this18=this;
this.$swal({
title:this.$t("Delete.Title"),
text:this.$t("Delete.Text"),
type:"warning",
showCancelButton:true,
confirmButtonColor:"#3085d6",
cancelButtonColor:"#d33",
cancelButtonText:this.$t("Delete.cancelButtonText"),
confirmButtonText:this.$t("Delete.confirmButtonText")
}).then(function(result){
if(result.value){
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
if(_this18.details.length===0||_this18.held_item_id===""){
_this18.makeToast("danger",'Select Held Item To Delete',_this18.$t("Failed"));
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
}else {
axios.post("delete/held/sale",{
id:_this18.held_item_id
}).then(function(response){
if(response.data.success===true){
_this18.Get_Held_Items();
// Complete the animation of the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this18.makeToast("success",'Deleted successfully','Deleted');
_this18.Reset_Pos();
}
})["catch"](function(error){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this18.makeToast("danger",'Could not delete. Please try again',_this18.$t("Failed"));
});
}
}
});
},
//------------------------- get Result Value Search Product
getResultValue:function getResultValue(result){
return result.code+" "+"("+result.name+")";
},
//------------------------- Submit Search Product
Submit_SearchProduct:function Submit_SearchProduct(result){
this.product={};
this.product.code=result.code;
this.product.stock=result.qte_sale;
if(result.qte_sale<1){
this.product.quantity=result.qte_sale;
}else {
this.product.quantity=1;
}
this.product.product_variant_id=result.product_variant_id;
this.Get_Product_Details(result,result.id);
this.$refs.autocomplete.value="";
this.$refs.autocomplete.$refs.input.focus();
},
//------------------------- Search Product
search:function search(input){
if(input.length<1){
return [];
}
if(this.sale.warehouse_id!=""){
var product_filter=this.products.filter(function(product){
return product.code===input||product.barcode.includes(input);
});
if(product_filter.length===1){
this.Check_Product_Exist(product_filter[0],product_filter[0].id);
}else {
return this.products.filter(function(product){
return product.name.toLowerCase().includes(input.toLowerCase())||product.code.toLowerCase().includes(input.toLowerCase())||product.barcode.toLowerCase().includes(input.toLowerCase());
});
}
}else {
this.makeToast("warning",this.$t("SelectWarehouse"),this.$t("Warning"));
}
},
//---------------------------------- Check if Product Exist in Order List ---------------------\\
Check_Product_Exist:function Check_Product_Exist(product,id){
// this.audio.play();
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
this.product={};
this.product.current=product.qte_sale;
if(product.qte_sale<1){
this.product.quantity=product.qte_sale;
}else {
this.product.quantity=1;
}
this.Get_Product_Details(product,id);
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
},
//--- Get Products by Category
Products_by_Category:function Products_by_Category(id){
this.category_id=id;
this.getProducts(1);
},
//--- Get Products by Brand
Products_by_Brands:function Products_by_Brands(id){
this.brand_id=id;
this.getProducts(1);
},
//--- Get All Category
getAllCategory:function getAllCategory(){
this.category_id="";
this.getProducts(1);
},
//--- Get All Brands
GetAllBrands:function GetAllBrands(){
this.brand_id="";
this.getProducts(1);
},
//------------------------------- Get Products with Filters ------------------------------\\
getProducts:function getProducts(){
var _this19=this;
var page=arguments.length>0&&arguments[0]!==undefined?arguments[0]:1;
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
axios.get("GetProductsByParametre?page="+page+"&category_id="+this.category_id+"&brand_id="+this.brand_id+"&warehouse_id="+this.sale.warehouse_id+
// "&search=" +
// this.SearchProduct +
"&stock="+1).then(function(response){
// this.products = [];
_this19.products=response.data.products;
_this19.product_totalRows=response.data.totalRows;
_this19.Product_paginatePerPage();

// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
})["catch"](function(response){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
});
},
//---------------------------------------Get Elements ------------------------------\\
GetElementsPos:function GetElementsPos(){
var _this20=this;
axios.get("pos/GetELementPos").then(function(response){
_this20.clients=response.data.clients;
_this20.warehouses=response.data.warehouses;
_this20.categories=response.data.categories;
_this20.brands=response.data.brands;
_this20.display=response.data.display;
_this20.sale.warehouse_id=response.data.defaultWarehouse;
_this20.sale.client_id=response.data.defaultClient;
_this20.getProducts();
_this20.paginate_Brands(_this20.brand_perPage,0);
_this20.paginate_Category(_this20.category_perPage,0);
_this20.stripe_key=response.data.stripe_key;
_this20.isLoading=false;
})["catch"](function(response){
_this20.isLoading=false;
});
}
}),
//-------------------- Created Function -----\\
created:function created(){
var _this21=this;
this.GetElementsPos();
Fire.$on("pay_now",function(){
setTimeout(function(){
_this21.payment.amount=_this21.formatNumber(_this21.GrandTotal,2);
_this21.payment.Reglement="Cash";
_this21.$bvModal.show("Add_Payment");
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
},500);
});
}
};

/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487":(
/*!*****************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487 ***!
  \*****************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcViewsAppPagesPosVueVueTypeTemplateId4cc49487(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this,
_c=_vm._self._c;
return _c("div",{
staticClass:"pos_page"
},[_c("div",{
staticClass:"container-fluid p-0 app-admin-wrap layout-sidebar-large clearfix",
attrs:{
id:"pos"
}
},[_vm.isLoading?_c("div",{
staticClass:"loading_page spinner spinner-primary mr-3"
}):_vm._e(),_vm._v(" "),!_vm.isLoading?_c("b-row",[_c("b-col",{
attrs:{
md:"5"
}
},[_c("b-card",{
staticClass:"card-order",
attrs:{
"no-body":""
}
},[_c("div",{
staticClass:"main-header"
},[_c("div",{
staticClass:"logo"
},[_c("router-link",{
attrs:{
to:"/app/dashboard"
}
},[_c("img",{
attrs:{
src:"/images/"+_vm.currentUser.logo,
alt:"",
width:"60",
height:"60"
}
})])],1),_vm._v(" "),_c("div",{
staticClass:"mx-auto"
}),_vm._v(" "),_c("div",{
staticClass:"header-part-right"
},[_c("i",{
staticClass:"i-Full-Screen header-icon d-none d-sm-inline-block",
on:{
click:_vm.handleFullScreen
}
}),_vm._v(" "),_vm._e(),_vm._v(" "),_c("button",{
staticClass:"btn btn-outline-danger btn-sm",
on:{
click:_vm.logoutUser
}
},[_vm._v("\n                                    Logout\n                                ")]),_vm._v(" "),_c("div",{
staticClass:"dropdown"
},[_c("b-dropdown",{
staticClass:"m-md-2 user col align-self-end",
attrs:{
id:"dropdown-1",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link",
right:""
}
},[_c("template",{
slot:"button-content"
},[_c("img",{
attrs:{
src:"/images/avatar/"+_vm.currentUser.avatar,
id:"userDropdown",
alt:"",
"data-toggle":"dropdown",
"aria-haspopup":"true",
"aria-expanded":"false"
}
})]),_vm._v(" "),_c("div",{
staticClass:"dropdown-menu-left",
attrs:{
"aria-labelledby":"userDropdown"
}
},[_c("div",{
staticClass:"dropdown-header"
},[_c("i",{
staticClass:"i-Lock-User mr-1"
}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.currentUser.username))])]),_vm._v(" "),_c("router-link",{
staticClass:"dropdown-item",
attrs:{
to:"/app/profile"
}
},[_vm._v(_vm._s(_vm.$t("profil"))+"\n                                            ")]),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("setting_system")?_c("router-link",{
staticClass:"dropdown-item",
attrs:{
to:"/app/settings/System_settings"
}
},[_vm._v(_vm._s(_vm.$t("Settings"))+"\n                                            ")]):_vm._e(),_vm._v(" "),_c("a",{
staticClass:"dropdown-item",
attrs:{
href:"#"
},
on:{
click:function click($event){
$event.preventDefault();
return _vm.logoutUser.apply(null,arguments);
}
}
},[_vm._v(_vm._s(_vm.$t("logout")))])],1)],2)],1)])]),_vm._v(" "),_c("validation-observer",{
ref:"create_pos"
},[_c("b-form",{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.Submit_Pos.apply(null,arguments);
}
}
},[_c("b-card-body",[_c("b-row",[_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Customer",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(_ref){
var valid=_ref.valid,
errors=_ref.errors;
return _c("b-input-group",{
staticClass:"input-customer"
},[_c("v-select",{
staticClass:"w-100",
"class":{
"is-invalid":!!errors.length
},
attrs:{
state:errors[0]?false:valid?true:null,
reduce:function reduce(label){
return label.value;
},
placeholder:_vm.$t("Choose_Customer"),
options:_vm.clients.map(function(clients){
return {
label:clients.name,
value:clients.id
};
})
},
model:{
value:_vm.sale.client_id,
callback:function callback($$v){
_vm.$set(_vm.sale,"client_id",$$v);
},
expression:"sale.client_id"
}
}),_vm._v(" "),_c("b-input-group-append",[_c("b-button",{
attrs:{
variant:"primary"
},
on:{
click:function click($event){
return _vm.New_Client();
}
}
},[_c("span",[_c("i",{
staticClass:"i-Add-User"
})])])],1)],1);
}
}],null,false,1846940208)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"warehouse",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(_ref2){
var valid=_ref2.valid,
errors=_ref2.errors;
return _c("b-form-group",{
staticClass:"mt-2"
},[_c("v-select",{
"class":{
"is-invalid":!!errors.length
},
attrs:{
state:errors[0]?false:valid?true:null,
disabled:_vm.details.length>0,
reduce:function reduce(label){
return label.value;
},
placeholder:_vm.$t("Choose_Warehouse"),
options:_vm.warehouses.map(function(warehouses){
return {
label:warehouses.name,
value:warehouses.id
};
})
},
on:{
input:_vm.Selected_Warehouse
},
model:{
value:_vm.sale.warehouse_id,
callback:function callback($$v){
_vm.$set(_vm.sale,"warehouse_id",$$v);
},
expression:"sale.warehouse_id"
}
})],1);
}
}],null,false,1940612659)
})],1),_vm._v(" "),_c("b-col",{
staticClass:"mt-2",
attrs:{
md:"12"
}
},[_c("div",{
staticClass:"pos-detail"
},[_c("div",{
staticClass:"table-responsive"
},[_c("table",{
staticClass:"table table-striped"
},[_c("thead",[_c("tr",[_c("th",{
attrs:{
scope:"col"
}
},[_vm._v(_vm._s(_vm.$t("ProductName")))]),_vm._v(" "),_c("th",{
attrs:{
scope:"col"
}
},[_vm._v(_vm._s(_vm.$t("Price")))]),_vm._v(" "),_c("th",{
staticClass:"text-center",
attrs:{
scope:"col"
}
},[_vm._v(_vm._s(_vm.$t("Qty")))]),_vm._v(" "),_c("th",{
staticClass:"text-center",
attrs:{
scope:"col"
}
},[_vm._v(_vm._s(_vm.$t("SubTotal"))+"\n                                                            ")]),_vm._v(" "),_c("th",{
staticClass:"text-center",
attrs:{
scope:"col"
}
},[_c("i",{
staticClass:"fa fa-trash"
})])])]),_vm._v(" "),_c("tbody",[_vm.details.length<=0?_c("tr",[_c("td",{
attrs:{
colspan:"5"
}
},[_vm._v(_vm._s(_vm.$t("NodataAvailable")))])]):_vm._e(),_vm._v(" "),_vm._l(_vm.details,function(detail,index){
return _c("tr",{
key:index
},[_c("td",[_c("span",[_vm._v(_vm._s(detail.name))]),_vm._v(" "),_c("br"),_vm._v(" "),_c("span",{
staticClass:"badge badge-success"
},[_vm._v(_vm._s(detail.code))]),_vm._v(" "),_c("i",{
staticClass:"i-Edit",
on:{
click:function click($event){
return _vm.Modal_Update_Detail(detail);
}
}
})]),_vm._v(" "),_c("td",[_vm._v(_vm._s(_vm.currentUser.currency)+"\n                                                                "+_vm._s(_vm.formatNumber(detail.Total_price,2))+"\n                                                            ")]),_vm._v(" "),_c("td",[_c("div",{
staticClass:"quantity"
},[_c("b-input-group",[_c("b-input-group-prepend",[_c("span",{
staticClass:"btn btn-primary btn-sm",
on:{
click:function click($event){
return _vm.decrement(detail,detail.detail_id);
}
}
},[_vm._v("-")])]),_vm._v(" "),_c("input",{
directives:[{
name:"model",
rawName:"v-model.number",
value:detail.quantity,
expression:"detail.quantity",
modifiers:{
number:true
}
}],
staticClass:"form-control",
domProps:{
value:detail.quantity
},
on:{
keyup:function keyup($event){
return _vm.Verified_Qty(detail,detail.detail_id);
},
input:function input($event){
if($event.target.composing)return;
_vm.$set(detail,"quantity",_vm._n($event.target.value));
},
blur:function blur($event){
return _vm.$forceUpdate();
}
}
}),_vm._v(" "),_c("b-input-group-append",[_c("span",{
staticClass:"btn btn-primary btn-sm",
on:{
click:function click($event){
return _vm.increment(detail,detail.detail_id);
}
}
},[_vm._v("+")])])],1)],1)]),_vm._v(" "),_c("td",{
staticClass:"text-center"
},[_vm._v(_vm._s(_vm.currentUser.currency)+"\n                                                                "+_vm._s(_vm.formatNumber(detail.subtotal,2))+"\n                                                            ")]),_vm._v(" "),_c("td",[_c("a",{
attrs:{
title:"Delete"
},
on:{
click:function click($event){
return _vm.delete_Product_Detail(detail.detail_id);
}
}
},[_c("i",{
staticClass:"i-Close-Window text-25 text-danger"
})])])]);
})],2)])])])])],1),_vm._v(" "),_c("div",{
staticClass:"footer_panel"
},[_c("b-row",{
staticClass:"justify-content-end"
},[_c("b-col",{
attrs:{
md:"12"
}
},[_c("div",{
staticClass:"grandtotal"
},[_c("span",[_vm._v(_vm._s(_vm.$t("Total"))+" : "+_vm._s(_vm.currentUser.currency)+" "+_vm._s(_vm.formatNumber(_vm.GrandTotal,2)))])])]),_vm._v(" "),_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Sales_Issue_POS_Discounts")?_c("b-col",{
attrs:{
lg:"4",
md:"4",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Discount",
rules:{
regex:/^\d*\.?\d*$/
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Discount"),
append:"%"
}
},[_c("b-input-group",{
attrs:{
append:"$"
}
},[_c("b-form-input",{
attrs:{
state:_vm.getValidationState(validationContext),
"aria-describedby":"Discount-feedback",
label:"Discount"
},
on:{
keyup:function keyup($event){
return _vm.keyup_Discount();
}
},
model:{
value:_vm.sale.discount,
callback:function callback($$v){
_vm.$set(_vm.sale,"discount",_vm._n($$v));
},
expression:"sale.discount"
}
})],1),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Discount-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                                        ")])],1)];
}
}],null,false,2059826772)
})],1):_vm._e(),_vm._v(" "),_vm._e()],1),_vm._v(" "),_c("b-row",[_c("b-col",{
attrs:{
md:"4",
sm:"12"
}
},[_c("b-button",{
attrs:{
variant:"danger ripple btn-rounded btn-block mt-1"
},
on:{
click:function click($event){
return _vm.Reset_Pos();
}
}
},[_c("i",{
staticClass:"i-Power-2"
}),_vm._v("\n                                                    "+_vm._s(_vm.$t("Reset"))+"\n                                                ")])],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"4",
sm:"12"
}
},[_c("b-button",{
attrs:{
variant:"info ripple btn-rounded btn-block mt-1"
},
on:{
click:function click($event){
return _vm.Hold_Pos();
}
}
},[_c("i",{
staticClass:"i-Power-2"
}),_vm._v("\n                                                    "+_vm._s("Hold Sale")+"\n                                                ")])],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"4",
sm:"12"
}
},[_c("b-button",{
attrs:{
type:"submit",
variant:"primary ripple mt-1 btn-rounded btn-block"
}
},[_c("i",{
staticClass:"i-Checkout"
}),_vm._v("\n                                                    "+_vm._s(_vm.$t("payNow"))+"\n                                                ")])],1)],1),_vm._v(" "),_c("br"),_vm._v(" "),_c("br"),_vm._v(" "),_c("b-row",[_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("b-button",{
attrs:{
variant:"success ripple btn-rounded btn-block mt-1"
},
on:{
click:function click($event){
return _vm.Held_List();
}
}
},[_c("i",{
staticClass:"i-Power-2"
}),_vm._v("\n                                                    "+_vm._s("Held Sales")+"\n                                                ")])],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("b-button",{
attrs:{
variant:"danger ripple btn-rounded btn-block mt-1"
},
on:{
click:function click($event){
return _vm.deleteHeldSale();
}
}
},[_c("i",{
staticClass:"i-Power-2"
}),_vm._v("\n                                                    "+_vm._s("Delete Held Sale")+"\n                                                ")])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("validation-observer",{
ref:"Update_Detail"
},[_c("b-modal",{
attrs:{
"hide-footer":"",
size:"md",
id:"form_Update_Detail",
title:_vm.detail.name
}
},[_c("b-form",{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.submit_Update_Detail.apply(null,arguments);
}
}
},[_c("b-row",[_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Product Price",
rules:{
required:true,
regex:/^\d*\.?\d*$/
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("ProductPrice"),
id:"Price-input"
}
},[_c("b-form-input",{
attrs:{
label:"Product Price",
state:_vm.getValidationState(validationContext),
"aria-describedby":"Price-feedback"
},
model:{
value:_vm.detail.Unit_price,
callback:function callback($$v){
_vm.$set(_vm.detail,"Unit_price",$$v);
},
expression:"detail.Unit_price"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Price-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                                    ")])],1)];
}
}],null,false,813404191)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Tax Method",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(_ref3){
var valid=_ref3.valid,
errors=_ref3.errors;
return _c("b-form-group",{
attrs:{
label:_vm.$t("TaxMethod")
}
},[_c("v-select",{
"class":{
"is-invalid":!!errors.length
},
attrs:{
state:errors[0]?false:valid?true:null,
reduce:function reduce(label){
return label.value;
},
placeholder:_vm.$t("Choose_Method"),
options:[{
label:"Exclusive",
value:"1"
},{
label:"Inclusive",
value:"2"
}]
},
model:{
value:_vm.detail.tax_method,
callback:function callback($$v){
_vm.$set(_vm.detail,"tax_method",$$v);
},
expression:"detail.tax_method"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",[_vm._v(_vm._s(errors[0]))])],1);
}
}],null,false,196551621)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Tax",
rules:{
required:true,
regex:/^\d*\.?\d*$/
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Tax")
}
},[_c("b-input-group",{
attrs:{
append:"%"
}
},[_c("b-form-input",{
attrs:{
label:"Tax",
state:_vm.getValidationState(validationContext),
"aria-describedby":"Tax-feedback"
},
model:{
value:_vm.detail.tax_percent,
callback:function callback($$v){
_vm.$set(_vm.detail,"tax_percent",$$v);
},
expression:"detail.tax_percent"
}
})],1),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Tax-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                                    ")])],1)];
}
}],null,false,1247220265)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Discount Method",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(_ref4){
var valid=_ref4.valid,
errors=_ref4.errors;
return _c("b-form-group",{
attrs:{
label:_vm.$t("Discount_Method")
}
},[_c("v-select",{
"class":{
"is-invalid":!!errors.length
},
attrs:{
reduce:function reduce(label){
return label.value;
},
placeholder:_vm.$t("Choose_Method"),
state:errors[0]?false:valid?true:null,
options:[{
label:"Percent %",
value:"1"
},{
label:"Fixed",
value:"2"
}]
},
model:{
value:_vm.detail.discount_Method,
callback:function callback($$v){
_vm.$set(_vm.detail,"discount_Method",$$v);
},
expression:"detail.discount_Method"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",[_vm._v(_vm._s(errors[0]))])],1);
}
}],null,false,1724974344)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Discount Rate",
rules:{
required:true,
regex:/^\d*\.?\d*$/
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Discount")
}
},[_c("b-form-input",{
attrs:{
label:"Discount",
state:_vm.getValidationState(validationContext),
"aria-describedby":"Discount-feedback"
},
model:{
value:_vm.detail.discount,
callback:function callback($$v){
_vm.$set(_vm.detail,"discount",$$v);
},
expression:"detail.discount"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Discount-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                                    ")])],1)];
}
}],null,false,3707719099)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"12"
}
},[_c("b-form-group",[_c("b-button",{
attrs:{
variant:"primary",
type:"submit"
}
},[_vm._v(_vm._s(_vm.$t("submit")))])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-modal",{
attrs:{
"hide-footer":"",
size:"md",
id:"form_held_item_update",
title:_vm.heldItemComment.user
}
},[_c("b-form",{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.submit_held_comment_update.apply(null,arguments);
}
}
},[_c("b-row",[_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("p",[_vm._v("ID "+_vm._s(_vm.heldItemComment.id))]),_vm._v(" "),_c("p",[_vm._v("Total "+_vm._s(_vm.heldItemComment.total))]),_vm._v(" "),_c("p",[_vm._v("Client "+_vm._s(_vm.heldItemComment.client))])]),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("b-form-group",{
attrs:{
label:_vm.Comment,
id:"Comment-input"
}
},[_c("b-form-input",{
attrs:{
label:"Product Price"
},
model:{
value:_vm.heldItemComment.comment,
callback:function callback($$v){
_vm.$set(_vm.heldItemComment,"comment",$$v);
},
expression:"heldItemComment.comment"
}
})],1)],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"12"
}
},[_c("b-form-group",[_c("b-button",{
attrs:{
variant:"primary",
type:"submit"
}
},[_vm._v(_vm._s("Update Comment"))])],1)],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"7"
}
},[_c("b-card",{
staticClass:"list-grid"
},[_c("b-row",[_c("b-col",{
attrs:{
md:"6"
}
},[_c("button",{
directives:[{
name:"b-toggle",
rawName:"v-b-toggle.sidebar-category",
modifiers:{
"sidebar-category":true
}
}],
staticClass:"btn btn-outline-info mt-1 btn-block"
},[_c("i",{
staticClass:"i-Two-Windows"
}),_vm._v("\n                                    "+_vm._s(_vm.$t("ListofCategory"))+"\n                                ")])]),_vm._v(" "),_c("b-col",{
attrs:{
md:"6"
}
},[_c("button",{
directives:[{
name:"b-toggle",
rawName:"v-b-toggle.sidebar-brand",
modifiers:{
"sidebar-brand":true
}
}],
staticClass:"btn btn-outline-info mt-1 btn-block"
},[_c("i",{
staticClass:"i-Library"
}),_vm._v("\n                                    "+_vm._s(_vm.$t("ListofBrand"))+"\n                                ")])]),_vm._v(" "),_c("b-col",{
staticClass:"mt-2 mb-2 sticky-top",
attrs:{
md:"12"
}
},[_c("autocomplete",{
ref:"autocomplete",
attrs:{
search:_vm.search,
placeholder:_vm.$t("Scan_Search_Product_by_Code_Name"),
"aria-label":"Search for a Product",
"get-result-value":_vm.getResultValue,
"debounce-time":1000
},
on:{
submit:_vm.Submit_SearchProduct
}
})],1),_vm._v(" "),_c("div",{
staticClass:"col-md-12 d-flex flex-row flex-wrap bd-highlight list-item mt-2"
},[_vm.display=="list"?_c("table",{
staticClass:"table table-striped"
},[_c("thead",[_c("tr",[_c("th",[_vm._v("Code")]),_vm._v(" "),_c("th",[_vm._v("Product")]),_vm._v(" "),_c("th",[_vm._v("Stock Quantity")]),_vm._v(" "),_c("th",[_vm._v("Unit Price")])])]),_vm._v(" "),_c("tbody",_vm._l(_vm.products,function(product){
return _c("tr",{
on:{
click:function click($event){
return _vm.Check_Product_Exist(product,product.id);
}
}
},[_c("td",[_vm._v(_vm._s(product.code))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(product.name))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(_vm.formatNumber(product.qte_sale,2))+" "+_vm._s(product.unitSale))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(_vm.currentUser.currency)+" "+_vm._s(_vm.formatNumber(product.Net_price,2)))])]);
}),0)]):_vm._e(),_vm._v(" "),_vm._l(_vm.products,function(product){
return _vm.display=="grid"?_c("div",{
staticClass:"card o-hidden bd-highlight m-1",
on:{
click:function click($event){
return _vm.Check_Product_Exist(product,product.id);
}
}
},[_c("div",{
staticClass:"list-thumb d-flex"
},[_c("img",{
attrs:{
alt:"",
src:"/images/products/"+product.image
}
})]),_vm._v(" "),_c("div",{
staticClass:"flex-grow-1 d-bock"
},[_c("div",{
staticClass:"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"
},[_c("div",{
staticClass:"w-40 w-sm-100 item-title"
},[_vm._v(_vm._s(product.name))]),_vm._v(" "),_c("p",{
staticClass:"text-muted text-small w-15 w-sm-100 mb-2"
},[_vm._v(_vm._s(product.code))]),_vm._v(" "),_c("span",{
staticClass:"badge badge-primary w-15 w-sm-100 mb-2"
},[_vm._v(_vm._s(_vm.currentUser.currency)+" "+_vm._s(_vm.formatNumber(product.Net_price,2)))]),_vm._v(" "),_c("p",{
staticClass:"m-0 text-muted text-small w-15 w-sm-100 d-none d-lg-block item-badges"
},[_c("span",{
staticClass:"badge badge-info"
},[_vm._v(_vm._s(_vm.formatNumber(product.qte_sale,2))+" "+_vm._s(product.unitSale))])])])])]):_vm._e();
})],2)],1),_vm._v(" "),_c("b-row",[_c("b-col",{
staticClass:"mt-4",
attrs:{
md:"12"
}
},[_c("b-pagination",{
staticClass:"my-0 gull-pagination align-items-center",
attrs:{
"total-rows":_vm.product_totalRows,
"per-page":_vm.product_perPage,
align:"center",
"first-text":"",
"last-text":""
},
on:{
change:_vm.Product_onPageChanged
},
model:{
value:_vm.product_currentPage,
callback:function callback($$v){
_vm.product_currentPage=$$v;
},
expression:"product_currentPage"
}
},[_c("p",{
staticClass:"list-arrow m-0",
attrs:{
slot:"prev-text"
},
slot:"prev-text"
},[_c("i",{
staticClass:"i-Arrow-Left text-40"
})]),_vm._v(" "),_c("p",{
staticClass:"list-arrow m-0",
attrs:{
slot:"next-text"
},
slot:"next-text"
},[_c("i",{
staticClass:"i-Arrow-Right text-40"
})])])],1)],1)],1)],1),_vm._v(" "),_c("b-sidebar",{
attrs:{
id:"sidebar-brand",
title:_vm.$t("ListofBrand"),
"bg-variant":"white",
right:"",
shadow:""
}
},[_c("div",{
staticClass:"px-3 py-2"
},[_c("b-row",[_c("div",{
staticClass:"col-md-12 d-flex flex-row flex-wrap bd-highlight list-item mt-2"
},[_c("div",{
staticClass:"card o-hidden bd-highlight m-1",
"class":{
"brand-Active":_vm.brand_id==""
},
on:{
click:function click($event){
return _vm.GetAllBrands();
}
}
},[_c("div",{
staticClass:"list-thumb d-flex"
},[_c("img",{
attrs:{
alt:"",
src:"/images/no-image.png"
}
})]),_vm._v(" "),_c("div",{
staticClass:"flex-grow-1 d-bock"
},[_c("div",{
staticClass:"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"
},[_c("div",{
staticClass:"item-title"
},[_vm._v(_vm._s(_vm.$t("All_Brand")))])])])]),_vm._v(" "),_vm._l(_vm.paginated_Brands,function(brand){
return _c("div",{
key:brand.id,
staticClass:"card o-hidden bd-highlight m-1",
"class":{
"brand-Active":brand.id===_vm.brand_id
},
on:{
click:function click($event){
return _vm.Products_by_Brands(brand.id);
}
}
},[_c("img",{
attrs:{
alt:"",
src:"/images/brands/"+brand.image
}
}),_vm._v(" "),_c("div",{
staticClass:"flex-grow-1 d-bock"
},[_c("div",{
staticClass:"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"
},[_c("div",{
staticClass:"item-title"
},[_vm._v(_vm._s(brand.name))])])])]);
})],2)]),_vm._v(" "),_c("b-row",[_c("b-col",{
staticClass:"mt-4",
attrs:{
md:"12"
}
},[_c("b-pagination",{
staticClass:"my-0 gull-pagination align-items-center",
attrs:{
"total-rows":_vm.brand_totalRows,
"per-page":_vm.brand_perPage,
align:"center",
"first-text":"",
"last-text":""
},
on:{
change:_vm.BrandonPageChanged
},
model:{
value:_vm.brand_currentPage,
callback:function callback($$v){
_vm.brand_currentPage=$$v;
},
expression:"brand_currentPage"
}
},[_c("p",{
staticClass:"list-arrow m-0",
attrs:{
slot:"prev-text"
},
slot:"prev-text"
},[_c("i",{
staticClass:"i-Arrow-Left text-40"
})]),_vm._v(" "),_c("p",{
staticClass:"list-arrow m-0",
attrs:{
slot:"next-text"
},
slot:"next-text"
},[_c("i",{
staticClass:"i-Arrow-Right text-40"
})])])],1)],1)],1)]),_vm._v(" "),_c("b-sidebar",{
attrs:{
id:"sidebar-category",
title:_vm.$t("ListofCategory"),
"bg-variant":"white",
right:"",
shadow:""
}
},[_c("div",{
staticClass:"px-3 py-2"
},[_c("b-row",[_c("div",{
staticClass:"col-md-12 d-flex flex-row flex-wrap bd-highlight list-item mt-2"
},[_c("div",{
staticClass:"card o-hidden bd-highlight m-1",
"class":{
"brand-Active":_vm.category_id==""
},
on:{
click:function click($event){
return _vm.getAllCategory();
}
}
},[_c("div",{
staticClass:"list-thumb d-flex"
},[_c("img",{
attrs:{
alt:"",
src:"/images/no-image.png"
}
})]),_vm._v(" "),_c("div",{
staticClass:"flex-grow-1 d-bock"
},[_c("div",{
staticClass:"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"
},[_c("div",{
staticClass:"item-title"
},[_vm._v(_vm._s(_vm.$t("All_Category")))])])])]),_vm._v(" "),_vm._l(_vm.paginated_Category,function(category){
return _c("div",{
key:category.id,
staticClass:"card o-hidden bd-highlight m-1",
"class":{
"brand-Active":category.id===_vm.category_id
},
on:{
click:function click($event){
return _vm.Products_by_Category(category.id);
}
}
},[_c("img",{
attrs:{
alt:"",
src:"/images/no-image.png"
}
}),_vm._v(" "),_c("div",{
staticClass:"flex-grow-1 d-bock"
},[_c("div",{
staticClass:"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"
},[_c("div",{
staticClass:"item-title"
},[_vm._v(_vm._s(category.name))])])])]);
})],2)]),_vm._v(" "),_c("b-row",[_c("b-col",{
staticClass:"mt-4",
attrs:{
md:"12"
}
},[_c("b-pagination",{
staticClass:"my-0 gull-pagination align-items-center",
attrs:{
"total-rows":_vm.category_totalRows,
"per-page":_vm.category_perPage,
align:"center",
"first-text":"",
"last-text":""
},
on:{
change:_vm.Category_onPageChanged
},
model:{
value:_vm.category_currentPage,
callback:function callback($$v){
_vm.category_currentPage=$$v;
},
expression:"category_currentPage"
}
},[_c("p",{
staticClass:"list-arrow m-0",
attrs:{
slot:"prev-text"
},
slot:"prev-text"
},[_c("i",{
staticClass:"i-Arrow-Left text-40"
})]),_vm._v(" "),_c("p",{
staticClass:"list-arrow m-0",
attrs:{
slot:"next-text"
},
slot:"next-text"
},[_c("i",{
staticClass:"i-Arrow-Right text-40"
})])])],1)],1)],1)]),_vm._v(" "),_c("b-modal",{
attrs:{
"hide-footer":"",
size:"md",
scrollable:"",
id:"Show_invoice",
title:_vm.$t("Invoice_POS")
}
},[_c("vue-easy-print",{
ref:"Show_invoice",
attrs:{
"table-show":""
}
},[_c("div",{
staticStyle:{
"max-width":"96%"
},
attrs:{
id:"invoice-POS"
}
},[_c("center",{
attrs:{
id:"top"
}
},[_c("div",{
staticClass:"logo"
},[_c("img",{
attrs:{
src:"/images/"+_vm.invoice_pos.setting.logo
}
})]),_vm._v(" "),_c("div",{
staticClass:"info"
},[_c("h2",[_vm._v(_vm._s(_vm.invoice_pos.setting.CompanyName))])])]),_vm._v(" "),_c("div",{
staticClass:"info"
},[_c("h6",{
staticClass:"text-center"
},[_vm._v(_vm._s(_vm.$t("Phone"))+" : "+_vm._s(_vm.invoice_pos.setting.CompanyPhone))]),_vm._v(" "),_c("h6",{
staticClass:"text-center"
},[_vm._v(_vm._s(_vm.invoice_pos.setting.CompanyAdress))]),_vm._v(" "),_c("h5",{
staticClass:"text-center"
},[_vm._v("Business No. 522533  Account No. 7842949")])]),_vm._v(" "),_c("table",{
staticClass:"mt-3 ml-2 table-md"
},[_c("thead",[_c("tr",[_c("th",{
attrs:{
scope:"col"
}
},[_vm._v(_vm._s(_vm.$t("ProductName")))]),_vm._v(" "),_c("th",{
attrs:{
scope:"col"
}
},[_vm._v(_vm._s(_vm.$t("Qty")))]),_vm._v(" "),_c("th",{
staticClass:"text-right",
attrs:{
scope:"col"
}
},[_vm._v(_vm._s(_vm.$t("SubTotal")))])])]),_vm._v(" "),_c("tbody",_vm._l(_vm.invoice_pos.details,function(detail_invoice){
return _c("tr",[_c("td",{
staticClass:"py-2"
},[_vm._v(_vm._s(detail_invoice.name))]),_vm._v(" "),_c("td",{
staticClass:"py-2"
},[_vm._v(_vm._s(_vm.formatNumber(detail_invoice.quantity,2)))]),_vm._v(" "),_c("td",{
staticClass:"py-2 text-right"
},[_vm._v(_vm._s(_vm.formatNumber(detail_invoice.total,2)))])]);
}),0)]),_vm._v(" "),_c("table",{
staticClass:"mt-2 ml-2",
attrs:{
id:"total"
}
},[_c("tbody",[_c("tr",[_c("th",{
staticClass:"p-1 w-75"
},[_vm._v(_vm._s(_vm.$t("Total")))]),_vm._v(" "),_c("th",{
staticClass:"p-1 w-25 text-right"
},[_vm._v(_vm._s(_vm.invoice_pos.symbol)+" "+_vm._s(_vm.formatNumber(_vm.invoice_pos.sale.GrandTotal,2))+"\n                                    ")])])])]),_vm._v(" "),_c("div",{
staticClass:"ml-2",
attrs:{
id:"legalcopy"
}
},[_c("p",{
staticClass:"legal"
},[_c("strong",[_vm._v(_vm._s(_vm.$t("Thank_you_for_your_business")))])]),_vm._v(" "),_c("p",{
staticClass:"legal"
},[_c("strong",[_vm._v("Served By "+_vm._s(_vm.currentUser.username))])]),_vm._v(" "),_c("p",{
staticClass:"legal"
},[_c("strong",[_vm._v("Time: "+_vm._s(_vm.formatAMPM(new Date())))]),_vm._v(" "),_c("br"),_vm._v(" "),_c("strong",[_vm._v("Date: "+_vm._s(_vm.invoice_pos.sale.date))])]),_vm._v(" "),_c("div",{
staticClass:"mb-4",
attrs:{
id:"bar"
}
},[_c("barcode",{
staticClass:"barcode",
attrs:{
format:_vm.barcodeFormat,
value:_vm.invoice_pos.sale.Ref,
textmargin:"0",
fontoptions:"bold",
height:"25"
}
})],1)])],1)]),_vm._v(" "),_c("button",{
staticClass:"btn btn-outline-primary",
on:{
click:function click($event){
return _vm.print_pos();
}
}
},[_c("i",{
staticClass:"i-Billing"
}),_vm._v("\n                        "+_vm._s(_vm.$t("print"))+"\n                    ")])],1),_vm._v(" "),_c("b-modal",{
attrs:{
"hide-footer":"",
size:"lg",
scrollable:"",
id:"Show_held_items",
title:"Held Items"
}
},[_c("table",{
staticClass:"table table-striped"
},[_c("thead",[_c("tr",[_c("th",[_vm._v("ID")]),_vm._v(" "),_c("th",[_vm._v("User")]),_vm._v(" "),_c("th",[_vm._v("Customer")]),_vm._v(" "),_c("th",[_vm._v("Items")]),_vm._v(" "),_c("th",[_vm._v("Created At")]),_vm._v(" "),_c("th",[_vm._v("Total")]),_vm._v(" "),_c("th",[_vm._v("Comment")]),_vm._v(" "),_c("th"),_vm._v(" "),_c("th")])]),_vm._v(" "),_c("tbody",_vm._l(_vm.held_items,function(item,index){
return _c("tr",{
key:index
},[_c("td",[_vm._v(_vm._s(item.id))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(item.user))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(item.client.name))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(item.number_items))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(item.created_at))]),_vm._v(" "),_c("td",[_vm._v(_vm._s(item.total))]),_vm._v(" "),_c("td",[_c("i",{
staticClass:"i-Edit",
on:{
click:function click($event){
return _vm.Modal_Update_Held_Item_Comment(item);
}
}
}),_vm._v(" "+_vm._s(item.comment)+"\n                            ")]),_vm._v(" "),_c("td",[_c("button",{
staticClass:"btn btn-success btn-sm",
on:{
click:function click($event){
return _vm.populateHoldItemsToPOS(item.id);
}
}
},[_vm._v("Select")])]),_vm._v(" "),_c("td",[_c("button",{
staticClass:"btn btn-danger btn-sm",
on:{
click:function click($event){
return _vm.deleteHeldItemBtn(item.id);
}
}
},[_vm._v("Delete")])])]);
}),0)])]),_vm._v(" "),_c("validation-observer",{
ref:"Add_payment"
},[_c("b-modal",{
attrs:{
"hide-footer":"",
size:"lg",
id:"Add_Payment",
title:_vm.$t("AddPayment")
}
},[_c("b-form",{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.Submit_Payment.apply(null,arguments);
}
}
},[_c("b-row",[_c("b-col",{
attrs:{
md:"6"
}
},[_c("b-row",[_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Amount",
rules:{
required:true,
regex:/^\d*\.?\d*$/
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Amount")
}
},[_c("b-form-input",{
attrs:{
label:"Amount",
placeholder:_vm.$t("Amount"),
state:_vm.getValidationState(validationContext),
"aria-describedby":"Amount-feedback"
},
model:{
value:_vm.payment.amount,
callback:function callback($$v){
_vm.$set(_vm.payment,"amount",$$v);
},
expression:"payment.amount"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Amount-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                                    ")])],1)];
}
}],null,false,3851020233)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Payment choice",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(_ref5){
var valid=_ref5.valid,
errors=_ref5.errors;
return _c("b-form-group",{
attrs:{
label:_vm.$t("Paymentchoice")
}
},[_c("v-select",{
"class":{
"is-invalid":!!errors.length
},
attrs:{
state:errors[0]?false:valid?true:null,
reduce:function reduce(label){
return label.value;
},
placeholder:_vm.$t("PleaseSelect"),
options:[{
label:"Cash",
value:"Cash"
},{
label:"Mpesa",
value:"Mpesa"
},{
label:"Credit",
value:"Credit"
},
// {label: 'credit card', value: 'credit card'},
// {label: 'cheque', value: 'cheque'},
// {label: 'Western Union', value: 'Western Union'},
// {label: 'bank transfer', value: 'bank transfer'},
{
label:"other",
value:"other"
}]
},
on:{
input:_vm.Selected_PaymentMethod
},
model:{
value:_vm.payment.Reglement,
callback:function callback($$v){
_vm.$set(_vm.payment,"Reglement",$$v);
},
expression:"payment.Reglement"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",[_vm._v(_vm._s(errors[0]))])],1);
}
}],null,false,388583275)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Tendered",
rules:{
required:true,
regex:/^\d*\.?\d*$/
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:"Tendered"
}
},[_c("b-form-input",{
attrs:{
label:"Tendered",
placeholder:_vm.Tendered,
state:_vm.getValidationState(validationContext),
"aria-describedby":"Tendered-feedback"
},
model:{
value:_vm.tendered,
callback:function callback($$v){
_vm.tendered=$$v;
},
expression:"tendered"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Tendered-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                                    ")])],1)];
}
}],null,false,1028832873)
})],1),_vm._v(" "),_vm.payment.Reglement=="credit card"?_c("b-col",{
attrs:{
md:"12"
}
},[_c("form",{
attrs:{
id:"payment-form"
}
},[_c("label",{
staticClass:"leading-7 text-sm text-gray-600",
attrs:{
"for":"card-element"
}
},[_vm._v(_vm._s(_vm.$t("Credit_Card_Info")))]),_vm._v(" "),_c("div",{
attrs:{
id:"card-element"
}
}),_vm._v(" "),_c("div",{
staticClass:"is-invalid",
attrs:{
id:"card-errors",
role:"alert"
}
})])]):_vm._e(),_vm._v(" "),_c("b-col",{
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Print receipt",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(_ref6){
var valid=_ref6.valid,
errors=_ref6.errors;
return _c("b-form-group",{
attrs:{
label:_vm.$t("PrintReceipt")
}
},[_c("v-select",{
"class":{
"is-invalid":!!errors.length
},
attrs:{
state:errors[0]?false:valid?true:null,
reduce:function reduce(label){
return label.value;
},
placeholder:_vm.$t("PleaseSelect"),
options:[{
label:"Yes",
value:"1"
},{
label:"No",
value:"2"
}]
},
on:{
input:_vm.Selected_PaymentMethod
},
model:{
value:_vm.payment.print_receipt,
callback:function callback($$v){
_vm.$set(_vm.payment,"print_receipt",$$v);
},
expression:"payment.print_receipt"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",[_vm._v(_vm._s(errors[0]))])],1);
}
}],null,false,3579603555)
})],1),_vm._v(" "),_c("b-col",{
staticClass:"mt-2",
attrs:{
lg:"12",
md:"12",
sm:"12"
}
},[_c("b-form-group",{
attrs:{
label:_vm.$t("Note")
}
},[_c("b-form-textarea",{
attrs:{
id:"textarea",
rows:"3",
"max-rows":"6"
},
model:{
value:_vm.payment.notes,
callback:function callback($$v){
_vm.$set(_vm.payment,"notes",$$v);
},
expression:"payment.notes"
}
})],1)],1)],1)],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"6"
}
},[_c("b-card",[_c("b-list-group",[_c("b-list-group-item",{
staticClass:"d-flex justify-content-between align-items-center"
},[_vm._v("\n                                                "+_vm._s(_vm.$t("TotalProducts"))+"\n                                                "),_c("b-badge",{
attrs:{
variant:"primary",
pill:""
}
},[_vm._v(_vm._s(_vm.details.length))])],1),_vm._v(" "),_c("b-list-group-item",{
staticClass:"d-flex justify-content-between align-items-center"
},[_vm._v("\n                                                "+_vm._s(_vm.$t("OrderTax"))+"\n                                                "),_c("span",{
staticClass:"font-weight-bold"
},[_vm._v(_vm._s(_vm.currentUser.currency)+" "+_vm._s(_vm.formatNumber(_vm.sale.TaxNet,2))+" ("+_vm._s(_vm.sale.tax_rate)+" %)")])]),_vm._v(" "),_c("b-list-group-item",{
staticClass:"d-flex justify-content-between align-items-center"
},[_vm._v("\n                                                "+_vm._s(_vm.$t("Discount"))+"\n                                                "),_c("span",{
staticClass:"font-weight-bold"
},[_vm._v(_vm._s(_vm.currentUser.currency)+" "+_vm._s(_vm.formatNumber(_vm.sale.discount,2)))])]),_vm._v(" "),_c("b-list-group-item",{
staticClass:"d-flex justify-content-between align-items-center"
},[_vm._v("\n                                                "+_vm._s(_vm.$t("Total"))+"\n                                                "),_c("span",{
staticClass:"font-weight-bold"
},[_vm._v(_vm._s(_vm.currentUser.currency)+" "+_vm._s(_vm.formatNumber(_vm.GrandTotal,2)))])]),_vm._v(" "),_c("b-list-group-item",{
staticClass:"d-flex justify-content-between align-items-center"
},[_vm._v("\n                                                Tendered\n                                                "),_c("span",{
staticClass:"font-weight-bold"
},[_vm._v(_vm._s(_vm.tendered===0?_vm.GrandTotal:_vm.tendered))])]),_vm._v(" "),_c("b-list-group-item",{
staticClass:"d-flex justify-content-between align-items-center"
},[_vm._v("\n                                                Change\n                                                "),_c("span",{
staticClass:"font-weight-bold"
},[_vm._v(_vm._s(_vm.totalChange))])])],1)],1)],1),_vm._v(" "),_c("b-col",{
staticClass:"mt-3",
attrs:{
md:"12"
}
},[_c("b-button",{
attrs:{
variant:"primary",
type:"submit",
disabled:_vm.paymentProcessing
}
},[_vm._v("\n                                        "+_vm._s(_vm.$t("submit"))+"\n                                    ")]),_vm._v(" "),_vm.paymentProcessing?_vm._m(0):_vm._e()],1)],1)],1)],1)],1),_vm._v(" "),_c("validation-observer",{
ref:"Create_Customer"
},[_c("b-modal",{
attrs:{
"hide-footer":"",
size:"lg",
id:"New_Customer",
title:_vm.$t("Add")
}
},[_c("b-form",{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.Submit_Customer.apply(null,arguments);
}
}
},[_c("b-row",[_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Name Customer",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("CustomerName")
}
},[_c("b-form-input",{
attrs:{
state:_vm.getValidationState(validationContext),
"aria-describedby":"name-feedback",
label:"name"
},
model:{
value:_vm.client.name,
callback:function callback($$v){
_vm.$set(_vm.client,"name",$$v);
},
expression:"client.name"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"name-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                            ")])],1)];
}
}],null,false,2769540653)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Email customer",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Email")
}
},[_c("b-form-input",{
attrs:{
state:_vm.getValidationState(validationContext),
"aria-describedby":"Email-feedback",
label:"Email"
},
model:{
value:_vm.client.email,
callback:function callback($$v){
_vm.$set(_vm.client,"email",$$v);
},
expression:"client.email"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Email-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                            ")])],1)];
}
}],null,false,576371810)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Phone Customer",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Phone")
}
},[_c("b-form-input",{
attrs:{
state:_vm.getValidationState(validationContext),
"aria-describedby":"Phone-feedback",
label:"Phone"
},
model:{
value:_vm.client.phone,
callback:function callback($$v){
_vm.$set(_vm.client,"phone",$$v);
},
expression:"client.phone"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Phone-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                            ")])],1)];
}
}],null,false,1183270642)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Country customer",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Country")
}
},[_c("b-form-input",{
attrs:{
state:_vm.getValidationState(validationContext),
"aria-describedby":"Country-feedback",
label:"Country"
},
model:{
value:_vm.client.country,
callback:function callback($$v){
_vm.$set(_vm.client,"country",$$v);
},
expression:"client.country"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Country-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                            ")])],1)];
}
}],null,false,3355505414)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"City Customer",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("City")
}
},[_c("b-form-input",{
attrs:{
state:_vm.getValidationState(validationContext),
"aria-describedby":"City-feedback",
label:"City"
},
model:{
value:_vm.client.city,
callback:function callback($$v){
_vm.$set(_vm.client,"city",$$v);
},
expression:"client.city"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"City-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                            ")])],1)];
}
}],null,false,2744926377)
})],1),_vm._v(" "),_c("b-col",{
attrs:{
md:"6",
sm:"12"
}
},[_c("validation-provider",{
attrs:{
name:"Adress customer",
rules:{
required:true
}
},
scopedSlots:_vm._u([{
key:"default",
fn:function fn(validationContext){
return [_c("b-form-group",{
attrs:{
label:_vm.$t("Adress")
}
},[_c("b-form-input",{
attrs:{
state:_vm.getValidationState(validationContext),
"aria-describedby":"Adress-feedback",
label:"Adress"
},
model:{
value:_vm.client.adresse,
callback:function callback($$v){
_vm.$set(_vm.client,"adresse",$$v);
},
expression:"client.adresse"
}
}),_vm._v(" "),_c("b-form-invalid-feedback",{
attrs:{
id:"Adress-feedback"
}
},[_vm._v(_vm._s(validationContext.errors[0])+"\n                                            ")])],1)];
}
}],null,false,2726480185)
})],1),_vm._v(" "),_c("b-col",{
staticClass:"mt-3",
attrs:{
md:"12"
}
},[_c("b-button",{
attrs:{
variant:"primary",
type:"submit"
}
},[_vm._v(_vm._s(_vm.$t("submit")))])],1)],1)],1)],1)],1)],1):_vm._e()],1)]);
};
var staticRenderFns=[function(){
var _vm=this,
_c=_vm._self._c;
return _c("div",{
staticClass:"typo__p"
},[_c("div",{
staticClass:"spinner sm spinner-primary mt-3"
})]);
}];
render._withStripped=true;


/***/}),

/***/"./resources/src/utils/index.js":(
/*!**************************************!*\
  !*** ./resources/src/utils/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/function resourcesSrcUtilsIndexJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
var toggleFullScreen=function toggleFullScreen(){
var doc=window.document;
var docEl=doc.documentElement;
var requestFullScreen=docEl.requestFullscreen||docEl.mozRequestFullScreen||docEl.webkitRequestFullScreen||docEl.msRequestFullscreen;
var cancelFullScreen=doc.exitFullscreen||doc.mozCancelFullScreen||doc.webkitExitFullscreen||doc.msExitFullscreen;
if(!doc.fullscreenElement&&!doc.mozFullScreenElement&&!doc.webkitFullscreenElement&&!doc.msFullscreenElement){
requestFullScreen.call(docEl);
}else {
cancelFullScreen.call(doc);
}
};
/* harmony default export */__webpack_exports__["default"]={
toggleFullScreen:toggleFullScreen
};

/***/}),

/***/"./resources/src/views/app/pages/pos.vue":(
/*!***********************************************!*\
  !*** ./resources/src/views/app/pages/pos.vue ***!
  \***********************************************/
/*! exports provided: default */
/***/function resourcesSrcViewsAppPagesPosVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _pos_vue_vue_type_template_id_4cc49487__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./pos.vue?vue&type=template&id=4cc49487 */"./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487");
/* harmony import */var _pos_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./pos.vue?vue&type=script&lang=js */"./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_pos_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
_pos_vue_vue_type_template_id_4cc49487__WEBPACK_IMPORTED_MODULE_0__["render"],
_pos_vue_vue_type_template_id_4cc49487__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
null,
null

);
component.options.__file="resources/src/views/app/pages/pos.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/}),

/***/"./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js":(
/*!***********************************************************************!*\
  !*** ./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/function resourcesSrcViewsAppPagesPosVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./pos.vue?vue&type=script&lang=js */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"];

/***/}),

/***/"./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487":(
/*!*****************************************************************************!*\
  !*** ./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487 ***!
  \*****************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcViewsAppPagesPosVueVueTypeTemplateId4cc49487(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_template_id_4cc49487__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../../../../node_modules/vue-loader/lib??vue-loader-options!./pos.vue?vue&type=template&id=4cc49487 */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_template_id_4cc49487__WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_template_id_4cc49487__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/})

}]);

}());
