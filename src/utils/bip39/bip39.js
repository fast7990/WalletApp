var bip39;
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof reqqqqq&&reqqqqq;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof reqqqqq&&reqqqqq,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(reqqqqq,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = ((uint8[i] << 16) & 0xFF0000) + ((uint8[i + 1] << 8) & 0xFF00) + (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(reqqqqq,module,exports){

},{}],3:[function(reqqqqq,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = reqqqqq('base64-js')
var ieee754 = reqqqqq('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is reqqqqqd by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you reqqqqq old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value) || (value && isArrayBuffer(value.buffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (ArrayBuffer.isView(buf)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":6}],4:[function(reqqqqq,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":reqqqqq("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":8}],5:[function(reqqqqq,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],6:[function(reqqqqq,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],7:[function(reqqqqq,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],8:[function(reqqqqq,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],9:[function(reqqqqq,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],10:[function(reqqqqq,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,reqqqqq('_process'))
},{"_process":11}],11:[function(reqqqqq,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(reqqqqq,module,exports){
module.exports = reqqqqq('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":13}],13:[function(reqqqqq,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = reqqqqq('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = reqqqqq('core-util-is');
util.inherits = reqqqqq('inherits');
/*</replacement>*/

var Readable = reqqqqq('./_stream_readable');
var Writable = reqqqqq('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":15,"./_stream_writable":17,"core-util-is":4,"inherits":7,"process-nextick-args":10}],14:[function(reqqqqq,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = reqqqqq('./_stream_transform');

/*<replacement>*/
var util = reqqqqq('core-util-is');
util.inherits = reqqqqq('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":16,"core-util-is":4,"inherits":7}],15:[function(reqqqqq,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = reqqqqq('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = reqqqqq('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = reqqqqq('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = reqqqqq('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = reqqqqq('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = reqqqqq('core-util-is');
util.inherits = reqqqqq('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = reqqqqq('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = reqqqqq('./internal/streams/BufferList');
var destroyImpl = reqqqqq('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || reqqqqq('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases reqqqqq setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = reqqqqq('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || reqqqqq('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = reqqqqq('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,reqqqqq('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":13,"./internal/streams/BufferList":18,"./internal/streams/destroy":19,"./internal/streams/stream":20,"_process":11,"core-util-is":4,"events":5,"inherits":7,"isarray":9,"process-nextick-args":10,"safe-buffer":25,"string_decoder/":27,"util":2}],16:[function(reqqqqq,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = reqqqqq('./_stream_duplex');

/*<replacement>*/
var util = reqqqqq('core-util-is');
util.inherits = reqqqqq('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":13,"core-util-is":4,"inherits":7}],17:[function(reqqqqq,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = reqqqqq('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = reqqqqq('core-util-is');
util.inherits = reqqqqq('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: reqqqqq('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = reqqqqq('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = reqqqqq('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = reqqqqq('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || reqqqqq('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases reqqqqq setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || reqqqqq('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() reqqqqqs lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,reqqqqq('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":13,"./internal/streams/destroy":19,"./internal/streams/stream":20,"_process":11,"core-util-is":4,"inherits":7,"process-nextick-args":10,"safe-buffer":25,"util-deprecate":28}],18:[function(reqqqqq,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = reqqqqq('safe-buffer').Buffer;
var util = reqqqqq('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":25,"util":2}],19:[function(reqqqqq,module,exports){
'use strict';

/*<replacement>*/

var pna = reqqqqq('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":10}],20:[function(reqqqqq,module,exports){
module.exports = reqqqqq('events').EventEmitter;

},{"events":5}],21:[function(reqqqqq,module,exports){
module.exports = reqqqqq('./readable').PassThrough

},{"./readable":22}],22:[function(reqqqqq,module,exports){
exports = module.exports = reqqqqq('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = reqqqqq('./lib/_stream_writable.js');
exports.Duplex = reqqqqq('./lib/_stream_duplex.js');
exports.Transform = reqqqqq('./lib/_stream_transform.js');
exports.PassThrough = reqqqqq('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":13,"./lib/_stream_passthrough.js":14,"./lib/_stream_readable.js":15,"./lib/_stream_transform.js":16,"./lib/_stream_writable.js":17}],23:[function(reqqqqq,module,exports){
module.exports = reqqqqq('./readable').Transform

},{"./readable":22}],24:[function(reqqqqq,module,exports){
module.exports = reqqqqq('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":17}],25:[function(reqqqqq,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = reqqqqq('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from reqqqqq('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":3}],26:[function(reqqqqq,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = reqqqqq('events').EventEmitter;
var inherits = reqqqqq('inherits');

inherits(Stream, EE);
Stream.Readable = reqqqqq('readable-stream/readable.js');
Stream.Writable = reqqqqq('readable-stream/writable.js');
Stream.Duplex = reqqqqq('readable-stream/duplex.js');
Stream.Transform = reqqqqq('readable-stream/transform.js');
Stream.PassThrough = reqqqqq('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":5,"inherits":7,"readable-stream/duplex.js":12,"readable-stream/passthrough.js":21,"readable-stream/readable.js":22,"readable-stream/transform.js":23,"readable-stream/writable.js":24}],27:[function(reqqqqq,module,exports){
'use strict';

var Buffer = reqqqqq('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the reqqqqqd
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":25}],28:[function(reqqqqq,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],29:[function(reqqqqq,module,exports){
var Buffer = reqqqqq('safe-buffer').Buffer
var createHash = reqqqqq('create-hash')
var pbkdf2 = reqqqqq('pbkdf2').pbkdf2Sync
var randomBytes = reqqqqq('randombytes')

// use unorm until String.prototype.normalize gets better browser support
var unorm = reqqqqq('unorm')

var CHINESE_SIMPLIFIED_WORDLIST = reqqqqq('./wordlists/chinese_simplified.json')
var CHINESE_TRADITIONAL_WORDLIST = reqqqqq('./wordlists/chinese_traditional.json')
var ENGLISH_WORDLIST = reqqqqq('./wordlists/english.json')
var FRENCH_WORDLIST = reqqqqq('./wordlists/french.json')
var ITALIAN_WORDLIST = reqqqqq('./wordlists/italian.json')
var JAPANESE_WORDLIST = reqqqqq('./wordlists/japanese.json')
var KOREAN_WORDLIST = reqqqqq('./wordlists/korean.json')
var SPANISH_WORDLIST = reqqqqq('./wordlists/spanish.json')
var DEFAULT_WORDLIST = ENGLISH_WORDLIST

var INVALID_MNEMONIC = 'Invalid mnemonic'
var INVALID_ENTROPY = 'Invalid entropy'
var INVALID_CHECKSUM = 'Invalid mnemonic checksum'

function lpad (str, padString, length) {
  while (str.length < length) str = padString + str
  return str
}

function binaryToByte (bin) {
  return parseInt(bin, 2)
}

function bytesToBinary (bytes) {
  return bytes.map(function (x) {
    return lpad(x.toString(2), '0', 8)
  }).join('')
}

function deriveChecksumBits (entropyBuffer) {
  var ENT = entropyBuffer.length * 8
  var CS = ENT / 32
  var hash = createHash('sha256').update(entropyBuffer).digest()

  return bytesToBinary([].slice.call(hash)).slice(0, CS)
}

function salt (password) {
  return 'mnemonic' + (password || '')
}

function mnemonicToSeed (mnemonic, password) {
  var mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8')
  var saltBuffer = Buffer.from(salt(unorm.nfkd(password)), 'utf8')

  return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512')
}

function mnemonicToSeedHex (mnemonic, password) {
  return mnemonicToSeed(mnemonic, password).toString('hex')
}

function mnemonicToEntropy (mnemonic, wordlist) {
  wordlist = wordlist || DEFAULT_WORDLIST

  var words = unorm.nfkd(mnemonic).split(' ')
  if (words.length % 3 !== 0) throw new Error(INVALID_MNEMONIC)

  // convert word indices to 11 bit binary strings
  var bits = words.map(function (word) {
    var index = wordlist.indexOf(word)
    if (index === -1) throw new Error(INVALID_MNEMONIC)

    return lpad(index.toString(2), '0', 11)
  }).join('')

  // split the binary string into ENT/CS
  var dividerIndex = Math.floor(bits.length / 33) * 32
  var entropyBits = bits.slice(0, dividerIndex)
  var checksumBits = bits.slice(dividerIndex)

  // calculate the checksum and compare
  var entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte)
  if (entropyBytes.length < 16) throw new Error(INVALID_ENTROPY)
  if (entropyBytes.length > 32) throw new Error(INVALID_ENTROPY)
  if (entropyBytes.length % 4 !== 0) throw new Error(INVALID_ENTROPY)

  var entropy = Buffer.from(entropyBytes)
  var newChecksum = deriveChecksumBits(entropy)
  if (newChecksum !== checksumBits) throw new Error(INVALID_CHECKSUM)

  return entropy.toString('hex')
}

function entropyToMnemonic (entropy, wordlist) {
  if (!Buffer.isBuffer(entropy)) entropy = Buffer.from(entropy, 'hex')
  wordlist = wordlist || DEFAULT_WORDLIST

  // 128 <= ENT <= 256
  if (entropy.length < 16) throw new TypeError(INVALID_ENTROPY)
  if (entropy.length > 32) throw new TypeError(INVALID_ENTROPY)
  if (entropy.length % 4 !== 0) throw new TypeError(INVALID_ENTROPY)

  var entropyBits = bytesToBinary([].slice.call(entropy))
  var checksumBits = deriveChecksumBits(entropy)

  var bits = entropyBits + checksumBits
  var chunks = bits.match(/(.{1,11})/g)
  var words = chunks.map(function (binary) {
    var index = binaryToByte(binary)
    return wordlist[index]
  })

  return wordlist === JAPANESE_WORDLIST ? words.join('\u3000') : words.join(' ')
}

function generateMnemonic (strength, rng, wordlist) {
  strength = strength || 128
  if (strength % 32 !== 0) throw new TypeError(INVALID_ENTROPY)
  rng = rng || randomBytes

  return entropyToMnemonic(rng(strength / 8), wordlist)
}

function validateMnemonic (mnemonic, wordlist) {
  try {
    mnemonicToEntropy(mnemonic, wordlist)
  } catch (e) {
    return false
  }

  return true
}

module.exports = {
  mnemonicToSeed: mnemonicToSeed,
  mnemonicToSeedHex: mnemonicToSeedHex,
  mnemonicToEntropy: mnemonicToEntropy,
  entropyToMnemonic: entropyToMnemonic,
  generateMnemonic: generateMnemonic,
  validateMnemonic: validateMnemonic,
  wordlists: {
    EN: ENGLISH_WORDLIST,
    JA: JAPANESE_WORDLIST,

    chinese_simplified: CHINESE_SIMPLIFIED_WORDLIST,
    chinese_traditional: CHINESE_TRADITIONAL_WORDLIST,
    english: ENGLISH_WORDLIST,
    french: FRENCH_WORDLIST,
    italian: ITALIAN_WORDLIST,
    japanese: JAPANESE_WORDLIST,
    korean: KOREAN_WORDLIST,
    spanish: SPANISH_WORDLIST
  }
}

},{"./wordlists/chinese_simplified.json":30,"./wordlists/chinese_traditional.json":31,"./wordlists/english.json":32,"./wordlists/french.json":33,"./wordlists/italian.json":34,"./wordlists/japanese.json":35,"./wordlists/korean.json":36,"./wordlists/spanish.json":37,"create-hash":39,"pbkdf2":44,"randombytes":49,"safe-buffer":51,"unorm":60}],30:[function(reqqqqq,module,exports){
module.exports=[
  "的",
  "一",
  "是",
  "在",
  "不",
  "了",
  "有",
  "和",
  "人",
  "这",
  "中",
  "大",
  "为",
  "上",
  "个",
  "国",
  "我",
  "以",
  "要",
  "他",
  "时",
  "来",
  "用",
  "们",
  "生",
  "到",
  "作",
  "地",
  "于",
  "出",
  "就",
  "分",
  "对",
  "成",
  "会",
  "可",
  "主",
  "发",
  "年",
  "动",
  "同",
  "工",
  "也",
  "能",
  "下",
  "过",
  "子",
  "说",
  "产",
  "种",
  "面",
  "而",
  "方",
  "后",
  "多",
  "定",
  "行",
  "学",
  "法",
  "所",
  "民",
  "得",
  "经",
  "十",
  "三",
  "之",
  "进",
  "着",
  "等",
  "部",
  "度",
  "家",
  "电",
  "力",
  "里",
  "如",
  "水",
  "化",
  "高",
  "自",
  "二",
  "理",
  "起",
  "小",
  "物",
  "现",
  "实",
  "加",
  "量",
  "都",
  "两",
  "体",
  "制",
  "机",
  "当",
  "使",
  "点",
  "从",
  "业",
  "本",
  "去",
  "把",
  "性",
  "好",
  "应",
  "开",
  "它",
  "合",
  "还",
  "因",
  "由",
  "其",
  "些",
  "然",
  "前",
  "外",
  "天",
  "政",
  "四",
  "日",
  "那",
  "社",
  "义",
  "事",
  "平",
  "形",
  "相",
  "全",
  "表",
  "间",
  "样",
  "与",
  "关",
  "各",
  "重",
  "新",
  "线",
  "内",
  "数",
  "正",
  "心",
  "反",
  "你",
  "明",
  "看",
  "原",
  "又",
  "么",
  "利",
  "比",
  "或",
  "但",
  "质",
  "气",
  "第",
  "向",
  "道",
  "命",
  "此",
  "变",
  "条",
  "只",
  "没",
  "结",
  "解",
  "问",
  "意",
  "建",
  "月",
  "公",
  "无",
  "系",
  "军",
  "很",
  "情",
  "者",
  "最",
  "立",
  "代",
  "想",
  "已",
  "通",
  "并",
  "提",
  "直",
  "题",
  "党",
  "程",
  "展",
  "五",
  "果",
  "料",
  "象",
  "员",
  "革",
  "位",
  "入",
  "常",
  "文",
  "总",
  "次",
  "品",
  "式",
  "活",
  "设",
  "及",
  "管",
  "特",
  "件",
  "长",
  "求",
  "老",
  "头",
  "基",
  "资",
  "边",
  "流",
  "路",
  "级",
  "少",
  "图",
  "山",
  "统",
  "接",
  "知",
  "较",
  "将",
  "组",
  "见",
  "计",
  "别",
  "她",
  "手",
  "角",
  "期",
  "根",
  "论",
  "运",
  "农",
  "指",
  "几",
  "九",
  "区",
  "强",
  "放",
  "决",
  "西",
  "被",
  "干",
  "做",
  "必",
  "战",
  "先",
  "回",
  "则",
  "任",
  "取",
  "据",
  "处",
  "队",
  "南",
  "给",
  "色",
  "光",
  "门",
  "即",
  "保",
  "治",
  "北",
  "造",
  "百",
  "规",
  "热",
  "领",
  "七",
  "海",
  "口",
  "东",
  "导",
  "器",
  "压",
  "志",
  "世",
  "金",
  "增",
  "争",
  "济",
  "阶",
  "油",
  "思",
  "术",
  "极",
  "交",
  "受",
  "联",
  "什",
  "认",
  "六",
  "共",
  "权",
  "收",
  "证",
  "改",
  "清",
  "美",
  "再",
  "采",
  "转",
  "更",
  "单",
  "风",
  "切",
  "打",
  "白",
  "教",
  "速",
  "花",
  "带",
  "安",
  "场",
  "身",
  "车",
  "例",
  "真",
  "务",
  "具",
  "万",
  "每",
  "目",
  "至",
  "达",
  "走",
  "积",
  "示",
  "议",
  "声",
  "报",
  "斗",
  "完",
  "类",
  "八",
  "离",
  "华",
  "名",
  "确",
  "才",
  "科",
  "张",
  "信",
  "马",
  "节",
  "话",
  "米",
  "整",
  "空",
  "元",
  "况",
  "今",
  "集",
  "温",
  "传",
  "土",
  "许",
  "步",
  "群",
  "广",
  "石",
  "记",
  "需",
  "段",
  "研",
  "界",
  "拉",
  "林",
  "律",
  "叫",
  "且",
  "究",
  "观",
  "越",
  "织",
  "装",
  "影",
  "算",
  "低",
  "持",
  "音",
  "众",
  "书",
  "布",
  "复",
  "容",
  "儿",
  "须",
  "际",
  "商",
  "非",
  "验",
  "连",
  "断",
  "深",
  "难",
  "近",
  "矿",
  "千",
  "周",
  "委",
  "素",
  "技",
  "备",
  "半",
  "办",
  "青",
  "省",
  "列",
  "习",
  "响",
  "约",
  "支",
  "般",
  "史",
  "感",
  "劳",
  "便",
  "团",
  "往",
  "酸",
  "历",
  "市",
  "克",
  "何",
  "除",
  "消",
  "构",
  "府",
  "称",
  "太",
  "准",
  "精",
  "值",
  "号",
  "率",
  "族",
  "维",
  "划",
  "选",
  "标",
  "写",
  "存",
  "候",
  "毛",
  "亲",
  "快",
  "效",
  "斯",
  "院",
  "查",
  "江",
  "型",
  "眼",
  "王",
  "按",
  "格",
  "养",
  "易",
  "置",
  "派",
  "层",
  "片",
  "始",
  "却",
  "专",
  "状",
  "育",
  "厂",
  "京",
  "识",
  "适",
  "属",
  "圆",
  "包",
  "火",
  "住",
  "调",
  "满",
  "县",
  "局",
  "照",
  "参",
  "红",
  "细",
  "引",
  "听",
  "该",
  "铁",
  "价",
  "严",
  "首",
  "底",
  "液",
  "官",
  "德",
  "随",
  "病",
  "苏",
  "失",
  "尔",
  "死",
  "讲",
  "配",
  "女",
  "黄",
  "推",
  "显",
  "谈",
  "罪",
  "神",
  "艺",
  "呢",
  "席",
  "含",
  "企",
  "望",
  "密",
  "批",
  "营",
  "项",
  "防",
  "举",
  "球",
  "英",
  "氧",
  "势",
  "告",
  "李",
  "台",
  "落",
  "木",
  "帮",
  "轮",
  "破",
  "亚",
  "师",
  "围",
  "注",
  "远",
  "字",
  "材",
  "排",
  "供",
  "河",
  "态",
  "封",
  "另",
  "施",
  "减",
  "树",
  "溶",
  "怎",
  "止",
  "案",
  "言",
  "士",
  "均",
  "武",
  "固",
  "叶",
  "鱼",
  "波",
  "视",
  "仅",
  "费",
  "紧",
  "爱",
  "左",
  "章",
  "早",
  "朝",
  "害",
  "续",
  "轻",
  "服",
  "试",
  "食",
  "充",
  "兵",
  "源",
  "判",
  "护",
  "司",
  "足",
  "某",
  "练",
  "差",
  "致",
  "板",
  "田",
  "降",
  "黑",
  "犯",
  "负",
  "击",
  "范",
  "继",
  "兴",
  "似",
  "余",
  "坚",
  "曲",
  "输",
  "修",
  "故",
  "城",
  "夫",
  "够",
  "送",
  "笔",
  "船",
  "占",
  "右",
  "财",
  "吃",
  "富",
  "春",
  "职",
  "觉",
  "汉",
  "画",
  "功",
  "巴",
  "跟",
  "虽",
  "杂",
  "飞",
  "检",
  "吸",
  "助",
  "升",
  "阳",
  "互",
  "初",
  "创",
  "抗",
  "考",
  "投",
  "坏",
  "策",
  "古",
  "径",
  "换",
  "未",
  "跑",
  "留",
  "钢",
  "曾",
  "端",
  "责",
  "站",
  "简",
  "述",
  "钱",
  "副",
  "尽",
  "帝",
  "射",
  "草",
  "冲",
  "承",
  "独",
  "令",
  "限",
  "阿",
  "宣",
  "环",
  "双",
  "请",
  "超",
  "微",
  "让",
  "控",
  "州",
  "良",
  "轴",
  "找",
  "否",
  "纪",
  "益",
  "依",
  "优",
  "顶",
  "础",
  "载",
  "倒",
  "房",
  "突",
  "坐",
  "粉",
  "敌",
  "略",
  "客",
  "袁",
  "冷",
  "胜",
  "绝",
  "析",
  "块",
  "剂",
  "测",
  "丝",
  "协",
  "诉",
  "念",
  "陈",
  "仍",
  "罗",
  "盐",
  "友",
  "洋",
  "错",
  "苦",
  "夜",
  "刑",
  "移",
  "频",
  "逐",
  "靠",
  "混",
  "母",
  "短",
  "皮",
  "终",
  "聚",
  "汽",
  "村",
  "云",
  "哪",
  "既",
  "距",
  "卫",
  "停",
  "烈",
  "央",
  "察",
  "烧",
  "迅",
  "境",
  "若",
  "印",
  "洲",
  "刻",
  "括",
  "激",
  "孔",
  "搞",
  "甚",
  "室",
  "待",
  "核",
  "校",
  "散",
  "侵",
  "吧",
  "甲",
  "游",
  "久",
  "菜",
  "味",
  "旧",
  "模",
  "湖",
  "货",
  "损",
  "预",
  "阻",
  "毫",
  "普",
  "稳",
  "乙",
  "妈",
  "植",
  "息",
  "扩",
  "银",
  "语",
  "挥",
  "酒",
  "守",
  "拿",
  "序",
  "纸",
  "医",
  "缺",
  "雨",
  "吗",
  "针",
  "刘",
  "啊",
  "急",
  "唱",
  "误",
  "训",
  "愿",
  "审",
  "附",
  "获",
  "茶",
  "鲜",
  "粮",
  "斤",
  "孩",
  "脱",
  "硫",
  "肥",
  "善",
  "龙",
  "演",
  "父",
  "渐",
  "血",
  "欢",
  "械",
  "掌",
  "歌",
  "沙",
  "刚",
  "攻",
  "谓",
  "盾",
  "讨",
  "晚",
  "粒",
  "乱",
  "燃",
  "矛",
  "乎",
  "杀",
  "药",
  "宁",
  "鲁",
  "贵",
  "钟",
  "煤",
  "读",
  "班",
  "伯",
  "香",
  "介",
  "迫",
  "句",
  "丰",
  "培",
  "握",
  "兰",
  "担",
  "弦",
  "蛋",
  "沉",
  "假",
  "穿",
  "执",
  "答",
  "乐",
  "谁",
  "顺",
  "烟",
  "缩",
  "征",
  "脸",
  "喜",
  "松",
  "脚",
  "困",
  "异",
  "免",
  "背",
  "星",
  "福",
  "买",
  "染",
  "井",
  "概",
  "慢",
  "怕",
  "磁",
  "倍",
  "祖",
  "皇",
  "促",
  "静",
  "补",
  "评",
  "翻",
  "肉",
  "践",
  "尼",
  "衣",
  "宽",
  "扬",
  "棉",
  "希",
  "伤",
  "操",
  "垂",
  "秋",
  "宜",
  "氢",
  "套",
  "督",
  "振",
  "架",
  "亮",
  "末",
  "宪",
  "庆",
  "编",
  "牛",
  "触",
  "映",
  "雷",
  "销",
  "诗",
  "座",
  "居",
  "抓",
  "裂",
  "胞",
  "呼",
  "娘",
  "景",
  "威",
  "绿",
  "晶",
  "厚",
  "盟",
  "衡",
  "鸡",
  "孙",
  "延",
  "危",
  "胶",
  "屋",
  "乡",
  "临",
  "陆",
  "顾",
  "掉",
  "呀",
  "灯",
  "岁",
  "措",
  "束",
  "耐",
  "剧",
  "玉",
  "赵",
  "跳",
  "哥",
  "季",
  "课",
  "凯",
  "胡",
  "额",
  "款",
  "绍",
  "卷",
  "齐",
  "伟",
  "蒸",
  "殖",
  "永",
  "宗",
  "苗",
  "川",
  "炉",
  "岩",
  "弱",
  "零",
  "杨",
  "奏",
  "沿",
  "露",
  "杆",
  "探",
  "滑",
  "镇",
  "饭",
  "浓",
  "航",
  "怀",
  "赶",
  "库",
  "夺",
  "伊",
  "灵",
  "税",
  "途",
  "灭",
  "赛",
  "归",
  "召",
  "鼓",
  "播",
  "盘",
  "裁",
  "险",
  "康",
  "唯",
  "录",
  "菌",
  "纯",
  "借",
  "糖",
  "盖",
  "横",
  "符",
  "私",
  "努",
  "堂",
  "域",
  "枪",
  "润",
  "幅",
  "哈",
  "竟",
  "熟",
  "虫",
  "泽",
  "脑",
  "壤",
  "碳",
  "欧",
  "遍",
  "侧",
  "寨",
  "敢",
  "彻",
  "虑",
  "斜",
  "薄",
  "庭",
  "纳",
  "弹",
  "饲",
  "伸",
  "折",
  "麦",
  "湿",
  "暗",
  "荷",
  "瓦",
  "塞",
  "床",
  "筑",
  "恶",
  "户",
  "访",
  "塔",
  "奇",
  "透",
  "梁",
  "刀",
  "旋",
  "迹",
  "卡",
  "氯",
  "遇",
  "份",
  "毒",
  "泥",
  "退",
  "洗",
  "摆",
  "灰",
  "彩",
  "卖",
  "耗",
  "夏",
  "择",
  "忙",
  "铜",
  "献",
  "硬",
  "予",
  "繁",
  "圈",
  "雪",
  "函",
  "亦",
  "抽",
  "篇",
  "阵",
  "阴",
  "丁",
  "尺",
  "追",
  "堆",
  "雄",
  "迎",
  "泛",
  "爸",
  "楼",
  "避",
  "谋",
  "吨",
  "野",
  "猪",
  "旗",
  "累",
  "偏",
  "典",
  "馆",
  "索",
  "秦",
  "脂",
  "潮",
  "爷",
  "豆",
  "忽",
  "托",
  "惊",
  "塑",
  "遗",
  "愈",
  "朱",
  "替",
  "纤",
  "粗",
  "倾",
  "尚",
  "痛",
  "楚",
  "谢",
  "奋",
  "购",
  "磨",
  "君",
  "池",
  "旁",
  "碎",
  "骨",
  "监",
  "捕",
  "弟",
  "暴",
  "割",
  "贯",
  "殊",
  "释",
  "词",
  "亡",
  "壁",
  "顿",
  "宝",
  "午",
  "尘",
  "闻",
  "揭",
  "炮",
  "残",
  "冬",
  "桥",
  "妇",
  "警",
  "综",
  "招",
  "吴",
  "付",
  "浮",
  "遭",
  "徐",
  "您",
  "摇",
  "谷",
  "赞",
  "箱",
  "隔",
  "订",
  "男",
  "吹",
  "园",
  "纷",
  "唐",
  "败",
  "宋",
  "玻",
  "巨",
  "耕",
  "坦",
  "荣",
  "闭",
  "湾",
  "键",
  "凡",
  "驻",
  "锅",
  "救",
  "恩",
  "剥",
  "凝",
  "碱",
  "齿",
  "截",
  "炼",
  "麻",
  "纺",
  "禁",
  "废",
  "盛",
  "版",
  "缓",
  "净",
  "睛",
  "昌",
  "婚",
  "涉",
  "筒",
  "嘴",
  "插",
  "岸",
  "朗",
  "庄",
  "街",
  "藏",
  "姑",
  "贸",
  "腐",
  "奴",
  "啦",
  "惯",
  "乘",
  "伙",
  "恢",
  "匀",
  "纱",
  "扎",
  "辩",
  "耳",
  "彪",
  "臣",
  "亿",
  "璃",
  "抵",
  "脉",
  "秀",
  "萨",
  "俄",
  "网",
  "舞",
  "店",
  "喷",
  "纵",
  "寸",
  "汗",
  "挂",
  "洪",
  "贺",
  "闪",
  "柬",
  "爆",
  "烯",
  "津",
  "稻",
  "墙",
  "软",
  "勇",
  "像",
  "滚",
  "厘",
  "蒙",
  "芳",
  "肯",
  "坡",
  "柱",
  "荡",
  "腿",
  "仪",
  "旅",
  "尾",
  "轧",
  "冰",
  "贡",
  "登",
  "黎",
  "削",
  "钻",
  "勒",
  "逃",
  "障",
  "氨",
  "郭",
  "峰",
  "币",
  "港",
  "伏",
  "轨",
  "亩",
  "毕",
  "擦",
  "莫",
  "刺",
  "浪",
  "秘",
  "援",
  "株",
  "健",
  "售",
  "股",
  "岛",
  "甘",
  "泡",
  "睡",
  "童",
  "铸",
  "汤",
  "阀",
  "休",
  "汇",
  "舍",
  "牧",
  "绕",
  "炸",
  "哲",
  "磷",
  "绩",
  "朋",
  "淡",
  "尖",
  "启",
  "陷",
  "柴",
  "呈",
  "徒",
  "颜",
  "泪",
  "稍",
  "忘",
  "泵",
  "蓝",
  "拖",
  "洞",
  "授",
  "镜",
  "辛",
  "壮",
  "锋",
  "贫",
  "虚",
  "弯",
  "摩",
  "泰",
  "幼",
  "廷",
  "尊",
  "窗",
  "纲",
  "弄",
  "隶",
  "疑",
  "氏",
  "宫",
  "姐",
  "震",
  "瑞",
  "怪",
  "尤",
  "琴",
  "循",
  "描",
  "膜",
  "违",
  "夹",
  "腰",
  "缘",
  "珠",
  "穷",
  "森",
  "枝",
  "竹",
  "沟",
  "催",
  "绳",
  "忆",
  "邦",
  "剩",
  "幸",
  "浆",
  "栏",
  "拥",
  "牙",
  "贮",
  "礼",
  "滤",
  "钠",
  "纹",
  "罢",
  "拍",
  "咱",
  "喊",
  "袖",
  "埃",
  "勤",
  "罚",
  "焦",
  "潜",
  "伍",
  "墨",
  "欲",
  "缝",
  "姓",
  "刊",
  "饱",
  "仿",
  "奖",
  "铝",
  "鬼",
  "丽",
  "跨",
  "默",
  "挖",
  "链",
  "扫",
  "喝",
  "袋",
  "炭",
  "污",
  "幕",
  "诸",
  "弧",
  "励",
  "梅",
  "奶",
  "洁",
  "灾",
  "舟",
  "鉴",
  "苯",
  "讼",
  "抱",
  "毁",
  "懂",
  "寒",
  "智",
  "埔",
  "寄",
  "届",
  "跃",
  "渡",
  "挑",
  "丹",
  "艰",
  "贝",
  "碰",
  "拔",
  "爹",
  "戴",
  "码",
  "梦",
  "芽",
  "熔",
  "赤",
  "渔",
  "哭",
  "敬",
  "颗",
  "奔",
  "铅",
  "仲",
  "虎",
  "稀",
  "妹",
  "乏",
  "珍",
  "申",
  "桌",
  "遵",
  "允",
  "隆",
  "螺",
  "仓",
  "魏",
  "锐",
  "晓",
  "氮",
  "兼",
  "隐",
  "碍",
  "赫",
  "拨",
  "忠",
  "肃",
  "缸",
  "牵",
  "抢",
  "博",
  "巧",
  "壳",
  "兄",
  "杜",
  "讯",
  "诚",
  "碧",
  "祥",
  "柯",
  "页",
  "巡",
  "矩",
  "悲",
  "灌",
  "龄",
  "伦",
  "票",
  "寻",
  "桂",
  "铺",
  "圣",
  "恐",
  "恰",
  "郑",
  "趣",
  "抬",
  "荒",
  "腾",
  "贴",
  "柔",
  "滴",
  "猛",
  "阔",
  "辆",
  "妻",
  "填",
  "撤",
  "储",
  "签",
  "闹",
  "扰",
  "紫",
  "砂",
  "递",
  "戏",
  "吊",
  "陶",
  "伐",
  "喂",
  "疗",
  "瓶",
  "婆",
  "抚",
  "臂",
  "摸",
  "忍",
  "虾",
  "蜡",
  "邻",
  "胸",
  "巩",
  "挤",
  "偶",
  "弃",
  "槽",
  "劲",
  "乳",
  "邓",
  "吉",
  "仁",
  "烂",
  "砖",
  "租",
  "乌",
  "舰",
  "伴",
  "瓜",
  "浅",
  "丙",
  "暂",
  "燥",
  "橡",
  "柳",
  "迷",
  "暖",
  "牌",
  "秧",
  "胆",
  "详",
  "簧",
  "踏",
  "瓷",
  "谱",
  "呆",
  "宾",
  "糊",
  "洛",
  "辉",
  "愤",
  "竞",
  "隙",
  "怒",
  "粘",
  "乃",
  "绪",
  "肩",
  "籍",
  "敏",
  "涂",
  "熙",
  "皆",
  "侦",
  "悬",
  "掘",
  "享",
  "纠",
  "醒",
  "狂",
  "锁",
  "淀",
  "恨",
  "牲",
  "霸",
  "爬",
  "赏",
  "逆",
  "玩",
  "陵",
  "祝",
  "秒",
  "浙",
  "貌",
  "役",
  "彼",
  "悉",
  "鸭",
  "趋",
  "凤",
  "晨",
  "畜",
  "辈",
  "秩",
  "卵",
  "署",
  "梯",
  "炎",
  "滩",
  "棋",
  "驱",
  "筛",
  "峡",
  "冒",
  "啥",
  "寿",
  "译",
  "浸",
  "泉",
  "帽",
  "迟",
  "硅",
  "疆",
  "贷",
  "漏",
  "稿",
  "冠",
  "嫩",
  "胁",
  "芯",
  "牢",
  "叛",
  "蚀",
  "奥",
  "鸣",
  "岭",
  "羊",
  "凭",
  "串",
  "塘",
  "绘",
  "酵",
  "融",
  "盆",
  "锡",
  "庙",
  "筹",
  "冻",
  "辅",
  "摄",
  "袭",
  "筋",
  "拒",
  "僚",
  "旱",
  "钾",
  "鸟",
  "漆",
  "沈",
  "眉",
  "疏",
  "添",
  "棒",
  "穗",
  "硝",
  "韩",
  "逼",
  "扭",
  "侨",
  "凉",
  "挺",
  "碗",
  "栽",
  "炒",
  "杯",
  "患",
  "馏",
  "劝",
  "豪",
  "辽",
  "勃",
  "鸿",
  "旦",
  "吏",
  "拜",
  "狗",
  "埋",
  "辊",
  "掩",
  "饮",
  "搬",
  "骂",
  "辞",
  "勾",
  "扣",
  "估",
  "蒋",
  "绒",
  "雾",
  "丈",
  "朵",
  "姆",
  "拟",
  "宇",
  "辑",
  "陕",
  "雕",
  "偿",
  "蓄",
  "崇",
  "剪",
  "倡",
  "厅",
  "咬",
  "驶",
  "薯",
  "刷",
  "斥",
  "番",
  "赋",
  "奉",
  "佛",
  "浇",
  "漫",
  "曼",
  "扇",
  "钙",
  "桃",
  "扶",
  "仔",
  "返",
  "俗",
  "亏",
  "腔",
  "鞋",
  "棱",
  "覆",
  "框",
  "悄",
  "叔",
  "撞",
  "骗",
  "勘",
  "旺",
  "沸",
  "孤",
  "吐",
  "孟",
  "渠",
  "屈",
  "疾",
  "妙",
  "惜",
  "仰",
  "狠",
  "胀",
  "谐",
  "抛",
  "霉",
  "桑",
  "岗",
  "嘛",
  "衰",
  "盗",
  "渗",
  "脏",
  "赖",
  "涌",
  "甜",
  "曹",
  "阅",
  "肌",
  "哩",
  "厉",
  "烃",
  "纬",
  "毅",
  "昨",
  "伪",
  "症",
  "煮",
  "叹",
  "钉",
  "搭",
  "茎",
  "笼",
  "酷",
  "偷",
  "弓",
  "锥",
  "恒",
  "杰",
  "坑",
  "鼻",
  "翼",
  "纶",
  "叙",
  "狱",
  "逮",
  "罐",
  "络",
  "棚",
  "抑",
  "膨",
  "蔬",
  "寺",
  "骤",
  "穆",
  "冶",
  "枯",
  "册",
  "尸",
  "凸",
  "绅",
  "坯",
  "牺",
  "焰",
  "轰",
  "欣",
  "晋",
  "瘦",
  "御",
  "锭",
  "锦",
  "丧",
  "旬",
  "锻",
  "垄",
  "搜",
  "扑",
  "邀",
  "亭",
  "酯",
  "迈",
  "舒",
  "脆",
  "酶",
  "闲",
  "忧",
  "酚",
  "顽",
  "羽",
  "涨",
  "卸",
  "仗",
  "陪",
  "辟",
  "惩",
  "杭",
  "姚",
  "肚",
  "捉",
  "飘",
  "漂",
  "昆",
  "欺",
  "吾",
  "郎",
  "烷",
  "汁",
  "呵",
  "饰",
  "萧",
  "雅",
  "邮",
  "迁",
  "燕",
  "撒",
  "姻",
  "赴",
  "宴",
  "烦",
  "债",
  "帐",
  "斑",
  "铃",
  "旨",
  "醇",
  "董",
  "饼",
  "雏",
  "姿",
  "拌",
  "傅",
  "腹",
  "妥",
  "揉",
  "贤",
  "拆",
  "歪",
  "葡",
  "胺",
  "丢",
  "浩",
  "徽",
  "昂",
  "垫",
  "挡",
  "览",
  "贪",
  "慰",
  "缴",
  "汪",
  "慌",
  "冯",
  "诺",
  "姜",
  "谊",
  "凶",
  "劣",
  "诬",
  "耀",
  "昏",
  "躺",
  "盈",
  "骑",
  "乔",
  "溪",
  "丛",
  "卢",
  "抹",
  "闷",
  "咨",
  "刮",
  "驾",
  "缆",
  "悟",
  "摘",
  "铒",
  "掷",
  "颇",
  "幻",
  "柄",
  "惠",
  "惨",
  "佳",
  "仇",
  "腊",
  "窝",
  "涤",
  "剑",
  "瞧",
  "堡",
  "泼",
  "葱",
  "罩",
  "霍",
  "捞",
  "胎",
  "苍",
  "滨",
  "俩",
  "捅",
  "湘",
  "砍",
  "霞",
  "邵",
  "萄",
  "疯",
  "淮",
  "遂",
  "熊",
  "粪",
  "烘",
  "宿",
  "档",
  "戈",
  "驳",
  "嫂",
  "裕",
  "徙",
  "箭",
  "捐",
  "肠",
  "撑",
  "晒",
  "辨",
  "殿",
  "莲",
  "摊",
  "搅",
  "酱",
  "屏",
  "疫",
  "哀",
  "蔡",
  "堵",
  "沫",
  "皱",
  "畅",
  "叠",
  "阁",
  "莱",
  "敲",
  "辖",
  "钩",
  "痕",
  "坝",
  "巷",
  "饿",
  "祸",
  "丘",
  "玄",
  "溜",
  "曰",
  "逻",
  "彭",
  "尝",
  "卿",
  "妨",
  "艇",
  "吞",
  "韦",
  "怨",
  "矮",
  "歇"
]

},{}],31:[function(reqqqqq,module,exports){
module.exports=[
  "的",
  "一",
  "是",
  "在",
  "不",
  "了",
  "有",
  "和",
  "人",
  "這",
  "中",
  "大",
  "為",
  "上",
  "個",
  "國",
  "我",
  "以",
  "要",
  "他",
  "時",
  "來",
  "用",
  "們",
  "生",
  "到",
  "作",
  "地",
  "於",
  "出",
  "就",
  "分",
  "對",
  "成",
  "會",
  "可",
  "主",
  "發",
  "年",
  "動",
  "同",
  "工",
  "也",
  "能",
  "下",
  "過",
  "子",
  "說",
  "產",
  "種",
  "面",
  "而",
  "方",
  "後",
  "多",
  "定",
  "行",
  "學",
  "法",
  "所",
  "民",
  "得",
  "經",
  "十",
  "三",
  "之",
  "進",
  "著",
  "等",
  "部",
  "度",
  "家",
  "電",
  "力",
  "裡",
  "如",
  "水",
  "化",
  "高",
  "自",
  "二",
  "理",
  "起",
  "小",
  "物",
  "現",
  "實",
  "加",
  "量",
  "都",
  "兩",
  "體",
  "制",
  "機",
  "當",
  "使",
  "點",
  "從",
  "業",
  "本",
  "去",
  "把",
  "性",
  "好",
  "應",
  "開",
  "它",
  "合",
  "還",
  "因",
  "由",
  "其",
  "些",
  "然",
  "前",
  "外",
  "天",
  "政",
  "四",
  "日",
  "那",
  "社",
  "義",
  "事",
  "平",
  "形",
  "相",
  "全",
  "表",
  "間",
  "樣",
  "與",
  "關",
  "各",
  "重",
  "新",
  "線",
  "內",
  "數",
  "正",
  "心",
  "反",
  "你",
  "明",
  "看",
  "原",
  "又",
  "麼",
  "利",
  "比",
  "或",
  "但",
  "質",
  "氣",
  "第",
  "向",
  "道",
  "命",
  "此",
  "變",
  "條",
  "只",
  "沒",
  "結",
  "解",
  "問",
  "意",
  "建",
  "月",
  "公",
  "無",
  "系",
  "軍",
  "很",
  "情",
  "者",
  "最",
  "立",
  "代",
  "想",
  "已",
  "通",
  "並",
  "提",
  "直",
  "題",
  "黨",
  "程",
  "展",
  "五",
  "果",
  "料",
  "象",
  "員",
  "革",
  "位",
  "入",
  "常",
  "文",
  "總",
  "次",
  "品",
  "式",
  "活",
  "設",
  "及",
  "管",
  "特",
  "件",
  "長",
  "求",
  "老",
  "頭",
  "基",
  "資",
  "邊",
  "流",
  "路",
  "級",
  "少",
  "圖",
  "山",
  "統",
  "接",
  "知",
  "較",
  "將",
  "組",
  "見",
  "計",
  "別",
  "她",
  "手",
  "角",
  "期",
  "根",
  "論",
  "運",
  "農",
  "指",
  "幾",
  "九",
  "區",
  "強",
  "放",
  "決",
  "西",
  "被",
  "幹",
  "做",
  "必",
  "戰",
  "先",
  "回",
  "則",
  "任",
  "取",
  "據",
  "處",
  "隊",
  "南",
  "給",
  "色",
  "光",
  "門",
  "即",
  "保",
  "治",
  "北",
  "造",
  "百",
  "規",
  "熱",
  "領",
  "七",
  "海",
  "口",
  "東",
  "導",
  "器",
  "壓",
  "志",
  "世",
  "金",
  "增",
  "爭",
  "濟",
  "階",
  "油",
  "思",
  "術",
  "極",
  "交",
  "受",
  "聯",
  "什",
  "認",
  "六",
  "共",
  "權",
  "收",
  "證",
  "改",
  "清",
  "美",
  "再",
  "採",
  "轉",
  "更",
  "單",
  "風",
  "切",
  "打",
  "白",
  "教",
  "速",
  "花",
  "帶",
  "安",
  "場",
  "身",
  "車",
  "例",
  "真",
  "務",
  "具",
  "萬",
  "每",
  "目",
  "至",
  "達",
  "走",
  "積",
  "示",
  "議",
  "聲",
  "報",
  "鬥",
  "完",
  "類",
  "八",
  "離",
  "華",
  "名",
  "確",
  "才",
  "科",
  "張",
  "信",
  "馬",
  "節",
  "話",
  "米",
  "整",
  "空",
  "元",
  "況",
  "今",
  "集",
  "溫",
  "傳",
  "土",
  "許",
  "步",
  "群",
  "廣",
  "石",
  "記",
  "需",
  "段",
  "研",
  "界",
  "拉",
  "林",
  "律",
  "叫",
  "且",
  "究",
  "觀",
  "越",
  "織",
  "裝",
  "影",
  "算",
  "低",
  "持",
  "音",
  "眾",
  "書",
  "布",
  "复",
  "容",
  "兒",
  "須",
  "際",
  "商",
  "非",
  "驗",
  "連",
  "斷",
  "深",
  "難",
  "近",
  "礦",
  "千",
  "週",
  "委",
  "素",
  "技",
  "備",
  "半",
  "辦",
  "青",
  "省",
  "列",
  "習",
  "響",
  "約",
  "支",
  "般",
  "史",
  "感",
  "勞",
  "便",
  "團",
  "往",
  "酸",
  "歷",
  "市",
  "克",
  "何",
  "除",
  "消",
  "構",
  "府",
  "稱",
  "太",
  "準",
  "精",
  "值",
  "號",
  "率",
  "族",
  "維",
  "劃",
  "選",
  "標",
  "寫",
  "存",
  "候",
  "毛",
  "親",
  "快",
  "效",
  "斯",
  "院",
  "查",
  "江",
  "型",
  "眼",
  "王",
  "按",
  "格",
  "養",
  "易",
  "置",
  "派",
  "層",
  "片",
  "始",
  "卻",
  "專",
  "狀",
  "育",
  "廠",
  "京",
  "識",
  "適",
  "屬",
  "圓",
  "包",
  "火",
  "住",
  "調",
  "滿",
  "縣",
  "局",
  "照",
  "參",
  "紅",
  "細",
  "引",
  "聽",
  "該",
  "鐵",
  "價",
  "嚴",
  "首",
  "底",
  "液",
  "官",
  "德",
  "隨",
  "病",
  "蘇",
  "失",
  "爾",
  "死",
  "講",
  "配",
  "女",
  "黃",
  "推",
  "顯",
  "談",
  "罪",
  "神",
  "藝",
  "呢",
  "席",
  "含",
  "企",
  "望",
  "密",
  "批",
  "營",
  "項",
  "防",
  "舉",
  "球",
  "英",
  "氧",
  "勢",
  "告",
  "李",
  "台",
  "落",
  "木",
  "幫",
  "輪",
  "破",
  "亞",
  "師",
  "圍",
  "注",
  "遠",
  "字",
  "材",
  "排",
  "供",
  "河",
  "態",
  "封",
  "另",
  "施",
  "減",
  "樹",
  "溶",
  "怎",
  "止",
  "案",
  "言",
  "士",
  "均",
  "武",
  "固",
  "葉",
  "魚",
  "波",
  "視",
  "僅",
  "費",
  "緊",
  "愛",
  "左",
  "章",
  "早",
  "朝",
  "害",
  "續",
  "輕",
  "服",
  "試",
  "食",
  "充",
  "兵",
  "源",
  "判",
  "護",
  "司",
  "足",
  "某",
  "練",
  "差",
  "致",
  "板",
  "田",
  "降",
  "黑",
  "犯",
  "負",
  "擊",
  "范",
  "繼",
  "興",
  "似",
  "餘",
  "堅",
  "曲",
  "輸",
  "修",
  "故",
  "城",
  "夫",
  "夠",
  "送",
  "筆",
  "船",
  "佔",
  "右",
  "財",
  "吃",
  "富",
  "春",
  "職",
  "覺",
  "漢",
  "畫",
  "功",
  "巴",
  "跟",
  "雖",
  "雜",
  "飛",
  "檢",
  "吸",
  "助",
  "昇",
  "陽",
  "互",
  "初",
  "創",
  "抗",
  "考",
  "投",
  "壞",
  "策",
  "古",
  "徑",
  "換",
  "未",
  "跑",
  "留",
  "鋼",
  "曾",
  "端",
  "責",
  "站",
  "簡",
  "述",
  "錢",
  "副",
  "盡",
  "帝",
  "射",
  "草",
  "衝",
  "承",
  "獨",
  "令",
  "限",
  "阿",
  "宣",
  "環",
  "雙",
  "請",
  "超",
  "微",
  "讓",
  "控",
  "州",
  "良",
  "軸",
  "找",
  "否",
  "紀",
  "益",
  "依",
  "優",
  "頂",
  "礎",
  "載",
  "倒",
  "房",
  "突",
  "坐",
  "粉",
  "敵",
  "略",
  "客",
  "袁",
  "冷",
  "勝",
  "絕",
  "析",
  "塊",
  "劑",
  "測",
  "絲",
  "協",
  "訴",
  "念",
  "陳",
  "仍",
  "羅",
  "鹽",
  "友",
  "洋",
  "錯",
  "苦",
  "夜",
  "刑",
  "移",
  "頻",
  "逐",
  "靠",
  "混",
  "母",
  "短",
  "皮",
  "終",
  "聚",
  "汽",
  "村",
  "雲",
  "哪",
  "既",
  "距",
  "衛",
  "停",
  "烈",
  "央",
  "察",
  "燒",
  "迅",
  "境",
  "若",
  "印",
  "洲",
  "刻",
  "括",
  "激",
  "孔",
  "搞",
  "甚",
  "室",
  "待",
  "核",
  "校",
  "散",
  "侵",
  "吧",
  "甲",
  "遊",
  "久",
  "菜",
  "味",
  "舊",
  "模",
  "湖",
  "貨",
  "損",
  "預",
  "阻",
  "毫",
  "普",
  "穩",
  "乙",
  "媽",
  "植",
  "息",
  "擴",
  "銀",
  "語",
  "揮",
  "酒",
  "守",
  "拿",
  "序",
  "紙",
  "醫",
  "缺",
  "雨",
  "嗎",
  "針",
  "劉",
  "啊",
  "急",
  "唱",
  "誤",
  "訓",
  "願",
  "審",
  "附",
  "獲",
  "茶",
  "鮮",
  "糧",
  "斤",
  "孩",
  "脫",
  "硫",
  "肥",
  "善",
  "龍",
  "演",
  "父",
  "漸",
  "血",
  "歡",
  "械",
  "掌",
  "歌",
  "沙",
  "剛",
  "攻",
  "謂",
  "盾",
  "討",
  "晚",
  "粒",
  "亂",
  "燃",
  "矛",
  "乎",
  "殺",
  "藥",
  "寧",
  "魯",
  "貴",
  "鐘",
  "煤",
  "讀",
  "班",
  "伯",
  "香",
  "介",
  "迫",
  "句",
  "豐",
  "培",
  "握",
  "蘭",
  "擔",
  "弦",
  "蛋",
  "沉",
  "假",
  "穿",
  "執",
  "答",
  "樂",
  "誰",
  "順",
  "煙",
  "縮",
  "徵",
  "臉",
  "喜",
  "松",
  "腳",
  "困",
  "異",
  "免",
  "背",
  "星",
  "福",
  "買",
  "染",
  "井",
  "概",
  "慢",
  "怕",
  "磁",
  "倍",
  "祖",
  "皇",
  "促",
  "靜",
  "補",
  "評",
  "翻",
  "肉",
  "踐",
  "尼",
  "衣",
  "寬",
  "揚",
  "棉",
  "希",
  "傷",
  "操",
  "垂",
  "秋",
  "宜",
  "氫",
  "套",
  "督",
  "振",
  "架",
  "亮",
  "末",
  "憲",
  "慶",
  "編",
  "牛",
  "觸",
  "映",
  "雷",
  "銷",
  "詩",
  "座",
  "居",
  "抓",
  "裂",
  "胞",
  "呼",
  "娘",
  "景",
  "威",
  "綠",
  "晶",
  "厚",
  "盟",
  "衡",
  "雞",
  "孫",
  "延",
  "危",
  "膠",
  "屋",
  "鄉",
  "臨",
  "陸",
  "顧",
  "掉",
  "呀",
  "燈",
  "歲",
  "措",
  "束",
  "耐",
  "劇",
  "玉",
  "趙",
  "跳",
  "哥",
  "季",
  "課",
  "凱",
  "胡",
  "額",
  "款",
  "紹",
  "卷",
  "齊",
  "偉",
  "蒸",
  "殖",
  "永",
  "宗",
  "苗",
  "川",
  "爐",
  "岩",
  "弱",
  "零",
  "楊",
  "奏",
  "沿",
  "露",
  "桿",
  "探",
  "滑",
  "鎮",
  "飯",
  "濃",
  "航",
  "懷",
  "趕",
  "庫",
  "奪",
  "伊",
  "靈",
  "稅",
  "途",
  "滅",
  "賽",
  "歸",
  "召",
  "鼓",
  "播",
  "盤",
  "裁",
  "險",
  "康",
  "唯",
  "錄",
  "菌",
  "純",
  "借",
  "糖",
  "蓋",
  "橫",
  "符",
  "私",
  "努",
  "堂",
  "域",
  "槍",
  "潤",
  "幅",
  "哈",
  "竟",
  "熟",
  "蟲",
  "澤",
  "腦",
  "壤",
  "碳",
  "歐",
  "遍",
  "側",
  "寨",
  "敢",
  "徹",
  "慮",
  "斜",
  "薄",
  "庭",
  "納",
  "彈",
  "飼",
  "伸",
  "折",
  "麥",
  "濕",
  "暗",
  "荷",
  "瓦",
  "塞",
  "床",
  "築",
  "惡",
  "戶",
  "訪",
  "塔",
  "奇",
  "透",
  "梁",
  "刀",
  "旋",
  "跡",
  "卡",
  "氯",
  "遇",
  "份",
  "毒",
  "泥",
  "退",
  "洗",
  "擺",
  "灰",
  "彩",
  "賣",
  "耗",
  "夏",
  "擇",
  "忙",
  "銅",
  "獻",
  "硬",
  "予",
  "繁",
  "圈",
  "雪",
  "函",
  "亦",
  "抽",
  "篇",
  "陣",
  "陰",
  "丁",
  "尺",
  "追",
  "堆",
  "雄",
  "迎",
  "泛",
  "爸",
  "樓",
  "避",
  "謀",
  "噸",
  "野",
  "豬",
  "旗",
  "累",
  "偏",
  "典",
  "館",
  "索",
  "秦",
  "脂",
  "潮",
  "爺",
  "豆",
  "忽",
  "托",
  "驚",
  "塑",
  "遺",
  "愈",
  "朱",
  "替",
  "纖",
  "粗",
  "傾",
  "尚",
  "痛",
  "楚",
  "謝",
  "奮",
  "購",
  "磨",
  "君",
  "池",
  "旁",
  "碎",
  "骨",
  "監",
  "捕",
  "弟",
  "暴",
  "割",
  "貫",
  "殊",
  "釋",
  "詞",
  "亡",
  "壁",
  "頓",
  "寶",
  "午",
  "塵",
  "聞",
  "揭",
  "炮",
  "殘",
  "冬",
  "橋",
  "婦",
  "警",
  "綜",
  "招",
  "吳",
  "付",
  "浮",
  "遭",
  "徐",
  "您",
  "搖",
  "谷",
  "贊",
  "箱",
  "隔",
  "訂",
  "男",
  "吹",
  "園",
  "紛",
  "唐",
  "敗",
  "宋",
  "玻",
  "巨",
  "耕",
  "坦",
  "榮",
  "閉",
  "灣",
  "鍵",
  "凡",
  "駐",
  "鍋",
  "救",
  "恩",
  "剝",
  "凝",
  "鹼",
  "齒",
  "截",
  "煉",
  "麻",
  "紡",
  "禁",
  "廢",
  "盛",
  "版",
  "緩",
  "淨",
  "睛",
  "昌",
  "婚",
  "涉",
  "筒",
  "嘴",
  "插",
  "岸",
  "朗",
  "莊",
  "街",
  "藏",
  "姑",
  "貿",
  "腐",
  "奴",
  "啦",
  "慣",
  "乘",
  "夥",
  "恢",
  "勻",
  "紗",
  "扎",
  "辯",
  "耳",
  "彪",
  "臣",
  "億",
  "璃",
  "抵",
  "脈",
  "秀",
  "薩",
  "俄",
  "網",
  "舞",
  "店",
  "噴",
  "縱",
  "寸",
  "汗",
  "掛",
  "洪",
  "賀",
  "閃",
  "柬",
  "爆",
  "烯",
  "津",
  "稻",
  "牆",
  "軟",
  "勇",
  "像",
  "滾",
  "厘",
  "蒙",
  "芳",
  "肯",
  "坡",
  "柱",
  "盪",
  "腿",
  "儀",
  "旅",
  "尾",
  "軋",
  "冰",
  "貢",
  "登",
  "黎",
  "削",
  "鑽",
  "勒",
  "逃",
  "障",
  "氨",
  "郭",
  "峰",
  "幣",
  "港",
  "伏",
  "軌",
  "畝",
  "畢",
  "擦",
  "莫",
  "刺",
  "浪",
  "秘",
  "援",
  "株",
  "健",
  "售",
  "股",
  "島",
  "甘",
  "泡",
  "睡",
  "童",
  "鑄",
  "湯",
  "閥",
  "休",
  "匯",
  "舍",
  "牧",
  "繞",
  "炸",
  "哲",
  "磷",
  "績",
  "朋",
  "淡",
  "尖",
  "啟",
  "陷",
  "柴",
  "呈",
  "徒",
  "顏",
  "淚",
  "稍",
  "忘",
  "泵",
  "藍",
  "拖",
  "洞",
  "授",
  "鏡",
  "辛",
  "壯",
  "鋒",
  "貧",
  "虛",
  "彎",
  "摩",
  "泰",
  "幼",
  "廷",
  "尊",
  "窗",
  "綱",
  "弄",
  "隸",
  "疑",
  "氏",
  "宮",
  "姐",
  "震",
  "瑞",
  "怪",
  "尤",
  "琴",
  "循",
  "描",
  "膜",
  "違",
  "夾",
  "腰",
  "緣",
  "珠",
  "窮",
  "森",
  "枝",
  "竹",
  "溝",
  "催",
  "繩",
  "憶",
  "邦",
  "剩",
  "幸",
  "漿",
  "欄",
  "擁",
  "牙",
  "貯",
  "禮",
  "濾",
  "鈉",
  "紋",
  "罷",
  "拍",
  "咱",
  "喊",
  "袖",
  "埃",
  "勤",
  "罰",
  "焦",
  "潛",
  "伍",
  "墨",
  "欲",
  "縫",
  "姓",
  "刊",
  "飽",
  "仿",
  "獎",
  "鋁",
  "鬼",
  "麗",
  "跨",
  "默",
  "挖",
  "鏈",
  "掃",
  "喝",
  "袋",
  "炭",
  "污",
  "幕",
  "諸",
  "弧",
  "勵",
  "梅",
  "奶",
  "潔",
  "災",
  "舟",
  "鑑",
  "苯",
  "訟",
  "抱",
  "毀",
  "懂",
  "寒",
  "智",
  "埔",
  "寄",
  "屆",
  "躍",
  "渡",
  "挑",
  "丹",
  "艱",
  "貝",
  "碰",
  "拔",
  "爹",
  "戴",
  "碼",
  "夢",
  "芽",
  "熔",
  "赤",
  "漁",
  "哭",
  "敬",
  "顆",
  "奔",
  "鉛",
  "仲",
  "虎",
  "稀",
  "妹",
  "乏",
  "珍",
  "申",
  "桌",
  "遵",
  "允",
  "隆",
  "螺",
  "倉",
  "魏",
  "銳",
  "曉",
  "氮",
  "兼",
  "隱",
  "礙",
  "赫",
  "撥",
  "忠",
  "肅",
  "缸",
  "牽",
  "搶",
  "博",
  "巧",
  "殼",
  "兄",
  "杜",
  "訊",
  "誠",
  "碧",
  "祥",
  "柯",
  "頁",
  "巡",
  "矩",
  "悲",
  "灌",
  "齡",
  "倫",
  "票",
  "尋",
  "桂",
  "鋪",
  "聖",
  "恐",
  "恰",
  "鄭",
  "趣",
  "抬",
  "荒",
  "騰",
  "貼",
  "柔",
  "滴",
  "猛",
  "闊",
  "輛",
  "妻",
  "填",
  "撤",
  "儲",
  "簽",
  "鬧",
  "擾",
  "紫",
  "砂",
  "遞",
  "戲",
  "吊",
  "陶",
  "伐",
  "餵",
  "療",
  "瓶",
  "婆",
  "撫",
  "臂",
  "摸",
  "忍",
  "蝦",
  "蠟",
  "鄰",
  "胸",
  "鞏",
  "擠",
  "偶",
  "棄",
  "槽",
  "勁",
  "乳",
  "鄧",
  "吉",
  "仁",
  "爛",
  "磚",
  "租",
  "烏",
  "艦",
  "伴",
  "瓜",
  "淺",
  "丙",
  "暫",
  "燥",
  "橡",
  "柳",
  "迷",
  "暖",
  "牌",
  "秧",
  "膽",
  "詳",
  "簧",
  "踏",
  "瓷",
  "譜",
  "呆",
  "賓",
  "糊",
  "洛",
  "輝",
  "憤",
  "競",
  "隙",
  "怒",
  "粘",
  "乃",
  "緒",
  "肩",
  "籍",
  "敏",
  "塗",
  "熙",
  "皆",
  "偵",
  "懸",
  "掘",
  "享",
  "糾",
  "醒",
  "狂",
  "鎖",
  "淀",
  "恨",
  "牲",
  "霸",
  "爬",
  "賞",
  "逆",
  "玩",
  "陵",
  "祝",
  "秒",
  "浙",
  "貌",
  "役",
  "彼",
  "悉",
  "鴨",
  "趨",
  "鳳",
  "晨",
  "畜",
  "輩",
  "秩",
  "卵",
  "署",
  "梯",
  "炎",
  "灘",
  "棋",
  "驅",
  "篩",
  "峽",
  "冒",
  "啥",
  "壽",
  "譯",
  "浸",
  "泉",
  "帽",
  "遲",
  "矽",
  "疆",
  "貸",
  "漏",
  "稿",
  "冠",
  "嫩",
  "脅",
  "芯",
  "牢",
  "叛",
  "蝕",
  "奧",
  "鳴",
  "嶺",
  "羊",
  "憑",
  "串",
  "塘",
  "繪",
  "酵",
  "融",
  "盆",
  "錫",
  "廟",
  "籌",
  "凍",
  "輔",
  "攝",
  "襲",
  "筋",
  "拒",
  "僚",
  "旱",
  "鉀",
  "鳥",
  "漆",
  "沈",
  "眉",
  "疏",
  "添",
  "棒",
  "穗",
  "硝",
  "韓",
  "逼",
  "扭",
  "僑",
  "涼",
  "挺",
  "碗",
  "栽",
  "炒",
  "杯",
  "患",
  "餾",
  "勸",
  "豪",
  "遼",
  "勃",
  "鴻",
  "旦",
  "吏",
  "拜",
  "狗",
  "埋",
  "輥",
  "掩",
  "飲",
  "搬",
  "罵",
  "辭",
  "勾",
  "扣",
  "估",
  "蔣",
  "絨",
  "霧",
  "丈",
  "朵",
  "姆",
  "擬",
  "宇",
  "輯",
  "陝",
  "雕",
  "償",
  "蓄",
  "崇",
  "剪",
  "倡",
  "廳",
  "咬",
  "駛",
  "薯",
  "刷",
  "斥",
  "番",
  "賦",
  "奉",
  "佛",
  "澆",
  "漫",
  "曼",
  "扇",
  "鈣",
  "桃",
  "扶",
  "仔",
  "返",
  "俗",
  "虧",
  "腔",
  "鞋",
  "棱",
  "覆",
  "框",
  "悄",
  "叔",
  "撞",
  "騙",
  "勘",
  "旺",
  "沸",
  "孤",
  "吐",
  "孟",
  "渠",
  "屈",
  "疾",
  "妙",
  "惜",
  "仰",
  "狠",
  "脹",
  "諧",
  "拋",
  "黴",
  "桑",
  "崗",
  "嘛",
  "衰",
  "盜",
  "滲",
  "臟",
  "賴",
  "湧",
  "甜",
  "曹",
  "閱",
  "肌",
  "哩",
  "厲",
  "烴",
  "緯",
  "毅",
  "昨",
  "偽",
  "症",
  "煮",
  "嘆",
  "釘",
  "搭",
  "莖",
  "籠",
  "酷",
  "偷",
  "弓",
  "錐",
  "恆",
  "傑",
  "坑",
  "鼻",
  "翼",
  "綸",
  "敘",
  "獄",
  "逮",
  "罐",
  "絡",
  "棚",
  "抑",
  "膨",
  "蔬",
  "寺",
  "驟",
  "穆",
  "冶",
  "枯",
  "冊",
  "屍",
  "凸",
  "紳",
  "坯",
  "犧",
  "焰",
  "轟",
  "欣",
  "晉",
  "瘦",
  "禦",
  "錠",
  "錦",
  "喪",
  "旬",
  "鍛",
  "壟",
  "搜",
  "撲",
  "邀",
  "亭",
  "酯",
  "邁",
  "舒",
  "脆",
  "酶",
  "閒",
  "憂",
  "酚",
  "頑",
  "羽",
  "漲",
  "卸",
  "仗",
  "陪",
  "闢",
  "懲",
  "杭",
  "姚",
  "肚",
  "捉",
  "飄",
  "漂",
  "昆",
  "欺",
  "吾",
  "郎",
  "烷",
  "汁",
  "呵",
  "飾",
  "蕭",
  "雅",
  "郵",
  "遷",
  "燕",
  "撒",
  "姻",
  "赴",
  "宴",
  "煩",
  "債",
  "帳",
  "斑",
  "鈴",
  "旨",
  "醇",
  "董",
  "餅",
  "雛",
  "姿",
  "拌",
  "傅",
  "腹",
  "妥",
  "揉",
  "賢",
  "拆",
  "歪",
  "葡",
  "胺",
  "丟",
  "浩",
  "徽",
  "昂",
  "墊",
  "擋",
  "覽",
  "貪",
  "慰",
  "繳",
  "汪",
  "慌",
  "馮",
  "諾",
  "姜",
  "誼",
  "兇",
  "劣",
  "誣",
  "耀",
  "昏",
  "躺",
  "盈",
  "騎",
  "喬",
  "溪",
  "叢",
  "盧",
  "抹",
  "悶",
  "諮",
  "刮",
  "駕",
  "纜",
  "悟",
  "摘",
  "鉺",
  "擲",
  "頗",
  "幻",
  "柄",
  "惠",
  "慘",
  "佳",
  "仇",
  "臘",
  "窩",
  "滌",
  "劍",
  "瞧",
  "堡",
  "潑",
  "蔥",
  "罩",
  "霍",
  "撈",
  "胎",
  "蒼",
  "濱",
  "倆",
  "捅",
  "湘",
  "砍",
  "霞",
  "邵",
  "萄",
  "瘋",
  "淮",
  "遂",
  "熊",
  "糞",
  "烘",
  "宿",
  "檔",
  "戈",
  "駁",
  "嫂",
  "裕",
  "徙",
  "箭",
  "捐",
  "腸",
  "撐",
  "曬",
  "辨",
  "殿",
  "蓮",
  "攤",
  "攪",
  "醬",
  "屏",
  "疫",
  "哀",
  "蔡",
  "堵",
  "沫",
  "皺",
  "暢",
  "疊",
  "閣",
  "萊",
  "敲",
  "轄",
  "鉤",
  "痕",
  "壩",
  "巷",
  "餓",
  "禍",
  "丘",
  "玄",
  "溜",
  "曰",
  "邏",
  "彭",
  "嘗",
  "卿",
  "妨",
  "艇",
  "吞",
  "韋",
  "怨",
  "矮",
  "歇"
]

},{}],32:[function(reqqqqq,module,exports){
module.exports=[
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "age",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "all",
  "alley",
  "allow",
  "almost",
  "alone",
  "alpha",
  "already",
  "also",
  "alter",
  "always",
  "amateur",
  "amazing",
  "among",
  "amount",
  "amused",
  "analyst",
  "anchor",
  "ancient",
  "anger",
  "angle",
  "angry",
  "animal",
  "ankle",
  "announce",
  "annual",
  "another",
  "answer",
  "antenna",
  "antique",
  "anxiety",
  "any",
  "apart",
  "apology",
  "appear",
  "apple",
  "approve",
  "april",
  "arch",
  "arctic",
  "area",
  "arena",
  "argue",
  "arm",
  "armed",
  "armor",
  "army",
  "around",
  "arrange",
  "arrest",
  "arrive",
  "arrow",
  "art",
  "artefact",
  "artist",
  "artwork",
  "ask",
  "aspect",
  "assault",
  "asset",
  "assist",
  "assume",
  "asthma",
  "athlete",
  "atom",
  "attack",
  "attend",
  "attitude",
  "attract",
  "auction",
  "audit",
  "august",
  "aunt",
  "author",
  "auto",
  "autumn",
  "average",
  "avocado",
  "avoid",
  "awake",
  "aware",
  "away",
  "awesome",
  "awful",
  "awkward",
  "axis",
  "baby",
  "bachelor",
  "bacon",
  "badge",
  "bag",
  "balance",
  "balcony",
  "ball",
  "bamboo",
  "banana",
  "banner",
  "bar",
  "barely",
  "bargain",
  "barrel",
  "base",
  "basic",
  "basket",
  "battle",
  "beach",
  "bean",
  "beauty",
  "because",
  "become",
  "beef",
  "before",
  "begin",
  "behave",
  "behind",
  "believe",
  "below",
  "belt",
  "bench",
  "benefit",
  "best",
  "betray",
  "better",
  "between",
  "beyond",
  "bicycle",
  "bid",
  "bike",
  "bind",
  "biology",
  "bird",
  "birth",
  "bitter",
  "black",
  "blade",
  "blame",
  "blanket",
  "blast",
  "bleak",
  "bless",
  "blind",
  "blood",
  "blossom",
  "blouse",
  "blue",
  "blur",
  "blush",
  "board",
  "boat",
  "body",
  "boil",
  "bomb",
  "bone",
  "bonus",
  "book",
  "boost",
  "border",
  "boring",
  "borrow",
  "boss",
  "bottom",
  "bounce",
  "box",
  "boy",
  "bracket",
  "brain",
  "brand",
  "brass",
  "brave",
  "bread",
  "breeze",
  "brick",
  "bridge",
  "brief",
  "bright",
  "bring",
  "brisk",
  "broccoli",
  "broken",
  "bronze",
  "broom",
  "brother",
  "brown",
  "brush",
  "bubble",
  "buddy",
  "budget",
  "buffalo",
  "build",
  "bulb",
  "bulk",
  "bullet",
  "bundle",
  "bunker",
  "burden",
  "burger",
  "burst",
  "bus",
  "business",
  "busy",
  "butter",
  "buyer",
  "buzz",
  "cabbage",
  "cabin",
  "cable",
  "cactus",
  "cage",
  "cake",
  "call",
  "calm",
  "camera",
  "camp",
  "can",
  "canal",
  "cancel",
  "candy",
  "cannon",
  "canoe",
  "canvas",
  "canyon",
  "capable",
  "capital",
  "captain",
  "car",
  "carbon",
  "card",
  "cargo",
  "carpet",
  "carry",
  "cart",
  "case",
  "cash",
  "casino",
  "castle",
  "casual",
  "cat",
  "catalog",
  "catch",
  "category",
  "cattle",
  "caught",
  "cause",
  "caution",
  "cave",
  "ceiling",
  "celery",
  "cement",
  "census",
  "century",
  "cereal",
  "certain",
  "chair",
  "chalk",
  "champion",
  "change",
  "chaos",
  "chapter",
  "charge",
  "chase",
  "chat",
  "cheap",
  "check",
  "cheese",
  "chef",
  "cherry",
  "chest",
  "chicken",
  "chief",
  "child",
  "chimney",
  "choice",
  "choose",
  "chronic",
  "chuckle",
  "chunk",
  "churn",
  "cigar",
  "cinnamon",
  "circle",
  "citizen",
  "city",
  "civil",
  "claim",
  "clap",
  "clarify",
  "claw",
  "clay",
  "clean",
  "clerk",
  "clever",
  "click",
  "client",
  "cliff",
  "climb",
  "clinic",
  "clip",
  "clock",
  "clog",
  "close",
  "cloth",
  "cloud",
  "clown",
  "club",
  "clump",
  "cluster",
  "clutch",
  "coach",
  "coast",
  "coconut",
  "code",
  "coffee",
  "coil",
  "coin",
  "collect",
  "color",
  "column",
  "combine",
  "come",
  "comfort",
  "comic",
  "common",
  "company",
  "concert",
  "conduct",
  "confirm",
  "congress",
  "connect",
  "consider",
  "control",
  "convince",
  "cook",
  "cool",
  "copper",
  "copy",
  "coral",
  "core",
  "corn",
  "correct",
  "cost",
  "cotton",
  "couch",
  "country",
  "couple",
  "course",
  "cousin",
  "cover",
  "coyote",
  "crack",
  "cradle",
  "craft",
  "cram",
  "crane",
  "crash",
  "crater",
  "crawl",
  "crazy",
  "cream",
  "credit",
  "creek",
  "crew",
  "cricket",
  "crime",
  "crisp",
  "critic",
  "crop",
  "cross",
  "crouch",
  "crowd",
  "crucial",
  "cruel",
  "cruise",
  "crumble",
  "crunch",
  "crush",
  "cry",
  "crystal",
  "cube",
  "culture",
  "cup",
  "cupboard",
  "curious",
  "current",
  "curtain",
  "curve",
  "cushion",
  "custom",
  "cute",
  "cycle",
  "dad",
  "damage",
  "damp",
  "dance",
  "danger",
  "daring",
  "dash",
  "daughter",
  "dawn",
  "day",
  "deal",
  "debate",
  "debris",
  "decade",
  "december",
  "decide",
  "decline",
  "decorate",
  "decrease",
  "deer",
  "defense",
  "define",
  "defy",
  "degree",
  "delay",
  "deliver",
  "demand",
  "demise",
  "denial",
  "dentist",
  "deny",
  "depart",
  "depend",
  "deposit",
  "depth",
  "deputy",
  "derive",
  "describe",
  "desert",
  "design",
  "desk",
  "despair",
  "destroy",
  "detail",
  "detect",
  "develop",
  "device",
  "devote",
  "diagram",
  "dial",
  "diamond",
  "diary",
  "dice",
  "diesel",
  "diet",
  "differ",
  "digital",
  "dignity",
  "dilemma",
  "dinner",
  "dinosaur",
  "direct",
  "dirt",
  "disagree",
  "discover",
  "disease",
  "dish",
  "dismiss",
  "disorder",
  "display",
  "distance",
  "divert",
  "divide",
  "divorce",
  "dizzy",
  "doctor",
  "document",
  "dog",
  "doll",
  "dolphin",
  "domain",
  "donate",
  "donkey",
  "donor",
  "door",
  "dose",
  "double",
  "dove",
  "draft",
  "dragon",
  "drama",
  "drastic",
  "draw",
  "dream",
  "dress",
  "drift",
  "drill",
  "drink",
  "drip",
  "drive",
  "drop",
  "drum",
  "dry",
  "duck",
  "dumb",
  "dune",
  "during",
  "dust",
  "dutch",
  "duty",
  "dwarf",
  "dynamic",
  "eager",
  "eagle",
  "early",
  "earn",
  "earth",
  "easily",
  "east",
  "easy",
  "echo",
  "ecology",
  "economy",
  "edge",
  "edit",
  "educate",
  "effort",
  "egg",
  "eight",
  "either",
  "elbow",
  "elder",
  "electric",
  "elegant",
  "element",
  "elephant",
  "elevator",
  "elite",
  "else",
  "embark",
  "embody",
  "embrace",
  "emerge",
  "emotion",
  "employ",
  "empower",
  "empty",
  "enable",
  "enact",
  "end",
  "endless",
  "endorse",
  "enemy",
  "energy",
  "enforce",
  "engage",
  "engine",
  "enhance",
  "enjoy",
  "enlist",
  "enough",
  "enrich",
  "enroll",
  "ensure",
  "enter",
  "entire",
  "entry",
  "envelope",
  "episode",
  "equal",
  "equip",
  "era",
  "erase",
  "erode",
  "erosion",
  "error",
  "erupt",
  "escape",
  "essay",
  "essence",
  "estate",
  "eternal",
  "ethics",
  "evidence",
  "evil",
  "evoke",
  "evolve",
  "exact",
  "example",
  "excess",
  "exchange",
  "excite",
  "exclude",
  "excuse",
  "execute",
  "exercise",
  "exhaust",
  "exhibit",
  "exile",
  "exist",
  "exit",
  "exotic",
  "expand",
  "expect",
  "expire",
  "explain",
  "expose",
  "express",
  "extend",
  "extra",
  "eye",
  "eyebrow",
  "fabric",
  "face",
  "faculty",
  "fade",
  "faint",
  "faith",
  "fall",
  "false",
  "fame",
  "family",
  "famous",
  "fan",
  "fancy",
  "fantasy",
  "farm",
  "fashion",
  "fat",
  "fatal",
  "father",
  "fatigue",
  "fault",
  "favorite",
  "feature",
  "february",
  "federal",
  "fee",
  "feed",
  "feel",
  "female",
  "fence",
  "festival",
  "fetch",
  "fever",
  "few",
  "fiber",
  "fiction",
  "field",
  "figure",
  "file",
  "film",
  "filter",
  "final",
  "find",
  "fine",
  "finger",
  "finish",
  "fire",
  "firm",
  "first",
  "fiscal",
  "fish",
  "fit",
  "fitness",
  "fix",
  "flag",
  "flame",
  "flash",
  "flat",
  "flavor",
  "flee",
  "flight",
  "flip",
  "float",
  "flock",
  "floor",
  "flower",
  "fluid",
  "flush",
  "fly",
  "foam",
  "focus",
  "fog",
  "foil",
  "fold",
  "follow",
  "food",
  "foot",
  "force",
  "forest",
  "forget",
  "fork",
  "fortune",
  "forum",
  "forward",
  "fossil",
  "foster",
  "found",
  "fox",
  "fragile",
  "frame",
  "frequent",
  "fresh",
  "friend",
  "fringe",
  "frog",
  "front",
  "frost",
  "frown",
  "frozen",
  "fruit",
  "fuel",
  "fun",
  "funny",
  "furnace",
  "fury",
  "future",
  "gadget",
  "gain",
  "galaxy",
  "gallery",
  "game",
  "gap",
  "garage",
  "garbage",
  "garden",
  "garlic",
  "garment",
  "gas",
  "gasp",
  "gate",
  "gather",
  "gauge",
  "gaze",
  "general",
  "genius",
  "genre",
  "gentle",
  "genuine",
  "gesture",
  "ghost",
  "giant",
  "gift",
  "giggle",
  "ginger",
  "giraffe",
  "girl",
  "give",
  "glad",
  "glance",
  "glare",
  "glass",
  "glide",
  "glimpse",
  "globe",
  "gloom",
  "glory",
  "glove",
  "glow",
  "glue",
  "goat",
  "goddess",
  "gold",
  "good",
  "goose",
  "gorilla",
  "gospel",
  "gossip",
  "govern",
  "gown",
  "grab",
  "grace",
  "grain",
  "grant",
  "grape",
  "grass",
  "gravity",
  "great",
  "green",
  "grid",
  "grief",
  "grit",
  "grocery",
  "group",
  "grow",
  "grunt",
  "guard",
  "guess",
  "guide",
  "guilt",
  "guitar",
  "gun",
  "gym",
  "habit",
  "hair",
  "half",
  "hammer",
  "hamster",
  "hand",
  "happy",
  "harbor",
  "hard",
  "harsh",
  "harvest",
  "hat",
  "have",
  "hawk",
  "hazard",
  "head",
  "health",
  "heart",
  "heavy",
  "hedgehog",
  "height",
  "hello",
  "helmet",
  "help",
  "hen",
  "hero",
  "hidden",
  "high",
  "hill",
  "hint",
  "hip",
  "hire",
  "history",
  "hobby",
  "hockey",
  "hold",
  "hole",
  "holiday",
  "hollow",
  "home",
  "honey",
  "hood",
  "hope",
  "horn",
  "horror",
  "horse",
  "hospital",
  "host",
  "hotel",
  "hour",
  "hover",
  "hub",
  "huge",
  "human",
  "humble",
  "humor",
  "hundred",
  "hungry",
  "hunt",
  "hurdle",
  "hurry",
  "hurt",
  "husband",
  "hybrid",
  "ice",
  "icon",
  "idea",
  "identify",
  "idle",
  "ignore",
  "ill",
  "illegal",
  "illness",
  "image",
  "imitate",
  "immense",
  "immune",
  "impact",
  "impose",
  "improve",
  "impulse",
  "inch",
  "include",
  "income",
  "increase",
  "index",
  "indicate",
  "indoor",
  "industry",
  "infant",
  "inflict",
  "inform",
  "inhale",
  "inherit",
  "initial",
  "inject",
  "injury",
  "inmate",
  "inner",
  "innocent",
  "input",
  "inquiry",
  "insane",
  "insect",
  "inside",
  "inspire",
  "install",
  "intact",
  "interest",
  "into",
  "invest",
  "invite",
  "involve",
  "iron",
  "island",
  "isolate",
  "issue",
  "item",
  "ivory",
  "jacket",
  "jaguar",
  "jar",
  "jazz",
  "jealous",
  "jeans",
  "jelly",
  "jewel",
  "job",
  "join",
  "joke",
  "journey",
  "joy",
  "judge",
  "juice",
  "jump",
  "jungle",
  "junior",
  "junk",
  "just",
  "kangaroo",
  "keen",
  "keep",
  "ketchup",
  "key",
  "kick",
  "kid",
  "kidney",
  "kind",
  "kingdom",
  "kiss",
  "kit",
  "kitchen",
  "kite",
  "kitten",
  "kiwi",
  "knee",
  "knife",
  "knock",
  "know",
  "lab",
  "label",
  "labor",
  "ladder",
  "lady",
  "lake",
  "lamp",
  "language",
  "laptop",
  "large",
  "later",
  "latin",
  "laugh",
  "laundry",
  "lava",
  "law",
  "lawn",
  "lawsuit",
  "layer",
  "lazy",
  "leader",
  "leaf",
  "learn",
  "leave",
  "lecture",
  "left",
  "leg",
  "legal",
  "legend",
  "leisure",
  "lemon",
  "lend",
  "length",
  "lens",
  "leopard",
  "lesson",
  "letter",
  "level",
  "liar",
  "liberty",
  "library",
  "license",
  "life",
  "lift",
  "light",
  "like",
  "limb",
  "limit",
  "link",
  "lion",
  "liquid",
  "list",
  "little",
  "live",
  "lizard",
  "load",
  "loan",
  "lobster",
  "local",
  "lock",
  "logic",
  "lonely",
  "long",
  "loop",
  "lottery",
  "loud",
  "lounge",
  "love",
  "loyal",
  "lucky",
  "luggage",
  "lumber",
  "lunar",
  "lunch",
  "luxury",
  "lyrics",
  "machine",
  "mad",
  "magic",
  "magnet",
  "maid",
  "mail",
  "main",
  "major",
  "make",
  "mammal",
  "man",
  "manage",
  "mandate",
  "mango",
  "mansion",
  "manual",
  "maple",
  "marble",
  "march",
  "margin",
  "marine",
  "market",
  "marriage",
  "mask",
  "mass",
  "master",
  "match",
  "material",
  "math",
  "matrix",
  "matter",
  "maximum",
  "maze",
  "meadow",
  "mean",
  "measure",
  "meat",
  "mechanic",
  "medal",
  "media",
  "melody",
  "melt",
  "member",
  "memory",
  "mention",
  "menu",
  "mercy",
  "merge",
  "merit",
  "merry",
  "mesh",
  "message",
  "metal",
  "method",
  "middle",
  "midnight",
  "milk",
  "million",
  "mimic",
  "mind",
  "minimum",
  "minor",
  "minute",
  "miracle",
  "mirror",
  "misery",
  "miss",
  "mistake",
  "mix",
  "mixed",
  "mixture",
  "mobile",
  "model",
  "modify",
  "mom",
  "moment",
  "monitor",
  "monkey",
  "monster",
  "month",
  "moon",
  "moral",
  "more",
  "morning",
  "mosquito",
  "mother",
  "motion",
  "motor",
  "mountain",
  "mouse",
  "move",
  "movie",
  "much",
  "muffin",
  "mule",
  "multiply",
  "muscle",
  "museum",
  "mushroom",
  "music",
  "must",
  "mutual",
  "myself",
  "mystery",
  "myth",
  "naive",
  "name",
  "napkin",
  "narrow",
  "nasty",
  "nation",
  "nature",
  "near",
  "neck",
  "need",
  "negative",
  "neglect",
  "neither",
  "nephew",
  "nerve",
  "nest",
  "net",
  "network",
  "neutral",
  "never",
  "news",
  "next",
  "nice",
  "night",
  "noble",
  "noise",
  "nominee",
  "noodle",
  "normal",
  "north",
  "nose",
  "notable",
  "note",
  "nothing",
  "notice",
  "novel",
  "now",
  "nuclear",
  "number",
  "nurse",
  "nut",
  "oak",
  "obey",
  "object",
  "oblige",
  "obscure",
  "observe",
  "obtain",
  "obvious",
  "occur",
  "ocean",
  "october",
  "odor",
  "off",
  "offer",
  "office",
  "often",
  "oil",
  "okay",
  "old",
  "olive",
  "olympic",
  "omit",
  "once",
  "one",
  "onion",
  "online",
  "only",
  "open",
  "opera",
  "opinion",
  "oppose",
  "option",
  "orange",
  "orbit",
  "orchard",
  "order",
  "ordinary",
  "organ",
  "orient",
  "original",
  "orphan",
  "ostrich",
  "other",
  "outdoor",
  "outer",
  "output",
  "outside",
  "oval",
  "oven",
  "over",
  "own",
  "owner",
  "oxygen",
  "oyster",
  "ozone",
  "pact",
  "paddle",
  "page",
  "pair",
  "palace",
  "palm",
  "panda",
  "panel",
  "panic",
  "panther",
  "paper",
  "parade",
  "parent",
  "park",
  "parrot",
  "party",
  "pass",
  "patch",
  "path",
  "patient",
  "patrol",
  "pattern",
  "pause",
  "pave",
  "payment",
  "peace",
  "peanut",
  "pear",
  "peasant",
  "pelican",
  "pen",
  "penalty",
  "pencil",
  "people",
  "pepper",
  "perfect",
  "permit",
  "person",
  "pet",
  "phone",
  "photo",
  "phrase",
  "physical",
  "piano",
  "picnic",
  "picture",
  "piece",
  "pig",
  "pigeon",
  "pill",
  "pilot",
  "pink",
  "pioneer",
  "pipe",
  "pistol",
  "pitch",
  "pizza",
  "place",
  "planet",
  "plastic",
  "plate",
  "play",
  "please",
  "pledge",
  "pluck",
  "plug",
  "plunge",
  "poem",
  "poet",
  "point",
  "polar",
  "pole",
  "police",
  "pond",
  "pony",
  "pool",
  "popular",
  "portion",
  "position",
  "possible",
  "post",
  "potato",
  "pottery",
  "poverty",
  "powder",
  "power",
  "practice",
  "praise",
  "predict",
  "prefer",
  "prepare",
  "present",
  "pretty",
  "prevent",
  "price",
  "pride",
  "primary",
  "print",
  "priority",
  "prison",
  "private",
  "prize",
  "problem",
  "process",
  "produce",
  "profit",
  "program",
  "project",
  "promote",
  "proof",
  "property",
  "prosper",
  "protect",
  "proud",
  "provide",
  "public",
  "pudding",
  "pull",
  "pulp",
  "pulse",
  "pumpkin",
  "punch",
  "pupil",
  "puppy",
  "purchase",
  "purity",
  "purpose",
  "purse",
  "push",
  "put",
  "puzzle",
  "pyramid",
  "quality",
  "quantum",
  "quarter",
  "question",
  "quick",
  "quit",
  "quiz",
  "quote",
  "rabbit",
  "raccoon",
  "race",
  "rack",
  "radar",
  "radio",
  "rail",
  "rain",
  "raise",
  "rally",
  "ramp",
  "ranch",
  "random",
  "range",
  "rapid",
  "rare",
  "rate",
  "rather",
  "raven",
  "raw",
  "razor",
  "ready",
  "real",
  "reason",
  "rebel",
  "rebuild",
  "recall",
  "receive",
  "recipe",
  "record",
  "recycle",
  "reduce",
  "reflect",
  "reform",
  "refuse",
  "region",
  "regret",
  "regular",
  "reject",
  "relax",
  "release",
  "relief",
  "rely",
  "remain",
  "remember",
  "remind",
  "remove",
  "render",
  "renew",
  "rent",
  "reopen",
  "repair",
  "repeat",
  "replace",
  "report",
  "reqqqqq",
  "rescue",
  "resemble",
  "resist",
  "resource",
  "response",
  "result",
  "retire",
  "retreat",
  "return",
  "reunion",
  "reveal",
  "review",
  "reward",
  "rhythm",
  "rib",
  "ribbon",
  "rice",
  "rich",
  "ride",
  "ridge",
  "rifle",
  "right",
  "rigid",
  "ring",
  "riot",
  "ripple",
  "risk",
  "ritual",
  "rival",
  "river",
  "road",
  "roast",
  "robot",
  "robust",
  "rocket",
  "romance",
  "roof",
  "rookie",
  "room",
  "rose",
  "rotate",
  "rough",
  "round",
  "route",
  "royal",
  "rubber",
  "rude",
  "rug",
  "rule",
  "run",
  "runway",
  "rural",
  "sad",
  "saddle",
  "sadness",
  "safe",
  "sail",
  "salad",
  "salmon",
  "salon",
  "salt",
  "salute",
  "same",
  "sample",
  "sand",
  "satisfy",
  "satoshi",
  "sauce",
  "sausage",
  "save",
  "say",
  "scale",
  "scan",
  "scare",
  "scatter",
  "scene",
  "scheme",
  "school",
  "science",
  "scissors",
  "scorpion",
  "scout",
  "scrap",
  "screen",
  "script",
  "scrub",
  "sea",
  "search",
  "season",
  "seat",
  "second",
  "secret",
  "section",
  "security",
  "seed",
  "seek",
  "segment",
  "select",
  "sell",
  "seminar",
  "senior",
  "sense",
  "sentence",
  "series",
  "service",
  "session",
  "settle",
  "setup",
  "seven",
  "shadow",
  "shaft",
  "shallow",
  "share",
  "shed",
  "shell",
  "sheriff",
  "shield",
  "shift",
  "shine",
  "ship",
  "shiver",
  "shock",
  "shoe",
  "shoot",
  "shop",
  "short",
  "shoulder",
  "shove",
  "shrimp",
  "shrug",
  "shuffle",
  "shy",
  "sibling",
  "sick",
  "side",
  "siege",
  "sight",
  "sign",
  "silent",
  "silk",
  "silly",
  "silver",
  "similar",
  "simple",
  "since",
  "sing",
  "siren",
  "sister",
  "situate",
  "six",
  "size",
  "skate",
  "sketch",
  "ski",
  "skill",
  "skin",
  "skirt",
  "skull",
  "slab",
  "slam",
  "sleep",
  "slender",
  "slice",
  "slide",
  "slight",
  "slim",
  "slogan",
  "slot",
  "slow",
  "slush",
  "small",
  "smart",
  "smile",
  "smoke",
  "smooth",
  "snack",
  "snake",
  "snap",
  "sniff",
  "snow",
  "soap",
  "soccer",
  "social",
  "sock",
  "soda",
  "soft",
  "solar",
  "soldier",
  "solid",
  "solution",
  "solve",
  "someone",
  "song",
  "soon",
  "sorry",
  "sort",
  "soul",
  "sound",
  "soup",
  "source",
  "south",
  "space",
  "spare",
  "spatial",
  "spawn",
  "speak",
  "special",
  "speed",
  "spell",
  "spend",
  "sphere",
  "spice",
  "spider",
  "spike",
  "spin",
  "spirit",
  "split",
  "spoil",
  "sponsor",
  "spoon",
  "sport",
  "spot",
  "spray",
  "spread",
  "spring",
  "spy",
  "square",
  "squeeze",
  "squirrel",
  "stable",
  "stadium",
  "staff",
  "stage",
  "stairs",
  "stamp",
  "stand",
  "start",
  "state",
  "stay",
  "steak",
  "steel",
  "stem",
  "step",
  "stereo",
  "stick",
  "still",
  "sting",
  "stock",
  "stomach",
  "stone",
  "stool",
  "story",
  "stove",
  "strategy",
  "street",
  "strike",
  "strong",
  "struggle",
  "student",
  "stuff",
  "stumble",
  "style",
  "subject",
  "submit",
  "subway",
  "success",
  "such",
  "sudden",
  "suffer",
  "sugar",
  "suggest",
  "suit",
  "summer",
  "sun",
  "sunny",
  "sunset",
  "super",
  "supply",
  "supreme",
  "sure",
  "surface",
  "surge",
  "surprise",
  "surround",
  "survey",
  "suspect",
  "sustain",
  "swallow",
  "swamp",
  "swap",
  "swarm",
  "swear",
  "sweet",
  "swift",
  "swim",
  "swing",
  "switch",
  "sword",
  "symbol",
  "symptom",
  "syrup",
  "system",
  "table",
  "tackle",
  "tag",
  "tail",
  "talent",
  "talk",
  "tank",
  "tape",
  "target",
  "task",
  "taste",
  "tattoo",
  "taxi",
  "teach",
  "team",
  "tell",
  "ten",
  "tenant",
  "tennis",
  "tent",
  "term",
  "test",
  "text",
  "thank",
  "that",
  "theme",
  "then",
  "theory",
  "there",
  "they",
  "thing",
  "this",
  "thought",
  "three",
  "thrive",
  "throw",
  "thumb",
  "thunder",
  "ticket",
  "tide",
  "tiger",
  "tilt",
  "timber",
  "time",
  "tiny",
  "tip",
  "tired",
  "tissue",
  "title",
  "toast",
  "tobacco",
  "today",
  "toddler",
  "toe",
  "together",
  "toilet",
  "token",
  "tomato",
  "tomorrow",
  "tone",
  "tongue",
  "tonight",
  "tool",
  "tooth",
  "top",
  "topic",
  "topple",
  "torch",
  "tornado",
  "tortoise",
  "toss",
  "total",
  "tourist",
  "toward",
  "tower",
  "town",
  "toy",
  "track",
  "trade",
  "traffic",
  "tragic",
  "train",
  "transfer",
  "trap",
  "trash",
  "travel",
  "tray",
  "treat",
  "tree",
  "trend",
  "trial",
  "tribe",
  "trick",
  "trigger",
  "trim",
  "trip",
  "trophy",
  "trouble",
  "truck",
  "true",
  "truly",
  "trumpet",
  "trust",
  "truth",
  "try",
  "tube",
  "tuition",
  "tumble",
  "tuna",
  "tunnel",
  "turkey",
  "turn",
  "turtle",
  "twelve",
  "twenty",
  "twice",
  "twin",
  "twist",
  "two",
  "type",
  "typical",
  "ugly",
  "umbrella",
  "unable",
  "unaware",
  "uncle",
  "uncover",
  "under",
  "undo",
  "unfair",
  "unfold",
  "unhappy",
  "uniform",
  "unique",
  "unit",
  "universe",
  "unknown",
  "unlock",
  "until",
  "unusual",
  "unveil",
  "update",
  "upgrade",
  "uphold",
  "upon",
  "upper",
  "upset",
  "urban",
  "urge",
  "usage",
  "use",
  "used",
  "useful",
  "useless",
  "usual",
  "utility",
  "vacant",
  "vacuum",
  "vague",
  "valid",
  "valley",
  "valve",
  "van",
  "vanish",
  "vapor",
  "various",
  "vast",
  "vault",
  "vehicle",
  "velvet",
  "vendor",
  "venture",
  "venue",
  "verb",
  "verify",
  "version",
  "very",
  "vessel",
  "veteran",
  "viable",
  "vibrant",
  "vicious",
  "victory",
  "video",
  "view",
  "village",
  "vintage",
  "violin",
  "virtual",
  "virus",
  "visa",
  "visit",
  "visual",
  "vital",
  "vivid",
  "vocal",
  "voice",
  "void",
  "volcano",
  "volume",
  "vote",
  "voyage",
  "wage",
  "wagon",
  "wait",
  "walk",
  "wall",
  "walnut",
  "want",
  "warfare",
  "warm",
  "warrior",
  "wash",
  "wasp",
  "waste",
  "water",
  "wave",
  "way",
  "wealth",
  "weapon",
  "wear",
  "weasel",
  "weather",
  "web",
  "wedding",
  "weekend",
  "weird",
  "welcome",
  "west",
  "wet",
  "whale",
  "what",
  "wheat",
  "wheel",
  "when",
  "where",
  "whip",
  "whisper",
  "wide",
  "width",
  "wife",
  "wild",
  "will",
  "win",
  "window",
  "wine",
  "wing",
  "wink",
  "winner",
  "winter",
  "wire",
  "wisdom",
  "wise",
  "wish",
  "witness",
  "wolf",
  "woman",
  "wonder",
  "wood",
  "wool",
  "word",
  "work",
  "world",
  "worry",
  "worth",
  "wrap",
  "wreck",
  "wrestle",
  "wrist",
  "write",
  "wrong",
  "yard",
  "year",
  "yellow",
  "you",
  "young",
  "youth",
  "zebra",
  "zero",
  "zone",
  "zoo"
]

},{}],33:[function(reqqqqq,module,exports){
module.exports=[
  "abaisser",
  "abandon",
  "abdiquer",
  "abeille",
  "abolir",
  "aborder",
  "aboutir",
  "aboyer",
  "abrasif",
  "abreuver",
  "abriter",
  "abroger",
  "abrupt",
  "absence",
  "absolu",
  "absurde",
  "abusif",
  "abyssal",
  "académie",
  "acajou",
  "acarien",
  "accabler",
  "accepter",
  "acclamer",
  "accolade",
  "accroche",
  "accuser",
  "acerbe",
  "achat",
  "acheter",
  "aciduler",
  "acier",
  "acompte",
  "acquérir",
  "acronyme",
  "acteur",
  "actif",
  "actuel",
  "adepte",
  "adéquat",
  "adhésif",
  "adjectif",
  "adjuger",
  "admettre",
  "admirer",
  "adopter",
  "adorer",
  "adoucir",
  "adresse",
  "adroit",
  "adulte",
  "adverbe",
  "aérer",
  "aéronef",
  "affaire",
  "affecter",
  "affiche",
  "affreux",
  "affubler",
  "agacer",
  "agencer",
  "agile",
  "agiter",
  "agrafer",
  "agréable",
  "agrume",
  "aider",
  "aiguille",
  "ailier",
  "aimable",
  "aisance",
  "ajouter",
  "ajuster",
  "alarmer",
  "alchimie",
  "alerte",
  "algèbre",
  "algue",
  "aliéner",
  "aliment",
  "alléger",
  "alliage",
  "allouer",
  "allumer",
  "alourdir",
  "alpaga",
  "altesse",
  "alvéole",
  "amateur",
  "ambigu",
  "ambre",
  "aménager",
  "amertume",
  "amidon",
  "amiral",
  "amorcer",
  "amour",
  "amovible",
  "amphibie",
  "ampleur",
  "amusant",
  "analyse",
  "anaphore",
  "anarchie",
  "anatomie",
  "ancien",
  "anéantir",
  "angle",
  "angoisse",
  "anguleux",
  "animal",
  "annexer",
  "annonce",
  "annuel",
  "anodin",
  "anomalie",
  "anonyme",
  "anormal",
  "antenne",
  "antidote",
  "anxieux",
  "apaiser",
  "apéritif",
  "aplanir",
  "apologie",
  "appareil",
  "appeler",
  "apporter",
  "appuyer",
  "aquarium",
  "aqueduc",
  "arbitre",
  "arbuste",
  "ardeur",
  "ardoise",
  "argent",
  "arlequin",
  "armature",
  "armement",
  "armoire",
  "armure",
  "arpenter",
  "arracher",
  "arriver",
  "arroser",
  "arsenic",
  "artériel",
  "article",
  "aspect",
  "asphalte",
  "aspirer",
  "assaut",
  "asservir",
  "assiette",
  "associer",
  "assurer",
  "asticot",
  "astre",
  "astuce",
  "atelier",
  "atome",
  "atrium",
  "atroce",
  "attaque",
  "attentif",
  "attirer",
  "attraper",
  "aubaine",
  "auberge",
  "audace",
  "audible",
  "augurer",
  "aurore",
  "automne",
  "autruche",
  "avaler",
  "avancer",
  "avarice",
  "avenir",
  "averse",
  "aveugle",
  "aviateur",
  "avide",
  "avion",
  "aviser",
  "avoine",
  "avouer",
  "avril",
  "axial",
  "axiome",
  "badge",
  "bafouer",
  "bagage",
  "baguette",
  "baignade",
  "balancer",
  "balcon",
  "baleine",
  "balisage",
  "bambin",
  "bancaire",
  "bandage",
  "banlieue",
  "bannière",
  "banquier",
  "barbier",
  "baril",
  "baron",
  "barque",
  "barrage",
  "bassin",
  "bastion",
  "bataille",
  "bateau",
  "batterie",
  "baudrier",
  "bavarder",
  "belette",
  "bélier",
  "belote",
  "bénéfice",
  "berceau",
  "berger",
  "berline",
  "bermuda",
  "besace",
  "besogne",
  "bétail",
  "beurre",
  "biberon",
  "bicycle",
  "bidule",
  "bijou",
  "bilan",
  "bilingue",
  "billard",
  "binaire",
  "biologie",
  "biopsie",
  "biotype",
  "biscuit",
  "bison",
  "bistouri",
  "bitume",
  "bizarre",
  "blafard",
  "blague",
  "blanchir",
  "blessant",
  "blinder",
  "blond",
  "bloquer",
  "blouson",
  "bobard",
  "bobine",
  "boire",
  "boiser",
  "bolide",
  "bonbon",
  "bondir",
  "bonheur",
  "bonifier",
  "bonus",
  "bordure",
  "borne",
  "botte",
  "boucle",
  "boueux",
  "bougie",
  "boulon",
  "bouquin",
  "bourse",
  "boussole",
  "boutique",
  "boxeur",
  "branche",
  "brasier",
  "brave",
  "brebis",
  "brèche",
  "breuvage",
  "bricoler",
  "brigade",
  "brillant",
  "brioche",
  "brique",
  "brochure",
  "broder",
  "bronzer",
  "brousse",
  "broyeur",
  "brume",
  "brusque",
  "brutal",
  "bruyant",
  "buffle",
  "buisson",
  "bulletin",
  "bureau",
  "burin",
  "bustier",
  "butiner",
  "butoir",
  "buvable",
  "buvette",
  "cabanon",
  "cabine",
  "cachette",
  "cadeau",
  "cadre",
  "caféine",
  "caillou",
  "caisson",
  "calculer",
  "calepin",
  "calibre",
  "calmer",
  "calomnie",
  "calvaire",
  "camarade",
  "caméra",
  "camion",
  "campagne",
  "canal",
  "caneton",
  "canon",
  "cantine",
  "canular",
  "capable",
  "caporal",
  "caprice",
  "capsule",
  "capter",
  "capuche",
  "carabine",
  "carbone",
  "caresser",
  "caribou",
  "carnage",
  "carotte",
  "carreau",
  "carton",
  "cascade",
  "casier",
  "casque",
  "cassure",
  "causer",
  "caution",
  "cavalier",
  "caverne",
  "caviar",
  "cédille",
  "ceinture",
  "céleste",
  "cellule",
  "cendrier",
  "censurer",
  "central",
  "cercle",
  "cérébral",
  "cerise",
  "cerner",
  "cerveau",
  "cesser",
  "chagrin",
  "chaise",
  "chaleur",
  "chambre",
  "chance",
  "chapitre",
  "charbon",
  "chasseur",
  "chaton",
  "chausson",
  "chavirer",
  "chemise",
  "chenille",
  "chéquier",
  "chercher",
  "cheval",
  "chien",
  "chiffre",
  "chignon",
  "chimère",
  "chiot",
  "chlorure",
  "chocolat",
  "choisir",
  "chose",
  "chouette",
  "chrome",
  "chute",
  "cigare",
  "cigogne",
  "cimenter",
  "cinéma",
  "cintrer",
  "circuler",
  "cirer",
  "cirque",
  "citerne",
  "citoyen",
  "citron",
  "civil",
  "clairon",
  "clameur",
  "claquer",
  "classe",
  "clavier",
  "client",
  "cligner",
  "climat",
  "clivage",
  "cloche",
  "clonage",
  "cloporte",
  "cobalt",
  "cobra",
  "cocasse",
  "cocotier",
  "coder",
  "codifier",
  "coffre",
  "cogner",
  "cohésion",
  "coiffer",
  "coincer",
  "colère",
  "colibri",
  "colline",
  "colmater",
  "colonel",
  "combat",
  "comédie",
  "commande",
  "compact",
  "concert",
  "conduire",
  "confier",
  "congeler",
  "connoter",
  "consonne",
  "contact",
  "convexe",
  "copain",
  "copie",
  "corail",
  "corbeau",
  "cordage",
  "corniche",
  "corpus",
  "correct",
  "cortège",
  "cosmique",
  "costume",
  "coton",
  "coude",
  "coupure",
  "courage",
  "couteau",
  "couvrir",
  "coyote",
  "crabe",
  "crainte",
  "cravate",
  "crayon",
  "créature",
  "créditer",
  "crémeux",
  "creuser",
  "crevette",
  "cribler",
  "crier",
  "cristal",
  "critère",
  "croire",
  "croquer",
  "crotale",
  "crucial",
  "cruel",
  "crypter",
  "cubique",
  "cueillir",
  "cuillère",
  "cuisine",
  "cuivre",
  "culminer",
  "cultiver",
  "cumuler",
  "cupide",
  "curatif",
  "curseur",
  "cyanure",
  "cycle",
  "cylindre",
  "cynique",
  "daigner",
  "damier",
  "danger",
  "danseur",
  "dauphin",
  "débattre",
  "débiter",
  "déborder",
  "débrider",
  "débutant",
  "décaler",
  "décembre",
  "déchirer",
  "décider",
  "déclarer",
  "décorer",
  "décrire",
  "décupler",
  "dédale",
  "déductif",
  "déesse",
  "défensif",
  "défiler",
  "défrayer",
  "dégager",
  "dégivrer",
  "déglutir",
  "dégrafer",
  "déjeuner",
  "délice",
  "déloger",
  "demander",
  "demeurer",
  "démolir",
  "dénicher",
  "dénouer",
  "dentelle",
  "dénuder",
  "départ",
  "dépenser",
  "déphaser",
  "déplacer",
  "déposer",
  "déranger",
  "dérober",
  "désastre",
  "descente",
  "désert",
  "désigner",
  "désobéir",
  "dessiner",
  "destrier",
  "détacher",
  "détester",
  "détourer",
  "détresse",
  "devancer",
  "devenir",
  "deviner",
  "devoir",
  "diable",
  "dialogue",
  "diamant",
  "dicter",
  "différer",
  "digérer",
  "digital",
  "digne",
  "diluer",
  "dimanche",
  "diminuer",
  "dioxyde",
  "directif",
  "diriger",
  "discuter",
  "disposer",
  "dissiper",
  "distance",
  "divertir",
  "diviser",
  "docile",
  "docteur",
  "dogme",
  "doigt",
  "domaine",
  "domicile",
  "dompter",
  "donateur",
  "donjon",
  "donner",
  "dopamine",
  "dortoir",
  "dorure",
  "dosage",
  "doseur",
  "dossier",
  "dotation",
  "douanier",
  "double",
  "douceur",
  "douter",
  "doyen",
  "dragon",
  "draper",
  "dresser",
  "dribbler",
  "droiture",
  "duperie",
  "duplexe",
  "durable",
  "durcir",
  "dynastie",
  "éblouir",
  "écarter",
  "écharpe",
  "échelle",
  "éclairer",
  "éclipse",
  "éclore",
  "écluse",
  "école",
  "économie",
  "écorce",
  "écouter",
  "écraser",
  "écrémer",
  "écrivain",
  "écrou",
  "écume",
  "écureuil",
  "édifier",
  "éduquer",
  "effacer",
  "effectif",
  "effigie",
  "effort",
  "effrayer",
  "effusion",
  "égaliser",
  "égarer",
  "éjecter",
  "élaborer",
  "élargir",
  "électron",
  "élégant",
  "éléphant",
  "élève",
  "éligible",
  "élitisme",
  "éloge",
  "élucider",
  "éluder",
  "emballer",
  "embellir",
  "embryon",
  "émeraude",
  "émission",
  "emmener",
  "émotion",
  "émouvoir",
  "empereur",
  "employer",
  "emporter",
  "emprise",
  "émulsion",
  "encadrer",
  "enchère",
  "enclave",
  "encoche",
  "endiguer",
  "endosser",
  "endroit",
  "enduire",
  "énergie",
  "enfance",
  "enfermer",
  "enfouir",
  "engager",
  "engin",
  "englober",
  "énigme",
  "enjamber",
  "enjeu",
  "enlever",
  "ennemi",
  "ennuyeux",
  "enrichir",
  "enrobage",
  "enseigne",
  "entasser",
  "entendre",
  "entier",
  "entourer",
  "entraver",
  "énumérer",
  "envahir",
  "enviable",
  "envoyer",
  "enzyme",
  "éolien",
  "épaissir",
  "épargne",
  "épatant",
  "épaule",
  "épicerie",
  "épidémie",
  "épier",
  "épilogue",
  "épine",
  "épisode",
  "épitaphe",
  "époque",
  "épreuve",
  "éprouver",
  "épuisant",
  "équerre",
  "équipe",
  "ériger",
  "érosion",
  "erreur",
  "éruption",
  "escalier",
  "espadon",
  "espèce",
  "espiègle",
  "espoir",
  "esprit",
  "esquiver",
  "essayer",
  "essence",
  "essieu",
  "essorer",
  "estime",
  "estomac",
  "estrade",
  "étagère",
  "étaler",
  "étanche",
  "étatique",
  "éteindre",
  "étendoir",
  "éternel",
  "éthanol",
  "éthique",
  "ethnie",
  "étirer",
  "étoffer",
  "étoile",
  "étonnant",
  "étourdir",
  "étrange",
  "étroit",
  "étude",
  "euphorie",
  "évaluer",
  "évasion",
  "éventail",
  "évidence",
  "éviter",
  "évolutif",
  "évoquer",
  "exact",
  "exagérer",
  "exaucer",
  "exceller",
  "excitant",
  "exclusif",
  "excuse",
  "exécuter",
  "exemple",
  "exercer",
  "exhaler",
  "exhorter",
  "exigence",
  "exiler",
  "exister",
  "exotique",
  "expédier",
  "explorer",
  "exposer",
  "exprimer",
  "exquis",
  "extensif",
  "extraire",
  "exulter",
  "fable",
  "fabuleux",
  "facette",
  "facile",
  "facture",
  "faiblir",
  "falaise",
  "fameux",
  "famille",
  "farceur",
  "farfelu",
  "farine",
  "farouche",
  "fasciner",
  "fatal",
  "fatigue",
  "faucon",
  "fautif",
  "faveur",
  "favori",
  "fébrile",
  "féconder",
  "fédérer",
  "félin",
  "femme",
  "fémur",
  "fendoir",
  "féodal",
  "fermer",
  "féroce",
  "ferveur",
  "festival",
  "feuille",
  "feutre",
  "février",
  "fiasco",
  "ficeler",
  "fictif",
  "fidèle",
  "figure",
  "filature",
  "filetage",
  "filière",
  "filleul",
  "filmer",
  "filou",
  "filtrer",
  "financer",
  "finir",
  "fiole",
  "firme",
  "fissure",
  "fixer",
  "flairer",
  "flamme",
  "flasque",
  "flatteur",
  "fléau",
  "flèche",
  "fleur",
  "flexion",
  "flocon",
  "flore",
  "fluctuer",
  "fluide",
  "fluvial",
  "folie",
  "fonderie",
  "fongible",
  "fontaine",
  "forcer",
  "forgeron",
  "formuler",
  "fortune",
  "fossile",
  "foudre",
  "fougère",
  "fouiller",
  "foulure",
  "fourmi",
  "fragile",
  "fraise",
  "franchir",
  "frapper",
  "frayeur",
  "frégate",
  "freiner",
  "frelon",
  "frémir",
  "frénésie",
  "frère",
  "friable",
  "friction",
  "frisson",
  "frivole",
  "froid",
  "fromage",
  "frontal",
  "frotter",
  "fruit",
  "fugitif",
  "fuite",
  "fureur",
  "furieux",
  "furtif",
  "fusion",
  "futur",
  "gagner",
  "galaxie",
  "galerie",
  "gambader",
  "garantir",
  "gardien",
  "garnir",
  "garrigue",
  "gazelle",
  "gazon",
  "géant",
  "gélatine",
  "gélule",
  "gendarme",
  "général",
  "génie",
  "genou",
  "gentil",
  "géologie",
  "géomètre",
  "géranium",
  "germe",
  "gestuel",
  "geyser",
  "gibier",
  "gicler",
  "girafe",
  "givre",
  "glace",
  "glaive",
  "glisser",
  "globe",
  "gloire",
  "glorieux",
  "golfeur",
  "gomme",
  "gonfler",
  "gorge",
  "gorille",
  "goudron",
  "gouffre",
  "goulot",
  "goupille",
  "gourmand",
  "goutte",
  "graduel",
  "graffiti",
  "graine",
  "grand",
  "grappin",
  "gratuit",
  "gravir",
  "grenat",
  "griffure",
  "griller",
  "grimper",
  "grogner",
  "gronder",
  "grotte",
  "groupe",
  "gruger",
  "grutier",
  "gruyère",
  "guépard",
  "guerrier",
  "guide",
  "guimauve",
  "guitare",
  "gustatif",
  "gymnaste",
  "gyrostat",
  "habitude",
  "hachoir",
  "halte",
  "hameau",
  "hangar",
  "hanneton",
  "haricot",
  "harmonie",
  "harpon",
  "hasard",
  "hélium",
  "hématome",
  "herbe",
  "hérisson",
  "hermine",
  "héron",
  "hésiter",
  "heureux",
  "hiberner",
  "hibou",
  "hilarant",
  "histoire",
  "hiver",
  "homard",
  "hommage",
  "homogène",
  "honneur",
  "honorer",
  "honteux",
  "horde",
  "horizon",
  "horloge",
  "hormone",
  "horrible",
  "houleux",
  "housse",
  "hublot",
  "huileux",
  "humain",
  "humble",
  "humide",
  "humour",
  "hurler",
  "hydromel",
  "hygiène",
  "hymne",
  "hypnose",
  "idylle",
  "ignorer",
  "iguane",
  "illicite",
  "illusion",
  "image",
  "imbiber",
  "imiter",
  "immense",
  "immobile",
  "immuable",
  "impact",
  "impérial",
  "implorer",
  "imposer",
  "imprimer",
  "imputer",
  "incarner",
  "incendie",
  "incident",
  "incliner",
  "incolore",
  "indexer",
  "indice",
  "inductif",
  "inédit",
  "ineptie",
  "inexact",
  "infini",
  "infliger",
  "informer",
  "infusion",
  "ingérer",
  "inhaler",
  "inhiber",
  "injecter",
  "injure",
  "innocent",
  "inoculer",
  "inonder",
  "inscrire",
  "insecte",
  "insigne",
  "insolite",
  "inspirer",
  "instinct",
  "insulter",
  "intact",
  "intense",
  "intime",
  "intrigue",
  "intuitif",
  "inutile",
  "invasion",
  "inventer",
  "inviter",
  "invoquer",
  "ironique",
  "irradier",
  "irréel",
  "irriter",
  "isoler",
  "ivoire",
  "ivresse",
  "jaguar",
  "jaillir",
  "jambe",
  "janvier",
  "jardin",
  "jauger",
  "jaune",
  "javelot",
  "jetable",
  "jeton",
  "jeudi",
  "jeunesse",
  "joindre",
  "joncher",
  "jongler",
  "joueur",
  "jouissif",
  "journal",
  "jovial",
  "joyau",
  "joyeux",
  "jubiler",
  "jugement",
  "junior",
  "jupon",
  "juriste",
  "justice",
  "juteux",
  "juvénile",
  "kayak",
  "kimono",
  "kiosque",
  "label",
  "labial",
  "labourer",
  "lacérer",
  "lactose",
  "lagune",
  "laine",
  "laisser",
  "laitier",
  "lambeau",
  "lamelle",
  "lampe",
  "lanceur",
  "langage",
  "lanterne",
  "lapin",
  "largeur",
  "larme",
  "laurier",
  "lavabo",
  "lavoir",
  "lecture",
  "légal",
  "léger",
  "légume",
  "lessive",
  "lettre",
  "levier",
  "lexique",
  "lézard",
  "liasse",
  "libérer",
  "libre",
  "licence",
  "licorne",
  "liège",
  "lièvre",
  "ligature",
  "ligoter",
  "ligue",
  "limer",
  "limite",
  "limonade",
  "limpide",
  "linéaire",
  "lingot",
  "lionceau",
  "liquide",
  "lisière",
  "lister",
  "lithium",
  "litige",
  "littoral",
  "livreur",
  "logique",
  "lointain",
  "loisir",
  "lombric",
  "loterie",
  "louer",
  "lourd",
  "loutre",
  "louve",
  "loyal",
  "lubie",
  "lucide",
  "lucratif",
  "lueur",
  "lugubre",
  "luisant",
  "lumière",
  "lunaire",
  "lundi",
  "luron",
  "lutter",
  "luxueux",
  "machine",
  "magasin",
  "magenta",
  "magique",
  "maigre",
  "maillon",
  "maintien",
  "mairie",
  "maison",
  "majorer",
  "malaxer",
  "maléfice",
  "malheur",
  "malice",
  "mallette",
  "mammouth",
  "mandater",
  "maniable",
  "manquant",
  "manteau",
  "manuel",
  "marathon",
  "marbre",
  "marchand",
  "mardi",
  "maritime",
  "marqueur",
  "marron",
  "marteler",
  "mascotte",
  "massif",
  "matériel",
  "matière",
  "matraque",
  "maudire",
  "maussade",
  "mauve",
  "maximal",
  "méchant",
  "méconnu",
  "médaille",
  "médecin",
  "méditer",
  "méduse",
  "meilleur",
  "mélange",
  "mélodie",
  "membre",
  "mémoire",
  "menacer",
  "mener",
  "menhir",
  "mensonge",
  "mentor",
  "mercredi",
  "mérite",
  "merle",
  "messager",
  "mesure",
  "métal",
  "météore",
  "méthode",
  "métier",
  "meuble",
  "miauler",
  "microbe",
  "miette",
  "mignon",
  "migrer",
  "milieu",
  "million",
  "mimique",
  "mince",
  "minéral",
  "minimal",
  "minorer",
  "minute",
  "miracle",
  "miroiter",
  "missile",
  "mixte",
  "mobile",
  "moderne",
  "moelleux",
  "mondial",
  "moniteur",
  "monnaie",
  "monotone",
  "monstre",
  "montagne",
  "monument",
  "moqueur",
  "morceau",
  "morsure",
  "mortier",
  "moteur",
  "motif",
  "mouche",
  "moufle",
  "moulin",
  "mousson",
  "mouton",
  "mouvant",
  "multiple",
  "munition",
  "muraille",
  "murène",
  "murmure",
  "muscle",
  "muséum",
  "musicien",
  "mutation",
  "muter",
  "mutuel",
  "myriade",
  "myrtille",
  "mystère",
  "mythique",
  "nageur",
  "nappe",
  "narquois",
  "narrer",
  "natation",
  "nation",
  "nature",
  "naufrage",
  "nautique",
  "navire",
  "nébuleux",
  "nectar",
  "néfaste",
  "négation",
  "négliger",
  "négocier",
  "neige",
  "nerveux",
  "nettoyer",
  "neurone",
  "neutron",
  "neveu",
  "niche",
  "nickel",
  "nitrate",
  "niveau",
  "noble",
  "nocif",
  "nocturne",
  "noirceur",
  "noisette",
  "nomade",
  "nombreux",
  "nommer",
  "normatif",
  "notable",
  "notifier",
  "notoire",
  "nourrir",
  "nouveau",
  "novateur",
  "novembre",
  "novice",
  "nuage",
  "nuancer",
  "nuire",
  "nuisible",
  "numéro",
  "nuptial",
  "nuque",
  "nutritif",
  "obéir",
  "objectif",
  "obliger",
  "obscur",
  "observer",
  "obstacle",
  "obtenir",
  "obturer",
  "occasion",
  "occuper",
  "océan",
  "octobre",
  "octroyer",
  "octupler",
  "oculaire",
  "odeur",
  "odorant",
  "offenser",
  "officier",
  "offrir",
  "ogive",
  "oiseau",
  "oisillon",
  "olfactif",
  "olivier",
  "ombrage",
  "omettre",
  "onctueux",
  "onduler",
  "onéreux",
  "onirique",
  "opale",
  "opaque",
  "opérer",
  "opinion",
  "opportun",
  "opprimer",
  "opter",
  "optique",
  "orageux",
  "orange",
  "orbite",
  "ordonner",
  "oreille",
  "organe",
  "orgueil",
  "orifice",
  "ornement",
  "orque",
  "ortie",
  "osciller",
  "osmose",
  "ossature",
  "otarie",
  "ouragan",
  "ourson",
  "outil",
  "outrager",
  "ouvrage",
  "ovation",
  "oxyde",
  "oxygène",
  "ozone",
  "paisible",
  "palace",
  "palmarès",
  "palourde",
  "palper",
  "panache",
  "panda",
  "pangolin",
  "paniquer",
  "panneau",
  "panorama",
  "pantalon",
  "papaye",
  "papier",
  "papoter",
  "papyrus",
  "paradoxe",
  "parcelle",
  "paresse",
  "parfumer",
  "parler",
  "parole",
  "parrain",
  "parsemer",
  "partager",
  "parure",
  "parvenir",
  "passion",
  "pastèque",
  "paternel",
  "patience",
  "patron",
  "pavillon",
  "pavoiser",
  "payer",
  "paysage",
  "peigne",
  "peintre",
  "pelage",
  "pélican",
  "pelle",
  "pelouse",
  "peluche",
  "pendule",
  "pénétrer",
  "pénible",
  "pensif",
  "pénurie",
  "pépite",
  "péplum",
  "perdrix",
  "perforer",
  "période",
  "permuter",
  "perplexe",
  "persil",
  "perte",
  "peser",
  "pétale",
  "petit",
  "pétrir",
  "peuple",
  "pharaon",
  "phobie",
  "phoque",
  "photon",
  "phrase",
  "physique",
  "piano",
  "pictural",
  "pièce",
  "pierre",
  "pieuvre",
  "pilote",
  "pinceau",
  "pipette",
  "piquer",
  "pirogue",
  "piscine",
  "piston",
  "pivoter",
  "pixel",
  "pizza",
  "placard",
  "plafond",
  "plaisir",
  "planer",
  "plaque",
  "plastron",
  "plateau",
  "pleurer",
  "plexus",
  "pliage",
  "plomb",
  "plonger",
  "pluie",
  "plumage",
  "pochette",
  "poésie",
  "poète",
  "pointe",
  "poirier",
  "poisson",
  "poivre",
  "polaire",
  "policier",
  "pollen",
  "polygone",
  "pommade",
  "pompier",
  "ponctuel",
  "pondérer",
  "poney",
  "portique",
  "position",
  "posséder",
  "posture",
  "potager",
  "poteau",
  "potion",
  "pouce",
  "poulain",
  "poumon",
  "pourpre",
  "poussin",
  "pouvoir",
  "prairie",
  "pratique",
  "précieux",
  "prédire",
  "préfixe",
  "prélude",
  "prénom",
  "présence",
  "prétexte",
  "prévoir",
  "primitif",
  "prince",
  "prison",
  "priver",
  "problème",
  "procéder",
  "prodige",
  "profond",
  "progrès",
  "proie",
  "projeter",
  "prologue",
  "promener",
  "propre",
  "prospère",
  "protéger",
  "prouesse",
  "proverbe",
  "prudence",
  "pruneau",
  "psychose",
  "public",
  "puceron",
  "puiser",
  "pulpe",
  "pulsar",
  "punaise",
  "punitif",
  "pupitre",
  "purifier",
  "puzzle",
  "pyramide",
  "quasar",
  "querelle",
  "question",
  "quiétude",
  "quitter",
  "quotient",
  "racine",
  "raconter",
  "radieux",
  "ragondin",
  "raideur",
  "raisin",
  "ralentir",
  "rallonge",
  "ramasser",
  "rapide",
  "rasage",
  "ratisser",
  "ravager",
  "ravin",
  "rayonner",
  "réactif",
  "réagir",
  "réaliser",
  "réanimer",
  "recevoir",
  "réciter",
  "réclamer",
  "récolter",
  "recruter",
  "reculer",
  "recycler",
  "rédiger",
  "redouter",
  "refaire",
  "réflexe",
  "réformer",
  "refrain",
  "refuge",
  "régalien",
  "région",
  "réglage",
  "régulier",
  "réitérer",
  "rejeter",
  "rejouer",
  "relatif",
  "relever",
  "relief",
  "remarque",
  "remède",
  "remise",
  "remonter",
  "remplir",
  "remuer",
  "renard",
  "renfort",
  "renifler",
  "renoncer",
  "rentrer",
  "renvoi",
  "replier",
  "reporter",
  "reprise",
  "reptile",
  "requin",
  "réserve",
  "résineux",
  "résoudre",
  "respect",
  "rester",
  "résultat",
  "rétablir",
  "retenir",
  "réticule",
  "retomber",
  "retracer",
  "réunion",
  "réussir",
  "revanche",
  "revivre",
  "révolte",
  "révulsif",
  "richesse",
  "rideau",
  "rieur",
  "rigide",
  "rigoler",
  "rincer",
  "riposter",
  "risible",
  "risque",
  "rituel",
  "rival",
  "rivière",
  "rocheux",
  "romance",
  "rompre",
  "ronce",
  "rondin",
  "roseau",
  "rosier",
  "rotatif",
  "rotor",
  "rotule",
  "rouge",
  "rouille",
  "rouleau",
  "routine",
  "royaume",
  "ruban",
  "rubis",
  "ruche",
  "ruelle",
  "rugueux",
  "ruiner",
  "ruisseau",
  "ruser",
  "rustique",
  "rythme",
  "sabler",
  "saboter",
  "sabre",
  "sacoche",
  "safari",
  "sagesse",
  "saisir",
  "salade",
  "salive",
  "salon",
  "saluer",
  "samedi",
  "sanction",
  "sanglier",
  "sarcasme",
  "sardine",
  "saturer",
  "saugrenu",
  "saumon",
  "sauter",
  "sauvage",
  "savant",
  "savonner",
  "scalpel",
  "scandale",
  "scélérat",
  "scénario",
  "sceptre",
  "schéma",
  "science",
  "scinder",
  "score",
  "scrutin",
  "sculpter",
  "séance",
  "sécable",
  "sécher",
  "secouer",
  "sécréter",
  "sédatif",
  "séduire",
  "seigneur",
  "séjour",
  "sélectif",
  "semaine",
  "sembler",
  "semence",
  "séminal",
  "sénateur",
  "sensible",
  "sentence",
  "séparer",
  "séquence",
  "serein",
  "sergent",
  "sérieux",
  "serrure",
  "sérum",
  "service",
  "sésame",
  "sévir",
  "sevrage",
  "sextuple",
  "sidéral",
  "siècle",
  "siéger",
  "siffler",
  "sigle",
  "signal",
  "silence",
  "silicium",
  "simple",
  "sincère",
  "sinistre",
  "siphon",
  "sirop",
  "sismique",
  "situer",
  "skier",
  "social",
  "socle",
  "sodium",
  "soigneux",
  "soldat",
  "soleil",
  "solitude",
  "soluble",
  "sombre",
  "sommeil",
  "somnoler",
  "sonde",
  "songeur",
  "sonnette",
  "sonore",
  "sorcier",
  "sortir",
  "sosie",
  "sottise",
  "soucieux",
  "soudure",
  "souffle",
  "soulever",
  "soupape",
  "source",
  "soutirer",
  "souvenir",
  "spacieux",
  "spatial",
  "spécial",
  "sphère",
  "spiral",
  "stable",
  "station",
  "sternum",
  "stimulus",
  "stipuler",
  "strict",
  "studieux",
  "stupeur",
  "styliste",
  "sublime",
  "substrat",
  "subtil",
  "subvenir",
  "succès",
  "sucre",
  "suffixe",
  "suggérer",
  "suiveur",
  "sulfate",
  "superbe",
  "supplier",
  "surface",
  "suricate",
  "surmener",
  "surprise",
  "sursaut",
  "survie",
  "suspect",
  "syllabe",
  "symbole",
  "symétrie",
  "synapse",
  "syntaxe",
  "système",
  "tabac",
  "tablier",
  "tactile",
  "tailler",
  "talent",
  "talisman",
  "talonner",
  "tambour",
  "tamiser",
  "tangible",
  "tapis",
  "taquiner",
  "tarder",
  "tarif",
  "tartine",
  "tasse",
  "tatami",
  "tatouage",
  "taupe",
  "taureau",
  "taxer",
  "témoin",
  "temporel",
  "tenaille",
  "tendre",
  "teneur",
  "tenir",
  "tension",
  "terminer",
  "terne",
  "terrible",
  "tétine",
  "texte",
  "thème",
  "théorie",
  "thérapie",
  "thorax",
  "tibia",
  "tiède",
  "timide",
  "tirelire",
  "tiroir",
  "tissu",
  "titane",
  "titre",
  "tituber",
  "toboggan",
  "tolérant",
  "tomate",
  "tonique",
  "tonneau",
  "toponyme",
  "torche",
  "tordre",
  "tornade",
  "torpille",
  "torrent",
  "torse",
  "tortue",
  "totem",
  "toucher",
  "tournage",
  "tousser",
  "toxine",
  "traction",
  "trafic",
  "tragique",
  "trahir",
  "train",
  "trancher",
  "travail",
  "trèfle",
  "tremper",
  "trésor",
  "treuil",
  "triage",
  "tribunal",
  "tricoter",
  "trilogie",
  "triomphe",
  "tripler",
  "triturer",
  "trivial",
  "trombone",
  "tronc",
  "tropical",
  "troupeau",
  "tuile",
  "tulipe",
  "tumulte",
  "tunnel",
  "turbine",
  "tuteur",
  "tutoyer",
  "tuyau",
  "tympan",
  "typhon",
  "typique",
  "tyran",
  "ubuesque",
  "ultime",
  "ultrason",
  "unanime",
  "unifier",
  "union",
  "unique",
  "unitaire",
  "univers",
  "uranium",
  "urbain",
  "urticant",
  "usage",
  "usine",
  "usuel",
  "usure",
  "utile",
  "utopie",
  "vacarme",
  "vaccin",
  "vagabond",
  "vague",
  "vaillant",
  "vaincre",
  "vaisseau",
  "valable",
  "valise",
  "vallon",
  "valve",
  "vampire",
  "vanille",
  "vapeur",
  "varier",
  "vaseux",
  "vassal",
  "vaste",
  "vecteur",
  "vedette",
  "végétal",
  "véhicule",
  "veinard",
  "véloce",
  "vendredi",
  "vénérer",
  "venger",
  "venimeux",
  "ventouse",
  "verdure",
  "vérin",
  "vernir",
  "verrou",
  "verser",
  "vertu",
  "veston",
  "vétéran",
  "vétuste",
  "vexant",
  "vexer",
  "viaduc",
  "viande",
  "victoire",
  "vidange",
  "vidéo",
  "vignette",
  "vigueur",
  "vilain",
  "village",
  "vinaigre",
  "violon",
  "vipère",
  "virement",
  "virtuose",
  "virus",
  "visage",
  "viseur",
  "vision",
  "visqueux",
  "visuel",
  "vital",
  "vitesse",
  "viticole",
  "vitrine",
  "vivace",
  "vivipare",
  "vocation",
  "voguer",
  "voile",
  "voisin",
  "voiture",
  "volaille",
  "volcan",
  "voltiger",
  "volume",
  "vorace",
  "vortex",
  "voter",
  "vouloir",
  "voyage",
  "voyelle",
  "wagon",
  "xénon",
  "yacht",
  "zèbre",
  "zénith",
  "zeste",
  "zoologie"
]

},{}],34:[function(reqqqqq,module,exports){
module.exports=[
  "abaco",
  "abbaglio",
  "abbinato",
  "abete",
  "abisso",
  "abolire",
  "abrasivo",
  "abrogato",
  "accadere",
  "accenno",
  "accusato",
  "acetone",
  "achille",
  "acido",
  "acqua",
  "acre",
  "acrilico",
  "acrobata",
  "acuto",
  "adagio",
  "addebito",
  "addome",
  "adeguato",
  "aderire",
  "adipe",
  "adottare",
  "adulare",
  "affabile",
  "affetto",
  "affisso",
  "affranto",
  "aforisma",
  "afoso",
  "africano",
  "agave",
  "agente",
  "agevole",
  "aggancio",
  "agire",
  "agitare",
  "agonismo",
  "agricolo",
  "agrumeto",
  "aguzzo",
  "alabarda",
  "alato",
  "albatro",
  "alberato",
  "albo",
  "albume",
  "alce",
  "alcolico",
  "alettone",
  "alfa",
  "algebra",
  "aliante",
  "alibi",
  "alimento",
  "allagato",
  "allegro",
  "allievo",
  "allodola",
  "allusivo",
  "almeno",
  "alogeno",
  "alpaca",
  "alpestre",
  "altalena",
  "alterno",
  "alticcio",
  "altrove",
  "alunno",
  "alveolo",
  "alzare",
  "amalgama",
  "amanita",
  "amarena",
  "ambito",
  "ambrato",
  "ameba",
  "america",
  "ametista",
  "amico",
  "ammasso",
  "ammenda",
  "ammirare",
  "ammonito",
  "amore",
  "ampio",
  "ampliare",
  "amuleto",
  "anacardo",
  "anagrafe",
  "analista",
  "anarchia",
  "anatra",
  "anca",
  "ancella",
  "ancora",
  "andare",
  "andrea",
  "anello",
  "angelo",
  "angolare",
  "angusto",
  "anima",
  "annegare",
  "annidato",
  "anno",
  "annuncio",
  "anonimo",
  "anticipo",
  "anzi",
  "apatico",
  "apertura",
  "apode",
  "apparire",
  "appetito",
  "appoggio",
  "approdo",
  "appunto",
  "aprile",
  "arabica",
  "arachide",
  "aragosta",
  "araldica",
  "arancio",
  "aratura",
  "arazzo",
  "arbitro",
  "archivio",
  "ardito",
  "arenile",
  "argento",
  "argine",
  "arguto",
  "aria",
  "armonia",
  "arnese",
  "arredato",
  "arringa",
  "arrosto",
  "arsenico",
  "arso",
  "artefice",
  "arzillo",
  "asciutto",
  "ascolto",
  "asepsi",
  "asettico",
  "asfalto",
  "asino",
  "asola",
  "aspirato",
  "aspro",
  "assaggio",
  "asse",
  "assoluto",
  "assurdo",
  "asta",
  "astenuto",
  "astice",
  "astratto",
  "atavico",
  "ateismo",
  "atomico",
  "atono",
  "attesa",
  "attivare",
  "attorno",
  "attrito",
  "attuale",
  "ausilio",
  "austria",
  "autista",
  "autonomo",
  "autunno",
  "avanzato",
  "avere",
  "avvenire",
  "avviso",
  "avvolgere",
  "azione",
  "azoto",
  "azzimo",
  "azzurro",
  "babele",
  "baccano",
  "bacino",
  "baco",
  "badessa",
  "badilata",
  "bagnato",
  "baita",
  "balcone",
  "baldo",
  "balena",
  "ballata",
  "balzano",
  "bambino",
  "bandire",
  "baraonda",
  "barbaro",
  "barca",
  "baritono",
  "barlume",
  "barocco",
  "basilico",
  "basso",
  "batosta",
  "battuto",
  "baule",
  "bava",
  "bavosa",
  "becco",
  "beffa",
  "belgio",
  "belva",
  "benda",
  "benevole",
  "benigno",
  "benzina",
  "bere",
  "berlina",
  "beta",
  "bibita",
  "bici",
  "bidone",
  "bifido",
  "biga",
  "bilancia",
  "bimbo",
  "binocolo",
  "biologo",
  "bipede",
  "bipolare",
  "birbante",
  "birra",
  "biscotto",
  "bisesto",
  "bisnonno",
  "bisonte",
  "bisturi",
  "bizzarro",
  "blando",
  "blatta",
  "bollito",
  "bonifico",
  "bordo",
  "bosco",
  "botanico",
  "bottino",
  "bozzolo",
  "braccio",
  "bradipo",
  "brama",
  "branca",
  "bravura",
  "bretella",
  "brevetto",
  "brezza",
  "briglia",
  "brillante",
  "brindare",
  "broccolo",
  "brodo",
  "bronzina",
  "brullo",
  "bruno",
  "bubbone",
  "buca",
  "budino",
  "buffone",
  "buio",
  "bulbo",
  "buono",
  "burlone",
  "burrasca",
  "bussola",
  "busta",
  "cadetto",
  "caduco",
  "calamaro",
  "calcolo",
  "calesse",
  "calibro",
  "calmo",
  "caloria",
  "cambusa",
  "camerata",
  "camicia",
  "cammino",
  "camola",
  "campale",
  "canapa",
  "candela",
  "cane",
  "canino",
  "canotto",
  "cantina",
  "capace",
  "capello",
  "capitolo",
  "capogiro",
  "cappero",
  "capra",
  "capsula",
  "carapace",
  "carcassa",
  "cardo",
  "carisma",
  "carovana",
  "carretto",
  "cartolina",
  "casaccio",
  "cascata",
  "caserma",
  "caso",
  "cassone",
  "castello",
  "casuale",
  "catasta",
  "catena",
  "catrame",
  "cauto",
  "cavillo",
  "cedibile",
  "cedrata",
  "cefalo",
  "celebre",
  "cellulare",
  "cena",
  "cenone",
  "centesimo",
  "ceramica",
  "cercare",
  "certo",
  "cerume",
  "cervello",
  "cesoia",
  "cespo",
  "ceto",
  "chela",
  "chiaro",
  "chicca",
  "chiedere",
  "chimera",
  "china",
  "chirurgo",
  "chitarra",
  "ciao",
  "ciclismo",
  "cifrare",
  "cigno",
  "cilindro",
  "ciottolo",
  "circa",
  "cirrosi",
  "citrico",
  "cittadino",
  "ciuffo",
  "civetta",
  "civile",
  "classico",
  "clinica",
  "cloro",
  "cocco",
  "codardo",
  "codice",
  "coerente",
  "cognome",
  "collare",
  "colmato",
  "colore",
  "colposo",
  "coltivato",
  "colza",
  "coma",
  "cometa",
  "commando",
  "comodo",
  "computer",
  "comune",
  "conciso",
  "condurre",
  "conferma",
  "congelare",
  "coniuge",
  "connesso",
  "conoscere",
  "consumo",
  "continuo",
  "convegno",
  "coperto",
  "copione",
  "coppia",
  "copricapo",
  "corazza",
  "cordata",
  "coricato",
  "cornice",
  "corolla",
  "corpo",
  "corredo",
  "corsia",
  "cortese",
  "cosmico",
  "costante",
  "cottura",
  "covato",
  "cratere",
  "cravatta",
  "creato",
  "credere",
  "cremoso",
  "crescita",
  "creta",
  "criceto",
  "crinale",
  "crisi",
  "critico",
  "croce",
  "cronaca",
  "crostata",
  "cruciale",
  "crusca",
  "cucire",
  "cuculo",
  "cugino",
  "cullato",
  "cupola",
  "curatore",
  "cursore",
  "curvo",
  "cuscino",
  "custode",
  "dado",
  "daino",
  "dalmata",
  "damerino",
  "daniela",
  "dannoso",
  "danzare",
  "datato",
  "davanti",
  "davvero",
  "debutto",
  "decennio",
  "deciso",
  "declino",
  "decollo",
  "decreto",
  "dedicato",
  "definito",
  "deforme",
  "degno",
  "delegare",
  "delfino",
  "delirio",
  "delta",
  "demenza",
  "denotato",
  "dentro",
  "deposito",
  "derapata",
  "derivare",
  "deroga",
  "descritto",
  "deserto",
  "desiderio",
  "desumere",
  "detersivo",
  "devoto",
  "diametro",
  "dicembre",
  "diedro",
  "difeso",
  "diffuso",
  "digerire",
  "digitale",
  "diluvio",
  "dinamico",
  "dinnanzi",
  "dipinto",
  "diploma",
  "dipolo",
  "diradare",
  "dire",
  "dirotto",
  "dirupo",
  "disagio",
  "discreto",
  "disfare",
  "disgelo",
  "disposto",
  "distanza",
  "disumano",
  "dito",
  "divano",
  "divelto",
  "dividere",
  "divorato",
  "doblone",
  "docente",
  "doganale",
  "dogma",
  "dolce",
  "domato",
  "domenica",
  "dominare",
  "dondolo",
  "dono",
  "dormire",
  "dote",
  "dottore",
  "dovuto",
  "dozzina",
  "drago",
  "druido",
  "dubbio",
  "dubitare",
  "ducale",
  "duna",
  "duomo",
  "duplice",
  "duraturo",
  "ebano",
  "eccesso",
  "ecco",
  "eclissi",
  "economia",
  "edera",
  "edicola",
  "edile",
  "editoria",
  "educare",
  "egemonia",
  "egli",
  "egoismo",
  "egregio",
  "elaborato",
  "elargire",
  "elegante",
  "elencato",
  "eletto",
  "elevare",
  "elfico",
  "elica",
  "elmo",
  "elsa",
  "eluso",
  "emanato",
  "emblema",
  "emesso",
  "emiro",
  "emotivo",
  "emozione",
  "empirico",
  "emulo",
  "endemico",
  "enduro",
  "energia",
  "enfasi",
  "enoteca",
  "entrare",
  "enzima",
  "epatite",
  "epilogo",
  "episodio",
  "epocale",
  "eppure",
  "equatore",
  "erario",
  "erba",
  "erboso",
  "erede",
  "eremita",
  "erigere",
  "ermetico",
  "eroe",
  "erosivo",
  "errante",
  "esagono",
  "esame",
  "esanime",
  "esaudire",
  "esca",
  "esempio",
  "esercito",
  "esibito",
  "esigente",
  "esistere",
  "esito",
  "esofago",
  "esortato",
  "esoso",
  "espanso",
  "espresso",
  "essenza",
  "esso",
  "esteso",
  "estimare",
  "estonia",
  "estroso",
  "esultare",
  "etilico",
  "etnico",
  "etrusco",
  "etto",
  "euclideo",
  "europa",
  "evaso",
  "evidenza",
  "evitato",
  "evoluto",
  "evviva",
  "fabbrica",
  "faccenda",
  "fachiro",
  "falco",
  "famiglia",
  "fanale",
  "fanfara",
  "fango",
  "fantasma",
  "fare",
  "farfalla",
  "farinoso",
  "farmaco",
  "fascia",
  "fastoso",
  "fasullo",
  "faticare",
  "fato",
  "favoloso",
  "febbre",
  "fecola",
  "fede",
  "fegato",
  "felpa",
  "feltro",
  "femmina",
  "fendere",
  "fenomeno",
  "fermento",
  "ferro",
  "fertile",
  "fessura",
  "festivo",
  "fetta",
  "feudo",
  "fiaba",
  "fiducia",
  "fifa",
  "figurato",
  "filo",
  "finanza",
  "finestra",
  "finire",
  "fiore",
  "fiscale",
  "fisico",
  "fiume",
  "flacone",
  "flamenco",
  "flebo",
  "flemma",
  "florido",
  "fluente",
  "fluoro",
  "fobico",
  "focaccia",
  "focoso",
  "foderato",
  "foglio",
  "folata",
  "folclore",
  "folgore",
  "fondente",
  "fonetico",
  "fonia",
  "fontana",
  "forbito",
  "forchetta",
  "foresta",
  "formica",
  "fornaio",
  "foro",
  "fortezza",
  "forzare",
  "fosfato",
  "fosso",
  "fracasso",
  "frana",
  "frassino",
  "fratello",
  "freccetta",
  "frenata",
  "fresco",
  "frigo",
  "frollino",
  "fronde",
  "frugale",
  "frutta",
  "fucilata",
  "fucsia",
  "fuggente",
  "fulmine",
  "fulvo",
  "fumante",
  "fumetto",
  "fumoso",
  "fune",
  "funzione",
  "fuoco",
  "furbo",
  "furgone",
  "furore",
  "fuso",
  "futile",
  "gabbiano",
  "gaffe",
  "galateo",
  "gallina",
  "galoppo",
  "gambero",
  "gamma",
  "garanzia",
  "garbo",
  "garofano",
  "garzone",
  "gasdotto",
  "gasolio",
  "gastrico",
  "gatto",
  "gaudio",
  "gazebo",
  "gazzella",
  "geco",
  "gelatina",
  "gelso",
  "gemello",
  "gemmato",
  "gene",
  "genitore",
  "gennaio",
  "genotipo",
  "gergo",
  "ghepardo",
  "ghiaccio",
  "ghisa",
  "giallo",
  "gilda",
  "ginepro",
  "giocare",
  "gioiello",
  "giorno",
  "giove",
  "girato",
  "girone",
  "gittata",
  "giudizio",
  "giurato",
  "giusto",
  "globulo",
  "glutine",
  "gnomo",
  "gobba",
  "golf",
  "gomito",
  "gommone",
  "gonfio",
  "gonna",
  "governo",
  "gracile",
  "grado",
  "grafico",
  "grammo",
  "grande",
  "grattare",
  "gravoso",
  "grazia",
  "greca",
  "gregge",
  "grifone",
  "grigio",
  "grinza",
  "grotta",
  "gruppo",
  "guadagno",
  "guaio",
  "guanto",
  "guardare",
  "gufo",
  "guidare",
  "ibernato",
  "icona",
  "identico",
  "idillio",
  "idolo",
  "idra",
  "idrico",
  "idrogeno",
  "igiene",
  "ignaro",
  "ignorato",
  "ilare",
  "illeso",
  "illogico",
  "illudere",
  "imballo",
  "imbevuto",
  "imbocco",
  "imbuto",
  "immane",
  "immerso",
  "immolato",
  "impacco",
  "impeto",
  "impiego",
  "importo",
  "impronta",
  "inalare",
  "inarcare",
  "inattivo",
  "incanto",
  "incendio",
  "inchino",
  "incisivo",
  "incluso",
  "incontro",
  "incrocio",
  "incubo",
  "indagine",
  "india",
  "indole",
  "inedito",
  "infatti",
  "infilare",
  "inflitto",
  "ingaggio",
  "ingegno",
  "inglese",
  "ingordo",
  "ingrosso",
  "innesco",
  "inodore",
  "inoltrare",
  "inondato",
  "insano",
  "insetto",
  "insieme",
  "insonnia",
  "insulina",
  "intasato",
  "intero",
  "intonaco",
  "intuito",
  "inumidire",
  "invalido",
  "invece",
  "invito",
  "iperbole",
  "ipnotico",
  "ipotesi",
  "ippica",
  "iride",
  "irlanda",
  "ironico",
  "irrigato",
  "irrorare",
  "isolato",
  "isotopo",
  "isterico",
  "istituto",
  "istrice",
  "italia",
  "iterare",
  "labbro",
  "labirinto",
  "lacca",
  "lacerato",
  "lacrima",
  "lacuna",
  "laddove",
  "lago",
  "lampo",
  "lancetta",
  "lanterna",
  "lardoso",
  "larga",
  "laringe",
  "lastra",
  "latenza",
  "latino",
  "lattuga",
  "lavagna",
  "lavoro",
  "legale",
  "leggero",
  "lembo",
  "lentezza",
  "lenza",
  "leone",
  "lepre",
  "lesivo",
  "lessato",
  "lesto",
  "letterale",
  "leva",
  "levigato",
  "libero",
  "lido",
  "lievito",
  "lilla",
  "limatura",
  "limitare",
  "limpido",
  "lineare",
  "lingua",
  "liquido",
  "lira",
  "lirica",
  "lisca",
  "lite",
  "litigio",
  "livrea",
  "locanda",
  "lode",
  "logica",
  "lombare",
  "londra",
  "longevo",
  "loquace",
  "lorenzo",
  "loto",
  "lotteria",
  "luce",
  "lucidato",
  "lumaca",
  "luminoso",
  "lungo",
  "lupo",
  "luppolo",
  "lusinga",
  "lusso",
  "lutto",
  "macabro",
  "macchina",
  "macero",
  "macinato",
  "madama",
  "magico",
  "maglia",
  "magnete",
  "magro",
  "maiolica",
  "malafede",
  "malgrado",
  "malinteso",
  "malsano",
  "malto",
  "malumore",
  "mana",
  "mancia",
  "mandorla",
  "mangiare",
  "manifesto",
  "mannaro",
  "manovra",
  "mansarda",
  "mantide",
  "manubrio",
  "mappa",
  "maratona",
  "marcire",
  "maretta",
  "marmo",
  "marsupio",
  "maschera",
  "massaia",
  "mastino",
  "materasso",
  "matricola",
  "mattone",
  "maturo",
  "mazurca",
  "meandro",
  "meccanico",
  "mecenate",
  "medesimo",
  "meditare",
  "mega",
  "melassa",
  "melis",
  "melodia",
  "meninge",
  "meno",
  "mensola",
  "mercurio",
  "merenda",
  "merlo",
  "meschino",
  "mese",
  "messere",
  "mestolo",
  "metallo",
  "metodo",
  "mettere",
  "miagolare",
  "mica",
  "micelio",
  "michele",
  "microbo",
  "midollo",
  "miele",
  "migliore",
  "milano",
  "milite",
  "mimosa",
  "minerale",
  "mini",
  "minore",
  "mirino",
  "mirtillo",
  "miscela",
  "missiva",
  "misto",
  "misurare",
  "mitezza",
  "mitigare",
  "mitra",
  "mittente",
  "mnemonico",
  "modello",
  "modifica",
  "modulo",
  "mogano",
  "mogio",
  "mole",
  "molosso",
  "monastero",
  "monco",
  "mondina",
  "monetario",
  "monile",
  "monotono",
  "monsone",
  "montato",
  "monviso",
  "mora",
  "mordere",
  "morsicato",
  "mostro",
  "motivato",
  "motosega",
  "motto",
  "movenza",
  "movimento",
  "mozzo",
  "mucca",
  "mucosa",
  "muffa",
  "mughetto",
  "mugnaio",
  "mulatto",
  "mulinello",
  "multiplo",
  "mummia",
  "munto",
  "muovere",
  "murale",
  "musa",
  "muscolo",
  "musica",
  "mutevole",
  "muto",
  "nababbo",
  "nafta",
  "nanometro",
  "narciso",
  "narice",
  "narrato",
  "nascere",
  "nastrare",
  "naturale",
  "nautica",
  "naviglio",
  "nebulosa",
  "necrosi",
  "negativo",
  "negozio",
  "nemmeno",
  "neofita",
  "neretto",
  "nervo",
  "nessuno",
  "nettuno",
  "neutrale",
  "neve",
  "nevrotico",
  "nicchia",
  "ninfa",
  "nitido",
  "nobile",
  "nocivo",
  "nodo",
  "nome",
  "nomina",
  "nordico",
  "normale",
  "norvegese",
  "nostrano",
  "notare",
  "notizia",
  "notturno",
  "novella",
  "nucleo",
  "nulla",
  "numero",
  "nuovo",
  "nutrire",
  "nuvola",
  "nuziale",
  "oasi",
  "obbedire",
  "obbligo",
  "obelisco",
  "oblio",
  "obolo",
  "obsoleto",
  "occasione",
  "occhio",
  "occidente",
  "occorrere",
  "occultare",
  "ocra",
  "oculato",
  "odierno",
  "odorare",
  "offerta",
  "offrire",
  "offuscato",
  "oggetto",
  "oggi",
  "ognuno",
  "olandese",
  "olfatto",
  "oliato",
  "oliva",
  "ologramma",
  "oltre",
  "omaggio",
  "ombelico",
  "ombra",
  "omega",
  "omissione",
  "ondoso",
  "onere",
  "onice",
  "onnivoro",
  "onorevole",
  "onta",
  "operato",
  "opinione",
  "opposto",
  "oracolo",
  "orafo",
  "ordine",
  "orecchino",
  "orefice",
  "orfano",
  "organico",
  "origine",
  "orizzonte",
  "orma",
  "ormeggio",
  "ornativo",
  "orologio",
  "orrendo",
  "orribile",
  "ortensia",
  "ortica",
  "orzata",
  "orzo",
  "osare",
  "oscurare",
  "osmosi",
  "ospedale",
  "ospite",
  "ossa",
  "ossidare",
  "ostacolo",
  "oste",
  "otite",
  "otre",
  "ottagono",
  "ottimo",
  "ottobre",
  "ovale",
  "ovest",
  "ovino",
  "oviparo",
  "ovocito",
  "ovunque",
  "ovviare",
  "ozio",
  "pacchetto",
  "pace",
  "pacifico",
  "padella",
  "padrone",
  "paese",
  "paga",
  "pagina",
  "palazzina",
  "palesare",
  "pallido",
  "palo",
  "palude",
  "pandoro",
  "pannello",
  "paolo",
  "paonazzo",
  "paprica",
  "parabola",
  "parcella",
  "parere",
  "pargolo",
  "pari",
  "parlato",
  "parola",
  "partire",
  "parvenza",
  "parziale",
  "passivo",
  "pasticca",
  "patacca",
  "patologia",
  "pattume",
  "pavone",
  "peccato",
  "pedalare",
  "pedonale",
  "peggio",
  "peloso",
  "penare",
  "pendice",
  "penisola",
  "pennuto",
  "penombra",
  "pensare",
  "pentola",
  "pepe",
  "pepita",
  "perbene",
  "percorso",
  "perdonato",
  "perforare",
  "pergamena",
  "periodo",
  "permesso",
  "perno",
  "perplesso",
  "persuaso",
  "pertugio",
  "pervaso",
  "pesatore",
  "pesista",
  "peso",
  "pestifero",
  "petalo",
  "pettine",
  "petulante",
  "pezzo",
  "piacere",
  "pianta",
  "piattino",
  "piccino",
  "picozza",
  "piega",
  "pietra",
  "piffero",
  "pigiama",
  "pigolio",
  "pigro",
  "pila",
  "pilifero",
  "pillola",
  "pilota",
  "pimpante",
  "pineta",
  "pinna",
  "pinolo",
  "pioggia",
  "piombo",
  "piramide",
  "piretico",
  "pirite",
  "pirolisi",
  "pitone",
  "pizzico",
  "placebo",
  "planare",
  "plasma",
  "platano",
  "plenario",
  "pochezza",
  "poderoso",
  "podismo",
  "poesia",
  "poggiare",
  "polenta",
  "poligono",
  "pollice",
  "polmonite",
  "polpetta",
  "polso",
  "poltrona",
  "polvere",
  "pomice",
  "pomodoro",
  "ponte",
  "popoloso",
  "porfido",
  "poroso",
  "porpora",
  "porre",
  "portata",
  "posa",
  "positivo",
  "possesso",
  "postulato",
  "potassio",
  "potere",
  "pranzo",
  "prassi",
  "pratica",
  "precluso",
  "predica",
  "prefisso",
  "pregiato",
  "prelievo",
  "premere",
  "prenotare",
  "preparato",
  "presenza",
  "pretesto",
  "prevalso",
  "prima",
  "principe",
  "privato",
  "problema",
  "procura",
  "produrre",
  "profumo",
  "progetto",
  "prolunga",
  "promessa",
  "pronome",
  "proposta",
  "proroga",
  "proteso",
  "prova",
  "prudente",
  "prugna",
  "prurito",
  "psiche",
  "pubblico",
  "pudica",
  "pugilato",
  "pugno",
  "pulce",
  "pulito",
  "pulsante",
  "puntare",
  "pupazzo",
  "pupilla",
  "puro",
  "quadro",
  "qualcosa",
  "quasi",
  "querela",
  "quota",
  "raccolto",
  "raddoppio",
  "radicale",
  "radunato",
  "raffica",
  "ragazzo",
  "ragione",
  "ragno",
  "ramarro",
  "ramingo",
  "ramo",
  "randagio",
  "rantolare",
  "rapato",
  "rapina",
  "rappreso",
  "rasatura",
  "raschiato",
  "rasente",
  "rassegna",
  "rastrello",
  "rata",
  "ravveduto",
  "reale",
  "recepire",
  "recinto",
  "recluta",
  "recondito",
  "recupero",
  "reddito",
  "redimere",
  "regalato",
  "registro",
  "regola",
  "regresso",
  "relazione",
  "remare",
  "remoto",
  "renna",
  "replica",
  "reprimere",
  "reputare",
  "resa",
  "residente",
  "responso",
  "restauro",
  "rete",
  "retina",
  "retorica",
  "rettifica",
  "revocato",
  "riassunto",
  "ribadire",
  "ribelle",
  "ribrezzo",
  "ricarica",
  "ricco",
  "ricevere",
  "riciclato",
  "ricordo",
  "ricreduto",
  "ridicolo",
  "ridurre",
  "rifasare",
  "riflesso",
  "riforma",
  "rifugio",
  "rigare",
  "rigettato",
  "righello",
  "rilassato",
  "rilevato",
  "rimanere",
  "rimbalzo",
  "rimedio",
  "rimorchio",
  "rinascita",
  "rincaro",
  "rinforzo",
  "rinnovo",
  "rinomato",
  "rinsavito",
  "rintocco",
  "rinuncia",
  "rinvenire",
  "riparato",
  "ripetuto",
  "ripieno",
  "riportare",
  "ripresa",
  "ripulire",
  "risata",
  "rischio",
  "riserva",
  "risibile",
  "riso",
  "rispetto",
  "ristoro",
  "risultato",
  "risvolto",
  "ritardo",
  "ritegno",
  "ritmico",
  "ritrovo",
  "riunione",
  "riva",
  "riverso",
  "rivincita",
  "rivolto",
  "rizoma",
  "roba",
  "robotico",
  "robusto",
  "roccia",
  "roco",
  "rodaggio",
  "rodere",
  "roditore",
  "rogito",
  "rollio",
  "romantico",
  "rompere",
  "ronzio",
  "rosolare",
  "rospo",
  "rotante",
  "rotondo",
  "rotula",
  "rovescio",
  "rubizzo",
  "rubrica",
  "ruga",
  "rullino",
  "rumine",
  "rumoroso",
  "ruolo",
  "rupe",
  "russare",
  "rustico",
  "sabato",
  "sabbiare",
  "sabotato",
  "sagoma",
  "salasso",
  "saldatura",
  "salgemma",
  "salivare",
  "salmone",
  "salone",
  "saltare",
  "saluto",
  "salvo",
  "sapere",
  "sapido",
  "saporito",
  "saraceno",
  "sarcasmo",
  "sarto",
  "sassoso",
  "satellite",
  "satira",
  "satollo",
  "saturno",
  "savana",
  "savio",
  "saziato",
  "sbadiglio",
  "sbalzo",
  "sbancato",
  "sbarra",
  "sbattere",
  "sbavare",
  "sbendare",
  "sbirciare",
  "sbloccato",
  "sbocciato",
  "sbrinare",
  "sbruffone",
  "sbuffare",
  "scabroso",
  "scadenza",
  "scala",
  "scambiare",
  "scandalo",
  "scapola",
  "scarso",
  "scatenare",
  "scavato",
  "scelto",
  "scenico",
  "scettro",
  "scheda",
  "schiena",
  "sciarpa",
  "scienza",
  "scindere",
  "scippo",
  "sciroppo",
  "scivolo",
  "sclerare",
  "scodella",
  "scolpito",
  "scomparto",
  "sconforto",
  "scoprire",
  "scorta",
  "scossone",
  "scozzese",
  "scriba",
  "scrollare",
  "scrutinio",
  "scuderia",
  "scultore",
  "scuola",
  "scuro",
  "scusare",
  "sdebitare",
  "sdoganare",
  "seccatura",
  "secondo",
  "sedano",
  "seggiola",
  "segnalato",
  "segregato",
  "seguito",
  "selciato",
  "selettivo",
  "sella",
  "selvaggio",
  "semaforo",
  "sembrare",
  "seme",
  "seminato",
  "sempre",
  "senso",
  "sentire",
  "sepolto",
  "sequenza",
  "serata",
  "serbato",
  "sereno",
  "serio",
  "serpente",
  "serraglio",
  "servire",
  "sestina",
  "setola",
  "settimana",
  "sfacelo",
  "sfaldare",
  "sfamato",
  "sfarzoso",
  "sfaticato",
  "sfera",
  "sfida",
  "sfilato",
  "sfinge",
  "sfocato",
  "sfoderare",
  "sfogo",
  "sfoltire",
  "sforzato",
  "sfratto",
  "sfruttato",
  "sfuggito",
  "sfumare",
  "sfuso",
  "sgabello",
  "sgarbato",
  "sgonfiare",
  "sgorbio",
  "sgrassato",
  "sguardo",
  "sibilo",
  "siccome",
  "sierra",
  "sigla",
  "signore",
  "silenzio",
  "sillaba",
  "simbolo",
  "simpatico",
  "simulato",
  "sinfonia",
  "singolo",
  "sinistro",
  "sino",
  "sintesi",
  "sinusoide",
  "sipario",
  "sisma",
  "sistole",
  "situato",
  "slitta",
  "slogatura",
  "sloveno",
  "smarrito",
  "smemorato",
  "smentito",
  "smeraldo",
  "smilzo",
  "smontare",
  "smottato",
  "smussato",
  "snellire",
  "snervato",
  "snodo",
  "sobbalzo",
  "sobrio",
  "soccorso",
  "sociale",
  "sodale",
  "soffitto",
  "sogno",
  "soldato",
  "solenne",
  "solido",
  "sollazzo",
  "solo",
  "solubile",
  "solvente",
  "somatico",
  "somma",
  "sonda",
  "sonetto",
  "sonnifero",
  "sopire",
  "soppeso",
  "sopra",
  "sorgere",
  "sorpasso",
  "sorriso",
  "sorso",
  "sorteggio",
  "sorvolato",
  "sospiro",
  "sosta",
  "sottile",
  "spada",
  "spalla",
  "spargere",
  "spatola",
  "spavento",
  "spazzola",
  "specie",
  "spedire",
  "spegnere",
  "spelatura",
  "speranza",
  "spessore",
  "spettrale",
  "spezzato",
  "spia",
  "spigoloso",
  "spillato",
  "spinoso",
  "spirale",
  "splendido",
  "sportivo",
  "sposo",
  "spranga",
  "sprecare",
  "spronato",
  "spruzzo",
  "spuntino",
  "squillo",
  "sradicare",
  "srotolato",
  "stabile",
  "stacco",
  "staffa",
  "stagnare",
  "stampato",
  "stantio",
  "starnuto",
  "stasera",
  "statuto",
  "stelo",
  "steppa",
  "sterzo",
  "stiletto",
  "stima",
  "stirpe",
  "stivale",
  "stizzoso",
  "stonato",
  "storico",
  "strappo",
  "stregato",
  "stridulo",
  "strozzare",
  "strutto",
  "stuccare",
  "stufo",
  "stupendo",
  "subentro",
  "succoso",
  "sudore",
  "suggerito",
  "sugo",
  "sultano",
  "suonare",
  "superbo",
  "supporto",
  "surgelato",
  "surrogato",
  "sussurro",
  "sutura",
  "svagare",
  "svedese",
  "sveglio",
  "svelare",
  "svenuto",
  "svezia",
  "sviluppo",
  "svista",
  "svizzera",
  "svolta",
  "svuotare",
  "tabacco",
  "tabulato",
  "tacciare",
  "taciturno",
  "tale",
  "talismano",
  "tampone",
  "tannino",
  "tara",
  "tardivo",
  "targato",
  "tariffa",
  "tarpare",
  "tartaruga",
  "tasto",
  "tattico",
  "taverna",
  "tavolata",
  "tazza",
  "teca",
  "tecnico",
  "telefono",
  "temerario",
  "tempo",
  "temuto",
  "tendone",
  "tenero",
  "tensione",
  "tentacolo",
  "teorema",
  "terme",
  "terrazzo",
  "terzetto",
  "tesi",
  "tesserato",
  "testato",
  "tetro",
  "tettoia",
  "tifare",
  "tigella",
  "timbro",
  "tinto",
  "tipico",
  "tipografo",
  "tiraggio",
  "tiro",
  "titanio",
  "titolo",
  "titubante",
  "tizio",
  "tizzone",
  "toccare",
  "tollerare",
  "tolto",
  "tombola",
  "tomo",
  "tonfo",
  "tonsilla",
  "topazio",
  "topologia",
  "toppa",
  "torba",
  "tornare",
  "torrone",
  "tortora",
  "toscano",
  "tossire",
  "tostatura",
  "totano",
  "trabocco",
  "trachea",
  "trafila",
  "tragedia",
  "tralcio",
  "tramonto",
  "transito",
  "trapano",
  "trarre",
  "trasloco",
  "trattato",
  "trave",
  "treccia",
  "tremolio",
  "trespolo",
  "tributo",
  "tricheco",
  "trifoglio",
  "trillo",
  "trincea",
  "trio",
  "tristezza",
  "triturato",
  "trivella",
  "tromba",
  "trono",
  "troppo",
  "trottola",
  "trovare",
  "truccato",
  "tubatura",
  "tuffato",
  "tulipano",
  "tumulto",
  "tunisia",
  "turbare",
  "turchino",
  "tuta",
  "tutela",
  "ubicato",
  "uccello",
  "uccisore",
  "udire",
  "uditivo",
  "uffa",
  "ufficio",
  "uguale",
  "ulisse",
  "ultimato",
  "umano",
  "umile",
  "umorismo",
  "uncinetto",
  "ungere",
  "ungherese",
  "unicorno",
  "unificato",
  "unisono",
  "unitario",
  "unte",
  "uovo",
  "upupa",
  "uragano",
  "urgenza",
  "urlo",
  "usanza",
  "usato",
  "uscito",
  "usignolo",
  "usuraio",
  "utensile",
  "utilizzo",
  "utopia",
  "vacante",
  "vaccinato",
  "vagabondo",
  "vagliato",
  "valanga",
  "valgo",
  "valico",
  "valletta",
  "valoroso",
  "valutare",
  "valvola",
  "vampata",
  "vangare",
  "vanitoso",
  "vano",
  "vantaggio",
  "vanvera",
  "vapore",
  "varano",
  "varcato",
  "variante",
  "vasca",
  "vedetta",
  "vedova",
  "veduto",
  "vegetale",
  "veicolo",
  "velcro",
  "velina",
  "velluto",
  "veloce",
  "venato",
  "vendemmia",
  "vento",
  "verace",
  "verbale",
  "vergogna",
  "verifica",
  "vero",
  "verruca",
  "verticale",
  "vescica",
  "vessillo",
  "vestale",
  "veterano",
  "vetrina",
  "vetusto",
  "viandante",
  "vibrante",
  "vicenda",
  "vichingo",
  "vicinanza",
  "vidimare",
  "vigilia",
  "vigneto",
  "vigore",
  "vile",
  "villano",
  "vimini",
  "vincitore",
  "viola",
  "vipera",
  "virgola",
  "virologo",
  "virulento",
  "viscoso",
  "visione",
  "vispo",
  "vissuto",
  "visura",
  "vita",
  "vitello",
  "vittima",
  "vivanda",
  "vivido",
  "viziare",
  "voce",
  "voga",
  "volatile",
  "volere",
  "volpe",
  "voragine",
  "vulcano",
  "zampogna",
  "zanna",
  "zappato",
  "zattera",
  "zavorra",
  "zefiro",
  "zelante",
  "zelo",
  "zenzero",
  "zerbino",
  "zibetto",
  "zinco",
  "zircone",
  "zitto",
  "zolla",
  "zotico",
  "zucchero",
  "zufolo",
  "zulu",
  "zuppa"
]

},{}],35:[function(reqqqqq,module,exports){
module.exports=[
  "あいこくしん",
  "あいさつ",
  "あいだ",
  "あおぞら",
  "あかちゃん",
  "あきる",
  "あけがた",
  "あける",
  "あこがれる",
  "あさい",
  "あさひ",
  "あしあと",
  "あじわう",
  "あずかる",
  "あずき",
  "あそぶ",
  "あたえる",
  "あたためる",
  "あたりまえ",
  "あたる",
  "あつい",
  "あつかう",
  "あっしゅく",
  "あつまり",
  "あつめる",
  "あてな",
  "あてはまる",
  "あひる",
  "あぶら",
  "あぶる",
  "あふれる",
  "あまい",
  "あまど",
  "あまやかす",
  "あまり",
  "あみもの",
  "あめりか",
  "あやまる",
  "あゆむ",
  "あらいぐま",
  "あらし",
  "あらすじ",
  "あらためる",
  "あらゆる",
  "あらわす",
  "ありがとう",
  "あわせる",
  "あわてる",
  "あんい",
  "あんがい",
  "あんこ",
  "あんぜん",
  "あんてい",
  "あんない",
  "あんまり",
  "いいだす",
  "いおん",
  "いがい",
  "いがく",
  "いきおい",
  "いきなり",
  "いきもの",
  "いきる",
  "いくじ",
  "いくぶん",
  "いけばな",
  "いけん",
  "いこう",
  "いこく",
  "いこつ",
  "いさましい",
  "いさん",
  "いしき",
  "いじゅう",
  "いじょう",
  "いじわる",
  "いずみ",
  "いずれ",
  "いせい",
  "いせえび",
  "いせかい",
  "いせき",
  "いぜん",
  "いそうろう",
  "いそがしい",
  "いだい",
  "いだく",
  "いたずら",
  "いたみ",
  "いたりあ",
  "いちおう",
  "いちじ",
  "いちど",
  "いちば",
  "いちぶ",
  "いちりゅう",
  "いつか",
  "いっしゅん",
  "いっせい",
  "いっそう",
  "いったん",
  "いっち",
  "いってい",
  "いっぽう",
  "いてざ",
  "いてん",
  "いどう",
  "いとこ",
  "いない",
  "いなか",
  "いねむり",
  "いのち",
  "いのる",
  "いはつ",
  "いばる",
  "いはん",
  "いびき",
  "いひん",
  "いふく",
  "いへん",
  "いほう",
  "いみん",
  "いもうと",
  "いもたれ",
  "いもり",
  "いやがる",
  "いやす",
  "いよかん",
  "いよく",
  "いらい",
  "いらすと",
  "いりぐち",
  "いりょう",
  "いれい",
  "いれもの",
  "いれる",
  "いろえんぴつ",
  "いわい",
  "いわう",
  "いわかん",
  "いわば",
  "いわゆる",
  "いんげんまめ",
  "いんさつ",
  "いんしょう",
  "いんよう",
  "うえき",
  "うえる",
  "うおざ",
  "うがい",
  "うかぶ",
  "うかべる",
  "うきわ",
  "うくらいな",
  "うくれれ",
  "うけたまわる",
  "うけつけ",
  "うけとる",
  "うけもつ",
  "うける",
  "うごかす",
  "うごく",
  "うこん",
  "うさぎ",
  "うしなう",
  "うしろがみ",
  "うすい",
  "うすぎ",
  "うすぐらい",
  "うすめる",
  "うせつ",
  "うちあわせ",
  "うちがわ",
  "うちき",
  "うちゅう",
  "うっかり",
  "うつくしい",
  "うったえる",
  "うつる",
  "うどん",
  "うなぎ",
  "うなじ",
  "うなずく",
  "うなる",
  "うねる",
  "うのう",
  "うぶげ",
  "うぶごえ",
  "うまれる",
  "うめる",
  "うもう",
  "うやまう",
  "うよく",
  "うらがえす",
  "うらぐち",
  "うらない",
  "うりあげ",
  "うりきれ",
  "うるさい",
  "うれしい",
  "うれゆき",
  "うれる",
  "うろこ",
  "うわき",
  "うわさ",
  "うんこう",
  "うんちん",
  "うんてん",
  "うんどう",
  "えいえん",
  "えいが",
  "えいきょう",
  "えいご",
  "えいせい",
  "えいぶん",
  "えいよう",
  "えいわ",
  "えおり",
  "えがお",
  "えがく",
  "えきたい",
  "えくせる",
  "えしゃく",
  "えすて",
  "えつらん",
  "えのぐ",
  "えほうまき",
  "えほん",
  "えまき",
  "えもじ",
  "えもの",
  "えらい",
  "えらぶ",
  "えりあ",
  "えんえん",
  "えんかい",
  "えんぎ",
  "えんげき",
  "えんしゅう",
  "えんぜつ",
  "えんそく",
  "えんちょう",
  "えんとつ",
  "おいかける",
  "おいこす",
  "おいしい",
  "おいつく",
  "おうえん",
  "おうさま",
  "おうじ",
  "おうせつ",
  "おうたい",
  "おうふく",
  "おうべい",
  "おうよう",
  "おえる",
  "おおい",
  "おおう",
  "おおどおり",
  "おおや",
  "おおよそ",
  "おかえり",
  "おかず",
  "おがむ",
  "おかわり",
  "おぎなう",
  "おきる",
  "おくさま",
  "おくじょう",
  "おくりがな",
  "おくる",
  "おくれる",
  "おこす",
  "おこなう",
  "おこる",
  "おさえる",
  "おさない",
  "おさめる",
  "おしいれ",
  "おしえる",
  "おじぎ",
  "おじさん",
  "おしゃれ",
  "おそらく",
  "おそわる",
  "おたがい",
  "おたく",
  "おだやか",
  "おちつく",
  "おっと",
  "おつり",
  "おでかけ",
  "おとしもの",
  "おとなしい",
  "おどり",
  "おどろかす",
  "おばさん",
  "おまいり",
  "おめでとう",
  "おもいで",
  "おもう",
  "おもたい",
  "おもちゃ",
  "おやつ",
  "おやゆび",
  "およぼす",
  "おらんだ",
  "おろす",
  "おんがく",
  "おんけい",
  "おんしゃ",
  "おんせん",
  "おんだん",
  "おんちゅう",
  "おんどけい",
  "かあつ",
  "かいが",
  "がいき",
  "がいけん",
  "がいこう",
  "かいさつ",
  "かいしゃ",
  "かいすいよく",
  "かいぜん",
  "かいぞうど",
  "かいつう",
  "かいてん",
  "かいとう",
  "かいふく",
  "がいへき",
  "かいほう",
  "かいよう",
  "がいらい",
  "かいわ",
  "かえる",
  "かおり",
  "かかえる",
  "かがく",
  "かがし",
  "かがみ",
  "かくご",
  "かくとく",
  "かざる",
  "がぞう",
  "かたい",
  "かたち",
  "がちょう",
  "がっきゅう",
  "がっこう",
  "がっさん",
  "がっしょう",
  "かなざわし",
  "かのう",
  "がはく",
  "かぶか",
  "かほう",
  "かほご",
  "かまう",
  "かまぼこ",
  "かめれおん",
  "かゆい",
  "かようび",
  "からい",
  "かるい",
  "かろう",
  "かわく",
  "かわら",
  "がんか",
  "かんけい",
  "かんこう",
  "かんしゃ",
  "かんそう",
  "かんたん",
  "かんち",
  "がんばる",
  "きあい",
  "きあつ",
  "きいろ",
  "ぎいん",
  "きうい",
  "きうん",
  "きえる",
  "きおう",
  "きおく",
  "きおち",
  "きおん",
  "きかい",
  "きかく",
  "きかんしゃ",
  "ききて",
  "きくばり",
  "きくらげ",
  "きけんせい",
  "きこう",
  "きこえる",
  "きこく",
  "きさい",
  "きさく",
  "きさま",
  "きさらぎ",
  "ぎじかがく",
  "ぎしき",
  "ぎじたいけん",
  "ぎじにってい",
  "ぎじゅつしゃ",
  "きすう",
  "きせい",
  "きせき",
  "きせつ",
  "きそう",
  "きぞく",
  "きぞん",
  "きたえる",
  "きちょう",
  "きつえん",
  "ぎっちり",
  "きつつき",
  "きつね",
  "きてい",
  "きどう",
  "きどく",
  "きない",
  "きなが",
  "きなこ",
  "きぬごし",
  "きねん",
  "きのう",
  "きのした",
  "きはく",
  "きびしい",
  "きひん",
  "きふく",
  "きぶん",
  "きぼう",
  "きほん",
  "きまる",
  "きみつ",
  "きむずかしい",
  "きめる",
  "きもだめし",
  "きもち",
  "きもの",
  "きゃく",
  "きやく",
  "ぎゅうにく",
  "きよう",
  "きょうりゅう",
  "きらい",
  "きらく",
  "きりん",
  "きれい",
  "きれつ",
  "きろく",
  "ぎろん",
  "きわめる",
  "ぎんいろ",
  "きんかくじ",
  "きんじょ",
  "きんようび",
  "ぐあい",
  "くいず",
  "くうかん",
  "くうき",
  "くうぐん",
  "くうこう",
  "ぐうせい",
  "くうそう",
  "ぐうたら",
  "くうふく",
  "くうぼ",
  "くかん",
  "くきょう",
  "くげん",
  "ぐこう",
  "くさい",
  "くさき",
  "くさばな",
  "くさる",
  "くしゃみ",
  "くしょう",
  "くすのき",
  "くすりゆび",
  "くせげ",
  "くせん",
  "ぐたいてき",
  "くださる",
  "くたびれる",
  "くちこみ",
  "くちさき",
  "くつした",
  "ぐっすり",
  "くつろぐ",
  "くとうてん",
  "くどく",
  "くなん",
  "くねくね",
  "くのう",
  "くふう",
  "くみあわせ",
  "くみたてる",
  "くめる",
  "くやくしょ",
  "くらす",
  "くらべる",
  "くるま",
  "くれる",
  "くろう",
  "くわしい",
  "ぐんかん",
  "ぐんしょく",
  "ぐんたい",
  "ぐんて",
  "けあな",
  "けいかく",
  "けいけん",
  "けいこ",
  "けいさつ",
  "げいじゅつ",
  "けいたい",
  "げいのうじん",
  "けいれき",
  "けいろ",
  "けおとす",
  "けおりもの",
  "げきか",
  "げきげん",
  "げきだん",
  "げきちん",
  "げきとつ",
  "げきは",
  "げきやく",
  "げこう",
  "げこくじょう",
  "げざい",
  "けさき",
  "げざん",
  "けしき",
  "けしごむ",
  "けしょう",
  "げすと",
  "けたば",
  "けちゃっぷ",
  "けちらす",
  "けつあつ",
  "けつい",
  "けつえき",
  "けっこん",
  "けつじょ",
  "けっせき",
  "けってい",
  "けつまつ",
  "げつようび",
  "げつれい",
  "けつろん",
  "げどく",
  "けとばす",
  "けとる",
  "けなげ",
  "けなす",
  "けなみ",
  "けぬき",
  "げねつ",
  "けねん",
  "けはい",
  "げひん",
  "けぶかい",
  "げぼく",
  "けまり",
  "けみかる",
  "けむし",
  "けむり",
  "けもの",
  "けらい",
  "けろけろ",
  "けわしい",
  "けんい",
  "けんえつ",
  "けんお",
  "けんか",
  "げんき",
  "けんげん",
  "けんこう",
  "けんさく",
  "けんしゅう",
  "けんすう",
  "げんそう",
  "けんちく",
  "けんてい",
  "けんとう",
  "けんない",
  "けんにん",
  "げんぶつ",
  "けんま",
  "けんみん",
  "けんめい",
  "けんらん",
  "けんり",
  "こあくま",
  "こいぬ",
  "こいびと",
  "ごうい",
  "こうえん",
  "こうおん",
  "こうかん",
  "ごうきゅう",
  "ごうけい",
  "こうこう",
  "こうさい",
  "こうじ",
  "こうすい",
  "ごうせい",
  "こうそく",
  "こうたい",
  "こうちゃ",
  "こうつう",
  "こうてい",
  "こうどう",
  "こうない",
  "こうはい",
  "ごうほう",
  "ごうまん",
  "こうもく",
  "こうりつ",
  "こえる",
  "こおり",
  "ごかい",
  "ごがつ",
  "ごかん",
  "こくご",
  "こくさい",
  "こくとう",
  "こくない",
  "こくはく",
  "こぐま",
  "こけい",
  "こける",
  "ここのか",
  "こころ",
  "こさめ",
  "こしつ",
  "こすう",
  "こせい",
  "こせき",
  "こぜん",
  "こそだて",
  "こたい",
  "こたえる",
  "こたつ",
  "こちょう",
  "こっか",
  "こつこつ",
  "こつばん",
  "こつぶ",
  "こてい",
  "こてん",
  "ことがら",
  "ことし",
  "ことば",
  "ことり",
  "こなごな",
  "こねこね",
  "このまま",
  "このみ",
  "このよ",
  "ごはん",
  "こひつじ",
  "こふう",
  "こふん",
  "こぼれる",
  "ごまあぶら",
  "こまかい",
  "ごますり",
  "こまつな",
  "こまる",
  "こむぎこ",
  "こもじ",
  "こもち",
  "こもの",
  "こもん",
  "こやく",
  "こやま",
  "こゆう",
  "こゆび",
  "こよい",
  "こよう",
  "こりる",
  "これくしょん",
  "ころっけ",
  "こわもて",
  "こわれる",
  "こんいん",
  "こんかい",
  "こんき",
  "こんしゅう",
  "こんすい",
  "こんだて",
  "こんとん",
  "こんなん",
  "こんびに",
  "こんぽん",
  "こんまけ",
  "こんや",
  "こんれい",
  "こんわく",
  "ざいえき",
  "さいかい",
  "さいきん",
  "ざいげん",
  "ざいこ",
  "さいしょ",
  "さいせい",
  "ざいたく",
  "ざいちゅう",
  "さいてき",
  "ざいりょう",
  "さうな",
  "さかいし",
  "さがす",
  "さかな",
  "さかみち",
  "さがる",
  "さぎょう",
  "さくし",
  "さくひん",
  "さくら",
  "さこく",
  "さこつ",
  "さずかる",
  "ざせき",
  "さたん",
  "さつえい",
  "ざつおん",
  "ざっか",
  "ざつがく",
  "さっきょく",
  "ざっし",
  "さつじん",
  "ざっそう",
  "さつたば",
  "さつまいも",
  "さてい",
  "さといも",
  "さとう",
  "さとおや",
  "さとし",
  "さとる",
  "さのう",
  "さばく",
  "さびしい",
  "さべつ",
  "さほう",
  "さほど",
  "さます",
  "さみしい",
  "さみだれ",
  "さむけ",
  "さめる",
  "さやえんどう",
  "さゆう",
  "さよう",
  "さよく",
  "さらだ",
  "ざるそば",
  "さわやか",
  "さわる",
  "さんいん",
  "さんか",
  "さんきゃく",
  "さんこう",
  "さんさい",
  "ざんしょ",
  "さんすう",
  "さんせい",
  "さんそ",
  "さんち",
  "さんま",
  "さんみ",
  "さんらん",
  "しあい",
  "しあげ",
  "しあさって",
  "しあわせ",
  "しいく",
  "しいん",
  "しうち",
  "しえい",
  "しおけ",
  "しかい",
  "しかく",
  "じかん",
  "しごと",
  "しすう",
  "じだい",
  "したうけ",
  "したぎ",
  "したて",
  "したみ",
  "しちょう",
  "しちりん",
  "しっかり",
  "しつじ",
  "しつもん",
  "してい",
  "してき",
  "してつ",
  "じてん",
  "じどう",
  "しなぎれ",
  "しなもの",
  "しなん",
  "しねま",
  "しねん",
  "しのぐ",
  "しのぶ",
  "しはい",
  "しばかり",
  "しはつ",
  "しはらい",
  "しはん",
  "しひょう",
  "しふく",
  "じぶん",
  "しへい",
  "しほう",
  "しほん",
  "しまう",
  "しまる",
  "しみん",
  "しむける",
  "じむしょ",
  "しめい",
  "しめる",
  "しもん",
  "しゃいん",
  "しゃうん",
  "しゃおん",
  "じゃがいも",
  "しやくしょ",
  "しゃくほう",
  "しゃけん",
  "しゃこ",
  "しゃざい",
  "しゃしん",
  "しゃせん",
  "しゃそう",
  "しゃたい",
  "しゃちょう",
  "しゃっきん",
  "じゃま",
  "しゃりん",
  "しゃれい",
  "じゆう",
  "じゅうしょ",
  "しゅくはく",
  "じゅしん",
  "しゅっせき",
  "しゅみ",
  "しゅらば",
  "じゅんばん",
  "しょうかい",
  "しょくたく",
  "しょっけん",
  "しょどう",
  "しょもつ",
  "しらせる",
  "しらべる",
  "しんか",
  "しんこう",
  "じんじゃ",
  "しんせいじ",
  "しんちく",
  "しんりん",
  "すあげ",
  "すあし",
  "すあな",
  "ずあん",
  "すいえい",
  "すいか",
  "すいとう",
  "ずいぶん",
  "すいようび",
  "すうがく",
  "すうじつ",
  "すうせん",
  "すおどり",
  "すきま",
  "すくう",
  "すくない",
  "すける",
  "すごい",
  "すこし",
  "ずさん",
  "すずしい",
  "すすむ",
  "すすめる",
  "すっかり",
  "ずっしり",
  "ずっと",
  "すてき",
  "すてる",
  "すねる",
  "すのこ",
  "すはだ",
  "すばらしい",
  "ずひょう",
  "ずぶぬれ",
  "すぶり",
  "すふれ",
  "すべて",
  "すべる",
  "ずほう",
  "すぼん",
  "すまい",
  "すめし",
  "すもう",
  "すやき",
  "すらすら",
  "するめ",
  "すれちがう",
  "すろっと",
  "すわる",
  "すんぜん",
  "すんぽう",
  "せあぶら",
  "せいかつ",
  "せいげん",
  "せいじ",
  "せいよう",
  "せおう",
  "せかいかん",
  "せきにん",
  "せきむ",
  "せきゆ",
  "せきらんうん",
  "せけん",
  "せこう",
  "せすじ",
  "せたい",
  "せたけ",
  "せっかく",
  "せっきゃく",
  "ぜっく",
  "せっけん",
  "せっこつ",
  "せっさたくま",
  "せつぞく",
  "せつだん",
  "せつでん",
  "せっぱん",
  "せつび",
  "せつぶん",
  "せつめい",
  "せつりつ",
  "せなか",
  "せのび",
  "せはば",
  "せびろ",
  "せぼね",
  "せまい",
  "せまる",
  "せめる",
  "せもたれ",
  "せりふ",
  "ぜんあく",
  "せんい",
  "せんえい",
  "せんか",
  "せんきょ",
  "せんく",
  "せんげん",
  "ぜんご",
  "せんさい",
  "せんしゅ",
  "せんすい",
  "せんせい",
  "せんぞ",
  "せんたく",
  "せんちょう",
  "せんてい",
  "せんとう",
  "せんぬき",
  "せんねん",
  "せんぱい",
  "ぜんぶ",
  "ぜんぽう",
  "せんむ",
  "せんめんじょ",
  "せんもん",
  "せんやく",
  "せんゆう",
  "せんよう",
  "ぜんら",
  "ぜんりゃく",
  "せんれい",
  "せんろ",
  "そあく",
  "そいとげる",
  "そいね",
  "そうがんきょう",
  "そうき",
  "そうご",
  "そうしん",
  "そうだん",
  "そうなん",
  "そうび",
  "そうめん",
  "そうり",
  "そえもの",
  "そえん",
  "そがい",
  "そげき",
  "そこう",
  "そこそこ",
  "そざい",
  "そしな",
  "そせい",
  "そせん",
  "そそぐ",
  "そだてる",
  "そつう",
  "そつえん",
  "そっかん",
  "そつぎょう",
  "そっけつ",
  "そっこう",
  "そっせん",
  "そっと",
  "そとがわ",
  "そとづら",
  "そなえる",
  "そなた",
  "そふぼ",
  "そぼく",
  "そぼろ",
  "そまつ",
  "そまる",
  "そむく",
  "そむりえ",
  "そめる",
  "そもそも",
  "そよかぜ",
  "そらまめ",
  "そろう",
  "そんかい",
  "そんけい",
  "そんざい",
  "そんしつ",
  "そんぞく",
  "そんちょう",
  "ぞんび",
  "ぞんぶん",
  "そんみん",
  "たあい",
  "たいいん",
  "たいうん",
  "たいえき",
  "たいおう",
  "だいがく",
  "たいき",
  "たいぐう",
  "たいけん",
  "たいこ",
  "たいざい",
  "だいじょうぶ",
  "だいすき",
  "たいせつ",
  "たいそう",
  "だいたい",
  "たいちょう",
  "たいてい",
  "だいどころ",
  "たいない",
  "たいねつ",
  "たいのう",
  "たいはん",
  "だいひょう",
  "たいふう",
  "たいへん",
  "たいほ",
  "たいまつばな",
  "たいみんぐ",
  "たいむ",
  "たいめん",
  "たいやき",
  "たいよう",
  "たいら",
  "たいりょく",
  "たいる",
  "たいわん",
  "たうえ",
  "たえる",
  "たおす",
  "たおる",
  "たおれる",
  "たかい",
  "たかね",
  "たきび",
  "たくさん",
  "たこく",
  "たこやき",
  "たさい",
  "たしざん",
  "だじゃれ",
  "たすける",
  "たずさわる",
  "たそがれ",
  "たたかう",
  "たたく",
  "ただしい",
  "たたみ",
  "たちばな",
  "だっかい",
  "だっきゃく",
  "だっこ",
  "だっしゅつ",
  "だったい",
  "たてる",
  "たとえる",
  "たなばた",
  "たにん",
  "たぬき",
  "たのしみ",
  "たはつ",
  "たぶん",
  "たべる",
  "たぼう",
  "たまご",
  "たまる",
  "だむる",
  "ためいき",
  "ためす",
  "ためる",
  "たもつ",
  "たやすい",
  "たよる",
  "たらす",
  "たりきほんがん",
  "たりょう",
  "たりる",
  "たると",
  "たれる",
  "たれんと",
  "たろっと",
  "たわむれる",
  "だんあつ",
  "たんい",
  "たんおん",
  "たんか",
  "たんき",
  "たんけん",
  "たんご",
  "たんさん",
  "たんじょうび",
  "だんせい",
  "たんそく",
  "たんたい",
  "だんち",
  "たんてい",
  "たんとう",
  "だんな",
  "たんにん",
  "だんねつ",
  "たんのう",
  "たんぴん",
  "だんぼう",
  "たんまつ",
  "たんめい",
  "だんれつ",
  "だんろ",
  "だんわ",
  "ちあい",
  "ちあん",
  "ちいき",
  "ちいさい",
  "ちえん",
  "ちかい",
  "ちから",
  "ちきゅう",
  "ちきん",
  "ちけいず",
  "ちけん",
  "ちこく",
  "ちさい",
  "ちしき",
  "ちしりょう",
  "ちせい",
  "ちそう",
  "ちたい",
  "ちたん",
  "ちちおや",
  "ちつじょ",
  "ちてき",
  "ちてん",
  "ちぬき",
  "ちぬり",
  "ちのう",
  "ちひょう",
  "ちへいせん",
  "ちほう",
  "ちまた",
  "ちみつ",
  "ちみどろ",
  "ちめいど",
  "ちゃんこなべ",
  "ちゅうい",
  "ちゆりょく",
  "ちょうし",
  "ちょさくけん",
  "ちらし",
  "ちらみ",
  "ちりがみ",
  "ちりょう",
  "ちるど",
  "ちわわ",
  "ちんたい",
  "ちんもく",
  "ついか",
  "ついたち",
  "つうか",
  "つうじょう",
  "つうはん",
  "つうわ",
  "つかう",
  "つかれる",
  "つくね",
  "つくる",
  "つけね",
  "つける",
  "つごう",
  "つたえる",
  "つづく",
  "つつじ",
  "つつむ",
  "つとめる",
  "つながる",
  "つなみ",
  "つねづね",
  "つのる",
  "つぶす",
  "つまらない",
  "つまる",
  "つみき",
  "つめたい",
  "つもり",
  "つもる",
  "つよい",
  "つるぼ",
  "つるみく",
  "つわもの",
  "つわり",
  "てあし",
  "てあて",
  "てあみ",
  "ていおん",
  "ていか",
  "ていき",
  "ていけい",
  "ていこく",
  "ていさつ",
  "ていし",
  "ていせい",
  "ていたい",
  "ていど",
  "ていねい",
  "ていひょう",
  "ていへん",
  "ていぼう",
  "てうち",
  "ておくれ",
  "てきとう",
  "てくび",
  "でこぼこ",
  "てさぎょう",
  "てさげ",
  "てすり",
  "てそう",
  "てちがい",
  "てちょう",
  "てつがく",
  "てつづき",
  "でっぱ",
  "てつぼう",
  "てつや",
  "でぬかえ",
  "てぬき",
  "てぬぐい",
  "てのひら",
  "てはい",
  "てぶくろ",
  "てふだ",
  "てほどき",
  "てほん",
  "てまえ",
  "てまきずし",
  "てみじか",
  "てみやげ",
  "てらす",
  "てれび",
  "てわけ",
  "てわたし",
  "でんあつ",
  "てんいん",
  "てんかい",
  "てんき",
  "てんぐ",
  "てんけん",
  "てんごく",
  "てんさい",
  "てんし",
  "てんすう",
  "でんち",
  "てんてき",
  "てんとう",
  "てんない",
  "てんぷら",
  "てんぼうだい",
  "てんめつ",
  "てんらんかい",
  "でんりょく",
  "でんわ",
  "どあい",
  "といれ",
  "どうかん",
  "とうきゅう",
  "どうぐ",
  "とうし",
  "とうむぎ",
  "とおい",
  "とおか",
  "とおく",
  "とおす",
  "とおる",
  "とかい",
  "とかす",
  "ときおり",
  "ときどき",
  "とくい",
  "とくしゅう",
  "とくてん",
  "とくに",
  "とくべつ",
  "とけい",
  "とける",
  "とこや",
  "とさか",
  "としょかん",
  "とそう",
  "とたん",
  "とちゅう",
  "とっきゅう",
  "とっくん",
  "とつぜん",
  "とつにゅう",
  "とどける",
  "ととのえる",
  "とない",
  "となえる",
  "となり",
  "とのさま",
  "とばす",
  "どぶがわ",
  "とほう",
  "とまる",
  "とめる",
  "ともだち",
  "ともる",
  "どようび",
  "とらえる",
  "とんかつ",
  "どんぶり",
  "ないかく",
  "ないこう",
  "ないしょ",
  "ないす",
  "ないせん",
  "ないそう",
  "なおす",
  "ながい",
  "なくす",
  "なげる",
  "なこうど",
  "なさけ",
  "なたでここ",
  "なっとう",
  "なつやすみ",
  "ななおし",
  "なにごと",
  "なにもの",
  "なにわ",
  "なのか",
  "なふだ",
  "なまいき",
  "なまえ",
  "なまみ",
  "なみだ",
  "なめらか",
  "なめる",
  "なやむ",
  "ならう",
  "ならび",
  "ならぶ",
  "なれる",
  "なわとび",
  "なわばり",
  "にあう",
  "にいがた",
  "にうけ",
  "におい",
  "にかい",
  "にがて",
  "にきび",
  "にくしみ",
  "にくまん",
  "にげる",
  "にさんかたんそ",
  "にしき",
  "にせもの",
  "にちじょう",
  "にちようび",
  "にっか",
  "にっき",
  "にっけい",
  "にっこう",
  "にっさん",
  "にっしょく",
  "にっすう",
  "にっせき",
  "にってい",
  "になう",
  "にほん",
  "にまめ",
  "にもつ",
  "にやり",
  "にゅういん",
  "にりんしゃ",
  "にわとり",
  "にんい",
  "にんか",
  "にんき",
  "にんげん",
  "にんしき",
  "にんずう",
  "にんそう",
  "にんたい",
  "にんち",
  "にんてい",
  "にんにく",
  "にんぷ",
  "にんまり",
  "にんむ",
  "にんめい",
  "にんよう",
  "ぬいくぎ",
  "ぬかす",
  "ぬぐいとる",
  "ぬぐう",
  "ぬくもり",
  "ぬすむ",
  "ぬまえび",
  "ぬめり",
  "ぬらす",
  "ぬんちゃく",
  "ねあげ",
  "ねいき",
  "ねいる",
  "ねいろ",
  "ねぐせ",
  "ねくたい",
  "ねくら",
  "ねこぜ",
  "ねこむ",
  "ねさげ",
  "ねすごす",
  "ねそべる",
  "ねだん",
  "ねつい",
  "ねっしん",
  "ねつぞう",
  "ねったいぎょ",
  "ねぶそく",
  "ねふだ",
  "ねぼう",
  "ねほりはほり",
  "ねまき",
  "ねまわし",
  "ねみみ",
  "ねむい",
  "ねむたい",
  "ねもと",
  "ねらう",
  "ねわざ",
  "ねんいり",
  "ねんおし",
  "ねんかん",
  "ねんきん",
  "ねんぐ",
  "ねんざ",
  "ねんし",
  "ねんちゃく",
  "ねんど",
  "ねんぴ",
  "ねんぶつ",
  "ねんまつ",
  "ねんりょう",
  "ねんれい",
  "のいず",
  "のおづま",
  "のがす",
  "のきなみ",
  "のこぎり",
  "のこす",
  "のこる",
  "のせる",
  "のぞく",
  "のぞむ",
  "のたまう",
  "のちほど",
  "のっく",
  "のばす",
  "のはら",
  "のべる",
  "のぼる",
  "のみもの",
  "のやま",
  "のらいぬ",
  "のらねこ",
  "のりもの",
  "のりゆき",
  "のれん",
  "のんき",
  "ばあい",
  "はあく",
  "ばあさん",
  "ばいか",
  "ばいく",
  "はいけん",
  "はいご",
  "はいしん",
  "はいすい",
  "はいせん",
  "はいそう",
  "はいち",
  "ばいばい",
  "はいれつ",
  "はえる",
  "はおる",
  "はかい",
  "ばかり",
  "はかる",
  "はくしゅ",
  "はけん",
  "はこぶ",
  "はさみ",
  "はさん",
  "はしご",
  "ばしょ",
  "はしる",
  "はせる",
  "ぱそこん",
  "はそん",
  "はたん",
  "はちみつ",
  "はつおん",
  "はっかく",
  "はづき",
  "はっきり",
  "はっくつ",
  "はっけん",
  "はっこう",
  "はっさん",
  "はっしん",
  "はったつ",
  "はっちゅう",
  "はってん",
  "はっぴょう",
  "はっぽう",
  "はなす",
  "はなび",
  "はにかむ",
  "はぶらし",
  "はみがき",
  "はむかう",
  "はめつ",
  "はやい",
  "はやし",
  "はらう",
  "はろうぃん",
  "はわい",
  "はんい",
  "はんえい",
  "はんおん",
  "はんかく",
  "はんきょう",
  "ばんぐみ",
  "はんこ",
  "はんしゃ",
  "はんすう",
  "はんだん",
  "ぱんち",
  "ぱんつ",
  "はんてい",
  "はんとし",
  "はんのう",
  "はんぱ",
  "はんぶん",
  "はんぺん",
  "はんぼうき",
  "はんめい",
  "はんらん",
  "はんろん",
  "ひいき",
  "ひうん",
  "ひえる",
  "ひかく",
  "ひかり",
  "ひかる",
  "ひかん",
  "ひくい",
  "ひけつ",
  "ひこうき",
  "ひこく",
  "ひさい",
  "ひさしぶり",
  "ひさん",
  "びじゅつかん",
  "ひしょ",
  "ひそか",
  "ひそむ",
  "ひたむき",
  "ひだり",
  "ひたる",
  "ひつぎ",
  "ひっこし",
  "ひっし",
  "ひつじゅひん",
  "ひっす",
  "ひつぜん",
  "ぴったり",
  "ぴっちり",
  "ひつよう",
  "ひてい",
  "ひとごみ",
  "ひなまつり",
  "ひなん",
  "ひねる",
  "ひはん",
  "ひびく",
  "ひひょう",
  "ひほう",
  "ひまわり",
  "ひまん",
  "ひみつ",
  "ひめい",
  "ひめじし",
  "ひやけ",
  "ひやす",
  "ひよう",
  "びょうき",
  "ひらがな",
  "ひらく",
  "ひりつ",
  "ひりょう",
  "ひるま",
  "ひるやすみ",
  "ひれい",
  "ひろい",
  "ひろう",
  "ひろき",
  "ひろゆき",
  "ひんかく",
  "ひんけつ",
  "ひんこん",
  "ひんしゅ",
  "ひんそう",
  "ぴんち",
  "ひんぱん",
  "びんぼう",
  "ふあん",
  "ふいうち",
  "ふうけい",
  "ふうせん",
  "ぷうたろう",
  "ふうとう",
  "ふうふ",
  "ふえる",
  "ふおん",
  "ふかい",
  "ふきん",
  "ふくざつ",
  "ふくぶくろ",
  "ふこう",
  "ふさい",
  "ふしぎ",
  "ふじみ",
  "ふすま",
  "ふせい",
  "ふせぐ",
  "ふそく",
  "ぶたにく",
  "ふたん",
  "ふちょう",
  "ふつう",
  "ふつか",
  "ふっかつ",
  "ふっき",
  "ふっこく",
  "ぶどう",
  "ふとる",
  "ふとん",
  "ふのう",
  "ふはい",
  "ふひょう",
  "ふへん",
  "ふまん",
  "ふみん",
  "ふめつ",
  "ふめん",
  "ふよう",
  "ふりこ",
  "ふりる",
  "ふるい",
  "ふんいき",
  "ぶんがく",
  "ぶんぐ",
  "ふんしつ",
  "ぶんせき",
  "ふんそう",
  "ぶんぽう",
  "へいあん",
  "へいおん",
  "へいがい",
  "へいき",
  "へいげん",
  "へいこう",
  "へいさ",
  "へいしゃ",
  "へいせつ",
  "へいそ",
  "へいたく",
  "へいてん",
  "へいねつ",
  "へいわ",
  "へきが",
  "へこむ",
  "べにいろ",
  "べにしょうが",
  "へらす",
  "へんかん",
  "べんきょう",
  "べんごし",
  "へんさい",
  "へんたい",
  "べんり",
  "ほあん",
  "ほいく",
  "ぼうぎょ",
  "ほうこく",
  "ほうそう",
  "ほうほう",
  "ほうもん",
  "ほうりつ",
  "ほえる",
  "ほおん",
  "ほかん",
  "ほきょう",
  "ぼきん",
  "ほくろ",
  "ほけつ",
  "ほけん",
  "ほこう",
  "ほこる",
  "ほしい",
  "ほしつ",
  "ほしゅ",
  "ほしょう",
  "ほせい",
  "ほそい",
  "ほそく",
  "ほたて",
  "ほたる",
  "ぽちぶくろ",
  "ほっきょく",
  "ほっさ",
  "ほったん",
  "ほとんど",
  "ほめる",
  "ほんい",
  "ほんき",
  "ほんけ",
  "ほんしつ",
  "ほんやく",
  "まいにち",
  "まかい",
  "まかせる",
  "まがる",
  "まける",
  "まこと",
  "まさつ",
  "まじめ",
  "ますく",
  "まぜる",
  "まつり",
  "まとめ",
  "まなぶ",
  "まぬけ",
  "まねく",
  "まほう",
  "まもる",
  "まゆげ",
  "まよう",
  "まろやか",
  "まわす",
  "まわり",
  "まわる",
  "まんが",
  "まんきつ",
  "まんぞく",
  "まんなか",
  "みいら",
  "みうち",
  "みえる",
  "みがく",
  "みかた",
  "みかん",
  "みけん",
  "みこん",
  "みじかい",
  "みすい",
  "みすえる",
  "みせる",
  "みっか",
  "みつかる",
  "みつける",
  "みてい",
  "みとめる",
  "みなと",
  "みなみかさい",
  "みねらる",
  "みのう",
  "みのがす",
  "みほん",
  "みもと",
  "みやげ",
  "みらい",
  "みりょく",
  "みわく",
  "みんか",
  "みんぞく",
  "むいか",
  "むえき",
  "むえん",
  "むかい",
  "むかう",
  "むかえ",
  "むかし",
  "むぎちゃ",
  "むける",
  "むげん",
  "むさぼる",
  "むしあつい",
  "むしば",
  "むじゅん",
  "むしろ",
  "むすう",
  "むすこ",
  "むすぶ",
  "むすめ",
  "むせる",
  "むせん",
  "むちゅう",
  "むなしい",
  "むのう",
  "むやみ",
  "むよう",
  "むらさき",
  "むりょう",
  "むろん",
  "めいあん",
  "めいうん",
  "めいえん",
  "めいかく",
  "めいきょく",
  "めいさい",
  "めいし",
  "めいそう",
  "めいぶつ",
  "めいれい",
  "めいわく",
  "めぐまれる",
  "めざす",
  "めした",
  "めずらしい",
  "めだつ",
  "めまい",
  "めやす",
  "めんきょ",
  "めんせき",
  "めんどう",
  "もうしあげる",
  "もうどうけん",
  "もえる",
  "もくし",
  "もくてき",
  "もくようび",
  "もちろん",
  "もどる",
  "もらう",
  "もんく",
  "もんだい",
  "やおや",
  "やける",
  "やさい",
  "やさしい",
  "やすい",
  "やすたろう",
  "やすみ",
  "やせる",
  "やそう",
  "やたい",
  "やちん",
  "やっと",
  "やっぱり",
  "やぶる",
  "やめる",
  "ややこしい",
  "やよい",
  "やわらかい",
  "ゆうき",
  "ゆうびんきょく",
  "ゆうべ",
  "ゆうめい",
  "ゆけつ",
  "ゆしゅつ",
  "ゆせん",
  "ゆそう",
  "ゆたか",
  "ゆちゃく",
  "ゆでる",
  "ゆにゅう",
  "ゆびわ",
  "ゆらい",
  "ゆれる",
  "ようい",
  "ようか",
  "ようきゅう",
  "ようじ",
  "ようす",
  "ようちえん",
  "よかぜ",
  "よかん",
  "よきん",
  "よくせい",
  "よくぼう",
  "よけい",
  "よごれる",
  "よさん",
  "よしゅう",
  "よそう",
  "よそく",
  "よっか",
  "よてい",
  "よどがわく",
  "よねつ",
  "よやく",
  "よゆう",
  "よろこぶ",
  "よろしい",
  "らいう",
  "らくがき",
  "らくご",
  "らくさつ",
  "らくだ",
  "らしんばん",
  "らせん",
  "らぞく",
  "らたい",
  "らっか",
  "られつ",
  "りえき",
  "りかい",
  "りきさく",
  "りきせつ",
  "りくぐん",
  "りくつ",
  "りけん",
  "りこう",
  "りせい",
  "りそう",
  "りそく",
  "りてん",
  "りねん",
  "りゆう",
  "りゅうがく",
  "りよう",
  "りょうり",
  "りょかん",
  "りょくちゃ",
  "りょこう",
  "りりく",
  "りれき",
  "りろん",
  "りんご",
  "るいけい",
  "るいさい",
  "るいじ",
  "るいせき",
  "るすばん",
  "るりがわら",
  "れいかん",
  "れいぎ",
  "れいせい",
  "れいぞうこ",
  "れいとう",
  "れいぼう",
  "れきし",
  "れきだい",
  "れんあい",
  "れんけい",
  "れんこん",
  "れんさい",
  "れんしゅう",
  "れんぞく",
  "れんらく",
  "ろうか",
  "ろうご",
  "ろうじん",
  "ろうそく",
  "ろくが",
  "ろこつ",
  "ろじうら",
  "ろしゅつ",
  "ろせん",
  "ろてん",
  "ろめん",
  "ろれつ",
  "ろんぎ",
  "ろんぱ",
  "ろんぶん",
  "ろんり",
  "わかす",
  "わかめ",
  "わかやま",
  "わかれる",
  "わしつ",
  "わじまし",
  "わすれもの",
  "わらう",
  "われる"
]

},{}],36:[function(reqqqqq,module,exports){
module.exports=[
  "가격",
  "가끔",
  "가난",
  "가능",
  "가득",
  "가르침",
  "가뭄",
  "가방",
  "가상",
  "가슴",
  "가운데",
  "가을",
  "가이드",
  "가입",
  "가장",
  "가정",
  "가족",
  "가죽",
  "각오",
  "각자",
  "간격",
  "간부",
  "간섭",
  "간장",
  "간접",
  "간판",
  "갈등",
  "갈비",
  "갈색",
  "갈증",
  "감각",
  "감기",
  "감소",
  "감수성",
  "감자",
  "감정",
  "갑자기",
  "강남",
  "강당",
  "강도",
  "강력히",
  "강변",
  "강북",
  "강사",
  "강수량",
  "강아지",
  "강원도",
  "강의",
  "강제",
  "강조",
  "같이",
  "개구리",
  "개나리",
  "개방",
  "개별",
  "개선",
  "개성",
  "개인",
  "객관적",
  "거실",
  "거액",
  "거울",
  "거짓",
  "거품",
  "걱정",
  "건강",
  "건물",
  "건설",
  "건조",
  "건축",
  "걸음",
  "검사",
  "검토",
  "게시판",
  "게임",
  "겨울",
  "견해",
  "결과",
  "결국",
  "결론",
  "결석",
  "결승",
  "결심",
  "결정",
  "결혼",
  "경계",
  "경고",
  "경기",
  "경력",
  "경복궁",
  "경비",
  "경상도",
  "경영",
  "경우",
  "경쟁",
  "경제",
  "경주",
  "경찰",
  "경치",
  "경향",
  "경험",
  "계곡",
  "계단",
  "계란",
  "계산",
  "계속",
  "계약",
  "계절",
  "계층",
  "계획",
  "고객",
  "고구려",
  "고궁",
  "고급",
  "고등학생",
  "고무신",
  "고민",
  "고양이",
  "고장",
  "고전",
  "고집",
  "고춧가루",
  "고통",
  "고향",
  "곡식",
  "골목",
  "골짜기",
  "골프",
  "공간",
  "공개",
  "공격",
  "공군",
  "공급",
  "공기",
  "공동",
  "공무원",
  "공부",
  "공사",
  "공식",
  "공업",
  "공연",
  "공원",
  "공장",
  "공짜",
  "공책",
  "공통",
  "공포",
  "공항",
  "공휴일",
  "과목",
  "과일",
  "과장",
  "과정",
  "과학",
  "관객",
  "관계",
  "관광",
  "관념",
  "관람",
  "관련",
  "관리",
  "관습",
  "관심",
  "관점",
  "관찰",
  "광경",
  "광고",
  "광장",
  "광주",
  "괴로움",
  "굉장히",
  "교과서",
  "교문",
  "교복",
  "교실",
  "교양",
  "교육",
  "교장",
  "교직",
  "교통",
  "교환",
  "교훈",
  "구경",
  "구름",
  "구멍",
  "구별",
  "구분",
  "구석",
  "구성",
  "구속",
  "구역",
  "구입",
  "구청",
  "구체적",
  "국가",
  "국기",
  "국내",
  "국립",
  "국물",
  "국민",
  "국수",
  "국어",
  "국왕",
  "국적",
  "국제",
  "국회",
  "군대",
  "군사",
  "군인",
  "궁극적",
  "권리",
  "권위",
  "권투",
  "귀국",
  "귀신",
  "규정",
  "규칙",
  "균형",
  "그날",
  "그냥",
  "그늘",
  "그러나",
  "그룹",
  "그릇",
  "그림",
  "그제서야",
  "그토록",
  "극복",
  "극히",
  "근거",
  "근교",
  "근래",
  "근로",
  "근무",
  "근본",
  "근원",
  "근육",
  "근처",
  "글씨",
  "글자",
  "금강산",
  "금고",
  "금년",
  "금메달",
  "금액",
  "금연",
  "금요일",
  "금지",
  "긍정적",
  "기간",
  "기관",
  "기념",
  "기능",
  "기독교",
  "기둥",
  "기록",
  "기름",
  "기법",
  "기본",
  "기분",
  "기쁨",
  "기숙사",
  "기술",
  "기억",
  "기업",
  "기온",
  "기운",
  "기원",
  "기적",
  "기준",
  "기침",
  "기혼",
  "기획",
  "긴급",
  "긴장",
  "길이",
  "김밥",
  "김치",
  "김포공항",
  "깍두기",
  "깜빡",
  "깨달음",
  "깨소금",
  "껍질",
  "꼭대기",
  "꽃잎",
  "나들이",
  "나란히",
  "나머지",
  "나물",
  "나침반",
  "나흘",
  "낙엽",
  "난방",
  "날개",
  "날씨",
  "날짜",
  "남녀",
  "남대문",
  "남매",
  "남산",
  "남자",
  "남편",
  "남학생",
  "낭비",
  "낱말",
  "내년",
  "내용",
  "내일",
  "냄비",
  "냄새",
  "냇물",
  "냉동",
  "냉면",
  "냉방",
  "냉장고",
  "넥타이",
  "넷째",
  "노동",
  "노란색",
  "노력",
  "노인",
  "녹음",
  "녹차",
  "녹화",
  "논리",
  "논문",
  "논쟁",
  "놀이",
  "농구",
  "농담",
  "농민",
  "농부",
  "농업",
  "농장",
  "농촌",
  "높이",
  "눈동자",
  "눈물",
  "눈썹",
  "뉴욕",
  "느낌",
  "늑대",
  "능동적",
  "능력",
  "다방",
  "다양성",
  "다음",
  "다이어트",
  "다행",
  "단계",
  "단골",
  "단독",
  "단맛",
  "단순",
  "단어",
  "단위",
  "단점",
  "단체",
  "단추",
  "단편",
  "단풍",
  "달걀",
  "달러",
  "달력",
  "달리",
  "닭고기",
  "담당",
  "담배",
  "담요",
  "담임",
  "답변",
  "답장",
  "당근",
  "당분간",
  "당연히",
  "당장",
  "대규모",
  "대낮",
  "대단히",
  "대답",
  "대도시",
  "대략",
  "대량",
  "대륙",
  "대문",
  "대부분",
  "대신",
  "대응",
  "대장",
  "대전",
  "대접",
  "대중",
  "대책",
  "대출",
  "대충",
  "대통령",
  "대학",
  "대한민국",
  "대합실",
  "대형",
  "덩어리",
  "데이트",
  "도대체",
  "도덕",
  "도둑",
  "도망",
  "도서관",
  "도심",
  "도움",
  "도입",
  "도자기",
  "도저히",
  "도전",
  "도중",
  "도착",
  "독감",
  "독립",
  "독서",
  "독일",
  "독창적",
  "동화책",
  "뒷모습",
  "뒷산",
  "딸아이",
  "마누라",
  "마늘",
  "마당",
  "마라톤",
  "마련",
  "마무리",
  "마사지",
  "마약",
  "마요네즈",
  "마을",
  "마음",
  "마이크",
  "마중",
  "마지막",
  "마찬가지",
  "마찰",
  "마흔",
  "막걸리",
  "막내",
  "막상",
  "만남",
  "만두",
  "만세",
  "만약",
  "만일",
  "만점",
  "만족",
  "만화",
  "많이",
  "말기",
  "말씀",
  "말투",
  "맘대로",
  "망원경",
  "매년",
  "매달",
  "매력",
  "매번",
  "매스컴",
  "매일",
  "매장",
  "맥주",
  "먹이",
  "먼저",
  "먼지",
  "멀리",
  "메일",
  "며느리",
  "며칠",
  "면담",
  "멸치",
  "명단",
  "명령",
  "명예",
  "명의",
  "명절",
  "명칭",
  "명함",
  "모금",
  "모니터",
  "모델",
  "모든",
  "모범",
  "모습",
  "모양",
  "모임",
  "모조리",
  "모집",
  "모퉁이",
  "목걸이",
  "목록",
  "목사",
  "목소리",
  "목숨",
  "목적",
  "목표",
  "몰래",
  "몸매",
  "몸무게",
  "몸살",
  "몸속",
  "몸짓",
  "몸통",
  "몹시",
  "무관심",
  "무궁화",
  "무더위",
  "무덤",
  "무릎",
  "무슨",
  "무엇",
  "무역",
  "무용",
  "무조건",
  "무지개",
  "무척",
  "문구",
  "문득",
  "문법",
  "문서",
  "문제",
  "문학",
  "문화",
  "물가",
  "물건",
  "물결",
  "물고기",
  "물론",
  "물리학",
  "물음",
  "물질",
  "물체",
  "미국",
  "미디어",
  "미사일",
  "미술",
  "미역",
  "미용실",
  "미움",
  "미인",
  "미팅",
  "미혼",
  "민간",
  "민족",
  "민주",
  "믿음",
  "밀가루",
  "밀리미터",
  "밑바닥",
  "바가지",
  "바구니",
  "바나나",
  "바늘",
  "바닥",
  "바닷가",
  "바람",
  "바이러스",
  "바탕",
  "박물관",
  "박사",
  "박수",
  "반대",
  "반드시",
  "반말",
  "반발",
  "반성",
  "반응",
  "반장",
  "반죽",
  "반지",
  "반찬",
  "받침",
  "발가락",
  "발걸음",
  "발견",
  "발달",
  "발레",
  "발목",
  "발바닥",
  "발생",
  "발음",
  "발자국",
  "발전",
  "발톱",
  "발표",
  "밤하늘",
  "밥그릇",
  "밥맛",
  "밥상",
  "밥솥",
  "방금",
  "방면",
  "방문",
  "방바닥",
  "방법",
  "방송",
  "방식",
  "방안",
  "방울",
  "방지",
  "방학",
  "방해",
  "방향",
  "배경",
  "배꼽",
  "배달",
  "배드민턴",
  "백두산",
  "백색",
  "백성",
  "백인",
  "백제",
  "백화점",
  "버릇",
  "버섯",
  "버튼",
  "번개",
  "번역",
  "번지",
  "번호",
  "벌금",
  "벌레",
  "벌써",
  "범위",
  "범인",
  "범죄",
  "법률",
  "법원",
  "법적",
  "법칙",
  "베이징",
  "벨트",
  "변경",
  "변동",
  "변명",
  "변신",
  "변호사",
  "변화",
  "별도",
  "별명",
  "별일",
  "병실",
  "병아리",
  "병원",
  "보관",
  "보너스",
  "보라색",
  "보람",
  "보름",
  "보상",
  "보안",
  "보자기",
  "보장",
  "보전",
  "보존",
  "보통",
  "보편적",
  "보험",
  "복도",
  "복사",
  "복숭아",
  "복습",
  "볶음",
  "본격적",
  "본래",
  "본부",
  "본사",
  "본성",
  "본인",
  "본질",
  "볼펜",
  "봉사",
  "봉지",
  "봉투",
  "부근",
  "부끄러움",
  "부담",
  "부동산",
  "부문",
  "부분",
  "부산",
  "부상",
  "부엌",
  "부인",
  "부작용",
  "부장",
  "부정",
  "부족",
  "부지런히",
  "부친",
  "부탁",
  "부품",
  "부회장",
  "북부",
  "북한",
  "분노",
  "분량",
  "분리",
  "분명",
  "분석",
  "분야",
  "분위기",
  "분필",
  "분홍색",
  "불고기",
  "불과",
  "불교",
  "불꽃",
  "불만",
  "불법",
  "불빛",
  "불안",
  "불이익",
  "불행",
  "브랜드",
  "비극",
  "비난",
  "비닐",
  "비둘기",
  "비디오",
  "비로소",
  "비만",
  "비명",
  "비밀",
  "비바람",
  "비빔밥",
  "비상",
  "비용",
  "비율",
  "비중",
  "비타민",
  "비판",
  "빌딩",
  "빗물",
  "빗방울",
  "빗줄기",
  "빛깔",
  "빨간색",
  "빨래",
  "빨리",
  "사건",
  "사계절",
  "사나이",
  "사냥",
  "사람",
  "사랑",
  "사립",
  "사모님",
  "사물",
  "사방",
  "사상",
  "사생활",
  "사설",
  "사슴",
  "사실",
  "사업",
  "사용",
  "사월",
  "사장",
  "사전",
  "사진",
  "사촌",
  "사춘기",
  "사탕",
  "사투리",
  "사흘",
  "산길",
  "산부인과",
  "산업",
  "산책",
  "살림",
  "살인",
  "살짝",
  "삼계탕",
  "삼국",
  "삼십",
  "삼월",
  "삼촌",
  "상관",
  "상금",
  "상대",
  "상류",
  "상반기",
  "상상",
  "상식",
  "상업",
  "상인",
  "상자",
  "상점",
  "상처",
  "상추",
  "상태",
  "상표",
  "상품",
  "상황",
  "새벽",
  "색깔",
  "색연필",
  "생각",
  "생명",
  "생물",
  "생방송",
  "생산",
  "생선",
  "생신",
  "생일",
  "생활",
  "서랍",
  "서른",
  "서명",
  "서민",
  "서비스",
  "서양",
  "서울",
  "서적",
  "서점",
  "서쪽",
  "서클",
  "석사",
  "석유",
  "선거",
  "선물",
  "선배",
  "선생",
  "선수",
  "선원",
  "선장",
  "선전",
  "선택",
  "선풍기",
  "설거지",
  "설날",
  "설렁탕",
  "설명",
  "설문",
  "설사",
  "설악산",
  "설치",
  "설탕",
  "섭씨",
  "성공",
  "성당",
  "성명",
  "성별",
  "성인",
  "성장",
  "성적",
  "성질",
  "성함",
  "세금",
  "세미나",
  "세상",
  "세월",
  "세종대왕",
  "세탁",
  "센터",
  "센티미터",
  "셋째",
  "소규모",
  "소극적",
  "소금",
  "소나기",
  "소년",
  "소득",
  "소망",
  "소문",
  "소설",
  "소속",
  "소아과",
  "소용",
  "소원",
  "소음",
  "소중히",
  "소지품",
  "소질",
  "소풍",
  "소형",
  "속담",
  "속도",
  "속옷",
  "손가락",
  "손길",
  "손녀",
  "손님",
  "손등",
  "손목",
  "손뼉",
  "손실",
  "손질",
  "손톱",
  "손해",
  "솔직히",
  "솜씨",
  "송아지",
  "송이",
  "송편",
  "쇠고기",
  "쇼핑",
  "수건",
  "수년",
  "수단",
  "수돗물",
  "수동적",
  "수면",
  "수명",
  "수박",
  "수상",
  "수석",
  "수술",
  "수시로",
  "수업",
  "수염",
  "수영",
  "수입",
  "수준",
  "수집",
  "수출",
  "수컷",
  "수필",
  "수학",
  "수험생",
  "수화기",
  "숙녀",
  "숙소",
  "숙제",
  "순간",
  "순서",
  "순수",
  "순식간",
  "순위",
  "숟가락",
  "술병",
  "술집",
  "숫자",
  "스님",
  "스물",
  "스스로",
  "스승",
  "스웨터",
  "스위치",
  "스케이트",
  "스튜디오",
  "스트레스",
  "스포츠",
  "슬쩍",
  "슬픔",
  "습관",
  "습기",
  "승객",
  "승리",
  "승부",
  "승용차",
  "승진",
  "시각",
  "시간",
  "시골",
  "시금치",
  "시나리오",
  "시댁",
  "시리즈",
  "시멘트",
  "시민",
  "시부모",
  "시선",
  "시설",
  "시스템",
  "시아버지",
  "시어머니",
  "시월",
  "시인",
  "시일",
  "시작",
  "시장",
  "시절",
  "시점",
  "시중",
  "시즌",
  "시집",
  "시청",
  "시합",
  "시험",
  "식구",
  "식기",
  "식당",
  "식량",
  "식료품",
  "식물",
  "식빵",
  "식사",
  "식생활",
  "식초",
  "식탁",
  "식품",
  "신고",
  "신규",
  "신념",
  "신문",
  "신발",
  "신비",
  "신사",
  "신세",
  "신용",
  "신제품",
  "신청",
  "신체",
  "신화",
  "실감",
  "실내",
  "실력",
  "실례",
  "실망",
  "실수",
  "실습",
  "실시",
  "실장",
  "실정",
  "실질적",
  "실천",
  "실체",
  "실컷",
  "실태",
  "실패",
  "실험",
  "실현",
  "심리",
  "심부름",
  "심사",
  "심장",
  "심정",
  "심판",
  "쌍둥이",
  "씨름",
  "씨앗",
  "아가씨",
  "아나운서",
  "아드님",
  "아들",
  "아쉬움",
  "아스팔트",
  "아시아",
  "아울러",
  "아저씨",
  "아줌마",
  "아직",
  "아침",
  "아파트",
  "아프리카",
  "아픔",
  "아홉",
  "아흔",
  "악기",
  "악몽",
  "악수",
  "안개",
  "안경",
  "안과",
  "안내",
  "안녕",
  "안동",
  "안방",
  "안부",
  "안주",
  "알루미늄",
  "알코올",
  "암시",
  "암컷",
  "압력",
  "앞날",
  "앞문",
  "애인",
  "애정",
  "액수",
  "앨범",
  "야간",
  "야단",
  "야옹",
  "약간",
  "약국",
  "약속",
  "약수",
  "약점",
  "약품",
  "약혼녀",
  "양념",
  "양력",
  "양말",
  "양배추",
  "양주",
  "양파",
  "어둠",
  "어려움",
  "어른",
  "어젯밤",
  "어쨌든",
  "어쩌다가",
  "어쩐지",
  "언니",
  "언덕",
  "언론",
  "언어",
  "얼굴",
  "얼른",
  "얼음",
  "얼핏",
  "엄마",
  "업무",
  "업종",
  "업체",
  "엉덩이",
  "엉망",
  "엉터리",
  "엊그제",
  "에너지",
  "에어컨",
  "엔진",
  "여건",
  "여고생",
  "여관",
  "여군",
  "여권",
  "여대생",
  "여덟",
  "여동생",
  "여든",
  "여론",
  "여름",
  "여섯",
  "여성",
  "여왕",
  "여인",
  "여전히",
  "여직원",
  "여학생",
  "여행",
  "역사",
  "역시",
  "역할",
  "연결",
  "연구",
  "연극",
  "연기",
  "연락",
  "연설",
  "연세",
  "연속",
  "연습",
  "연애",
  "연예인",
  "연인",
  "연장",
  "연주",
  "연출",
  "연필",
  "연합",
  "연휴",
  "열기",
  "열매",
  "열쇠",
  "열심히",
  "열정",
  "열차",
  "열흘",
  "염려",
  "엽서",
  "영국",
  "영남",
  "영상",
  "영양",
  "영역",
  "영웅",
  "영원히",
  "영하",
  "영향",
  "영혼",
  "영화",
  "옆구리",
  "옆방",
  "옆집",
  "예감",
  "예금",
  "예방",
  "예산",
  "예상",
  "예선",
  "예술",
  "예습",
  "예식장",
  "예약",
  "예전",
  "예절",
  "예정",
  "예컨대",
  "옛날",
  "오늘",
  "오락",
  "오랫동안",
  "오렌지",
  "오로지",
  "오른발",
  "오븐",
  "오십",
  "오염",
  "오월",
  "오전",
  "오직",
  "오징어",
  "오페라",
  "오피스텔",
  "오히려",
  "옥상",
  "옥수수",
  "온갖",
  "온라인",
  "온몸",
  "온종일",
  "온통",
  "올가을",
  "올림픽",
  "올해",
  "옷차림",
  "와이셔츠",
  "와인",
  "완성",
  "완전",
  "왕비",
  "왕자",
  "왜냐하면",
  "왠지",
  "외갓집",
  "외국",
  "외로움",
  "외삼촌",
  "외출",
  "외침",
  "외할머니",
  "왼발",
  "왼손",
  "왼쪽",
  "요금",
  "요일",
  "요즘",
  "요청",
  "용기",
  "용서",
  "용어",
  "우산",
  "우선",
  "우승",
  "우연히",
  "우정",
  "우체국",
  "우편",
  "운동",
  "운명",
  "운반",
  "운전",
  "운행",
  "울산",
  "울음",
  "움직임",
  "웃어른",
  "웃음",
  "워낙",
  "원고",
  "원래",
  "원서",
  "원숭이",
  "원인",
  "원장",
  "원피스",
  "월급",
  "월드컵",
  "월세",
  "월요일",
  "웨이터",
  "위반",
  "위법",
  "위성",
  "위원",
  "위험",
  "위협",
  "윗사람",
  "유난히",
  "유럽",
  "유명",
  "유물",
  "유산",
  "유적",
  "유치원",
  "유학",
  "유행",
  "유형",
  "육군",
  "육상",
  "육십",
  "육체",
  "은행",
  "음력",
  "음료",
  "음반",
  "음성",
  "음식",
  "음악",
  "음주",
  "의견",
  "의논",
  "의문",
  "의복",
  "의식",
  "의심",
  "의외로",
  "의욕",
  "의원",
  "의학",
  "이것",
  "이곳",
  "이념",
  "이놈",
  "이달",
  "이대로",
  "이동",
  "이렇게",
  "이력서",
  "이론적",
  "이름",
  "이민",
  "이발소",
  "이별",
  "이불",
  "이빨",
  "이상",
  "이성",
  "이슬",
  "이야기",
  "이용",
  "이웃",
  "이월",
  "이윽고",
  "이익",
  "이전",
  "이중",
  "이튿날",
  "이틀",
  "이혼",
  "인간",
  "인격",
  "인공",
  "인구",
  "인근",
  "인기",
  "인도",
  "인류",
  "인물",
  "인생",
  "인쇄",
  "인연",
  "인원",
  "인재",
  "인종",
  "인천",
  "인체",
  "인터넷",
  "인하",
  "인형",
  "일곱",
  "일기",
  "일단",
  "일대",
  "일등",
  "일반",
  "일본",
  "일부",
  "일상",
  "일생",
  "일손",
  "일요일",
  "일월",
  "일정",
  "일종",
  "일주일",
  "일찍",
  "일체",
  "일치",
  "일행",
  "일회용",
  "임금",
  "임무",
  "입대",
  "입력",
  "입맛",
  "입사",
  "입술",
  "입시",
  "입원",
  "입장",
  "입학",
  "자가용",
  "자격",
  "자극",
  "자동",
  "자랑",
  "자부심",
  "자식",
  "자신",
  "자연",
  "자원",
  "자율",
  "자전거",
  "자정",
  "자존심",
  "자판",
  "작가",
  "작년",
  "작성",
  "작업",
  "작용",
  "작은딸",
  "작품",
  "잔디",
  "잔뜩",
  "잔치",
  "잘못",
  "잠깐",
  "잠수함",
  "잠시",
  "잠옷",
  "잠자리",
  "잡지",
  "장관",
  "장군",
  "장기간",
  "장래",
  "장례",
  "장르",
  "장마",
  "장면",
  "장모",
  "장미",
  "장비",
  "장사",
  "장소",
  "장식",
  "장애인",
  "장인",
  "장점",
  "장차",
  "장학금",
  "재능",
  "재빨리",
  "재산",
  "재생",
  "재작년",
  "재정",
  "재채기",
  "재판",
  "재학",
  "재활용",
  "저것",
  "저고리",
  "저곳",
  "저녁",
  "저런",
  "저렇게",
  "저번",
  "저울",
  "저절로",
  "저축",
  "적극",
  "적당히",
  "적성",
  "적용",
  "적응",
  "전개",
  "전공",
  "전기",
  "전달",
  "전라도",
  "전망",
  "전문",
  "전반",
  "전부",
  "전세",
  "전시",
  "전용",
  "전자",
  "전쟁",
  "전주",
  "전철",
  "전체",
  "전통",
  "전혀",
  "전후",
  "절대",
  "절망",
  "절반",
  "절약",
  "절차",
  "점검",
  "점수",
  "점심",
  "점원",
  "점점",
  "점차",
  "접근",
  "접시",
  "접촉",
  "젓가락",
  "정거장",
  "정도",
  "정류장",
  "정리",
  "정말",
  "정면",
  "정문",
  "정반대",
  "정보",
  "정부",
  "정비",
  "정상",
  "정성",
  "정오",
  "정원",
  "정장",
  "정지",
  "정치",
  "정확히",
  "제공",
  "제과점",
  "제대로",
  "제목",
  "제발",
  "제법",
  "제삿날",
  "제안",
  "제일",
  "제작",
  "제주도",
  "제출",
  "제품",
  "제한",
  "조각",
  "조건",
  "조금",
  "조깅",
  "조명",
  "조미료",
  "조상",
  "조선",
  "조용히",
  "조절",
  "조정",
  "조직",
  "존댓말",
  "존재",
  "졸업",
  "졸음",
  "종교",
  "종로",
  "종류",
  "종소리",
  "종업원",
  "종종",
  "종합",
  "좌석",
  "죄인",
  "주관적",
  "주름",
  "주말",
  "주머니",
  "주먹",
  "주문",
  "주민",
  "주방",
  "주변",
  "주식",
  "주인",
  "주일",
  "주장",
  "주전자",
  "주택",
  "준비",
  "줄거리",
  "줄기",
  "줄무늬",
  "중간",
  "중계방송",
  "중국",
  "중년",
  "중단",
  "중독",
  "중반",
  "중부",
  "중세",
  "중소기업",
  "중순",
  "중앙",
  "중요",
  "중학교",
  "즉석",
  "즉시",
  "즐거움",
  "증가",
  "증거",
  "증권",
  "증상",
  "증세",
  "지각",
  "지갑",
  "지경",
  "지극히",
  "지금",
  "지급",
  "지능",
  "지름길",
  "지리산",
  "지방",
  "지붕",
  "지식",
  "지역",
  "지우개",
  "지원",
  "지적",
  "지점",
  "지진",
  "지출",
  "직선",
  "직업",
  "직원",
  "직장",
  "진급",
  "진동",
  "진로",
  "진료",
  "진리",
  "진짜",
  "진찰",
  "진출",
  "진통",
  "진행",
  "질문",
  "질병",
  "질서",
  "짐작",
  "집단",
  "집안",
  "집중",
  "짜증",
  "찌꺼기",
  "차남",
  "차라리",
  "차량",
  "차림",
  "차별",
  "차선",
  "차츰",
  "착각",
  "찬물",
  "찬성",
  "참가",
  "참기름",
  "참새",
  "참석",
  "참여",
  "참외",
  "참조",
  "찻잔",
  "창가",
  "창고",
  "창구",
  "창문",
  "창밖",
  "창작",
  "창조",
  "채널",
  "채점",
  "책가방",
  "책방",
  "책상",
  "책임",
  "챔피언",
  "처벌",
  "처음",
  "천국",
  "천둥",
  "천장",
  "천재",
  "천천히",
  "철도",
  "철저히",
  "철학",
  "첫날",
  "첫째",
  "청년",
  "청바지",
  "청소",
  "청춘",
  "체계",
  "체력",
  "체온",
  "체육",
  "체중",
  "체험",
  "초등학생",
  "초반",
  "초밥",
  "초상화",
  "초순",
  "초여름",
  "초원",
  "초저녁",
  "초점",
  "초청",
  "초콜릿",
  "촛불",
  "총각",
  "총리",
  "총장",
  "촬영",
  "최근",
  "최상",
  "최선",
  "최신",
  "최악",
  "최종",
  "추석",
  "추억",
  "추진",
  "추천",
  "추측",
  "축구",
  "축소",
  "축제",
  "축하",
  "출근",
  "출발",
  "출산",
  "출신",
  "출연",
  "출입",
  "출장",
  "출판",
  "충격",
  "충고",
  "충돌",
  "충분히",
  "충청도",
  "취업",
  "취직",
  "취향",
  "치약",
  "친구",
  "친척",
  "칠십",
  "칠월",
  "칠판",
  "침대",
  "침묵",
  "침실",
  "칫솔",
  "칭찬",
  "카메라",
  "카운터",
  "칼국수",
  "캐릭터",
  "캠퍼스",
  "캠페인",
  "커튼",
  "컨디션",
  "컬러",
  "컴퓨터",
  "코끼리",
  "코미디",
  "콘서트",
  "콜라",
  "콤플렉스",
  "콩나물",
  "쾌감",
  "쿠데타",
  "크림",
  "큰길",
  "큰딸",
  "큰소리",
  "큰아들",
  "큰어머니",
  "큰일",
  "큰절",
  "클래식",
  "클럽",
  "킬로",
  "타입",
  "타자기",
  "탁구",
  "탁자",
  "탄생",
  "태권도",
  "태양",
  "태풍",
  "택시",
  "탤런트",
  "터널",
  "터미널",
  "테니스",
  "테스트",
  "테이블",
  "텔레비전",
  "토론",
  "토마토",
  "토요일",
  "통계",
  "통과",
  "통로",
  "통신",
  "통역",
  "통일",
  "통장",
  "통제",
  "통증",
  "통합",
  "통화",
  "퇴근",
  "퇴원",
  "퇴직금",
  "튀김",
  "트럭",
  "특급",
  "특별",
  "특성",
  "특수",
  "특징",
  "특히",
  "튼튼히",
  "티셔츠",
  "파란색",
  "파일",
  "파출소",
  "판결",
  "판단",
  "판매",
  "판사",
  "팔십",
  "팔월",
  "팝송",
  "패션",
  "팩스",
  "팩시밀리",
  "팬티",
  "퍼센트",
  "페인트",
  "편견",
  "편의",
  "편지",
  "편히",
  "평가",
  "평균",
  "평생",
  "평소",
  "평양",
  "평일",
  "평화",
  "포스터",
  "포인트",
  "포장",
  "포함",
  "표면",
  "표정",
  "표준",
  "표현",
  "품목",
  "품질",
  "풍경",
  "풍속",
  "풍습",
  "프랑스",
  "프린터",
  "플라스틱",
  "피곤",
  "피망",
  "피아노",
  "필름",
  "필수",
  "필요",
  "필자",
  "필통",
  "핑계",
  "하느님",
  "하늘",
  "하드웨어",
  "하룻밤",
  "하반기",
  "하숙집",
  "하순",
  "하여튼",
  "하지만",
  "하천",
  "하품",
  "하필",
  "학과",
  "학교",
  "학급",
  "학기",
  "학년",
  "학력",
  "학번",
  "학부모",
  "학비",
  "학생",
  "학술",
  "학습",
  "학용품",
  "학원",
  "학위",
  "학자",
  "학점",
  "한계",
  "한글",
  "한꺼번에",
  "한낮",
  "한눈",
  "한동안",
  "한때",
  "한라산",
  "한마디",
  "한문",
  "한번",
  "한복",
  "한식",
  "한여름",
  "한쪽",
  "할머니",
  "할아버지",
  "할인",
  "함께",
  "함부로",
  "합격",
  "합리적",
  "항공",
  "항구",
  "항상",
  "항의",
  "해결",
  "해군",
  "해답",
  "해당",
  "해물",
  "해석",
  "해설",
  "해수욕장",
  "해안",
  "핵심",
  "핸드백",
  "햄버거",
  "햇볕",
  "햇살",
  "행동",
  "행복",
  "행사",
  "행운",
  "행위",
  "향기",
  "향상",
  "향수",
  "허락",
  "허용",
  "헬기",
  "현관",
  "현금",
  "현대",
  "현상",
  "현실",
  "현장",
  "현재",
  "현지",
  "혈액",
  "협력",
  "형부",
  "형사",
  "형수",
  "형식",
  "형제",
  "형태",
  "형편",
  "혜택",
  "호기심",
  "호남",
  "호랑이",
  "호박",
  "호텔",
  "호흡",
  "혹시",
  "홀로",
  "홈페이지",
  "홍보",
  "홍수",
  "홍차",
  "화면",
  "화분",
  "화살",
  "화요일",
  "화장",
  "화학",
  "확보",
  "확인",
  "확장",
  "확정",
  "환갑",
  "환경",
  "환영",
  "환율",
  "환자",
  "활기",
  "활동",
  "활발히",
  "활용",
  "활짝",
  "회견",
  "회관",
  "회복",
  "회색",
  "회원",
  "회장",
  "회전",
  "횟수",
  "횡단보도",
  "효율적",
  "후반",
  "후춧가루",
  "훈련",
  "훨씬",
  "휴식",
  "휴일",
  "흉내",
  "흐름",
  "흑백",
  "흑인",
  "흔적",
  "흔히",
  "흥미",
  "흥분",
  "희곡",
  "희망",
  "희생",
  "흰색",
  "힘껏"
]

},{}],37:[function(reqqqqq,module,exports){
module.exports=[
  "ábaco",
  "abdomen",
  "abeja",
  "abierto",
  "abogado",
  "abono",
  "aborto",
  "abrazo",
  "abrir",
  "abuelo",
  "abuso",
  "acabar",
  "academia",
  "acceso",
  "acción",
  "aceite",
  "acelga",
  "acento",
  "aceptar",
  "ácido",
  "aclarar",
  "acné",
  "acoger",
  "acoso",
  "activo",
  "acto",
  "actriz",
  "actuar",
  "acudir",
  "acuerdo",
  "acusar",
  "adicto",
  "admitir",
  "adoptar",
  "adorno",
  "aduana",
  "adulto",
  "aéreo",
  "afectar",
  "afición",
  "afinar",
  "afirmar",
  "ágil",
  "agitar",
  "agonía",
  "agosto",
  "agotar",
  "agregar",
  "agrio",
  "agua",
  "agudo",
  "águila",
  "aguja",
  "ahogo",
  "ahorro",
  "aire",
  "aislar",
  "ajedrez",
  "ajeno",
  "ajuste",
  "alacrán",
  "alambre",
  "alarma",
  "alba",
  "álbum",
  "alcalde",
  "aldea",
  "alegre",
  "alejar",
  "alerta",
  "aleta",
  "alfiler",
  "alga",
  "algodón",
  "aliado",
  "aliento",
  "alivio",
  "alma",
  "almeja",
  "almíbar",
  "altar",
  "alteza",
  "altivo",
  "alto",
  "altura",
  "alumno",
  "alzar",
  "amable",
  "amante",
  "amapola",
  "amargo",
  "amasar",
  "ámbar",
  "ámbito",
  "ameno",
  "amigo",
  "amistad",
  "amor",
  "amparo",
  "amplio",
  "ancho",
  "anciano",
  "ancla",
  "andar",
  "andén",
  "anemia",
  "ángulo",
  "anillo",
  "ánimo",
  "anís",
  "anotar",
  "antena",
  "antiguo",
  "antojo",
  "anual",
  "anular",
  "anuncio",
  "añadir",
  "añejo",
  "año",
  "apagar",
  "aparato",
  "apetito",
  "apio",
  "aplicar",
  "apodo",
  "aporte",
  "apoyo",
  "aprender",
  "aprobar",
  "apuesta",
  "apuro",
  "arado",
  "araña",
  "arar",
  "árbitro",
  "árbol",
  "arbusto",
  "archivo",
  "arco",
  "arder",
  "ardilla",
  "arduo",
  "área",
  "árido",
  "aries",
  "armonía",
  "arnés",
  "aroma",
  "arpa",
  "arpón",
  "arreglo",
  "arroz",
  "arruga",
  "arte",
  "artista",
  "asa",
  "asado",
  "asalto",
  "ascenso",
  "asegurar",
  "aseo",
  "asesor",
  "asiento",
  "asilo",
  "asistir",
  "asno",
  "asombro",
  "áspero",
  "astilla",
  "astro",
  "astuto",
  "asumir",
  "asunto",
  "atajo",
  "ataque",
  "atar",
  "atento",
  "ateo",
  "ático",
  "atleta",
  "átomo",
  "atraer",
  "atroz",
  "atún",
  "audaz",
  "audio",
  "auge",
  "aula",
  "aumento",
  "ausente",
  "autor",
  "aval",
  "avance",
  "avaro",
  "ave",
  "avellana",
  "avena",
  "avestruz",
  "avión",
  "aviso",
  "ayer",
  "ayuda",
  "ayuno",
  "azafrán",
  "azar",
  "azote",
  "azúcar",
  "azufre",
  "azul",
  "baba",
  "babor",
  "bache",
  "bahía",
  "baile",
  "bajar",
  "balanza",
  "balcón",
  "balde",
  "bambú",
  "banco",
  "banda",
  "baño",
  "barba",
  "barco",
  "barniz",
  "barro",
  "báscula",
  "bastón",
  "basura",
  "batalla",
  "batería",
  "batir",
  "batuta",
  "baúl",
  "bazar",
  "bebé",
  "bebida",
  "bello",
  "besar",
  "beso",
  "bestia",
  "bicho",
  "bien",
  "bingo",
  "blanco",
  "bloque",
  "blusa",
  "boa",
  "bobina",
  "bobo",
  "boca",
  "bocina",
  "boda",
  "bodega",
  "boina",
  "bola",
  "bolero",
  "bolsa",
  "bomba",
  "bondad",
  "bonito",
  "bono",
  "bonsái",
  "borde",
  "borrar",
  "bosque",
  "bote",
  "botín",
  "bóveda",
  "bozal",
  "bravo",
  "brazo",
  "brecha",
  "breve",
  "brillo",
  "brinco",
  "brisa",
  "broca",
  "broma",
  "bronce",
  "brote",
  "bruja",
  "brusco",
  "bruto",
  "buceo",
  "bucle",
  "bueno",
  "buey",
  "bufanda",
  "bufón",
  "búho",
  "buitre",
  "bulto",
  "burbuja",
  "burla",
  "burro",
  "buscar",
  "butaca",
  "buzón",
  "caballo",
  "cabeza",
  "cabina",
  "cabra",
  "cacao",
  "cadáver",
  "cadena",
  "caer",
  "café",
  "caída",
  "caimán",
  "caja",
  "cajón",
  "cal",
  "calamar",
  "calcio",
  "caldo",
  "calidad",
  "calle",
  "calma",
  "calor",
  "calvo",
  "cama",
  "cambio",
  "camello",
  "camino",
  "campo",
  "cáncer",
  "candil",
  "canela",
  "canguro",
  "canica",
  "canto",
  "caña",
  "cañón",
  "caoba",
  "caos",
  "capaz",
  "capitán",
  "capote",
  "captar",
  "capucha",
  "cara",
  "carbón",
  "cárcel",
  "careta",
  "carga",
  "cariño",
  "carne",
  "carpeta",
  "carro",
  "carta",
  "casa",
  "casco",
  "casero",
  "caspa",
  "castor",
  "catorce",
  "catre",
  "caudal",
  "causa",
  "cazo",
  "cebolla",
  "ceder",
  "cedro",
  "celda",
  "célebre",
  "celoso",
  "célula",
  "cemento",
  "ceniza",
  "centro",
  "cerca",
  "cerdo",
  "cereza",
  "cero",
  "cerrar",
  "certeza",
  "césped",
  "cetro",
  "chacal",
  "chaleco",
  "champú",
  "chancla",
  "chapa",
  "charla",
  "chico",
  "chiste",
  "chivo",
  "choque",
  "choza",
  "chuleta",
  "chupar",
  "ciclón",
  "ciego",
  "cielo",
  "cien",
  "cierto",
  "cifra",
  "cigarro",
  "cima",
  "cinco",
  "cine",
  "cinta",
  "ciprés",
  "circo",
  "ciruela",
  "cisne",
  "cita",
  "ciudad",
  "clamor",
  "clan",
  "claro",
  "clase",
  "clave",
  "cliente",
  "clima",
  "clínica",
  "cobre",
  "cocción",
  "cochino",
  "cocina",
  "coco",
  "código",
  "codo",
  "cofre",
  "coger",
  "cohete",
  "cojín",
  "cojo",
  "cola",
  "colcha",
  "colegio",
  "colgar",
  "colina",
  "collar",
  "colmo",
  "columna",
  "combate",
  "comer",
  "comida",
  "cómodo",
  "compra",
  "conde",
  "conejo",
  "conga",
  "conocer",
  "consejo",
  "contar",
  "copa",
  "copia",
  "corazón",
  "corbata",
  "corcho",
  "cordón",
  "corona",
  "correr",
  "coser",
  "cosmos",
  "costa",
  "cráneo",
  "cráter",
  "crear",
  "crecer",
  "creído",
  "crema",
  "cría",
  "crimen",
  "cripta",
  "crisis",
  "cromo",
  "crónica",
  "croqueta",
  "crudo",
  "cruz",
  "cuadro",
  "cuarto",
  "cuatro",
  "cubo",
  "cubrir",
  "cuchara",
  "cuello",
  "cuento",
  "cuerda",
  "cuesta",
  "cueva",
  "cuidar",
  "culebra",
  "culpa",
  "culto",
  "cumbre",
  "cumplir",
  "cuna",
  "cuneta",
  "cuota",
  "cupón",
  "cúpula",
  "curar",
  "curioso",
  "curso",
  "curva",
  "cutis",
  "dama",
  "danza",
  "dar",
  "dardo",
  "dátil",
  "deber",
  "débil",
  "década",
  "decir",
  "dedo",
  "defensa",
  "definir",
  "dejar",
  "delfín",
  "delgado",
  "delito",
  "demora",
  "denso",
  "dental",
  "deporte",
  "derecho",
  "derrota",
  "desayuno",
  "deseo",
  "desfile",
  "desnudo",
  "destino",
  "desvío",
  "detalle",
  "detener",
  "deuda",
  "día",
  "diablo",
  "diadema",
  "diamante",
  "diana",
  "diario",
  "dibujo",
  "dictar",
  "diente",
  "dieta",
  "diez",
  "difícil",
  "digno",
  "dilema",
  "diluir",
  "dinero",
  "directo",
  "dirigir",
  "disco",
  "diseño",
  "disfraz",
  "diva",
  "divino",
  "doble",
  "doce",
  "dolor",
  "domingo",
  "don",
  "donar",
  "dorado",
  "dormir",
  "dorso",
  "dos",
  "dosis",
  "dragón",
  "droga",
  "ducha",
  "duda",
  "duelo",
  "dueño",
  "dulce",
  "dúo",
  "duque",
  "durar",
  "dureza",
  "duro",
  "ébano",
  "ebrio",
  "echar",
  "eco",
  "ecuador",
  "edad",
  "edición",
  "edificio",
  "editor",
  "educar",
  "efecto",
  "eficaz",
  "eje",
  "ejemplo",
  "elefante",
  "elegir",
  "elemento",
  "elevar",
  "elipse",
  "élite",
  "elixir",
  "elogio",
  "eludir",
  "embudo",
  "emitir",
  "emoción",
  "empate",
  "empeño",
  "empleo",
  "empresa",
  "enano",
  "encargo",
  "enchufe",
  "encía",
  "enemigo",
  "enero",
  "enfado",
  "enfermo",
  "engaño",
  "enigma",
  "enlace",
  "enorme",
  "enredo",
  "ensayo",
  "enseñar",
  "entero",
  "entrar",
  "envase",
  "envío",
  "época",
  "equipo",
  "erizo",
  "escala",
  "escena",
  "escolar",
  "escribir",
  "escudo",
  "esencia",
  "esfera",
  "esfuerzo",
  "espada",
  "espejo",
  "espía",
  "esposa",
  "espuma",
  "esquí",
  "estar",
  "este",
  "estilo",
  "estufa",
  "etapa",
  "eterno",
  "ética",
  "etnia",
  "evadir",
  "evaluar",
  "evento",
  "evitar",
  "exacto",
  "examen",
  "exceso",
  "excusa",
  "exento",
  "exigir",
  "exilio",
  "existir",
  "éxito",
  "experto",
  "explicar",
  "exponer",
  "extremo",
  "fábrica",
  "fábula",
  "fachada",
  "fácil",
  "factor",
  "faena",
  "faja",
  "falda",
  "fallo",
  "falso",
  "faltar",
  "fama",
  "familia",
  "famoso",
  "faraón",
  "farmacia",
  "farol",
  "farsa",
  "fase",
  "fatiga",
  "fauna",
  "favor",
  "fax",
  "febrero",
  "fecha",
  "feliz",
  "feo",
  "feria",
  "feroz",
  "fértil",
  "fervor",
  "festín",
  "fiable",
  "fianza",
  "fiar",
  "fibra",
  "ficción",
  "ficha",
  "fideo",
  "fiebre",
  "fiel",
  "fiera",
  "fiesta",
  "figura",
  "fijar",
  "fijo",
  "fila",
  "filete",
  "filial",
  "filtro",
  "fin",
  "finca",
  "fingir",
  "finito",
  "firma",
  "flaco",
  "flauta",
  "flecha",
  "flor",
  "flota",
  "fluir",
  "flujo",
  "flúor",
  "fobia",
  "foca",
  "fogata",
  "fogón",
  "folio",
  "folleto",
  "fondo",
  "forma",
  "forro",
  "fortuna",
  "forzar",
  "fosa",
  "foto",
  "fracaso",
  "frágil",
  "franja",
  "frase",
  "fraude",
  "freír",
  "freno",
  "fresa",
  "frío",
  "frito",
  "fruta",
  "fuego",
  "fuente",
  "fuerza",
  "fuga",
  "fumar",
  "función",
  "funda",
  "furgón",
  "furia",
  "fusil",
  "fútbol",
  "futuro",
  "gacela",
  "gafas",
  "gaita",
  "gajo",
  "gala",
  "galería",
  "gallo",
  "gamba",
  "ganar",
  "gancho",
  "ganga",
  "ganso",
  "garaje",
  "garza",
  "gasolina",
  "gastar",
  "gato",
  "gavilán",
  "gemelo",
  "gemir",
  "gen",
  "género",
  "genio",
  "gente",
  "geranio",
  "gerente",
  "germen",
  "gesto",
  "gigante",
  "gimnasio",
  "girar",
  "giro",
  "glaciar",
  "globo",
  "gloria",
  "gol",
  "golfo",
  "goloso",
  "golpe",
  "goma",
  "gordo",
  "gorila",
  "gorra",
  "gota",
  "goteo",
  "gozar",
  "grada",
  "gráfico",
  "grano",
  "grasa",
  "gratis",
  "grave",
  "grieta",
  "grillo",
  "gripe",
  "gris",
  "grito",
  "grosor",
  "grúa",
  "grueso",
  "grumo",
  "grupo",
  "guante",
  "guapo",
  "guardia",
  "guerra",
  "guía",
  "guiño",
  "guion",
  "guiso",
  "guitarra",
  "gusano",
  "gustar",
  "haber",
  "hábil",
  "hablar",
  "hacer",
  "hacha",
  "hada",
  "hallar",
  "hamaca",
  "harina",
  "haz",
  "hazaña",
  "hebilla",
  "hebra",
  "hecho",
  "helado",
  "helio",
  "hembra",
  "herir",
  "hermano",
  "héroe",
  "hervir",
  "hielo",
  "hierro",
  "hígado",
  "higiene",
  "hijo",
  "himno",
  "historia",
  "hocico",
  "hogar",
  "hoguera",
  "hoja",
  "hombre",
  "hongo",
  "honor",
  "honra",
  "hora",
  "hormiga",
  "horno",
  "hostil",
  "hoyo",
  "hueco",
  "huelga",
  "huerta",
  "hueso",
  "huevo",
  "huida",
  "huir",
  "humano",
  "húmedo",
  "humilde",
  "humo",
  "hundir",
  "huracán",
  "hurto",
  "icono",
  "ideal",
  "idioma",
  "ídolo",
  "iglesia",
  "iglú",
  "igual",
  "ilegal",
  "ilusión",
  "imagen",
  "imán",
  "imitar",
  "impar",
  "imperio",
  "imponer",
  "impulso",
  "incapaz",
  "índice",
  "inerte",
  "infiel",
  "informe",
  "ingenio",
  "inicio",
  "inmenso",
  "inmune",
  "innato",
  "insecto",
  "instante",
  "interés",
  "íntimo",
  "intuir",
  "inútil",
  "invierno",
  "ira",
  "iris",
  "ironía",
  "isla",
  "islote",
  "jabalí",
  "jabón",
  "jamón",
  "jarabe",
  "jardín",
  "jarra",
  "jaula",
  "jazmín",
  "jefe",
  "jeringa",
  "jinete",
  "jornada",
  "joroba",
  "joven",
  "joya",
  "juerga",
  "jueves",
  "juez",
  "jugador",
  "jugo",
  "juguete",
  "juicio",
  "junco",
  "jungla",
  "junio",
  "juntar",
  "júpiter",
  "jurar",
  "justo",
  "juvenil",
  "juzgar",
  "kilo",
  "koala",
  "labio",
  "lacio",
  "lacra",
  "lado",
  "ladrón",
  "lagarto",
  "lágrima",
  "laguna",
  "laico",
  "lamer",
  "lámina",
  "lámpara",
  "lana",
  "lancha",
  "langosta",
  "lanza",
  "lápiz",
  "largo",
  "larva",
  "lástima",
  "lata",
  "látex",
  "latir",
  "laurel",
  "lavar",
  "lazo",
  "leal",
  "lección",
  "leche",
  "lector",
  "leer",
  "legión",
  "legumbre",
  "lejano",
  "lengua",
  "lento",
  "leña",
  "león",
  "leopardo",
  "lesión",
  "letal",
  "letra",
  "leve",
  "leyenda",
  "libertad",
  "libro",
  "licor",
  "líder",
  "lidiar",
  "lienzo",
  "liga",
  "ligero",
  "lima",
  "límite",
  "limón",
  "limpio",
  "lince",
  "lindo",
  "línea",
  "lingote",
  "lino",
  "linterna",
  "líquido",
  "liso",
  "lista",
  "litera",
  "litio",
  "litro",
  "llaga",
  "llama",
  "llanto",
  "llave",
  "llegar",
  "llenar",
  "llevar",
  "llorar",
  "llover",
  "lluvia",
  "lobo",
  "loción",
  "loco",
  "locura",
  "lógica",
  "logro",
  "lombriz",
  "lomo",
  "lonja",
  "lote",
  "lucha",
  "lucir",
  "lugar",
  "lujo",
  "luna",
  "lunes",
  "lupa",
  "lustro",
  "luto",
  "luz",
  "maceta",
  "macho",
  "madera",
  "madre",
  "maduro",
  "maestro",
  "mafia",
  "magia",
  "mago",
  "maíz",
  "maldad",
  "maleta",
  "malla",
  "malo",
  "mamá",
  "mambo",
  "mamut",
  "manco",
  "mando",
  "manejar",
  "manga",
  "maniquí",
  "manjar",
  "mano",
  "manso",
  "manta",
  "mañana",
  "mapa",
  "máquina",
  "mar",
  "marco",
  "marea",
  "marfil",
  "margen",
  "marido",
  "mármol",
  "marrón",
  "martes",
  "marzo",
  "masa",
  "máscara",
  "masivo",
  "matar",
  "materia",
  "matiz",
  "matriz",
  "máximo",
  "mayor",
  "mazorca",
  "mecha",
  "medalla",
  "medio",
  "médula",
  "mejilla",
  "mejor",
  "melena",
  "melón",
  "memoria",
  "menor",
  "mensaje",
  "mente",
  "menú",
  "mercado",
  "merengue",
  "mérito",
  "mes",
  "mesón",
  "meta",
  "meter",
  "método",
  "metro",
  "mezcla",
  "miedo",
  "miel",
  "miembro",
  "miga",
  "mil",
  "milagro",
  "militar",
  "millón",
  "mimo",
  "mina",
  "minero",
  "mínimo",
  "minuto",
  "miope",
  "mirar",
  "misa",
  "miseria",
  "misil",
  "mismo",
  "mitad",
  "mito",
  "mochila",
  "moción",
  "moda",
  "modelo",
  "moho",
  "mojar",
  "molde",
  "moler",
  "molino",
  "momento",
  "momia",
  "monarca",
  "moneda",
  "monja",
  "monto",
  "moño",
  "morada",
  "morder",
  "moreno",
  "morir",
  "morro",
  "morsa",
  "mortal",
  "mosca",
  "mostrar",
  "motivo",
  "mover",
  "móvil",
  "mozo",
  "mucho",
  "mudar",
  "mueble",
  "muela",
  "muerte",
  "muestra",
  "mugre",
  "mujer",
  "mula",
  "muleta",
  "multa",
  "mundo",
  "muñeca",
  "mural",
  "muro",
  "músculo",
  "museo",
  "musgo",
  "música",
  "muslo",
  "nácar",
  "nación",
  "nadar",
  "naipe",
  "naranja",
  "nariz",
  "narrar",
  "nasal",
  "natal",
  "nativo",
  "natural",
  "náusea",
  "naval",
  "nave",
  "navidad",
  "necio",
  "néctar",
  "negar",
  "negocio",
  "negro",
  "neón",
  "nervio",
  "neto",
  "neutro",
  "nevar",
  "nevera",
  "nicho",
  "nido",
  "niebla",
  "nieto",
  "niñez",
  "niño",
  "nítido",
  "nivel",
  "nobleza",
  "noche",
  "nómina",
  "noria",
  "norma",
  "norte",
  "nota",
  "noticia",
  "novato",
  "novela",
  "novio",
  "nube",
  "nuca",
  "núcleo",
  "nudillo",
  "nudo",
  "nuera",
  "nueve",
  "nuez",
  "nulo",
  "número",
  "nutria",
  "oasis",
  "obeso",
  "obispo",
  "objeto",
  "obra",
  "obrero",
  "observar",
  "obtener",
  "obvio",
  "oca",
  "ocaso",
  "océano",
  "ochenta",
  "ocho",
  "ocio",
  "ocre",
  "octavo",
  "octubre",
  "oculto",
  "ocupar",
  "ocurrir",
  "odiar",
  "odio",
  "odisea",
  "oeste",
  "ofensa",
  "oferta",
  "oficio",
  "ofrecer",
  "ogro",
  "oído",
  "oír",
  "ojo",
  "ola",
  "oleada",
  "olfato",
  "olivo",
  "olla",
  "olmo",
  "olor",
  "olvido",
  "ombligo",
  "onda",
  "onza",
  "opaco",
  "opción",
  "ópera",
  "opinar",
  "oponer",
  "optar",
  "óptica",
  "opuesto",
  "oración",
  "orador",
  "oral",
  "órbita",
  "orca",
  "orden",
  "oreja",
  "órgano",
  "orgía",
  "orgullo",
  "oriente",
  "origen",
  "orilla",
  "oro",
  "orquesta",
  "oruga",
  "osadía",
  "oscuro",
  "osezno",
  "oso",
  "ostra",
  "otoño",
  "otro",
  "oveja",
  "óvulo",
  "óxido",
  "oxígeno",
  "oyente",
  "ozono",
  "pacto",
  "padre",
  "paella",
  "página",
  "pago",
  "país",
  "pájaro",
  "palabra",
  "palco",
  "paleta",
  "pálido",
  "palma",
  "paloma",
  "palpar",
  "pan",
  "panal",
  "pánico",
  "pantera",
  "pañuelo",
  "papá",
  "papel",
  "papilla",
  "paquete",
  "parar",
  "parcela",
  "pared",
  "parir",
  "paro",
  "párpado",
  "parque",
  "párrafo",
  "parte",
  "pasar",
  "paseo",
  "pasión",
  "paso",
  "pasta",
  "pata",
  "patio",
  "patria",
  "pausa",
  "pauta",
  "pavo",
  "payaso",
  "peatón",
  "pecado",
  "pecera",
  "pecho",
  "pedal",
  "pedir",
  "pegar",
  "peine",
  "pelar",
  "peldaño",
  "pelea",
  "peligro",
  "pellejo",
  "pelo",
  "peluca",
  "pena",
  "pensar",
  "peñón",
  "peón",
  "peor",
  "pepino",
  "pequeño",
  "pera",
  "percha",
  "perder",
  "pereza",
  "perfil",
  "perico",
  "perla",
  "permiso",
  "perro",
  "persona",
  "pesa",
  "pesca",
  "pésimo",
  "pestaña",
  "pétalo",
  "petróleo",
  "pez",
  "pezuña",
  "picar",
  "pichón",
  "pie",
  "piedra",
  "pierna",
  "pieza",
  "pijama",
  "pilar",
  "piloto",
  "pimienta",
  "pino",
  "pintor",
  "pinza",
  "piña",
  "piojo",
  "pipa",
  "pirata",
  "pisar",
  "piscina",
  "piso",
  "pista",
  "pitón",
  "pizca",
  "placa",
  "plan",
  "plata",
  "playa",
  "plaza",
  "pleito",
  "pleno",
  "plomo",
  "pluma",
  "plural",
  "pobre",
  "poco",
  "poder",
  "podio",
  "poema",
  "poesía",
  "poeta",
  "polen",
  "policía",
  "pollo",
  "polvo",
  "pomada",
  "pomelo",
  "pomo",
  "pompa",
  "poner",
  "porción",
  "portal",
  "posada",
  "poseer",
  "posible",
  "poste",
  "potencia",
  "potro",
  "pozo",
  "prado",
  "precoz",
  "pregunta",
  "premio",
  "prensa",
  "preso",
  "previo",
  "primo",
  "príncipe",
  "prisión",
  "privar",
  "proa",
  "probar",
  "proceso",
  "producto",
  "proeza",
  "profesor",
  "programa",
  "prole",
  "promesa",
  "pronto",
  "propio",
  "próximo",
  "prueba",
  "público",
  "puchero",
  "pudor",
  "pueblo",
  "puerta",
  "puesto",
  "pulga",
  "pulir",
  "pulmón",
  "pulpo",
  "pulso",
  "puma",
  "punto",
  "puñal",
  "puño",
  "pupa",
  "pupila",
  "puré",
  "quedar",
  "queja",
  "quemar",
  "querer",
  "queso",
  "quieto",
  "química",
  "quince",
  "quitar",
  "rábano",
  "rabia",
  "rabo",
  "ración",
  "radical",
  "raíz",
  "rama",
  "rampa",
  "rancho",
  "rango",
  "rapaz",
  "rápido",
  "rapto",
  "rasgo",
  "raspa",
  "rato",
  "rayo",
  "raza",
  "razón",
  "reacción",
  "realidad",
  "rebaño",
  "rebote",
  "recaer",
  "receta",
  "rechazo",
  "recoger",
  "recreo",
  "recto",
  "recurso",
  "red",
  "redondo",
  "reducir",
  "reflejo",
  "reforma",
  "refrán",
  "refugio",
  "regalo",
  "regir",
  "regla",
  "regreso",
  "rehén",
  "reino",
  "reír",
  "reja",
  "relato",
  "relevo",
  "relieve",
  "relleno",
  "reloj",
  "remar",
  "remedio",
  "remo",
  "rencor",
  "rendir",
  "renta",
  "reparto",
  "repetir",
  "reposo",
  "reptil",
  "res",
  "rescate",
  "resina",
  "respeto",
  "resto",
  "resumen",
  "retiro",
  "retorno",
  "retrato",
  "reunir",
  "revés",
  "revista",
  "rey",
  "rezar",
  "rico",
  "riego",
  "rienda",
  "riesgo",
  "rifa",
  "rígido",
  "rigor",
  "rincón",
  "riñón",
  "río",
  "riqueza",
  "risa",
  "ritmo",
  "rito",
  "rizo",
  "roble",
  "roce",
  "rociar",
  "rodar",
  "rodeo",
  "rodilla",
  "roer",
  "rojizo",
  "rojo",
  "romero",
  "romper",
  "ron",
  "ronco",
  "ronda",
  "ropa",
  "ropero",
  "rosa",
  "rosca",
  "rostro",
  "rotar",
  "rubí",
  "rubor",
  "rudo",
  "rueda",
  "rugir",
  "ruido",
  "ruina",
  "ruleta",
  "rulo",
  "rumbo",
  "rumor",
  "ruptura",
  "ruta",
  "rutina",
  "sábado",
  "saber",
  "sabio",
  "sable",
  "sacar",
  "sagaz",
  "sagrado",
  "sala",
  "saldo",
  "salero",
  "salir",
  "salmón",
  "salón",
  "salsa",
  "salto",
  "salud",
  "salvar",
  "samba",
  "sanción",
  "sandía",
  "sanear",
  "sangre",
  "sanidad",
  "sano",
  "santo",
  "sapo",
  "saque",
  "sardina",
  "sartén",
  "sastre",
  "satán",
  "sauna",
  "saxofón",
  "sección",
  "seco",
  "secreto",
  "secta",
  "sed",
  "seguir",
  "seis",
  "sello",
  "selva",
  "semana",
  "semilla",
  "senda",
  "sensor",
  "señal",
  "señor",
  "separar",
  "sepia",
  "sequía",
  "ser",
  "serie",
  "sermón",
  "servir",
  "sesenta",
  "sesión",
  "seta",
  "setenta",
  "severo",
  "sexo",
  "sexto",
  "sidra",
  "siesta",
  "siete",
  "siglo",
  "signo",
  "sílaba",
  "silbar",
  "silencio",
  "silla",
  "símbolo",
  "simio",
  "sirena",
  "sistema",
  "sitio",
  "situar",
  "sobre",
  "socio",
  "sodio",
  "sol",
  "solapa",
  "soldado",
  "soledad",
  "sólido",
  "soltar",
  "solución",
  "sombra",
  "sondeo",
  "sonido",
  "sonoro",
  "sonrisa",
  "sopa",
  "soplar",
  "soporte",
  "sordo",
  "sorpresa",
  "sorteo",
  "sostén",
  "sótano",
  "suave",
  "subir",
  "suceso",
  "sudor",
  "suegra",
  "suelo",
  "sueño",
  "suerte",
  "sufrir",
  "sujeto",
  "sultán",
  "sumar",
  "superar",
  "suplir",
  "suponer",
  "supremo",
  "sur",
  "surco",
  "sureño",
  "surgir",
  "susto",
  "sutil",
  "tabaco",
  "tabique",
  "tabla",
  "tabú",
  "taco",
  "tacto",
  "tajo",
  "talar",
  "talco",
  "talento",
  "talla",
  "talón",
  "tamaño",
  "tambor",
  "tango",
  "tanque",
  "tapa",
  "tapete",
  "tapia",
  "tapón",
  "taquilla",
  "tarde",
  "tarea",
  "tarifa",
  "tarjeta",
  "tarot",
  "tarro",
  "tarta",
  "tatuaje",
  "tauro",
  "taza",
  "tazón",
  "teatro",
  "techo",
  "tecla",
  "técnica",
  "tejado",
  "tejer",
  "tejido",
  "tela",
  "teléfono",
  "tema",
  "temor",
  "templo",
  "tenaz",
  "tender",
  "tener",
  "tenis",
  "tenso",
  "teoría",
  "terapia",
  "terco",
  "término",
  "ternura",
  "terror",
  "tesis",
  "tesoro",
  "testigo",
  "tetera",
  "texto",
  "tez",
  "tibio",
  "tiburón",
  "tiempo",
  "tienda",
  "tierra",
  "tieso",
  "tigre",
  "tijera",
  "tilde",
  "timbre",
  "tímido",
  "timo",
  "tinta",
  "tío",
  "típico",
  "tipo",
  "tira",
  "tirón",
  "titán",
  "títere",
  "título",
  "tiza",
  "toalla",
  "tobillo",
  "tocar",
  "tocino",
  "todo",
  "toga",
  "toldo",
  "tomar",
  "tono",
  "tonto",
  "topar",
  "tope",
  "toque",
  "tórax",
  "torero",
  "tormenta",
  "torneo",
  "toro",
  "torpedo",
  "torre",
  "torso",
  "tortuga",
  "tos",
  "tosco",
  "toser",
  "tóxico",
  "trabajo",
  "tractor",
  "traer",
  "tráfico",
  "trago",
  "traje",
  "tramo",
  "trance",
  "trato",
  "trauma",
  "trazar",
  "trébol",
  "tregua",
  "treinta",
  "tren",
  "trepar",
  "tres",
  "tribu",
  "trigo",
  "tripa",
  "triste",
  "triunfo",
  "trofeo",
  "trompa",
  "tronco",
  "tropa",
  "trote",
  "trozo",
  "truco",
  "trueno",
  "trufa",
  "tubería",
  "tubo",
  "tuerto",
  "tumba",
  "tumor",
  "túnel",
  "túnica",
  "turbina",
  "turismo",
  "turno",
  "tutor",
  "ubicar",
  "úlcera",
  "umbral",
  "unidad",
  "unir",
  "universo",
  "uno",
  "untar",
  "uña",
  "urbano",
  "urbe",
  "urgente",
  "urna",
  "usar",
  "usuario",
  "útil",
  "utopía",
  "uva",
  "vaca",
  "vacío",
  "vacuna",
  "vagar",
  "vago",
  "vaina",
  "vajilla",
  "vale",
  "válido",
  "valle",
  "valor",
  "válvula",
  "vampiro",
  "vara",
  "variar",
  "varón",
  "vaso",
  "vecino",
  "vector",
  "vehículo",
  "veinte",
  "vejez",
  "vela",
  "velero",
  "veloz",
  "vena",
  "vencer",
  "venda",
  "veneno",
  "vengar",
  "venir",
  "venta",
  "venus",
  "ver",
  "verano",
  "verbo",
  "verde",
  "vereda",
  "verja",
  "verso",
  "verter",
  "vía",
  "viaje",
  "vibrar",
  "vicio",
  "víctima",
  "vida",
  "vídeo",
  "vidrio",
  "viejo",
  "viernes",
  "vigor",
  "vil",
  "villa",
  "vinagre",
  "vino",
  "viñedo",
  "violín",
  "viral",
  "virgo",
  "virtud",
  "visor",
  "víspera",
  "vista",
  "vitamina",
  "viudo",
  "vivaz",
  "vivero",
  "vivir",
  "vivo",
  "volcán",
  "volumen",
  "volver",
  "voraz",
  "votar",
  "voto",
  "voz",
  "vuelo",
  "vulgar",
  "yacer",
  "yate",
  "yegua",
  "yema",
  "yerno",
  "yeso",
  "yodo",
  "yoga",
  "yogur",
  "zafiro",
  "zanja",
  "zapato",
  "zarza",
  "zona",
  "zorro",
  "zumo",
  "zurdo"
]

},{}],38:[function(reqqqqq,module,exports){
var Buffer = reqqqqq('safe-buffer').Buffer
var Transform = reqqqqq('stream').Transform
var StringDecoder = reqqqqq('string_decoder').StringDecoder
var inherits = reqqqqq('inherits')

function CipherBase (hashMode) {
  Transform.call(this)
  this.hashMode = typeof hashMode === 'string'
  if (this.hashMode) {
    this[hashMode] = this._finalOrDigest
  } else {
    this.final = this._finalOrDigest
  }
  if (this._final) {
    this.__final = this._final
    this._final = null
  }
  this._decoder = null
  this._encoding = null
}
inherits(CipherBase, Transform)

CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = Buffer.from(data, inputEnc)
  }

  var outData = this._update(data)
  if (this.hashMode) return this

  if (outputEnc) {
    outData = this._toString(outData, outputEnc)
  }

  return outData
}

CipherBase.prototype.setAutoPadding = function () {}
CipherBase.prototype.getAuthTag = function () {
  throw new Error('trying to get auth tag in unsupported state')
}

CipherBase.prototype.setAuthTag = function () {
  throw new Error('trying to set auth tag in unsupported state')
}

CipherBase.prototype.setAAD = function () {
  throw new Error('trying to set aad in unsupported state')
}

CipherBase.prototype._transform = function (data, _, next) {
  var err
  try {
    if (this.hashMode) {
      this._update(data)
    } else {
      this.push(this._update(data))
    }
  } catch (e) {
    err = e
  } finally {
    next(err)
  }
}
CipherBase.prototype._flush = function (done) {
  var err
  try {
    this.push(this.__final())
  } catch (e) {
    err = e
  }

  done(err)
}
CipherBase.prototype._finalOrDigest = function (outputEnc) {
  var outData = this.__final() || Buffer.alloc(0)
  if (outputEnc) {
    outData = this._toString(outData, outputEnc, true)
  }
  return outData
}

CipherBase.prototype._toString = function (value, enc, fin) {
  if (!this._decoder) {
    this._decoder = new StringDecoder(enc)
    this._encoding = enc
  }

  if (this._encoding !== enc) throw new Error('can\'t switch encodings')

  var out = this._decoder.write(value)
  if (fin) {
    out += this._decoder.end()
  }

  return out
}

module.exports = CipherBase

},{"inherits":43,"safe-buffer":51,"stream":26,"string_decoder":27}],39:[function(reqqqqq,module,exports){
(function (Buffer){
'use strict'
var inherits = reqqqqq('inherits')
var md5 = reqqqqq('./md5')
var RIPEMD160 = reqqqqq('ripemd160')
var sha = reqqqqq('sha.js')

var Base = reqqqqq('cipher-base')

function HashNoConstructor (hash) {
  Base.call(this, 'digest')

  this._hash = hash
  this.buffers = []
}

inherits(HashNoConstructor, Base)

HashNoConstructor.prototype._update = function (data) {
  this.buffers.push(data)
}

HashNoConstructor.prototype._final = function () {
  var buf = Buffer.concat(this.buffers)
  var r = this._hash(buf)
  this.buffers = null

  return r
}

function Hash (hash) {
  Base.call(this, 'digest')

  this._hash = hash
}

inherits(Hash, Base)

Hash.prototype._update = function (data) {
  this._hash.update(data)
}

Hash.prototype._final = function () {
  return this._hash.digest()
}

module.exports = function createHash (alg) {
  alg = alg.toLowerCase()
  if (alg === 'md5') return new HashNoConstructor(md5)
  if (alg === 'rmd160' || alg === 'ripemd160') return new Hash(new RIPEMD160())

  return new Hash(sha(alg))
}

}).call(this,reqqqqq("buffer").Buffer)
},{"./md5":41,"buffer":3,"cipher-base":38,"inherits":43,"ripemd160":50,"sha.js":53}],40:[function(reqqqqq,module,exports){
(function (Buffer){
'use strict'
var intSize = 4
var zeroBuffer = new Buffer(intSize)
zeroBuffer.fill(0)

var charSize = 8
var hashSize = 16

function toArray (buf) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize))
    buf = Buffer.concat([buf, zeroBuffer], len)
  }

  var arr = new Array(buf.length >>> 2)
  for (var i = 0, j = 0; i < buf.length; i += intSize, j++) {
    arr[j] = buf.readInt32LE(i)
  }

  return arr
}

module.exports = function hash (buf, fn) {
  var arr = fn(toArray(buf), buf.length * charSize)
  buf = new Buffer(hashSize)
  for (var i = 0; i < arr.length; i++) {
    buf.writeInt32LE(arr[i], i << 2, true)
  }
  return buf
}

}).call(this,reqqqqq("buffer").Buffer)
},{"buffer":3}],41:[function(reqqqqq,module,exports){
'use strict'
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var makeHash = reqqqqq('./make-hash')

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5 (x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32)
  x[(((len + 64) >>> 9) << 4) + 14] = len

  var a = 1732584193
  var b = -271733879
  var c = -1732584194
  var d = 271733878

  for (var i = 0; i < x.length; i += 16) {
    var olda = a
    var oldb = b
    var oldc = c
    var oldd = d

    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936)
    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302)
    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222)
    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844)
    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

    a = safe_add(a, olda)
    b = safe_add(b, oldb)
    c = safe_add(c, oldc)
    d = safe_add(d, oldd)
  }

  return [a, b, c, d]
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn (q, a, b, x, s, t) {
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
}

function md5_ff (a, b, c, d, x, s, t) {
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function md5_gg (a, b, c, d, x, s, t) {
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function md5_hh (a, b, c, d, x, s, t) {
  return md5_cmn(b ^ c ^ d, a, b, x, s, t)
}

function md5_ii (a, b, c, d, x, s, t) {
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add (x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF)
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
  return (msw << 16) | (lsw & 0xFFFF)
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol (num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt))
}

module.exports = function md5 (buf) {
  return makeHash(buf, core_md5)
}

},{"./make-hash":40}],42:[function(reqqqqq,module,exports){
(function (Buffer){
'use strict'
var Transform = reqqqqq('stream').Transform
var inherits = reqqqqq('inherits')

function HashBase (blockSize) {
  Transform.call(this)

  this._block = new Buffer(blockSize)
  this._blockSize = blockSize
  this._blockOffset = 0
  this._length = [0, 0, 0, 0]

  this._finalized = false
}

inherits(HashBase, Transform)

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null
  try {
    if (encoding !== 'buffer') chunk = new Buffer(chunk, encoding)
    this.update(chunk)
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype._flush = function (callback) {
  var error = null
  try {
    this.push(this._digest())
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype.update = function (data, encoding) {
  if (!Buffer.isBuffer(data) && typeof data !== 'string') throw new TypeError('Data must be a string or a buffer')
  if (this._finalized) throw new Error('Digest already called')
  if (!Buffer.isBuffer(data)) data = new Buffer(data, encoding || 'binary')

  // consume data
  var block = this._block
  var offset = 0
  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++]
    this._update()
    this._blockOffset = 0
  }
  while (offset < data.length) block[this._blockOffset++] = data[offset++]

  // update length
  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry
    carry = (this._length[j] / 0x0100000000) | 0
    if (carry > 0) this._length[j] -= 0x0100000000 * carry
  }

  return this
}

HashBase.prototype._update = function (data) {
  throw new Error('_update is not implemented')
}

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called')
  this._finalized = true

  var digest = this._digest()
  if (encoding !== undefined) digest = digest.toString(encoding)
  return digest
}

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented')
}

module.exports = HashBase

}).call(this,reqqqqq("buffer").Buffer)
},{"buffer":3,"inherits":43,"stream":26}],43:[function(reqqqqq,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],44:[function(reqqqqq,module,exports){

exports.pbkdf2 = reqqqqq('./lib/async')

exports.pbkdf2Sync = reqqqqq('./lib/sync')

},{"./lib/async":45,"./lib/sync":48}],45:[function(reqqqqq,module,exports){
(function (process,global){
var checkParameters = reqqqqq('./precondition')
var defaultEncoding = reqqqqq('./default-encoding')
var sync = reqqqqq('./sync')
var Buffer = reqqqqq('safe-buffer').Buffer

var ZERO_BUF
var subtle = global.crypto && global.crypto.subtle
var toBrowser = {
  'sha': 'SHA-1',
  'sha-1': 'SHA-1',
  'sha1': 'SHA-1',
  'sha256': 'SHA-256',
  'sha-256': 'SHA-256',
  'sha384': 'SHA-384',
  'sha-384': 'SHA-384',
  'sha-512': 'SHA-512',
  'sha512': 'SHA-512'
}
var checks = []
function checkNative (algo) {
  if (global.process && !global.process.browser) {
    return Promise.resolve(false)
  }
  if (!subtle || !subtle.importKey || !subtle.deriveBits) {
    return Promise.resolve(false)
  }
  if (checks[algo] !== undefined) {
    return checks[algo]
  }
  ZERO_BUF = ZERO_BUF || Buffer.alloc(8)
  var prom = browserPbkdf2(ZERO_BUF, ZERO_BUF, 10, 128, algo)
    .then(function () {
      return true
    }).catch(function () {
      return false
    })
  checks[algo] = prom
  return prom
}
function browserPbkdf2 (password, salt, iterations, length, algo) {
  return subtle.importKey(
    'raw', password, {name: 'PBKDF2'}, false, ['deriveBits']
  ).then(function (key) {
    return subtle.deriveBits({
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: {
        name: algo
      }
    }, key, length << 3)
  }).then(function (res) {
    return Buffer.from(res)
  })
}
function resolvePromise (promise, callback) {
  promise.then(function (out) {
    process.nextTick(function () {
      callback(null, out)
    })
  }, function (e) {
    process.nextTick(function () {
      callback(e)
    })
  })
}
module.exports = function (password, salt, iterations, keylen, digest, callback) {
  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding)
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding)

  checkParameters(iterations, keylen)
  if (typeof digest === 'function') {
    callback = digest
    digest = undefined
  }
  if (typeof callback !== 'function') throw new Error('No callback provided to pbkdf2')

  digest = digest || 'sha1'
  var algo = toBrowser[digest.toLowerCase()]
  if (!algo || typeof global.Promise !== 'function') {
    return process.nextTick(function () {
      var out
      try {
        out = sync(password, salt, iterations, keylen, digest)
      } catch (e) {
        return callback(e)
      }
      callback(null, out)
    })
  }
  resolvePromise(checkNative(algo).then(function (resp) {
    if (resp) {
      return browserPbkdf2(password, salt, iterations, keylen, algo)
    } else {
      return sync(password, salt, iterations, keylen, digest)
    }
  }), callback)
}

}).call(this,reqqqqq('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./default-encoding":46,"./precondition":47,"./sync":48,"_process":11,"safe-buffer":51}],46:[function(reqqqqq,module,exports){
(function (process){
var defaultEncoding
/* istanbul ignore next */
if (process.browser) {
  defaultEncoding = 'utf-8'
} else {
  var pVersionMajor = parseInt(process.version.split('.')[0].slice(1), 10)

  defaultEncoding = pVersionMajor >= 6 ? 'utf-8' : 'binary'
}
module.exports = defaultEncoding

}).call(this,reqqqqq('_process'))
},{"_process":11}],47:[function(reqqqqq,module,exports){
var MAX_ALLOC = Math.pow(2, 30) - 1 // default in iojs
module.exports = function (iterations, keylen) {
  if (typeof iterations !== 'number') {
    throw new TypeError('Iterations not a number')
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations')
  }

  if (typeof keylen !== 'number') {
    throw new TypeError('Key length not a number')
  }

  if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen) { /* eslint no-self-compare: 0 */
    throw new TypeError('Bad key length')
  }
}

},{}],48:[function(reqqqqq,module,exports){
var md5 = reqqqqq('create-hash/md5')
var rmd160 = reqqqqq('ripemd160')
var sha = reqqqqq('sha.js')

var checkParameters = reqqqqq('./precondition')
var defaultEncoding = reqqqqq('./default-encoding')
var Buffer = reqqqqq('safe-buffer').Buffer
var ZEROS = Buffer.alloc(128)
var sizes = {
  md5: 16,
  sha1: 20,
  sha224: 28,
  sha256: 32,
  sha384: 48,
  sha512: 64,
  rmd160: 20,
  ripemd160: 20
}

function Hmac (alg, key, saltLen) {
  var hash = getDigest(alg)
  var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64

  if (key.length > blocksize) {
    key = hash(key)
  } else if (key.length < blocksize) {
    key = Buffer.concat([key, ZEROS], blocksize)
  }

  var ipad = Buffer.allocUnsafe(blocksize + sizes[alg])
  var opad = Buffer.allocUnsafe(blocksize + sizes[alg])
  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  var ipad1 = Buffer.allocUnsafe(blocksize + saltLen + 4)
  ipad.copy(ipad1, 0, 0, blocksize)
  this.ipad1 = ipad1
  this.ipad2 = ipad
  this.opad = opad
  this.alg = alg
  this.blocksize = blocksize
  this.hash = hash
  this.size = sizes[alg]
}

Hmac.prototype.run = function (data, ipad) {
  data.copy(ipad, this.blocksize)
  var h = this.hash(ipad)
  h.copy(this.opad, this.blocksize)
  return this.hash(this.opad)
}

function getDigest (alg) {
  function shaFunc (data) {
    return sha(alg).update(data).digest()
  }

  if (alg === 'rmd160' || alg === 'ripemd160') return rmd160
  if (alg === 'md5') return md5
  return shaFunc
}

function pbkdf2 (password, salt, iterations, keylen, digest) {
  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding)
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding)

  checkParameters(iterations, keylen)

  digest = digest || 'sha1'

  var hmac = new Hmac(digest, password, salt.length)

  var DK = Buffer.allocUnsafe(keylen)
  var block1 = Buffer.allocUnsafe(salt.length + 4)
  salt.copy(block1, 0, 0, salt.length)

  var destPos = 0
  var hLen = sizes[digest]
  var l = Math.ceil(keylen / hLen)

  for (var i = 1; i <= l; i++) {
    block1.writeUInt32BE(i, salt.length)

    var T = hmac.run(block1, hmac.ipad1)
    var U = T

    for (var j = 1; j < iterations; j++) {
      U = hmac.run(U, hmac.ipad2)
      for (var k = 0; k < hLen; k++) T[k] ^= U[k]
    }

    T.copy(DK, destPos)
    destPos += hLen
  }

  return DK
}

module.exports = pbkdf2

},{"./default-encoding":46,"./precondition":47,"create-hash/md5":41,"ripemd160":50,"safe-buffer":51,"sha.js":53}],49:[function(reqqqqq,module,exports){
(function (process,global){
'use strict'

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = reqqqqq('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > 65536) throw new Error('requested too many random bytes')
  // in case browserify  isn't using the Uint8Array version
  var rawBytes = new global.Uint8Array(size)

  // This will not work in older browsers.
  // See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
  if (size > 0) {  // getRandomValues fails on IE if size == 0
    crypto.getRandomValues(rawBytes)
  }

  // XXX: phantomjs doesn't like a buffer being passed here
  var bytes = Buffer.from(rawBytes.buffer)

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

}).call(this,reqqqqq('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":11,"safe-buffer":51}],50:[function(reqqqqq,module,exports){
(function (Buffer){
'use strict'
var inherits = reqqqqq('inherits')
var HashBase = reqqqqq('hash-base')

function RIPEMD160 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0
}

inherits(RIPEMD160, HashBase)

RIPEMD160.prototype._update = function () {
  var m = new Array(16)
  for (var i = 0; i < 16; ++i) m[i] = this._block.readInt32LE(i * 4)

  var al = this._a
  var bl = this._b
  var cl = this._c
  var dl = this._d
  var el = this._e

  // Mj = 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
  // K = 0x00000000
  // Sj = 11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8
  al = fn1(al, bl, cl, dl, el, m[0], 0x00000000, 11); cl = rotl(cl, 10)
  el = fn1(el, al, bl, cl, dl, m[1], 0x00000000, 14); bl = rotl(bl, 10)
  dl = fn1(dl, el, al, bl, cl, m[2], 0x00000000, 15); al = rotl(al, 10)
  cl = fn1(cl, dl, el, al, bl, m[3], 0x00000000, 12); el = rotl(el, 10)
  bl = fn1(bl, cl, dl, el, al, m[4], 0x00000000, 5); dl = rotl(dl, 10)
  al = fn1(al, bl, cl, dl, el, m[5], 0x00000000, 8); cl = rotl(cl, 10)
  el = fn1(el, al, bl, cl, dl, m[6], 0x00000000, 7); bl = rotl(bl, 10)
  dl = fn1(dl, el, al, bl, cl, m[7], 0x00000000, 9); al = rotl(al, 10)
  cl = fn1(cl, dl, el, al, bl, m[8], 0x00000000, 11); el = rotl(el, 10)
  bl = fn1(bl, cl, dl, el, al, m[9], 0x00000000, 13); dl = rotl(dl, 10)
  al = fn1(al, bl, cl, dl, el, m[10], 0x00000000, 14); cl = rotl(cl, 10)
  el = fn1(el, al, bl, cl, dl, m[11], 0x00000000, 15); bl = rotl(bl, 10)
  dl = fn1(dl, el, al, bl, cl, m[12], 0x00000000, 6); al = rotl(al, 10)
  cl = fn1(cl, dl, el, al, bl, m[13], 0x00000000, 7); el = rotl(el, 10)
  bl = fn1(bl, cl, dl, el, al, m[14], 0x00000000, 9); dl = rotl(dl, 10)
  al = fn1(al, bl, cl, dl, el, m[15], 0x00000000, 8); cl = rotl(cl, 10)

  // Mj = 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8
  // K = 0x5a827999
  // Sj = 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12
  el = fn2(el, al, bl, cl, dl, m[7], 0x5a827999, 7); bl = rotl(bl, 10)
  dl = fn2(dl, el, al, bl, cl, m[4], 0x5a827999, 6); al = rotl(al, 10)
  cl = fn2(cl, dl, el, al, bl, m[13], 0x5a827999, 8); el = rotl(el, 10)
  bl = fn2(bl, cl, dl, el, al, m[1], 0x5a827999, 13); dl = rotl(dl, 10)
  al = fn2(al, bl, cl, dl, el, m[10], 0x5a827999, 11); cl = rotl(cl, 10)
  el = fn2(el, al, bl, cl, dl, m[6], 0x5a827999, 9); bl = rotl(bl, 10)
  dl = fn2(dl, el, al, bl, cl, m[15], 0x5a827999, 7); al = rotl(al, 10)
  cl = fn2(cl, dl, el, al, bl, m[3], 0x5a827999, 15); el = rotl(el, 10)
  bl = fn2(bl, cl, dl, el, al, m[12], 0x5a827999, 7); dl = rotl(dl, 10)
  al = fn2(al, bl, cl, dl, el, m[0], 0x5a827999, 12); cl = rotl(cl, 10)
  el = fn2(el, al, bl, cl, dl, m[9], 0x5a827999, 15); bl = rotl(bl, 10)
  dl = fn2(dl, el, al, bl, cl, m[5], 0x5a827999, 9); al = rotl(al, 10)
  cl = fn2(cl, dl, el, al, bl, m[2], 0x5a827999, 11); el = rotl(el, 10)
  bl = fn2(bl, cl, dl, el, al, m[14], 0x5a827999, 7); dl = rotl(dl, 10)
  al = fn2(al, bl, cl, dl, el, m[11], 0x5a827999, 13); cl = rotl(cl, 10)
  el = fn2(el, al, bl, cl, dl, m[8], 0x5a827999, 12); bl = rotl(bl, 10)

  // Mj = 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12
  // K = 0x6ed9eba1
  // Sj = 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5
  dl = fn3(dl, el, al, bl, cl, m[3], 0x6ed9eba1, 11); al = rotl(al, 10)
  cl = fn3(cl, dl, el, al, bl, m[10], 0x6ed9eba1, 13); el = rotl(el, 10)
  bl = fn3(bl, cl, dl, el, al, m[14], 0x6ed9eba1, 6); dl = rotl(dl, 10)
  al = fn3(al, bl, cl, dl, el, m[4], 0x6ed9eba1, 7); cl = rotl(cl, 10)
  el = fn3(el, al, bl, cl, dl, m[9], 0x6ed9eba1, 14); bl = rotl(bl, 10)
  dl = fn3(dl, el, al, bl, cl, m[15], 0x6ed9eba1, 9); al = rotl(al, 10)
  cl = fn3(cl, dl, el, al, bl, m[8], 0x6ed9eba1, 13); el = rotl(el, 10)
  bl = fn3(bl, cl, dl, el, al, m[1], 0x6ed9eba1, 15); dl = rotl(dl, 10)
  al = fn3(al, bl, cl, dl, el, m[2], 0x6ed9eba1, 14); cl = rotl(cl, 10)
  el = fn3(el, al, bl, cl, dl, m[7], 0x6ed9eba1, 8); bl = rotl(bl, 10)
  dl = fn3(dl, el, al, bl, cl, m[0], 0x6ed9eba1, 13); al = rotl(al, 10)
  cl = fn3(cl, dl, el, al, bl, m[6], 0x6ed9eba1, 6); el = rotl(el, 10)
  bl = fn3(bl, cl, dl, el, al, m[13], 0x6ed9eba1, 5); dl = rotl(dl, 10)
  al = fn3(al, bl, cl, dl, el, m[11], 0x6ed9eba1, 12); cl = rotl(cl, 10)
  el = fn3(el, al, bl, cl, dl, m[5], 0x6ed9eba1, 7); bl = rotl(bl, 10)
  dl = fn3(dl, el, al, bl, cl, m[12], 0x6ed9eba1, 5); al = rotl(al, 10)

  // Mj = 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2
  // K = 0x8f1bbcdc
  // Sj = 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12
  cl = fn4(cl, dl, el, al, bl, m[1], 0x8f1bbcdc, 11); el = rotl(el, 10)
  bl = fn4(bl, cl, dl, el, al, m[9], 0x8f1bbcdc, 12); dl = rotl(dl, 10)
  al = fn4(al, bl, cl, dl, el, m[11], 0x8f1bbcdc, 14); cl = rotl(cl, 10)
  el = fn4(el, al, bl, cl, dl, m[10], 0x8f1bbcdc, 15); bl = rotl(bl, 10)
  dl = fn4(dl, el, al, bl, cl, m[0], 0x8f1bbcdc, 14); al = rotl(al, 10)
  cl = fn4(cl, dl, el, al, bl, m[8], 0x8f1bbcdc, 15); el = rotl(el, 10)
  bl = fn4(bl, cl, dl, el, al, m[12], 0x8f1bbcdc, 9); dl = rotl(dl, 10)
  al = fn4(al, bl, cl, dl, el, m[4], 0x8f1bbcdc, 8); cl = rotl(cl, 10)
  el = fn4(el, al, bl, cl, dl, m[13], 0x8f1bbcdc, 9); bl = rotl(bl, 10)
  dl = fn4(dl, el, al, bl, cl, m[3], 0x8f1bbcdc, 14); al = rotl(al, 10)
  cl = fn4(cl, dl, el, al, bl, m[7], 0x8f1bbcdc, 5); el = rotl(el, 10)
  bl = fn4(bl, cl, dl, el, al, m[15], 0x8f1bbcdc, 6); dl = rotl(dl, 10)
  al = fn4(al, bl, cl, dl, el, m[14], 0x8f1bbcdc, 8); cl = rotl(cl, 10)
  el = fn4(el, al, bl, cl, dl, m[5], 0x8f1bbcdc, 6); bl = rotl(bl, 10)
  dl = fn4(dl, el, al, bl, cl, m[6], 0x8f1bbcdc, 5); al = rotl(al, 10)
  cl = fn4(cl, dl, el, al, bl, m[2], 0x8f1bbcdc, 12); el = rotl(el, 10)

  // Mj = 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
  // K = 0xa953fd4e
  // Sj = 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
  bl = fn5(bl, cl, dl, el, al, m[4], 0xa953fd4e, 9); dl = rotl(dl, 10)
  al = fn5(al, bl, cl, dl, el, m[0], 0xa953fd4e, 15); cl = rotl(cl, 10)
  el = fn5(el, al, bl, cl, dl, m[5], 0xa953fd4e, 5); bl = rotl(bl, 10)
  dl = fn5(dl, el, al, bl, cl, m[9], 0xa953fd4e, 11); al = rotl(al, 10)
  cl = fn5(cl, dl, el, al, bl, m[7], 0xa953fd4e, 6); el = rotl(el, 10)
  bl = fn5(bl, cl, dl, el, al, m[12], 0xa953fd4e, 8); dl = rotl(dl, 10)
  al = fn5(al, bl, cl, dl, el, m[2], 0xa953fd4e, 13); cl = rotl(cl, 10)
  el = fn5(el, al, bl, cl, dl, m[10], 0xa953fd4e, 12); bl = rotl(bl, 10)
  dl = fn5(dl, el, al, bl, cl, m[14], 0xa953fd4e, 5); al = rotl(al, 10)
  cl = fn5(cl, dl, el, al, bl, m[1], 0xa953fd4e, 12); el = rotl(el, 10)
  bl = fn5(bl, cl, dl, el, al, m[3], 0xa953fd4e, 13); dl = rotl(dl, 10)
  al = fn5(al, bl, cl, dl, el, m[8], 0xa953fd4e, 14); cl = rotl(cl, 10)
  el = fn5(el, al, bl, cl, dl, m[11], 0xa953fd4e, 11); bl = rotl(bl, 10)
  dl = fn5(dl, el, al, bl, cl, m[6], 0xa953fd4e, 8); al = rotl(al, 10)
  cl = fn5(cl, dl, el, al, bl, m[15], 0xa953fd4e, 5); el = rotl(el, 10)
  bl = fn5(bl, cl, dl, el, al, m[13], 0xa953fd4e, 6); dl = rotl(dl, 10)

  var ar = this._a
  var br = this._b
  var cr = this._c
  var dr = this._d
  var er = this._e

  // M'j = 5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12
  // K' = 0x50a28be6
  // S'j = 8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6
  ar = fn5(ar, br, cr, dr, er, m[5], 0x50a28be6, 8); cr = rotl(cr, 10)
  er = fn5(er, ar, br, cr, dr, m[14], 0x50a28be6, 9); br = rotl(br, 10)
  dr = fn5(dr, er, ar, br, cr, m[7], 0x50a28be6, 9); ar = rotl(ar, 10)
  cr = fn5(cr, dr, er, ar, br, m[0], 0x50a28be6, 11); er = rotl(er, 10)
  br = fn5(br, cr, dr, er, ar, m[9], 0x50a28be6, 13); dr = rotl(dr, 10)
  ar = fn5(ar, br, cr, dr, er, m[2], 0x50a28be6, 15); cr = rotl(cr, 10)
  er = fn5(er, ar, br, cr, dr, m[11], 0x50a28be6, 15); br = rotl(br, 10)
  dr = fn5(dr, er, ar, br, cr, m[4], 0x50a28be6, 5); ar = rotl(ar, 10)
  cr = fn5(cr, dr, er, ar, br, m[13], 0x50a28be6, 7); er = rotl(er, 10)
  br = fn5(br, cr, dr, er, ar, m[6], 0x50a28be6, 7); dr = rotl(dr, 10)
  ar = fn5(ar, br, cr, dr, er, m[15], 0x50a28be6, 8); cr = rotl(cr, 10)
  er = fn5(er, ar, br, cr, dr, m[8], 0x50a28be6, 11); br = rotl(br, 10)
  dr = fn5(dr, er, ar, br, cr, m[1], 0x50a28be6, 14); ar = rotl(ar, 10)
  cr = fn5(cr, dr, er, ar, br, m[10], 0x50a28be6, 14); er = rotl(er, 10)
  br = fn5(br, cr, dr, er, ar, m[3], 0x50a28be6, 12); dr = rotl(dr, 10)
  ar = fn5(ar, br, cr, dr, er, m[12], 0x50a28be6, 6); cr = rotl(cr, 10)

  // M'j = 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2
  // K' = 0x5c4dd124
  // S'j = 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11
  er = fn4(er, ar, br, cr, dr, m[6], 0x5c4dd124, 9); br = rotl(br, 10)
  dr = fn4(dr, er, ar, br, cr, m[11], 0x5c4dd124, 13); ar = rotl(ar, 10)
  cr = fn4(cr, dr, er, ar, br, m[3], 0x5c4dd124, 15); er = rotl(er, 10)
  br = fn4(br, cr, dr, er, ar, m[7], 0x5c4dd124, 7); dr = rotl(dr, 10)
  ar = fn4(ar, br, cr, dr, er, m[0], 0x5c4dd124, 12); cr = rotl(cr, 10)
  er = fn4(er, ar, br, cr, dr, m[13], 0x5c4dd124, 8); br = rotl(br, 10)
  dr = fn4(dr, er, ar, br, cr, m[5], 0x5c4dd124, 9); ar = rotl(ar, 10)
  cr = fn4(cr, dr, er, ar, br, m[10], 0x5c4dd124, 11); er = rotl(er, 10)
  br = fn4(br, cr, dr, er, ar, m[14], 0x5c4dd124, 7); dr = rotl(dr, 10)
  ar = fn4(ar, br, cr, dr, er, m[15], 0x5c4dd124, 7); cr = rotl(cr, 10)
  er = fn4(er, ar, br, cr, dr, m[8], 0x5c4dd124, 12); br = rotl(br, 10)
  dr = fn4(dr, er, ar, br, cr, m[12], 0x5c4dd124, 7); ar = rotl(ar, 10)
  cr = fn4(cr, dr, er, ar, br, m[4], 0x5c4dd124, 6); er = rotl(er, 10)
  br = fn4(br, cr, dr, er, ar, m[9], 0x5c4dd124, 15); dr = rotl(dr, 10)
  ar = fn4(ar, br, cr, dr, er, m[1], 0x5c4dd124, 13); cr = rotl(cr, 10)
  er = fn4(er, ar, br, cr, dr, m[2], 0x5c4dd124, 11); br = rotl(br, 10)

  // M'j = 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13
  // K' = 0x6d703ef3
  // S'j = 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5
  dr = fn3(dr, er, ar, br, cr, m[15], 0x6d703ef3, 9); ar = rotl(ar, 10)
  cr = fn3(cr, dr, er, ar, br, m[5], 0x6d703ef3, 7); er = rotl(er, 10)
  br = fn3(br, cr, dr, er, ar, m[1], 0x6d703ef3, 15); dr = rotl(dr, 10)
  ar = fn3(ar, br, cr, dr, er, m[3], 0x6d703ef3, 11); cr = rotl(cr, 10)
  er = fn3(er, ar, br, cr, dr, m[7], 0x6d703ef3, 8); br = rotl(br, 10)
  dr = fn3(dr, er, ar, br, cr, m[14], 0x6d703ef3, 6); ar = rotl(ar, 10)
  cr = fn3(cr, dr, er, ar, br, m[6], 0x6d703ef3, 6); er = rotl(er, 10)
  br = fn3(br, cr, dr, er, ar, m[9], 0x6d703ef3, 14); dr = rotl(dr, 10)
  ar = fn3(ar, br, cr, dr, er, m[11], 0x6d703ef3, 12); cr = rotl(cr, 10)
  er = fn3(er, ar, br, cr, dr, m[8], 0x6d703ef3, 13); br = rotl(br, 10)
  dr = fn3(dr, er, ar, br, cr, m[12], 0x6d703ef3, 5); ar = rotl(ar, 10)
  cr = fn3(cr, dr, er, ar, br, m[2], 0x6d703ef3, 14); er = rotl(er, 10)
  br = fn3(br, cr, dr, er, ar, m[10], 0x6d703ef3, 13); dr = rotl(dr, 10)
  ar = fn3(ar, br, cr, dr, er, m[0], 0x6d703ef3, 13); cr = rotl(cr, 10)
  er = fn3(er, ar, br, cr, dr, m[4], 0x6d703ef3, 7); br = rotl(br, 10)
  dr = fn3(dr, er, ar, br, cr, m[13], 0x6d703ef3, 5); ar = rotl(ar, 10)

  // M'j = 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14
  // K' = 0x7a6d76e9
  // S'j = 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8
  cr = fn2(cr, dr, er, ar, br, m[8], 0x7a6d76e9, 15); er = rotl(er, 10)
  br = fn2(br, cr, dr, er, ar, m[6], 0x7a6d76e9, 5); dr = rotl(dr, 10)
  ar = fn2(ar, br, cr, dr, er, m[4], 0x7a6d76e9, 8); cr = rotl(cr, 10)
  er = fn2(er, ar, br, cr, dr, m[1], 0x7a6d76e9, 11); br = rotl(br, 10)
  dr = fn2(dr, er, ar, br, cr, m[3], 0x7a6d76e9, 14); ar = rotl(ar, 10)
  cr = fn2(cr, dr, er, ar, br, m[11], 0x7a6d76e9, 14); er = rotl(er, 10)
  br = fn2(br, cr, dr, er, ar, m[15], 0x7a6d76e9, 6); dr = rotl(dr, 10)
  ar = fn2(ar, br, cr, dr, er, m[0], 0x7a6d76e9, 14); cr = rotl(cr, 10)
  er = fn2(er, ar, br, cr, dr, m[5], 0x7a6d76e9, 6); br = rotl(br, 10)
  dr = fn2(dr, er, ar, br, cr, m[12], 0x7a6d76e9, 9); ar = rotl(ar, 10)
  cr = fn2(cr, dr, er, ar, br, m[2], 0x7a6d76e9, 12); er = rotl(er, 10)
  br = fn2(br, cr, dr, er, ar, m[13], 0x7a6d76e9, 9); dr = rotl(dr, 10)
  ar = fn2(ar, br, cr, dr, er, m[9], 0x7a6d76e9, 12); cr = rotl(cr, 10)
  er = fn2(er, ar, br, cr, dr, m[7], 0x7a6d76e9, 5); br = rotl(br, 10)
  dr = fn2(dr, er, ar, br, cr, m[10], 0x7a6d76e9, 15); ar = rotl(ar, 10)
  cr = fn2(cr, dr, er, ar, br, m[14], 0x7a6d76e9, 8); er = rotl(er, 10)

  // M'j = 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
  // K' = 0x00000000
  // S'j = 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
  br = fn1(br, cr, dr, er, ar, m[12], 0x00000000, 8); dr = rotl(dr, 10)
  ar = fn1(ar, br, cr, dr, er, m[15], 0x00000000, 5); cr = rotl(cr, 10)
  er = fn1(er, ar, br, cr, dr, m[10], 0x00000000, 12); br = rotl(br, 10)
  dr = fn1(dr, er, ar, br, cr, m[4], 0x00000000, 9); ar = rotl(ar, 10)
  cr = fn1(cr, dr, er, ar, br, m[1], 0x00000000, 12); er = rotl(er, 10)
  br = fn1(br, cr, dr, er, ar, m[5], 0x00000000, 5); dr = rotl(dr, 10)
  ar = fn1(ar, br, cr, dr, er, m[8], 0x00000000, 14); cr = rotl(cr, 10)
  er = fn1(er, ar, br, cr, dr, m[7], 0x00000000, 6); br = rotl(br, 10)
  dr = fn1(dr, er, ar, br, cr, m[6], 0x00000000, 8); ar = rotl(ar, 10)
  cr = fn1(cr, dr, er, ar, br, m[2], 0x00000000, 13); er = rotl(er, 10)
  br = fn1(br, cr, dr, er, ar, m[13], 0x00000000, 6); dr = rotl(dr, 10)
  ar = fn1(ar, br, cr, dr, er, m[14], 0x00000000, 5); cr = rotl(cr, 10)
  er = fn1(er, ar, br, cr, dr, m[0], 0x00000000, 15); br = rotl(br, 10)
  dr = fn1(dr, er, ar, br, cr, m[3], 0x00000000, 13); ar = rotl(ar, 10)
  cr = fn1(cr, dr, er, ar, br, m[9], 0x00000000, 11); er = rotl(er, 10)
  br = fn1(br, cr, dr, er, ar, m[11], 0x00000000, 11); dr = rotl(dr, 10)

  // change state
  var t = (this._b + cl + dr) | 0
  this._b = (this._c + dl + er) | 0
  this._c = (this._d + el + ar) | 0
  this._d = (this._e + al + br) | 0
  this._e = (this._a + bl + cr) | 0
  this._a = t
}

RIPEMD160.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = new Buffer(20)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  buffer.writeInt32LE(this._e, 16)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fn1 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
}

function fn2 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
}

function fn3 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
}

function fn4 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
}

function fn5 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
}

module.exports = RIPEMD160

}).call(this,reqqqqq("buffer").Buffer)
},{"buffer":3,"hash-base":42,"inherits":43}],51:[function(reqqqqq,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"buffer":3,"dup":25}],52:[function(reqqqqq,module,exports){
var Buffer = reqqqqq('safe-buffer').Buffer

// prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = Buffer.alloc(blockSize)
  this._finalSize = finalSize
  this._blockSize = blockSize
  this._len = 0
}

Hash.prototype.update = function (data, enc) {
  if (typeof data === 'string') {
    enc = enc || 'utf8'
    data = Buffer.from(data, enc)
  }

  var block = this._block
  var blockSize = this._blockSize
  var length = data.length
  var accum = this._len

  for (var offset = 0; offset < length;) {
    var assigned = accum % blockSize
    var remainder = Math.min(length - offset, blockSize - assigned)

    for (var i = 0; i < remainder; i++) {
      block[assigned + i] = data[offset + i]
    }

    accum += remainder
    offset += remainder

    if ((accum % blockSize) === 0) {
      this._update(block)
    }
  }

  this._len += length
  return this
}

Hash.prototype.digest = function (enc) {
  var rem = this._len % this._blockSize

  this._block[rem] = 0x80

  // zero (rem + 1) trailing bits, where (rem + 1) is the smallest
  // non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
  this._block.fill(0, rem + 1)

  if (rem >= this._finalSize) {
    this._update(this._block)
    this._block.fill(0)
  }

  var bits = this._len * 8

  // uint32
  if (bits <= 0xffffffff) {
    this._block.writeUInt32BE(bits, this._blockSize - 4)

  // uint64
  } else {
    var lowBits = (bits & 0xffffffff) >>> 0
    var highBits = (bits - lowBits) / 0x100000000

    this._block.writeUInt32BE(highBits, this._blockSize - 8)
    this._block.writeUInt32BE(lowBits, this._blockSize - 4)
  }

  this._update(this._block)
  var hash = this._hash()

  return enc ? hash.toString(enc) : hash
}

Hash.prototype._update = function () {
  throw new Error('_update must be implemented by subclass')
}

module.exports = Hash

},{"safe-buffer":51}],53:[function(reqqqqq,module,exports){
var exports = module.exports = function SHA (algorithm) {
  algorithm = algorithm.toLowerCase()

  var Algorithm = exports[algorithm]
  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

  return new Algorithm()
}

exports.sha = reqqqqq('./sha')
exports.sha1 = reqqqqq('./sha1')
exports.sha224 = reqqqqq('./sha224')
exports.sha256 = reqqqqq('./sha256')
exports.sha384 = reqqqqq('./sha384')
exports.sha512 = reqqqqq('./sha512')

},{"./sha":54,"./sha1":55,"./sha224":56,"./sha256":57,"./sha384":58,"./sha512":59}],54:[function(reqqqqq,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
 * in FIPS PUB 180-1
 * This source code is derived from sha1.js of the same repository.
 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
 * operation was added.
 */

var inherits = reqqqqq('inherits')
var Hash = reqqqqq('./hash')
var Buffer = reqqqqq('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha, Hash)

Sha.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha

},{"./hash":52,"inherits":43,"safe-buffer":51}],55:[function(reqqqqq,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var inherits = reqqqqq('inherits')
var Hash = reqqqqq('./hash')
var Buffer = reqqqqq('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha1 () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha1, Hash)

Sha1.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl1 (num) {
  return (num << 1) | (num >>> 31)
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha1.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16])

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha1.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha1

},{"./hash":52,"inherits":43,"safe-buffer":51}],56:[function(reqqqqq,module,exports){
/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = reqqqqq('inherits')
var Sha256 = reqqqqq('./sha256')
var Hash = reqqqqq('./hash')
var Buffer = reqqqqq('safe-buffer').Buffer

var W = new Array(64)

function Sha224 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha224, Sha256)

Sha224.prototype.init = function () {
  this._a = 0xc1059ed8
  this._b = 0x367cd507
  this._c = 0x3070dd17
  this._d = 0xf70e5939
  this._e = 0xffc00b31
  this._f = 0x68581511
  this._g = 0x64f98fa7
  this._h = 0xbefa4fa4

  return this
}

Sha224.prototype._hash = function () {
  var H = Buffer.allocUnsafe(28)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)

  return H
}

module.exports = Sha224

},{"./hash":52,"./sha256":57,"inherits":43,"safe-buffer":51}],57:[function(reqqqqq,module,exports){
/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = reqqqqq('inherits')
var Hash = reqqqqq('./hash')
var Buffer = reqqqqq('safe-buffer').Buffer

var K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]

var W = new Array(64)

function Sha256 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha256, Hash)

Sha256.prototype.init = function () {
  this._a = 0x6a09e667
  this._b = 0xbb67ae85
  this._c = 0x3c6ef372
  this._d = 0xa54ff53a
  this._e = 0x510e527f
  this._f = 0x9b05688c
  this._g = 0x1f83d9ab
  this._h = 0x5be0cd19

  return this
}

function ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x) {
  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
}

function sigma1 (x) {
  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
}

function gamma0 (x) {
  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
}

function gamma1 (x) {
  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
}

Sha256.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0
  var f = this._f | 0
  var g = this._g | 0
  var h = this._h | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0

  for (var j = 0; j < 64; ++j) {
    var T1 = (h + sigma1(e) + ch(e, f, g) + K[j] + W[j]) | 0
    var T2 = (sigma0(a) + maj(a, b, c)) | 0

    h = g
    g = f
    f = e
    e = (d + T1) | 0
    d = c
    c = b
    b = a
    a = (T1 + T2) | 0
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
  this._f = (f + this._f) | 0
  this._g = (g + this._g) | 0
  this._h = (h + this._h) | 0
}

Sha256.prototype._hash = function () {
  var H = Buffer.allocUnsafe(32)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)
  H.writeInt32BE(this._h, 28)

  return H
}

module.exports = Sha256

},{"./hash":52,"inherits":43,"safe-buffer":51}],58:[function(reqqqqq,module,exports){
var inherits = reqqqqq('inherits')
var SHA512 = reqqqqq('./sha512')
var Hash = reqqqqq('./hash')
var Buffer = reqqqqq('safe-buffer').Buffer

var W = new Array(160)

function Sha384 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha384, SHA512)

Sha384.prototype.init = function () {
  this._ah = 0xcbbb9d5d
  this._bh = 0x629a292a
  this._ch = 0x9159015a
  this._dh = 0x152fecd8
  this._eh = 0x67332667
  this._fh = 0x8eb44a87
  this._gh = 0xdb0c2e0d
  this._hh = 0x47b5481d

  this._al = 0xc1059ed8
  this._bl = 0x367cd507
  this._cl = 0x3070dd17
  this._dl = 0xf70e5939
  this._el = 0xffc00b31
  this._fl = 0x68581511
  this._gl = 0x64f98fa7
  this._hl = 0xbefa4fa4

  return this
}

Sha384.prototype._hash = function () {
  var H = Buffer.allocUnsafe(48)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)

  return H
}

module.exports = Sha384

},{"./hash":52,"./sha512":59,"inherits":43,"safe-buffer":51}],59:[function(reqqqqq,module,exports){
var inherits = reqqqqq('inherits')
var Hash = reqqqqq('./hash')
var Buffer = reqqqqq('safe-buffer').Buffer

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
]

var W = new Array(160)

function Sha512 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha512, Hash)

Sha512.prototype.init = function () {
  this._ah = 0x6a09e667
  this._bh = 0xbb67ae85
  this._ch = 0x3c6ef372
  this._dh = 0xa54ff53a
  this._eh = 0x510e527f
  this._fh = 0x9b05688c
  this._gh = 0x1f83d9ab
  this._hh = 0x5be0cd19

  this._al = 0xf3bcc908
  this._bl = 0x84caa73b
  this._cl = 0xfe94f82b
  this._dl = 0x5f1d36f1
  this._el = 0xade682d1
  this._fl = 0x2b3e6c1f
  this._gl = 0xfb41bd6b
  this._hl = 0x137e2179

  return this
}

function Ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x, xl) {
  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
}

function sigma1 (x, xl) {
  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
}

function Gamma0 (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
}

function Gamma0l (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
}

function Gamma1 (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
}

function Gamma1l (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
}

function getCarry (a, b) {
  return (a >>> 0) < (b >>> 0) ? 1 : 0
}

Sha512.prototype._update = function (M) {
  var W = this._w

  var ah = this._ah | 0
  var bh = this._bh | 0
  var ch = this._ch | 0
  var dh = this._dh | 0
  var eh = this._eh | 0
  var fh = this._fh | 0
  var gh = this._gh | 0
  var hh = this._hh | 0

  var al = this._al | 0
  var bl = this._bl | 0
  var cl = this._cl | 0
  var dl = this._dl | 0
  var el = this._el | 0
  var fl = this._fl | 0
  var gl = this._gl | 0
  var hl = this._hl | 0

  for (var i = 0; i < 32; i += 2) {
    W[i] = M.readInt32BE(i * 4)
    W[i + 1] = M.readInt32BE(i * 4 + 4)
  }
  for (; i < 160; i += 2) {
    var xh = W[i - 15 * 2]
    var xl = W[i - 15 * 2 + 1]
    var gamma0 = Gamma0(xh, xl)
    var gamma0l = Gamma0l(xl, xh)

    xh = W[i - 2 * 2]
    xl = W[i - 2 * 2 + 1]
    var gamma1 = Gamma1(xh, xl)
    var gamma1l = Gamma1l(xl, xh)

    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    var Wi7h = W[i - 7 * 2]
    var Wi7l = W[i - 7 * 2 + 1]

    var Wi16h = W[i - 16 * 2]
    var Wi16l = W[i - 16 * 2 + 1]

    var Wil = (gamma0l + Wi7l) | 0
    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0
    Wil = (Wil + gamma1l) | 0
    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0
    Wil = (Wil + Wi16l) | 0
    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0

    W[i] = Wih
    W[i + 1] = Wil
  }

  for (var j = 0; j < 160; j += 2) {
    Wih = W[j]
    Wil = W[j + 1]

    var majh = maj(ah, bh, ch)
    var majl = maj(al, bl, cl)

    var sigma0h = sigma0(ah, al)
    var sigma0l = sigma0(al, ah)
    var sigma1h = sigma1(eh, el)
    var sigma1l = sigma1(el, eh)

    // t1 = h + sigma1 + ch + K[j] + W[j]
    var Kih = K[j]
    var Kil = K[j + 1]

    var chh = Ch(eh, fh, gh)
    var chl = Ch(el, fl, gl)

    var t1l = (hl + sigma1l) | 0
    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0
    t1l = (t1l + chl) | 0
    t1h = (t1h + chh + getCarry(t1l, chl)) | 0
    t1l = (t1l + Kil) | 0
    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0
    t1l = (t1l + Wil) | 0
    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0

    // t2 = sigma0 + maj
    var t2l = (sigma0l + majl) | 0
    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0

    hh = gh
    hl = gl
    gh = fh
    gl = fl
    fh = eh
    fl = el
    el = (dl + t1l) | 0
    eh = (dh + t1h + getCarry(el, dl)) | 0
    dh = ch
    dl = cl
    ch = bh
    cl = bl
    bh = ah
    bl = al
    al = (t1l + t2l) | 0
    ah = (t1h + t2h + getCarry(al, t1l)) | 0
  }

  this._al = (this._al + al) | 0
  this._bl = (this._bl + bl) | 0
  this._cl = (this._cl + cl) | 0
  this._dl = (this._dl + dl) | 0
  this._el = (this._el + el) | 0
  this._fl = (this._fl + fl) | 0
  this._gl = (this._gl + gl) | 0
  this._hl = (this._hl + hl) | 0

  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0
  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0
  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0
  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0
  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0
  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0
  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0
  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0
}

Sha512.prototype._hash = function () {
  var H = Buffer.allocUnsafe(64)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)
  writeInt64BE(this._gh, this._gl, 48)
  writeInt64BE(this._hh, this._hl, 56)

  return H
}

module.exports = Sha512

},{"./hash":52,"inherits":43,"safe-buffer":51}],60:[function(reqqqqq,module,exports){
(function (root) {
   "use strict";

/***** unorm.js *****/

/*
 * UnicodeNormalizer 1.0.0
 * Copyright (c) 2008 Matsuza
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 * $Date: 2008-06-05 16:44:17 +0200 (Thu, 05 Jun 2008) $
 * $Rev: 13309 $
 */

   var DEFAULT_FEATURE = [null, 0, {}];
   var CACHE_THRESHOLD = 10;
   var SBase = 0xAC00, LBase = 0x1100, VBase = 0x1161, TBase = 0x11A7, LCount = 19, VCount = 21, TCount = 28;
   var NCount = VCount * TCount; // 588
   var SCount = LCount * NCount; // 11172

   var UChar = function(cp, feature){
      this.codepoint = cp;
      this.feature = feature;
   };

   // Strategies
   var cache = {};
   var cacheCounter = [];
   for (var i = 0; i <= 0xFF; ++i){
      cacheCounter[i] = 0;
   }

   function fromCache(next, cp, needFeature){
      var ret = cache[cp];
      if(!ret){
         ret = next(cp, needFeature);
         if(!!ret.feature && ++cacheCounter[(cp >> 8) & 0xFF] > CACHE_THRESHOLD){
            cache[cp] = ret;
         }
      }
      return ret;
   }

   function fromData(next, cp, needFeature){
      var hash = cp & 0xFF00;
      var dunit = UChar.udata[hash] || {};
      var f = dunit[cp];
      return f ? new UChar(cp, f) : new UChar(cp, DEFAULT_FEATURE);
   }
   function fromCpOnly(next, cp, needFeature){
      return !!needFeature ? next(cp, needFeature) : new UChar(cp, null);
   }
   function fromRuleBasedJamo(next, cp, needFeature){
      var j;
      if(cp < LBase || (LBase + LCount <= cp && cp < SBase) || (SBase + SCount < cp)){
         return next(cp, needFeature);
      }
      if(LBase <= cp && cp < LBase + LCount){
         var c = {};
         var base = (cp - LBase) * VCount;
         for (j = 0; j < VCount; ++j){
            c[VBase + j] = SBase + TCount * (j + base);
         }
         return new UChar(cp, [,,c]);
      }

      var SIndex = cp - SBase;
      var TIndex = SIndex % TCount;
      var feature = [];
      if(TIndex !== 0){
         feature[0] = [SBase + SIndex - TIndex, TBase + TIndex];
      } else {
         feature[0] = [LBase + Math.floor(SIndex / NCount), VBase + Math.floor((SIndex % NCount) / TCount)];
         feature[2] = {};
         for (j = 1; j < TCount; ++j){
            feature[2][TBase + j] = cp + j;
         }
      }
      return new UChar(cp, feature);
   }
   function fromCpFilter(next, cp, needFeature){
      return cp < 60 || 13311 < cp && cp < 42607 ? new UChar(cp, DEFAULT_FEATURE) : next(cp, needFeature);
   }

   var strategies = [fromCpFilter, fromCache, fromCpOnly, fromRuleBasedJamo, fromData];

   UChar.fromCharCode = strategies.reduceRight(function (next, strategy) {
      return function (cp, needFeature) {
         return strategy(next, cp, needFeature);
      };
   }, null);

   UChar.isHighSurrogate = function(cp){
      return cp >= 0xD800 && cp <= 0xDBFF;
   };
   UChar.isLowSurrogate = function(cp){
      return cp >= 0xDC00 && cp <= 0xDFFF;
   };

   UChar.prototype.prepFeature = function(){
      if(!this.feature){
         this.feature = UChar.fromCharCode(this.codepoint, true).feature;
      }
   };

   UChar.prototype.toString = function(){
      if(this.codepoint < 0x10000){
         return String.fromCharCode(this.codepoint);
      } else {
         var x = this.codepoint - 0x10000;
         return String.fromCharCode(Math.floor(x / 0x400) + 0xD800, x % 0x400 + 0xDC00);
      }
   };

   UChar.prototype.getDecomp = function(){
      this.prepFeature();
      return this.feature[0] || null;
   };

   UChar.prototype.isCompatibility = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 8));
   };
   UChar.prototype.isExclude = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 9));
   };
   UChar.prototype.getCanonicalClass = function(){
      this.prepFeature();
      return !!this.feature[1] ? (this.feature[1] & 0xff) : 0;
   };
   UChar.prototype.getComposite = function(following){
      this.prepFeature();
      if(!this.feature[2]){
         return null;
      }
      var cp = this.feature[2][following.codepoint];
      return cp ? UChar.fromCharCode(cp) : null;
   };

   var UCharIterator = function(str){
      this.str = str;
      this.cursor = 0;
   };
   UCharIterator.prototype.next = function(){
      if(!!this.str && this.cursor < this.str.length){
         var cp = this.str.charCodeAt(this.cursor++);
         var d;
         if(UChar.isHighSurrogate(cp) && this.cursor < this.str.length && UChar.isLowSurrogate((d = this.str.charCodeAt(this.cursor)))){
            cp = (cp - 0xD800) * 0x400 + (d -0xDC00) + 0x10000;
            ++this.cursor;
         }
         return UChar.fromCharCode(cp);
      } else {
         this.str = null;
         return null;
      }
   };

   var RecursDecompIterator = function(it, cano){
      this.it = it;
      this.canonical = cano;
      this.resBuf = [];
   };

   RecursDecompIterator.prototype.next = function(){
      function recursiveDecomp(cano, uchar){
         var decomp = uchar.getDecomp();
         if(!!decomp && !(cano && uchar.isCompatibility())){
            var ret = [];
            for(var i = 0; i < decomp.length; ++i){
               var a = recursiveDecomp(cano, UChar.fromCharCode(decomp[i]));
                ret = ret.concat(a);
            }
            return ret;
         } else {
            return [uchar];
         }
      }
      if(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            return null;
         }
         this.resBuf = recursiveDecomp(this.canonical, uchar);
      }
      return this.resBuf.shift();
   };

   var DecompIterator = function(it){
      this.it = it;
      this.resBuf = [];
   };

   DecompIterator.prototype.next = function(){
      var cc;
      if(this.resBuf.length === 0){
         do{
            var uchar = this.it.next();
            if(!uchar){
               break;
            }
            cc = uchar.getCanonicalClass();
            var inspt = this.resBuf.length;
            if(cc !== 0){
               for(; inspt > 0; --inspt){
                  var uchar2 = this.resBuf[inspt - 1];
                  var cc2 = uchar2.getCanonicalClass();
                  if(cc2 <= cc){
                     break;
                  }
               }
            }
            this.resBuf.splice(inspt, 0, uchar);
         } while(cc !== 0);
      }
      return this.resBuf.shift();
   };

   var CompIterator = function(it){
      this.it = it;
      this.procBuf = [];
      this.resBuf = [];
      this.lastClass = null;
   };

   CompIterator.prototype.next = function(){
      while(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            this.resBuf = this.procBuf;
            this.procBuf = [];
            break;
         }
         if(this.procBuf.length === 0){
            this.lastClass = uchar.getCanonicalClass();
            this.procBuf.push(uchar);
         } else {
            var starter = this.procBuf[0];
            var composite = starter.getComposite(uchar);
            var cc = uchar.getCanonicalClass();
            if(!!composite && (this.lastClass < cc || this.lastClass === 0)){
               this.procBuf[0] = composite;
            } else {
               if(cc === 0){
                  this.resBuf = this.procBuf;
                  this.procBuf = [];
               }
               this.lastClass = cc;
               this.procBuf.push(uchar);
            }
         }
      }
      return this.resBuf.shift();
   };

   var createIterator = function(mode, str){
      switch(mode){
         case "NFD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true));
         case "NFKD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false));
         case "NFC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true)));
         case "NFKC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false)));
      }
      throw mode + " is invalid";
   };
   var normalize = function(mode, str){
      var it = createIterator(mode, str);
      var ret = "";
      var uchar;
      while(!!(uchar = it.next())){
         ret += uchar.toString();
      }
      return ret;
   };

   /* API functions */
   function nfd(str){
      return normalize("NFD", str);
   }

   function nfkd(str){
      return normalize("NFKD", str);
   }

   function nfc(str){
      return normalize("NFC", str);
   }

   function nfkc(str){
      return normalize("NFKC", str);
   }

/* Unicode data */
UChar.udata={
0:{60:[,,{824:8814}],61:[,,{824:8800}],62:[,,{824:8815}],65:[,,{768:192,769:193,770:194,771:195,772:256,774:258,775:550,776:196,777:7842,778:197,780:461,783:512,785:514,803:7840,805:7680,808:260}],66:[,,{775:7682,803:7684,817:7686}],67:[,,{769:262,770:264,775:266,780:268,807:199}],68:[,,{775:7690,780:270,803:7692,807:7696,813:7698,817:7694}],69:[,,{768:200,769:201,770:202,771:7868,772:274,774:276,775:278,776:203,777:7866,780:282,783:516,785:518,803:7864,807:552,808:280,813:7704,816:7706}],70:[,,{775:7710}],71:[,,{769:500,770:284,772:7712,774:286,775:288,780:486,807:290}],72:[,,{770:292,775:7714,776:7718,780:542,803:7716,807:7720,814:7722}],73:[,,{768:204,769:205,770:206,771:296,772:298,774:300,775:304,776:207,777:7880,780:463,783:520,785:522,803:7882,808:302,816:7724}],74:[,,{770:308}],75:[,,{769:7728,780:488,803:7730,807:310,817:7732}],76:[,,{769:313,780:317,803:7734,807:315,813:7740,817:7738}],77:[,,{769:7742,775:7744,803:7746}],78:[,,{768:504,769:323,771:209,775:7748,780:327,803:7750,807:325,813:7754,817:7752}],79:[,,{768:210,769:211,770:212,771:213,772:332,774:334,775:558,776:214,777:7886,779:336,780:465,783:524,785:526,795:416,803:7884,808:490}],80:[,,{769:7764,775:7766}],82:[,,{769:340,775:7768,780:344,783:528,785:530,803:7770,807:342,817:7774}],83:[,,{769:346,770:348,775:7776,780:352,803:7778,806:536,807:350}],84:[,,{775:7786,780:356,803:7788,806:538,807:354,813:7792,817:7790}],85:[,,{768:217,769:218,770:219,771:360,772:362,774:364,776:220,777:7910,778:366,779:368,780:467,783:532,785:534,795:431,803:7908,804:7794,808:370,813:7798,816:7796}],86:[,,{771:7804,803:7806}],87:[,,{768:7808,769:7810,770:372,775:7814,776:7812,803:7816}],88:[,,{775:7818,776:7820}],89:[,,{768:7922,769:221,770:374,771:7928,772:562,775:7822,776:376,777:7926,803:7924}],90:[,,{769:377,770:7824,775:379,780:381,803:7826,817:7828}],97:[,,{768:224,769:225,770:226,771:227,772:257,774:259,775:551,776:228,777:7843,778:229,780:462,783:513,785:515,803:7841,805:7681,808:261}],98:[,,{775:7683,803:7685,817:7687}],99:[,,{769:263,770:265,775:267,780:269,807:231}],100:[,,{775:7691,780:271,803:7693,807:7697,813:7699,817:7695}],101:[,,{768:232,769:233,770:234,771:7869,772:275,774:277,775:279,776:235,777:7867,780:283,783:517,785:519,803:7865,807:553,808:281,813:7705,816:7707}],102:[,,{775:7711}],103:[,,{769:501,770:285,772:7713,774:287,775:289,780:487,807:291}],104:[,,{770:293,775:7715,776:7719,780:543,803:7717,807:7721,814:7723,817:7830}],105:[,,{768:236,769:237,770:238,771:297,772:299,774:301,776:239,777:7881,780:464,783:521,785:523,803:7883,808:303,816:7725}],106:[,,{770:309,780:496}],107:[,,{769:7729,780:489,803:7731,807:311,817:7733}],108:[,,{769:314,780:318,803:7735,807:316,813:7741,817:7739}],109:[,,{769:7743,775:7745,803:7747}],110:[,,{768:505,769:324,771:241,775:7749,780:328,803:7751,807:326,813:7755,817:7753}],111:[,,{768:242,769:243,770:244,771:245,772:333,774:335,775:559,776:246,777:7887,779:337,780:466,783:525,785:527,795:417,803:7885,808:491}],112:[,,{769:7765,775:7767}],114:[,,{769:341,775:7769,780:345,783:529,785:531,803:7771,807:343,817:7775}],115:[,,{769:347,770:349,775:7777,780:353,803:7779,806:537,807:351}],116:[,,{775:7787,776:7831,780:357,803:7789,806:539,807:355,813:7793,817:7791}],117:[,,{768:249,769:250,770:251,771:361,772:363,774:365,776:252,777:7911,778:367,779:369,780:468,783:533,785:535,795:432,803:7909,804:7795,808:371,813:7799,816:7797}],118:[,,{771:7805,803:7807}],119:[,,{768:7809,769:7811,770:373,775:7815,776:7813,778:7832,803:7817}],120:[,,{775:7819,776:7821}],121:[,,{768:7923,769:253,770:375,771:7929,772:563,775:7823,776:255,777:7927,778:7833,803:7925}],122:[,,{769:378,770:7825,775:380,780:382,803:7827,817:7829}],160:[[32],256],168:[[32,776],256,{768:8173,769:901,834:8129}],170:[[97],256],175:[[32,772],256],178:[[50],256],179:[[51],256],180:[[32,769],256],181:[[956],256],184:[[32,807],256],185:[[49],256],186:[[111],256],188:[[49,8260,52],256],189:[[49,8260,50],256],190:[[51,8260,52],256],192:[[65,768]],193:[[65,769]],194:[[65,770],,{768:7846,769:7844,771:7850,777:7848}],195:[[65,771]],196:[[65,776],,{772:478}],197:[[65,778],,{769:506}],198:[,,{769:508,772:482}],199:[[67,807],,{769:7688}],200:[[69,768]],201:[[69,769]],202:[[69,770],,{768:7872,769:7870,771:7876,777:7874}],203:[[69,776]],204:[[73,768]],205:[[73,769]],206:[[73,770]],207:[[73,776],,{769:7726}],209:[[78,771]],210:[[79,768]],211:[[79,769]],212:[[79,770],,{768:7890,769:7888,771:7894,777:7892}],213:[[79,771],,{769:7756,772:556,776:7758}],214:[[79,776],,{772:554}],216:[,,{769:510}],217:[[85,768]],218:[[85,769]],219:[[85,770]],220:[[85,776],,{768:475,769:471,772:469,780:473}],221:[[89,769]],224:[[97,768]],225:[[97,769]],226:[[97,770],,{768:7847,769:7845,771:7851,777:7849}],227:[[97,771]],228:[[97,776],,{772:479}],229:[[97,778],,{769:507}],230:[,,{769:509,772:483}],231:[[99,807],,{769:7689}],232:[[101,768]],233:[[101,769]],234:[[101,770],,{768:7873,769:7871,771:7877,777:7875}],235:[[101,776]],236:[[105,768]],237:[[105,769]],238:[[105,770]],239:[[105,776],,{769:7727}],241:[[110,771]],242:[[111,768]],243:[[111,769]],244:[[111,770],,{768:7891,769:7889,771:7895,777:7893}],245:[[111,771],,{769:7757,772:557,776:7759}],246:[[111,776],,{772:555}],248:[,,{769:511}],249:[[117,768]],250:[[117,769]],251:[[117,770]],252:[[117,776],,{768:476,769:472,772:470,780:474}],253:[[121,769]],255:[[121,776]]},
256:{256:[[65,772]],257:[[97,772]],258:[[65,774],,{768:7856,769:7854,771:7860,777:7858}],259:[[97,774],,{768:7857,769:7855,771:7861,777:7859}],260:[[65,808]],261:[[97,808]],262:[[67,769]],263:[[99,769]],264:[[67,770]],265:[[99,770]],266:[[67,775]],267:[[99,775]],268:[[67,780]],269:[[99,780]],270:[[68,780]],271:[[100,780]],274:[[69,772],,{768:7700,769:7702}],275:[[101,772],,{768:7701,769:7703}],276:[[69,774]],277:[[101,774]],278:[[69,775]],279:[[101,775]],280:[[69,808]],281:[[101,808]],282:[[69,780]],283:[[101,780]],284:[[71,770]],285:[[103,770]],286:[[71,774]],287:[[103,774]],288:[[71,775]],289:[[103,775]],290:[[71,807]],291:[[103,807]],292:[[72,770]],293:[[104,770]],296:[[73,771]],297:[[105,771]],298:[[73,772]],299:[[105,772]],300:[[73,774]],301:[[105,774]],302:[[73,808]],303:[[105,808]],304:[[73,775]],306:[[73,74],256],307:[[105,106],256],308:[[74,770]],309:[[106,770]],310:[[75,807]],311:[[107,807]],313:[[76,769]],314:[[108,769]],315:[[76,807]],316:[[108,807]],317:[[76,780]],318:[[108,780]],319:[[76,183],256],320:[[108,183],256],323:[[78,769]],324:[[110,769]],325:[[78,807]],326:[[110,807]],327:[[78,780]],328:[[110,780]],329:[[700,110],256],332:[[79,772],,{768:7760,769:7762}],333:[[111,772],,{768:7761,769:7763}],334:[[79,774]],335:[[111,774]],336:[[79,779]],337:[[111,779]],340:[[82,769]],341:[[114,769]],342:[[82,807]],343:[[114,807]],344:[[82,780]],345:[[114,780]],346:[[83,769],,{775:7780}],347:[[115,769],,{775:7781}],348:[[83,770]],349:[[115,770]],350:[[83,807]],351:[[115,807]],352:[[83,780],,{775:7782}],353:[[115,780],,{775:7783}],354:[[84,807]],355:[[116,807]],356:[[84,780]],357:[[116,780]],360:[[85,771],,{769:7800}],361:[[117,771],,{769:7801}],362:[[85,772],,{776:7802}],363:[[117,772],,{776:7803}],364:[[85,774]],365:[[117,774]],366:[[85,778]],367:[[117,778]],368:[[85,779]],369:[[117,779]],370:[[85,808]],371:[[117,808]],372:[[87,770]],373:[[119,770]],374:[[89,770]],375:[[121,770]],376:[[89,776]],377:[[90,769]],378:[[122,769]],379:[[90,775]],380:[[122,775]],381:[[90,780]],382:[[122,780]],383:[[115],256,{775:7835}],416:[[79,795],,{768:7900,769:7898,771:7904,777:7902,803:7906}],417:[[111,795],,{768:7901,769:7899,771:7905,777:7903,803:7907}],431:[[85,795],,{768:7914,769:7912,771:7918,777:7916,803:7920}],432:[[117,795],,{768:7915,769:7913,771:7919,777:7917,803:7921}],439:[,,{780:494}],452:[[68,381],256],453:[[68,382],256],454:[[100,382],256],455:[[76,74],256],456:[[76,106],256],457:[[108,106],256],458:[[78,74],256],459:[[78,106],256],460:[[110,106],256],461:[[65,780]],462:[[97,780]],463:[[73,780]],464:[[105,780]],465:[[79,780]],466:[[111,780]],467:[[85,780]],468:[[117,780]],469:[[220,772]],470:[[252,772]],471:[[220,769]],472:[[252,769]],473:[[220,780]],474:[[252,780]],475:[[220,768]],476:[[252,768]],478:[[196,772]],479:[[228,772]],480:[[550,772]],481:[[551,772]],482:[[198,772]],483:[[230,772]],486:[[71,780]],487:[[103,780]],488:[[75,780]],489:[[107,780]],490:[[79,808],,{772:492}],491:[[111,808],,{772:493}],492:[[490,772]],493:[[491,772]],494:[[439,780]],495:[[658,780]],496:[[106,780]],497:[[68,90],256],498:[[68,122],256],499:[[100,122],256],500:[[71,769]],501:[[103,769]],504:[[78,768]],505:[[110,768]],506:[[197,769]],507:[[229,769]],508:[[198,769]],509:[[230,769]],510:[[216,769]],511:[[248,769]],66045:[,220]},
512:{512:[[65,783]],513:[[97,783]],514:[[65,785]],515:[[97,785]],516:[[69,783]],517:[[101,783]],518:[[69,785]],519:[[101,785]],520:[[73,783]],521:[[105,783]],522:[[73,785]],523:[[105,785]],524:[[79,783]],525:[[111,783]],526:[[79,785]],527:[[111,785]],528:[[82,783]],529:[[114,783]],530:[[82,785]],531:[[114,785]],532:[[85,783]],533:[[117,783]],534:[[85,785]],535:[[117,785]],536:[[83,806]],537:[[115,806]],538:[[84,806]],539:[[116,806]],542:[[72,780]],543:[[104,780]],550:[[65,775],,{772:480}],551:[[97,775],,{772:481}],552:[[69,807],,{774:7708}],553:[[101,807],,{774:7709}],554:[[214,772]],555:[[246,772]],556:[[213,772]],557:[[245,772]],558:[[79,775],,{772:560}],559:[[111,775],,{772:561}],560:[[558,772]],561:[[559,772]],562:[[89,772]],563:[[121,772]],658:[,,{780:495}],688:[[104],256],689:[[614],256],690:[[106],256],691:[[114],256],692:[[633],256],693:[[635],256],694:[[641],256],695:[[119],256],696:[[121],256],728:[[32,774],256],729:[[32,775],256],730:[[32,778],256],731:[[32,808],256],732:[[32,771],256],733:[[32,779],256],736:[[611],256],737:[[108],256],738:[[115],256],739:[[120],256],740:[[661],256],66272:[,220]},
768:{768:[,230],769:[,230],770:[,230],771:[,230],772:[,230],773:[,230],774:[,230],775:[,230],776:[,230,{769:836}],777:[,230],778:[,230],779:[,230],780:[,230],781:[,230],782:[,230],783:[,230],784:[,230],785:[,230],786:[,230],787:[,230],788:[,230],789:[,232],790:[,220],791:[,220],792:[,220],793:[,220],794:[,232],795:[,216],796:[,220],797:[,220],798:[,220],799:[,220],800:[,220],801:[,202],802:[,202],803:[,220],804:[,220],805:[,220],806:[,220],807:[,202],808:[,202],809:[,220],810:[,220],811:[,220],812:[,220],813:[,220],814:[,220],815:[,220],816:[,220],817:[,220],818:[,220],819:[,220],820:[,1],821:[,1],822:[,1],823:[,1],824:[,1],825:[,220],826:[,220],827:[,220],828:[,220],829:[,230],830:[,230],831:[,230],832:[[768],230],833:[[769],230],834:[,230],835:[[787],230],836:[[776,769],230],837:[,240],838:[,230],839:[,220],840:[,220],841:[,220],842:[,230],843:[,230],844:[,230],845:[,220],846:[,220],848:[,230],849:[,230],850:[,230],851:[,220],852:[,220],853:[,220],854:[,220],855:[,230],856:[,232],857:[,220],858:[,220],859:[,230],860:[,233],861:[,234],862:[,234],863:[,233],864:[,234],865:[,234],866:[,233],867:[,230],868:[,230],869:[,230],870:[,230],871:[,230],872:[,230],873:[,230],874:[,230],875:[,230],876:[,230],877:[,230],878:[,230],879:[,230],884:[[697]],890:[[32,837],256],894:[[59]],900:[[32,769],256],901:[[168,769]],902:[[913,769]],903:[[183]],904:[[917,769]],905:[[919,769]],906:[[921,769]],908:[[927,769]],910:[[933,769]],911:[[937,769]],912:[[970,769]],913:[,,{768:8122,769:902,772:8121,774:8120,787:7944,788:7945,837:8124}],917:[,,{768:8136,769:904,787:7960,788:7961}],919:[,,{768:8138,769:905,787:7976,788:7977,837:8140}],921:[,,{768:8154,769:906,772:8153,774:8152,776:938,787:7992,788:7993}],927:[,,{768:8184,769:908,787:8008,788:8009}],929:[,,{788:8172}],933:[,,{768:8170,769:910,772:8169,774:8168,776:939,788:8025}],937:[,,{768:8186,769:911,787:8040,788:8041,837:8188}],938:[[921,776]],939:[[933,776]],940:[[945,769],,{837:8116}],941:[[949,769]],942:[[951,769],,{837:8132}],943:[[953,769]],944:[[971,769]],945:[,,{768:8048,769:940,772:8113,774:8112,787:7936,788:7937,834:8118,837:8115}],949:[,,{768:8050,769:941,787:7952,788:7953}],951:[,,{768:8052,769:942,787:7968,788:7969,834:8134,837:8131}],953:[,,{768:8054,769:943,772:8145,774:8144,776:970,787:7984,788:7985,834:8150}],959:[,,{768:8056,769:972,787:8000,788:8001}],961:[,,{787:8164,788:8165}],965:[,,{768:8058,769:973,772:8161,774:8160,776:971,787:8016,788:8017,834:8166}],969:[,,{768:8060,769:974,787:8032,788:8033,834:8182,837:8179}],970:[[953,776],,{768:8146,769:912,834:8151}],971:[[965,776],,{768:8162,769:944,834:8167}],972:[[959,769]],973:[[965,769]],974:[[969,769],,{837:8180}],976:[[946],256],977:[[952],256],978:[[933],256,{769:979,776:980}],979:[[978,769]],980:[[978,776]],981:[[966],256],982:[[960],256],1008:[[954],256],1009:[[961],256],1010:[[962],256],1012:[[920],256],1013:[[949],256],1017:[[931],256],66422:[,230],66423:[,230],66424:[,230],66425:[,230],66426:[,230]},
1024:{1024:[[1045,768]],1025:[[1045,776]],1027:[[1043,769]],1030:[,,{776:1031}],1031:[[1030,776]],1036:[[1050,769]],1037:[[1048,768]],1038:[[1059,774]],1040:[,,{774:1232,776:1234}],1043:[,,{769:1027}],1045:[,,{768:1024,774:1238,776:1025}],1046:[,,{774:1217,776:1244}],1047:[,,{776:1246}],1048:[,,{768:1037,772:1250,774:1049,776:1252}],1049:[[1048,774]],1050:[,,{769:1036}],1054:[,,{776:1254}],1059:[,,{772:1262,774:1038,776:1264,779:1266}],1063:[,,{776:1268}],1067:[,,{776:1272}],1069:[,,{776:1260}],1072:[,,{774:1233,776:1235}],1075:[,,{769:1107}],1077:[,,{768:1104,774:1239,776:1105}],1078:[,,{774:1218,776:1245}],1079:[,,{776:1247}],1080:[,,{768:1117,772:1251,774:1081,776:1253}],1081:[[1080,774]],1082:[,,{769:1116}],1086:[,,{776:1255}],1091:[,,{772:1263,774:1118,776:1265,779:1267}],1095:[,,{776:1269}],1099:[,,{776:1273}],1101:[,,{776:1261}],1104:[[1077,768]],1105:[[1077,776]],1107:[[1075,769]],1110:[,,{776:1111}],1111:[[1110,776]],1116:[[1082,769]],1117:[[1080,768]],1118:[[1091,774]],1140:[,,{783:1142}],1141:[,,{783:1143}],1142:[[1140,783]],1143:[[1141,783]],1155:[,230],1156:[,230],1157:[,230],1158:[,230],1159:[,230],1217:[[1046,774]],1218:[[1078,774]],1232:[[1040,774]],1233:[[1072,774]],1234:[[1040,776]],1235:[[1072,776]],1238:[[1045,774]],1239:[[1077,774]],1240:[,,{776:1242}],1241:[,,{776:1243}],1242:[[1240,776]],1243:[[1241,776]],1244:[[1046,776]],1245:[[1078,776]],1246:[[1047,776]],1247:[[1079,776]],1250:[[1048,772]],1251:[[1080,772]],1252:[[1048,776]],1253:[[1080,776]],1254:[[1054,776]],1255:[[1086,776]],1256:[,,{776:1258}],1257:[,,{776:1259}],1258:[[1256,776]],1259:[[1257,776]],1260:[[1069,776]],1261:[[1101,776]],1262:[[1059,772]],1263:[[1091,772]],1264:[[1059,776]],1265:[[1091,776]],1266:[[1059,779]],1267:[[1091,779]],1268:[[1063,776]],1269:[[1095,776]],1272:[[1067,776]],1273:[[1099,776]]},
1280:{1415:[[1381,1410],256],1425:[,220],1426:[,230],1427:[,230],1428:[,230],1429:[,230],1430:[,220],1431:[,230],1432:[,230],1433:[,230],1434:[,222],1435:[,220],1436:[,230],1437:[,230],1438:[,230],1439:[,230],1440:[,230],1441:[,230],1442:[,220],1443:[,220],1444:[,220],1445:[,220],1446:[,220],1447:[,220],1448:[,230],1449:[,230],1450:[,220],1451:[,230],1452:[,230],1453:[,222],1454:[,228],1455:[,230],1456:[,10],1457:[,11],1458:[,12],1459:[,13],1460:[,14],1461:[,15],1462:[,16],1463:[,17],1464:[,18],1465:[,19],1466:[,19],1467:[,20],1468:[,21],1469:[,22],1471:[,23],1473:[,24],1474:[,25],1476:[,230],1477:[,220],1479:[,18]},
1536:{1552:[,230],1553:[,230],1554:[,230],1555:[,230],1556:[,230],1557:[,230],1558:[,230],1559:[,230],1560:[,30],1561:[,31],1562:[,32],1570:[[1575,1619]],1571:[[1575,1620]],1572:[[1608,1620]],1573:[[1575,1621]],1574:[[1610,1620]],1575:[,,{1619:1570,1620:1571,1621:1573}],1608:[,,{1620:1572}],1610:[,,{1620:1574}],1611:[,27],1612:[,28],1613:[,29],1614:[,30],1615:[,31],1616:[,32],1617:[,33],1618:[,34],1619:[,230],1620:[,230],1621:[,220],1622:[,220],1623:[,230],1624:[,230],1625:[,230],1626:[,230],1627:[,230],1628:[,220],1629:[,230],1630:[,230],1631:[,220],1648:[,35],1653:[[1575,1652],256],1654:[[1608,1652],256],1655:[[1735,1652],256],1656:[[1610,1652],256],1728:[[1749,1620]],1729:[,,{1620:1730}],1730:[[1729,1620]],1746:[,,{1620:1747}],1747:[[1746,1620]],1749:[,,{1620:1728}],1750:[,230],1751:[,230],1752:[,230],1753:[,230],1754:[,230],1755:[,230],1756:[,230],1759:[,230],1760:[,230],1761:[,230],1762:[,230],1763:[,220],1764:[,230],1767:[,230],1768:[,230],1770:[,220],1771:[,230],1772:[,230],1773:[,220]},
1792:{1809:[,36],1840:[,230],1841:[,220],1842:[,230],1843:[,230],1844:[,220],1845:[,230],1846:[,230],1847:[,220],1848:[,220],1849:[,220],1850:[,230],1851:[,220],1852:[,220],1853:[,230],1854:[,220],1855:[,230],1856:[,230],1857:[,230],1858:[,220],1859:[,230],1860:[,220],1861:[,230],1862:[,220],1863:[,230],1864:[,220],1865:[,230],1866:[,230],2027:[,230],2028:[,230],2029:[,230],2030:[,230],2031:[,230],2032:[,230],2033:[,230],2034:[,220],2035:[,230]},
2048:{2070:[,230],2071:[,230],2072:[,230],2073:[,230],2075:[,230],2076:[,230],2077:[,230],2078:[,230],2079:[,230],2080:[,230],2081:[,230],2082:[,230],2083:[,230],2085:[,230],2086:[,230],2087:[,230],2089:[,230],2090:[,230],2091:[,230],2092:[,230],2093:[,230],2137:[,220],2138:[,220],2139:[,220],2276:[,230],2277:[,230],2278:[,220],2279:[,230],2280:[,230],2281:[,220],2282:[,230],2283:[,230],2284:[,230],2285:[,220],2286:[,220],2287:[,220],2288:[,27],2289:[,28],2290:[,29],2291:[,230],2292:[,230],2293:[,230],2294:[,220],2295:[,230],2296:[,230],2297:[,220],2298:[,220],2299:[,230],2300:[,230],2301:[,230],2302:[,230],2303:[,230]},
2304:{2344:[,,{2364:2345}],2345:[[2344,2364]],2352:[,,{2364:2353}],2353:[[2352,2364]],2355:[,,{2364:2356}],2356:[[2355,2364]],2364:[,7],2381:[,9],2385:[,230],2386:[,220],2387:[,230],2388:[,230],2392:[[2325,2364],512],2393:[[2326,2364],512],2394:[[2327,2364],512],2395:[[2332,2364],512],2396:[[2337,2364],512],2397:[[2338,2364],512],2398:[[2347,2364],512],2399:[[2351,2364],512],2492:[,7],2503:[,,{2494:2507,2519:2508}],2507:[[2503,2494]],2508:[[2503,2519]],2509:[,9],2524:[[2465,2492],512],2525:[[2466,2492],512],2527:[[2479,2492],512]},
2560:{2611:[[2610,2620],512],2614:[[2616,2620],512],2620:[,7],2637:[,9],2649:[[2582,2620],512],2650:[[2583,2620],512],2651:[[2588,2620],512],2654:[[2603,2620],512],2748:[,7],2765:[,9],68109:[,220],68111:[,230],68152:[,230],68153:[,1],68154:[,220],68159:[,9],68325:[,230],68326:[,220]},
2816:{2876:[,7],2887:[,,{2878:2891,2902:2888,2903:2892}],2888:[[2887,2902]],2891:[[2887,2878]],2892:[[2887,2903]],2893:[,9],2908:[[2849,2876],512],2909:[[2850,2876],512],2962:[,,{3031:2964}],2964:[[2962,3031]],3014:[,,{3006:3018,3031:3020}],3015:[,,{3006:3019}],3018:[[3014,3006]],3019:[[3015,3006]],3020:[[3014,3031]],3021:[,9]},
3072:{3142:[,,{3158:3144}],3144:[[3142,3158]],3149:[,9],3157:[,84],3158:[,91],3260:[,7],3263:[,,{3285:3264}],3264:[[3263,3285]],3270:[,,{3266:3274,3285:3271,3286:3272}],3271:[[3270,3285]],3272:[[3270,3286]],3274:[[3270,3266],,{3285:3275}],3275:[[3274,3285]],3277:[,9]},
3328:{3398:[,,{3390:3402,3415:3404}],3399:[,,{3390:3403}],3402:[[3398,3390]],3403:[[3399,3390]],3404:[[3398,3415]],3405:[,9],3530:[,9],3545:[,,{3530:3546,3535:3548,3551:3550}],3546:[[3545,3530]],3548:[[3545,3535],,{3530:3549}],3549:[[3548,3530]],3550:[[3545,3551]]},
3584:{3635:[[3661,3634],256],3640:[,103],3641:[,103],3642:[,9],3656:[,107],3657:[,107],3658:[,107],3659:[,107],3763:[[3789,3762],256],3768:[,118],3769:[,118],3784:[,122],3785:[,122],3786:[,122],3787:[,122],3804:[[3755,3737],256],3805:[[3755,3745],256]},
3840:{3852:[[3851],256],3864:[,220],3865:[,220],3893:[,220],3895:[,220],3897:[,216],3907:[[3906,4023],512],3917:[[3916,4023],512],3922:[[3921,4023],512],3927:[[3926,4023],512],3932:[[3931,4023],512],3945:[[3904,4021],512],3953:[,129],3954:[,130],3955:[[3953,3954],512],3956:[,132],3957:[[3953,3956],512],3958:[[4018,3968],512],3959:[[4018,3969],256],3960:[[4019,3968],512],3961:[[4019,3969],256],3962:[,130],3963:[,130],3964:[,130],3965:[,130],3968:[,130],3969:[[3953,3968],512],3970:[,230],3971:[,230],3972:[,9],3974:[,230],3975:[,230],3987:[[3986,4023],512],3997:[[3996,4023],512],4002:[[4001,4023],512],4007:[[4006,4023],512],4012:[[4011,4023],512],4025:[[3984,4021],512],4038:[,220]},
4096:{4133:[,,{4142:4134}],4134:[[4133,4142]],4151:[,7],4153:[,9],4154:[,9],4237:[,220],4348:[[4316],256],69702:[,9],69759:[,9],69785:[,,{69818:69786}],69786:[[69785,69818]],69787:[,,{69818:69788}],69788:[[69787,69818]],69797:[,,{69818:69803}],69803:[[69797,69818]],69817:[,9],69818:[,7]},
4352:{69888:[,230],69889:[,230],69890:[,230],69934:[[69937,69927]],69935:[[69938,69927]],69937:[,,{69927:69934}],69938:[,,{69927:69935}],69939:[,9],69940:[,9],70003:[,7],70080:[,9]},
4608:{70197:[,9],70198:[,7],70377:[,7],70378:[,9]},
4864:{4957:[,230],4958:[,230],4959:[,230],70460:[,7],70471:[,,{70462:70475,70487:70476}],70475:[[70471,70462]],70476:[[70471,70487]],70477:[,9],70502:[,230],70503:[,230],70504:[,230],70505:[,230],70506:[,230],70507:[,230],70508:[,230],70512:[,230],70513:[,230],70514:[,230],70515:[,230],70516:[,230]},
5120:{70841:[,,{70832:70844,70842:70843,70845:70846}],70843:[[70841,70842]],70844:[[70841,70832]],70846:[[70841,70845]],70850:[,9],70851:[,7]},
5376:{71096:[,,{71087:71098}],71097:[,,{71087:71099}],71098:[[71096,71087]],71099:[[71097,71087]],71103:[,9],71104:[,7]},
5632:{71231:[,9],71350:[,9],71351:[,7]},
5888:{5908:[,9],5940:[,9],6098:[,9],6109:[,230]},
6144:{6313:[,228]},
6400:{6457:[,222],6458:[,230],6459:[,220]},
6656:{6679:[,230],6680:[,220],6752:[,9],6773:[,230],6774:[,230],6775:[,230],6776:[,230],6777:[,230],6778:[,230],6779:[,230],6780:[,230],6783:[,220],6832:[,230],6833:[,230],6834:[,230],6835:[,230],6836:[,230],6837:[,220],6838:[,220],6839:[,220],6840:[,220],6841:[,220],6842:[,220],6843:[,230],6844:[,230],6845:[,220]},
6912:{6917:[,,{6965:6918}],6918:[[6917,6965]],6919:[,,{6965:6920}],6920:[[6919,6965]],6921:[,,{6965:6922}],6922:[[6921,6965]],6923:[,,{6965:6924}],6924:[[6923,6965]],6925:[,,{6965:6926}],6926:[[6925,6965]],6929:[,,{6965:6930}],6930:[[6929,6965]],6964:[,7],6970:[,,{6965:6971}],6971:[[6970,6965]],6972:[,,{6965:6973}],6973:[[6972,6965]],6974:[,,{6965:6976}],6975:[,,{6965:6977}],6976:[[6974,6965]],6977:[[6975,6965]],6978:[,,{6965:6979}],6979:[[6978,6965]],6980:[,9],7019:[,230],7020:[,220],7021:[,230],7022:[,230],7023:[,230],7024:[,230],7025:[,230],7026:[,230],7027:[,230],7082:[,9],7083:[,9],7142:[,7],7154:[,9],7155:[,9]},
7168:{7223:[,7],7376:[,230],7377:[,230],7378:[,230],7380:[,1],7381:[,220],7382:[,220],7383:[,220],7384:[,220],7385:[,220],7386:[,230],7387:[,230],7388:[,220],7389:[,220],7390:[,220],7391:[,220],7392:[,230],7394:[,1],7395:[,1],7396:[,1],7397:[,1],7398:[,1],7399:[,1],7400:[,1],7405:[,220],7412:[,230],7416:[,230],7417:[,230]},
7424:{7468:[[65],256],7469:[[198],256],7470:[[66],256],7472:[[68],256],7473:[[69],256],7474:[[398],256],7475:[[71],256],7476:[[72],256],7477:[[73],256],7478:[[74],256],7479:[[75],256],7480:[[76],256],7481:[[77],256],7482:[[78],256],7484:[[79],256],7485:[[546],256],7486:[[80],256],7487:[[82],256],7488:[[84],256],7489:[[85],256],7490:[[87],256],7491:[[97],256],7492:[[592],256],7493:[[593],256],7494:[[7426],256],7495:[[98],256],7496:[[100],256],7497:[[101],256],7498:[[601],256],7499:[[603],256],7500:[[604],256],7501:[[103],256],7503:[[107],256],7504:[[109],256],7505:[[331],256],7506:[[111],256],7507:[[596],256],7508:[[7446],256],7509:[[7447],256],7510:[[112],256],7511:[[116],256],7512:[[117],256],7513:[[7453],256],7514:[[623],256],7515:[[118],256],7516:[[7461],256],7517:[[946],256],7518:[[947],256],7519:[[948],256],7520:[[966],256],7521:[[967],256],7522:[[105],256],7523:[[114],256],7524:[[117],256],7525:[[118],256],7526:[[946],256],7527:[[947],256],7528:[[961],256],7529:[[966],256],7530:[[967],256],7544:[[1085],256],7579:[[594],256],7580:[[99],256],7581:[[597],256],7582:[[240],256],7583:[[604],256],7584:[[102],256],7585:[[607],256],7586:[[609],256],7587:[[613],256],7588:[[616],256],7589:[[617],256],7590:[[618],256],7591:[[7547],256],7592:[[669],256],7593:[[621],256],7594:[[7557],256],7595:[[671],256],7596:[[625],256],7597:[[624],256],7598:[[626],256],7599:[[627],256],7600:[[628],256],7601:[[629],256],7602:[[632],256],7603:[[642],256],7604:[[643],256],7605:[[427],256],7606:[[649],256],7607:[[650],256],7608:[[7452],256],7609:[[651],256],7610:[[652],256],7611:[[122],256],7612:[[656],256],7613:[[657],256],7614:[[658],256],7615:[[952],256],7616:[,230],7617:[,230],7618:[,220],7619:[,230],7620:[,230],7621:[,230],7622:[,230],7623:[,230],7624:[,230],7625:[,230],7626:[,220],7627:[,230],7628:[,230],7629:[,234],7630:[,214],7631:[,220],7632:[,202],7633:[,230],7634:[,230],7635:[,230],7636:[,230],7637:[,230],7638:[,230],7639:[,230],7640:[,230],7641:[,230],7642:[,230],7643:[,230],7644:[,230],7645:[,230],7646:[,230],7647:[,230],7648:[,230],7649:[,230],7650:[,230],7651:[,230],7652:[,230],7653:[,230],7654:[,230],7655:[,230],7656:[,230],7657:[,230],7658:[,230],7659:[,230],7660:[,230],7661:[,230],7662:[,230],7663:[,230],7664:[,230],7665:[,230],7666:[,230],7667:[,230],7668:[,230],7669:[,230],7676:[,233],7677:[,220],7678:[,230],7679:[,220]},
7680:{7680:[[65,805]],7681:[[97,805]],7682:[[66,775]],7683:[[98,775]],7684:[[66,803]],7685:[[98,803]],7686:[[66,817]],7687:[[98,817]],7688:[[199,769]],7689:[[231,769]],7690:[[68,775]],7691:[[100,775]],7692:[[68,803]],7693:[[100,803]],7694:[[68,817]],7695:[[100,817]],7696:[[68,807]],7697:[[100,807]],7698:[[68,813]],7699:[[100,813]],7700:[[274,768]],7701:[[275,768]],7702:[[274,769]],7703:[[275,769]],7704:[[69,813]],7705:[[101,813]],7706:[[69,816]],7707:[[101,816]],7708:[[552,774]],7709:[[553,774]],7710:[[70,775]],7711:[[102,775]],7712:[[71,772]],7713:[[103,772]],7714:[[72,775]],7715:[[104,775]],7716:[[72,803]],7717:[[104,803]],7718:[[72,776]],7719:[[104,776]],7720:[[72,807]],7721:[[104,807]],7722:[[72,814]],7723:[[104,814]],7724:[[73,816]],7725:[[105,816]],7726:[[207,769]],7727:[[239,769]],7728:[[75,769]],7729:[[107,769]],7730:[[75,803]],7731:[[107,803]],7732:[[75,817]],7733:[[107,817]],7734:[[76,803],,{772:7736}],7735:[[108,803],,{772:7737}],7736:[[7734,772]],7737:[[7735,772]],7738:[[76,817]],7739:[[108,817]],7740:[[76,813]],7741:[[108,813]],7742:[[77,769]],7743:[[109,769]],7744:[[77,775]],7745:[[109,775]],7746:[[77,803]],7747:[[109,803]],7748:[[78,775]],7749:[[110,775]],7750:[[78,803]],7751:[[110,803]],7752:[[78,817]],7753:[[110,817]],7754:[[78,813]],7755:[[110,813]],7756:[[213,769]],7757:[[245,769]],7758:[[213,776]],7759:[[245,776]],7760:[[332,768]],7761:[[333,768]],7762:[[332,769]],7763:[[333,769]],7764:[[80,769]],7765:[[112,769]],7766:[[80,775]],7767:[[112,775]],7768:[[82,775]],7769:[[114,775]],7770:[[82,803],,{772:7772}],7771:[[114,803],,{772:7773}],7772:[[7770,772]],7773:[[7771,772]],7774:[[82,817]],7775:[[114,817]],7776:[[83,775]],7777:[[115,775]],7778:[[83,803],,{775:7784}],7779:[[115,803],,{775:7785}],7780:[[346,775]],7781:[[347,775]],7782:[[352,775]],7783:[[353,775]],7784:[[7778,775]],7785:[[7779,775]],7786:[[84,775]],7787:[[116,775]],7788:[[84,803]],7789:[[116,803]],7790:[[84,817]],7791:[[116,817]],7792:[[84,813]],7793:[[116,813]],7794:[[85,804]],7795:[[117,804]],7796:[[85,816]],7797:[[117,816]],7798:[[85,813]],7799:[[117,813]],7800:[[360,769]],7801:[[361,769]],7802:[[362,776]],7803:[[363,776]],7804:[[86,771]],7805:[[118,771]],7806:[[86,803]],7807:[[118,803]],7808:[[87,768]],7809:[[119,768]],7810:[[87,769]],7811:[[119,769]],7812:[[87,776]],7813:[[119,776]],7814:[[87,775]],7815:[[119,775]],7816:[[87,803]],7817:[[119,803]],7818:[[88,775]],7819:[[120,775]],7820:[[88,776]],7821:[[120,776]],7822:[[89,775]],7823:[[121,775]],7824:[[90,770]],7825:[[122,770]],7826:[[90,803]],7827:[[122,803]],7828:[[90,817]],7829:[[122,817]],7830:[[104,817]],7831:[[116,776]],7832:[[119,778]],7833:[[121,778]],7834:[[97,702],256],7835:[[383,775]],7840:[[65,803],,{770:7852,774:7862}],7841:[[97,803],,{770:7853,774:7863}],7842:[[65,777]],7843:[[97,777]],7844:[[194,769]],7845:[[226,769]],7846:[[194,768]],7847:[[226,768]],7848:[[194,777]],7849:[[226,777]],7850:[[194,771]],7851:[[226,771]],7852:[[7840,770]],7853:[[7841,770]],7854:[[258,769]],7855:[[259,769]],7856:[[258,768]],7857:[[259,768]],7858:[[258,777]],7859:[[259,777]],7860:[[258,771]],7861:[[259,771]],7862:[[7840,774]],7863:[[7841,774]],7864:[[69,803],,{770:7878}],7865:[[101,803],,{770:7879}],7866:[[69,777]],7867:[[101,777]],7868:[[69,771]],7869:[[101,771]],7870:[[202,769]],7871:[[234,769]],7872:[[202,768]],7873:[[234,768]],7874:[[202,777]],7875:[[234,777]],7876:[[202,771]],7877:[[234,771]],7878:[[7864,770]],7879:[[7865,770]],7880:[[73,777]],7881:[[105,777]],7882:[[73,803]],7883:[[105,803]],7884:[[79,803],,{770:7896}],7885:[[111,803],,{770:7897}],7886:[[79,777]],7887:[[111,777]],7888:[[212,769]],7889:[[244,769]],7890:[[212,768]],7891:[[244,768]],7892:[[212,777]],7893:[[244,777]],7894:[[212,771]],7895:[[244,771]],7896:[[7884,770]],7897:[[7885,770]],7898:[[416,769]],7899:[[417,769]],7900:[[416,768]],7901:[[417,768]],7902:[[416,777]],7903:[[417,777]],7904:[[416,771]],7905:[[417,771]],7906:[[416,803]],7907:[[417,803]],7908:[[85,803]],7909:[[117,803]],7910:[[85,777]],7911:[[117,777]],7912:[[431,769]],7913:[[432,769]],7914:[[431,768]],7915:[[432,768]],7916:[[431,777]],7917:[[432,777]],7918:[[431,771]],7919:[[432,771]],7920:[[431,803]],7921:[[432,803]],7922:[[89,768]],7923:[[121,768]],7924:[[89,803]],7925:[[121,803]],7926:[[89,777]],7927:[[121,777]],7928:[[89,771]],7929:[[121,771]]},
7936:{7936:[[945,787],,{768:7938,769:7940,834:7942,837:8064}],7937:[[945,788],,{768:7939,769:7941,834:7943,837:8065}],7938:[[7936,768],,{837:8066}],7939:[[7937,768],,{837:8067}],7940:[[7936,769],,{837:8068}],7941:[[7937,769],,{837:8069}],7942:[[7936,834],,{837:8070}],7943:[[7937,834],,{837:8071}],7944:[[913,787],,{768:7946,769:7948,834:7950,837:8072}],7945:[[913,788],,{768:7947,769:7949,834:7951,837:8073}],7946:[[7944,768],,{837:8074}],7947:[[7945,768],,{837:8075}],7948:[[7944,769],,{837:8076}],7949:[[7945,769],,{837:8077}],7950:[[7944,834],,{837:8078}],7951:[[7945,834],,{837:8079}],7952:[[949,787],,{768:7954,769:7956}],7953:[[949,788],,{768:7955,769:7957}],7954:[[7952,768]],7955:[[7953,768]],7956:[[7952,769]],7957:[[7953,769]],7960:[[917,787],,{768:7962,769:7964}],7961:[[917,788],,{768:7963,769:7965}],7962:[[7960,768]],7963:[[7961,768]],7964:[[7960,769]],7965:[[7961,769]],7968:[[951,787],,{768:7970,769:7972,834:7974,837:8080}],7969:[[951,788],,{768:7971,769:7973,834:7975,837:8081}],7970:[[7968,768],,{837:8082}],7971:[[7969,768],,{837:8083}],7972:[[7968,769],,{837:8084}],7973:[[7969,769],,{837:8085}],7974:[[7968,834],,{837:8086}],7975:[[7969,834],,{837:8087}],7976:[[919,787],,{768:7978,769:7980,834:7982,837:8088}],7977:[[919,788],,{768:7979,769:7981,834:7983,837:8089}],7978:[[7976,768],,{837:8090}],7979:[[7977,768],,{837:8091}],7980:[[7976,769],,{837:8092}],7981:[[7977,769],,{837:8093}],7982:[[7976,834],,{837:8094}],7983:[[7977,834],,{837:8095}],7984:[[953,787],,{768:7986,769:7988,834:7990}],7985:[[953,788],,{768:7987,769:7989,834:7991}],7986:[[7984,768]],7987:[[7985,768]],7988:[[7984,769]],7989:[[7985,769]],7990:[[7984,834]],7991:[[7985,834]],7992:[[921,787],,{768:7994,769:7996,834:7998}],7993:[[921,788],,{768:7995,769:7997,834:7999}],7994:[[7992,768]],7995:[[7993,768]],7996:[[7992,769]],7997:[[7993,769]],7998:[[7992,834]],7999:[[7993,834]],8000:[[959,787],,{768:8002,769:8004}],8001:[[959,788],,{768:8003,769:8005}],8002:[[8000,768]],8003:[[8001,768]],8004:[[8000,769]],8005:[[8001,769]],8008:[[927,787],,{768:8010,769:8012}],8009:[[927,788],,{768:8011,769:8013}],8010:[[8008,768]],8011:[[8009,768]],8012:[[8008,769]],8013:[[8009,769]],8016:[[965,787],,{768:8018,769:8020,834:8022}],8017:[[965,788],,{768:8019,769:8021,834:8023}],8018:[[8016,768]],8019:[[8017,768]],8020:[[8016,769]],8021:[[8017,769]],8022:[[8016,834]],8023:[[8017,834]],8025:[[933,788],,{768:8027,769:8029,834:8031}],8027:[[8025,768]],8029:[[8025,769]],8031:[[8025,834]],8032:[[969,787],,{768:8034,769:8036,834:8038,837:8096}],8033:[[969,788],,{768:8035,769:8037,834:8039,837:8097}],8034:[[8032,768],,{837:8098}],8035:[[8033,768],,{837:8099}],8036:[[8032,769],,{837:8100}],8037:[[8033,769],,{837:8101}],8038:[[8032,834],,{837:8102}],8039:[[8033,834],,{837:8103}],8040:[[937,787],,{768:8042,769:8044,834:8046,837:8104}],8041:[[937,788],,{768:8043,769:8045,834:8047,837:8105}],8042:[[8040,768],,{837:8106}],8043:[[8041,768],,{837:8107}],8044:[[8040,769],,{837:8108}],8045:[[8041,769],,{837:8109}],8046:[[8040,834],,{837:8110}],8047:[[8041,834],,{837:8111}],8048:[[945,768],,{837:8114}],8049:[[940]],8050:[[949,768]],8051:[[941]],8052:[[951,768],,{837:8130}],8053:[[942]],8054:[[953,768]],8055:[[943]],8056:[[959,768]],8057:[[972]],8058:[[965,768]],8059:[[973]],8060:[[969,768],,{837:8178}],8061:[[974]],8064:[[7936,837]],8065:[[7937,837]],8066:[[7938,837]],8067:[[7939,837]],8068:[[7940,837]],8069:[[7941,837]],8070:[[7942,837]],8071:[[7943,837]],8072:[[7944,837]],8073:[[7945,837]],8074:[[7946,837]],8075:[[7947,837]],8076:[[7948,837]],8077:[[7949,837]],8078:[[7950,837]],8079:[[7951,837]],8080:[[7968,837]],8081:[[7969,837]],8082:[[7970,837]],8083:[[7971,837]],8084:[[7972,837]],8085:[[7973,837]],8086:[[7974,837]],8087:[[7975,837]],8088:[[7976,837]],8089:[[7977,837]],8090:[[7978,837]],8091:[[7979,837]],8092:[[7980,837]],8093:[[7981,837]],8094:[[7982,837]],8095:[[7983,837]],8096:[[8032,837]],8097:[[8033,837]],8098:[[8034,837]],8099:[[8035,837]],8100:[[8036,837]],8101:[[8037,837]],8102:[[8038,837]],8103:[[8039,837]],8104:[[8040,837]],8105:[[8041,837]],8106:[[8042,837]],8107:[[8043,837]],8108:[[8044,837]],8109:[[8045,837]],8110:[[8046,837]],8111:[[8047,837]],8112:[[945,774]],8113:[[945,772]],8114:[[8048,837]],8115:[[945,837]],8116:[[940,837]],8118:[[945,834],,{837:8119}],8119:[[8118,837]],8120:[[913,774]],8121:[[913,772]],8122:[[913,768]],8123:[[902]],8124:[[913,837]],8125:[[32,787],256],8126:[[953]],8127:[[32,787],256,{768:8141,769:8142,834:8143}],8128:[[32,834],256],8129:[[168,834]],8130:[[8052,837]],8131:[[951,837]],8132:[[942,837]],8134:[[951,834],,{837:8135}],8135:[[8134,837]],8136:[[917,768]],8137:[[904]],8138:[[919,768]],8139:[[905]],8140:[[919,837]],8141:[[8127,768]],8142:[[8127,769]],8143:[[8127,834]],8144:[[953,774]],8145:[[953,772]],8146:[[970,768]],8147:[[912]],8150:[[953,834]],8151:[[970,834]],8152:[[921,774]],8153:[[921,772]],8154:[[921,768]],8155:[[906]],8157:[[8190,768]],8158:[[8190,769]],8159:[[8190,834]],8160:[[965,774]],8161:[[965,772]],8162:[[971,768]],8163:[[944]],8164:[[961,787]],8165:[[961,788]],8166:[[965,834]],8167:[[971,834]],8168:[[933,774]],8169:[[933,772]],8170:[[933,768]],8171:[[910]],8172:[[929,788]],8173:[[168,768]],8174:[[901]],8175:[[96]],8178:[[8060,837]],8179:[[969,837]],8180:[[974,837]],8182:[[969,834],,{837:8183}],8183:[[8182,837]],8184:[[927,768]],8185:[[908]],8186:[[937,768]],8187:[[911]],8188:[[937,837]],8189:[[180]],8190:[[32,788],256,{768:8157,769:8158,834:8159}]},
8192:{8192:[[8194]],8193:[[8195]],8194:[[32],256],8195:[[32],256],8196:[[32],256],8197:[[32],256],8198:[[32],256],8199:[[32],256],8200:[[32],256],8201:[[32],256],8202:[[32],256],8209:[[8208],256],8215:[[32,819],256],8228:[[46],256],8229:[[46,46],256],8230:[[46,46,46],256],8239:[[32],256],8243:[[8242,8242],256],8244:[[8242,8242,8242],256],8246:[[8245,8245],256],8247:[[8245,8245,8245],256],8252:[[33,33],256],8254:[[32,773],256],8263:[[63,63],256],8264:[[63,33],256],8265:[[33,63],256],8279:[[8242,8242,8242,8242],256],8287:[[32],256],8304:[[48],256],8305:[[105],256],8308:[[52],256],8309:[[53],256],8310:[[54],256],8311:[[55],256],8312:[[56],256],8313:[[57],256],8314:[[43],256],8315:[[8722],256],8316:[[61],256],8317:[[40],256],8318:[[41],256],8319:[[110],256],8320:[[48],256],8321:[[49],256],8322:[[50],256],8323:[[51],256],8324:[[52],256],8325:[[53],256],8326:[[54],256],8327:[[55],256],8328:[[56],256],8329:[[57],256],8330:[[43],256],8331:[[8722],256],8332:[[61],256],8333:[[40],256],8334:[[41],256],8336:[[97],256],8337:[[101],256],8338:[[111],256],8339:[[120],256],8340:[[601],256],8341:[[104],256],8342:[[107],256],8343:[[108],256],8344:[[109],256],8345:[[110],256],8346:[[112],256],8347:[[115],256],8348:[[116],256],8360:[[82,115],256],8400:[,230],8401:[,230],8402:[,1],8403:[,1],8404:[,230],8405:[,230],8406:[,230],8407:[,230],8408:[,1],8409:[,1],8410:[,1],8411:[,230],8412:[,230],8417:[,230],8421:[,1],8422:[,1],8423:[,230],8424:[,220],8425:[,230],8426:[,1],8427:[,1],8428:[,220],8429:[,220],8430:[,220],8431:[,220],8432:[,230]},
8448:{8448:[[97,47,99],256],8449:[[97,47,115],256],8450:[[67],256],8451:[[176,67],256],8453:[[99,47,111],256],8454:[[99,47,117],256],8455:[[400],256],8457:[[176,70],256],8458:[[103],256],8459:[[72],256],8460:[[72],256],8461:[[72],256],8462:[[104],256],8463:[[295],256],8464:[[73],256],8465:[[73],256],8466:[[76],256],8467:[[108],256],8469:[[78],256],8470:[[78,111],256],8473:[[80],256],8474:[[81],256],8475:[[82],256],8476:[[82],256],8477:[[82],256],8480:[[83,77],256],8481:[[84,69,76],256],8482:[[84,77],256],8484:[[90],256],8486:[[937]],8488:[[90],256],8490:[[75]],8491:[[197]],8492:[[66],256],8493:[[67],256],8495:[[101],256],8496:[[69],256],8497:[[70],256],8499:[[77],256],8500:[[111],256],8501:[[1488],256],8502:[[1489],256],8503:[[1490],256],8504:[[1491],256],8505:[[105],256],8507:[[70,65,88],256],8508:[[960],256],8509:[[947],256],8510:[[915],256],8511:[[928],256],8512:[[8721],256],8517:[[68],256],8518:[[100],256],8519:[[101],256],8520:[[105],256],8521:[[106],256],8528:[[49,8260,55],256],8529:[[49,8260,57],256],8530:[[49,8260,49,48],256],8531:[[49,8260,51],256],8532:[[50,8260,51],256],8533:[[49,8260,53],256],8534:[[50,8260,53],256],8535:[[51,8260,53],256],8536:[[52,8260,53],256],8537:[[49,8260,54],256],8538:[[53,8260,54],256],8539:[[49,8260,56],256],8540:[[51,8260,56],256],8541:[[53,8260,56],256],8542:[[55,8260,56],256],8543:[[49,8260],256],8544:[[73],256],8545:[[73,73],256],8546:[[73,73,73],256],8547:[[73,86],256],8548:[[86],256],8549:[[86,73],256],8550:[[86,73,73],256],8551:[[86,73,73,73],256],8552:[[73,88],256],8553:[[88],256],8554:[[88,73],256],8555:[[88,73,73],256],8556:[[76],256],8557:[[67],256],8558:[[68],256],8559:[[77],256],8560:[[105],256],8561:[[105,105],256],8562:[[105,105,105],256],8563:[[105,118],256],8564:[[118],256],8565:[[118,105],256],8566:[[118,105,105],256],8567:[[118,105,105,105],256],8568:[[105,120],256],8569:[[120],256],8570:[[120,105],256],8571:[[120,105,105],256],8572:[[108],256],8573:[[99],256],8574:[[100],256],8575:[[109],256],8585:[[48,8260,51],256],8592:[,,{824:8602}],8594:[,,{824:8603}],8596:[,,{824:8622}],8602:[[8592,824]],8603:[[8594,824]],8622:[[8596,824]],8653:[[8656,824]],8654:[[8660,824]],8655:[[8658,824]],8656:[,,{824:8653}],8658:[,,{824:8655}],8660:[,,{824:8654}]},
8704:{8707:[,,{824:8708}],8708:[[8707,824]],8712:[,,{824:8713}],8713:[[8712,824]],8715:[,,{824:8716}],8716:[[8715,824]],8739:[,,{824:8740}],8740:[[8739,824]],8741:[,,{824:8742}],8742:[[8741,824]],8748:[[8747,8747],256],8749:[[8747,8747,8747],256],8751:[[8750,8750],256],8752:[[8750,8750,8750],256],8764:[,,{824:8769}],8769:[[8764,824]],8771:[,,{824:8772}],8772:[[8771,824]],8773:[,,{824:8775}],8775:[[8773,824]],8776:[,,{824:8777}],8777:[[8776,824]],8781:[,,{824:8813}],8800:[[61,824]],8801:[,,{824:8802}],8802:[[8801,824]],8804:[,,{824:8816}],8805:[,,{824:8817}],8813:[[8781,824]],8814:[[60,824]],8815:[[62,824]],8816:[[8804,824]],8817:[[8805,824]],8818:[,,{824:8820}],8819:[,,{824:8821}],8820:[[8818,824]],8821:[[8819,824]],8822:[,,{824:8824}],8823:[,,{824:8825}],8824:[[8822,824]],8825:[[8823,824]],8826:[,,{824:8832}],8827:[,,{824:8833}],8828:[,,{824:8928}],8829:[,,{824:8929}],8832:[[8826,824]],8833:[[8827,824]],8834:[,,{824:8836}],8835:[,,{824:8837}],8836:[[8834,824]],8837:[[8835,824]],8838:[,,{824:8840}],8839:[,,{824:8841}],8840:[[8838,824]],8841:[[8839,824]],8849:[,,{824:8930}],8850:[,,{824:8931}],8866:[,,{824:8876}],8872:[,,{824:8877}],8873:[,,{824:8878}],8875:[,,{824:8879}],8876:[[8866,824]],8877:[[8872,824]],8878:[[8873,824]],8879:[[8875,824]],8882:[,,{824:8938}],8883:[,,{824:8939}],8884:[,,{824:8940}],8885:[,,{824:8941}],8928:[[8828,824]],8929:[[8829,824]],8930:[[8849,824]],8931:[[8850,824]],8938:[[8882,824]],8939:[[8883,824]],8940:[[8884,824]],8941:[[8885,824]]},
8960:{9001:[[12296]],9002:[[12297]]},
9216:{9312:[[49],256],9313:[[50],256],9314:[[51],256],9315:[[52],256],9316:[[53],256],9317:[[54],256],9318:[[55],256],9319:[[56],256],9320:[[57],256],9321:[[49,48],256],9322:[[49,49],256],9323:[[49,50],256],9324:[[49,51],256],9325:[[49,52],256],9326:[[49,53],256],9327:[[49,54],256],9328:[[49,55],256],9329:[[49,56],256],9330:[[49,57],256],9331:[[50,48],256],9332:[[40,49,41],256],9333:[[40,50,41],256],9334:[[40,51,41],256],9335:[[40,52,41],256],9336:[[40,53,41],256],9337:[[40,54,41],256],9338:[[40,55,41],256],9339:[[40,56,41],256],9340:[[40,57,41],256],9341:[[40,49,48,41],256],9342:[[40,49,49,41],256],9343:[[40,49,50,41],256],9344:[[40,49,51,41],256],9345:[[40,49,52,41],256],9346:[[40,49,53,41],256],9347:[[40,49,54,41],256],9348:[[40,49,55,41],256],9349:[[40,49,56,41],256],9350:[[40,49,57,41],256],9351:[[40,50,48,41],256],9352:[[49,46],256],9353:[[50,46],256],9354:[[51,46],256],9355:[[52,46],256],9356:[[53,46],256],9357:[[54,46],256],9358:[[55,46],256],9359:[[56,46],256],9360:[[57,46],256],9361:[[49,48,46],256],9362:[[49,49,46],256],9363:[[49,50,46],256],9364:[[49,51,46],256],9365:[[49,52,46],256],9366:[[49,53,46],256],9367:[[49,54,46],256],9368:[[49,55,46],256],9369:[[49,56,46],256],9370:[[49,57,46],256],9371:[[50,48,46],256],9372:[[40,97,41],256],9373:[[40,98,41],256],9374:[[40,99,41],256],9375:[[40,100,41],256],9376:[[40,101,41],256],9377:[[40,102,41],256],9378:[[40,103,41],256],9379:[[40,104,41],256],9380:[[40,105,41],256],9381:[[40,106,41],256],9382:[[40,107,41],256],9383:[[40,108,41],256],9384:[[40,109,41],256],9385:[[40,110,41],256],9386:[[40,111,41],256],9387:[[40,112,41],256],9388:[[40,113,41],256],9389:[[40,114,41],256],9390:[[40,115,41],256],9391:[[40,116,41],256],9392:[[40,117,41],256],9393:[[40,118,41],256],9394:[[40,119,41],256],9395:[[40,120,41],256],9396:[[40,121,41],256],9397:[[40,122,41],256],9398:[[65],256],9399:[[66],256],9400:[[67],256],9401:[[68],256],9402:[[69],256],9403:[[70],256],9404:[[71],256],9405:[[72],256],9406:[[73],256],9407:[[74],256],9408:[[75],256],9409:[[76],256],9410:[[77],256],9411:[[78],256],9412:[[79],256],9413:[[80],256],9414:[[81],256],9415:[[82],256],9416:[[83],256],9417:[[84],256],9418:[[85],256],9419:[[86],256],9420:[[87],256],9421:[[88],256],9422:[[89],256],9423:[[90],256],9424:[[97],256],9425:[[98],256],9426:[[99],256],9427:[[100],256],9428:[[101],256],9429:[[102],256],9430:[[103],256],9431:[[104],256],9432:[[105],256],9433:[[106],256],9434:[[107],256],9435:[[108],256],9436:[[109],256],9437:[[110],256],9438:[[111],256],9439:[[112],256],9440:[[113],256],9441:[[114],256],9442:[[115],256],9443:[[116],256],9444:[[117],256],9445:[[118],256],9446:[[119],256],9447:[[120],256],9448:[[121],256],9449:[[122],256],9450:[[48],256]},
10752:{10764:[[8747,8747,8747,8747],256],10868:[[58,58,61],256],10869:[[61,61],256],10870:[[61,61,61],256],10972:[[10973,824],512]},
11264:{11388:[[106],256],11389:[[86],256],11503:[,230],11504:[,230],11505:[,230]},
11520:{11631:[[11617],256],11647:[,9],11744:[,230],11745:[,230],11746:[,230],11747:[,230],11748:[,230],11749:[,230],11750:[,230],11751:[,230],11752:[,230],11753:[,230],11754:[,230],11755:[,230],11756:[,230],11757:[,230],11758:[,230],11759:[,230],11760:[,230],11761:[,230],11762:[,230],11763:[,230],11764:[,230],11765:[,230],11766:[,230],11767:[,230],11768:[,230],11769:[,230],11770:[,230],11771:[,230],11772:[,230],11773:[,230],11774:[,230],11775:[,230]},
11776:{11935:[[27597],256],12019:[[40863],256]},
12032:{12032:[[19968],256],12033:[[20008],256],12034:[[20022],256],12035:[[20031],256],12036:[[20057],256],12037:[[20101],256],12038:[[20108],256],12039:[[20128],256],12040:[[20154],256],12041:[[20799],256],12042:[[20837],256],12043:[[20843],256],12044:[[20866],256],12045:[[20886],256],12046:[[20907],256],12047:[[20960],256],12048:[[20981],256],12049:[[20992],256],12050:[[21147],256],12051:[[21241],256],12052:[[21269],256],12053:[[21274],256],12054:[[21304],256],12055:[[21313],256],12056:[[21340],256],12057:[[21353],256],12058:[[21378],256],12059:[[21430],256],12060:[[21448],256],12061:[[21475],256],12062:[[22231],256],12063:[[22303],256],12064:[[22763],256],12065:[[22786],256],12066:[[22794],256],12067:[[22805],256],12068:[[22823],256],12069:[[22899],256],12070:[[23376],256],12071:[[23424],256],12072:[[23544],256],12073:[[23567],256],12074:[[23586],256],12075:[[23608],256],12076:[[23662],256],12077:[[23665],256],12078:[[24027],256],12079:[[24037],256],12080:[[24049],256],12081:[[24062],256],12082:[[24178],256],12083:[[24186],256],12084:[[24191],256],12085:[[24308],256],12086:[[24318],256],12087:[[24331],256],12088:[[24339],256],12089:[[24400],256],12090:[[24417],256],12091:[[24435],256],12092:[[24515],256],12093:[[25096],256],12094:[[25142],256],12095:[[25163],256],12096:[[25903],256],12097:[[25908],256],12098:[[25991],256],12099:[[26007],256],12100:[[26020],256],12101:[[26041],256],12102:[[26080],256],12103:[[26085],256],12104:[[26352],256],12105:[[26376],256],12106:[[26408],256],12107:[[27424],256],12108:[[27490],256],12109:[[27513],256],12110:[[27571],256],12111:[[27595],256],12112:[[27604],256],12113:[[27611],256],12114:[[27663],256],12115:[[27668],256],12116:[[27700],256],12117:[[28779],256],12118:[[29226],256],12119:[[29238],256],12120:[[29243],256],12121:[[29247],256],12122:[[29255],256],12123:[[29273],256],12124:[[29275],256],12125:[[29356],256],12126:[[29572],256],12127:[[29577],256],12128:[[29916],256],12129:[[29926],256],12130:[[29976],256],12131:[[29983],256],12132:[[29992],256],12133:[[30000],256],12134:[[30091],256],12135:[[30098],256],12136:[[30326],256],12137:[[30333],256],12138:[[30382],256],12139:[[30399],256],12140:[[30446],256],12141:[[30683],256],12142:[[30690],256],12143:[[30707],256],12144:[[31034],256],12145:[[31160],256],12146:[[31166],256],12147:[[31348],256],12148:[[31435],256],12149:[[31481],256],12150:[[31859],256],12151:[[31992],256],12152:[[32566],256],12153:[[32593],256],12154:[[32650],256],12155:[[32701],256],12156:[[32769],256],12157:[[32780],256],12158:[[32786],256],12159:[[32819],256],12160:[[32895],256],12161:[[32905],256],12162:[[33251],256],12163:[[33258],256],12164:[[33267],256],12165:[[33276],256],12166:[[33292],256],12167:[[33307],256],12168:[[33311],256],12169:[[33390],256],12170:[[33394],256],12171:[[33400],256],12172:[[34381],256],12173:[[34411],256],12174:[[34880],256],12175:[[34892],256],12176:[[34915],256],12177:[[35198],256],12178:[[35211],256],12179:[[35282],256],12180:[[35328],256],12181:[[35895],256],12182:[[35910],256],12183:[[35925],256],12184:[[35960],256],12185:[[35997],256],12186:[[36196],256],12187:[[36208],256],12188:[[36275],256],12189:[[36523],256],12190:[[36554],256],12191:[[36763],256],12192:[[36784],256],12193:[[36789],256],12194:[[37009],256],12195:[[37193],256],12196:[[37318],256],12197:[[37324],256],12198:[[37329],256],12199:[[38263],256],12200:[[38272],256],12201:[[38428],256],12202:[[38582],256],12203:[[38585],256],12204:[[38632],256],12205:[[38737],256],12206:[[38750],256],12207:[[38754],256],12208:[[38761],256],12209:[[38859],256],12210:[[38893],256],12211:[[38899],256],12212:[[38913],256],12213:[[39080],256],12214:[[39131],256],12215:[[39135],256],12216:[[39318],256],12217:[[39321],256],12218:[[39340],256],12219:[[39592],256],12220:[[39640],256],12221:[[39647],256],12222:[[39717],256],12223:[[39727],256],12224:[[39730],256],12225:[[39740],256],12226:[[39770],256],12227:[[40165],256],12228:[[40565],256],12229:[[40575],256],12230:[[40613],256],12231:[[40635],256],12232:[[40643],256],12233:[[40653],256],12234:[[40657],256],12235:[[40697],256],12236:[[40701],256],12237:[[40718],256],12238:[[40723],256],12239:[[40736],256],12240:[[40763],256],12241:[[40778],256],12242:[[40786],256],12243:[[40845],256],12244:[[40860],256],12245:[[40864],256]},
12288:{12288:[[32],256],12330:[,218],12331:[,228],12332:[,232],12333:[,222],12334:[,224],12335:[,224],12342:[[12306],256],12344:[[21313],256],12345:[[21316],256],12346:[[21317],256],12358:[,,{12441:12436}],12363:[,,{12441:12364}],12364:[[12363,12441]],12365:[,,{12441:12366}],12366:[[12365,12441]],12367:[,,{12441:12368}],12368:[[12367,12441]],12369:[,,{12441:12370}],12370:[[12369,12441]],12371:[,,{12441:12372}],12372:[[12371,12441]],12373:[,,{12441:12374}],12374:[[12373,12441]],12375:[,,{12441:12376}],12376:[[12375,12441]],12377:[,,{12441:12378}],12378:[[12377,12441]],12379:[,,{12441:12380}],12380:[[12379,12441]],12381:[,,{12441:12382}],12382:[[12381,12441]],12383:[,,{12441:12384}],12384:[[12383,12441]],12385:[,,{12441:12386}],12386:[[12385,12441]],12388:[,,{12441:12389}],12389:[[12388,12441]],12390:[,,{12441:12391}],12391:[[12390,12441]],12392:[,,{12441:12393}],12393:[[12392,12441]],12399:[,,{12441:12400,12442:12401}],12400:[[12399,12441]],12401:[[12399,12442]],12402:[,,{12441:12403,12442:12404}],12403:[[12402,12441]],12404:[[12402,12442]],12405:[,,{12441:12406,12442:12407}],12406:[[12405,12441]],12407:[[12405,12442]],12408:[,,{12441:12409,12442:12410}],12409:[[12408,12441]],12410:[[12408,12442]],12411:[,,{12441:12412,12442:12413}],12412:[[12411,12441]],12413:[[12411,12442]],12436:[[12358,12441]],12441:[,8],12442:[,8],12443:[[32,12441],256],12444:[[32,12442],256],12445:[,,{12441:12446}],12446:[[12445,12441]],12447:[[12424,12426],256],12454:[,,{12441:12532}],12459:[,,{12441:12460}],12460:[[12459,12441]],12461:[,,{12441:12462}],12462:[[12461,12441]],12463:[,,{12441:12464}],12464:[[12463,12441]],12465:[,,{12441:12466}],12466:[[12465,12441]],12467:[,,{12441:12468}],12468:[[12467,12441]],12469:[,,{12441:12470}],12470:[[12469,12441]],12471:[,,{12441:12472}],12472:[[12471,12441]],12473:[,,{12441:12474}],12474:[[12473,12441]],12475:[,,{12441:12476}],12476:[[12475,12441]],12477:[,,{12441:12478}],12478:[[12477,12441]],12479:[,,{12441:12480}],12480:[[12479,12441]],12481:[,,{12441:12482}],12482:[[12481,12441]],12484:[,,{12441:12485}],12485:[[12484,12441]],12486:[,,{12441:12487}],12487:[[12486,12441]],12488:[,,{12441:12489}],12489:[[12488,12441]],12495:[,,{12441:12496,12442:12497}],12496:[[12495,12441]],12497:[[12495,12442]],12498:[,,{12441:12499,12442:12500}],12499:[[12498,12441]],12500:[[12498,12442]],12501:[,,{12441:12502,12442:12503}],12502:[[12501,12441]],12503:[[12501,12442]],12504:[,,{12441:12505,12442:12506}],12505:[[12504,12441]],12506:[[12504,12442]],12507:[,,{12441:12508,12442:12509}],12508:[[12507,12441]],12509:[[12507,12442]],12527:[,,{12441:12535}],12528:[,,{12441:12536}],12529:[,,{12441:12537}],12530:[,,{12441:12538}],12532:[[12454,12441]],12535:[[12527,12441]],12536:[[12528,12441]],12537:[[12529,12441]],12538:[[12530,12441]],12541:[,,{12441:12542}],12542:[[12541,12441]],12543:[[12467,12488],256]},
12544:{12593:[[4352],256],12594:[[4353],256],12595:[[4522],256],12596:[[4354],256],12597:[[4524],256],12598:[[4525],256],12599:[[4355],256],12600:[[4356],256],12601:[[4357],256],12602:[[4528],256],12603:[[4529],256],12604:[[4530],256],12605:[[4531],256],12606:[[4532],256],12607:[[4533],256],12608:[[4378],256],12609:[[4358],256],12610:[[4359],256],12611:[[4360],256],12612:[[4385],256],12613:[[4361],256],12614:[[4362],256],12615:[[4363],256],12616:[[4364],256],12617:[[4365],256],12618:[[4366],256],12619:[[4367],256],12620:[[4368],256],12621:[[4369],256],12622:[[4370],256],12623:[[4449],256],12624:[[4450],256],12625:[[4451],256],12626:[[4452],256],12627:[[4453],256],12628:[[4454],256],12629:[[4455],256],12630:[[4456],256],12631:[[4457],256],12632:[[4458],256],12633:[[4459],256],12634:[[4460],256],12635:[[4461],256],12636:[[4462],256],12637:[[4463],256],12638:[[4464],256],12639:[[4465],256],12640:[[4466],256],12641:[[4467],256],12642:[[4468],256],12643:[[4469],256],12644:[[4448],256],12645:[[4372],256],12646:[[4373],256],12647:[[4551],256],12648:[[4552],256],12649:[[4556],256],12650:[[4558],256],12651:[[4563],256],12652:[[4567],256],12653:[[4569],256],12654:[[4380],256],12655:[[4573],256],12656:[[4575],256],12657:[[4381],256],12658:[[4382],256],12659:[[4384],256],12660:[[4386],256],12661:[[4387],256],12662:[[4391],256],12663:[[4393],256],12664:[[4395],256],12665:[[4396],256],12666:[[4397],256],12667:[[4398],256],12668:[[4399],256],12669:[[4402],256],12670:[[4406],256],12671:[[4416],256],12672:[[4423],256],12673:[[4428],256],12674:[[4593],256],12675:[[4594],256],12676:[[4439],256],12677:[[4440],256],12678:[[4441],256],12679:[[4484],256],12680:[[4485],256],12681:[[4488],256],12682:[[4497],256],12683:[[4498],256],12684:[[4500],256],12685:[[4510],256],12686:[[4513],256],12690:[[19968],256],12691:[[20108],256],12692:[[19977],256],12693:[[22235],256],12694:[[19978],256],12695:[[20013],256],12696:[[19979],256],12697:[[30002],256],12698:[[20057],256],12699:[[19993],256],12700:[[19969],256],12701:[[22825],256],12702:[[22320],256],12703:[[20154],256]},
12800:{12800:[[40,4352,41],256],12801:[[40,4354,41],256],12802:[[40,4355,41],256],12803:[[40,4357,41],256],12804:[[40,4358,41],256],12805:[[40,4359,41],256],12806:[[40,4361,41],256],12807:[[40,4363,41],256],12808:[[40,4364,41],256],12809:[[40,4366,41],256],12810:[[40,4367,41],256],12811:[[40,4368,41],256],12812:[[40,4369,41],256],12813:[[40,4370,41],256],12814:[[40,4352,4449,41],256],12815:[[40,4354,4449,41],256],12816:[[40,4355,4449,41],256],12817:[[40,4357,4449,41],256],12818:[[40,4358,4449,41],256],12819:[[40,4359,4449,41],256],12820:[[40,4361,4449,41],256],12821:[[40,4363,4449,41],256],12822:[[40,4364,4449,41],256],12823:[[40,4366,4449,41],256],12824:[[40,4367,4449,41],256],12825:[[40,4368,4449,41],256],12826:[[40,4369,4449,41],256],12827:[[40,4370,4449,41],256],12828:[[40,4364,4462,41],256],12829:[[40,4363,4457,4364,4453,4523,41],256],12830:[[40,4363,4457,4370,4462,41],256],12832:[[40,19968,41],256],12833:[[40,20108,41],256],12834:[[40,19977,41],256],12835:[[40,22235,41],256],12836:[[40,20116,41],256],12837:[[40,20845,41],256],12838:[[40,19971,41],256],12839:[[40,20843,41],256],12840:[[40,20061,41],256],12841:[[40,21313,41],256],12842:[[40,26376,41],256],12843:[[40,28779,41],256],12844:[[40,27700,41],256],12845:[[40,26408,41],256],12846:[[40,37329,41],256],12847:[[40,22303,41],256],12848:[[40,26085,41],256],12849:[[40,26666,41],256],12850:[[40,26377,41],256],12851:[[40,31038,41],256],12852:[[40,21517,41],256],12853:[[40,29305,41],256],12854:[[40,36001,41],256],12855:[[40,31069,41],256],12856:[[40,21172,41],256],12857:[[40,20195,41],256],12858:[[40,21628,41],256],12859:[[40,23398,41],256],12860:[[40,30435,41],256],12861:[[40,20225,41],256],12862:[[40,36039,41],256],12863:[[40,21332,41],256],12864:[[40,31085,41],256],12865:[[40,20241,41],256],12866:[[40,33258,41],256],12867:[[40,33267,41],256],12868:[[21839],256],12869:[[24188],256],12870:[[25991],256],12871:[[31631],256],12880:[[80,84,69],256],12881:[[50,49],256],12882:[[50,50],256],12883:[[50,51],256],12884:[[50,52],256],12885:[[50,53],256],12886:[[50,54],256],12887:[[50,55],256],12888:[[50,56],256],12889:[[50,57],256],12890:[[51,48],256],12891:[[51,49],256],12892:[[51,50],256],12893:[[51,51],256],12894:[[51,52],256],12895:[[51,53],256],12896:[[4352],256],12897:[[4354],256],12898:[[4355],256],12899:[[4357],256],12900:[[4358],256],12901:[[4359],256],12902:[[4361],256],12903:[[4363],256],12904:[[4364],256],12905:[[4366],256],12906:[[4367],256],12907:[[4368],256],12908:[[4369],256],12909:[[4370],256],12910:[[4352,4449],256],12911:[[4354,4449],256],12912:[[4355,4449],256],12913:[[4357,4449],256],12914:[[4358,4449],256],12915:[[4359,4449],256],12916:[[4361,4449],256],12917:[[4363,4449],256],12918:[[4364,4449],256],12919:[[4366,4449],256],12920:[[4367,4449],256],12921:[[4368,4449],256],12922:[[4369,4449],256],12923:[[4370,4449],256],12924:[[4366,4449,4535,4352,4457],256],12925:[[4364,4462,4363,4468],256],12926:[[4363,4462],256],12928:[[19968],256],12929:[[20108],256],12930:[[19977],256],12931:[[22235],256],12932:[[20116],256],12933:[[20845],256],12934:[[19971],256],12935:[[20843],256],12936:[[20061],256],12937:[[21313],256],12938:[[26376],256],12939:[[28779],256],12940:[[27700],256],12941:[[26408],256],12942:[[37329],256],12943:[[22303],256],12944:[[26085],256],12945:[[26666],256],12946:[[26377],256],12947:[[31038],256],12948:[[21517],256],12949:[[29305],256],12950:[[36001],256],12951:[[31069],256],12952:[[21172],256],12953:[[31192],256],12954:[[30007],256],12955:[[22899],256],12956:[[36969],256],12957:[[20778],256],12958:[[21360],256],12959:[[27880],256],12960:[[38917],256],12961:[[20241],256],12962:[[20889],256],12963:[[27491],256],12964:[[19978],256],12965:[[20013],256],12966:[[19979],256],12967:[[24038],256],12968:[[21491],256],12969:[[21307],256],12970:[[23447],256],12971:[[23398],256],12972:[[30435],256],12973:[[20225],256],12974:[[36039],256],12975:[[21332],256],12976:[[22812],256],12977:[[51,54],256],12978:[[51,55],256],12979:[[51,56],256],12980:[[51,57],256],12981:[[52,48],256],12982:[[52,49],256],12983:[[52,50],256],12984:[[52,51],256],12985:[[52,52],256],12986:[[52,53],256],12987:[[52,54],256],12988:[[52,55],256],12989:[[52,56],256],12990:[[52,57],256],12991:[[53,48],256],12992:[[49,26376],256],12993:[[50,26376],256],12994:[[51,26376],256],12995:[[52,26376],256],12996:[[53,26376],256],12997:[[54,26376],256],12998:[[55,26376],256],12999:[[56,26376],256],13000:[[57,26376],256],13001:[[49,48,26376],256],13002:[[49,49,26376],256],13003:[[49,50,26376],256],13004:[[72,103],256],13005:[[101,114,103],256],13006:[[101,86],256],13007:[[76,84,68],256],13008:[[12450],256],13009:[[12452],256],13010:[[12454],256],13011:[[12456],256],13012:[[12458],256],13013:[[12459],256],13014:[[12461],256],13015:[[12463],256],13016:[[12465],256],13017:[[12467],256],13018:[[12469],256],13019:[[12471],256],13020:[[12473],256],13021:[[12475],256],13022:[[12477],256],13023:[[12479],256],13024:[[12481],256],13025:[[12484],256],13026:[[12486],256],13027:[[12488],256],13028:[[12490],256],13029:[[12491],256],13030:[[12492],256],13031:[[12493],256],13032:[[12494],256],13033:[[12495],256],13034:[[12498],256],13035:[[12501],256],13036:[[12504],256],13037:[[12507],256],13038:[[12510],256],13039:[[12511],256],13040:[[12512],256],13041:[[12513],256],13042:[[12514],256],13043:[[12516],256],13044:[[12518],256],13045:[[12520],256],13046:[[12521],256],13047:[[12522],256],13048:[[12523],256],13049:[[12524],256],13050:[[12525],256],13051:[[12527],256],13052:[[12528],256],13053:[[12529],256],13054:[[12530],256]},
13056:{13056:[[12450,12497,12540,12488],256],13057:[[12450,12523,12501,12449],256],13058:[[12450,12531,12506,12450],256],13059:[[12450,12540,12523],256],13060:[[12452,12491,12531,12464],256],13061:[[12452,12531,12481],256],13062:[[12454,12457,12531],256],13063:[[12456,12473,12463,12540,12489],256],13064:[[12456,12540,12459,12540],256],13065:[[12458,12531,12473],256],13066:[[12458,12540,12512],256],13067:[[12459,12452,12522],256],13068:[[12459,12521,12483,12488],256],13069:[[12459,12525,12522,12540],256],13070:[[12460,12525,12531],256],13071:[[12460,12531,12510],256],13072:[[12462,12460],256],13073:[[12462,12491,12540],256],13074:[[12461,12517,12522,12540],256],13075:[[12462,12523,12480,12540],256],13076:[[12461,12525],256],13077:[[12461,12525,12464,12521,12512],256],13078:[[12461,12525,12513,12540,12488,12523],256],13079:[[12461,12525,12527,12483,12488],256],13080:[[12464,12521,12512],256],13081:[[12464,12521,12512,12488,12531],256],13082:[[12463,12523,12476,12452,12525],256],13083:[[12463,12525,12540,12493],256],13084:[[12465,12540,12473],256],13085:[[12467,12523,12490],256],13086:[[12467,12540,12509],256],13087:[[12469,12452,12463,12523],256],13088:[[12469,12531,12481,12540,12512],256],13089:[[12471,12522,12531,12464],256],13090:[[12475,12531,12481],256],13091:[[12475,12531,12488],256],13092:[[12480,12540,12473],256],13093:[[12487,12471],256],13094:[[12489,12523],256],13095:[[12488,12531],256],13096:[[12490,12494],256],13097:[[12494,12483,12488],256],13098:[[12495,12452,12484],256],13099:[[12497,12540,12475,12531,12488],256],13100:[[12497,12540,12484],256],13101:[[12496,12540,12524,12523],256],13102:[[12500,12450,12473,12488,12523],256],13103:[[12500,12463,12523],256],13104:[[12500,12467],256],13105:[[12499,12523],256],13106:[[12501,12449,12521,12483,12489],256],13107:[[12501,12451,12540,12488],256],13108:[[12502,12483,12471,12455,12523],256],13109:[[12501,12521,12531],256],13110:[[12504,12463,12479,12540,12523],256],13111:[[12506,12477],256],13112:[[12506,12491,12498],256],13113:[[12504,12523,12484],256],13114:[[12506,12531,12473],256],13115:[[12506,12540,12472],256],13116:[[12505,12540,12479],256],13117:[[12509,12452,12531,12488],256],13118:[[12508,12523,12488],256],13119:[[12507,12531],256],13120:[[12509,12531,12489],256],13121:[[12507,12540,12523],256],13122:[[12507,12540,12531],256],13123:[[12510,12452,12463,12525],256],13124:[[12510,12452,12523],256],13125:[[12510,12483,12495],256],13126:[[12510,12523,12463],256],13127:[[12510,12531,12471,12519,12531],256],13128:[[12511,12463,12525,12531],256],13129:[[12511,12522],256],13130:[[12511,12522,12496,12540,12523],256],13131:[[12513,12460],256],13132:[[12513,12460,12488,12531],256],13133:[[12513,12540,12488,12523],256],13134:[[12516,12540,12489],256],13135:[[12516,12540,12523],256],13136:[[12518,12450,12531],256],13137:[[12522,12483,12488,12523],256],13138:[[12522,12521],256],13139:[[12523,12500,12540],256],13140:[[12523,12540,12502,12523],256],13141:[[12524,12512],256],13142:[[12524,12531,12488,12466,12531],256],13143:[[12527,12483,12488],256],13144:[[48,28857],256],13145:[[49,28857],256],13146:[[50,28857],256],13147:[[51,28857],256],13148:[[52,28857],256],13149:[[53,28857],256],13150:[[54,28857],256],13151:[[55,28857],256],13152:[[56,28857],256],13153:[[57,28857],256],13154:[[49,48,28857],256],13155:[[49,49,28857],256],13156:[[49,50,28857],256],13157:[[49,51,28857],256],13158:[[49,52,28857],256],13159:[[49,53,28857],256],13160:[[49,54,28857],256],13161:[[49,55,28857],256],13162:[[49,56,28857],256],13163:[[49,57,28857],256],13164:[[50,48,28857],256],13165:[[50,49,28857],256],13166:[[50,50,28857],256],13167:[[50,51,28857],256],13168:[[50,52,28857],256],13169:[[104,80,97],256],13170:[[100,97],256],13171:[[65,85],256],13172:[[98,97,114],256],13173:[[111,86],256],13174:[[112,99],256],13175:[[100,109],256],13176:[[100,109,178],256],13177:[[100,109,179],256],13178:[[73,85],256],13179:[[24179,25104],256],13180:[[26157,21644],256],13181:[[22823,27491],256],13182:[[26126,27835],256],13183:[[26666,24335,20250,31038],256],13184:[[112,65],256],13185:[[110,65],256],13186:[[956,65],256],13187:[[109,65],256],13188:[[107,65],256],13189:[[75,66],256],13190:[[77,66],256],13191:[[71,66],256],13192:[[99,97,108],256],13193:[[107,99,97,108],256],13194:[[112,70],256],13195:[[110,70],256],13196:[[956,70],256],13197:[[956,103],256],13198:[[109,103],256],13199:[[107,103],256],13200:[[72,122],256],13201:[[107,72,122],256],13202:[[77,72,122],256],13203:[[71,72,122],256],13204:[[84,72,122],256],13205:[[956,8467],256],13206:[[109,8467],256],13207:[[100,8467],256],13208:[[107,8467],256],13209:[[102,109],256],13210:[[110,109],256],13211:[[956,109],256],13212:[[109,109],256],13213:[[99,109],256],13214:[[107,109],256],13215:[[109,109,178],256],13216:[[99,109,178],256],13217:[[109,178],256],13218:[[107,109,178],256],13219:[[109,109,179],256],13220:[[99,109,179],256],13221:[[109,179],256],13222:[[107,109,179],256],13223:[[109,8725,115],256],13224:[[109,8725,115,178],256],13225:[[80,97],256],13226:[[107,80,97],256],13227:[[77,80,97],256],13228:[[71,80,97],256],13229:[[114,97,100],256],13230:[[114,97,100,8725,115],256],13231:[[114,97,100,8725,115,178],256],13232:[[112,115],256],13233:[[110,115],256],13234:[[956,115],256],13235:[[109,115],256],13236:[[112,86],256],13237:[[110,86],256],13238:[[956,86],256],13239:[[109,86],256],13240:[[107,86],256],13241:[[77,86],256],13242:[[112,87],256],13243:[[110,87],256],13244:[[956,87],256],13245:[[109,87],256],13246:[[107,87],256],13247:[[77,87],256],13248:[[107,937],256],13249:[[77,937],256],13250:[[97,46,109,46],256],13251:[[66,113],256],13252:[[99,99],256],13253:[[99,100],256],13254:[[67,8725,107,103],256],13255:[[67,111,46],256],13256:[[100,66],256],13257:[[71,121],256],13258:[[104,97],256],13259:[[72,80],256],13260:[[105,110],256],13261:[[75,75],256],13262:[[75,77],256],13263:[[107,116],256],13264:[[108,109],256],13265:[[108,110],256],13266:[[108,111,103],256],13267:[[108,120],256],13268:[[109,98],256],13269:[[109,105,108],256],13270:[[109,111,108],256],13271:[[80,72],256],13272:[[112,46,109,46],256],13273:[[80,80,77],256],13274:[[80,82],256],13275:[[115,114],256],13276:[[83,118],256],13277:[[87,98],256],13278:[[86,8725,109],256],13279:[[65,8725,109],256],13280:[[49,26085],256],13281:[[50,26085],256],13282:[[51,26085],256],13283:[[52,26085],256],13284:[[53,26085],256],13285:[[54,26085],256],13286:[[55,26085],256],13287:[[56,26085],256],13288:[[57,26085],256],13289:[[49,48,26085],256],13290:[[49,49,26085],256],13291:[[49,50,26085],256],13292:[[49,51,26085],256],13293:[[49,52,26085],256],13294:[[49,53,26085],256],13295:[[49,54,26085],256],13296:[[49,55,26085],256],13297:[[49,56,26085],256],13298:[[49,57,26085],256],13299:[[50,48,26085],256],13300:[[50,49,26085],256],13301:[[50,50,26085],256],13302:[[50,51,26085],256],13303:[[50,52,26085],256],13304:[[50,53,26085],256],13305:[[50,54,26085],256],13306:[[50,55,26085],256],13307:[[50,56,26085],256],13308:[[50,57,26085],256],13309:[[51,48,26085],256],13310:[[51,49,26085],256],13311:[[103,97,108],256]},
27136:{92912:[,1],92913:[,1],92914:[,1],92915:[,1],92916:[,1]},
27392:{92976:[,230],92977:[,230],92978:[,230],92979:[,230],92980:[,230],92981:[,230],92982:[,230]},
42496:{42607:[,230],42612:[,230],42613:[,230],42614:[,230],42615:[,230],42616:[,230],42617:[,230],42618:[,230],42619:[,230],42620:[,230],42621:[,230],42652:[[1098],256],42653:[[1100],256],42655:[,230],42736:[,230],42737:[,230]},
42752:{42864:[[42863],256],43000:[[294],256],43001:[[339],256]},
43008:{43014:[,9],43204:[,9],43232:[,230],43233:[,230],43234:[,230],43235:[,230],43236:[,230],43237:[,230],43238:[,230],43239:[,230],43240:[,230],43241:[,230],43242:[,230],43243:[,230],43244:[,230],43245:[,230],43246:[,230],43247:[,230],43248:[,230],43249:[,230]},
43264:{43307:[,220],43308:[,220],43309:[,220],43347:[,9],43443:[,7],43456:[,9]},
43520:{43696:[,230],43698:[,230],43699:[,230],43700:[,220],43703:[,230],43704:[,230],43710:[,230],43711:[,230],43713:[,230],43766:[,9]},
43776:{43868:[[42791],256],43869:[[43831],256],43870:[[619],256],43871:[[43858],256],44013:[,9]},
48128:{113822:[,1]},
53504:{119134:[[119127,119141],512],119135:[[119128,119141],512],119136:[[119135,119150],512],119137:[[119135,119151],512],119138:[[119135,119152],512],119139:[[119135,119153],512],119140:[[119135,119154],512],119141:[,216],119142:[,216],119143:[,1],119144:[,1],119145:[,1],119149:[,226],119150:[,216],119151:[,216],119152:[,216],119153:[,216],119154:[,216],119163:[,220],119164:[,220],119165:[,220],119166:[,220],119167:[,220],119168:[,220],119169:[,220],119170:[,220],119173:[,230],119174:[,230],119175:[,230],119176:[,230],119177:[,230],119178:[,220],119179:[,220],119210:[,230],119211:[,230],119212:[,230],119213:[,230],119227:[[119225,119141],512],119228:[[119226,119141],512],119229:[[119227,119150],512],119230:[[119228,119150],512],119231:[[119227,119151],512],119232:[[119228,119151],512]},
53760:{119362:[,230],119363:[,230],119364:[,230]},
54272:{119808:[[65],256],119809:[[66],256],119810:[[67],256],119811:[[68],256],119812:[[69],256],119813:[[70],256],119814:[[71],256],119815:[[72],256],119816:[[73],256],119817:[[74],256],119818:[[75],256],119819:[[76],256],119820:[[77],256],119821:[[78],256],119822:[[79],256],119823:[[80],256],119824:[[81],256],119825:[[82],256],119826:[[83],256],119827:[[84],256],119828:[[85],256],119829:[[86],256],119830:[[87],256],119831:[[88],256],119832:[[89],256],119833:[[90],256],119834:[[97],256],119835:[[98],256],119836:[[99],256],119837:[[100],256],119838:[[101],256],119839:[[102],256],119840:[[103],256],119841:[[104],256],119842:[[105],256],119843:[[106],256],119844:[[107],256],119845:[[108],256],119846:[[109],256],119847:[[110],256],119848:[[111],256],119849:[[112],256],119850:[[113],256],119851:[[114],256],119852:[[115],256],119853:[[116],256],119854:[[117],256],119855:[[118],256],119856:[[119],256],119857:[[120],256],119858:[[121],256],119859:[[122],256],119860:[[65],256],119861:[[66],256],119862:[[67],256],119863:[[68],256],119864:[[69],256],119865:[[70],256],119866:[[71],256],119867:[[72],256],119868:[[73],256],119869:[[74],256],119870:[[75],256],119871:[[76],256],119872:[[77],256],119873:[[78],256],119874:[[79],256],119875:[[80],256],119876:[[81],256],119877:[[82],256],119878:[[83],256],119879:[[84],256],119880:[[85],256],119881:[[86],256],119882:[[87],256],119883:[[88],256],119884:[[89],256],119885:[[90],256],119886:[[97],256],119887:[[98],256],119888:[[99],256],119889:[[100],256],119890:[[101],256],119891:[[102],256],119892:[[103],256],119894:[[105],256],119895:[[106],256],119896:[[107],256],119897:[[108],256],119898:[[109],256],119899:[[110],256],119900:[[111],256],119901:[[112],256],119902:[[113],256],119903:[[114],256],119904:[[115],256],119905:[[116],256],119906:[[117],256],119907:[[118],256],119908:[[119],256],119909:[[120],256],119910:[[121],256],119911:[[122],256],119912:[[65],256],119913:[[66],256],119914:[[67],256],119915:[[68],256],119916:[[69],256],119917:[[70],256],119918:[[71],256],119919:[[72],256],119920:[[73],256],119921:[[74],256],119922:[[75],256],119923:[[76],256],119924:[[77],256],119925:[[78],256],119926:[[79],256],119927:[[80],256],119928:[[81],256],119929:[[82],256],119930:[[83],256],119931:[[84],256],119932:[[85],256],119933:[[86],256],119934:[[87],256],119935:[[88],256],119936:[[89],256],119937:[[90],256],119938:[[97],256],119939:[[98],256],119940:[[99],256],119941:[[100],256],119942:[[101],256],119943:[[102],256],119944:[[103],256],119945:[[104],256],119946:[[105],256],119947:[[106],256],119948:[[107],256],119949:[[108],256],119950:[[109],256],119951:[[110],256],119952:[[111],256],119953:[[112],256],119954:[[113],256],119955:[[114],256],119956:[[115],256],119957:[[116],256],119958:[[117],256],119959:[[118],256],119960:[[119],256],119961:[[120],256],119962:[[121],256],119963:[[122],256],119964:[[65],256],119966:[[67],256],119967:[[68],256],119970:[[71],256],119973:[[74],256],119974:[[75],256],119977:[[78],256],119978:[[79],256],119979:[[80],256],119980:[[81],256],119982:[[83],256],119983:[[84],256],119984:[[85],256],119985:[[86],256],119986:[[87],256],119987:[[88],256],119988:[[89],256],119989:[[90],256],119990:[[97],256],119991:[[98],256],119992:[[99],256],119993:[[100],256],119995:[[102],256],119997:[[104],256],119998:[[105],256],119999:[[106],256],120000:[[107],256],120001:[[108],256],120002:[[109],256],120003:[[110],256],120005:[[112],256],120006:[[113],256],120007:[[114],256],120008:[[115],256],120009:[[116],256],120010:[[117],256],120011:[[118],256],120012:[[119],256],120013:[[120],256],120014:[[121],256],120015:[[122],256],120016:[[65],256],120017:[[66],256],120018:[[67],256],120019:[[68],256],120020:[[69],256],120021:[[70],256],120022:[[71],256],120023:[[72],256],120024:[[73],256],120025:[[74],256],120026:[[75],256],120027:[[76],256],120028:[[77],256],120029:[[78],256],120030:[[79],256],120031:[[80],256],120032:[[81],256],120033:[[82],256],120034:[[83],256],120035:[[84],256],120036:[[85],256],120037:[[86],256],120038:[[87],256],120039:[[88],256],120040:[[89],256],120041:[[90],256],120042:[[97],256],120043:[[98],256],120044:[[99],256],120045:[[100],256],120046:[[101],256],120047:[[102],256],120048:[[103],256],120049:[[104],256],120050:[[105],256],120051:[[106],256],120052:[[107],256],120053:[[108],256],120054:[[109],256],120055:[[110],256],120056:[[111],256],120057:[[112],256],120058:[[113],256],120059:[[114],256],120060:[[115],256],120061:[[116],256],120062:[[117],256],120063:[[118],256]},
54528:{120064:[[119],256],120065:[[120],256],120066:[[121],256],120067:[[122],256],120068:[[65],256],120069:[[66],256],120071:[[68],256],120072:[[69],256],120073:[[70],256],120074:[[71],256],120077:[[74],256],120078:[[75],256],120079:[[76],256],120080:[[77],256],120081:[[78],256],120082:[[79],256],120083:[[80],256],120084:[[81],256],120086:[[83],256],120087:[[84],256],120088:[[85],256],120089:[[86],256],120090:[[87],256],120091:[[88],256],120092:[[89],256],120094:[[97],256],120095:[[98],256],120096:[[99],256],120097:[[100],256],120098:[[101],256],120099:[[102],256],120100:[[103],256],120101:[[104],256],120102:[[105],256],120103:[[106],256],120104:[[107],256],120105:[[108],256],120106:[[109],256],120107:[[110],256],120108:[[111],256],120109:[[112],256],120110:[[113],256],120111:[[114],256],120112:[[115],256],120113:[[116],256],120114:[[117],256],120115:[[118],256],120116:[[119],256],120117:[[120],256],120118:[[121],256],120119:[[122],256],120120:[[65],256],120121:[[66],256],120123:[[68],256],120124:[[69],256],120125:[[70],256],120126:[[71],256],120128:[[73],256],120129:[[74],256],120130:[[75],256],120131:[[76],256],120132:[[77],256],120134:[[79],256],120138:[[83],256],120139:[[84],256],120140:[[85],256],120141:[[86],256],120142:[[87],256],120143:[[88],256],120144:[[89],256],120146:[[97],256],120147:[[98],256],120148:[[99],256],120149:[[100],256],120150:[[101],256],120151:[[102],256],120152:[[103],256],120153:[[104],256],120154:[[105],256],120155:[[106],256],120156:[[107],256],120157:[[108],256],120158:[[109],256],120159:[[110],256],120160:[[111],256],120161:[[112],256],120162:[[113],256],120163:[[114],256],120164:[[115],256],120165:[[116],256],120166:[[117],256],120167:[[118],256],120168:[[119],256],120169:[[120],256],120170:[[121],256],120171:[[122],256],120172:[[65],256],120173:[[66],256],120174:[[67],256],120175:[[68],256],120176:[[69],256],120177:[[70],256],120178:[[71],256],120179:[[72],256],120180:[[73],256],120181:[[74],256],120182:[[75],256],120183:[[76],256],120184:[[77],256],120185:[[78],256],120186:[[79],256],120187:[[80],256],120188:[[81],256],120189:[[82],256],120190:[[83],256],120191:[[84],256],120192:[[85],256],120193:[[86],256],120194:[[87],256],120195:[[88],256],120196:[[89],256],120197:[[90],256],120198:[[97],256],120199:[[98],256],120200:[[99],256],120201:[[100],256],120202:[[101],256],120203:[[102],256],120204:[[103],256],120205:[[104],256],120206:[[105],256],120207:[[106],256],120208:[[107],256],120209:[[108],256],120210:[[109],256],120211:[[110],256],120212:[[111],256],120213:[[112],256],120214:[[113],256],120215:[[114],256],120216:[[115],256],120217:[[116],256],120218:[[117],256],120219:[[118],256],120220:[[119],256],120221:[[120],256],120222:[[121],256],120223:[[122],256],120224:[[65],256],120225:[[66],256],120226:[[67],256],120227:[[68],256],120228:[[69],256],120229:[[70],256],120230:[[71],256],120231:[[72],256],120232:[[73],256],120233:[[74],256],120234:[[75],256],120235:[[76],256],120236:[[77],256],120237:[[78],256],120238:[[79],256],120239:[[80],256],120240:[[81],256],120241:[[82],256],120242:[[83],256],120243:[[84],256],120244:[[85],256],120245:[[86],256],120246:[[87],256],120247:[[88],256],120248:[[89],256],120249:[[90],256],120250:[[97],256],120251:[[98],256],120252:[[99],256],120253:[[100],256],120254:[[101],256],120255:[[102],256],120256:[[103],256],120257:[[104],256],120258:[[105],256],120259:[[106],256],120260:[[107],256],120261:[[108],256],120262:[[109],256],120263:[[110],256],120264:[[111],256],120265:[[112],256],120266:[[113],256],120267:[[114],256],120268:[[115],256],120269:[[116],256],120270:[[117],256],120271:[[118],256],120272:[[119],256],120273:[[120],256],120274:[[121],256],120275:[[122],256],120276:[[65],256],120277:[[66],256],120278:[[67],256],120279:[[68],256],120280:[[69],256],120281:[[70],256],120282:[[71],256],120283:[[72],256],120284:[[73],256],120285:[[74],256],120286:[[75],256],120287:[[76],256],120288:[[77],256],120289:[[78],256],120290:[[79],256],120291:[[80],256],120292:[[81],256],120293:[[82],256],120294:[[83],256],120295:[[84],256],120296:[[85],256],120297:[[86],256],120298:[[87],256],120299:[[88],256],120300:[[89],256],120301:[[90],256],120302:[[97],256],120303:[[98],256],120304:[[99],256],120305:[[100],256],120306:[[101],256],120307:[[102],256],120308:[[103],256],120309:[[104],256],120310:[[105],256],120311:[[106],256],120312:[[107],256],120313:[[108],256],120314:[[109],256],120315:[[110],256],120316:[[111],256],120317:[[112],256],120318:[[113],256],120319:[[114],256]},
54784:{120320:[[115],256],120321:[[116],256],120322:[[117],256],120323:[[118],256],120324:[[119],256],120325:[[120],256],120326:[[121],256],120327:[[122],256],120328:[[65],256],120329:[[66],256],120330:[[67],256],120331:[[68],256],120332:[[69],256],120333:[[70],256],120334:[[71],256],120335:[[72],256],120336:[[73],256],120337:[[74],256],120338:[[75],256],120339:[[76],256],120340:[[77],256],120341:[[78],256],120342:[[79],256],120343:[[80],256],120344:[[81],256],120345:[[82],256],120346:[[83],256],120347:[[84],256],120348:[[85],256],120349:[[86],256],120350:[[87],256],120351:[[88],256],120352:[[89],256],120353:[[90],256],120354:[[97],256],120355:[[98],256],120356:[[99],256],120357:[[100],256],120358:[[101],256],120359:[[102],256],120360:[[103],256],120361:[[104],256],120362:[[105],256],120363:[[106],256],120364:[[107],256],120365:[[108],256],120366:[[109],256],120367:[[110],256],120368:[[111],256],120369:[[112],256],120370:[[113],256],120371:[[114],256],120372:[[115],256],120373:[[116],256],120374:[[117],256],120375:[[118],256],120376:[[119],256],120377:[[120],256],120378:[[121],256],120379:[[122],256],120380:[[65],256],120381:[[66],256],120382:[[67],256],120383:[[68],256],120384:[[69],256],120385:[[70],256],120386:[[71],256],120387:[[72],256],120388:[[73],256],120389:[[74],256],120390:[[75],256],120391:[[76],256],120392:[[77],256],120393:[[78],256],120394:[[79],256],120395:[[80],256],120396:[[81],256],120397:[[82],256],120398:[[83],256],120399:[[84],256],120400:[[85],256],120401:[[86],256],120402:[[87],256],120403:[[88],256],120404:[[89],256],120405:[[90],256],120406:[[97],256],120407:[[98],256],120408:[[99],256],120409:[[100],256],120410:[[101],256],120411:[[102],256],120412:[[103],256],120413:[[104],256],120414:[[105],256],120415:[[106],256],120416:[[107],256],120417:[[108],256],120418:[[109],256],120419:[[110],256],120420:[[111],256],120421:[[112],256],120422:[[113],256],120423:[[114],256],120424:[[115],256],120425:[[116],256],120426:[[117],256],120427:[[118],256],120428:[[119],256],120429:[[120],256],120430:[[121],256],120431:[[122],256],120432:[[65],256],120433:[[66],256],120434:[[67],256],120435:[[68],256],120436:[[69],256],120437:[[70],256],120438:[[71],256],120439:[[72],256],120440:[[73],256],120441:[[74],256],120442:[[75],256],120443:[[76],256],120444:[[77],256],120445:[[78],256],120446:[[79],256],120447:[[80],256],120448:[[81],256],120449:[[82],256],120450:[[83],256],120451:[[84],256],120452:[[85],256],120453:[[86],256],120454:[[87],256],120455:[[88],256],120456:[[89],256],120457:[[90],256],120458:[[97],256],120459:[[98],256],120460:[[99],256],120461:[[100],256],120462:[[101],256],120463:[[102],256],120464:[[103],256],120465:[[104],256],120466:[[105],256],120467:[[106],256],120468:[[107],256],120469:[[108],256],120470:[[109],256],120471:[[110],256],120472:[[111],256],120473:[[112],256],120474:[[113],256],120475:[[114],256],120476:[[115],256],120477:[[116],256],120478:[[117],256],120479:[[118],256],120480:[[119],256],120481:[[120],256],120482:[[121],256],120483:[[122],256],120484:[[305],256],120485:[[567],256],120488:[[913],256],120489:[[914],256],120490:[[915],256],120491:[[916],256],120492:[[917],256],120493:[[918],256],120494:[[919],256],120495:[[920],256],120496:[[921],256],120497:[[922],256],120498:[[923],256],120499:[[924],256],120500:[[925],256],120501:[[926],256],120502:[[927],256],120503:[[928],256],120504:[[929],256],120505:[[1012],256],120506:[[931],256],120507:[[932],256],120508:[[933],256],120509:[[934],256],120510:[[935],256],120511:[[936],256],120512:[[937],256],120513:[[8711],256],120514:[[945],256],120515:[[946],256],120516:[[947],256],120517:[[948],256],120518:[[949],256],120519:[[950],256],120520:[[951],256],120521:[[952],256],120522:[[953],256],120523:[[954],256],120524:[[955],256],120525:[[956],256],120526:[[957],256],120527:[[958],256],120528:[[959],256],120529:[[960],256],120530:[[961],256],120531:[[962],256],120532:[[963],256],120533:[[964],256],120534:[[965],256],120535:[[966],256],120536:[[967],256],120537:[[968],256],120538:[[969],256],120539:[[8706],256],120540:[[1013],256],120541:[[977],256],120542:[[1008],256],120543:[[981],256],120544:[[1009],256],120545:[[982],256],120546:[[913],256],120547:[[914],256],120548:[[915],256],120549:[[916],256],120550:[[917],256],120551:[[918],256],120552:[[919],256],120553:[[920],256],120554:[[921],256],120555:[[922],256],120556:[[923],256],120557:[[924],256],120558:[[925],256],120559:[[926],256],120560:[[927],256],120561:[[928],256],120562:[[929],256],120563:[[1012],256],120564:[[931],256],120565:[[932],256],120566:[[933],256],120567:[[934],256],120568:[[935],256],120569:[[936],256],120570:[[937],256],120571:[[8711],256],120572:[[945],256],120573:[[946],256],120574:[[947],256],120575:[[948],256]},
55040:{120576:[[949],256],120577:[[950],256],120578:[[951],256],120579:[[952],256],120580:[[953],256],120581:[[954],256],120582:[[955],256],120583:[[956],256],120584:[[957],256],120585:[[958],256],120586:[[959],256],120587:[[960],256],120588:[[961],256],120589:[[962],256],120590:[[963],256],120591:[[964],256],120592:[[965],256],120593:[[966],256],120594:[[967],256],120595:[[968],256],120596:[[969],256],120597:[[8706],256],120598:[[1013],256],120599:[[977],256],120600:[[1008],256],120601:[[981],256],120602:[[1009],256],120603:[[982],256],120604:[[913],256],120605:[[914],256],120606:[[915],256],120607:[[916],256],120608:[[917],256],120609:[[918],256],120610:[[919],256],120611:[[920],256],120612:[[921],256],120613:[[922],256],120614:[[923],256],120615:[[924],256],120616:[[925],256],120617:[[926],256],120618:[[927],256],120619:[[928],256],120620:[[929],256],120621:[[1012],256],120622:[[931],256],120623:[[932],256],120624:[[933],256],120625:[[934],256],120626:[[935],256],120627:[[936],256],120628:[[937],256],120629:[[8711],256],120630:[[945],256],120631:[[946],256],120632:[[947],256],120633:[[948],256],120634:[[949],256],120635:[[950],256],120636:[[951],256],120637:[[952],256],120638:[[953],256],120639:[[954],256],120640:[[955],256],120641:[[956],256],120642:[[957],256],120643:[[958],256],120644:[[959],256],120645:[[960],256],120646:[[961],256],120647:[[962],256],120648:[[963],256],120649:[[964],256],120650:[[965],256],120651:[[966],256],120652:[[967],256],120653:[[968],256],120654:[[969],256],120655:[[8706],256],120656:[[1013],256],120657:[[977],256],120658:[[1008],256],120659:[[981],256],120660:[[1009],256],120661:[[982],256],120662:[[913],256],120663:[[914],256],120664:[[915],256],120665:[[916],256],120666:[[917],256],120667:[[918],256],120668:[[919],256],120669:[[920],256],120670:[[921],256],120671:[[922],256],120672:[[923],256],120673:[[924],256],120674:[[925],256],120675:[[926],256],120676:[[927],256],120677:[[928],256],120678:[[929],256],120679:[[1012],256],120680:[[931],256],120681:[[932],256],120682:[[933],256],120683:[[934],256],120684:[[935],256],120685:[[936],256],120686:[[937],256],120687:[[8711],256],120688:[[945],256],120689:[[946],256],120690:[[947],256],120691:[[948],256],120692:[[949],256],120693:[[950],256],120694:[[951],256],120695:[[952],256],120696:[[953],256],120697:[[954],256],120698:[[955],256],120699:[[956],256],120700:[[957],256],120701:[[958],256],120702:[[959],256],120703:[[960],256],120704:[[961],256],120705:[[962],256],120706:[[963],256],120707:[[964],256],120708:[[965],256],120709:[[966],256],120710:[[967],256],120711:[[968],256],120712:[[969],256],120713:[[8706],256],120714:[[1013],256],120715:[[977],256],120716:[[1008],256],120717:[[981],256],120718:[[1009],256],120719:[[982],256],120720:[[913],256],120721:[[914],256],120722:[[915],256],120723:[[916],256],120724:[[917],256],120725:[[918],256],120726:[[919],256],120727:[[920],256],120728:[[921],256],120729:[[922],256],120730:[[923],256],120731:[[924],256],120732:[[925],256],120733:[[926],256],120734:[[927],256],120735:[[928],256],120736:[[929],256],120737:[[1012],256],120738:[[931],256],120739:[[932],256],120740:[[933],256],120741:[[934],256],120742:[[935],256],120743:[[936],256],120744:[[937],256],120745:[[8711],256],120746:[[945],256],120747:[[946],256],120748:[[947],256],120749:[[948],256],120750:[[949],256],120751:[[950],256],120752:[[951],256],120753:[[952],256],120754:[[953],256],120755:[[954],256],120756:[[955],256],120757:[[956],256],120758:[[957],256],120759:[[958],256],120760:[[959],256],120761:[[960],256],120762:[[961],256],120763:[[962],256],120764:[[963],256],120765:[[964],256],120766:[[965],256],120767:[[966],256],120768:[[967],256],120769:[[968],256],120770:[[969],256],120771:[[8706],256],120772:[[1013],256],120773:[[977],256],120774:[[1008],256],120775:[[981],256],120776:[[1009],256],120777:[[982],256],120778:[[988],256],120779:[[989],256],120782:[[48],256],120783:[[49],256],120784:[[50],256],120785:[[51],256],120786:[[52],256],120787:[[53],256],120788:[[54],256],120789:[[55],256],120790:[[56],256],120791:[[57],256],120792:[[48],256],120793:[[49],256],120794:[[50],256],120795:[[51],256],120796:[[52],256],120797:[[53],256],120798:[[54],256],120799:[[55],256],120800:[[56],256],120801:[[57],256],120802:[[48],256],120803:[[49],256],120804:[[50],256],120805:[[51],256],120806:[[52],256],120807:[[53],256],120808:[[54],256],120809:[[55],256],120810:[[56],256],120811:[[57],256],120812:[[48],256],120813:[[49],256],120814:[[50],256],120815:[[51],256],120816:[[52],256],120817:[[53],256],120818:[[54],256],120819:[[55],256],120820:[[56],256],120821:[[57],256],120822:[[48],256],120823:[[49],256],120824:[[50],256],120825:[[51],256],120826:[[52],256],120827:[[53],256],120828:[[54],256],120829:[[55],256],120830:[[56],256],120831:[[57],256]},
59392:{125136:[,220],125137:[,220],125138:[,220],125139:[,220],125140:[,220],125141:[,220],125142:[,220]},
60928:{126464:[[1575],256],126465:[[1576],256],126466:[[1580],256],126467:[[1583],256],126469:[[1608],256],126470:[[1586],256],126471:[[1581],256],126472:[[1591],256],126473:[[1610],256],126474:[[1603],256],126475:[[1604],256],126476:[[1605],256],126477:[[1606],256],126478:[[1587],256],126479:[[1593],256],126480:[[1601],256],126481:[[1589],256],126482:[[1602],256],126483:[[1585],256],126484:[[1588],256],126485:[[1578],256],126486:[[1579],256],126487:[[1582],256],126488:[[1584],256],126489:[[1590],256],126490:[[1592],256],126491:[[1594],256],126492:[[1646],256],126493:[[1722],256],126494:[[1697],256],126495:[[1647],256],126497:[[1576],256],126498:[[1580],256],126500:[[1607],256],126503:[[1581],256],126505:[[1610],256],126506:[[1603],256],126507:[[1604],256],126508:[[1605],256],126509:[[1606],256],126510:[[1587],256],126511:[[1593],256],126512:[[1601],256],126513:[[1589],256],126514:[[1602],256],126516:[[1588],256],126517:[[1578],256],126518:[[1579],256],126519:[[1582],256],126521:[[1590],256],126523:[[1594],256],126530:[[1580],256],126535:[[1581],256],126537:[[1610],256],126539:[[1604],256],126541:[[1606],256],126542:[[1587],256],126543:[[1593],256],126545:[[1589],256],126546:[[1602],256],126548:[[1588],256],126551:[[1582],256],126553:[[1590],256],126555:[[1594],256],126557:[[1722],256],126559:[[1647],256],126561:[[1576],256],126562:[[1580],256],126564:[[1607],256],126567:[[1581],256],126568:[[1591],256],126569:[[1610],256],126570:[[1603],256],126572:[[1605],256],126573:[[1606],256],126574:[[1587],256],126575:[[1593],256],126576:[[1601],256],126577:[[1589],256],126578:[[1602],256],126580:[[1588],256],126581:[[1578],256],126582:[[1579],256],126583:[[1582],256],126585:[[1590],256],126586:[[1592],256],126587:[[1594],256],126588:[[1646],256],126590:[[1697],256],126592:[[1575],256],126593:[[1576],256],126594:[[1580],256],126595:[[1583],256],126596:[[1607],256],126597:[[1608],256],126598:[[1586],256],126599:[[1581],256],126600:[[1591],256],126601:[[1610],256],126603:[[1604],256],126604:[[1605],256],126605:[[1606],256],126606:[[1587],256],126607:[[1593],256],126608:[[1601],256],126609:[[1589],256],126610:[[1602],256],126611:[[1585],256],126612:[[1588],256],126613:[[1578],256],126614:[[1579],256],126615:[[1582],256],126616:[[1584],256],126617:[[1590],256],126618:[[1592],256],126619:[[1594],256],126625:[[1576],256],126626:[[1580],256],126627:[[1583],256],126629:[[1608],256],126630:[[1586],256],126631:[[1581],256],126632:[[1591],256],126633:[[1610],256],126635:[[1604],256],126636:[[1605],256],126637:[[1606],256],126638:[[1587],256],126639:[[1593],256],126640:[[1601],256],126641:[[1589],256],126642:[[1602],256],126643:[[1585],256],126644:[[1588],256],126645:[[1578],256],126646:[[1579],256],126647:[[1582],256],126648:[[1584],256],126649:[[1590],256],126650:[[1592],256],126651:[[1594],256]},
61696:{127232:[[48,46],256],127233:[[48,44],256],127234:[[49,44],256],127235:[[50,44],256],127236:[[51,44],256],127237:[[52,44],256],127238:[[53,44],256],127239:[[54,44],256],127240:[[55,44],256],127241:[[56,44],256],127242:[[57,44],256],127248:[[40,65,41],256],127249:[[40,66,41],256],127250:[[40,67,41],256],127251:[[40,68,41],256],127252:[[40,69,41],256],127253:[[40,70,41],256],127254:[[40,71,41],256],127255:[[40,72,41],256],127256:[[40,73,41],256],127257:[[40,74,41],256],127258:[[40,75,41],256],127259:[[40,76,41],256],127260:[[40,77,41],256],127261:[[40,78,41],256],127262:[[40,79,41],256],127263:[[40,80,41],256],127264:[[40,81,41],256],127265:[[40,82,41],256],127266:[[40,83,41],256],127267:[[40,84,41],256],127268:[[40,85,41],256],127269:[[40,86,41],256],127270:[[40,87,41],256],127271:[[40,88,41],256],127272:[[40,89,41],256],127273:[[40,90,41],256],127274:[[12308,83,12309],256],127275:[[67],256],127276:[[82],256],127277:[[67,68],256],127278:[[87,90],256],127280:[[65],256],127281:[[66],256],127282:[[67],256],127283:[[68],256],127284:[[69],256],127285:[[70],256],127286:[[71],256],127287:[[72],256],127288:[[73],256],127289:[[74],256],127290:[[75],256],127291:[[76],256],127292:[[77],256],127293:[[78],256],127294:[[79],256],127295:[[80],256],127296:[[81],256],127297:[[82],256],127298:[[83],256],127299:[[84],256],127300:[[85],256],127301:[[86],256],127302:[[87],256],127303:[[88],256],127304:[[89],256],127305:[[90],256],127306:[[72,86],256],127307:[[77,86],256],127308:[[83,68],256],127309:[[83,83],256],127310:[[80,80,86],256],127311:[[87,67],256],127338:[[77,67],256],127339:[[77,68],256],127376:[[68,74],256]},
61952:{127488:[[12411,12363],256],127489:[[12467,12467],256],127490:[[12469],256],127504:[[25163],256],127505:[[23383],256],127506:[[21452],256],127507:[[12487],256],127508:[[20108],256],127509:[[22810],256],127510:[[35299],256],127511:[[22825],256],127512:[[20132],256],127513:[[26144],256],127514:[[28961],256],127515:[[26009],256],127516:[[21069],256],127517:[[24460],256],127518:[[20877],256],127519:[[26032],256],127520:[[21021],256],127521:[[32066],256],127522:[[29983],256],127523:[[36009],256],127524:[[22768],256],127525:[[21561],256],127526:[[28436],256],127527:[[25237],256],127528:[[25429],256],127529:[[19968],256],127530:[[19977],256],127531:[[36938],256],127532:[[24038],256],127533:[[20013],256],127534:[[21491],256],127535:[[25351],256],127536:[[36208],256],127537:[[25171],256],127538:[[31105],256],127539:[[31354],256],127540:[[21512],256],127541:[[28288],256],127542:[[26377],256],127543:[[26376],256],127544:[[30003],256],127545:[[21106],256],127546:[[21942],256],127552:[[12308,26412,12309],256],127553:[[12308,19977,12309],256],127554:[[12308,20108,12309],256],127555:[[12308,23433,12309],256],127556:[[12308,28857,12309],256],127557:[[12308,25171,12309],256],127558:[[12308,30423,12309],256],127559:[[12308,21213,12309],256],127560:[[12308,25943,12309],256],127568:[[24471],256],127569:[[21487],256]},
63488:{194560:[[20029]],194561:[[20024]],194562:[[20033]],194563:[[131362]],194564:[[20320]],194565:[[20398]],194566:[[20411]],194567:[[20482]],194568:[[20602]],194569:[[20633]],194570:[[20711]],194571:[[20687]],194572:[[13470]],194573:[[132666]],194574:[[20813]],194575:[[20820]],194576:[[20836]],194577:[[20855]],194578:[[132380]],194579:[[13497]],194580:[[20839]],194581:[[20877]],194582:[[132427]],194583:[[20887]],194584:[[20900]],194585:[[20172]],194586:[[20908]],194587:[[20917]],194588:[[168415]],194589:[[20981]],194590:[[20995]],194591:[[13535]],194592:[[21051]],194593:[[21062]],194594:[[21106]],194595:[[21111]],194596:[[13589]],194597:[[21191]],194598:[[21193]],194599:[[21220]],194600:[[21242]],194601:[[21253]],194602:[[21254]],194603:[[21271]],194604:[[21321]],194605:[[21329]],194606:[[21338]],194607:[[21363]],194608:[[21373]],194609:[[21375]],194610:[[21375]],194611:[[21375]],194612:[[133676]],194613:[[28784]],194614:[[21450]],194615:[[21471]],194616:[[133987]],194617:[[21483]],194618:[[21489]],194619:[[21510]],194620:[[21662]],194621:[[21560]],194622:[[21576]],194623:[[21608]],194624:[[21666]],194625:[[21750]],194626:[[21776]],194627:[[21843]],194628:[[21859]],194629:[[21892]],194630:[[21892]],194631:[[21913]],194632:[[21931]],194633:[[21939]],194634:[[21954]],194635:[[22294]],194636:[[22022]],194637:[[22295]],194638:[[22097]],194639:[[22132]],194640:[[20999]],194641:[[22766]],194642:[[22478]],194643:[[22516]],194644:[[22541]],194645:[[22411]],194646:[[22578]],194647:[[22577]],194648:[[22700]],194649:[[136420]],194650:[[22770]],194651:[[22775]],194652:[[22790]],194653:[[22810]],194654:[[22818]],194655:[[22882]],194656:[[136872]],194657:[[136938]],194658:[[23020]],194659:[[23067]],194660:[[23079]],194661:[[23000]],194662:[[23142]],194663:[[14062]],194664:[[14076]],194665:[[23304]],194666:[[23358]],194667:[[23358]],194668:[[137672]],194669:[[23491]],194670:[[23512]],194671:[[23527]],194672:[[23539]],194673:[[138008]],194674:[[23551]],194675:[[23558]],194676:[[24403]],194677:[[23586]],194678:[[14209]],194679:[[23648]],194680:[[23662]],194681:[[23744]],194682:[[23693]],194683:[[138724]],194684:[[23875]],194685:[[138726]],194686:[[23918]],194687:[[23915]],194688:[[23932]],194689:[[24033]],194690:[[24034]],194691:[[14383]],194692:[[24061]],194693:[[24104]],194694:[[24125]],194695:[[24169]],194696:[[14434]],194697:[[139651]],194698:[[14460]],194699:[[24240]],194700:[[24243]],194701:[[24246]],194702:[[24266]],194703:[[172946]],194704:[[24318]],194705:[[140081]],194706:[[140081]],194707:[[33281]],194708:[[24354]],194709:[[24354]],194710:[[14535]],194711:[[144056]],194712:[[156122]],194713:[[24418]],194714:[[24427]],194715:[[14563]],194716:[[24474]],194717:[[24525]],194718:[[24535]],194719:[[24569]],194720:[[24705]],194721:[[14650]],194722:[[14620]],194723:[[24724]],194724:[[141012]],194725:[[24775]],194726:[[24904]],194727:[[24908]],194728:[[24910]],194729:[[24908]],194730:[[24954]],194731:[[24974]],194732:[[25010]],194733:[[24996]],194734:[[25007]],194735:[[25054]],194736:[[25074]],194737:[[25078]],194738:[[25104]],194739:[[25115]],194740:[[25181]],194741:[[25265]],194742:[[25300]],194743:[[25424]],194744:[[142092]],194745:[[25405]],194746:[[25340]],194747:[[25448]],194748:[[25475]],194749:[[25572]],194750:[[142321]],194751:[[25634]],194752:[[25541]],194753:[[25513]],194754:[[14894]],194755:[[25705]],194756:[[25726]],194757:[[25757]],194758:[[25719]],194759:[[14956]],194760:[[25935]],194761:[[25964]],194762:[[143370]],194763:[[26083]],194764:[[26360]],194765:[[26185]],194766:[[15129]],194767:[[26257]],194768:[[15112]],194769:[[15076]],194770:[[20882]],194771:[[20885]],194772:[[26368]],194773:[[26268]],194774:[[32941]],194775:[[17369]],194776:[[26391]],194777:[[26395]],194778:[[26401]],194779:[[26462]],194780:[[26451]],194781:[[144323]],194782:[[15177]],194783:[[26618]],194784:[[26501]],194785:[[26706]],194786:[[26757]],194787:[[144493]],194788:[[26766]],194789:[[26655]],194790:[[26900]],194791:[[15261]],194792:[[26946]],194793:[[27043]],194794:[[27114]],194795:[[27304]],194796:[[145059]],194797:[[27355]],194798:[[15384]],194799:[[27425]],194800:[[145575]],194801:[[27476]],194802:[[15438]],194803:[[27506]],194804:[[27551]],194805:[[27578]],194806:[[27579]],194807:[[146061]],194808:[[138507]],194809:[[146170]],194810:[[27726]],194811:[[146620]],194812:[[27839]],194813:[[27853]],194814:[[27751]],194815:[[27926]]},
63744:{63744:[[35912]],63745:[[26356]],63746:[[36554]],63747:[[36040]],63748:[[28369]],63749:[[20018]],63750:[[21477]],63751:[[40860]],63752:[[40860]],63753:[[22865]],63754:[[37329]],63755:[[21895]],63756:[[22856]],63757:[[25078]],63758:[[30313]],63759:[[32645]],63760:[[34367]],63761:[[34746]],63762:[[35064]],63763:[[37007]],63764:[[27138]],63765:[[27931]],63766:[[28889]],63767:[[29662]],63768:[[33853]],63769:[[37226]],63770:[[39409]],63771:[[20098]],63772:[[21365]],63773:[[27396]],63774:[[29211]],63775:[[34349]],63776:[[40478]],63777:[[23888]],63778:[[28651]],63779:[[34253]],63780:[[35172]],63781:[[25289]],63782:[[33240]],63783:[[34847]],63784:[[24266]],63785:[[26391]],63786:[[28010]],63787:[[29436]],63788:[[37070]],63789:[[20358]],63790:[[20919]],63791:[[21214]],63792:[[25796]],63793:[[27347]],63794:[[29200]],63795:[[30439]],63796:[[32769]],63797:[[34310]],63798:[[34396]],63799:[[36335]],63800:[[38706]],63801:[[39791]],63802:[[40442]],63803:[[30860]],63804:[[31103]],63805:[[32160]],63806:[[33737]],63807:[[37636]],63808:[[40575]],63809:[[35542]],63810:[[22751]],63811:[[24324]],63812:[[31840]],63813:[[32894]],63814:[[29282]],63815:[[30922]],63816:[[36034]],63817:[[38647]],63818:[[22744]],63819:[[23650]],63820:[[27155]],63821:[[28122]],63822:[[28431]],63823:[[32047]],63824:[[32311]],63825:[[38475]],63826:[[21202]],63827:[[32907]],63828:[[20956]],63829:[[20940]],63830:[[31260]],63831:[[32190]],63832:[[33777]],63833:[[38517]],63834:[[35712]],63835:[[25295]],63836:[[27138]],63837:[[35582]],63838:[[20025]],63839:[[23527]],63840:[[24594]],63841:[[29575]],63842:[[30064]],63843:[[21271]],63844:[[30971]],63845:[[20415]],63846:[[24489]],63847:[[19981]],63848:[[27852]],63849:[[25976]],63850:[[32034]],63851:[[21443]],63852:[[22622]],63853:[[30465]],63854:[[33865]],63855:[[35498]],63856:[[27578]],63857:[[36784]],63858:[[27784]],63859:[[25342]],63860:[[33509]],63861:[[25504]],63862:[[30053]],63863:[[20142]],63864:[[20841]],63865:[[20937]],63866:[[26753]],63867:[[31975]],63868:[[33391]],63869:[[35538]],63870:[[37327]],63871:[[21237]],63872:[[21570]],63873:[[22899]],63874:[[24300]],63875:[[26053]],63876:[[28670]],63877:[[31018]],63878:[[38317]],63879:[[39530]],63880:[[40599]],63881:[[40654]],63882:[[21147]],63883:[[26310]],63884:[[27511]],63885:[[36706]],63886:[[24180]],63887:[[24976]],63888:[[25088]],63889:[[25754]],63890:[[28451]],63891:[[29001]],63892:[[29833]],63893:[[31178]],63894:[[32244]],63895:[[32879]],63896:[[36646]],63897:[[34030]],63898:[[36899]],63899:[[37706]],63900:[[21015]],63901:[[21155]],63902:[[21693]],63903:[[28872]],63904:[[35010]],63905:[[35498]],63906:[[24265]],63907:[[24565]],63908:[[25467]],63909:[[27566]],63910:[[31806]],63911:[[29557]],63912:[[20196]],63913:[[22265]],63914:[[23527]],63915:[[23994]],63916:[[24604]],63917:[[29618]],63918:[[29801]],63919:[[32666]],63920:[[32838]],63921:[[37428]],63922:[[38646]],63923:[[38728]],63924:[[38936]],63925:[[20363]],63926:[[31150]],63927:[[37300]],63928:[[38584]],63929:[[24801]],63930:[[20102]],63931:[[20698]],63932:[[23534]],63933:[[23615]],63934:[[26009]],63935:[[27138]],63936:[[29134]],63937:[[30274]],63938:[[34044]],63939:[[36988]],63940:[[40845]],63941:[[26248]],63942:[[38446]],63943:[[21129]],63944:[[26491]],63945:[[26611]],63946:[[27969]],63947:[[28316]],63948:[[29705]],63949:[[30041]],63950:[[30827]],63951:[[32016]],63952:[[39006]],63953:[[20845]],63954:[[25134]],63955:[[38520]],63956:[[20523]],63957:[[23833]],63958:[[28138]],63959:[[36650]],63960:[[24459]],63961:[[24900]],63962:[[26647]],63963:[[29575]],63964:[[38534]],63965:[[21033]],63966:[[21519]],63967:[[23653]],63968:[[26131]],63969:[[26446]],63970:[[26792]],63971:[[27877]],63972:[[29702]],63973:[[30178]],63974:[[32633]],63975:[[35023]],63976:[[35041]],63977:[[37324]],63978:[[38626]],63979:[[21311]],63980:[[28346]],63981:[[21533]],63982:[[29136]],63983:[[29848]],63984:[[34298]],63985:[[38563]],63986:[[40023]],63987:[[40607]],63988:[[26519]],63989:[[28107]],63990:[[33256]],63991:[[31435]],63992:[[31520]],63993:[[31890]],63994:[[29376]],63995:[[28825]],63996:[[35672]],63997:[[20160]],63998:[[33590]],63999:[[21050]],194816:[[27966]],194817:[[28023]],194818:[[27969]],194819:[[28009]],194820:[[28024]],194821:[[28037]],194822:[[146718]],194823:[[27956]],194824:[[28207]],194825:[[28270]],194826:[[15667]],194827:[[28363]],194828:[[28359]],194829:[[147153]],194830:[[28153]],194831:[[28526]],194832:[[147294]],194833:[[147342]],194834:[[28614]],194835:[[28729]],194836:[[28702]],194837:[[28699]],194838:[[15766]],194839:[[28746]],194840:[[28797]],194841:[[28791]],194842:[[28845]],194843:[[132389]],194844:[[28997]],194845:[[148067]],194846:[[29084]],194847:[[148395]],194848:[[29224]],194849:[[29237]],194850:[[29264]],194851:[[149000]],194852:[[29312]],194853:[[29333]],194854:[[149301]],194855:[[149524]],194856:[[29562]],194857:[[29579]],194858:[[16044]],194859:[[29605]],194860:[[16056]],194861:[[16056]],194862:[[29767]],194863:[[29788]],194864:[[29809]],194865:[[29829]],194866:[[29898]],194867:[[16155]],194868:[[29988]],194869:[[150582]],194870:[[30014]],194871:[[150674]],194872:[[30064]],194873:[[139679]],194874:[[30224]],194875:[[151457]],194876:[[151480]],194877:[[151620]],194878:[[16380]],194879:[[16392]],194880:[[30452]],194881:[[151795]],194882:[[151794]],194883:[[151833]],194884:[[151859]],194885:[[30494]],194886:[[30495]],194887:[[30495]],194888:[[30538]],194889:[[16441]],194890:[[30603]],194891:[[16454]],194892:[[16534]],194893:[[152605]],194894:[[30798]],194895:[[30860]],194896:[[30924]],194897:[[16611]],194898:[[153126]],194899:[[31062]],194900:[[153242]],194901:[[153285]],194902:[[31119]],194903:[[31211]],194904:[[16687]],194905:[[31296]],194906:[[31306]],194907:[[31311]],194908:[[153980]],194909:[[154279]],194910:[[154279]],194911:[[31470]],194912:[[16898]],194913:[[154539]],194914:[[31686]],194915:[[31689]],194916:[[16935]],194917:[[154752]],194918:[[31954]],194919:[[17056]],194920:[[31976]],194921:[[31971]],194922:[[32000]],194923:[[155526]],194924:[[32099]],194925:[[17153]],194926:[[32199]],194927:[[32258]],194928:[[32325]],194929:[[17204]],194930:[[156200]],194931:[[156231]],194932:[[17241]],194933:[[156377]],194934:[[32634]],194935:[[156478]],194936:[[32661]],194937:[[32762]],194938:[[32773]],194939:[[156890]],194940:[[156963]],194941:[[32864]],194942:[[157096]],194943:[[32880]],194944:[[144223]],194945:[[17365]],194946:[[32946]],194947:[[33027]],194948:[[17419]],194949:[[33086]],194950:[[23221]],194951:[[157607]],194952:[[157621]],194953:[[144275]],194954:[[144284]],194955:[[33281]],194956:[[33284]],194957:[[36766]],194958:[[17515]],194959:[[33425]],194960:[[33419]],194961:[[33437]],194962:[[21171]],194963:[[33457]],194964:[[33459]],194965:[[33469]],194966:[[33510]],194967:[[158524]],194968:[[33509]],194969:[[33565]],194970:[[33635]],194971:[[33709]],194972:[[33571]],194973:[[33725]],194974:[[33767]],194975:[[33879]],194976:[[33619]],194977:[[33738]],194978:[[33740]],194979:[[33756]],194980:[[158774]],194981:[[159083]],194982:[[158933]],194983:[[17707]],194984:[[34033]],194985:[[34035]],194986:[[34070]],194987:[[160714]],194988:[[34148]],194989:[[159532]],194990:[[17757]],194991:[[17761]],194992:[[159665]],194993:[[159954]],194994:[[17771]],194995:[[34384]],194996:[[34396]],194997:[[34407]],194998:[[34409]],194999:[[34473]],195000:[[34440]],195001:[[34574]],195002:[[34530]],195003:[[34681]],195004:[[34600]],195005:[[34667]],195006:[[34694]],195007:[[17879]],195008:[[34785]],195009:[[34817]],195010:[[17913]],195011:[[34912]],195012:[[34915]],195013:[[161383]],195014:[[35031]],195015:[[35038]],195016:[[17973]],195017:[[35066]],195018:[[13499]],195019:[[161966]],195020:[[162150]],195021:[[18110]],195022:[[18119]],195023:[[35488]],195024:[[35565]],195025:[[35722]],195026:[[35925]],195027:[[162984]],195028:[[36011]],195029:[[36033]],195030:[[36123]],195031:[[36215]],195032:[[163631]],195033:[[133124]],195034:[[36299]],195035:[[36284]],195036:[[36336]],195037:[[133342]],195038:[[36564]],195039:[[36664]],195040:[[165330]],195041:[[165357]],195042:[[37012]],195043:[[37105]],195044:[[37137]],195045:[[165678]],195046:[[37147]],195047:[[37432]],195048:[[37591]],195049:[[37592]],195050:[[37500]],195051:[[37881]],195052:[[37909]],195053:[[166906]],195054:[[38283]],195055:[[18837]],195056:[[38327]],195057:[[167287]],195058:[[18918]],195059:[[38595]],195060:[[23986]],195061:[[38691]],195062:[[168261]],195063:[[168474]],195064:[[19054]],195065:[[19062]],195066:[[38880]],195067:[[168970]],195068:[[19122]],195069:[[169110]],195070:[[38923]],195071:[[38923]]},
64000:{64000:[[20999]],64001:[[24230]],64002:[[25299]],64003:[[31958]],64004:[[23429]],64005:[[27934]],64006:[[26292]],64007:[[36667]],64008:[[34892]],64009:[[38477]],64010:[[35211]],64011:[[24275]],64012:[[20800]],64013:[[21952]],64016:[[22618]],64018:[[26228]],64021:[[20958]],64022:[[29482]],64023:[[30410]],64024:[[31036]],64025:[[31070]],64026:[[31077]],64027:[[31119]],64028:[[38742]],64029:[[31934]],64030:[[32701]],64032:[[34322]],64034:[[35576]],64037:[[36920]],64038:[[37117]],64042:[[39151]],64043:[[39164]],64044:[[39208]],64045:[[40372]],64046:[[37086]],64047:[[38583]],64048:[[20398]],64049:[[20711]],64050:[[20813]],64051:[[21193]],64052:[[21220]],64053:[[21329]],64054:[[21917]],64055:[[22022]],64056:[[22120]],64057:[[22592]],64058:[[22696]],64059:[[23652]],64060:[[23662]],64061:[[24724]],64062:[[24936]],64063:[[24974]],64064:[[25074]],64065:[[25935]],64066:[[26082]],64067:[[26257]],64068:[[26757]],64069:[[28023]],64070:[[28186]],64071:[[28450]],64072:[[29038]],64073:[[29227]],64074:[[29730]],64075:[[30865]],64076:[[31038]],64077:[[31049]],64078:[[31048]],64079:[[31056]],64080:[[31062]],64081:[[31069]],64082:[[31117]],64083:[[31118]],64084:[[31296]],64085:[[31361]],64086:[[31680]],64087:[[32244]],64088:[[32265]],64089:[[32321]],64090:[[32626]],64091:[[32773]],64092:[[33261]],64093:[[33401]],64094:[[33401]],64095:[[33879]],64096:[[35088]],64097:[[35222]],64098:[[35585]],64099:[[35641]],64100:[[36051]],64101:[[36104]],64102:[[36790]],64103:[[36920]],64104:[[38627]],64105:[[38911]],64106:[[38971]],64107:[[24693]],64108:[[148206]],64109:[[33304]],64112:[[20006]],64113:[[20917]],64114:[[20840]],64115:[[20352]],64116:[[20805]],64117:[[20864]],64118:[[21191]],64119:[[21242]],64120:[[21917]],64121:[[21845]],64122:[[21913]],64123:[[21986]],64124:[[22618]],64125:[[22707]],64126:[[22852]],64127:[[22868]],64128:[[23138]],64129:[[23336]],64130:[[24274]],64131:[[24281]],64132:[[24425]],64133:[[24493]],64134:[[24792]],64135:[[24910]],64136:[[24840]],64137:[[24974]],64138:[[24928]],64139:[[25074]],64140:[[25140]],64141:[[25540]],64142:[[25628]],64143:[[25682]],64144:[[25942]],64145:[[26228]],64146:[[26391]],64147:[[26395]],64148:[[26454]],64149:[[27513]],64150:[[27578]],64151:[[27969]],64152:[[28379]],64153:[[28363]],64154:[[28450]],64155:[[28702]],64156:[[29038]],64157:[[30631]],64158:[[29237]],64159:[[29359]],64160:[[29482]],64161:[[29809]],64162:[[29958]],64163:[[30011]],64164:[[30237]],64165:[[30239]],64166:[[30410]],64167:[[30427]],64168:[[30452]],64169:[[30538]],64170:[[30528]],64171:[[30924]],64172:[[31409]],64173:[[31680]],64174:[[31867]],64175:[[32091]],64176:[[32244]],64177:[[32574]],64178:[[32773]],64179:[[33618]],64180:[[33775]],64181:[[34681]],64182:[[35137]],64183:[[35206]],64184:[[35222]],64185:[[35519]],64186:[[35576]],64187:[[35531]],64188:[[35585]],64189:[[35582]],64190:[[35565]],64191:[[35641]],64192:[[35722]],64193:[[36104]],64194:[[36664]],64195:[[36978]],64196:[[37273]],64197:[[37494]],64198:[[38524]],64199:[[38627]],64200:[[38742]],64201:[[38875]],64202:[[38911]],64203:[[38923]],64204:[[38971]],64205:[[39698]],64206:[[40860]],64207:[[141386]],64208:[[141380]],64209:[[144341]],64210:[[15261]],64211:[[16408]],64212:[[16441]],64213:[[152137]],64214:[[154832]],64215:[[163539]],64216:[[40771]],64217:[[40846]],195072:[[38953]],195073:[[169398]],195074:[[39138]],195075:[[19251]],195076:[[39209]],195077:[[39335]],195078:[[39362]],195079:[[39422]],195080:[[19406]],195081:[[170800]],195082:[[39698]],195083:[[40000]],195084:[[40189]],195085:[[19662]],195086:[[19693]],195087:[[40295]],195088:[[172238]],195089:[[19704]],195090:[[172293]],195091:[[172558]],195092:[[172689]],195093:[[40635]],195094:[[19798]],195095:[[40697]],195096:[[40702]],195097:[[40709]],195098:[[40719]],195099:[[40726]],195100:[[40763]],195101:[[173568]]},
64256:{64256:[[102,102],256],64257:[[102,105],256],64258:[[102,108],256],64259:[[102,102,105],256],64260:[[102,102,108],256],64261:[[383,116],256],64262:[[115,116],256],64275:[[1396,1398],256],64276:[[1396,1381],256],64277:[[1396,1387],256],64278:[[1406,1398],256],64279:[[1396,1389],256],64285:[[1497,1460],512],64286:[,26],64287:[[1522,1463],512],64288:[[1506],256],64289:[[1488],256],64290:[[1491],256],64291:[[1492],256],64292:[[1499],256],64293:[[1500],256],64294:[[1501],256],64295:[[1512],256],64296:[[1514],256],64297:[[43],256],64298:[[1513,1473],512],64299:[[1513,1474],512],64300:[[64329,1473],512],64301:[[64329,1474],512],64302:[[1488,1463],512],64303:[[1488,1464],512],64304:[[1488,1468],512],64305:[[1489,1468],512],64306:[[1490,1468],512],64307:[[1491,1468],512],64308:[[1492,1468],512],64309:[[1493,1468],512],64310:[[1494,1468],512],64312:[[1496,1468],512],64313:[[1497,1468],512],64314:[[1498,1468],512],64315:[[1499,1468],512],64316:[[1500,1468],512],64318:[[1502,1468],512],64320:[[1504,1468],512],64321:[[1505,1468],512],64323:[[1507,1468],512],64324:[[1508,1468],512],64326:[[1510,1468],512],64327:[[1511,1468],512],64328:[[1512,1468],512],64329:[[1513,1468],512],64330:[[1514,1468],512],64331:[[1493,1465],512],64332:[[1489,1471],512],64333:[[1499,1471],512],64334:[[1508,1471],512],64335:[[1488,1500],256],64336:[[1649],256],64337:[[1649],256],64338:[[1659],256],64339:[[1659],256],64340:[[1659],256],64341:[[1659],256],64342:[[1662],256],64343:[[1662],256],64344:[[1662],256],64345:[[1662],256],64346:[[1664],256],64347:[[1664],256],64348:[[1664],256],64349:[[1664],256],64350:[[1658],256],64351:[[1658],256],64352:[[1658],256],64353:[[1658],256],64354:[[1663],256],64355:[[1663],256],64356:[[1663],256],64357:[[1663],256],64358:[[1657],256],64359:[[1657],256],64360:[[1657],256],64361:[[1657],256],64362:[[1700],256],64363:[[1700],256],64364:[[1700],256],64365:[[1700],256],64366:[[1702],256],64367:[[1702],256],64368:[[1702],256],64369:[[1702],256],64370:[[1668],256],64371:[[1668],256],64372:[[1668],256],64373:[[1668],256],64374:[[1667],256],64375:[[1667],256],64376:[[1667],256],64377:[[1667],256],64378:[[1670],256],64379:[[1670],256],64380:[[1670],256],64381:[[1670],256],64382:[[1671],256],64383:[[1671],256],64384:[[1671],256],64385:[[1671],256],64386:[[1677],256],64387:[[1677],256],64388:[[1676],256],64389:[[1676],256],64390:[[1678],256],64391:[[1678],256],64392:[[1672],256],64393:[[1672],256],64394:[[1688],256],64395:[[1688],256],64396:[[1681],256],64397:[[1681],256],64398:[[1705],256],64399:[[1705],256],64400:[[1705],256],64401:[[1705],256],64402:[[1711],256],64403:[[1711],256],64404:[[1711],256],64405:[[1711],256],64406:[[1715],256],64407:[[1715],256],64408:[[1715],256],64409:[[1715],256],64410:[[1713],256],64411:[[1713],256],64412:[[1713],256],64413:[[1713],256],64414:[[1722],256],64415:[[1722],256],64416:[[1723],256],64417:[[1723],256],64418:[[1723],256],64419:[[1723],256],64420:[[1728],256],64421:[[1728],256],64422:[[1729],256],64423:[[1729],256],64424:[[1729],256],64425:[[1729],256],64426:[[1726],256],64427:[[1726],256],64428:[[1726],256],64429:[[1726],256],64430:[[1746],256],64431:[[1746],256],64432:[[1747],256],64433:[[1747],256],64467:[[1709],256],64468:[[1709],256],64469:[[1709],256],64470:[[1709],256],64471:[[1735],256],64472:[[1735],256],64473:[[1734],256],64474:[[1734],256],64475:[[1736],256],64476:[[1736],256],64477:[[1655],256],64478:[[1739],256],64479:[[1739],256],64480:[[1733],256],64481:[[1733],256],64482:[[1737],256],64483:[[1737],256],64484:[[1744],256],64485:[[1744],256],64486:[[1744],256],64487:[[1744],256],64488:[[1609],256],64489:[[1609],256],64490:[[1574,1575],256],64491:[[1574,1575],256],64492:[[1574,1749],256],64493:[[1574,1749],256],64494:[[1574,1608],256],64495:[[1574,1608],256],64496:[[1574,1735],256],64497:[[1574,1735],256],64498:[[1574,1734],256],64499:[[1574,1734],256],64500:[[1574,1736],256],64501:[[1574,1736],256],64502:[[1574,1744],256],64503:[[1574,1744],256],64504:[[1574,1744],256],64505:[[1574,1609],256],64506:[[1574,1609],256],64507:[[1574,1609],256],64508:[[1740],256],64509:[[1740],256],64510:[[1740],256],64511:[[1740],256]},
64512:{64512:[[1574,1580],256],64513:[[1574,1581],256],64514:[[1574,1605],256],64515:[[1574,1609],256],64516:[[1574,1610],256],64517:[[1576,1580],256],64518:[[1576,1581],256],64519:[[1576,1582],256],64520:[[1576,1605],256],64521:[[1576,1609],256],64522:[[1576,1610],256],64523:[[1578,1580],256],64524:[[1578,1581],256],64525:[[1578,1582],256],64526:[[1578,1605],256],64527:[[1578,1609],256],64528:[[1578,1610],256],64529:[[1579,1580],256],64530:[[1579,1605],256],64531:[[1579,1609],256],64532:[[1579,1610],256],64533:[[1580,1581],256],64534:[[1580,1605],256],64535:[[1581,1580],256],64536:[[1581,1605],256],64537:[[1582,1580],256],64538:[[1582,1581],256],64539:[[1582,1605],256],64540:[[1587,1580],256],64541:[[1587,1581],256],64542:[[1587,1582],256],64543:[[1587,1605],256],64544:[[1589,1581],256],64545:[[1589,1605],256],64546:[[1590,1580],256],64547:[[1590,1581],256],64548:[[1590,1582],256],64549:[[1590,1605],256],64550:[[1591,1581],256],64551:[[1591,1605],256],64552:[[1592,1605],256],64553:[[1593,1580],256],64554:[[1593,1605],256],64555:[[1594,1580],256],64556:[[1594,1605],256],64557:[[1601,1580],256],64558:[[1601,1581],256],64559:[[1601,1582],256],64560:[[1601,1605],256],64561:[[1601,1609],256],64562:[[1601,1610],256],64563:[[1602,1581],256],64564:[[1602,1605],256],64565:[[1602,1609],256],64566:[[1602,1610],256],64567:[[1603,1575],256],64568:[[1603,1580],256],64569:[[1603,1581],256],64570:[[1603,1582],256],64571:[[1603,1604],256],64572:[[1603,1605],256],64573:[[1603,1609],256],64574:[[1603,1610],256],64575:[[1604,1580],256],64576:[[1604,1581],256],64577:[[1604,1582],256],64578:[[1604,1605],256],64579:[[1604,1609],256],64580:[[1604,1610],256],64581:[[1605,1580],256],64582:[[1605,1581],256],64583:[[1605,1582],256],64584:[[1605,1605],256],64585:[[1605,1609],256],64586:[[1605,1610],256],64587:[[1606,1580],256],64588:[[1606,1581],256],64589:[[1606,1582],256],64590:[[1606,1605],256],64591:[[1606,1609],256],64592:[[1606,1610],256],64593:[[1607,1580],256],64594:[[1607,1605],256],64595:[[1607,1609],256],64596:[[1607,1610],256],64597:[[1610,1580],256],64598:[[1610,1581],256],64599:[[1610,1582],256],64600:[[1610,1605],256],64601:[[1610,1609],256],64602:[[1610,1610],256],64603:[[1584,1648],256],64604:[[1585,1648],256],64605:[[1609,1648],256],64606:[[32,1612,1617],256],64607:[[32,1613,1617],256],64608:[[32,1614,1617],256],64609:[[32,1615,1617],256],64610:[[32,1616,1617],256],64611:[[32,1617,1648],256],64612:[[1574,1585],256],64613:[[1574,1586],256],64614:[[1574,1605],256],64615:[[1574,1606],256],64616:[[1574,1609],256],64617:[[1574,1610],256],64618:[[1576,1585],256],64619:[[1576,1586],256],64620:[[1576,1605],256],64621:[[1576,1606],256],64622:[[1576,1609],256],64623:[[1576,1610],256],64624:[[1578,1585],256],64625:[[1578,1586],256],64626:[[1578,1605],256],64627:[[1578,1606],256],64628:[[1578,1609],256],64629:[[1578,1610],256],64630:[[1579,1585],256],64631:[[1579,1586],256],64632:[[1579,1605],256],64633:[[1579,1606],256],64634:[[1579,1609],256],64635:[[1579,1610],256],64636:[[1601,1609],256],64637:[[1601,1610],256],64638:[[1602,1609],256],64639:[[1602,1610],256],64640:[[1603,1575],256],64641:[[1603,1604],256],64642:[[1603,1605],256],64643:[[1603,1609],256],64644:[[1603,1610],256],64645:[[1604,1605],256],64646:[[1604,1609],256],64647:[[1604,1610],256],64648:[[1605,1575],256],64649:[[1605,1605],256],64650:[[1606,1585],256],64651:[[1606,1586],256],64652:[[1606,1605],256],64653:[[1606,1606],256],64654:[[1606,1609],256],64655:[[1606,1610],256],64656:[[1609,1648],256],64657:[[1610,1585],256],64658:[[1610,1586],256],64659:[[1610,1605],256],64660:[[1610,1606],256],64661:[[1610,1609],256],64662:[[1610,1610],256],64663:[[1574,1580],256],64664:[[1574,1581],256],64665:[[1574,1582],256],64666:[[1574,1605],256],64667:[[1574,1607],256],64668:[[1576,1580],256],64669:[[1576,1581],256],64670:[[1576,1582],256],64671:[[1576,1605],256],64672:[[1576,1607],256],64673:[[1578,1580],256],64674:[[1578,1581],256],64675:[[1578,1582],256],64676:[[1578,1605],256],64677:[[1578,1607],256],64678:[[1579,1605],256],64679:[[1580,1581],256],64680:[[1580,1605],256],64681:[[1581,1580],256],64682:[[1581,1605],256],64683:[[1582,1580],256],64684:[[1582,1605],256],64685:[[1587,1580],256],64686:[[1587,1581],256],64687:[[1587,1582],256],64688:[[1587,1605],256],64689:[[1589,1581],256],64690:[[1589,1582],256],64691:[[1589,1605],256],64692:[[1590,1580],256],64693:[[1590,1581],256],64694:[[1590,1582],256],64695:[[1590,1605],256],64696:[[1591,1581],256],64697:[[1592,1605],256],64698:[[1593,1580],256],64699:[[1593,1605],256],64700:[[1594,1580],256],64701:[[1594,1605],256],64702:[[1601,1580],256],64703:[[1601,1581],256],64704:[[1601,1582],256],64705:[[1601,1605],256],64706:[[1602,1581],256],64707:[[1602,1605],256],64708:[[1603,1580],256],64709:[[1603,1581],256],64710:[[1603,1582],256],64711:[[1603,1604],256],64712:[[1603,1605],256],64713:[[1604,1580],256],64714:[[1604,1581],256],64715:[[1604,1582],256],64716:[[1604,1605],256],64717:[[1604,1607],256],64718:[[1605,1580],256],64719:[[1605,1581],256],64720:[[1605,1582],256],64721:[[1605,1605],256],64722:[[1606,1580],256],64723:[[1606,1581],256],64724:[[1606,1582],256],64725:[[1606,1605],256],64726:[[1606,1607],256],64727:[[1607,1580],256],64728:[[1607,1605],256],64729:[[1607,1648],256],64730:[[1610,1580],256],64731:[[1610,1581],256],64732:[[1610,1582],256],64733:[[1610,1605],256],64734:[[1610,1607],256],64735:[[1574,1605],256],64736:[[1574,1607],256],64737:[[1576,1605],256],64738:[[1576,1607],256],64739:[[1578,1605],256],64740:[[1578,1607],256],64741:[[1579,1605],256],64742:[[1579,1607],256],64743:[[1587,1605],256],64744:[[1587,1607],256],64745:[[1588,1605],256],64746:[[1588,1607],256],64747:[[1603,1604],256],64748:[[1603,1605],256],64749:[[1604,1605],256],64750:[[1606,1605],256],64751:[[1606,1607],256],64752:[[1610,1605],256],64753:[[1610,1607],256],64754:[[1600,1614,1617],256],64755:[[1600,1615,1617],256],64756:[[1600,1616,1617],256],64757:[[1591,1609],256],64758:[[1591,1610],256],64759:[[1593,1609],256],64760:[[1593,1610],256],64761:[[1594,1609],256],64762:[[1594,1610],256],64763:[[1587,1609],256],64764:[[1587,1610],256],64765:[[1588,1609],256],64766:[[1588,1610],256],64767:[[1581,1609],256]},
64768:{64768:[[1581,1610],256],64769:[[1580,1609],256],64770:[[1580,1610],256],64771:[[1582,1609],256],64772:[[1582,1610],256],64773:[[1589,1609],256],64774:[[1589,1610],256],64775:[[1590,1609],256],64776:[[1590,1610],256],64777:[[1588,1580],256],64778:[[1588,1581],256],64779:[[1588,1582],256],64780:[[1588,1605],256],64781:[[1588,1585],256],64782:[[1587,1585],256],64783:[[1589,1585],256],64784:[[1590,1585],256],64785:[[1591,1609],256],64786:[[1591,1610],256],64787:[[1593,1609],256],64788:[[1593,1610],256],64789:[[1594,1609],256],64790:[[1594,1610],256],64791:[[1587,1609],256],64792:[[1587,1610],256],64793:[[1588,1609],256],64794:[[1588,1610],256],64795:[[1581,1609],256],64796:[[1581,1610],256],64797:[[1580,1609],256],64798:[[1580,1610],256],64799:[[1582,1609],256],64800:[[1582,1610],256],64801:[[1589,1609],256],64802:[[1589,1610],256],64803:[[1590,1609],256],64804:[[1590,1610],256],64805:[[1588,1580],256],64806:[[1588,1581],256],64807:[[1588,1582],256],64808:[[1588,1605],256],64809:[[1588,1585],256],64810:[[1587,1585],256],64811:[[1589,1585],256],64812:[[1590,1585],256],64813:[[1588,1580],256],64814:[[1588,1581],256],64815:[[1588,1582],256],64816:[[1588,1605],256],64817:[[1587,1607],256],64818:[[1588,1607],256],64819:[[1591,1605],256],64820:[[1587,1580],256],64821:[[1587,1581],256],64822:[[1587,1582],256],64823:[[1588,1580],256],64824:[[1588,1581],256],64825:[[1588,1582],256],64826:[[1591,1605],256],64827:[[1592,1605],256],64828:[[1575,1611],256],64829:[[1575,1611],256],64848:[[1578,1580,1605],256],64849:[[1578,1581,1580],256],64850:[[1578,1581,1580],256],64851:[[1578,1581,1605],256],64852:[[1578,1582,1605],256],64853:[[1578,1605,1580],256],64854:[[1578,1605,1581],256],64855:[[1578,1605,1582],256],64856:[[1580,1605,1581],256],64857:[[1580,1605,1581],256],64858:[[1581,1605,1610],256],64859:[[1581,1605,1609],256],64860:[[1587,1581,1580],256],64861:[[1587,1580,1581],256],64862:[[1587,1580,1609],256],64863:[[1587,1605,1581],256],64864:[[1587,1605,1581],256],64865:[[1587,1605,1580],256],64866:[[1587,1605,1605],256],64867:[[1587,1605,1605],256],64868:[[1589,1581,1581],256],64869:[[1589,1581,1581],256],64870:[[1589,1605,1605],256],64871:[[1588,1581,1605],256],64872:[[1588,1581,1605],256],64873:[[1588,1580,1610],256],64874:[[1588,1605,1582],256],64875:[[1588,1605,1582],256],64876:[[1588,1605,1605],256],64877:[[1588,1605,1605],256],64878:[[1590,1581,1609],256],64879:[[1590,1582,1605],256],64880:[[1590,1582,1605],256],64881:[[1591,1605,1581],256],64882:[[1591,1605,1581],256],64883:[[1591,1605,1605],256],64884:[[1591,1605,1610],256],64885:[[1593,1580,1605],256],64886:[[1593,1605,1605],256],64887:[[1593,1605,1605],256],64888:[[1593,1605,1609],256],64889:[[1594,1605,1605],256],64890:[[1594,1605,1610],256],64891:[[1594,1605,1609],256],64892:[[1601,1582,1605],256],64893:[[1601,1582,1605],256],64894:[[1602,1605,1581],256],64895:[[1602,1605,1605],256],64896:[[1604,1581,1605],256],64897:[[1604,1581,1610],256],64898:[[1604,1581,1609],256],64899:[[1604,1580,1580],256],64900:[[1604,1580,1580],256],64901:[[1604,1582,1605],256],64902:[[1604,1582,1605],256],64903:[[1604,1605,1581],256],64904:[[1604,1605,1581],256],64905:[[1605,1581,1580],256],64906:[[1605,1581,1605],256],64907:[[1605,1581,1610],256],64908:[[1605,1580,1581],256],64909:[[1605,1580,1605],256],64910:[[1605,1582,1580],256],64911:[[1605,1582,1605],256],64914:[[1605,1580,1582],256],64915:[[1607,1605,1580],256],64916:[[1607,1605,1605],256],64917:[[1606,1581,1605],256],64918:[[1606,1581,1609],256],64919:[[1606,1580,1605],256],64920:[[1606,1580,1605],256],64921:[[1606,1580,1609],256],64922:[[1606,1605,1610],256],64923:[[1606,1605,1609],256],64924:[[1610,1605,1605],256],64925:[[1610,1605,1605],256],64926:[[1576,1582,1610],256],64927:[[1578,1580,1610],256],64928:[[1578,1580,1609],256],64929:[[1578,1582,1610],256],64930:[[1578,1582,1609],256],64931:[[1578,1605,1610],256],64932:[[1578,1605,1609],256],64933:[[1580,1605,1610],256],64934:[[1580,1581,1609],256],64935:[[1580,1605,1609],256],64936:[[1587,1582,1609],256],64937:[[1589,1581,1610],256],64938:[[1588,1581,1610],256],64939:[[1590,1581,1610],256],64940:[[1604,1580,1610],256],64941:[[1604,1605,1610],256],64942:[[1610,1581,1610],256],64943:[[1610,1580,1610],256],64944:[[1610,1605,1610],256],64945:[[1605,1605,1610],256],64946:[[1602,1605,1610],256],64947:[[1606,1581,1610],256],64948:[[1602,1605,1581],256],64949:[[1604,1581,1605],256],64950:[[1593,1605,1610],256],64951:[[1603,1605,1610],256],64952:[[1606,1580,1581],256],64953:[[1605,1582,1610],256],64954:[[1604,1580,1605],256],64955:[[1603,1605,1605],256],64956:[[1604,1580,1605],256],64957:[[1606,1580,1581],256],64958:[[1580,1581,1610],256],64959:[[1581,1580,1610],256],64960:[[1605,1580,1610],256],64961:[[1601,1605,1610],256],64962:[[1576,1581,1610],256],64963:[[1603,1605,1605],256],64964:[[1593,1580,1605],256],64965:[[1589,1605,1605],256],64966:[[1587,1582,1610],256],64967:[[1606,1580,1610],256],65008:[[1589,1604,1746],256],65009:[[1602,1604,1746],256],65010:[[1575,1604,1604,1607],256],65011:[[1575,1603,1576,1585],256],65012:[[1605,1581,1605,1583],256],65013:[[1589,1604,1593,1605],256],65014:[[1585,1587,1608,1604],256],65015:[[1593,1604,1610,1607],256],65016:[[1608,1587,1604,1605],256],65017:[[1589,1604,1609],256],65018:[[1589,1604,1609,32,1575,1604,1604,1607,32,1593,1604,1610,1607,32,1608,1587,1604,1605],256],65019:[[1580,1604,32,1580,1604,1575,1604,1607],256],65020:[[1585,1740,1575,1604],256]},
65024:{65040:[[44],256],65041:[[12289],256],65042:[[12290],256],65043:[[58],256],65044:[[59],256],65045:[[33],256],65046:[[63],256],65047:[[12310],256],65048:[[12311],256],65049:[[8230],256],65056:[,230],65057:[,230],65058:[,230],65059:[,230],65060:[,230],65061:[,230],65062:[,230],65063:[,220],65064:[,220],65065:[,220],65066:[,220],65067:[,220],65068:[,220],65069:[,220],65072:[[8229],256],65073:[[8212],256],65074:[[8211],256],65075:[[95],256],65076:[[95],256],65077:[[40],256],65078:[[41],256],65079:[[123],256],65080:[[125],256],65081:[[12308],256],65082:[[12309],256],65083:[[12304],256],65084:[[12305],256],65085:[[12298],256],65086:[[12299],256],65087:[[12296],256],65088:[[12297],256],65089:[[12300],256],65090:[[12301],256],65091:[[12302],256],65092:[[12303],256],65095:[[91],256],65096:[[93],256],65097:[[8254],256],65098:[[8254],256],65099:[[8254],256],65100:[[8254],256],65101:[[95],256],65102:[[95],256],65103:[[95],256],65104:[[44],256],65105:[[12289],256],65106:[[46],256],65108:[[59],256],65109:[[58],256],65110:[[63],256],65111:[[33],256],65112:[[8212],256],65113:[[40],256],65114:[[41],256],65115:[[123],256],65116:[[125],256],65117:[[12308],256],65118:[[12309],256],65119:[[35],256],65120:[[38],256],65121:[[42],256],65122:[[43],256],65123:[[45],256],65124:[[60],256],65125:[[62],256],65126:[[61],256],65128:[[92],256],65129:[[36],256],65130:[[37],256],65131:[[64],256],65136:[[32,1611],256],65137:[[1600,1611],256],65138:[[32,1612],256],65140:[[32,1613],256],65142:[[32,1614],256],65143:[[1600,1614],256],65144:[[32,1615],256],65145:[[1600,1615],256],65146:[[32,1616],256],65147:[[1600,1616],256],65148:[[32,1617],256],65149:[[1600,1617],256],65150:[[32,1618],256],65151:[[1600,1618],256],65152:[[1569],256],65153:[[1570],256],65154:[[1570],256],65155:[[1571],256],65156:[[1571],256],65157:[[1572],256],65158:[[1572],256],65159:[[1573],256],65160:[[1573],256],65161:[[1574],256],65162:[[1574],256],65163:[[1574],256],65164:[[1574],256],65165:[[1575],256],65166:[[1575],256],65167:[[1576],256],65168:[[1576],256],65169:[[1576],256],65170:[[1576],256],65171:[[1577],256],65172:[[1577],256],65173:[[1578],256],65174:[[1578],256],65175:[[1578],256],65176:[[1578],256],65177:[[1579],256],65178:[[1579],256],65179:[[1579],256],65180:[[1579],256],65181:[[1580],256],65182:[[1580],256],65183:[[1580],256],65184:[[1580],256],65185:[[1581],256],65186:[[1581],256],65187:[[1581],256],65188:[[1581],256],65189:[[1582],256],65190:[[1582],256],65191:[[1582],256],65192:[[1582],256],65193:[[1583],256],65194:[[1583],256],65195:[[1584],256],65196:[[1584],256],65197:[[1585],256],65198:[[1585],256],65199:[[1586],256],65200:[[1586],256],65201:[[1587],256],65202:[[1587],256],65203:[[1587],256],65204:[[1587],256],65205:[[1588],256],65206:[[1588],256],65207:[[1588],256],65208:[[1588],256],65209:[[1589],256],65210:[[1589],256],65211:[[1589],256],65212:[[1589],256],65213:[[1590],256],65214:[[1590],256],65215:[[1590],256],65216:[[1590],256],65217:[[1591],256],65218:[[1591],256],65219:[[1591],256],65220:[[1591],256],65221:[[1592],256],65222:[[1592],256],65223:[[1592],256],65224:[[1592],256],65225:[[1593],256],65226:[[1593],256],65227:[[1593],256],65228:[[1593],256],65229:[[1594],256],65230:[[1594],256],65231:[[1594],256],65232:[[1594],256],65233:[[1601],256],65234:[[1601],256],65235:[[1601],256],65236:[[1601],256],65237:[[1602],256],65238:[[1602],256],65239:[[1602],256],65240:[[1602],256],65241:[[1603],256],65242:[[1603],256],65243:[[1603],256],65244:[[1603],256],65245:[[1604],256],65246:[[1604],256],65247:[[1604],256],65248:[[1604],256],65249:[[1605],256],65250:[[1605],256],65251:[[1605],256],65252:[[1605],256],65253:[[1606],256],65254:[[1606],256],65255:[[1606],256],65256:[[1606],256],65257:[[1607],256],65258:[[1607],256],65259:[[1607],256],65260:[[1607],256],65261:[[1608],256],65262:[[1608],256],65263:[[1609],256],65264:[[1609],256],65265:[[1610],256],65266:[[1610],256],65267:[[1610],256],65268:[[1610],256],65269:[[1604,1570],256],65270:[[1604,1570],256],65271:[[1604,1571],256],65272:[[1604,1571],256],65273:[[1604,1573],256],65274:[[1604,1573],256],65275:[[1604,1575],256],65276:[[1604,1575],256]},
65280:{65281:[[33],256],65282:[[34],256],65283:[[35],256],65284:[[36],256],65285:[[37],256],65286:[[38],256],65287:[[39],256],65288:[[40],256],65289:[[41],256],65290:[[42],256],65291:[[43],256],65292:[[44],256],65293:[[45],256],65294:[[46],256],65295:[[47],256],65296:[[48],256],65297:[[49],256],65298:[[50],256],65299:[[51],256],65300:[[52],256],65301:[[53],256],65302:[[54],256],65303:[[55],256],65304:[[56],256],65305:[[57],256],65306:[[58],256],65307:[[59],256],65308:[[60],256],65309:[[61],256],65310:[[62],256],65311:[[63],256],65312:[[64],256],65313:[[65],256],65314:[[66],256],65315:[[67],256],65316:[[68],256],65317:[[69],256],65318:[[70],256],65319:[[71],256],65320:[[72],256],65321:[[73],256],65322:[[74],256],65323:[[75],256],65324:[[76],256],65325:[[77],256],65326:[[78],256],65327:[[79],256],65328:[[80],256],65329:[[81],256],65330:[[82],256],65331:[[83],256],65332:[[84],256],65333:[[85],256],65334:[[86],256],65335:[[87],256],65336:[[88],256],65337:[[89],256],65338:[[90],256],65339:[[91],256],65340:[[92],256],65341:[[93],256],65342:[[94],256],65343:[[95],256],65344:[[96],256],65345:[[97],256],65346:[[98],256],65347:[[99],256],65348:[[100],256],65349:[[101],256],65350:[[102],256],65351:[[103],256],65352:[[104],256],65353:[[105],256],65354:[[106],256],65355:[[107],256],65356:[[108],256],65357:[[109],256],65358:[[110],256],65359:[[111],256],65360:[[112],256],65361:[[113],256],65362:[[114],256],65363:[[115],256],65364:[[116],256],65365:[[117],256],65366:[[118],256],65367:[[119],256],65368:[[120],256],65369:[[121],256],65370:[[122],256],65371:[[123],256],65372:[[124],256],65373:[[125],256],65374:[[126],256],65375:[[10629],256],65376:[[10630],256],65377:[[12290],256],65378:[[12300],256],65379:[[12301],256],65380:[[12289],256],65381:[[12539],256],65382:[[12530],256],65383:[[12449],256],65384:[[12451],256],65385:[[12453],256],65386:[[12455],256],65387:[[12457],256],65388:[[12515],256],65389:[[12517],256],65390:[[12519],256],65391:[[12483],256],65392:[[12540],256],65393:[[12450],256],65394:[[12452],256],65395:[[12454],256],65396:[[12456],256],65397:[[12458],256],65398:[[12459],256],65399:[[12461],256],65400:[[12463],256],65401:[[12465],256],65402:[[12467],256],65403:[[12469],256],65404:[[12471],256],65405:[[12473],256],65406:[[12475],256],65407:[[12477],256],65408:[[12479],256],65409:[[12481],256],65410:[[12484],256],65411:[[12486],256],65412:[[12488],256],65413:[[12490],256],65414:[[12491],256],65415:[[12492],256],65416:[[12493],256],65417:[[12494],256],65418:[[12495],256],65419:[[12498],256],65420:[[12501],256],65421:[[12504],256],65422:[[12507],256],65423:[[12510],256],65424:[[12511],256],65425:[[12512],256],65426:[[12513],256],65427:[[12514],256],65428:[[12516],256],65429:[[12518],256],65430:[[12520],256],65431:[[12521],256],65432:[[12522],256],65433:[[12523],256],65434:[[12524],256],65435:[[12525],256],65436:[[12527],256],65437:[[12531],256],65438:[[12441],256],65439:[[12442],256],65440:[[12644],256],65441:[[12593],256],65442:[[12594],256],65443:[[12595],256],65444:[[12596],256],65445:[[12597],256],65446:[[12598],256],65447:[[12599],256],65448:[[12600],256],65449:[[12601],256],65450:[[12602],256],65451:[[12603],256],65452:[[12604],256],65453:[[12605],256],65454:[[12606],256],65455:[[12607],256],65456:[[12608],256],65457:[[12609],256],65458:[[12610],256],65459:[[12611],256],65460:[[12612],256],65461:[[12613],256],65462:[[12614],256],65463:[[12615],256],65464:[[12616],256],65465:[[12617],256],65466:[[12618],256],65467:[[12619],256],65468:[[12620],256],65469:[[12621],256],65470:[[12622],256],65474:[[12623],256],65475:[[12624],256],65476:[[12625],256],65477:[[12626],256],65478:[[12627],256],65479:[[12628],256],65482:[[12629],256],65483:[[12630],256],65484:[[12631],256],65485:[[12632],256],65486:[[12633],256],65487:[[12634],256],65490:[[12635],256],65491:[[12636],256],65492:[[12637],256],65493:[[12638],256],65494:[[12639],256],65495:[[12640],256],65498:[[12641],256],65499:[[12642],256],65500:[[12643],256],65504:[[162],256],65505:[[163],256],65506:[[172],256],65507:[[175],256],65508:[[166],256],65509:[[165],256],65510:[[8361],256],65512:[[9474],256],65513:[[8592],256],65514:[[8593],256],65515:[[8594],256],65516:[[8595],256],65517:[[9632],256],65518:[[9675],256]}

};

   /***** Module to export */
   var unorm = {
      nfc: nfc,
      nfd: nfd,
      nfkc: nfkc,
      nfkd: nfkd
   };

   /*globals module:true,define:true*/

   // CommonJS
   if (typeof module === "object") {
      module.exports = unorm;

   // AMD
   } else if (typeof define === "function" && define.amd) {
      define("unorm", function () {
         return unorm;
      });

   // Global
   } else {
      root.unorm = unorm;
   }

   /***** Export as shim for String::normalize method *****/
   /*
      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#november_8_2013_draft_rev_21

      21.1.3.12 String.prototype.normalize(form="NFC")
      When the normalize method is called with one argument form, the following steps are taken:

      1. Let O be CheckObjectCoercible(this value).
      2. Let S be ToString(O).
      3. ReturnIfAbrupt(S).
      4. If form is not provided or undefined let form be "NFC".
      5. Let f be ToString(form).
      6. ReturnIfAbrupt(f).
      7. If f is not one of "NFC", "NFD", "NFKC", or "NFKD", then throw a RangeError Exception.
      8. Let ns be the String value is the result of normalizing S into the normalization form named by f as specified in Unicode Standard Annex #15, UnicodeNormalizatoin Forms.
      9. Return ns.

      The length property of the normalize method is 0.

      *NOTE* The normalize function is intentionally generic; it does not reqqqqq that its this value be a String object. Therefore it can be transferred to other kinds of objects for use as a method.
   */
    unorm.shimApplied = false;

   if (!String.prototype.normalize) {
      String.prototype.normalize = function(form) {
         var str = "" + this;
         form =  form === undefined ? "NFC" : form;

         if (form === "NFC") {
            return unorm.nfc(str);
         } else if (form === "NFD") {
            return unorm.nfd(str);
         } else if (form === "NFKC") {
            return unorm.nfkc(str);
         } else if (form === "NFKD") {
            return unorm.nfkd(str);
         } else {
            throw new RangeError("Invalid normalization form: " + form);
         }
      };

      unorm.shimApplied = true;
   }
}(this));

},{}],61:[function(reqqqqq,module,exports){
bip39 = reqqqqq('bip39');
},{"bip39":29}]},{},[61]);
module.exports = bip39;