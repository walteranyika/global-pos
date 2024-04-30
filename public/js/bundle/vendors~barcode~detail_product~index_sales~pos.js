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

var $TypeError$6 = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

var doesNotExceedSafeInteger = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError$6('Maximum allowed index exceeded');
  return it;
};

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? functionBindContext(mapper, thisArg) : false;
  var element, elementLen;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray(element)) {
        elementLen = lengthOfArrayLike(element);
        targetIndex = flattenIntoArray(target, original, element, elementLen, targetIndex, depth - 1) - 1;
      } else {
        doesNotExceedSafeInteger(targetIndex + 1);
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
};

var flattenIntoArray_1 = flattenIntoArray;

// `Array.prototype.flat` method
// https://tc39.es/ecma262/#sec-array.prototype.flat
_export({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject(this);
    var sourceLen = lengthOfArrayLike(O);
    var A = arraySpeciesCreate(O, 0);
    A.length = flattenIntoArray_1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toIntegerOrInfinity(depthArg));
    return A;
  }
});

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

/* eslint-disable es/no-array-prototype-indexof -- required for testing */


var $indexOf = arrayIncludes.indexOf;


var nativeIndexOf = functionUncurryThisClause([].indexOf);

var NEGATIVE_ZERO = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
var FORCED$1 = NEGATIVE_ZERO || !arrayMethodIsStrict('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
_export({ target: 'Array', proto: true, forced: FORCED$1 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf(this, searchElement, fromIndex) || 0
      : $indexOf(this, searchElement, fromIndex);
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

var nativeJoin = functionUncurryThis([].join);

var ES3_STRINGS = indexedObject !== Object;
var FORCED$2 = ES3_STRINGS || !arrayMethodIsStrict('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
_export({ target: 'Array', proto: true, forced: FORCED$2 }, {
  join: function join(separator) {
    return nativeJoin(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});

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

var $map = arrayIteration.map;


var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $TypeError$8 = TypeError;

var REDUCE_EMPTY = 'Reduce of empty array with no initial value';

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$2 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    var O = toObject(that);
    var self = indexedObject(O);
    var length = lengthOfArrayLike(O);
    aCallable(callbackfn);
    if (length === 0 && argumentsLength < 2) throw new $TypeError$8(REDUCE_EMPTY);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw new $TypeError$8(REDUCE_EMPTY);
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod$2(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod$2(true)
};

var engineIsNode = classofRaw(global_1.process) === 'process';

var $reduce = arrayReduce.left;




// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !engineIsNode && engineV8Version > 79 && engineV8Version < 83;
var FORCED$3 = CHROME_BUG || !arrayMethodIsStrict('reduce');

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
_export({ target: 'Array', proto: true, forced: FORCED$3 }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var length = arguments.length;
    return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
  }
});

var createProperty = function (object, key, value) {
  if (descriptors) objectDefineProperty.f(object, key, createPropertyDescriptor(0, value));
  else object[key] = value;
};

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('slice');

var SPECIES$2 = wellKnownSymbol('species');
var $Array$1 = Array;
var max$1 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
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

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module


// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('flat');

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
var createMethod$3 = function (TYPE) {
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
  start: createMethod$3(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$3(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$3(3)
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

var FORCED$4 = isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

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
if (FORCED$4 && !isPure) NumberPrototype.constructor = NumberWrapper;

_export({ global: true, constructor: true, wrap: true, forced: FORCED$4 }, {
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
if (FORCED$4 || isPure) copyConstructorProperties$1(path[NUMBER], NativeNumber);

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

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
_export({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== objectAssign }, {
  assign: objectAssign
});

var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;


var FORCED$5 = !descriptors || fails(function () { nativeGetOwnPropertyDescriptor$1(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
_export({ target: 'Object', stat: true, forced: FORCED$5, sham: !descriptors }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject(it), key);
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

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) === 'RegExp');
};

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

var RegExpPrototype = RegExp.prototype;

var regexpGetFlags = function (R) {
  var flags = R.flags;
  return flags === undefined && !('flags' in RegExpPrototype) && !hasOwnProperty_1(R, 'flags') && objectIsPrototypeOf(RegExpPrototype, R)
    ? functionCall(regexpFlags, R) : flags;
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

var defineProperty$7 = objectDefineProperty.f;

var proxyAccessor = function (Target, Source, key) {
  key in Target || defineProperty$7(Target, key, {
    configurable: true,
    get: function () { return Source[key]; },
    set: function (it) { Source[key] = it; }
  });
};

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

var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;









var enforceInternalState = internalState.enforce;





var MATCH$1 = wellKnownSymbol('match');
var NativeRegExp = global_1.RegExp;
var RegExpPrototype$1 = NativeRegExp.prototype;
var SyntaxError = global_1.SyntaxError;
var exec$2 = functionUncurryThis(RegExpPrototype$1.exec);
var charAt$1 = functionUncurryThis(''.charAt);
var replace$3 = functionUncurryThis(''.replace);
var stringIndexOf = functionUncurryThis(''.indexOf);
var stringSlice$3 = functionUncurryThis(''.slice);
// TODO: Use only proper RegExpIdentifierName
var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var MISSED_STICKY$1 = regexpStickyHelpers.MISSED_STICKY;
var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;

var BASE_FORCED = descriptors &&
  (!CORRECT_NEW || MISSED_STICKY$1 || regexpUnsupportedDotAll || regexpUnsupportedNcg || fails(function () {
    re2[MATCH$1] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return NativeRegExp(re1) !== re1 || NativeRegExp(re2) === re2 || String(NativeRegExp(re1, 'i')) !== '/a/i';
  }));

var handleDotAll = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var brackets = false;
  var chr;
  for (; index <= length; index++) {
    chr = charAt$1(string, index);
    if (chr === '\\') {
      result += chr + charAt$1(string, ++index);
      continue;
    }
    if (!brackets && chr === '.') {
      result += '[\\s\\S]';
    } else {
      if (chr === '[') {
        brackets = true;
      } else if (chr === ']') {
        brackets = false;
      } result += chr;
    }
  } return result;
};

var handleNCG = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var named = [];
  var names = objectCreate(null);
  var brackets = false;
  var ncg = false;
  var groupid = 0;
  var groupname = '';
  var chr;
  for (; index <= length; index++) {
    chr = charAt$1(string, index);
    if (chr === '\\') {
      chr += charAt$1(string, ++index);
    } else if (chr === ']') {
      brackets = false;
    } else if (!brackets) switch (true) {
      case chr === '[':
        brackets = true;
        break;
      case chr === '(':
        if (exec$2(IS_NCG, stringSlice$3(string, index + 1))) {
          index += 2;
          ncg = true;
        }
        result += chr;
        groupid++;
        continue;
      case chr === '>' && ncg:
        if (groupname === '' || hasOwnProperty_1(names, groupname)) {
          throw new SyntaxError('Invalid capture group name');
        }
        names[groupname] = true;
        named[named.length] = [groupname, groupid];
        ncg = false;
        groupname = '';
        continue;
    }
    if (ncg) groupname += chr;
    else result += chr;
  } return [result, named];
};

// `RegExp` constructor
// https://tc39.es/ecma262/#sec-regexp-constructor
if (isForced_1('RegExp', BASE_FORCED)) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = objectIsPrototypeOf(RegExpPrototype$1, this);
    var patternIsRegExp = isRegexp(pattern);
    var flagsAreUndefined = flags === undefined;
    var groups = [];
    var rawPattern = pattern;
    var rawFlags, dotAll, sticky, handled, result, state;

    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
      return pattern;
    }

    if (patternIsRegExp || objectIsPrototypeOf(RegExpPrototype$1, pattern)) {
      pattern = pattern.source;
      if (flagsAreUndefined) flags = regexpGetFlags(rawPattern);
    }

    pattern = pattern === undefined ? '' : toString_1(pattern);
    flags = flags === undefined ? '' : toString_1(flags);
    rawPattern = pattern;

    if (regexpUnsupportedDotAll && 'dotAll' in re1) {
      dotAll = !!flags && stringIndexOf(flags, 's') > -1;
      if (dotAll) flags = replace$3(flags, /s/g, '');
    }

    rawFlags = flags;

    if (MISSED_STICKY$1 && 'sticky' in re1) {
      sticky = !!flags && stringIndexOf(flags, 'y') > -1;
      if (sticky && UNSUPPORTED_Y$1) flags = replace$3(flags, /y/g, '');
    }

    if (regexpUnsupportedNcg) {
      handled = handleNCG(pattern);
      pattern = handled[0];
      groups = handled[1];
    }

    result = inheritIfRequired(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$1, RegExpWrapper);

    if (dotAll || sticky || groups.length) {
      state = enforceInternalState(result);
      if (dotAll) {
        state.dotAll = true;
        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
      }
      if (sticky) state.sticky = true;
      if (groups.length) state.groups = groups;
    }

    if (pattern !== rawPattern) try {
      // fails in old engines, but we have no alternatives for unsupported regex syntax
      createNonEnumerableProperty(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
    } catch (error) { /* empty */ }

    return result;
  };

  for (var keys$1 = getOwnPropertyNames$1(NativeRegExp), index = 0; keys$1.length > index;) {
    proxyAccessor(RegExpWrapper, NativeRegExp, keys$1[index++]);
  }

  RegExpPrototype$1.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype$1;
  defineBuiltIn(global_1, 'RegExp', RegExpWrapper, { constructor: true });
}

// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies('RegExp');

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */







var getInternalState$2 = internalState.get;



var nativeReplace = shared('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$2 = functionUncurryThis(''.charAt);
var indexOf$1 = functionUncurryThis(''.indexOf);
var replace$4 = functionUncurryThis(''.replace);
var stringSlice$4 = functionUncurryThis(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  functionCall(nativeExec, re1, 'a');
  functionCall(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$2 = regexpStickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2 || regexpUnsupportedDotAll || regexpUnsupportedNcg;

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
    var sticky = UNSUPPORTED_Y$2 && re.sticky;
    var flags = functionCall(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace$4(flags, 'y', '');
      if (indexOf$1(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$4(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$2(str, re.lastIndex - 1) !== '\n')) {
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
        match.input = stringSlice$4(match.input, charsAdded);
        match[0] = stringSlice$4(match[0], charsAdded);
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

var PROPER_FUNCTION_NAME$1 = functionName.PROPER;






var TO_STRING = 'toString';
var RegExpPrototype$2 = RegExp.prototype;
var nativeToString = RegExpPrototype$2[TO_STRING];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME$1 && nativeToString.name !== TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  defineBuiltIn(RegExpPrototype$2, TO_STRING, function toString() {
    var R = anObject(this);
    var pattern = toString_1(R.source);
    var flags = toString_1(regexpGetFlags(R));
    return '/' + pattern + '/' + flags;
  }, { unsafe: true });
}

var charAt$3 = functionUncurryThis(''.charAt);
var charCodeAt$2 = functionUncurryThis(''.charCodeAt);
var stringSlice$5 = functionUncurryThis(''.slice);

var createMethod$4 = function (CONVERT_TO_STRING) {
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
          ? charAt$3(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$5(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$4(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$4(true)
};

var charAt$4 = stringMultibyte.charAt;





var STRING_ITERATOR = 'String Iterator';
var setInternalState$2 = internalState.set;
var getInternalState$3 = internalState.getterFor(STRING_ITERATOR);

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
  var state = getInternalState$3(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt$4(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});

// TODO: Remove from `core-js@4` since it's moved to entry points








var SPECIES$4 = wellKnownSymbol('species');
var RegExpPrototype$3 = RegExp.prototype;

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
      re.constructor[SPECIES$4] = function () { return re; };
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
      if ($exec === regexpExec || $exec === RegExpPrototype$3.exec) {
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
    defineBuiltIn(RegExpPrototype$3, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty(RegExpPrototype$3[SYMBOL], 'sham', true);
};

var charAt$5 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? charAt$5(S, index).length : 1);
};

var $TypeError$9 = TypeError;

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
  throw new $TypeError$9('RegExp#exec called on incompatible receiver');
};

// @@match logic
fixRegexpWellKnownSymbolLogic('match', function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible(this);
      var matcher = isNullOrUndefined(regexp) ? undefined : getMethod(regexp, MATCH);
      return matcher ? functionCall(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString_1(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (string) {
      var rx = anObject(this);
      var S = toString_1(string);
      var res = maybeCallNative(nativeMatch, rx, S);

      if (res.done) return res.value;

      if (!rx.global) return regexpExecAbstract(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regexpExecAbstract(rx, S)) !== null) {
        var matchStr = toString_1(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

var floor$1 = Math.floor;
var charAt$6 = functionUncurryThis(''.charAt);
var replace$5 = functionUncurryThis(''.replace);
var stringSlice$6 = functionUncurryThis(''.slice);
// eslint-disable-next-line redos/no-vulnerable -- safe
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace$5(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt$6(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice$6(str, 0, position);
      case "'": return stringSlice$6(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice$6(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor$1(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt$6(ch, 1) : captures[f - 1] + charAt$6(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var REPLACE = wellKnownSymbol('replace');
var max$2 = Math.max;
var min$2 = Math.min;
var concat$2 = functionUncurryThis([].concat);
var push$4 = functionUncurryThis([].push);
var stringIndexOf$1 = functionUncurryThis(''.indexOf);
var stringSlice$7 = functionUncurryThis(''.slice);

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  return 'a'.replace(/./, '$0') === '$0';
})();

// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  return ''.replace(re, '$<a>') !== '7';
});

// @@replace logic
fixRegexpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = isNullOrUndefined(searchValue) ? undefined : getMethod(searchValue, REPLACE);
      return replacer
        ? functionCall(replacer, searchValue, O, replaceValue)
        : functionCall(nativeReplace, toString_1(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject(this);
      var S = toString_1(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf$1(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf$1(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable(replaceValue);
      if (!functionalReplace) replaceValue = toString_1(replaceValue);

      var global = rx.global;
      var fullUnicode;
      if (global) {
        fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];
      var result;
      while (true) {
        result = regexpExecAbstract(rx, S);
        if (result === null) break;

        push$4(results, result);
        if (!global) break;

        var matchStr = toString_1(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString_1(result[0]);
        var position = max$2(min$2(toIntegerOrInfinity(result.index), S.length), 0);
        var captures = [];
        var replacement;
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push$4(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat$2([matched], captures, position, S);
          if (namedCaptures !== undefined) push$4(replacerArgs, namedCaptures);
          replacement = toString_1(functionApply(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice$7(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + stringSlice$7(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
// eslint-disable-next-line es/no-object-is -- safe
var sameValue = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
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

var ITERATOR$2 = wellKnownSymbol('iterator');
var ArrayValues = es_array_iterator.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
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

for (var COLLECTION_NAME in domIterables) {
  handlePrototype(global_1[COLLECTION_NAME] && global_1[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(domTokenListPrototype, 'DOMTokenList');

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["vendors~barcode~detail_product~index_sales~pos"],{

/***/"./node_modules/jsbarcode/bin/JsBarcode.js":(
/*!*************************************************!*\
  !*** ./node_modules/jsbarcode/bin/JsBarcode.js ***!
  \*************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinJsBarcodeJs(module,exports,__webpack_require__){


var _barcodes=__webpack_require__(/*! ./barcodes/ */"./node_modules/jsbarcode/bin/barcodes/index.js");

var _barcodes2=_interopRequireDefault(_barcodes);

var _merge=__webpack_require__(/*! ./help/merge.js */"./node_modules/jsbarcode/bin/help/merge.js");

var _merge2=_interopRequireDefault(_merge);

var _linearizeEncodings=__webpack_require__(/*! ./help/linearizeEncodings.js */"./node_modules/jsbarcode/bin/help/linearizeEncodings.js");

var _linearizeEncodings2=_interopRequireDefault(_linearizeEncodings);

var _fixOptions=__webpack_require__(/*! ./help/fixOptions.js */"./node_modules/jsbarcode/bin/help/fixOptions.js");

var _fixOptions2=_interopRequireDefault(_fixOptions);

var _getRenderProperties=__webpack_require__(/*! ./help/getRenderProperties.js */"./node_modules/jsbarcode/bin/help/getRenderProperties.js");

var _getRenderProperties2=_interopRequireDefault(_getRenderProperties);

var _optionsFromStrings=__webpack_require__(/*! ./help/optionsFromStrings.js */"./node_modules/jsbarcode/bin/help/optionsFromStrings.js");

var _optionsFromStrings2=_interopRequireDefault(_optionsFromStrings);

var _ErrorHandler=__webpack_require__(/*! ./exceptions/ErrorHandler.js */"./node_modules/jsbarcode/bin/exceptions/ErrorHandler.js");

var _ErrorHandler2=_interopRequireDefault(_ErrorHandler);

var _exceptions=__webpack_require__(/*! ./exceptions/exceptions.js */"./node_modules/jsbarcode/bin/exceptions/exceptions.js");

var _defaults=__webpack_require__(/*! ./options/defaults.js */"./node_modules/jsbarcode/bin/options/defaults.js");

var _defaults2=_interopRequireDefault(_defaults);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

// The protype of the object returned from the JsBarcode() call


// Help functions
var API=function API(){};

// The first call of the library API
// Will return an object with all barcodes calls and the data that is used
// by the renderers


// Default values


// Exceptions
// Import all the barcodes
var JsBarcode=function JsBarcode(element,text,options){
var api=new API();

if(typeof element==="undefined"){
throw Error("No element to render on was provided.");
}

// Variables that will be pased through the API calls
api._renderProperties=(0, _getRenderProperties2.default)(element);
api._encodings=[];
api._options=_defaults2.default;
api._errorHandler=new _ErrorHandler2.default(api);

// If text is set, use the simple syntax (render the barcode directly)
if(typeof text!=="undefined"){
options=options||{};

if(!options.format){
options.format=autoSelectBarcode();
}

api.options(options)[options.format](text,options).render();
}

return api;
};

// To make tests work TODO: remove
JsBarcode.getModule=function(name){
return _barcodes2.default[name];
};

// Register all barcodes
for(var name in _barcodes2.default){
if(_barcodes2.default.hasOwnProperty(name)){
// Security check if the propery is a prototype property
registerBarcode(_barcodes2.default,name);
}
}
function registerBarcode(barcodes,name){
API.prototype[name]=API.prototype[name.toUpperCase()]=API.prototype[name.toLowerCase()]=function(text,options){
var api=this;
return api._errorHandler.wrapBarcodeCall(function(){
// Ensure text is options.text
options.text=typeof options.text==='undefined'?undefined:''+options.text;

var newOptions=(0, _merge2.default)(api._options,options);
newOptions=(0, _optionsFromStrings2.default)(newOptions);
var Encoder=barcodes[name];
var encoded=encode(text,Encoder,newOptions);
api._encodings.push(encoded);

return api;
});
};
}

// encode() handles the Encoder call and builds the binary string to be rendered
function encode(text,Encoder,options){
// Ensure that text is a string
text=""+text;

var encoder=new Encoder(text,options);

// If the input is not valid for the encoder, throw error.
// If the valid callback option is set, call it instead of throwing error
if(!encoder.valid()){
throw new _exceptions.InvalidInputException(encoder.constructor.name,text);
}

// Make a request for the binary data (and other infromation) that should be rendered
var encoded=encoder.encode();

// Encodings can be nestled like [[1-1, 1-2], 2, [3-1, 3-2]
// Convert to [1-1, 1-2, 2, 3-1, 3-2]
encoded=(0, _linearizeEncodings2.default)(encoded);

// Merge
for(var i=0;i<encoded.length;i++){
encoded[i].options=(0, _merge2.default)(options,encoded[i].options);
}

return encoded;
}

function autoSelectBarcode(){
// If CODE128 exists. Use it
if(_barcodes2.default["CODE128"]){
return "CODE128";
}

// Else, take the first (probably only) barcode
return Object.keys(_barcodes2.default)[0];
}

// Sets global encoder options
// Added to the api by the JsBarcode function
API.prototype.options=function(options){
this._options=(0, _merge2.default)(this._options,options);
return this;
};

// Will create a blank space (usually in between barcodes)
API.prototype.blank=function(size){
var zeroes=new Array(size+1).join("0");
this._encodings.push({data:zeroes});
return this;
};

// Initialize JsBarcode on all HTML elements defined.
API.prototype.init=function(){
// Should do nothing if no elements where found
if(!this._renderProperties){
return;
}

// Make sure renderProperies is an array
if(!Array.isArray(this._renderProperties)){
this._renderProperties=[this._renderProperties];
}

var renderProperty;
for(var i in this._renderProperties){
renderProperty=this._renderProperties[i];
var options=(0, _merge2.default)(this._options,renderProperty.options);

if(options.format=="auto"){
options.format=autoSelectBarcode();
}

this._errorHandler.wrapBarcodeCall(function(){
var text=options.value;
var Encoder=_barcodes2.default[options.format.toUpperCase()];
var encoded=encode(text,Encoder,options);

render(renderProperty,encoded,options);
});
}
};

// The render API call. Calls the real render function.
API.prototype.render=function(){
if(!this._renderProperties){
throw new _exceptions.NoElementException();
}

if(Array.isArray(this._renderProperties)){
for(var i=0;i<this._renderProperties.length;i++){
render(this._renderProperties[i],this._encodings,this._options);
}
}else {
render(this._renderProperties,this._encodings,this._options);
}

return this;
};

API.prototype._defaults=_defaults2.default;

// Prepares the encodings and calls the renderer
function render(renderProperties,encodings,options){
encodings=(0, _linearizeEncodings2.default)(encodings);

for(var i=0;i<encodings.length;i++){
encodings[i].options=(0, _merge2.default)(options,encodings[i].options);
(0, _fixOptions2.default)(encodings[i].options);
}

(0, _fixOptions2.default)(options);

var Renderer=renderProperties.renderer;
var renderer=new Renderer(renderProperties.element,encodings,options);
renderer.render();

if(renderProperties.afterRender){
renderProperties.afterRender();
}
}

// Export to browser
if(typeof window!=="undefined"){
window.JsBarcode=JsBarcode;
}

// Export to jQuery
/*global jQuery */
if(typeof jQuery!=='undefined'){
jQuery.fn.JsBarcode=function(content,options){
var elementArray=[];
jQuery(this).each(function(){
elementArray.push(this);
});
return JsBarcode(elementArray,content,options);
};
}

// Export to commonJS
module.exports=JsBarcode;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/Barcode.js":(
/*!********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/Barcode.js ***!
  \********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesBarcodeJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var Barcode=function Barcode(data,options){
_classCallCheck(this,Barcode);

this.data=data;
this.text=options.text||data;
this.options=options;
};

exports.default=Barcode;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js":(
/*!****************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js ***!
  \****************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128CODE128Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/CODE128/constants.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

// This is the master class,
// it does require the start code to be included in the string
var CODE128=function(_Barcode){
_inherits(CODE128,_Barcode);

function CODE128(data,options){
_classCallCheck(this,CODE128);

// Get array of ascii codes from data
var _this=_possibleConstructorReturn(this,(CODE128.__proto__||Object.getPrototypeOf(CODE128)).call(this,data.substring(1),options));

_this.bytes=data.split('').map(function(char){
return char.charCodeAt(0);
});
return _this;
}

_createClass(CODE128,[{
key:'valid',
value:function valid(){
// ASCII value ranges 0-127, 200-211
return /^[\x00-\x7F\xC8-\xD3]+$/.test(this.data);

}

// The public encoding function

},{
key:'encode',
value:function encode(){
var bytes=this.bytes;
// Remove the start code from the bytes and set its index
var startIndex=bytes.shift()-105;
// Get start set by index
var startSet=_constants.SET_BY_CODE[startIndex];

if(startSet===undefined){
throw new RangeError('The encoding does not start with a start character.');
}

if(this.shouldEncodeAsEan128()===true){
bytes.unshift(_constants.FNC1);
}

// Start encode with the right type
var encodingResult=CODE128.next(bytes,1,startSet);

return {
text:this.text===this.data?this.text.replace(/[^\x20-\x7E]/g,''):this.text,
data:
// Add the start bits
CODE128.getBar(startIndex)+
// Add the encoded bits
encodingResult.result+
// Add the checksum
CODE128.getBar((encodingResult.checksum+startIndex)%_constants.MODULO)+
// Add the end bits
CODE128.getBar(_constants.STOP)
};
}

// GS1-128/EAN-128

},{
key:'shouldEncodeAsEan128',
value:function shouldEncodeAsEan128(){
var isEAN128=this.options.ean128||false;
if(typeof isEAN128==='string'){
isEAN128=isEAN128.toLowerCase()==='true';
}
return isEAN128;
}

// Get a bar symbol by index

}],[{
key:'getBar',
value:function getBar(index){
return _constants.BARS[index]?_constants.BARS[index].toString():'';
}

// Correct an index by a set and shift it from the bytes array

},{
key:'correctIndex',
value:function correctIndex(bytes,set){
if(set===_constants.SET_A){
var charCode=bytes.shift();
return charCode<32?charCode+64:charCode-32;
}else if(set===_constants.SET_B){
return bytes.shift()-32;
}else {
return (bytes.shift()-48)*10+bytes.shift()-48;
}
}
},{
key:'next',
value:function next(bytes,pos,set){
if(!bytes.length){
return {result:'',checksum:0};
}

var nextCode=void 0,
index=void 0;

// Special characters
if(bytes[0]>=200){
index=bytes.shift()-105;
var nextSet=_constants.SWAP[index];

// Swap to other set
if(nextSet!==undefined){
nextCode=CODE128.next(bytes,pos+1,nextSet);
}
// Continue on current set but encode a special character
else {
// Shift
if((set===_constants.SET_A||set===_constants.SET_B)&&index===_constants.SHIFT){
// Convert the next character so that is encoded correctly
bytes[0]=set===_constants.SET_A?bytes[0]>95?bytes[0]-96:bytes[0]:bytes[0]<32?bytes[0]+96:bytes[0];
}
nextCode=CODE128.next(bytes,pos+1,set);
}
}
// Continue encoding
else {
index=CODE128.correctIndex(bytes,set);
nextCode=CODE128.next(bytes,pos+1,set);
}

// Get the correct binary encoding and calculate the weight
var enc=CODE128.getBar(index);
var weight=index*pos;

return {
result:enc+nextCode.result,
checksum:weight+nextCode.checksum
};
}
}]);

return CODE128;
}(_Barcode3.default);

exports.default=CODE128;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128A.js":(
/*!*****************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128A.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128CODE128AJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _CODE2=__webpack_require__(/*! ./CODE128.js */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js");

var _CODE3=_interopRequireDefault(_CODE2);

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/CODE128/constants.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var CODE128A=function(_CODE){
_inherits(CODE128A,_CODE);

function CODE128A(string,options){
_classCallCheck(this,CODE128A);

return _possibleConstructorReturn(this,(CODE128A.__proto__||Object.getPrototypeOf(CODE128A)).call(this,_constants.A_START_CHAR+string,options));
}

_createClass(CODE128A,[{
key:'valid',
value:function valid(){
return new RegExp('^'+_constants.A_CHARS+'+$').test(this.data);
}
}]);

return CODE128A;
}(_CODE3.default);

exports.default=CODE128A;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128B.js":(
/*!*****************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128B.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128CODE128BJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _CODE2=__webpack_require__(/*! ./CODE128.js */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js");

var _CODE3=_interopRequireDefault(_CODE2);

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/CODE128/constants.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var CODE128B=function(_CODE){
_inherits(CODE128B,_CODE);

function CODE128B(string,options){
_classCallCheck(this,CODE128B);

return _possibleConstructorReturn(this,(CODE128B.__proto__||Object.getPrototypeOf(CODE128B)).call(this,_constants.B_START_CHAR+string,options));
}

_createClass(CODE128B,[{
key:'valid',
value:function valid(){
return new RegExp('^'+_constants.B_CHARS+'+$').test(this.data);
}
}]);

return CODE128B;
}(_CODE3.default);

exports.default=CODE128B;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128C.js":(
/*!*****************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128C.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128CODE128CJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _CODE2=__webpack_require__(/*! ./CODE128.js */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js");

var _CODE3=_interopRequireDefault(_CODE2);

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/CODE128/constants.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var CODE128C=function(_CODE){
_inherits(CODE128C,_CODE);

function CODE128C(string,options){
_classCallCheck(this,CODE128C);

return _possibleConstructorReturn(this,(CODE128C.__proto__||Object.getPrototypeOf(CODE128C)).call(this,_constants.C_START_CHAR+string,options));
}

_createClass(CODE128C,[{
key:'valid',
value:function valid(){
return new RegExp('^'+_constants.C_CHARS+'+$').test(this.data);
}
}]);

return CODE128C;
}(_CODE3.default);

exports.default=CODE128C;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128_AUTO.js":(
/*!*********************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128_AUTO.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128CODE128_AUTOJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _CODE2=__webpack_require__(/*! ./CODE128 */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js");

var _CODE3=_interopRequireDefault(_CODE2);

var _auto=__webpack_require__(/*! ./auto */"./node_modules/jsbarcode/bin/barcodes/CODE128/auto.js");

var _auto2=_interopRequireDefault(_auto);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var CODE128AUTO=function(_CODE){
_inherits(CODE128AUTO,_CODE);

function CODE128AUTO(data,options){
_classCallCheck(this,CODE128AUTO);

// ASCII value ranges 0-127, 200-211
if(/^[\x00-\x7F\xC8-\xD3]+$/.test(data)){
var _this=_possibleConstructorReturn(this,(CODE128AUTO.__proto__||Object.getPrototypeOf(CODE128AUTO)).call(this,(0, _auto2.default)(data),options));
}else {
var _this=_possibleConstructorReturn(this,(CODE128AUTO.__proto__||Object.getPrototypeOf(CODE128AUTO)).call(this,data,options));
}
return _possibleConstructorReturn(_this);
}

return CODE128AUTO;
}(_CODE3.default);

exports.default=CODE128AUTO;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/auto.js":(
/*!*************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/auto.js ***!
  \*************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128AutoJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/CODE128/constants.js");

// Match Set functions
var matchSetALength=function matchSetALength(string){
return string.match(new RegExp('^'+_constants.A_CHARS+'*'))[0].length;
};
var matchSetBLength=function matchSetBLength(string){
return string.match(new RegExp('^'+_constants.B_CHARS+'*'))[0].length;
};
var matchSetC=function matchSetC(string){
return string.match(new RegExp('^'+_constants.C_CHARS+'*'))[0];
};

// CODE128A or CODE128B
function autoSelectFromAB(string,isA){
var ranges=isA?_constants.A_CHARS:_constants.B_CHARS;
var untilC=string.match(new RegExp('^('+ranges+'+?)(([0-9]{2}){2,})([^0-9]|$)'));

if(untilC){
return untilC[1]+String.fromCharCode(204)+autoSelectFromC(string.substring(untilC[1].length));
}

var chars=string.match(new RegExp('^'+ranges+'+'))[0];

if(chars.length===string.length){
return string;
}

return chars+String.fromCharCode(isA?205:206)+autoSelectFromAB(string.substring(chars.length),!isA);
}

// CODE128C
function autoSelectFromC(string){
var cMatch=matchSetC(string);
var length=cMatch.length;

if(length===string.length){
return string;
}

string=string.substring(length);

// Select A/B depending on the longest match
var isA=matchSetALength(string)>=matchSetBLength(string);
return cMatch+String.fromCharCode(isA?206:205)+autoSelectFromAB(string,isA);
}

// Detect Code Set (A, B or C) and format the string

exports.default=function(string){
var newString=void 0;
var cLength=matchSetC(string).length;

// Select 128C if the string start with enough digits
if(cLength>=2){
newString=_constants.C_START_CHAR+autoSelectFromC(string);
}else {
// Select A/B depending on the longest match
var isA=matchSetALength(string)>matchSetBLength(string);
newString=(isA?_constants.A_START_CHAR:_constants.B_START_CHAR)+autoSelectFromAB(string,isA);
}

return newString.replace(/[\xCD\xCE]([^])[\xCD\xCE]/,// Any sequence between 205 and 206 characters
function(match,char){
return String.fromCharCode(203)+char;
});
};

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/constants.js":(
/*!******************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/constants.js ***!
  \******************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128ConstantsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _SET_BY_CODE;

function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}

// constants for internal usage
var SET_A=exports.SET_A=0;
var SET_B=exports.SET_B=1;
var SET_C=exports.SET_C=2;

// Special characters
var SHIFT=exports.SHIFT=98;
var START_A=exports.START_A=103;
var START_B=exports.START_B=104;
var START_C=exports.START_C=105;
var MODULO=exports.MODULO=103;
var STOP=exports.STOP=106;
var FNC1=exports.FNC1=207;

// Get set by start code
var SET_BY_CODE=exports.SET_BY_CODE=(_SET_BY_CODE={},_defineProperty(_SET_BY_CODE,START_A,SET_A),_defineProperty(_SET_BY_CODE,START_B,SET_B),_defineProperty(_SET_BY_CODE,START_C,SET_C),_SET_BY_CODE);

// Get next set by code
var SWAP=exports.SWAP={
101:SET_A,
100:SET_B,
99:SET_C
};

var A_START_CHAR=exports.A_START_CHAR=String.fromCharCode(208);// START_A + 105
var B_START_CHAR=exports.B_START_CHAR=String.fromCharCode(209);// START_B + 105
var C_START_CHAR=exports.C_START_CHAR=String.fromCharCode(210);// START_C + 105

// 128A (Code Set A)
// ASCII characters 00 to 95 (0–9, A–Z and control codes), special characters, and FNC 1–4
var A_CHARS=exports.A_CHARS="[\x00-\x5F\xC8-\xCF]";

// 128B (Code Set B)
// ASCII characters 32 to 127 (0–9, A–Z, a–z), special characters, and FNC 1–4
var B_CHARS=exports.B_CHARS="[\x20-\x7F\xC8-\xCF]";

// 128C (Code Set C)
// 00–99 (encodes two digits with a single code point) and FNC1
var C_CHARS=exports.C_CHARS="(\xCF*[0-9]{2}\xCF*)";

// CODE128 includes 107 symbols:
// 103 data symbols, 3 start symbols (A, B and C), and 1 stop symbol (the last one)
// Each symbol consist of three black bars (1) and three white spaces (0).
var BARS=exports.BARS=[11011001100,11001101100,11001100110,10010011000,10010001100,10001001100,10011001000,10011000100,10001100100,11001001000,11001000100,11000100100,10110011100,10011011100,10011001110,10111001100,10011101100,10011100110,11001110010,11001011100,11001001110,11011100100,11001110100,11101101110,11101001100,11100101100,11100100110,11101100100,11100110100,11100110010,11011011000,11011000110,11000110110,10100011000,10001011000,10001000110,10110001000,10001101000,10001100010,11010001000,11000101000,11000100010,10110111000,10110001110,10001101110,10111011000,10111000110,10001110110,11101110110,11010001110,11000101110,11011101000,11011100010,11011101110,11101011000,11101000110,11100010110,11101101000,11101100010,11100011010,11101111010,11001000010,11110001010,10100110000,10100001100,10010110000,10010000110,10000101100,10000100110,10110010000,10110000100,10011010000,10011000010,10000110100,10000110010,11000010010,11001010000,11110111010,11000010100,10001111010,10100111100,10010111100,10010011110,10111100100,10011110100,10011110010,11110100100,11110010100,11110010010,11011011110,11011110110,11110110110,10101111000,10100011110,10001011110,10111101000,10111100010,11110101000,11110100010,10111011110,10111101110,11101011110,11110101110,11010000100,11010010000,11010011100,1100011101011];

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE128/index.js":(
/*!**************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE128/index.js ***!
  \**************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE128IndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.CODE128C=exports.CODE128B=exports.CODE128A=exports.CODE128=undefined;

var _CODE128_AUTO=__webpack_require__(/*! ./CODE128_AUTO.js */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128_AUTO.js");

var _CODE128_AUTO2=_interopRequireDefault(_CODE128_AUTO);

var _CODE128A=__webpack_require__(/*! ./CODE128A.js */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128A.js");

var _CODE128A2=_interopRequireDefault(_CODE128A);

var _CODE128B=__webpack_require__(/*! ./CODE128B.js */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128B.js");

var _CODE128B2=_interopRequireDefault(_CODE128B);

var _CODE128C=__webpack_require__(/*! ./CODE128C.js */"./node_modules/jsbarcode/bin/barcodes/CODE128/CODE128C.js");

var _CODE128C2=_interopRequireDefault(_CODE128C);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

exports.CODE128=_CODE128_AUTO2.default;
exports.CODE128A=_CODE128A2.default;
exports.CODE128B=_CODE128B2.default;
exports.CODE128C=_CODE128C2.default;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/CODE39/index.js":(
/*!*************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/CODE39/index.js ***!
  \*************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCODE39IndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.CODE39=undefined;

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation:
// https://en.wikipedia.org/wiki/Code_39#Encoding

var CODE39=function(_Barcode){
_inherits(CODE39,_Barcode);

function CODE39(data,options){
_classCallCheck(this,CODE39);

data=data.toUpperCase();

// Calculate mod43 checksum if enabled
if(options.mod43){
data+=getCharacter(mod43checksum(data));
}

return _possibleConstructorReturn(this,(CODE39.__proto__||Object.getPrototypeOf(CODE39)).call(this,data,options));
}

_createClass(CODE39,[{
key:"encode",
value:function encode(){
// First character is always a *
var result=getEncoding("*");

// Take every character and add the binary representation to the result
for(var i=0;i<this.data.length;i++){
result+=getEncoding(this.data[i])+"0";
}

// Last character is always a *
result+=getEncoding("*");

return {
data:result,
text:this.text
};
}
},{
key:"valid",
value:function valid(){
return this.data.search(/^[0-9A-Z\-\.\ \$\/\+\%]+$/)!==-1;
}
}]);

return CODE39;
}(_Barcode3.default);

// All characters. The position in the array is the (checksum) value


var characters=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","-","."," ","$","/","+","%","*"];

// The decimal representation of the characters, is converted to the
// corresponding binary with the getEncoding function
var encodings=[20957,29783,23639,30485,20951,29813,23669,20855,29789,23645,29975,23831,30533,22295,30149,24005,21623,29981,23837,22301,30023,23879,30545,22343,30161,24017,21959,30065,23921,22385,29015,18263,29141,17879,29045,18293,17783,29021,18269,17477,17489,17681,20753,35770];

// Get the binary representation of a character by converting the encodings
// from decimal to binary
function getEncoding(character){
return getBinary(characterValue(character));
}

function getBinary(characterValue){
return encodings[characterValue].toString(2);
}

function getCharacter(characterValue){
return characters[characterValue];
}

function characterValue(character){
return characters.indexOf(character);
}

function mod43checksum(data){
var checksum=0;
for(var i=0;i<data.length;i++){
checksum+=characterValue(data[i]);
}

checksum=checksum%43;
return checksum;
}

exports.CODE39=CODE39;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN.js":(
/*!************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN.js ***!
  \************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCEANJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js");

var _encoder=__webpack_require__(/*! ./encoder */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js");

var _encoder2=_interopRequireDefault(_encoder);

var _Barcode2=__webpack_require__(/*! ../Barcode */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

// Base class for EAN8 & EAN13
var EAN=function(_Barcode){
_inherits(EAN,_Barcode);

function EAN(data,options){
_classCallCheck(this,EAN);

// Make sure the font is not bigger than the space between the guard bars
var _this=_possibleConstructorReturn(this,(EAN.__proto__||Object.getPrototypeOf(EAN)).call(this,data,options));

_this.fontSize=!options.flat&&options.fontSize>options.width*10?options.width*10:options.fontSize;

// Make the guard bars go down half the way of the text
_this.guardHeight=options.height+_this.fontSize/2+options.textMargin;
return _this;
}

_createClass(EAN,[{
key:'encode',
value:function encode(){
return this.options.flat?this.encodeFlat():this.encodeGuarded();
}
},{
key:'leftText',
value:function leftText(from,to){
return this.text.substr(from,to);
}
},{
key:'leftEncode',
value:function leftEncode(data,structure){
return (0, _encoder2.default)(data,structure);
}
},{
key:'rightText',
value:function rightText(from,to){
return this.text.substr(from,to);
}
},{
key:'rightEncode',
value:function rightEncode(data,structure){
return (0, _encoder2.default)(data,structure);
}
},{
key:'encodeGuarded',
value:function encodeGuarded(){
var textOptions={fontSize:this.fontSize};
var guardOptions={height:this.guardHeight};

return [{data:_constants.SIDE_BIN,options:guardOptions},{data:this.leftEncode(),text:this.leftText(),options:textOptions},{data:_constants.MIDDLE_BIN,options:guardOptions},{data:this.rightEncode(),text:this.rightText(),options:textOptions},{data:_constants.SIDE_BIN,options:guardOptions}];
}
},{
key:'encodeFlat',
value:function encodeFlat(){
var data=[_constants.SIDE_BIN,this.leftEncode(),_constants.MIDDLE_BIN,this.rightEncode(),_constants.SIDE_BIN];

return {
data:data.join(''),
text:this.text
};
}
}]);

return EAN;
}(_Barcode3.default);

exports.default=EAN;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN13.js":(
/*!**************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN13.js ***!
  \**************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCEAN13Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else {return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else {var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js");

var _EAN2=__webpack_require__(/*! ./EAN */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN.js");

var _EAN3=_interopRequireDefault(_EAN2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation:
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Binary_encoding_of_data_digits_into_EAN-13_barcode

// Calculate the checksum digit
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Calculation_of_checksum_digit
var checksum=function checksum(number){
var res=number.substr(0,12).split('').map(function(n){
return +n;
}).reduce(function(sum,a,idx){
return idx%2?sum+a*3:sum+a;
},0);

return (10-res%10)%10;
};

var EAN13=function(_EAN){
_inherits(EAN13,_EAN);

function EAN13(data,options){
_classCallCheck(this,EAN13);

// Add checksum if it does not exist
if(data.search(/^[0-9]{12}$/)!==-1){
data+=checksum(data);
}

// Adds a last character to the end of the barcode
var _this=_possibleConstructorReturn(this,(EAN13.__proto__||Object.getPrototypeOf(EAN13)).call(this,data,options));

_this.lastChar=options.lastChar;
return _this;
}

_createClass(EAN13,[{
key:'valid',
value:function valid(){
return this.data.search(/^[0-9]{13}$/)!==-1&&+this.data[12]===checksum(this.data);
}
},{
key:'leftText',
value:function leftText(){
return _get(EAN13.prototype.__proto__||Object.getPrototypeOf(EAN13.prototype),'leftText',this).call(this,1,6);
}
},{
key:'leftEncode',
value:function leftEncode(){
var data=this.data.substr(1,6);
var structure=_constants.EAN13_STRUCTURE[this.data[0]];
return _get(EAN13.prototype.__proto__||Object.getPrototypeOf(EAN13.prototype),'leftEncode',this).call(this,data,structure);
}
},{
key:'rightText',
value:function rightText(){
return _get(EAN13.prototype.__proto__||Object.getPrototypeOf(EAN13.prototype),'rightText',this).call(this,7,6);
}
},{
key:'rightEncode',
value:function rightEncode(){
var data=this.data.substr(7,6);
return _get(EAN13.prototype.__proto__||Object.getPrototypeOf(EAN13.prototype),'rightEncode',this).call(this,data,'RRRRRR');
}

// The "standard" way of printing EAN13 barcodes with guard bars

},{
key:'encodeGuarded',
value:function encodeGuarded(){
var data=_get(EAN13.prototype.__proto__||Object.getPrototypeOf(EAN13.prototype),'encodeGuarded',this).call(this);

// Extend data with left digit & last character
if(this.options.displayValue){
data.unshift({
data:'000000000000',
text:this.text.substr(0,1),
options:{textAlign:'left',fontSize:this.fontSize}
});

if(this.options.lastChar){
data.push({
data:'00'
});
data.push({
data:'00000',
text:this.options.lastChar,
options:{fontSize:this.fontSize}
});
}
}

return data;
}
}]);

return EAN13;
}(_EAN3.default);

exports.default=EAN13;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN2.js":(
/*!*************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN2.js ***!
  \*************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCEAN2Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js");

var _encoder=__webpack_require__(/*! ./encoder */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js");

var _encoder2=_interopRequireDefault(_encoder);

var _Barcode2=__webpack_require__(/*! ../Barcode */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation:
// https://en.wikipedia.org/wiki/EAN_2#Encoding

var EAN2=function(_Barcode){
_inherits(EAN2,_Barcode);

function EAN2(data,options){
_classCallCheck(this,EAN2);

return _possibleConstructorReturn(this,(EAN2.__proto__||Object.getPrototypeOf(EAN2)).call(this,data,options));
}

_createClass(EAN2,[{
key:'valid',
value:function valid(){
return this.data.search(/^[0-9]{2}$/)!==-1;
}
},{
key:'encode',
value:function encode(){
// Choose the structure based on the number mod 4
var structure=_constants.EAN2_STRUCTURE[parseInt(this.data)%4];
return {
// Start bits + Encode the two digits with 01 in between
data:'1011'+(0, _encoder2.default)(this.data,structure,'01'),
text:this.text
};
}
}]);

return EAN2;
}(_Barcode3.default);

exports.default=EAN2;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN5.js":(
/*!*************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN5.js ***!
  \*************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCEAN5Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js");

var _encoder=__webpack_require__(/*! ./encoder */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js");

var _encoder2=_interopRequireDefault(_encoder);

var _Barcode2=__webpack_require__(/*! ../Barcode */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation:
// https://en.wikipedia.org/wiki/EAN_5#Encoding

var checksum=function checksum(data){
var result=data.split('').map(function(n){
return +n;
}).reduce(function(sum,a,idx){
return idx%2?sum+a*9:sum+a*3;
},0);
return result%10;
};

var EAN5=function(_Barcode){
_inherits(EAN5,_Barcode);

function EAN5(data,options){
_classCallCheck(this,EAN5);

return _possibleConstructorReturn(this,(EAN5.__proto__||Object.getPrototypeOf(EAN5)).call(this,data,options));
}

_createClass(EAN5,[{
key:'valid',
value:function valid(){
return this.data.search(/^[0-9]{5}$/)!==-1;
}
},{
key:'encode',
value:function encode(){
var structure=_constants.EAN5_STRUCTURE[checksum(this.data)];
return {
data:'1011'+(0, _encoder2.default)(this.data,structure,'01'),
text:this.text
};
}
}]);

return EAN5;
}(_Barcode3.default);

exports.default=EAN5;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN8.js":(
/*!*************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN8.js ***!
  \*************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCEAN8Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else {return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else {var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};

var _EAN2=__webpack_require__(/*! ./EAN */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN.js");

var _EAN3=_interopRequireDefault(_EAN2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation:
// http://www.barcodeisland.com/ean8.phtml

// Calculate the checksum digit
var checksum=function checksum(number){
var res=number.substr(0,7).split('').map(function(n){
return +n;
}).reduce(function(sum,a,idx){
return idx%2?sum+a:sum+a*3;
},0);

return (10-res%10)%10;
};

var EAN8=function(_EAN){
_inherits(EAN8,_EAN);

function EAN8(data,options){
_classCallCheck(this,EAN8);

// Add checksum if it does not exist
if(data.search(/^[0-9]{7}$/)!==-1){
data+=checksum(data);
}

return _possibleConstructorReturn(this,(EAN8.__proto__||Object.getPrototypeOf(EAN8)).call(this,data,options));
}

_createClass(EAN8,[{
key:'valid',
value:function valid(){
return this.data.search(/^[0-9]{8}$/)!==-1&&+this.data[7]===checksum(this.data);
}
},{
key:'leftText',
value:function leftText(){
return _get(EAN8.prototype.__proto__||Object.getPrototypeOf(EAN8.prototype),'leftText',this).call(this,0,4);
}
},{
key:'leftEncode',
value:function leftEncode(){
var data=this.data.substr(0,4);
return _get(EAN8.prototype.__proto__||Object.getPrototypeOf(EAN8.prototype),'leftEncode',this).call(this,data,'LLLL');
}
},{
key:'rightText',
value:function rightText(){
return _get(EAN8.prototype.__proto__||Object.getPrototypeOf(EAN8.prototype),'rightText',this).call(this,4,4);
}
},{
key:'rightEncode',
value:function rightEncode(){
var data=this.data.substr(4,4);
return _get(EAN8.prototype.__proto__||Object.getPrototypeOf(EAN8.prototype),'rightEncode',this).call(this,data,'RRRR');
}
}]);

return EAN8;
}(_EAN3.default);

exports.default=EAN8;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPC.js":(
/*!************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPC.js ***!
  \************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCUPCJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

exports.checksum=checksum;

var _encoder=__webpack_require__(/*! ./encoder */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js");

var _encoder2=_interopRequireDefault(_encoder);

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#Encoding

var UPC=function(_Barcode){
_inherits(UPC,_Barcode);

function UPC(data,options){
_classCallCheck(this,UPC);

// Add checksum if it does not exist
if(data.search(/^[0-9]{11}$/)!==-1){
data+=checksum(data);
}

var _this=_possibleConstructorReturn(this,(UPC.__proto__||Object.getPrototypeOf(UPC)).call(this,data,options));

_this.displayValue=options.displayValue;

// Make sure the font is not bigger than the space between the guard bars
if(options.fontSize>options.width*10){
_this.fontSize=options.width*10;
}else {
_this.fontSize=options.fontSize;
}

// Make the guard bars go down half the way of the text
_this.guardHeight=options.height+_this.fontSize/2+options.textMargin;
return _this;
}

_createClass(UPC,[{
key:"valid",
value:function valid(){
return this.data.search(/^[0-9]{12}$/)!==-1&&this.data[11]==checksum(this.data);
}
},{
key:"encode",
value:function encode(){
if(this.options.flat){
return this.flatEncoding();
}else {
return this.guardedEncoding();
}
}
},{
key:"flatEncoding",
value:function flatEncoding(){
var result="";

result+="101";
result+=(0, _encoder2.default)(this.data.substr(0,6),"LLLLLL");
result+="01010";
result+=(0, _encoder2.default)(this.data.substr(6,6),"RRRRRR");
result+="101";

return {
data:result,
text:this.text
};
}
},{
key:"guardedEncoding",
value:function guardedEncoding(){
var result=[];

// Add the first digit
if(this.displayValue){
result.push({
data:"00000000",
text:this.text.substr(0,1),
options:{textAlign:"left",fontSize:this.fontSize}
});
}

// Add the guard bars
result.push({
data:"101"+(0, _encoder2.default)(this.data[0],"L"),
options:{height:this.guardHeight}
});

// Add the left side
result.push({
data:(0, _encoder2.default)(this.data.substr(1,5),"LLLLL"),
text:this.text.substr(1,5),
options:{fontSize:this.fontSize}
});

// Add the middle bits
result.push({
data:"01010",
options:{height:this.guardHeight}
});

// Add the right side
result.push({
data:(0, _encoder2.default)(this.data.substr(6,5),"RRRRR"),
text:this.text.substr(6,5),
options:{fontSize:this.fontSize}
});

// Add the end bits
result.push({
data:(0, _encoder2.default)(this.data[11],"R")+"101",
options:{height:this.guardHeight}
});

// Add the last digit
if(this.displayValue){
result.push({
data:"00000000",
text:this.text.substr(11,1),
options:{textAlign:"right",fontSize:this.fontSize}
});
}

return result;
}
}]);

return UPC;
}(_Barcode3.default);

// Calulate the checksum digit
// https://en.wikipedia.org/wiki/International_Article_Number_(EAN)#Calculation_of_checksum_digit


function checksum(number){
var result=0;

var i;
for(i=1;i<11;i+=2){
result+=parseInt(number[i]);
}
for(i=0;i<11;i+=2){
result+=parseInt(number[i])*3;
}

return (10-result%10)%10;
}

exports.default=UPC;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPCE.js":(
/*!*************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPCE.js ***!
  \*************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCUPCEJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _encoder=__webpack_require__(/*! ./encoder */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js");

var _encoder2=_interopRequireDefault(_encoder);

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

var _UPC=__webpack_require__(/*! ./UPC.js */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPC.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#Encoding
//
// UPC-E documentation:
// https://en.wikipedia.org/wiki/Universal_Product_Code#UPC-E

var EXPANSIONS=["XX00000XXX","XX10000XXX","XX20000XXX","XXX00000XX","XXXX00000X","XXXXX00005","XXXXX00006","XXXXX00007","XXXXX00008","XXXXX00009"];

var PARITIES=[["EEEOOO","OOOEEE"],["EEOEOO","OOEOEE"],["EEOOEO","OOEEOE"],["EEOOOE","OOEEEO"],["EOEEOO","OEOOEE"],["EOOEEO","OEEOOE"],["EOOOEE","OEEEOO"],["EOEOEO","OEOEOE"],["EOEOOE","OEOEEO"],["EOOEOE","OEEOEO"]];

var UPCE=function(_Barcode){
_inherits(UPCE,_Barcode);

function UPCE(data,options){
_classCallCheck(this,UPCE);

var _this=_possibleConstructorReturn(this,(UPCE.__proto__||Object.getPrototypeOf(UPCE)).call(this,data,options));
// Code may be 6 or 8 digits;
// A 7 digit code is ambiguous as to whether the extra digit
// is a UPC-A check or number system digit.


_this.isValid=false;
if(data.search(/^[0-9]{6}$/)!==-1){
_this.middleDigits=data;
_this.upcA=expandToUPCA(data,"0");
_this.text=options.text||''+_this.upcA[0]+data+_this.upcA[_this.upcA.length-1];
_this.isValid=true;
}else if(data.search(/^[01][0-9]{7}$/)!==-1){
_this.middleDigits=data.substring(1,data.length-1);
_this.upcA=expandToUPCA(_this.middleDigits,data[0]);

if(_this.upcA[_this.upcA.length-1]===data[data.length-1]){
_this.isValid=true;
}else {
// checksum mismatch
return _possibleConstructorReturn(_this);
}
}else {
return _possibleConstructorReturn(_this);
}

_this.displayValue=options.displayValue;

// Make sure the font is not bigger than the space between the guard bars
if(options.fontSize>options.width*10){
_this.fontSize=options.width*10;
}else {
_this.fontSize=options.fontSize;
}

// Make the guard bars go down half the way of the text
_this.guardHeight=options.height+_this.fontSize/2+options.textMargin;
return _this;
}

_createClass(UPCE,[{
key:'valid',
value:function valid(){
return this.isValid;
}
},{
key:'encode',
value:function encode(){
if(this.options.flat){
return this.flatEncoding();
}else {
return this.guardedEncoding();
}
}
},{
key:'flatEncoding',
value:function flatEncoding(){
var result="";

result+="101";
result+=this.encodeMiddleDigits();
result+="010101";

return {
data:result,
text:this.text
};
}
},{
key:'guardedEncoding',
value:function guardedEncoding(){
var result=[];

// Add the UPC-A number system digit beneath the quiet zone
if(this.displayValue){
result.push({
data:"00000000",
text:this.text[0],
options:{textAlign:"left",fontSize:this.fontSize}
});
}

// Add the guard bars
result.push({
data:"101",
options:{height:this.guardHeight}
});

// Add the 6 UPC-E digits
result.push({
data:this.encodeMiddleDigits(),
text:this.text.substring(1,7),
options:{fontSize:this.fontSize}
});

// Add the end bits
result.push({
data:"010101",
options:{height:this.guardHeight}
});

// Add the UPC-A check digit beneath the quiet zone
if(this.displayValue){
result.push({
data:"00000000",
text:this.text[7],
options:{textAlign:"right",fontSize:this.fontSize}
});
}

return result;
}
},{
key:'encodeMiddleDigits',
value:function encodeMiddleDigits(){
var numberSystem=this.upcA[0];
var checkDigit=this.upcA[this.upcA.length-1];
var parity=PARITIES[parseInt(checkDigit)][parseInt(numberSystem)];
return (0, _encoder2.default)(this.middleDigits,parity);
}
}]);

return UPCE;
}(_Barcode3.default);

function expandToUPCA(middleDigits,numberSystem){
var lastUpcE=parseInt(middleDigits[middleDigits.length-1]);
var expansion=EXPANSIONS[lastUpcE];

var result="";
var digitIndex=0;
for(var i=0;i<expansion.length;i++){
var c=expansion[i];
if(c==='X'){
result+=middleDigits[digitIndex++];
}else {
result+=c;
}
}

result=''+numberSystem+result;
return ''+result+(0, _UPC.checksum)(result);
}

exports.default=UPCE;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js":(
/*!******************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js ***!
  \******************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCConstantsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
// Standard start end and middle bits
var SIDE_BIN=exports.SIDE_BIN='101';
var MIDDLE_BIN=exports.MIDDLE_BIN='01010';

var BINARIES=exports.BINARIES={
'L':[// The L (left) type of encoding
'0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],
'G':[// The G type of encoding
'0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],
'R':[// The R (right) type of encoding
'1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'],
'O':[// The O (odd) encoding for UPC-E
'0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],
'E':[// The E (even) encoding for UPC-E
'0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
};

// Define the EAN-2 structure
var EAN2_STRUCTURE=exports.EAN2_STRUCTURE=['LL','LG','GL','GG'];

// Define the EAN-5 structure
var EAN5_STRUCTURE=exports.EAN5_STRUCTURE=['GGLLL','GLGLL','GLLGL','GLLLG','LGGLL','LLGGL','LLLGG','LGLGL','LGLLG','LLGLG'];

// Define the EAN-13 structure
var EAN13_STRUCTURE=exports.EAN13_STRUCTURE=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js":(
/*!****************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js ***!
  \****************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCEncoderJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js");

// Encode data string
var encode=function encode(data,structure,separator){
var encoded=data.split('').map(function(val,idx){
return _constants.BINARIES[structure[idx]];
}).map(function(val,idx){
return val?val[data[idx]]:'';
});

if(separator){
var last=data.length-1;
encoded=encoded.map(function(val,idx){
return idx<last?val+separator:val;
});
}

return encoded.join('');
};

exports.default=encode;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/index.js":(
/*!**************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/EAN_UPC/index.js ***!
  \**************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesEAN_UPCIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.UPCE=exports.UPC=exports.EAN2=exports.EAN5=exports.EAN8=exports.EAN13=undefined;

var _EAN=__webpack_require__(/*! ./EAN13.js */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN13.js");

var _EAN2=_interopRequireDefault(_EAN);

var _EAN3=__webpack_require__(/*! ./EAN8.js */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN8.js");

var _EAN4=_interopRequireDefault(_EAN3);

var _EAN5=__webpack_require__(/*! ./EAN5.js */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN5.js");

var _EAN6=_interopRequireDefault(_EAN5);

var _EAN7=__webpack_require__(/*! ./EAN2.js */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN2.js");

var _EAN8=_interopRequireDefault(_EAN7);

var _UPC=__webpack_require__(/*! ./UPC.js */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPC.js");

var _UPC2=_interopRequireDefault(_UPC);

var _UPCE=__webpack_require__(/*! ./UPCE.js */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPCE.js");

var _UPCE2=_interopRequireDefault(_UPCE);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

exports.EAN13=_EAN2.default;
exports.EAN8=_EAN4.default;
exports.EAN5=_EAN6.default;
exports.EAN2=_EAN8.default;
exports.UPC=_UPC2.default;
exports.UPCE=_UPCE2.default;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/GenericBarcode/index.js":(
/*!*********************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/GenericBarcode/index.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesGenericBarcodeIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.GenericBarcode=undefined;

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var GenericBarcode=function(_Barcode){
_inherits(GenericBarcode,_Barcode);

function GenericBarcode(data,options){
_classCallCheck(this,GenericBarcode);

return _possibleConstructorReturn(this,(GenericBarcode.__proto__||Object.getPrototypeOf(GenericBarcode)).call(this,data,options));// Sets this.data and this.text
}

// Return the corresponding binary numbers for the data provided


_createClass(GenericBarcode,[{
key:"encode",
value:function encode(){
return {
data:"10101010101010101010101010101010101010101",
text:this.text
};
}

// Resturn true/false if the string provided is valid for this encoder

},{
key:"valid",
value:function valid(){
return true;
}
}]);

return GenericBarcode;
}(_Barcode3.default);

exports.GenericBarcode=GenericBarcode;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/ITF/ITF.js":(
/*!********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/ITF/ITF.js ***!
  \********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesITFITFJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _constants=__webpack_require__(/*! ./constants */"./node_modules/jsbarcode/bin/barcodes/ITF/constants.js");

var _Barcode2=__webpack_require__(/*! ../Barcode */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var ITF=function(_Barcode){
_inherits(ITF,_Barcode);

function ITF(){
_classCallCheck(this,ITF);

return _possibleConstructorReturn(this,(ITF.__proto__||Object.getPrototypeOf(ITF)).apply(this,arguments));
}

_createClass(ITF,[{
key:'valid',
value:function valid(){
return this.data.search(/^([0-9]{2})+$/)!==-1;
}
},{
key:'encode',
value:function encode(){
var _this2=this;

// Calculate all the digit pairs
var encoded=this.data.match(/.{2}/g).map(function(pair){
return _this2.encodePair(pair);
}).join('');

return {
data:_constants.START_BIN+encoded+_constants.END_BIN,
text:this.text
};
}

// Calculate the data of a number pair

},{
key:'encodePair',
value:function encodePair(pair){
var second=_constants.BINARIES[pair[1]];

return _constants.BINARIES[pair[0]].split('').map(function(first,idx){
return (first==='1'?'111':'1')+(second[idx]==='1'?'000':'0');
}).join('');
}
}]);

return ITF;
}(_Barcode3.default);

exports.default=ITF;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/ITF/ITF14.js":(
/*!**********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/ITF/ITF14.js ***!
  \**********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesITFITF14Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _ITF2=__webpack_require__(/*! ./ITF */"./node_modules/jsbarcode/bin/barcodes/ITF/ITF.js");

var _ITF3=_interopRequireDefault(_ITF2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

// Calculate the checksum digit
var checksum=function checksum(data){
var res=data.substr(0,13).split('').map(function(num){
return parseInt(num,10);
}).reduce(function(sum,n,idx){
return sum+n*(3-idx%2*2);
},0);

return Math.ceil(res/10)*10-res;
};

var ITF14=function(_ITF){
_inherits(ITF14,_ITF);

function ITF14(data,options){
_classCallCheck(this,ITF14);

// Add checksum if it does not exist
if(data.search(/^[0-9]{13}$/)!==-1){
data+=checksum(data);
}
return _possibleConstructorReturn(this,(ITF14.__proto__||Object.getPrototypeOf(ITF14)).call(this,data,options));
}

_createClass(ITF14,[{
key:'valid',
value:function valid(){
return this.data.search(/^[0-9]{14}$/)!==-1&&+this.data[13]===checksum(this.data);
}
}]);

return ITF14;
}(_ITF3.default);

exports.default=ITF14;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/ITF/constants.js":(
/*!**************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/ITF/constants.js ***!
  \**************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesITFConstantsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
var START_BIN=exports.START_BIN='1010';
var END_BIN=exports.END_BIN='11101';

var BINARIES=exports.BINARIES=['00110','10001','01001','11000','00101','10100','01100','00011','10010','01010'];

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/ITF/index.js":(
/*!**********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/ITF/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesITFIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.ITF14=exports.ITF=undefined;

var _ITF=__webpack_require__(/*! ./ITF */"./node_modules/jsbarcode/bin/barcodes/ITF/ITF.js");

var _ITF2=_interopRequireDefault(_ITF);

var _ITF3=__webpack_require__(/*! ./ITF14 */"./node_modules/jsbarcode/bin/barcodes/ITF/ITF14.js");

var _ITF4=_interopRequireDefault(_ITF3);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

exports.ITF=_ITF2.default;
exports.ITF14=_ITF4.default;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/MSI/MSI.js":(
/*!********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/MSI/MSI.js ***!
  \********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesMSIMSIJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation
// https://en.wikipedia.org/wiki/MSI_Barcode#Character_set_and_binary_lookup

var MSI=function(_Barcode){
_inherits(MSI,_Barcode);

function MSI(data,options){
_classCallCheck(this,MSI);

return _possibleConstructorReturn(this,(MSI.__proto__||Object.getPrototypeOf(MSI)).call(this,data,options));
}

_createClass(MSI,[{
key:"encode",
value:function encode(){
// Start bits
var ret="110";

for(var i=0;i<this.data.length;i++){
// Convert the character to binary (always 4 binary digits)
var digit=parseInt(this.data[i]);
var bin=digit.toString(2);
bin=addZeroes(bin,4-bin.length);

// Add 100 for every zero and 110 for every 1
for(var b=0;b<bin.length;b++){
ret+=bin[b]=="0"?"100":"110";
}
}

// End bits
ret+="1001";

return {
data:ret,
text:this.text
};
}
},{
key:"valid",
value:function valid(){
return this.data.search(/^[0-9]+$/)!==-1;
}
}]);

return MSI;
}(_Barcode3.default);

function addZeroes(number,n){
for(var i=0;i<n;i++){
number="0"+number;
}
return number;
}

exports.default=MSI;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/MSI/MSI10.js":(
/*!**********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/MSI/MSI10.js ***!
  \**********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesMSIMSI10Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _MSI2=__webpack_require__(/*! ./MSI.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI.js");

var _MSI3=_interopRequireDefault(_MSI2);

var _checksums=__webpack_require__(/*! ./checksums.js */"./node_modules/jsbarcode/bin/barcodes/MSI/checksums.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var MSI10=function(_MSI){
_inherits(MSI10,_MSI);

function MSI10(data,options){
_classCallCheck(this,MSI10);

return _possibleConstructorReturn(this,(MSI10.__proto__||Object.getPrototypeOf(MSI10)).call(this,data+(0, _checksums.mod10)(data),options));
}

return MSI10;
}(_MSI3.default);

exports.default=MSI10;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/MSI/MSI1010.js":(
/*!************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/MSI/MSI1010.js ***!
  \************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesMSIMSI1010Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _MSI2=__webpack_require__(/*! ./MSI.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI.js");

var _MSI3=_interopRequireDefault(_MSI2);

var _checksums=__webpack_require__(/*! ./checksums.js */"./node_modules/jsbarcode/bin/barcodes/MSI/checksums.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var MSI1010=function(_MSI){
_inherits(MSI1010,_MSI);

function MSI1010(data,options){
_classCallCheck(this,MSI1010);

data+=(0, _checksums.mod10)(data);
data+=(0, _checksums.mod10)(data);
return _possibleConstructorReturn(this,(MSI1010.__proto__||Object.getPrototypeOf(MSI1010)).call(this,data,options));
}

return MSI1010;
}(_MSI3.default);

exports.default=MSI1010;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/MSI/MSI11.js":(
/*!**********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/MSI/MSI11.js ***!
  \**********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesMSIMSI11Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _MSI2=__webpack_require__(/*! ./MSI.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI.js");

var _MSI3=_interopRequireDefault(_MSI2);

var _checksums=__webpack_require__(/*! ./checksums.js */"./node_modules/jsbarcode/bin/barcodes/MSI/checksums.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var MSI11=function(_MSI){
_inherits(MSI11,_MSI);

function MSI11(data,options){
_classCallCheck(this,MSI11);

return _possibleConstructorReturn(this,(MSI11.__proto__||Object.getPrototypeOf(MSI11)).call(this,data+(0, _checksums.mod11)(data),options));
}

return MSI11;
}(_MSI3.default);

exports.default=MSI11;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/MSI/MSI1110.js":(
/*!************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/MSI/MSI1110.js ***!
  \************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesMSIMSI1110Js(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _MSI2=__webpack_require__(/*! ./MSI.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI.js");

var _MSI3=_interopRequireDefault(_MSI2);

var _checksums=__webpack_require__(/*! ./checksums.js */"./node_modules/jsbarcode/bin/barcodes/MSI/checksums.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var MSI1110=function(_MSI){
_inherits(MSI1110,_MSI);

function MSI1110(data,options){
_classCallCheck(this,MSI1110);

data+=(0, _checksums.mod11)(data);
data+=(0, _checksums.mod10)(data);
return _possibleConstructorReturn(this,(MSI1110.__proto__||Object.getPrototypeOf(MSI1110)).call(this,data,options));
}

return MSI1110;
}(_MSI3.default);

exports.default=MSI1110;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/MSI/checksums.js":(
/*!**************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/MSI/checksums.js ***!
  \**************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesMSIChecksumsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.mod10=mod10;
exports.mod11=mod11;
function mod10(number){
var sum=0;
for(var i=0;i<number.length;i++){
var n=parseInt(number[i]);
if((i+number.length)%2===0){
sum+=n;
}else {
sum+=n*2%10+Math.floor(n*2/10);
}
}
return (10-sum%10)%10;
}

function mod11(number){
var sum=0;
var weights=[2,3,4,5,6,7];
for(var i=0;i<number.length;i++){
var n=parseInt(number[number.length-1-i]);
sum+=weights[i%weights.length]*n;
}
return (11-sum%11)%11;
}

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/MSI/index.js":(
/*!**********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/MSI/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesMSIIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.MSI1110=exports.MSI1010=exports.MSI11=exports.MSI10=exports.MSI=undefined;

var _MSI=__webpack_require__(/*! ./MSI.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI.js");

var _MSI2=_interopRequireDefault(_MSI);

var _MSI3=__webpack_require__(/*! ./MSI10.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI10.js");

var _MSI4=_interopRequireDefault(_MSI3);

var _MSI5=__webpack_require__(/*! ./MSI11.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI11.js");

var _MSI6=_interopRequireDefault(_MSI5);

var _MSI7=__webpack_require__(/*! ./MSI1010.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI1010.js");

var _MSI8=_interopRequireDefault(_MSI7);

var _MSI9=__webpack_require__(/*! ./MSI1110.js */"./node_modules/jsbarcode/bin/barcodes/MSI/MSI1110.js");

var _MSI10=_interopRequireDefault(_MSI9);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

exports.MSI=_MSI2.default;
exports.MSI10=_MSI4.default;
exports.MSI11=_MSI6.default;
exports.MSI1010=_MSI8.default;
exports.MSI1110=_MSI10.default;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/codabar/index.js":(
/*!**************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/codabar/index.js ***!
  \**************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesCodabarIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.codabar=undefined;

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding specification:
// http://www.barcodeisland.com/codabar.phtml

var codabar=function(_Barcode){
_inherits(codabar,_Barcode);

function codabar(data,options){
_classCallCheck(this,codabar);

if(data.search(/^[0-9\-\$\:\.\+\/]+$/)===0){
data="A"+data+"A";
}

var _this=_possibleConstructorReturn(this,(codabar.__proto__||Object.getPrototypeOf(codabar)).call(this,data.toUpperCase(),options));

_this.text=_this.options.text||_this.text.replace(/[A-D]/g,'');
return _this;
}

_createClass(codabar,[{
key:"valid",
value:function valid(){
return this.data.search(/^[A-D][0-9\-\$\:\.\+\/]+[A-D]$/)!==-1;
}
},{
key:"encode",
value:function encode(){
var result=[];
var encodings=this.getEncodings();
for(var i=0;i<this.data.length;i++){
result.push(encodings[this.data.charAt(i)]);
// for all characters except the last, append a narrow-space ("0")
if(i!==this.data.length-1){
result.push("0");
}
}
return {
text:this.text,
data:result.join('')
};
}
},{
key:"getEncodings",
value:function getEncodings(){
return {
"0":"101010011",
"1":"101011001",
"2":"101001011",
"3":"110010101",
"4":"101101001",
"5":"110101001",
"6":"100101011",
"7":"100101101",
"8":"100110101",
"9":"110100101",
"-":"101001101",
"$":"101100101",
":":"1101011011",
"/":"1101101011",
".":"1101101101",
"+":"1011011011",
"A":"1011001001",
"B":"1001001011",
"C":"1010010011",
"D":"1010011001"
};
}
}]);

return codabar;
}(_Barcode3.default);

exports.codabar=codabar;

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/index.js":(
/*!******************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _CODE=__webpack_require__(/*! ./CODE39/ */"./node_modules/jsbarcode/bin/barcodes/CODE39/index.js");

var _CODE2=__webpack_require__(/*! ./CODE128/ */"./node_modules/jsbarcode/bin/barcodes/CODE128/index.js");

var _EAN_UPC=__webpack_require__(/*! ./EAN_UPC/ */"./node_modules/jsbarcode/bin/barcodes/EAN_UPC/index.js");

var _ITF=__webpack_require__(/*! ./ITF/ */"./node_modules/jsbarcode/bin/barcodes/ITF/index.js");

var _MSI=__webpack_require__(/*! ./MSI/ */"./node_modules/jsbarcode/bin/barcodes/MSI/index.js");

var _pharmacode=__webpack_require__(/*! ./pharmacode/ */"./node_modules/jsbarcode/bin/barcodes/pharmacode/index.js");

var _codabar=__webpack_require__(/*! ./codabar */"./node_modules/jsbarcode/bin/barcodes/codabar/index.js");

var _GenericBarcode=__webpack_require__(/*! ./GenericBarcode/ */"./node_modules/jsbarcode/bin/barcodes/GenericBarcode/index.js");

exports.default={
CODE39:_CODE.CODE39,
CODE128:_CODE2.CODE128,CODE128A:_CODE2.CODE128A,CODE128B:_CODE2.CODE128B,CODE128C:_CODE2.CODE128C,
EAN13:_EAN_UPC.EAN13,EAN8:_EAN_UPC.EAN8,EAN5:_EAN_UPC.EAN5,EAN2:_EAN_UPC.EAN2,UPC:_EAN_UPC.UPC,UPCE:_EAN_UPC.UPCE,
ITF14:_ITF.ITF14,
ITF:_ITF.ITF,
MSI:_MSI.MSI,MSI10:_MSI.MSI10,MSI11:_MSI.MSI11,MSI1010:_MSI.MSI1010,MSI1110:_MSI.MSI1110,
pharmacode:_pharmacode.pharmacode,
codabar:_codabar.codabar,
GenericBarcode:_GenericBarcode.GenericBarcode
};

/***/}),

/***/"./node_modules/jsbarcode/bin/barcodes/pharmacode/index.js":(
/*!*****************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/barcodes/pharmacode/index.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinBarcodesPharmacodeIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.pharmacode=undefined;

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _Barcode2=__webpack_require__(/*! ../Barcode.js */"./node_modules/jsbarcode/bin/barcodes/Barcode.js");

var _Barcode3=_interopRequireDefault(_Barcode2);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}// Encoding documentation
// http://www.gomaro.ch/ftproot/Laetus_PHARMA-CODE.pdf

var pharmacode=function(_Barcode){
_inherits(pharmacode,_Barcode);

function pharmacode(data,options){
_classCallCheck(this,pharmacode);

var _this=_possibleConstructorReturn(this,(pharmacode.__proto__||Object.getPrototypeOf(pharmacode)).call(this,data,options));

_this.number=parseInt(data,10);
return _this;
}

_createClass(pharmacode,[{
key:"encode",
value:function encode(){
var z=this.number;
var result="";

// http://i.imgur.com/RMm4UDJ.png
// (source: http://www.gomaro.ch/ftproot/Laetus_PHARMA-CODE.pdf, page: 34)
while(!isNaN(z)&&z!=0){
if(z%2===0){
// Even
result="11100"+result;
z=(z-2)/2;
}else {
// Odd
result="100"+result;
z=(z-1)/2;
}
}

// Remove the two last zeroes
result=result.slice(0,-2);

return {
data:result,
text:this.text
};
}
},{
key:"valid",
value:function valid(){
return this.number>=3&&this.number<=131070;
}
}]);

return pharmacode;
}(_Barcode3.default);

exports.pharmacode=pharmacode;

/***/}),

/***/"./node_modules/jsbarcode/bin/exceptions/ErrorHandler.js":(
/*!***************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/exceptions/ErrorHandler.js ***!
  \***************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinExceptionsErrorHandlerJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

/*eslint no-console: 0 */

var ErrorHandler=function(){
function ErrorHandler(api){
_classCallCheck(this,ErrorHandler);

this.api=api;
}

_createClass(ErrorHandler,[{
key:"handleCatch",
value:function handleCatch(e){
// If babel supported extending of Error in a correct way instanceof would be used here
if(e.name==="InvalidInputException"){
if(this.api._options.valid!==this.api._defaults.valid){
this.api._options.valid(false);
}else {
throw e.message;
}
}else {
throw e;
}

this.api.render=function(){};
}
},{
key:"wrapBarcodeCall",
value:function wrapBarcodeCall(func){
try{
var result=func.apply(undefined,arguments);
this.api._options.valid(true);
return result;
}catch(e){
this.handleCatch(e);

return this.api;
}
}
}]);

return ErrorHandler;
}();

exports.default=ErrorHandler;

/***/}),

/***/"./node_modules/jsbarcode/bin/exceptions/exceptions.js":(
/*!*************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/exceptions/exceptions.js ***!
  \*************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinExceptionsExceptionsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}

function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var InvalidInputException=function(_Error){
_inherits(InvalidInputException,_Error);

function InvalidInputException(symbology,input){
_classCallCheck(this,InvalidInputException);

var _this=_possibleConstructorReturn(this,(InvalidInputException.__proto__||Object.getPrototypeOf(InvalidInputException)).call(this));

_this.name="InvalidInputException";

_this.symbology=symbology;
_this.input=input;

_this.message='"'+_this.input+'" is not a valid input for '+_this.symbology;
return _this;
}

return InvalidInputException;
}(Error);

var InvalidElementException=function(_Error2){
_inherits(InvalidElementException,_Error2);

function InvalidElementException(){
_classCallCheck(this,InvalidElementException);

var _this2=_possibleConstructorReturn(this,(InvalidElementException.__proto__||Object.getPrototypeOf(InvalidElementException)).call(this));

_this2.name="InvalidElementException";
_this2.message="Not supported type to render on";
return _this2;
}

return InvalidElementException;
}(Error);

var NoElementException=function(_Error3){
_inherits(NoElementException,_Error3);

function NoElementException(){
_classCallCheck(this,NoElementException);

var _this3=_possibleConstructorReturn(this,(NoElementException.__proto__||Object.getPrototypeOf(NoElementException)).call(this));

_this3.name="NoElementException";
_this3.message="No element to render on.";
return _this3;
}

return NoElementException;
}(Error);

exports.InvalidInputException=InvalidInputException;
exports.InvalidElementException=InvalidElementException;
exports.NoElementException=NoElementException;

/***/}),

/***/"./node_modules/jsbarcode/bin/help/fixOptions.js":(
/*!*******************************************************!*\
  !*** ./node_modules/jsbarcode/bin/help/fixOptions.js ***!
  \*******************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinHelpFixOptionsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.default=fixOptions;


function fixOptions(options){
// Fix the margins
options.marginTop=options.marginTop||options.margin;
options.marginBottom=options.marginBottom||options.margin;
options.marginRight=options.marginRight||options.margin;
options.marginLeft=options.marginLeft||options.margin;

return options;
}

/***/}),

/***/"./node_modules/jsbarcode/bin/help/getOptionsFromElement.js":(
/*!******************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/help/getOptionsFromElement.js ***!
  \******************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinHelpGetOptionsFromElementJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _optionsFromStrings=__webpack_require__(/*! ./optionsFromStrings.js */"./node_modules/jsbarcode/bin/help/optionsFromStrings.js");

var _optionsFromStrings2=_interopRequireDefault(_optionsFromStrings);

var _defaults=__webpack_require__(/*! ../options/defaults.js */"./node_modules/jsbarcode/bin/options/defaults.js");

var _defaults2=_interopRequireDefault(_defaults);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function getOptionsFromElement(element){
var options={};
for(var property in _defaults2.default){
if(_defaults2.default.hasOwnProperty(property)){
// jsbarcode-*
if(element.hasAttribute("jsbarcode-"+property.toLowerCase())){
options[property]=element.getAttribute("jsbarcode-"+property.toLowerCase());
}

// data-*
if(element.hasAttribute("data-"+property.toLowerCase())){
options[property]=element.getAttribute("data-"+property.toLowerCase());
}
}
}

options["value"]=element.getAttribute("jsbarcode-value")||element.getAttribute("data-value");

// Since all atributes are string they need to be converted to integers
options=(0, _optionsFromStrings2.default)(options);

return options;
}

exports.default=getOptionsFromElement;

/***/}),

/***/"./node_modules/jsbarcode/bin/help/getRenderProperties.js":(
/*!****************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/help/getRenderProperties.js ***!
  \****************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinHelpGetRenderPropertiesJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/* global HTMLImageElement */
/* global HTMLCanvasElement */
/* global SVGElement */

var _getOptionsFromElement=__webpack_require__(/*! ./getOptionsFromElement.js */"./node_modules/jsbarcode/bin/help/getOptionsFromElement.js");

var _getOptionsFromElement2=_interopRequireDefault(_getOptionsFromElement);

var _renderers=__webpack_require__(/*! ../renderers */"./node_modules/jsbarcode/bin/renderers/index.js");

var _renderers2=_interopRequireDefault(_renderers);

var _exceptions=__webpack_require__(/*! ../exceptions/exceptions.js */"./node_modules/jsbarcode/bin/exceptions/exceptions.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

// Takes an element and returns an object with information about how
// it should be rendered
// This could also return an array with these objects
// {
//   element: The element that the renderer should draw on
//   renderer: The name of the renderer
//   afterRender (optional): If something has to done after the renderer
//     completed, calls afterRender (function)
//   options (optional): Options that can be defined in the element
// }

function getRenderProperties(element){
// If the element is a string, query select call again
if(typeof element==="string"){
return querySelectedRenderProperties(element);
}
// If element is array. Recursivly call with every object in the array
else if(Array.isArray(element)){
var returnArray=[];
for(var i=0;i<element.length;i++){
returnArray.push(getRenderProperties(element[i]));
}
return returnArray;
}
// If element, render on canvas and set the uri as src
else if(typeof HTMLCanvasElement!=='undefined'&&element instanceof HTMLImageElement){
return newCanvasRenderProperties(element);
}
// If SVG
else if(element&&element.nodeName&&element.nodeName.toLowerCase()==='svg'||typeof SVGElement!=='undefined'&&element instanceof SVGElement){
return {
element:element,
options:(0, _getOptionsFromElement2.default)(element),
renderer:_renderers2.default.SVGRenderer
};
}
// If canvas (in browser)
else if(typeof HTMLCanvasElement!=='undefined'&&element instanceof HTMLCanvasElement){
return {
element:element,
options:(0, _getOptionsFromElement2.default)(element),
renderer:_renderers2.default.CanvasRenderer
};
}
// If canvas (in node)
else if(element&&element.getContext){
return {
element:element,
renderer:_renderers2.default.CanvasRenderer
};
}else if(element&&(typeof element==="undefined"?"undefined":_typeof(element))==='object'&&!element.nodeName){
return {
element:element,
renderer:_renderers2.default.ObjectRenderer
};
}else {
throw new _exceptions.InvalidElementException();
}
}

function querySelectedRenderProperties(string){
var selector=document.querySelectorAll(string);
if(selector.length===0){
return undefined;
}else {
var returnArray=[];
for(var i=0;i<selector.length;i++){
returnArray.push(getRenderProperties(selector[i]));
}
return returnArray;
}
}

function newCanvasRenderProperties(imgElement){
var canvas=document.createElement('canvas');
return {
element:canvas,
options:(0, _getOptionsFromElement2.default)(imgElement),
renderer:_renderers2.default.CanvasRenderer,
afterRender:function afterRender(){
imgElement.setAttribute("src",canvas.toDataURL());
}
};
}

exports.default=getRenderProperties;

/***/}),

/***/"./node_modules/jsbarcode/bin/help/linearizeEncodings.js":(
/*!***************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/help/linearizeEncodings.js ***!
  \***************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinHelpLinearizeEncodingsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.default=linearizeEncodings;

// Encodings can be nestled like [[1-1, 1-2], 2, [3-1, 3-2]
// Convert to [1-1, 1-2, 2, 3-1, 3-2]

function linearizeEncodings(encodings){
var linearEncodings=[];
function nextLevel(encoded){
if(Array.isArray(encoded)){
for(var i=0;i<encoded.length;i++){
nextLevel(encoded[i]);
}
}else {
encoded.text=encoded.text||"";
encoded.data=encoded.data||"";
linearEncodings.push(encoded);
}
}
nextLevel(encodings);

return linearEncodings;
}

/***/}),

/***/"./node_modules/jsbarcode/bin/help/merge.js":(
/*!**************************************************!*\
  !*** ./node_modules/jsbarcode/bin/help/merge.js ***!
  \**************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinHelpMergeJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};

exports.default=function(old,replaceObj){
return _extends({},old,replaceObj);
};

/***/}),

/***/"./node_modules/jsbarcode/bin/help/optionsFromStrings.js":(
/*!***************************************************************!*\
  !*** ./node_modules/jsbarcode/bin/help/optionsFromStrings.js ***!
  \***************************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinHelpOptionsFromStringsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.default=optionsFromStrings;

// Convert string to integers/booleans where it should be

function optionsFromStrings(options){
var intOptions=["width","height","textMargin","fontSize","margin","marginTop","marginBottom","marginLeft","marginRight"];

for(var intOption in intOptions){
if(intOptions.hasOwnProperty(intOption)){
intOption=intOptions[intOption];
if(typeof options[intOption]==="string"){
options[intOption]=parseInt(options[intOption],10);
}
}
}

if(typeof options["displayValue"]==="string"){
options["displayValue"]=options["displayValue"]!="false";
}

return options;
}

/***/}),

/***/"./node_modules/jsbarcode/bin/options/defaults.js":(
/*!********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/options/defaults.js ***!
  \********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinOptionsDefaultsJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
var defaults={
width:2,
height:100,
format:"auto",
displayValue:true,
fontOptions:"",
font:"monospace",
text:undefined,
textAlign:"center",
textPosition:"bottom",
textMargin:2,
fontSize:20,
background:"#ffffff",
lineColor:"#000000",
margin:10,
marginTop:undefined,
marginBottom:undefined,
marginLeft:undefined,
marginRight:undefined,
valid:function valid(){}
};

exports.default=defaults;

/***/}),

/***/"./node_modules/jsbarcode/bin/renderers/canvas.js":(
/*!********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/renderers/canvas.js ***!
  \********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinRenderersCanvasJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _merge=__webpack_require__(/*! ../help/merge.js */"./node_modules/jsbarcode/bin/help/merge.js");

var _merge2=_interopRequireDefault(_merge);

var _shared=__webpack_require__(/*! ./shared.js */"./node_modules/jsbarcode/bin/renderers/shared.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var CanvasRenderer=function(){
function CanvasRenderer(canvas,encodings,options){
_classCallCheck(this,CanvasRenderer);

this.canvas=canvas;
this.encodings=encodings;
this.options=options;
}

_createClass(CanvasRenderer,[{
key:"render",
value:function render(){
// Abort if the browser does not support HTML5 canvas
if(!this.canvas.getContext){
throw new Error('The browser does not support canvas.');
}

this.prepareCanvas();
for(var i=0;i<this.encodings.length;i++){
var encodingOptions=(0, _merge2.default)(this.options,this.encodings[i].options);

this.drawCanvasBarcode(encodingOptions,this.encodings[i]);
this.drawCanvasText(encodingOptions,this.encodings[i]);

this.moveCanvasDrawing(this.encodings[i]);
}

this.restoreCanvas();
}
},{
key:"prepareCanvas",
value:function prepareCanvas(){
// Get the canvas context
var ctx=this.canvas.getContext("2d");

ctx.save();

(0, _shared.calculateEncodingAttributes)(this.encodings,this.options,ctx);
var totalWidth=(0, _shared.getTotalWidthOfEncodings)(this.encodings);
var maxHeight=(0, _shared.getMaximumHeightOfEncodings)(this.encodings);

this.canvas.width=totalWidth+this.options.marginLeft+this.options.marginRight;

this.canvas.height=maxHeight;

// Paint the canvas
ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
if(this.options.background){
ctx.fillStyle=this.options.background;
ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
}

ctx.translate(this.options.marginLeft,0);
}
},{
key:"drawCanvasBarcode",
value:function drawCanvasBarcode(options,encoding){
// Get the canvas context
var ctx=this.canvas.getContext("2d");

var binary=encoding.data;

// Creates the barcode out of the encoded binary
var yFrom;
if(options.textPosition=="top"){
yFrom=options.marginTop+options.fontSize+options.textMargin;
}else {
yFrom=options.marginTop;
}

ctx.fillStyle=options.lineColor;

for(var b=0;b<binary.length;b++){
var x=b*options.width+encoding.barcodePadding;

if(binary[b]==="1"){
ctx.fillRect(x,yFrom,options.width,options.height);
}else if(binary[b]){
ctx.fillRect(x,yFrom,options.width,options.height*binary[b]);
}
}
}
},{
key:"drawCanvasText",
value:function drawCanvasText(options,encoding){
// Get the canvas context
var ctx=this.canvas.getContext("2d");

var font=options.fontOptions+" "+options.fontSize+"px "+options.font;

// Draw the text if displayValue is set
if(options.displayValue){
var x,y;

if(options.textPosition=="top"){
y=options.marginTop+options.fontSize-options.textMargin;
}else {
y=options.height+options.textMargin+options.marginTop+options.fontSize;
}

ctx.font=font;

// Draw the text in the correct X depending on the textAlign option
if(options.textAlign=="left"||encoding.barcodePadding>0){
x=0;
ctx.textAlign='left';
}else if(options.textAlign=="right"){
x=encoding.width-1;
ctx.textAlign='right';
}
// In all other cases, center the text
else {
x=encoding.width/2;
ctx.textAlign='center';
}

ctx.fillText(encoding.text,x,y);
}
}
},{
key:"moveCanvasDrawing",
value:function moveCanvasDrawing(encoding){
var ctx=this.canvas.getContext("2d");

ctx.translate(encoding.width,0);
}
},{
key:"restoreCanvas",
value:function restoreCanvas(){
// Get the canvas context
var ctx=this.canvas.getContext("2d");

ctx.restore();
}
}]);

return CanvasRenderer;
}();

exports.default=CanvasRenderer;

/***/}),

/***/"./node_modules/jsbarcode/bin/renderers/index.js":(
/*!*******************************************************!*\
  !*** ./node_modules/jsbarcode/bin/renderers/index.js ***!
  \*******************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinRenderersIndexJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _canvas=__webpack_require__(/*! ./canvas.js */"./node_modules/jsbarcode/bin/renderers/canvas.js");

var _canvas2=_interopRequireDefault(_canvas);

var _svg=__webpack_require__(/*! ./svg.js */"./node_modules/jsbarcode/bin/renderers/svg.js");

var _svg2=_interopRequireDefault(_svg);

var _object=__webpack_require__(/*! ./object.js */"./node_modules/jsbarcode/bin/renderers/object.js");

var _object2=_interopRequireDefault(_object);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

exports.default={CanvasRenderer:_canvas2.default,SVGRenderer:_svg2.default,ObjectRenderer:_object2.default};

/***/}),

/***/"./node_modules/jsbarcode/bin/renderers/object.js":(
/*!********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/renderers/object.js ***!
  \********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinRenderersObjectJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var ObjectRenderer=function(){
function ObjectRenderer(object,encodings,options){
_classCallCheck(this,ObjectRenderer);

this.object=object;
this.encodings=encodings;
this.options=options;
}

_createClass(ObjectRenderer,[{
key:"render",
value:function render(){
this.object.encodings=this.encodings;
}
}]);

return ObjectRenderer;
}();

exports.default=ObjectRenderer;

/***/}),

/***/"./node_modules/jsbarcode/bin/renderers/shared.js":(
/*!********************************************************!*\
  !*** ./node_modules/jsbarcode/bin/renderers/shared.js ***!
  \********************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinRenderersSharedJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});
exports.getTotalWidthOfEncodings=exports.calculateEncodingAttributes=exports.getBarcodePadding=exports.getEncodingHeight=exports.getMaximumHeightOfEncodings=undefined;

var _merge=__webpack_require__(/*! ../help/merge.js */"./node_modules/jsbarcode/bin/help/merge.js");

var _merge2=_interopRequireDefault(_merge);

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function getEncodingHeight(encoding,options){
return options.height+(options.displayValue&&encoding.text.length>0?options.fontSize+options.textMargin:0)+options.marginTop+options.marginBottom;
}

function getBarcodePadding(textWidth,barcodeWidth,options){
if(options.displayValue&&barcodeWidth<textWidth){
if(options.textAlign=="center"){
return Math.floor((textWidth-barcodeWidth)/2);
}else if(options.textAlign=="left"){
return 0;
}else if(options.textAlign=="right"){
return Math.floor(textWidth-barcodeWidth);
}
}
return 0;
}

function calculateEncodingAttributes(encodings,barcodeOptions,context){
for(var i=0;i<encodings.length;i++){
var encoding=encodings[i];
var options=(0, _merge2.default)(barcodeOptions,encoding.options);

// Calculate the width of the encoding
var textWidth;
if(options.displayValue){
textWidth=messureText(encoding.text,options,context);
}else {
textWidth=0;
}

var barcodeWidth=encoding.data.length*options.width;
encoding.width=Math.ceil(Math.max(textWidth,barcodeWidth));

encoding.height=getEncodingHeight(encoding,options);

encoding.barcodePadding=getBarcodePadding(textWidth,barcodeWidth,options);
}
}

function getTotalWidthOfEncodings(encodings){
var totalWidth=0;
for(var i=0;i<encodings.length;i++){
totalWidth+=encodings[i].width;
}
return totalWidth;
}

function getMaximumHeightOfEncodings(encodings){
var maxHeight=0;
for(var i=0;i<encodings.length;i++){
if(encodings[i].height>maxHeight){
maxHeight=encodings[i].height;
}
}
return maxHeight;
}

function messureText(string,options,context){
var ctx;

if(context){
ctx=context;
}else if(typeof document!=="undefined"){
ctx=document.createElement("canvas").getContext("2d");
}else {
// If the text cannot be messured we will return 0.
// This will make some barcode with big text render incorrectly
return 0;
}
ctx.font=options.fontOptions+" "+options.fontSize+"px "+options.font;

// Calculate the width of the encoding
var measureTextResult=ctx.measureText(string);
if(!measureTextResult){
// Some implementations don't implement measureText and return undefined.
// If the text cannot be measured we will return 0.
// This will make some barcode with big text render incorrectly
return 0;
}
var size=measureTextResult.width;
return size;
}

exports.getMaximumHeightOfEncodings=getMaximumHeightOfEncodings;
exports.getEncodingHeight=getEncodingHeight;
exports.getBarcodePadding=getBarcodePadding;
exports.calculateEncodingAttributes=calculateEncodingAttributes;
exports.getTotalWidthOfEncodings=getTotalWidthOfEncodings;

/***/}),

/***/"./node_modules/jsbarcode/bin/renderers/svg.js":(
/*!*****************************************************!*\
  !*** ./node_modules/jsbarcode/bin/renderers/svg.js ***!
  \*****************************************************/
/*! no static exports found */
/***/function node_modulesJsbarcodeBinRenderersSvgJs(module,exports,__webpack_require__){


Object.defineProperty(exports,"__esModule",{
value:true
});

var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _merge=__webpack_require__(/*! ../help/merge.js */"./node_modules/jsbarcode/bin/help/merge.js");

var _merge2=_interopRequireDefault(_merge);

var _shared=__webpack_require__(/*! ./shared.js */"./node_modules/jsbarcode/bin/renderers/shared.js");

function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

var svgns="http://www.w3.org/2000/svg";

var SVGRenderer=function(){
function SVGRenderer(svg,encodings,options){
_classCallCheck(this,SVGRenderer);

this.svg=svg;
this.encodings=encodings;
this.options=options;
this.document=options.xmlDocument||document;
}

_createClass(SVGRenderer,[{
key:"render",
value:function render(){
var currentX=this.options.marginLeft;

this.prepareSVG();
for(var i=0;i<this.encodings.length;i++){
var encoding=this.encodings[i];
var encodingOptions=(0, _merge2.default)(this.options,encoding.options);

var group=this.createGroup(currentX,encodingOptions.marginTop,this.svg);

this.setGroupOptions(group,encodingOptions);

this.drawSvgBarcode(group,encodingOptions,encoding);
this.drawSVGText(group,encodingOptions,encoding);

currentX+=encoding.width;
}
}
},{
key:"prepareSVG",
value:function prepareSVG(){
// Clear the SVG
while(this.svg.firstChild){
this.svg.removeChild(this.svg.firstChild);
}

(0, _shared.calculateEncodingAttributes)(this.encodings,this.options);
var totalWidth=(0, _shared.getTotalWidthOfEncodings)(this.encodings);
var maxHeight=(0, _shared.getMaximumHeightOfEncodings)(this.encodings);

var width=totalWidth+this.options.marginLeft+this.options.marginRight;
this.setSvgAttributes(width,maxHeight);

if(this.options.background){
this.drawRect(0,0,width,maxHeight,this.svg).setAttribute("style","fill:"+this.options.background+";");
}
}
},{
key:"drawSvgBarcode",
value:function drawSvgBarcode(parent,options,encoding){
var binary=encoding.data;

// Creates the barcode out of the encoded binary
var yFrom;
if(options.textPosition=="top"){
yFrom=options.fontSize+options.textMargin;
}else {
yFrom=0;
}

var barWidth=0;
var x=0;
for(var b=0;b<binary.length;b++){
x=b*options.width+encoding.barcodePadding;

if(binary[b]==="1"){
barWidth++;
}else if(barWidth>0){
this.drawRect(x-options.width*barWidth,yFrom,options.width*barWidth,options.height,parent);
barWidth=0;
}
}

// Last draw is needed since the barcode ends with 1
if(barWidth>0){
this.drawRect(x-options.width*(barWidth-1),yFrom,options.width*barWidth,options.height,parent);
}
}
},{
key:"drawSVGText",
value:function drawSVGText(parent,options,encoding){
var textElem=this.document.createElementNS(svgns,'text');

// Draw the text if displayValue is set
if(options.displayValue){
var x,y;

textElem.setAttribute("style","font:"+options.fontOptions+" "+options.fontSize+"px "+options.font);

if(options.textPosition=="top"){
y=options.fontSize-options.textMargin;
}else {
y=options.height+options.textMargin+options.fontSize;
}

// Draw the text in the correct X depending on the textAlign option
if(options.textAlign=="left"||encoding.barcodePadding>0){
x=0;
textElem.setAttribute("text-anchor","start");
}else if(options.textAlign=="right"){
x=encoding.width-1;
textElem.setAttribute("text-anchor","end");
}
// In all other cases, center the text
else {
x=encoding.width/2;
textElem.setAttribute("text-anchor","middle");
}

textElem.setAttribute("x",x);
textElem.setAttribute("y",y);

textElem.appendChild(this.document.createTextNode(encoding.text));

parent.appendChild(textElem);
}
}
},{
key:"setSvgAttributes",
value:function setSvgAttributes(width,height){
var svg=this.svg;
svg.setAttribute("width",width+"px");
svg.setAttribute("height",height+"px");
svg.setAttribute("x","0px");
svg.setAttribute("y","0px");
svg.setAttribute("viewBox","0 0 "+width+" "+height);

svg.setAttribute("xmlns",svgns);
svg.setAttribute("version","1.1");

svg.setAttribute("style","transform: translate(0,0)");
}
},{
key:"createGroup",
value:function createGroup(x,y,parent){
var group=this.document.createElementNS(svgns,'g');
group.setAttribute("transform","translate("+x+", "+y+")");

parent.appendChild(group);

return group;
}
},{
key:"setGroupOptions",
value:function setGroupOptions(group,options){
group.setAttribute("style","fill:"+options.lineColor+";");
}
},{
key:"drawRect",
value:function drawRect(x,y,width,height,parent){
var rect=this.document.createElementNS(svgns,'rect');

rect.setAttribute("x",x);
rect.setAttribute("y",y);
rect.setAttribute("width",width);
rect.setAttribute("height",height);

parent.appendChild(rect);

return rect;
}
}]);

return SVGRenderer;
}();

exports.default=SVGRenderer;

/***/}),

/***/"./node_modules/vue-barcode/index.js":(
/*!*******************************************!*\
  !*** ./node_modules/vue-barcode/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/function node_modulesVueBarcodeIndexJs(module,exports,__webpack_require__){

var JsBarcode=__webpack_require__(/*! jsbarcode */"./node_modules/jsbarcode/bin/JsBarcode.js");

var VueBarcode={
render:function render(createElement){
return createElement('div',[
createElement(this.elementTag,{
style:{display:this.valid?undefined:'none'},
'class':['vue-barcode-element']
}),
createElement('div',{
style:{display:this.valid?'none':undefined}
},this.$slots.default)]
);
},
props:{
value:[String,Number],
format:[String],
width:[String,Number],
height:[String,Number],
displayValue:{
type:[String,Boolean],
default:true
},
text:[String,Number],
fontOptions:[String],
font:[String],
textAlign:[String],
textPosition:[String],
textMargin:[String,Number],
fontSize:[String,Number],
background:[String],
lineColor:[String],
margin:[String,Number],
marginTop:[String,Number],
marginBottom:[String,Number],
marginLeft:[String,Number],
marginRight:[String,Number],
flat:[Boolean],
ean128:[String,Boolean],
elementTag:{
type:String,
default:'svg',
validator:function validator(value){
return ['canvas','svg','img'].indexOf(value)!==-1;
}
}
},
mounted:function mounted(){
this.$watch('$props',render,{deep:true,immediate:true});
render.call(this);
},
data:function data(){
return {valid:true};
}
};

function render(){
var that=this;

var settings={
format:this.format,
width:this.width,
height:this.height,
displayValue:this.displayValue,
text:this.text,
fontOptions:this.fontOptions,
font:this.font,
textAlign:this.textAlign,
textPosition:this.textPosition,
textMargin:this.textMargin,
fontSize:this.fontSize,
background:this.background,
lineColor:this.lineColor,
margin:this.margin,
marginTop:this.marginTop,
marginBottom:this.marginBottom,
marginLeft:this.marginLeft,
marginRight:this.marginRight,
flat:this.flat,
ean128:this.ean128,
valid:function valid(_valid){
that.valid=_valid;
},
elementTag:this.elementTag
};

removeUndefinedProps(settings);

JsBarcode(this.$el.querySelector('.vue-barcode-element'),String(this.value),settings);
}

function removeUndefinedProps(obj){
for(var prop in obj){
if(obj.hasOwnProperty(prop)&&obj[prop]===undefined){
delete obj[prop];
}
}
}

module.exports=VueBarcode;


/***/})

}]);

}());
