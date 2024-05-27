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
var Deno = global_1.Deno;
var versions = process && process.versions || Deno && Deno.version;
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

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

var SPECIES$2 = wellKnownSymbol('species');
var $Array$1 = Array;
var max$1 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
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

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["edit_permission"],{

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=script&lang=js":(
/*!****************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=script&lang=js ***!
  \****************************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcViewsAppPagesSettingsPermissionsEdit_permissionVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! nprogress */"./node_modules/nprogress/nprogress.js");
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_0___default=/*#__PURE__*/__webpack_require__.n(nprogress__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */__webpack_exports__["default"]={
metaInfo:{
title:"Edit Permissions"
},
data:function data(){
return {
isLoading:true,
permissions:[],
role:{
name:"",
description:""
}
};
},
methods:{
//------------- Submit Validation Update Permissions
Submit_Permission:function Submit_Permission(){
var _this=this;
this.$refs.Edit_Permission.validate().then(function(success){
if(!success){
_this.makeToast("danger",_this.$t("Please_fill_the_form_correctly"),_this.$t("Failed"));
}else {
_this.Update_Permission();
}
});
},
//---Validate State Fields
getValidationState:function getValidationState(_ref){
var dirty=_ref.dirty,
validated=_ref.validated,
_ref$valid=_ref.valid,
valid=_ref$valid===void 0?null:_ref$valid;
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
//------------------------ Update Permissions -------------------\\
Update_Permission:function Update_Permission(){
var _this2=this;
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.set(0.1);
var id=this.$route.params.id;
axios.put("roles/".concat(id),{
role:this.role,
permissions:this.permissions
}).then(function(response){
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this2.makeToast("success",_this2.$t("Update.TitleRole"),_this2.$t("Success"));
_this2.$router.push({
name:"groupPermission"
});
_this2.$store.dispatch("refreshUserPermissions");
})["catch"](function(error){
nprogress__WEBPACK_IMPORTED_MODULE_0___default.a.done();
_this2.makeToast("danger",_this2.$t("InvalidData"),_this2.$t("Failed"));
});
},
//---------------------------------------Get Elements Permission Edit ------------------------------\\
GetElements:function GetElements(){
var _this3=this;
var id=this.$route.params.id;
axios.get("roles/".concat(id,"/edit")).then(function(response){
_this3.role=response.data.role;
_this3.permissions=response.data.permissions;
_this3.isLoading=false;
})["catch"](function(response){
setTimeout(function(){
_this3.isLoading=false;
},500);
});
}
},
//end Methods

created:function created(){
this.GetElements();
}
};

/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=template&id=49bd216a":(
/*!**************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=template&id=49bd216a ***!
  \**************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcViewsAppPagesSettingsPermissionsEdit_permissionVueVueTypeTemplateId49bd216a(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){var _vm=this,_c=_vm._self._c;return _c("div",{staticClass:"main-content"},[_c("breadcumb",{attrs:{page:_vm.$t("Edit_Permission"),folder:_vm.$t("Settings")}}),_vm._v(" "),_vm.isLoading?_c("div",{staticClass:"loading_page spinner spinner-primary mr-3"}):_vm._e(),_vm._v(" "),!_vm.isLoading?_c("validation-observer",{ref:"Edit_Permission"},[_c("b-form",{on:{submit:function submit($event){$event.preventDefault();return _vm.Submit_Permission.apply(null,arguments);}}},[_c("b-row",[_c("b-col",{attrs:{lg:"12",md:"12",sm:"12"}},[_c("b-card",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("validation-provider",{attrs:{name:"Role name",rules:{required:true}},scopedSlots:_vm._u([{key:"default",fn:function fn(validationContext){return [_c("b-form-group",{attrs:{label:_vm.$t("RoleName")}},[_c("b-form-input",{attrs:{placeholder:_vm.$t("Enter_Role_Name"),state:_vm.getValidationState(validationContext),"aria-describedby":"Role-feedback"},model:{value:_vm.role.name,callback:function callback($$v){_vm.$set(_vm.role,"name",$$v);},expression:"role.name"}}),_vm._v(" "),_c("b-form-invalid-feedback",{attrs:{id:"Role-feedback"}},[_vm._v(_vm._s(validationContext.errors[0]))])],1)];}}],null,false,1511685217)})],1),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("b-form-group",{attrs:{label:_vm.$t("RoleDescription")}},[_c("b-form-input",{attrs:{placeholder:_vm.$t("Enter_Role_Description")},model:{value:_vm.role.description,callback:function callback($$v){_vm.$set(_vm.role,"description",$$v);},expression:"role.description"}})],1)],1)],1),_vm._v(" "),_c("b-row",{staticClass:"mt-4"},[_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-UserManagement",modifiers:{"panel-UserManagement":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("UserManagement")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-UserManagement ",visible:true,accordion:"my-accordion1",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"users_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"users_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="users_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"users_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"users_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="users_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"users_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"users_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="users_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"users_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"users_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="users_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"record_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"record_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="record_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("ShowAll")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Permissions",modifiers:{"panel-Permissions":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("UserPermissions")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Permissions ",visible:true,accordion:"my-accordion2",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"permissions_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"permissions_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="permissions_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"permissions_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"permissions_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="permissions_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"permissions_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"permissions_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="permissions_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"permissions_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"permissions_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="permissions_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Products",modifiers:{"panel-Products":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Products")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Products",visible:true,accordion:"my-accordion3",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"products_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"products_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="products_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"products_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"products_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="products_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"products_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"products_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="products_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"products_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"products_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="products_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"barcode_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"barcode_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="barcode_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Barcode")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"product_import"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"product_import")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="product_import",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("import_products")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Adjustment",modifiers:{"panel-Adjustment":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("StockAdjustement")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Adjustment",visible:true,accordion:"my-accordion4",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"adjustment_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"adjustment_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="adjustment_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"adjustment_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"adjustment_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="adjustment_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"adjustment_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"adjustment_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="adjustment_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"adjustment_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"adjustment_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="adjustment_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Transfer",modifiers:{"panel-Transfer":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("StockTransfers")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Transfer",visible:true,accordion:"my-accordion5",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"transfer_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"transfer_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="transfer_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"transfer_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"transfer_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="transfer_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"transfer_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"transfer_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="transfer_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"transfer_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"transfer_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="transfer_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Expense",modifiers:{"panel-Expense":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Expenses")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Expense",visible:true,accordion:"my-accordion6",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"expense_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"expense_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="expense_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"expense_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"expense_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="expense_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"expense_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"expense_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="expense_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"expense_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"expense_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="expense_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Sales",modifiers:{"panel-Sales":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Sales")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Sales",visible:true,accordion:"my-accordion7",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Pos_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Pos_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Pos_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("pointofsales")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Purchases",modifiers:{"panel-Purchases":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Purchases")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Purchases",visible:true,accordion:"my-accordion8",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchases_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchases_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchases_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchases_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchases_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchases_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchases_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchases_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchases_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchases_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchases_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchases_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Quotations",modifiers:{"panel-Quotations":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Quotations")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Quotations",visible:true,accordion:"my-accordion9",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Quotations_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Quotations_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Quotations_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Quotations_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Quotations_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Quotations_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Quotations_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Quotations_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Quotations_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Quotations_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Quotations_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Quotations_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Return-Sale",modifiers:{"panel-Return-Sale":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("SalesReturn")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Return-Sale",visible:true,accordion:"my-accordion10",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sale_Returns_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sale_Returns_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sale_Returns_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sale_Returns_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sale_Returns_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sale_Returns_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sale_Returns_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sale_Returns_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sale_Returns_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sale_Returns_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sale_Returns_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sale_Returns_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Return-Purchase",modifiers:{"panel-Return-Purchase":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("PurchasesReturn")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Return-Purchase",visible:true,accordion:"my-accordion11",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchase_Returns_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchase_Returns_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchase_Returns_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchase_Returns_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchase_Returns_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchase_Returns_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchase_Returns_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchase_Returns_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchase_Returns_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Purchase_Returns_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Purchase_Returns_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Purchase_Returns_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Payment-Sales",modifiers:{"panel-Payment-Sales":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("PaymentsSales")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Payment-Sales",visible:true,accordion:"my-accordion12",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_sales_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_sales_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_sales_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_sales_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_sales_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_sales_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_sales_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_sales_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_sales_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_sales_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_sales_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_sales_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Payment-Purchases",modifiers:{"panel-Payment-Purchases":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("PaymentsPurchases")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Payment-Purchases",visible:true,accordion:"my-accordion13",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_purchases_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_purchases_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_purchases_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_purchases_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_purchases_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_purchases_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_purchases_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_purchases_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_purchases_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_purchases_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_purchases_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_purchases_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Payment-Returns",modifiers:{"panel-Payment-Returns":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("PaymentsReturns")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Payment-Returns",visible:true,accordion:"my-accordion14",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_returns_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_returns_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_returns_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_returns_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_returns_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_returns_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_returns_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_returns_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_returns_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"payment_returns_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"payment_returns_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="payment_returns_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Customers",modifiers:{"panel-Customers":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Customers")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Customers",visible:true,accordion:"my-accordion15",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Customers_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Customers_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Customers_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Customers_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Customers_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Customers_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Customers_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Customers_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Customers_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Customers_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Customers_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Customers_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"customers_import"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"customers_import")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="customers_import",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Import_Customers")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Suppliers",modifiers:{"panel-Suppliers":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Suppliers")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Suppliers",visible:true,accordion:"my-accordion16",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Suppliers_view"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Suppliers_view")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Suppliers_view",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("View")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Suppliers_add"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Suppliers_add")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Suppliers_add",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Add")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Suppliers_edit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Suppliers_edit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Suppliers_edit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Edit")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Suppliers_delete"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Suppliers_delete")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Suppliers_delete",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Del")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Suppliers_import"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Suppliers_import")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Suppliers_import",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Import_Suppliers")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Reports",modifiers:{"panel-Reports":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Reports")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Reports",visible:true,accordion:"my-accordion17",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_payments_Sales"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_payments_Sales")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_payments_Sales",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Reports_payments_Sales")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_payments_Purchases"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_payments_Purchases")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_payments_Purchases",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Reports_payments_Purchases")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_payments_Sale_Returns"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_payments_Sale_Returns")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_payments_Sale_Returns",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Reports_payments_Sale_Return")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_payments_purchase_Return"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_payments_purchase_Return")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_payments_purchase_Return",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Reports_payments_Purchase_Return")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_sales"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_sales")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_sales",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("SalesReport")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_purchase"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_purchase")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_purchase",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("PurchasesReport")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_customers"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_customers")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_customers",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("CustomersReport")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_suppliers"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_suppliers")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_suppliers",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("SuppliersReport")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_profit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_profit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_profit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("ProfitandLoss")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Reports_quantity_alerts"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Reports_quantity_alerts")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Reports_quantity_alerts",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("ProductQuantityAlerts")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Warehouse_report"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Warehouse_report")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Warehouse_report",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("WarehouseStockChart")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Settings",modifiers:{"panel-Settings":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v(_vm._s(_vm.$t("Settings")))])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Settings",visible:true,accordion:"my-accordion18",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"setting_system"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"setting_system")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="setting_system",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("SystemSettings")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"category"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"category")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="category",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Categories")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"brand"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"brand")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="brand",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Brand")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"currency"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"currency")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="currency",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Currencies")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"warehouse"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"warehouse")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="warehouse",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Warehouses")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"unit"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"unit")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="unit",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Units")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"backup"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"backup")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="backup",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v(_vm._s(_vm.$t("Backup")))]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"4"}},[_c("b-card",{staticClass:"ul-card__border-radius",attrs:{"no-body":""}},[_c("b-card-header",{staticClass:"p-1",attrs:{"header-tag":"header",role:"tab"}},[_c("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.panel-Settings",modifiers:{"panel-Settings":true}}],staticClass:"card-title mb-0",attrs:{block:"",href:"#",variant:"transparent"}},[_vm._v("Discounts and Pricing")])],1),_vm._v(" "),_c("b-collapse",{attrs:{id:"panel-Settings",visible:true,accordion:"my-accordion18",role:"tabpanel"}},[_c("b-card-body",[_c("b-card-text",[_c("b-row",[_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_Issue_POS_Discounts"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_Issue_POS_Discounts")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_Issue_POS_Discounts",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v("Issue POS Discounts")]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_Change_POS_Pricing"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_Change_POS_Pricing")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_Change_POS_Pricing",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v("Change POS Pricing")]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_Clear_Held_Bill"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_Clear_Held_Bill")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_Clear_Held_Bill",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v("Can clear held bill")]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])]),_vm._v(" "),_c("b-col",{attrs:{md:"6"}},[_c("label",{staticClass:"checkbox checkbox-outline-primary"},[_c("input",{directives:[{name:"model",rawName:"v-model",value:_vm.permissions,expression:"permissions"}],attrs:{type:"checkbox",checked:"",value:"Sales_Delete_Held_Item"},domProps:{checked:Array.isArray(_vm.permissions)?_vm._i(_vm.permissions,"Sales_Delete_Held_Item")>-1:_vm.permissions},on:{change:function change($event){var $$a=_vm.permissions,$$el=$event.target,$$c=$$el.checked?true:false;if(Array.isArray($$a)){var $$v="Sales_Delete_Held_Item",$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.permissions=$$a.concat([$$v]));}else {$$i>-1&&(_vm.permissions=$$a.slice(0,$$i).concat($$a.slice($$i+1)));}}else {_vm.permissions=$$c;}}}}),_vm._v(" "),_c("span",[_vm._v("Can Delete Held Item")]),_vm._v(" "),_c("span",{staticClass:"checkmark"})])])],1)],1)],1)],1)],1)],1)],1),_vm._v(" "),_c("b-col",{attrs:{md:"12"}},[_c("b-form-group",[_c("b-button",{attrs:{variant:"primary",type:"submit"}},[_vm._v(_vm._s(_vm.$t("submit")))])],1)],1)],1)],1)],1)],1)],1):_vm._e()],1);};var staticRenderFns=[];render._withStripped=true;

/***/}),

/***/"./resources/src/views/app/pages/settings/permissions/Edit_permission.vue":(
/*!********************************************************************************!*\
  !*** ./resources/src/views/app/pages/settings/permissions/Edit_permission.vue ***!
  \********************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcViewsAppPagesSettingsPermissionsEdit_permissionVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _Edit_permission_vue_vue_type_template_id_49bd216a__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./Edit_permission.vue?vue&type=template&id=49bd216a */"./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=template&id=49bd216a");
/* harmony import */var _Edit_permission_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./Edit_permission.vue?vue&type=script&lang=js */"./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_Edit_permission_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
_Edit_permission_vue_vue_type_template_id_49bd216a__WEBPACK_IMPORTED_MODULE_0__["render"],
_Edit_permission_vue_vue_type_template_id_49bd216a__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
null,
null

);
component.options.__file="resources/src/views/app/pages/settings/permissions/Edit_permission.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/}),

/***/"./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=script&lang=js":(
/*!********************************************************************************************************!*\
  !*** ./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=script&lang=js ***!
  \********************************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcViewsAppPagesSettingsPermissionsEdit_permissionVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Edit_permission_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../../../node_modules/vue-loader/lib??vue-loader-options!./Edit_permission.vue?vue&type=script&lang=js */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Edit_permission_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"];

/***/}),

/***/"./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=template&id=49bd216a":(
/*!**************************************************************************************************************!*\
  !*** ./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=template&id=49bd216a ***!
  \**************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcViewsAppPagesSettingsPermissionsEdit_permissionVueVueTypeTemplateId49bd216a(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_Edit_permission_vue_vue_type_template_id_49bd216a__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../../../../../../node_modules/vue-loader/lib??vue-loader-options!./Edit_permission.vue?vue&type=template&id=49bd216a */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/settings/permissions/Edit_permission.vue?vue&type=template&id=49bd216a");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_Edit_permission_vue_vue_type_template_id_49bd216a__WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_Edit_permission_vue_vue_type_template_id_49bd216a__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/})

}]);

}());
