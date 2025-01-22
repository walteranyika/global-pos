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
var RangeError$1 = global_1.RangeError;
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
        if (!(error instanceof RangeError$1)) throw error;
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

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
wellKnownSymbolDefine('iterator');

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
wellKnownSymbolDefine('toPrimitive');

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
symbolDefineToPrimitive();

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
var $TypeError$6 = TypeError;

var aPossiblePrototype = function (argument) {
  if (isPossiblePrototype(argument)) return argument;
  throw new $TypeError$6("Can't set " + $String$5(argument) + ' as a prototype');
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

var $TypeError$7 = TypeError;

// `Date.prototype[@@toPrimitive](hint)` method implementation
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
var dateToPrimitive = function (hint) {
  anObject(this);
  if (hint === 'string' || hint === 'default') hint = 'string';
  else if (hint !== 'number') throw new $TypeError$7('Incorrect hint');
  return ordinaryToPrimitive(this, hint);
};

var TO_PRIMITIVE$1 = wellKnownSymbol('toPrimitive');
var DatePrototype = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!hasOwnProperty_1(DatePrototype, TO_PRIMITIVE$1)) {
  defineBuiltIn(DatePrototype, TO_PRIMITIVE$1, dateToPrimitive);
}

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
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
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

var FORCED$1 = isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

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
if (FORCED$1 && !isPure) NumberPrototype.constructor = NumberWrapper;

_export({ global: true, constructor: true, wrap: true, forced: FORCED$1 }, {
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
      defineProperty$5(target, key, getOwnPropertyDescriptor$2(source, key));
    }
  }
};
if (FORCED$1 || isPure) copyConstructorProperties$1(path[NUMBER], NativeNumber);

var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;


var FORCED$2 = !descriptors || fails(function () { nativeGetOwnPropertyDescriptor$1(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
_export({ target: 'Object', stat: true, forced: FORCED$2, sham: !descriptors }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject(it), key);
  }
});

var createProperty = function (object, key, value) {
  if (descriptors) objectDefineProperty.f(object, key, createPropertyDescriptor(0, value));
  else object[key] = value;
};

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

var FAILS_ON_PRIMITIVES = fails(function () { objectKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return objectKeys(toObject(it));
  }
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

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) === 'RegExp');
};

var $TypeError$8 = TypeError;

var notARegexp = function (it) {
  if (isRegexp(it)) {
    throw new $TypeError$8("The method doesn't accept regular expressions");
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

var charAt$1 = functionUncurryThis(''.charAt);
var charCodeAt$2 = functionUncurryThis(''.charCodeAt);
var stringSlice$3 = functionUncurryThis(''.slice);

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
          ? charAt$1(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$3(S, position, position + 2)
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

var charAt$2 = stringMultibyte.charAt;





var STRING_ITERATOR = 'String Iterator';
var setInternalState$2 = internalState.set;
var getInternalState$2 = internalState.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
iteratorDefine(String, 'String', function (iterated) {
  setInternalState$2(this, {
    type: STRING_ITERATOR,
    string: toString_1(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$2(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt$2(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
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

var ITERATOR$2 = wellKnownSymbol('iterator');
var ArrayValues = es_array_iterator.values;

var handlePrototype$1 = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$2] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR$2, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$2] = ArrayValues;
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

var ITERATOR$3 = wellKnownSymbol('iterator');

var urlConstructorDetection = !fails(function () {
  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var params = url.searchParams;
  var params2 = new URLSearchParams('a=1&a=2&b=3');
  var result = '';
  url.pathname = 'c%20d';
  params.forEach(function (value, key) {
    params['delete']('b');
    result += key + value;
  });
  params2['delete']('a', 2);
  // `undefined` case is a Chromium 117 bug
  // https://bugs.chromium.org/p/v8/issues/detail?id=14222
  params2['delete']('b', undefined);
  return (isPure && (!url.toJSON || !params2.has('a', 1) || params2.has('a', 2) || !params2.has('a', undefined) || params2.has('b')))
    || (!params.size && (isPure || !descriptors))
    || !params.sort
    || url.href !== 'http://a/c%20d?a=1&c=3'
    || params.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !params[ITERATOR$3]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('http://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('http://a#б').hash !== '#%D0%B1'
    // fails in Chrome 66-
    || result !== 'a1c3'
    // throws in Safari
    || new URL('http://x', undefined).host !== 'x';
});

var $TypeError$9 = TypeError;

var anInstance = function (it, Prototype) {
  if (objectIsPrototypeOf(Prototype, it)) return it;
  throw new $TypeError$9('Incorrect invocation');
};

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty$6 = Object.defineProperty;
var concat$1 = functionUncurryThis([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !$assign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (descriptors && $assign({ b: 1 }, $assign(defineProperty$6({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$6(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol('assign detection');
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
  while (argumentsLength > index) {
    var S = indexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat$1(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!descriptors || functionCall(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

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

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

var ITERATOR$4 = wellKnownSymbol('iterator');
var ArrayPrototype$1 = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$4] === it);
};

var ITERATOR$5 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR$5)
    || getMethod(it, '@@iterator')
    || iterators[classof(it)];
};

var $TypeError$a = TypeError;

var getIterator = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(functionCall(iteratorMethod, argument));
  throw new $TypeError$a(tryToString(argument) + ' is not iterable');
};

var $Array$1 = Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var IS_CONSTRUCTOR = isConstructor(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this === $Array$1 && isArrayIteratorMethod(iteratorMethod))) {
    result = IS_CONSTRUCTOR ? new this() : [];
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    for (;!(step = functionCall(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = lengthOfArrayLike(O);
    result = IS_CONSTRUCTOR ? new this(length) : $Array$1(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};

// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js


var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
var baseMinusTMin = base - tMin;

var $RangeError = RangeError;
var exec$2 = functionUncurryThis(regexSeparators.exec);
var floor$1 = Math.floor;
var fromCharCode = String.fromCharCode;
var charCodeAt$3 = functionUncurryThis(''.charCodeAt);
var join = functionUncurryThis([].join);
var push$4 = functionUncurryThis([].push);
var replace$3 = functionUncurryThis(''.replace);
var split$1 = functionUncurryThis(''.split);
var toLowerCase = functionUncurryThis(''.toLowerCase);

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
var ucs2decode = function (string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = charCodeAt$3(string, counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = charCodeAt$3(string, counter++);
      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
        push$4(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        push$4(output, value);
        counter--;
      }
    } else {
      push$4(output, value);
    }
  }
  return output;
};

/**
 * Converts a digit/integer into a basic code point.
 */
var digitToBasic = function (digit) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 */
var adapt = function (delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
  delta += floor$1(delta / numPoints);
  while (delta > baseMinusTMin * tMax >> 1) {
    delta = floor$1(delta / baseMinusTMin);
    k += base;
  }
  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
var encode = function (input) {
  var output = [];

  // Convert the input in UCS-2 to an array of Unicode code points.
  input = ucs2decode(input);

  // Cache the length.
  var inputLength = input.length;

  // Initialize the state.
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue;

  // Handle the basic code points.
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    if (currentValue < 0x80) {
      push$4(output, fromCharCode(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    push$4(output, delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    var m = maxInt;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    var handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
      throw new $RangeError(OVERFLOW_ERROR);
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw new $RangeError(OVERFLOW_ERROR);
      }
      if (currentValue === n) {
        // Represent delta as a generalized variable-length integer.
        var q = delta;
        var k = base;
        while (true) {
          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (q < t) break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          push$4(output, fromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor$1(qMinusT / baseMinusT);
          k += base;
        }

        push$4(output, fromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        handledCPCount++;
      }
    }

    delta++;
    n++;
  }
  return join(output, '');
};

var stringPunycodeToAscii = function (input) {
  var encoded = [];
  var labels = split$1(replace$3(toLowerCase(input), regexSeparators, '\u002E'), '.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    push$4(encoded, exec$2(regexNonASCII, label) ? 'xn--' + encode(label) : label);
  }
  return join(encoded, '.');
};

var $TypeError$b = TypeError;

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw new $TypeError$b('Not enough arguments');
  return passed;
};

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;

// Avoid NodeJS experimental warning
var safeGetBuiltIn = function (name) {
  if (!descriptors) return global_1[name];
  var descriptor = getOwnPropertyDescriptor$3(global_1, name);
  return descriptor && descriptor.value;
};

var defineBuiltIns = function (target, src, options) {
  for (var key in src) defineBuiltIn(target, key, src[key], options);
  return target;
};

var floor$2 = Math.floor;

var sort = function (array, comparefn) {
  var length = array.length;

  if (length < 8) {
    // insertion sort
    var i = 1;
    var element, j;

    while (i < length) {
      j = i;
      element = array[i];
      while (j && comparefn(array[j - 1], element) > 0) {
        array[j] = array[--j];
      }
      if (j !== i++) array[j] = element;
    }
  } else {
    // merge sort
    var middle = floor$2(length / 2);
    var left = sort(arraySlice(array, 0, middle), comparefn);
    var right = sort(arraySlice(array, middle), comparefn);
    var llength = left.length;
    var rlength = right.length;
    var lindex = 0;
    var rindex = 0;

    while (lindex < llength || rindex < rlength) {
      array[lindex + rindex] = (lindex < llength && rindex < rlength)
        ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
        : lindex < llength ? left[lindex++] : right[rindex++];
    }
  }

  return array;
};

var arraySort = sort;

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`































var ITERATOR$6 = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState$3 = internalState.set;
var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);

var nativeFetch = safeGetBuiltIn('fetch');
var NativeRequest = safeGetBuiltIn('Request');
var Headers = safeGetBuiltIn('Headers');
var RequestPrototype = NativeRequest && NativeRequest.prototype;
var HeadersPrototype = Headers && Headers.prototype;
var RegExp$1 = global_1.RegExp;
var TypeError$4 = global_1.TypeError;
var decodeURIComponent = global_1.decodeURIComponent;
var encodeURIComponent$1 = global_1.encodeURIComponent;
var charAt$3 = functionUncurryThis(''.charAt);
var join$1 = functionUncurryThis([].join);
var push$5 = functionUncurryThis([].push);
var replace$4 = functionUncurryThis(''.replace);
var shift = functionUncurryThis([].shift);
var splice = functionUncurryThis([].splice);
var split$2 = functionUncurryThis(''.split);
var stringSlice$4 = functionUncurryThis(''.slice);

var plus = /\+/g;
var sequences = Array(4);

var percentSequence = function (bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp$1('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
};

var percentDecode = function (sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};

var deserialize = function (it) {
  var result = replace$4(it, plus, ' ');
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = replace$4(result, percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};

var find = /[!'()~]|%20/g;

var replacements = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replacements[match];
};

var serialize = function (it) {
  return replace$4(encodeURIComponent$1(it), find, replacer);
};

var URLSearchParamsIterator = iteratorCreateConstructor(function Iterator(params, kind) {
  setInternalState$3(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    target: getInternalParamsState(params).entries,
    index: 0,
    kind: kind
  });
}, URL_SEARCH_PARAMS, function next() {
  var state = getInternalIteratorState(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject(undefined, true);
  }
  var entry = target[index];
  switch (state.kind) {
    case 'keys': return createIterResultObject(entry.key, false);
    case 'values': return createIterResultObject(entry.value, false);
  } return createIterResultObject([entry.key, entry.value], false);
}, true);

var URLSearchParamsState = function (init) {
  this.entries = [];
  this.url = null;

  if (init !== undefined) {
    if (isObject(init)) this.parseObject(init);
    else this.parseQuery(typeof init == 'string' ? charAt$3(init, 0) === '?' ? stringSlice$4(init, 1) : init : toString_1(init));
  }
};

URLSearchParamsState.prototype = {
  type: URL_SEARCH_PARAMS,
  bindURL: function (url) {
    this.url = url;
    this.update();
  },
  parseObject: function (object) {
    var entries = this.entries;
    var iteratorMethod = getIteratorMethod(object);
    var iterator, next, step, entryIterator, entryNext, first, second;

    if (iteratorMethod) {
      iterator = getIterator(object, iteratorMethod);
      next = iterator.next;
      while (!(step = functionCall(next, iterator)).done) {
        entryIterator = getIterator(anObject(step.value));
        entryNext = entryIterator.next;
        if (
          (first = functionCall(entryNext, entryIterator)).done ||
          (second = functionCall(entryNext, entryIterator)).done ||
          !functionCall(entryNext, entryIterator).done
        ) throw new TypeError$4('Expected sequence with length 2');
        push$5(entries, { key: toString_1(first.value), value: toString_1(second.value) });
      }
    } else for (var key in object) if (hasOwnProperty_1(object, key)) {
      push$5(entries, { key: key, value: toString_1(object[key]) });
    }
  },
  parseQuery: function (query) {
    if (query) {
      var entries = this.entries;
      var attributes = split$2(query, '&');
      var index = 0;
      var attribute, entry;
      while (index < attributes.length) {
        attribute = attributes[index++];
        if (attribute.length) {
          entry = split$2(attribute, '=');
          push$5(entries, {
            key: deserialize(shift(entry)),
            value: deserialize(join$1(entry, '='))
          });
        }
      }
    }
  },
  serialize: function () {
    var entries = this.entries;
    var result = [];
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      push$5(result, serialize(entry.key) + '=' + serialize(entry.value));
    } return join$1(result, '&');
  },
  update: function () {
    this.entries.length = 0;
    this.parseQuery(this.url.query);
  },
  updateURL: function () {
    if (this.url) this.url.update();
  }
};

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  anInstance(this, URLSearchParamsPrototype);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var state = setInternalState$3(this, new URLSearchParamsState(init));
  if (!descriptors) this.size = state.entries.length;
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

defineBuiltIns(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.append` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    var state = getInternalParamsState(this);
    validateArgumentsLength(arguments.length, 2);
    push$5(state.entries, { key: toString_1(name), value: toString_1(value) });
    if (!descriptors) this.length++;
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name /* , value */) {
    var state = getInternalParamsState(this);
    var length = validateArgumentsLength(arguments.length, 1);
    var entries = state.entries;
    var key = toString_1(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : toString_1($value);
    var index = 0;
    while (index < entries.length) {
      var entry = entries[index];
      if (entry.key === key && (value === undefined || entry.value === value)) {
        splice(entries, index, 1);
        if (value !== undefined) break;
      } else index++;
    }
    if (!descriptors) this.size = entries.length;
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    var entries = getInternalParamsState(this).entries;
    validateArgumentsLength(arguments.length, 1);
    var key = toString_1(name);
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) return entries[index].value;
    }
    return null;
  },
  // `URLSearchParams.prototype.getAll` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
  getAll: function getAll(name) {
    var entries = getInternalParamsState(this).entries;
    validateArgumentsLength(arguments.length, 1);
    var key = toString_1(name);
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) push$5(result, entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name /* , value */) {
    var entries = getInternalParamsState(this).entries;
    var length = validateArgumentsLength(arguments.length, 1);
    var key = toString_1(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : toString_1($value);
    var index = 0;
    while (index < entries.length) {
      var entry = entries[index++];
      if (entry.key === key && (value === undefined || entry.value === value)) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    var state = getInternalParamsState(this);
    validateArgumentsLength(arguments.length, 1);
    var entries = state.entries;
    var found = false;
    var key = toString_1(name);
    var val = toString_1(value);
    var index = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) splice(entries, index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found) push$5(entries, { key: key, value: val });
    if (!descriptors) this.size = entries.length;
    state.updateURL();
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    arraySort(state.entries, function (a, b) {
      return a.key > b.key ? 1 : -1;
    });
    state.updateURL();
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined);
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  // `URLSearchParams.prototype.keys` method
  keys: function keys() {
    return new URLSearchParamsIterator(this, 'keys');
  },
  // `URLSearchParams.prototype.values` method
  values: function values() {
    return new URLSearchParamsIterator(this, 'values');
  },
  // `URLSearchParams.prototype.entries` method
  entries: function entries() {
    return new URLSearchParamsIterator(this, 'entries');
  }
}, { enumerable: true });

// `URLSearchParams.prototype[@@iterator]` method
defineBuiltIn(URLSearchParamsPrototype, ITERATOR$6, URLSearchParamsPrototype.entries, { name: 'entries' });

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
defineBuiltIn(URLSearchParamsPrototype, 'toString', function toString() {
  return getInternalParamsState(this).serialize();
}, { enumerable: true });

// `URLSearchParams.prototype.size` getter
// https://github.com/whatwg/url/pull/734
if (descriptors) defineBuiltInAccessor(URLSearchParamsPrototype, 'size', {
  get: function size() {
    return getInternalParamsState(this).entries.length;
  },
  configurable: true,
  enumerable: true
});

setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

_export({ global: true, constructor: true, forced: !urlConstructorDetection }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
if (!urlConstructorDetection && isCallable(Headers)) {
  var headersHas = functionUncurryThis(HeadersPrototype.has);
  var headersSet = functionUncurryThis(HeadersPrototype.set);

  var wrapRequestOptions = function (init) {
    if (isObject(init)) {
      var body = init.body;
      var headers;
      if (classof(body) === URL_SEARCH_PARAMS) {
        headers = init.headers ? new Headers(init.headers) : new Headers();
        if (!headersHas(headers, 'content-type')) {
          headersSet(headers, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
        return objectCreate(init, {
          body: createPropertyDescriptor(0, toString_1(body)),
          headers: createPropertyDescriptor(0, headers)
        });
      }
    } return init;
  };

  if (isCallable(nativeFetch)) {
    _export({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
      fetch: function fetch(input /* , init */) {
        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
      }
    });
  }

  if (isCallable(NativeRequest)) {
    var RequestConstructor = function Request(input /* , init */) {
      anInstance(this, RequestPrototype);
      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
    };

    RequestPrototype.constructor = RequestConstructor;
    RequestConstructor.prototype = RequestPrototype;

    _export({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
      Request: RequestConstructor
    });
  }
}

var web_urlSearchParams_constructor = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`














var codeAt = stringMultibyte.codeAt;







var setInternalState$4 = internalState.set;
var getInternalURLState = internalState.getterFor('URL');
var URLSearchParams$1 = web_urlSearchParams_constructor.URLSearchParams;
var getInternalSearchParamsState = web_urlSearchParams_constructor.getState;

var NativeURL = global_1.URL;
var TypeError$5 = global_1.TypeError;
var parseInt$1 = global_1.parseInt;
var floor$3 = Math.floor;
var pow = Math.pow;
var charAt$4 = functionUncurryThis(''.charAt);
var exec$3 = functionUncurryThis(/./.exec);
var join$2 = functionUncurryThis([].join);
var numberToString$1 = functionUncurryThis(1.0.toString);
var pop = functionUncurryThis([].pop);
var push$6 = functionUncurryThis([].push);
var replace$5 = functionUncurryThis(''.replace);
var shift$1 = functionUncurryThis([].shift);
var split$3 = functionUncurryThis(''.split);
var stringSlice$5 = functionUncurryThis(''.slice);
var toLowerCase$1 = functionUncurryThis(''.toLowerCase);
var unshift = functionUncurryThis([].unshift);

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[a-z]/i;
// eslint-disable-next-line regexp/no-obscure-range -- safe
var ALPHANUMERIC = /[\d+-.a-z]/i;
var DIGIT = /\d/;
var HEX_START = /^0x/i;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\da-f]+$/i;
/* eslint-disable regexp/no-control-character -- safe */
var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
var LEADING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+/;
var TRAILING_C0_CONTROL_OR_SPACE = /(^|[^\u0000-\u0020])[\u0000-\u0020]+$/;
var TAB_AND_NEW_LINE = /[\t\n\r]/g;
/* eslint-enable regexp/no-control-character -- safe */
var EOF;

// https://url.spec.whatwg.org/#ipv4-number-parser
var parseIPv4 = function (input) {
  var parts = split$3(input, '.');
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] === '') {
    parts.length--;
  }
  partsLength = parts.length;
  if (partsLength > 4) return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part === '') return input;
    radix = 10;
    if (part.length > 1 && charAt$4(part, 0) === '0') {
      radix = exec$3(HEX_START, part) ? 16 : 8;
      part = stringSlice$5(part, radix === 8 ? 1 : 2);
    }
    if (part === '') {
      number = 0;
    } else {
      if (!exec$3(radix === 10 ? DEC : radix === 8 ? OCT : HEX, part)) return input;
      number = parseInt$1(part, radix);
    }
    push$6(numbers, number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index === partsLength - 1) {
      if (number >= pow(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = pop(numbers);
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};

// https://url.spec.whatwg.org/#concept-ipv6-parser
// eslint-disable-next-line max-statements -- TODO
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var chr = function () {
    return charAt$4(input, pointer);
  };

  if (chr() === ':') {
    if (charAt$4(input, 1) !== ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (chr()) {
    if (pieceIndex === 8) return;
    if (chr() === ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && exec$3(HEX, chr())) {
      value = value * 16 + parseInt$1(chr(), 16);
      pointer++;
      length++;
    }
    if (chr() === '.') {
      if (length === 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (chr()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (chr() === '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!exec$3(DIGIT, chr())) return;
        while (exec$3(DIGIT, chr())) {
          number = parseInt$1(chr(), 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece === 0) return;
          else ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255) return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++;
      }
      if (numbersSeen !== 4) return;
      break;
    } else if (chr() === ':') {
      pointer++;
      if (!chr()) return;
    } else if (chr()) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex !== 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex !== 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var index = 0;
  for (; index < 8; index++) {
    if (ipv6[index] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = index;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

// https://url.spec.whatwg.org/#host-serializing
var serializeHost = function (host) {
  var result, index, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (index = 0; index < 4; index++) {
      unshift(result, host % 256);
      host = floor$3(host / 256);
    } return join$2(result, '.');
  // ipv6
  } else if (typeof host == 'object') {
    result = '';
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === index) {
        result += index ? ':' : '::';
        ignore0 = true;
      } else {
        result += numberToString$1(host[index], 16);
        if (index < 7) result += ':';
      }
    }
    return '[' + result + ']';
  } return host;
};

var C0ControlPercentEncodeSet = {};
var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
});
var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
  '#': 1, '?': 1, '{': 1, '}': 1
});
var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
});

var percentEncode = function (chr, set) {
  var code = codeAt(chr, 0);
  return code > 0x20 && code < 0x7F && !hasOwnProperty_1(set, chr) ? chr : encodeURIComponent(chr);
};

// https://url.spec.whatwg.org/#special-scheme
var specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

// https://url.spec.whatwg.org/#windows-drive-letter
var isWindowsDriveLetter = function (string, normalized) {
  var second;
  return string.length === 2 && exec$3(ALPHA, charAt$4(string, 0))
    && ((second = charAt$4(string, 1)) === ':' || (!normalized && second === '|'));
};

// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
var startsWithWindowsDriveLetter = function (string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(stringSlice$5(string, 0, 2)) && (
    string.length === 2 ||
    ((third = charAt$4(string, 2)) === '/' || third === '\\' || third === '?' || third === '#')
  );
};

// https://url.spec.whatwg.org/#single-dot-path-segment
var isSingleDot = function (segment) {
  return segment === '.' || toLowerCase$1(segment) === '%2e';
};

// https://url.spec.whatwg.org/#double-dot-path-segment
var isDoubleDot = function (segment) {
  segment = toLowerCase$1(segment);
  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
};

// States:
var SCHEME_START = {};
var SCHEME = {};
var NO_SCHEME = {};
var SPECIAL_RELATIVE_OR_AUTHORITY = {};
var PATH_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var SPECIAL_AUTHORITY_SLASHES = {};
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var FILE = {};
var FILE_SLASH = {};
var FILE_HOST = {};
var PATH_START = {};
var PATH = {};
var CANNOT_BE_A_BASE_URL_PATH = {};
var QUERY = {};
var FRAGMENT = {};

var URLState = function (url, isBase, base) {
  var urlString = toString_1(url);
  var baseState, failure, searchParams;
  if (isBase) {
    failure = this.parse(urlString);
    if (failure) throw new TypeError$5(failure);
    this.searchParams = null;
  } else {
    if (base !== undefined) baseState = new URLState(base, true);
    failure = this.parse(urlString, null, baseState);
    if (failure) throw new TypeError$5(failure);
    searchParams = getInternalSearchParamsState(new URLSearchParams$1());
    searchParams.bindURL(this);
    this.searchParams = searchParams;
  }
};

URLState.prototype = {
  type: 'URL',
  // https://url.spec.whatwg.org/#url-parsing
  // eslint-disable-next-line max-statements -- TODO
  parse: function (input, stateOverride, base) {
    var url = this;
    var state = stateOverride || SCHEME_START;
    var pointer = 0;
    var buffer = '';
    var seenAt = false;
    var seenBracket = false;
    var seenPasswordToken = false;
    var codePoints, chr, bufferCodePoints, failure;

    input = toString_1(input);

    if (!stateOverride) {
      url.scheme = '';
      url.username = '';
      url.password = '';
      url.host = null;
      url.port = null;
      url.path = [];
      url.query = null;
      url.fragment = null;
      url.cannotBeABaseURL = false;
      input = replace$5(input, LEADING_C0_CONTROL_OR_SPACE, '');
      input = replace$5(input, TRAILING_C0_CONTROL_OR_SPACE, '$1');
    }

    input = replace$5(input, TAB_AND_NEW_LINE, '');

    codePoints = arrayFrom(input);

    while (pointer <= codePoints.length) {
      chr = codePoints[pointer];
      switch (state) {
        case SCHEME_START:
          if (chr && exec$3(ALPHA, chr)) {
            buffer += toLowerCase$1(chr);
            state = SCHEME;
          } else if (!stateOverride) {
            state = NO_SCHEME;
            continue;
          } else return INVALID_SCHEME;
          break;

        case SCHEME:
          if (chr && (exec$3(ALPHANUMERIC, chr) || chr === '+' || chr === '-' || chr === '.')) {
            buffer += toLowerCase$1(chr);
          } else if (chr === ':') {
            if (stateOverride && (
              (url.isSpecial() !== hasOwnProperty_1(specialSchemes, buffer)) ||
              (buffer === 'file' && (url.includesCredentials() || url.port !== null)) ||
              (url.scheme === 'file' && !url.host)
            )) return;
            url.scheme = buffer;
            if (stateOverride) {
              if (url.isSpecial() && specialSchemes[url.scheme] === url.port) url.port = null;
              return;
            }
            buffer = '';
            if (url.scheme === 'file') {
              state = FILE;
            } else if (url.isSpecial() && base && base.scheme === url.scheme) {
              state = SPECIAL_RELATIVE_OR_AUTHORITY;
            } else if (url.isSpecial()) {
              state = SPECIAL_AUTHORITY_SLASHES;
            } else if (codePoints[pointer + 1] === '/') {
              state = PATH_OR_AUTHORITY;
              pointer++;
            } else {
              url.cannotBeABaseURL = true;
              push$6(url.path, '');
              state = CANNOT_BE_A_BASE_URL_PATH;
            }
          } else if (!stateOverride) {
            buffer = '';
            state = NO_SCHEME;
            pointer = 0;
            continue;
          } else return INVALID_SCHEME;
          break;

        case NO_SCHEME:
          if (!base || (base.cannotBeABaseURL && chr !== '#')) return INVALID_SCHEME;
          if (base.cannotBeABaseURL && chr === '#') {
            url.scheme = base.scheme;
            url.path = arraySlice(base.path);
            url.query = base.query;
            url.fragment = '';
            url.cannotBeABaseURL = true;
            state = FRAGMENT;
            break;
          }
          state = base.scheme === 'file' ? FILE : RELATIVE;
          continue;

        case SPECIAL_RELATIVE_OR_AUTHORITY:
          if (chr === '/' && codePoints[pointer + 1] === '/') {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
            pointer++;
          } else {
            state = RELATIVE;
            continue;
          } break;

        case PATH_OR_AUTHORITY:
          if (chr === '/') {
            state = AUTHORITY;
            break;
          } else {
            state = PATH;
            continue;
          }

        case RELATIVE:
          url.scheme = base.scheme;
          if (chr === EOF) {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.query = base.query;
          } else if (chr === '/' || (chr === '\\' && url.isSpecial())) {
            state = RELATIVE_SLASH;
          } else if (chr === '?') {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.query = '';
            state = QUERY;
          } else if (chr === '#') {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            url.path = arraySlice(base.path);
            url.path.length--;
            state = PATH;
            continue;
          } break;

        case RELATIVE_SLASH:
          if (url.isSpecial() && (chr === '/' || chr === '\\')) {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          } else if (chr === '/') {
            state = AUTHORITY;
          } else {
            url.username = base.username;
            url.password = base.password;
            url.host = base.host;
            url.port = base.port;
            state = PATH;
            continue;
          } break;

        case SPECIAL_AUTHORITY_SLASHES:
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          if (chr !== '/' || charAt$4(buffer, pointer + 1) !== '/') continue;
          pointer++;
          break;

        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
          if (chr !== '/' && chr !== '\\') {
            state = AUTHORITY;
            continue;
          } break;

        case AUTHORITY:
          if (chr === '@') {
            if (seenAt) buffer = '%40' + buffer;
            seenAt = true;
            bufferCodePoints = arrayFrom(buffer);
            for (var i = 0; i < bufferCodePoints.length; i++) {
              var codePoint = bufferCodePoints[i];
              if (codePoint === ':' && !seenPasswordToken) {
                seenPasswordToken = true;
                continue;
              }
              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
              if (seenPasswordToken) url.password += encodedCodePoints;
              else url.username += encodedCodePoints;
            }
            buffer = '';
          } else if (
            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
            (chr === '\\' && url.isSpecial())
          ) {
            if (seenAt && buffer === '') return INVALID_AUTHORITY;
            pointer -= arrayFrom(buffer).length + 1;
            buffer = '';
            state = HOST;
          } else buffer += chr;
          break;

        case HOST:
        case HOSTNAME:
          if (stateOverride && url.scheme === 'file') {
            state = FILE_HOST;
            continue;
          } else if (chr === ':' && !seenBracket) {
            if (buffer === '') return INVALID_HOST;
            failure = url.parseHost(buffer);
            if (failure) return failure;
            buffer = '';
            state = PORT;
            if (stateOverride === HOSTNAME) return;
          } else if (
            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
            (chr === '\\' && url.isSpecial())
          ) {
            if (url.isSpecial() && buffer === '') return INVALID_HOST;
            if (stateOverride && buffer === '' && (url.includesCredentials() || url.port !== null)) return;
            failure = url.parseHost(buffer);
            if (failure) return failure;
            buffer = '';
            state = PATH_START;
            if (stateOverride) return;
            continue;
          } else {
            if (chr === '[') seenBracket = true;
            else if (chr === ']') seenBracket = false;
            buffer += chr;
          } break;

        case PORT:
          if (exec$3(DIGIT, chr)) {
            buffer += chr;
          } else if (
            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
            (chr === '\\' && url.isSpecial()) ||
            stateOverride
          ) {
            if (buffer !== '') {
              var port = parseInt$1(buffer, 10);
              if (port > 0xFFFF) return INVALID_PORT;
              url.port = (url.isSpecial() && port === specialSchemes[url.scheme]) ? null : port;
              buffer = '';
            }
            if (stateOverride) return;
            state = PATH_START;
            continue;
          } else return INVALID_PORT;
          break;

        case FILE:
          url.scheme = 'file';
          if (chr === '/' || chr === '\\') state = FILE_SLASH;
          else if (base && base.scheme === 'file') {
            switch (chr) {
              case EOF:
                url.host = base.host;
                url.path = arraySlice(base.path);
                url.query = base.query;
                break;
              case '?':
                url.host = base.host;
                url.path = arraySlice(base.path);
                url.query = '';
                state = QUERY;
                break;
              case '#':
                url.host = base.host;
                url.path = arraySlice(base.path);
                url.query = base.query;
                url.fragment = '';
                state = FRAGMENT;
                break;
              default:
                if (!startsWithWindowsDriveLetter(join$2(arraySlice(codePoints, pointer), ''))) {
                  url.host = base.host;
                  url.path = arraySlice(base.path);
                  url.shortenPath();
                }
                state = PATH;
                continue;
            }
          } else {
            state = PATH;
            continue;
          } break;

        case FILE_SLASH:
          if (chr === '/' || chr === '\\') {
            state = FILE_HOST;
            break;
          }
          if (base && base.scheme === 'file' && !startsWithWindowsDriveLetter(join$2(arraySlice(codePoints, pointer), ''))) {
            if (isWindowsDriveLetter(base.path[0], true)) push$6(url.path, base.path[0]);
            else url.host = base.host;
          }
          state = PATH;
          continue;

        case FILE_HOST:
          if (chr === EOF || chr === '/' || chr === '\\' || chr === '?' || chr === '#') {
            if (!stateOverride && isWindowsDriveLetter(buffer)) {
              state = PATH;
            } else if (buffer === '') {
              url.host = '';
              if (stateOverride) return;
              state = PATH_START;
            } else {
              failure = url.parseHost(buffer);
              if (failure) return failure;
              if (url.host === 'localhost') url.host = '';
              if (stateOverride) return;
              buffer = '';
              state = PATH_START;
            } continue;
          } else buffer += chr;
          break;

        case PATH_START:
          if (url.isSpecial()) {
            state = PATH;
            if (chr !== '/' && chr !== '\\') continue;
          } else if (!stateOverride && chr === '?') {
            url.query = '';
            state = QUERY;
          } else if (!stateOverride && chr === '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr !== EOF) {
            state = PATH;
            if (chr !== '/') continue;
          } break;

        case PATH:
          if (
            chr === EOF || chr === '/' ||
            (chr === '\\' && url.isSpecial()) ||
            (!stateOverride && (chr === '?' || chr === '#'))
          ) {
            if (isDoubleDot(buffer)) {
              url.shortenPath();
              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
                push$6(url.path, '');
              }
            } else if (isSingleDot(buffer)) {
              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
                push$6(url.path, '');
              }
            } else {
              if (url.scheme === 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
                if (url.host) url.host = '';
                buffer = charAt$4(buffer, 0) + ':'; // normalize windows drive letter
              }
              push$6(url.path, buffer);
            }
            buffer = '';
            if (url.scheme === 'file' && (chr === EOF || chr === '?' || chr === '#')) {
              while (url.path.length > 1 && url.path[0] === '') {
                shift$1(url.path);
              }
            }
            if (chr === '?') {
              url.query = '';
              state = QUERY;
            } else if (chr === '#') {
              url.fragment = '';
              state = FRAGMENT;
            }
          } else {
            buffer += percentEncode(chr, pathPercentEncodeSet);
          } break;

        case CANNOT_BE_A_BASE_URL_PATH:
          if (chr === '?') {
            url.query = '';
            state = QUERY;
          } else if (chr === '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr !== EOF) {
            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
          } break;

        case QUERY:
          if (!stateOverride && chr === '#') {
            url.fragment = '';
            state = FRAGMENT;
          } else if (chr !== EOF) {
            if (chr === "'" && url.isSpecial()) url.query += '%27';
            else if (chr === '#') url.query += '%23';
            else url.query += percentEncode(chr, C0ControlPercentEncodeSet);
          } break;

        case FRAGMENT:
          if (chr !== EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
          break;
      }

      pointer++;
    }
  },
  // https://url.spec.whatwg.org/#host-parsing
  parseHost: function (input) {
    var result, codePoints, index;
    if (charAt$4(input, 0) === '[') {
      if (charAt$4(input, input.length - 1) !== ']') return INVALID_HOST;
      result = parseIPv6(stringSlice$5(input, 1, -1));
      if (!result) return INVALID_HOST;
      this.host = result;
    // opaque host
    } else if (!this.isSpecial()) {
      if (exec$3(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input)) return INVALID_HOST;
      result = '';
      codePoints = arrayFrom(input);
      for (index = 0; index < codePoints.length; index++) {
        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
      }
      this.host = result;
    } else {
      input = stringPunycodeToAscii(input);
      if (exec$3(FORBIDDEN_HOST_CODE_POINT, input)) return INVALID_HOST;
      result = parseIPv4(input);
      if (result === null) return INVALID_HOST;
      this.host = result;
    }
  },
  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
  cannotHaveUsernamePasswordPort: function () {
    return !this.host || this.cannotBeABaseURL || this.scheme === 'file';
  },
  // https://url.spec.whatwg.org/#include-credentials
  includesCredentials: function () {
    return this.username !== '' || this.password !== '';
  },
  // https://url.spec.whatwg.org/#is-special
  isSpecial: function () {
    return hasOwnProperty_1(specialSchemes, this.scheme);
  },
  // https://url.spec.whatwg.org/#shorten-a-urls-path
  shortenPath: function () {
    var path = this.path;
    var pathSize = path.length;
    if (pathSize && (this.scheme !== 'file' || pathSize !== 1 || !isWindowsDriveLetter(path[0], true))) {
      path.length--;
    }
  },
  // https://url.spec.whatwg.org/#concept-url-serializer
  serialize: function () {
    var url = this;
    var scheme = url.scheme;
    var username = url.username;
    var password = url.password;
    var host = url.host;
    var port = url.port;
    var path = url.path;
    var query = url.query;
    var fragment = url.fragment;
    var output = scheme + ':';
    if (host !== null) {
      output += '//';
      if (url.includesCredentials()) {
        output += username + (password ? ':' + password : '') + '@';
      }
      output += serializeHost(host);
      if (port !== null) output += ':' + port;
    } else if (scheme === 'file') output += '//';
    output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + join$2(path, '/') : '';
    if (query !== null) output += '?' + query;
    if (fragment !== null) output += '#' + fragment;
    return output;
  },
  // https://url.spec.whatwg.org/#dom-url-href
  setHref: function (href) {
    var failure = this.parse(href);
    if (failure) throw new TypeError$5(failure);
    this.searchParams.update();
  },
  // https://url.spec.whatwg.org/#dom-url-origin
  getOrigin: function () {
    var scheme = this.scheme;
    var port = this.port;
    if (scheme === 'blob') try {
      return new URLConstructor(scheme.path[0]).origin;
    } catch (error) {
      return 'null';
    }
    if (scheme === 'file' || !this.isSpecial()) return 'null';
    return scheme + '://' + serializeHost(this.host) + (port !== null ? ':' + port : '');
  },
  // https://url.spec.whatwg.org/#dom-url-protocol
  getProtocol: function () {
    return this.scheme + ':';
  },
  setProtocol: function (protocol) {
    this.parse(toString_1(protocol) + ':', SCHEME_START);
  },
  // https://url.spec.whatwg.org/#dom-url-username
  getUsername: function () {
    return this.username;
  },
  setUsername: function (username) {
    var codePoints = arrayFrom(toString_1(username));
    if (this.cannotHaveUsernamePasswordPort()) return;
    this.username = '';
    for (var i = 0; i < codePoints.length; i++) {
      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  // https://url.spec.whatwg.org/#dom-url-password
  getPassword: function () {
    return this.password;
  },
  setPassword: function (password) {
    var codePoints = arrayFrom(toString_1(password));
    if (this.cannotHaveUsernamePasswordPort()) return;
    this.password = '';
    for (var i = 0; i < codePoints.length; i++) {
      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  // https://url.spec.whatwg.org/#dom-url-host
  getHost: function () {
    var host = this.host;
    var port = this.port;
    return host === null ? ''
      : port === null ? serializeHost(host)
      : serializeHost(host) + ':' + port;
  },
  setHost: function (host) {
    if (this.cannotBeABaseURL) return;
    this.parse(host, HOST);
  },
  // https://url.spec.whatwg.org/#dom-url-hostname
  getHostname: function () {
    var host = this.host;
    return host === null ? '' : serializeHost(host);
  },
  setHostname: function (hostname) {
    if (this.cannotBeABaseURL) return;
    this.parse(hostname, HOSTNAME);
  },
  // https://url.spec.whatwg.org/#dom-url-port
  getPort: function () {
    var port = this.port;
    return port === null ? '' : toString_1(port);
  },
  setPort: function (port) {
    if (this.cannotHaveUsernamePasswordPort()) return;
    port = toString_1(port);
    if (port === '') this.port = null;
    else this.parse(port, PORT);
  },
  // https://url.spec.whatwg.org/#dom-url-pathname
  getPathname: function () {
    var path = this.path;
    return this.cannotBeABaseURL ? path[0] : path.length ? '/' + join$2(path, '/') : '';
  },
  setPathname: function (pathname) {
    if (this.cannotBeABaseURL) return;
    this.path = [];
    this.parse(pathname, PATH_START);
  },
  // https://url.spec.whatwg.org/#dom-url-search
  getSearch: function () {
    var query = this.query;
    return query ? '?' + query : '';
  },
  setSearch: function (search) {
    search = toString_1(search);
    if (search === '') {
      this.query = null;
    } else {
      if (charAt$4(search, 0) === '?') search = stringSlice$5(search, 1);
      this.query = '';
      this.parse(search, QUERY);
    }
    this.searchParams.update();
  },
  // https://url.spec.whatwg.org/#dom-url-searchparams
  getSearchParams: function () {
    return this.searchParams.facade;
  },
  // https://url.spec.whatwg.org/#dom-url-hash
  getHash: function () {
    var fragment = this.fragment;
    return fragment ? '#' + fragment : '';
  },
  setHash: function (hash) {
    hash = toString_1(hash);
    if (hash === '') {
      this.fragment = null;
      return;
    }
    if (charAt$4(hash, 0) === '#') hash = stringSlice$5(hash, 1);
    this.fragment = '';
    this.parse(hash, FRAGMENT);
  },
  update: function () {
    this.query = this.searchParams.serialize() || null;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLPrototype);
  var base = validateArgumentsLength(arguments.length, 1) > 1 ? arguments[1] : undefined;
  var state = setInternalState$4(that, new URLState(url, false, base));
  if (!descriptors) {
    that.href = state.serialize();
    that.origin = state.getOrigin();
    that.protocol = state.getProtocol();
    that.username = state.getUsername();
    that.password = state.getPassword();
    that.host = state.getHost();
    that.hostname = state.getHostname();
    that.port = state.getPort();
    that.pathname = state.getPathname();
    that.search = state.getSearch();
    that.searchParams = state.getSearchParams();
    that.hash = state.getHash();
  }
};

var URLPrototype = URLConstructor.prototype;

var accessorDescriptor = function (getter, setter) {
  return {
    get: function () {
      return getInternalURLState(this)[getter]();
    },
    set: setter && function (value) {
      return getInternalURLState(this)[setter](value);
    },
    configurable: true,
    enumerable: true
  };
};

if (descriptors) {
  // `URL.prototype.href` accessors pair
  // https://url.spec.whatwg.org/#dom-url-href
  defineBuiltInAccessor(URLPrototype, 'href', accessorDescriptor('serialize', 'setHref'));
  // `URL.prototype.origin` getter
  // https://url.spec.whatwg.org/#dom-url-origin
  defineBuiltInAccessor(URLPrototype, 'origin', accessorDescriptor('getOrigin'));
  // `URL.prototype.protocol` accessors pair
  // https://url.spec.whatwg.org/#dom-url-protocol
  defineBuiltInAccessor(URLPrototype, 'protocol', accessorDescriptor('getProtocol', 'setProtocol'));
  // `URL.prototype.username` accessors pair
  // https://url.spec.whatwg.org/#dom-url-username
  defineBuiltInAccessor(URLPrototype, 'username', accessorDescriptor('getUsername', 'setUsername'));
  // `URL.prototype.password` accessors pair
  // https://url.spec.whatwg.org/#dom-url-password
  defineBuiltInAccessor(URLPrototype, 'password', accessorDescriptor('getPassword', 'setPassword'));
  // `URL.prototype.host` accessors pair
  // https://url.spec.whatwg.org/#dom-url-host
  defineBuiltInAccessor(URLPrototype, 'host', accessorDescriptor('getHost', 'setHost'));
  // `URL.prototype.hostname` accessors pair
  // https://url.spec.whatwg.org/#dom-url-hostname
  defineBuiltInAccessor(URLPrototype, 'hostname', accessorDescriptor('getHostname', 'setHostname'));
  // `URL.prototype.port` accessors pair
  // https://url.spec.whatwg.org/#dom-url-port
  defineBuiltInAccessor(URLPrototype, 'port', accessorDescriptor('getPort', 'setPort'));
  // `URL.prototype.pathname` accessors pair
  // https://url.spec.whatwg.org/#dom-url-pathname
  defineBuiltInAccessor(URLPrototype, 'pathname', accessorDescriptor('getPathname', 'setPathname'));
  // `URL.prototype.search` accessors pair
  // https://url.spec.whatwg.org/#dom-url-search
  defineBuiltInAccessor(URLPrototype, 'search', accessorDescriptor('getSearch', 'setSearch'));
  // `URL.prototype.searchParams` getter
  // https://url.spec.whatwg.org/#dom-url-searchparams
  defineBuiltInAccessor(URLPrototype, 'searchParams', accessorDescriptor('getSearchParams'));
  // `URL.prototype.hash` accessors pair
  // https://url.spec.whatwg.org/#dom-url-hash
  defineBuiltInAccessor(URLPrototype, 'hash', accessorDescriptor('getHash', 'setHash'));
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
defineBuiltIn(URLPrototype, 'toJSON', function toJSON() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
defineBuiltIn(URLPrototype, 'toString', function toString() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  if (nativeCreateObjectURL) defineBuiltIn(URLConstructor, 'createObjectURL', functionBindContext(nativeCreateObjectURL, NativeURL));
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  if (nativeRevokeObjectURL) defineBuiltIn(URLConstructor, 'revokeObjectURL', functionBindContext(nativeRevokeObjectURL, NativeURL));
}

setToStringTag(URLConstructor, 'URL');

_export({ global: true, constructor: true, forced: !urlConstructorDetection, sham: !descriptors }, {
  URL: URLConstructor
});

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
_export({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return functionCall(URL.prototype.toString, this);
  }
});

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["largeSidebar"],{

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js":(
/*!********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js ***!
  \********************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsCommonFooterVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}
function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable;})),t.push.apply(t,o);}return t;}
function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r));});}return e;}
function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}
function _toPropertyKey(t){var i=_toPrimitive(t,"string");return "symbol"==_typeof(i)?i:i+"";}
function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return ("string"===r?String:Number)(t);}

/* harmony default export */__webpack_exports__["default"]={
data:function data(){
return {};
},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_0__["mapGetters"])(["currentUser"])),
methods:{}
};

/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js":(
/*!***************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js ***!
  \***************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _TopNav__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./TopNav */"./resources/src/containers/layouts/largeSidebar/TopNav.vue");
/* harmony import */var mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! mobile-device-detect */"./node_modules/mobile-device-detect/dist/index.js");
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}
function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable;})),t.push.apply(t,o);}return t;}
function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r));});}return e;}
function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}
function _toPropertyKey(t){var i=_toPrimitive(t,"string");return "symbol"==_typeof(i)?i:i+"";}
function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return ("string"===r?String:Number)(t);}



/* harmony default export */__webpack_exports__["default"]={
components:{
Topnav:_TopNav__WEBPACK_IMPORTED_MODULE_0__["default"]
},
data:function data(){
return {
isDisplay:true,
isMenuOver:false,
isStyle:true,
selectedParentMenu:"",
isMobile:mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__["isMobile"]
};
},
mounted:function mounted(){
this.toggleSelectedParentMenu();
window.addEventListener("resize",this.handleWindowResize);
document.addEventListener("click",this.returnSelectedParentMenu);
this.handleWindowResize();
},
beforeDestroy:function beforeDestroy(){
document.removeEventListener("click",this.returnSelectedParentMenu);
window.removeEventListener("resize",this.handleWindowResize);
},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapGetters"])(["getSideBarToggleProperties","currentUserPermissions"])),
methods:_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapActions"])(["changeSecondarySidebarProperties","changeSecondarySidebarPropertiesViaMenuItem","changeSecondarySidebarPropertiesViaOverlay","changeSidebarProperties"])),{},{
handleWindowResize:function handleWindowResize(){
if(window.innerWidth<=1200){
if(this.getSideBarToggleProperties.isSideNavOpen){
this.changeSidebarProperties();
}
if(this.getSideBarToggleProperties.isSecondarySideNavOpen){
this.changeSecondarySidebarProperties();
}
}else {
if(!this.getSideBarToggleProperties.isSideNavOpen){
this.changeSidebarProperties();
}
}
},
toggleSelectedParentMenu:function toggleSelectedParentMenu(){
var currentParentUrl=this.$route.path.split("/").filter(function(x){
return x!=="";
})[1];
if(currentParentUrl!==undefined||currentParentUrl!==null){
this.selectedParentMenu=currentParentUrl.toLowerCase();
}else {
this.selectedParentMenu="dashboard";
}
},
toggleSubMenu:function toggleSubMenu(e){
var hasSubmenu=e.target.dataset.submenu;
var parent=e.target.dataset.item;
if(hasSubmenu){
this.selectedParentMenu=parent;
this.changeSecondarySidebarPropertiesViaMenuItem(true);
}else {
this.selectedParentMenu=parent;
this.changeSecondarySidebarPropertiesViaMenuItem(false);
}
},
removeOverlay:function removeOverlay(){
this.changeSecondarySidebarPropertiesViaOverlay();
if(window.innerWidth<=1200){
this.changeSidebarProperties();
}
this.toggleSelectedParentMenu();
},
returnSelectedParentMenu:function returnSelectedParentMenu(){
if(!this.isMenuOver){
this.toggleSelectedParentMenu();
}
},
toggleSidebarDropdwon:function toggleSidebarDropdwon(event){
var dropdownMenus=this.$el.querySelectorAll(".dropdown-sidemenu.open");
event.currentTarget.classList.toggle("open");
dropdownMenus.forEach(function(dropdown){
dropdown.classList.remove("open");
});
}
})
};

/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js":(
/*!**************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js ***!
  \**************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _utils__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./../../../utils */"./resources/src/utils/index.js");
/* harmony import */var mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! mobile-device-detect */"./node_modules/mobile-device-detect/dist/index.js");
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
/* harmony import */var vue_clickaway__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(/*! vue-clickaway */"./node_modules/vue-clickaway/dist/vue-clickaway.common.js");
/* harmony import */var vue_flag_icon__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(/*! vue-flag-icon */"./node_modules/vue-flag-icon/index.js");
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__(/*! nprogress */"./node_modules/nprogress/nprogress.js");
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_5___default=/*#__PURE__*/__webpack_require__.n(nprogress__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */var vue_ctk_date_time_picker__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__(/*! vue-ctk-date-time-picker */"./node_modules/vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.common.js");
/* harmony import */var vue_ctk_date_time_picker__WEBPACK_IMPORTED_MODULE_6___default=/*#__PURE__*/__webpack_require__.n(vue_ctk_date_time_picker__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */var vue_ctk_date_time_picker_dist_vue_ctk_date_time_picker_css__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__(/*! vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css */"./node_modules/vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css");
/* harmony import */var moment__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__(/*! moment */"./node_modules/moment/moment.js");
/* harmony import */var moment__WEBPACK_IMPORTED_MODULE_8___default=/*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_8__);
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}
function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable;})),t.push.apply(t,o);}return t;}
function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r));});}return e;}
function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}
function _toPropertyKey(t){var i=_toPrimitive(t,"string");return "symbol"==_typeof(i)?i:i+"";}
function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return ("string"===r?String:Number)(t);}

// import Sidebar from "./Sidebar";



// import { setTimeout } from 'timers';





/* harmony default export */__webpack_exports__["default"]={
mixins:[vue_clickaway__WEBPACK_IMPORTED_MODULE_3__["mixin"]],
components:{
FlagIcon:vue_flag_icon__WEBPACK_IMPORTED_MODULE_4__["default"],
VueCtkDateTimePicker:vue_ctk_date_time_picker__WEBPACK_IMPORTED_MODULE_6___default.a
},
data:function data(){
return {
langs:["en","fr"],
isDisplay:true,
isStyle:true,
isSearchOpen:false,
isMouseOnMegaMenu:true,
isMegaMenuOpen:false,
is_Load:false,
from_date:null,
to_date:null
// alerts:0,
};
},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapGetters"])(["currentUser","getSideBarToggleProperties","currentUserPermissions","notifs_alert"])),
created:function created(){
this.from_date=moment__WEBPACK_IMPORTED_MODULE_8___default()().startOf('month').format("YYYY-MM-DD hh:mm a");//.subtract(1, 'days').format("YYYY-MM-DD hh:mm a");
this.to_date=moment__WEBPACK_IMPORTED_MODULE_8___default()().endOf('month').format("YYYY-MM-DD hh:mm a");//.format("YYYY-MM-DD hh:mm a");
},
methods:_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapActions"])(["changeSecondarySidebarProperties","changeSidebarProperties","changeThemeMode","logout"])),{},{
logoutUser:function logoutUser(){
this.$store.dispatch("logout");
},
getDailyReports:function getDailyReports(){
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.set(0.1);
axios.post("report/download",{
fromDate:this.from_date,
toDate:this.to_date
},{
responseType:"blob",
// important
headers:{
"Content-Type":"application/json"
}
}).then(function(response){
var url=window.URL.createObjectURL(response.data);
var link=document.createElement("a");
link.href=url;
var d=new Date();
var datestring=d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear()+" "+d.getHours()+":"+d.getMinutes();
link.setAttribute("download",datestring+"_daily_list_sales.xlsx");
document.body.appendChild(link);
link.click();
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.done();
})["catch"](function(){
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.done();
});
},
printMonthlyReports:function printMonthlyReports(){
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.set(0.1);
axios.post("report/monthly",{
fromDate:this.from_date,
toDate:this.to_date
},{
headers:{
"Content-Type":"application/json"
}
}).then(function(response){
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.done();
})["catch"](function(){
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.done();
});
},
printUserReports:function printUserReports(){
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.set(0.1);
axios.post("report/user/sales",{
fromDate:this.from_date,
toDate:this.to_date
},{
headers:{
"Content-Type":"application/json"
}
}).then(function(response){
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.done();
})["catch"](function(){
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_5___default.a.done();
});
},
SetLocal:function SetLocal(locale){
this.$i18n.locale=locale;
this.$store.dispatch("language/setLanguage",locale);
Fire.$emit("ChangeLanguage");
},
handleFullScreen:function handleFullScreen(){
_utils__WEBPACK_IMPORTED_MODULE_0__["default"].toggleFullScreen();
},
//logoutUser() {
// this.logout();
//},
closeMegaMenu:function closeMegaMenu(){
this.isMegaMenuOpen=false;
},
toggleMegaMenu:function toggleMegaMenu(){
this.isMegaMenuOpen=!this.isMegaMenuOpen;
},
toggleSearch:function toggleSearch(){
this.isSearchOpen=!this.isSearchOpen;
},
sideBarToggle:function sideBarToggle(el){
if(this.getSideBarToggleProperties.isSideNavOpen&&this.getSideBarToggleProperties.isSecondarySideNavOpen&&mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__["isMobile"]){
this.changeSidebarProperties();
this.changeSecondarySidebarProperties();
}else if(this.getSideBarToggleProperties.isSideNavOpen&&this.getSideBarToggleProperties.isSecondarySideNavOpen){
this.changeSecondarySidebarProperties();
}else if(this.getSideBarToggleProperties.isSideNavOpen){
this.changeSidebarProperties();
}else if(!this.getSideBarToggleProperties.isSideNavOpen&&!this.getSideBarToggleProperties.isSecondarySideNavOpen&&!this.getSideBarToggleProperties.isActiveSecondarySideNav){
this.changeSidebarProperties();
}else if(!this.getSideBarToggleProperties.isSideNavOpen&&!this.getSideBarToggleProperties.isSecondarySideNavOpen){
this.changeSidebarProperties();
this.changeSecondarySidebarProperties();
}
}
})
};

/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js":(
/*!*************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js ***!
  \*************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _Sidebar__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./Sidebar */"./resources/src/containers/layouts/largeSidebar/Sidebar.vue");
/* harmony import */var _TopNav__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./TopNav */"./resources/src/containers/layouts/largeSidebar/TopNav.vue");
/* harmony import */var _common_footer__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../common/footer */"./resources/src/containers/layouts/common/footer.vue");
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}
function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable;})),t.push.apply(t,o);}return t;}
function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r));});}return e;}
function _defineProperty(obj,key,value){key=_toPropertyKey(key);if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}
function _toPropertyKey(t){var i=_toPrimitive(t,"string");return "symbol"==_typeof(i)?i:i+"";}
function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return ("string"===r?String:Number)(t);}




/* harmony default export */__webpack_exports__["default"]={
components:{
Sidebar:_Sidebar__WEBPACK_IMPORTED_MODULE_0__["default"],
TopNav:_TopNav__WEBPACK_IMPORTED_MODULE_1__["default"],
appFooter:_common_footer__WEBPACK_IMPORTED_MODULE_2__["default"]
},
data:function data(){
return {};
},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_3__["mapGetters"])(["getSideBarToggleProperties"])),
methods:{}
};

/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true":(
/*!******************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true ***!
  \******************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsCommonFooterVueVueTypeTemplateId1dfb17ffScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this,
_c=_vm._self._c;
return _c("div",{
staticClass:"footer_wrap"
},[_c("div",{
staticClass:"flex-grow-1"
}),_vm._v(" "),_c("div",{
staticClass:"app-footer"
},[_vm._m(0),_vm._v(" "),_c("div",{
staticClass:"footer-bottom border-top pt-3 d-flex flex-column flex-sm-row align-items-center"
},[_c("div",{
staticClass:"d-flex align-items-center"
},[_c("img",{
staticClass:"logo",
attrs:{
src:"/images/"+_vm.currentUser.logo,
alt:"",
width:"60",
height:"60"
}
}),_vm._v(" "),_c("div",[_c("div",[_c("p",{
staticClass:"m-0"
},[_vm._v("© "+_vm._s(new Date().getFullYear())+" Developed By Chui POS Systems")]),_vm._v(" "),_c("p",{
staticClass:"m-0"
},[_vm._v("All rights reserved")])])]),_vm._v(" "),_c("span",{
staticClass:"flex-grow-1"
})])])])]);
};
var staticRenderFns=[function(){
var _vm=this,
_c=_vm._self._c;
return _c("div",{
staticClass:"row"
},[_c("div",{
staticClass:"col-md-9"
},[_c("p",[_c("strong",[_vm._v("Chui POS - Best Inventory System")])]),_vm._v(" "),_c("p",{
staticClass:"text-black-50"
},[_c("b",[_vm._v("For Support Call - 0723-740-215 or 0719-247-956")])])])]);
}];
render._withStripped=true;


/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true":(
/*!*************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true ***!
  \*************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeTemplateId696fbebeScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this,
_c=_vm._self._c;
return _c("div",{
staticClass:"side-content-wrap",
on:{
mouseenter:function mouseenter($event){
_vm.isMenuOver=true;
},
mouseleave:function mouseleave($event){
_vm.isMenuOver=false;
},
touchstart:function touchstart($event){
_vm.isMenuOver=true;
}
}
},[_c("vue-perfect-scrollbar",{
ref:"myData",
staticClass:"sidebar-left rtl-ps-none ps scroll",
"class":{
open:_vm.getSideBarToggleProperties.isSideNavOpen
},
attrs:{
settings:{
suppressScrollX:true,
wheelPropagation:false
}
}
},[_c("div",[_c("ul",{
staticClass:"navigation-left"
},[_c("li",{
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="dashboard"
},
attrs:{
"data-item":"dashboard"
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("router-link",{
staticClass:"nav-item-hold",
attrs:{
tag:"a",
to:"/app/dashboard"
}
},[_c("i",{
staticClass:"nav-icon i-Bar-Chart"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("dashboard")))])])],1),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("products_add")||_vm.currentUserPermissions.includes("products_view")||_vm.currentUserPermissions.includes("barcode_view")),
expression:"currentUserPermissions\n          && (currentUserPermissions.includes('products_add')\n          || currentUserPermissions.includes('products_view')\n          || currentUserPermissions.includes('barcode_view'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="products"
},
attrs:{
"data-item":"products",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Library-2"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("Products")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Purchases_view")||_vm.currentUserPermissions.includes("Purchases_add")),
expression:"currentUserPermissions && (currentUserPermissions.includes('Purchases_view')\n                      || currentUserPermissions.includes('Purchases_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="purchases"
},
attrs:{
"data-item":"purchases",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Receipt"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("Purchases")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Sales_view")||_vm.currentUserPermissions.includes("Sales_add")),
expression:"currentUserPermissions && (currentUserPermissions.includes('Sales_view')\n                      || currentUserPermissions.includes('Sales_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="sales"
},
attrs:{
"data-item":"sales",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Full-Cart"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("Sales")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("adjustment_view")||_vm.currentUserPermissions.includes("adjustment_add")),
expression:"currentUserPermissions\n            && (currentUserPermissions.includes('adjustment_view')\n            || currentUserPermissions.includes('adjustment_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="adjustments"
},
attrs:{
"data-item":"adjustments",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Edit-Map"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("StockAdjustement")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("transfer_view")||_vm.currentUserPermissions.includes("transfer_add")),
expression:"currentUserPermissions && (currentUserPermissions.includes('transfer_view')\n                   || currentUserPermissions.includes('transfer_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="transfers"
},
attrs:{
"data-item":"transfers",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Back"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("StockTransfers")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("expense_view")||_vm.currentUserPermissions.includes("expense_add")),
expression:"currentUserPermissions && (currentUserPermissions.includes('expense_view')\n            || currentUserPermissions.includes('expense_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="expenses"
},
attrs:{
"data-item":"expenses",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Wallet"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("Expenses")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Quotations_view")||_vm.currentUserPermissions.includes("Quotations_add")),
expression:"currentUserPermissions && (currentUserPermissions.includes('Quotations_view')\n                    || currentUserPermissions.includes('Quotations_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="quotations"
},
attrs:{
"data-item":"quotations",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Checkout-Basket"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("Quotations")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Sale_Returns_view")||_vm.currentUserPermissions.includes("Sale_Returns_add")),
expression:"currentUserPermissions && (currentUserPermissions.includes('Sale_Returns_view')\n                      || currentUserPermissions.includes('Sale_Returns_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="sale_return"
},
attrs:{
"data-item":"sale_return",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Right"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("SalesReturn")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Purchase_Returns_view")||_vm.currentUserPermissions.includes("Purchase_Returns_add")),
expression:"currentUserPermissions && (currentUserPermissions.includes('Purchase_Returns_view')\n                      || currentUserPermissions.includes('Purchase_Returns_add'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="purchase_return"
},
attrs:{
"data-item":"purchase_return",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Left"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("PurchasesReturn")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Customers_view")||_vm.currentUserPermissions.includes("Suppliers_view")||_vm.currentUserPermissions.includes("users_view")),
expression:"currentUserPermissions && (currentUserPermissions.includes('Customers_view')\n                      ||currentUserPermissions.includes('Suppliers_view')\n                      ||currentUserPermissions.includes('users_view'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="People"
},
attrs:{
"data-item":"People",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Business-Mens"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("People")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("setting_system")||_vm.currentUserPermissions.includes("warehouse")||_vm.currentUserPermissions.includes("brand")||_vm.currentUserPermissions.includes("backup")||_vm.currentUserPermissions.includes("unit")||_vm.currentUserPermissions.includes("currency")||_vm.currentUserPermissions.includes("category")||_vm.currentUserPermissions.includes("permissions_view")),
expression:"currentUserPermissions && (currentUserPermissions.includes('setting_system')\n                      || currentUserPermissions.includes('warehouse') || currentUserPermissions.includes('brand')\n                      || currentUserPermissions.includes('backup')    || currentUserPermissions.includes('unit')\n                      || currentUserPermissions.includes('currency')  || currentUserPermissions.includes('category')\n                      || currentUserPermissions.includes('permissions_view'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="settings"
},
attrs:{
"data-item":"settings",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Data-Settings"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("Settings")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})]),_vm._v(" "),_c("li",{
directives:[{
name:"show",
rawName:"v-show",
value:_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Reports_payments_Sales")||_vm.currentUserPermissions.includes("Reports_payments_Purchases")||_vm.currentUserPermissions.includes("Reports_payments_Sale_Returns")||_vm.currentUserPermissions.includes("Reports_payments_purchase_Return")||_vm.currentUserPermissions.includes("Warehouse_report")||_vm.currentUserPermissions.includes("Reports_profit")||_vm.currentUserPermissions.includes("Reports_purchase")||_vm.currentUserPermissions.includes("Reports_quantity_alerts")||_vm.currentUserPermissions.includes("Reports_sales")||_vm.currentUserPermissions.includes("Reports_suppliers")||_vm.currentUserPermissions.includes("Reports_customers")),
expression:"currentUserPermissions &&\n                   (currentUserPermissions.includes('Reports_payments_Sales')\n                   || currentUserPermissions.includes('Reports_payments_Purchases')\n                   || currentUserPermissions.includes('Reports_payments_Sale_Returns')\n                   || currentUserPermissions.includes('Reports_payments_purchase_Return')\n                   || currentUserPermissions.includes('Warehouse_report')\n                   || currentUserPermissions.includes('Reports_profit')\n                   || currentUserPermissions.includes('Reports_purchase')\n                   || currentUserPermissions.includes('Reports_quantity_alerts')\n                   || currentUserPermissions.includes('Reports_sales')\n                   || currentUserPermissions.includes('Reports_suppliers')\n                   || currentUserPermissions.includes('Reports_customers'))"
}],
staticClass:"nav-item",
"class":{
active:_vm.selectedParentMenu=="reports"
},
attrs:{
"data-item":"reports",
"data-submenu":true
},
on:{
mouseenter:_vm.toggleSubMenu
}
},[_c("a",{
staticClass:"nav-item-hold",
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Line-Chart"
}),_vm._v(" "),_c("span",{
staticClass:"nav-text"
},[_vm._v(_vm._s(_vm.$t("Reports")))])]),_vm._v(" "),_c("div",{
staticClass:"triangle"
})])])])]),_vm._v(" "),_c("vue-perfect-scrollbar",{
staticClass:"sidebar-left-secondary ps rtl-ps-none",
"class":{
open:_vm.getSideBarToggleProperties.isSecondarySideNavOpen
},
attrs:{
settings:{
suppressScrollX:true,
wheelPropagation:false
}
}
},[_c("div",{
ref:"sidebarChild"
},[_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="products"
},
attrs:{
"data-parent":"products"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("products_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/products/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("AddProduct")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("products_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/products/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("productsList")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("barcode_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/products/barcode"
}
},[_c("i",{
staticClass:"nav-icon i-Bar-Code"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Printbarcode")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="adjustments"
},
attrs:{
"data-parent":"adjustments"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("adjustment_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/adjustments/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("CreateAdjustment")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("adjustment_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/adjustments/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListAdjustments")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="transfers"
},
attrs:{
"data-parent":"transfers"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("transfer_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/transfers/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("CreateTransfer")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("transfer_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/transfers/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListTransfers")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="expenses"
},
attrs:{
"data-parent":"expenses"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("expense_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/expenses/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Create_Expense")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("expense_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/expenses/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListExpenses")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("expense_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/expenses/category"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Expense_Category")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="quotations"
},
attrs:{
"data-parent":"quotations"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Quotations_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/quotations/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("AddQuote")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Quotations_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/quotations/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListQuotations")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="purchases"
},
attrs:{
"data-parent":"purchases"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Purchases_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/purchases/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("AddPurchase")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Purchases_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/purchases/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListPurchases")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="sales"
},
attrs:{
"data-parent":"sales"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Sales_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/sales/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("AddSale")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Sales_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/sales/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListSales")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Sales_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/sales/user/summary"
}
},[_c("i",{
staticClass:"nav-icon i-Bulleted-List"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s("User Sales"))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="sale_return"
},
attrs:{
"data-parent":"sale_return"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Sale_Returns_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/sale_return/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("AddReturn")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Sale_Returns_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/sale_return/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListReturns")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="purchase_return"
},
attrs:{
"data-parent":"purchase_return"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Purchase_Returns_add")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/purchase_return/store"
}
},[_c("i",{
staticClass:"nav-icon i-Add-File"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("AddReturn")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Purchase_Returns_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/purchase_return/list"
}
},[_c("i",{
staticClass:"nav-icon i-Files"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ListReturns")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="People"
},
attrs:{
"data-parent":"People"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Customers_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/People/Customers"
}
},[_c("i",{
staticClass:"nav-icon i-Administrator"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Customers")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Suppliers_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/People/Suppliers"
}
},[_c("i",{
staticClass:"nav-icon i-Administrator"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Suppliers")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("users_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/People/Users"
}
},[_c("i",{
staticClass:"nav-icon i-Administrator"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Users")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="settings"
},
attrs:{
"data-parent":"settings"
}
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("setting_system")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/System_settings"
}
},[_c("i",{
staticClass:"nav-icon i-Data-Settings"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("SystemSettings")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("permissions_view")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/permissions"
}
},[_c("i",{
staticClass:"nav-icon i-Key"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("GroupPermissions")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("warehouse")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/Warehouses"
}
},[_c("i",{
staticClass:"nav-icon i-Clothing-Store"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Warehouses")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("category")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/Categories"
}
},[_c("i",{
staticClass:"nav-icon i-Duplicate-Layer"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Categories")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("brand")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/Brands"
}
},[_c("i",{
staticClass:"nav-icon i-Bookmark"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Brand")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("currency")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/Currencies"
}
},[_c("i",{
staticClass:"nav-icon i-Dollar-Sign"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Currencies")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("unit")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/Units"
}
},[_c("i",{
staticClass:"nav-icon i-Quotes"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Units")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("backup")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/settings/Backup"
}
},[_c("i",{
staticClass:"nav-icon i-Data-Backup"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Backup")))])])],1):_vm._e()]),_vm._v(" "),_c("ul",{
staticClass:"childNav d-none",
"class":{
"d-block":_vm.selectedParentMenu=="reports"
},
attrs:{
"data-parent":"reports"
}
},[_vm.currentUserPermissions&&(_vm.currentUserPermissions.includes("Reports_payments_Purchases")||_vm.currentUserPermissions.includes("Reports_payments_Sales")||_vm.currentUserPermissions.includes("Reports_payments_Sale_Returns")||_vm.currentUserPermissions.includes("Reports_payments_purchase_Return"))?_c("li",{
staticClass:"nav-item dropdown-sidemenu",
on:{
click:function click($event){
$event.preventDefault();
return _vm.toggleSidebarDropdwon($event);
}
}
},[_c("a",{
attrs:{
href:"#"
}
},[_c("i",{
staticClass:"nav-icon i-Credit-Card"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Payments")))]),_vm._v(" "),_c("i",{
staticClass:"dd-arrow i-Arrow-Down"
})]),_vm._v(" "),_c("ul",{
staticClass:"submenu"
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_payments_Purchases")?_c("li",[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/payments_purchase"
}
},[_c("i",{
staticClass:"nav-icon i-ID-Card"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Purchases")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_payments_Sales")?_c("li",[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/payments_sale"
}
},[_c("i",{
staticClass:"nav-icon i-ID-Card"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Sales")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_payments_Sale_Returns")?_c("li",[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/payments_sales_returns"
}
},[_c("i",{
staticClass:"nav-icon i-ID-Card"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("SalesReturn")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_payments_purchase_Return")?_c("li",[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/payments_purchases_returns"
}
},[_c("i",{
staticClass:"nav-icon i-ID-Card"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("PurchasesReturn")))])])],1):_vm._e()])]):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_profit")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/profit_and_loss"
}
},[_c("i",{
staticClass:"nav-icon i-Split-FourSquareWindow"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ProfitandLoss")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_quantity_alerts")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/quantity_alerts"
}
},[_c("i",{
staticClass:"nav-icon i-Dollar"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("ProductQuantityAlerts")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Warehouse_report")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/warehouse_report"
}
},[_c("i",{
staticClass:"nav-icon i-Pie-Chart"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("Warehouse_report")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_sales")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/sales_report"
}
},[_c("i",{
staticClass:"nav-icon i-Line-Chart"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("SalesReport")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_purchase")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/purchase_report"
}
},[_c("i",{
staticClass:"nav-icon i-Bar-Chart5"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("PurchasesReport")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_customers")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/customers_report"
}
},[_c("i",{
staticClass:"nav-icon i-Bar-Chart"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("CustomersReport")))])])],1):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_suppliers")?_c("li",{
staticClass:"nav-item"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/providers_report"
}
},[_c("i",{
staticClass:"nav-icon i-Pie-Chart"
}),_vm._v(" "),_c("span",{
staticClass:"item-name"
},[_vm._v(_vm._s(_vm.$t("SuppliersReport")))])])],1):_vm._e()])])]),_vm._v(" "),_c("div",{
staticClass:"sidebar-overlay",
"class":{
open:_vm.getSideBarToggleProperties.isSecondarySideNavOpen
},
on:{
click:function click($event){
return _vm.removeOverlay();
}
}
})],1);
};
var staticRenderFns=[];
render._withStripped=true;


/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c":(
/*!************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c ***!
  \************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeTemplateId7dfa9f1c(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this,
_c=_vm._self._c;
return _c("div",{
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
staticClass:"menu-toggle",
on:{
click:_vm.sideBarToggle
}
},[_c("div"),_vm._v(" "),_c("div"),_vm._v(" "),_c("div")]),_vm._v(" "),_c("div",{
staticStyle:{
margin:"auto"
}
}),_vm._v(" "),_c("div",{
staticClass:"header-part-right"
},[_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_sales")?_c("VueCtkDateTimePicker",{
attrs:{
label:"Select Start Date"
},
model:{
value:_vm.from_date,
callback:function callback($$v){
_vm.from_date=$$v;
},
expression:"from_date"
}
}):_vm._e(),_vm._v(" "),_c("span",{
staticClass:"ml-1"
}),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_sales")?_c("VueCtkDateTimePicker",{
attrs:{
label:"Select End Date"
},
model:{
value:_vm.to_date,
callback:function callback($$v){
_vm.to_date=$$v;
},
expression:"to_date"
}
}):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_sales")?_c("button",{
staticClass:"ml-1 btn btn-info mr-1 btn-sm",
on:{
click:function click($event){
return _vm.getDailyReports();
}
}
},[_vm._v("\n            Download Report\n        ")]):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_sales")?_c("button",{
staticClass:"ml-1 btn btn-success mr-1 btn-sm",
on:{
click:function click($event){
return _vm.printMonthlyReports();
}
}
},[_vm._v("\n            Print Report\n        ")]):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_sales")?_c("button",{
staticClass:"ml-1 btn btn-secondary mr-1 btn-sm",
on:{
click:function click($event){
return _vm.printUserReports();
}
}
},[_vm._v("\n             User Sales Report\n        ")]):_vm._e(),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Pos_view")?_c("router-link",{
staticClass:"btn btn-outline-primary tn-sm btn-rounded",
attrs:{
to:"/app/pos"
}
},[_c("span",{
staticClass:"ul-btn__text ml-1"
},[_vm._v("POS")])]):_vm._e(),_vm._v(" "),_c("i",{
staticClass:"i-Full-Screen header-icon d-none d-sm-inline-block",
on:{
click:_vm.handleFullScreen
}
}),_vm._v(" "),_c("div",{
staticClass:"dropdown d-none"
},[_c("b-dropdown",{
staticClass:"m-md-2 d-none d-md-block",
attrs:{
id:"dropdown",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link"
}
},[_c("template",{
slot:"button-content"
},[_c("i",{
staticClass:"i-Globe text-muted header-icon",
attrs:{
role:"button",
id:"dropdownMenuButton",
"data-toggle":"dropdown",
"aria-haspopup":"true",
"aria-expanded":"false"
}
})]),_vm._v(" "),_c("vue-perfect-scrollbar",{
ref:"myData",
staticClass:"dropdown-menu-right rtl-ps-none notification-dropdown ps scroll",
attrs:{
settings:{
suppressScrollX:true,
wheelPropagation:false
}
}
},[_c("div",{
staticClass:"menu-icon-grid"
},[_c("a",{
on:{
click:function click($event){
return _vm.SetLocal("en");
}
}
},[_c("i",{
staticClass:"flag-icon flag-icon-squared flag-icon-gb",
attrs:{
title:"en"
}
}),_vm._v(" English\n                        ")]),_vm._v(" "),_c("a",{
on:{
click:function click($event){
return _vm.SetLocal("fr");
}
}
},[_c("i",{
staticClass:"flag-icon flag-icon-squared flag-icon-fr",
attrs:{
title:"fr"
}
}),_vm._v(" "),_c("span",{
staticClass:"title-lang"
},[_vm._v("French")])])])])],2)],1),_vm._v(" "),_c("div",{
staticClass:"dropdown"
},[_c("b-dropdown",{
staticClass:"m-md-2 badge-top-container d-none d-sm-inline-block",
attrs:{
id:"dropdown-1",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link"
}
},[_c("template",{
slot:"button-content"
},[_vm.notifs_alert>0?_c("span",{
staticClass:"badge badge-primary"
},[_vm._v("1")]):_vm._e(),_vm._v(" "),_c("i",{
staticClass:"i-Bell text-muted header-icon"
})]),_vm._v(" "),_c("vue-perfect-scrollbar",{
ref:"myData",
staticClass:"dropdown-menu-right rtl-ps-none notification-dropdown ps scroll",
"class":{
open:_vm.getSideBarToggleProperties.isSideNavOpen
},
attrs:{
settings:{
suppressScrollX:true,
wheelPropagation:false
}
}
},[_vm.notifs_alert>0?_c("div",{
staticClass:"dropdown-item d-flex"
},[_c("div",{
staticClass:"notification-icon"
},[_c("i",{
staticClass:"i-Bell text-primary mr-1"
})]),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("Reports_quantity_alerts")?_c("div",{
staticClass:"notification-details flex-grow-1"
},[_c("router-link",{
attrs:{
tag:"a",
to:"/app/reports/quantity_alerts"
}
},[_c("p",{
staticClass:"text-small text-muted m-0"
},[_vm._v("\n                                    "+_vm._s(_vm.notifs_alert)+" "+_vm._s(_vm.$t("ProductQuantityAlerts"))+"\n                                ")])])],1):_vm._e()]):_vm._e()])],2)],1),_vm._v(" "),_c("div",{
staticClass:"dropdown"
},[_c("b-dropdown",{
staticClass:"m-md-4 user col align-self-end d-md-block",
attrs:{
id:"dropdown-1",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link"
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
staticClass:"dropdown-menu-right",
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
},[_vm._v(_vm._s(_vm.$t("profil")))]),_vm._v(" "),_vm.currentUserPermissions&&_vm.currentUserPermissions.includes("setting_system")?_c("router-link",{
staticClass:"dropdown-item",
attrs:{
to:"/app/settings/System_settings"
}
},[_vm._v(_vm._s(_vm.$t("Settings"))+"\n                    ")]):_vm._e(),_vm._v(" "),_c("a",{
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
},[_vm._v(_vm._s(_vm.$t("logout")))])],1)],2)],1)],1)]);
};
var staticRenderFns=[];
render._withStripped=true;


/***/}),

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858":(
/*!***********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858 ***!
  \***********************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeTemplateId427f8858(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this,
_c=_vm._self._c;
return _c("div",{
staticClass:"app-admin-wrap layout-sidebar-large clearfix"
},[_c("top-nav"),_vm._v(" "),_c("sidebar"),_vm._v(" "),_c("main",[_c("div",{
staticClass:"main-content-wrap d-flex flex-column flex-grow-1",
"class":{
"sidenav-open":_vm.getSideBarToggleProperties.isSideNavOpen
}
},[_c("transition",{
attrs:{
name:"page",
mode:"out-in"
}
},[_c("router-view")],1),_vm._v(" "),_c("div",{
staticClass:"flex-grow-1"
}),_vm._v(" "),_c("appFooter")],1)])],1);
};
var staticRenderFns=[];
render._withStripped=true;


/***/}),

/***/"./node_modules/moment/locale sync recursive \\b\\B":(
/*!**********************************************!*\
  !*** ./node_modules/moment/locale sync \b\B ***!
  \**********************************************/
/*! no static exports found */
/***/function node_modulesMomentLocaleSyncRecursiveBB(module,exports){

function webpackEmptyContext(req){
var e=new Error("Cannot find module '"+req+"'");
e.code='MODULE_NOT_FOUND';
throw e;
}
webpackEmptyContext.keys=function(){return [];};
webpackEmptyContext.resolve=webpackEmptyContext;
module.exports=webpackEmptyContext;
webpackEmptyContext.id="./node_modules/moment/locale sync recursive \\b\\B";

/***/}),

/***/"./resources/src/containers/layouts/common/footer.vue":(
/*!************************************************************!*\
  !*** ./resources/src/containers/layouts/common/footer.vue ***!
  \************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsCommonFooterVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _footer_vue_vue_type_template_id_1dfb17ff_scoped_true__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./footer.vue?vue&type=template&id=1dfb17ff&scoped=true */"./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true");
/* harmony import */var _footer_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./footer.vue?vue&type=script&lang=js */"./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_footer_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
_footer_vue_vue_type_template_id_1dfb17ff_scoped_true__WEBPACK_IMPORTED_MODULE_0__["render"],
_footer_vue_vue_type_template_id_1dfb17ff_scoped_true__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
"1dfb17ff",
null

);
component.options.__file="resources/src/containers/layouts/common/footer.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/}),

/***/"./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js":(
/*!************************************************************************************!*\
  !*** ./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js ***!
  \************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsCommonFooterVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./footer.vue?vue&type=script&lang=js */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"];

/***/}),

/***/"./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true":(
/*!******************************************************************************************************!*\
  !*** ./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true ***!
  \******************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsCommonFooterVueVueTypeTemplateId1dfb17ffScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_1dfb17ff_scoped_true__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../../../../node_modules/vue-loader/lib??vue-loader-options!./footer.vue?vue&type=template&id=1dfb17ff&scoped=true */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_1dfb17ff_scoped_true__WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_1dfb17ff_scoped_true__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/Sidebar.vue":(
/*!*******************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/Sidebar.vue ***!
  \*******************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarSidebarVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _Sidebar_vue_vue_type_template_id_696fbebe_scoped_true__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./Sidebar.vue?vue&type=template&id=696fbebe&scoped=true */"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true");
/* harmony import */var _Sidebar_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./Sidebar.vue?vue&type=script&lang=js */"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_Sidebar_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true__WEBPACK_IMPORTED_MODULE_0__["render"],
_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
"696fbebe",
null

);
component.options.__file="resources/src/containers/layouts/largeSidebar/Sidebar.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js":(
/*!*******************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./Sidebar.vue?vue&type=script&lang=js */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"];

/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true":(
/*!*************************************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true ***!
  \*************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeTemplateId696fbebeScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../../../../node_modules/vue-loader/lib??vue-loader-options!./Sidebar.vue?vue&type=template&id=696fbebe&scoped=true */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true__WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/TopNav.vue":(
/*!******************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/TopNav.vue ***!
  \******************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarTopNavVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _TopNav_vue_vue_type_template_id_7dfa9f1c__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./TopNav.vue?vue&type=template&id=7dfa9f1c */"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c");
/* harmony import */var _TopNav_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./TopNav.vue?vue&type=script&lang=js */"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_TopNav_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
_TopNav_vue_vue_type_template_id_7dfa9f1c__WEBPACK_IMPORTED_MODULE_0__["render"],
_TopNav_vue_vue_type_template_id_7dfa9f1c__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
null,
null

);
component.options.__file="resources/src/containers/layouts/largeSidebar/TopNav.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js":(
/*!******************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js ***!
  \******************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./TopNav.vue?vue&type=script&lang=js */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"];

/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c":(
/*!************************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c ***!
  \************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeTemplateId7dfa9f1c(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_template_id_7dfa9f1c__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../../../../node_modules/vue-loader/lib??vue-loader-options!./TopNav.vue?vue&type=template&id=7dfa9f1c */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_template_id_7dfa9f1c__WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_template_id_7dfa9f1c__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/index.vue":(
/*!*****************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/index.vue ***!
  \*****************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarIndexVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _index_vue_vue_type_template_id_427f8858__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./index.vue?vue&type=template&id=427f8858 */"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858");
/* harmony import */var _index_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./index.vue?vue&type=script&lang=js */"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_index_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
_index_vue_vue_type_template_id_427f8858__WEBPACK_IMPORTED_MODULE_0__["render"],
_index_vue_vue_type_template_id_427f8858__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
null,
null

);
component.options.__file="resources/src/containers/layouts/largeSidebar/index.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js":(
/*!*****************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js ***!
  \*****************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./index.vue?vue&type=script&lang=js */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"];

/***/}),

/***/"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858":(
/*!***********************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858 ***!
  \***********************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeTemplateId427f8858(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_427f8858__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../../../../node_modules/vue-loader/lib??vue-loader-options!./index.vue?vue&type=template&id=427f8858 */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_427f8858__WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_427f8858__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



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

/***/})

}]);

}());
