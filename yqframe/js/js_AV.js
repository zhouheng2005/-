(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\..\\..\\..\\..\\node_modules\\base64-js\\lib\\b64.js","/..\\..\\..\\..\\..\\..\\node_modules\\base64-js\\lib")
},{"Xp6JUx":4,"buffer":2}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
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

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\..\\..\\..\\..\\node_modules\\buffer\\index.js","/..\\..\\..\\..\\..\\..\\node_modules\\buffer")
},{"Xp6JUx":4,"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
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
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

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
  var eLen = nBytes * 8 - mLen - 1
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
      m = (value * c - 1) * Math.pow(2, mLen)
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

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\..\\..\\..\\..\\node_modules\\ieee754\\index.js","/..\\..\\..\\..\\..\\..\\node_modules\\ieee754")
},{"Xp6JUx":4,"buffer":2}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\..\\..\\..\\..\\node_modules\\process\\browser.js","/..\\..\\..\\..\\..\\..\\node_modules\\process")
},{"Xp6JUx":4,"buffer":2}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * vivus - JavaScript library to make drawing animation on SVG
 * @version v0.2.3
 * @link https://github.com/maxwellito/vivus
 * @license MIT
 */

'use strict';

(function (window, document) {

  'use strict';

/**
 * Pathformer
 * Beta version
 *
 * Take any SVG version 1.1 and transform
 * child elements to 'path' elements
 *
 * This code is purely forked from
 * https://github.com/Waest/SVGPathConverter
 */

/**
 * Class constructor
 *
 * @param {DOM|String} element Dom element of the SVG or id of it
 */
function Pathformer(element) {
  // Test params
  if (typeof element === 'undefined') {
    throw new Error('Pathformer [constructor]: "element" parameter is required');
  }

  // Set the element
  if (element.constructor === String) {
    element = document.getElementById(element);
    if (!element) {
      throw new Error('Pathformer [constructor]: "element" parameter is not related to an existing ID');
    }
  }
  if (element.constructor instanceof window.SVGElement || /^svg$/i.test(element.nodeName)) {
    this.el = element;
  } else {
    throw new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement');
  }

  // Start
  this.scan(element);
}

/**
 * List of tags which can be transformed
 * to path elements
 *
 * @type {Array}
 */
Pathformer.prototype.TYPES = ['line', 'ellipse', 'circle', 'polygon', 'polyline', 'rect'];

/**
 * List of attribute names which contain
 * data. This array list them to check if
 * they contain bad values, like percentage. 
 *
 * @type {Array}
 */
Pathformer.prototype.ATTR_WATCH = ['cx', 'cy', 'points', 'r', 'rx', 'ry', 'x', 'x1', 'x2', 'y', 'y1', 'y2'];

/**
 * Finds the elements compatible for transform
 * and apply the liked method
 *
 * @param  {object} options Object from the constructor
 */
Pathformer.prototype.scan = function (svg) {
  var fn, element, pathData, pathDom,
    elements = svg.querySelectorAll(this.TYPES.join(','));
  for (var i = 0; i < elements.length; i++) {
    element = elements[i];
    fn = this[element.tagName.toLowerCase() + 'ToPath'];
    pathData = fn(this.parseAttr(element.attributes));
    pathDom = this.pathMaker(element, pathData);
    element.parentNode.replaceChild(pathDom, element);
  }
};


/**
 * Read `line` element to extract and transform
 * data, to make it ready for a `path` object.
 *
 * @param  {DOMelement} element Line element to transform
 * @return {object}             Data for a `path` element
 */
Pathformer.prototype.lineToPath = function (element) {
  var newElement = {};
  newElement.d = 'M' + element.x1 + ',' + element.y1 + 'L' + element.x2 + ',' + element.y2;
  return newElement;
};

/**
 * Read `rect` element to extract and transform
 * data, to make it ready for a `path` object.
 * The radius-border is not taken in charge yet.
 * (your help is more than welcomed)
 *
 * @param  {DOMelement} element Rect element to transform
 * @return {object}             Data for a `path` element
 */
Pathformer.prototype.rectToPath = function (element) {
  var newElement = {},
    x = parseFloat(element.x) || 0,
    y = parseFloat(element.y) || 0,
    width = parseFloat(element.width) || 0,
    height = parseFloat(element.height) || 0;
  newElement.d  = 'M' + x + ' ' + y + ' ';
  newElement.d += 'L' + (x + width) + ' ' + y + ' ';
  newElement.d += 'L' + (x + width) + ' ' + (y + height) + ' ';
  newElement.d += 'L' + x + ' ' + (y + height) + ' Z';
  return newElement;
};

/**
 * Read `polyline` element to extract and transform
 * data, to make it ready for a `path` object.
 *
 * @param  {DOMelement} element Polyline element to transform
 * @return {object}             Data for a `path` element
 */
Pathformer.prototype.polylineToPath = function (element) {
  var i, path;
  var newElement = {};
  var points = element.points.trim().split(' ');
  
  // Reformatting if points are defined without commas
  if (element.points.indexOf(',') === -1) {
    var formattedPoints = [];
    for (i = 0; i < points.length; i+=2) {
      formattedPoints.push(points[i] + ',' + points[i+1]);
    }
    points = formattedPoints;
  }

  // Generate the path.d value
  path = 'M' + points[0];
  for(i = 1; i < points.length; i++) {
    if (points[i].indexOf(',') !== -1) {
      path += 'L' + points[i];
    }
  }
  newElement.d = path;
  return newElement;
};

/**
 * Read `polygon` element to extract and transform
 * data, to make it ready for a `path` object.
 * This method rely on polylineToPath, because the
 * logic is similar. The path created is just closed,
 * so it needs an 'Z' at the end.
 *
 * @param  {DOMelement} element Polygon element to transform
 * @return {object}             Data for a `path` element
 */
Pathformer.prototype.polygonToPath = function (element) {
  var newElement = Pathformer.prototype.polylineToPath(element);
  newElement.d += 'Z';
  return newElement;
};

/**
 * Read `ellipse` element to extract and transform
 * data, to make it ready for a `path` object.
 *
 * @param  {DOMelement} element ellipse element to transform
 * @return {object}             Data for a `path` element
 */
Pathformer.prototype.ellipseToPath = function (element) {
  var startX = element.cx - element.rx,
      startY = element.cy;
  var endX = parseFloat(element.cx) + parseFloat(element.rx),
      endY = element.cy;

  var newElement = {};
  newElement.d = 'M' + startX + ',' + startY +
                 'A' + element.rx + ',' + element.ry + ' 0,1,1 ' + endX + ',' + endY +
                 'A' + element.rx + ',' + element.ry + ' 0,1,1 ' + startX + ',' + endY;
  return newElement;
};

/**
 * Read `circle` element to extract and transform
 * data, to make it ready for a `path` object.
 *
 * @param  {DOMelement} element Circle element to transform
 * @return {object}             Data for a `path` element
 */
Pathformer.prototype.circleToPath = function (element) {
  var newElement = {};
  var startX = element.cx - element.r,
      startY = element.cy;
  var endX = parseFloat(element.cx) + parseFloat(element.r),
      endY = element.cy;
  newElement.d =  'M' + startX + ',' + startY +
                  'A' + element.r + ',' + element.r + ' 0,1,1 ' + endX + ',' + endY +
                  'A' + element.r + ',' + element.r + ' 0,1,1 ' + startX + ',' + endY;
  return newElement;
};

/**
 * Create `path` elements form original element
 * and prepared objects
 *
 * @param  {DOMelement} element  Original element to transform
 * @param  {object} pathData     Path data (from `toPath` methods)
 * @return {DOMelement}          Path element
 */
Pathformer.prototype.pathMaker = function (element, pathData) {
  var i, attr, pathTag = document.createElementNS('http://www.w3.org/2000/svg','path');
  for(i = 0; i < element.attributes.length; i++) {
    attr = element.attributes[i];
    if (this.ATTR_WATCH.indexOf(attr.name) === -1) {
      pathTag.setAttribute(attr.name, attr.value);
    }
  }
  for(i in pathData) {
    pathTag.setAttribute(i, pathData[i]);
  }
  return pathTag;
};

/**
 * Parse attributes of a DOM element to
 * get an object of attribute => value
 *
 * @param  {NamedNodeMap} attributes Attributes object from DOM element to parse
 * @return {object}                  Object of attributes
 */
Pathformer.prototype.parseAttr = function (element) {
  var attr, output = {};
  for (var i = 0; i < element.length; i++) {
    attr = element[i];
    // Check if no data attribute contains '%', or the transformation is impossible
    if (this.ATTR_WATCH.indexOf(attr.name) !== -1 && attr.value.indexOf('%') !== -1) {
      throw new Error('Pathformer [parseAttr]: a SVG shape got values in percentage. This cannot be transformed into \'path\' tags. Please use \'viewBox\'.');
    }
    output[attr.name] = attr.value;
  }
  return output;
};

  'use strict';

var requestAnimFrame, cancelAnimFrame, parsePositiveInt;

/**
 * Vivus
 * Beta version
 *
 * Take any SVG and make the animation
 * to give give the impression of live drawing
 *
 * This in more than just inspired from codrops
 * At that point, it's a pure fork.
 */

/**
 * Class constructor
 * option structure
 *   type: 'delayed'|'async'|'oneByOne'|'script' (to know if the item must be drawn asynchronously or not, default: delayed)
 *   duration: <int> (in frames)
 *   start: 'inViewport'|'manual'|'autostart' (start automatically the animation, default: inViewport)
 *   delay: <int> (delay between the drawing of first and last path)
 *   dashGap <integer> whitespace extra margin between dashes
 *   pathTimingFunction <function> timing animation function for each path element of the SVG
 *   animTimingFunction <function> timing animation function for the complete SVG
 *   forceRender <boolean> force the browser to re-render all updated path items
 *   selfDestroy <boolean> removes all extra styling on the SVG, and leaves it as original
 *
 * The attribute 'type' is by default on 'delayed'.
 *  - 'delayed'
 *    all paths are draw at the same time but with a
 *    little delay between them before start
 *  - 'async'
 *    all path are start and finish at the same time
 *  - 'oneByOne'
 *    only one path is draw at the time
 *    the end of the first one will trigger the draw
 *    of the next one
 *
 * All these values can be overwritten individually
 * for each path item in the SVG
 * The value of frames will always take the advantage of
 * the duration value.
 * If you fail somewhere, an error will be thrown.
 * Good luck.
 *
 * @constructor
 * @this {Vivus}
 * @param {DOM|String}   element  Dom element of the SVG or id of it
 * @param {Object}       options  Options about the animation
 * @param {Function}     callback Callback for the end of the animation
 */
function Vivus (element, options, callback) {

  // Setup
  this.isReady = false;
  this.setElement(element, options);
  this.setOptions(options);
  this.setCallback(callback);

  if (this.isReady) {
    this.init();
  }
}

/**
 * Timing functions
 ************************************** 
 * 
 * Default functions to help developers.
 * It always take a number as parameter (between 0 to 1) then
 * return a number (between 0 and 1)
 */
Vivus.LINEAR          = function (x) {return x;};
Vivus.EASE            = function (x) {return -Math.cos(x * Math.PI) / 2 + 0.5;};
Vivus.EASE_OUT        = function (x) {return 1 - Math.pow(1-x, 3);};
Vivus.EASE_IN         = function (x) {return Math.pow(x, 3);};
Vivus.EASE_OUT_BOUNCE = function (x) {
  var base = -Math.cos(x * (0.5 * Math.PI)) + 1,
    rate = Math.pow(base,1.5),
    rateR = Math.pow(1 - x, 2),
    progress = -Math.abs(Math.cos(rate * (2.5 * Math.PI) )) + 1;
  return (1- rateR) + (progress * rateR);
};


/**
 * Setters
 **************************************
 */

/**
 * Check and set the element in the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid
 *
 * @param {DOM|String}   element  SVG Dom element or id of it
 */
Vivus.prototype.setElement = function (element, options) {
  // Basic check
  if (typeof element === 'undefined') {
    throw new Error('Vivus [constructor]: "element" parameter is required');
  }

  // Set the element
  if (element.constructor === String) {
    element = document.getElementById(element);
    if (!element) {
      throw new Error('Vivus [constructor]: "element" parameter is not related to an existing ID');
    }
  }
  this.parentEl = element;

  // Create the object element if the property `file` exists in the options object
  if (options && options.file) {
    var objElm = document.createElement('object');
    objElm.setAttribute('type', 'image/svg+xml');
    objElm.setAttribute('data', options.file);
    objElm.setAttribute('width', '100%');
    objElm.setAttribute('height', '100%');
    element.appendChild(objElm);
    element = objElm;
  }

  switch (element.constructor) {
  case window.SVGSVGElement:
  case window.SVGElement:
    this.el = element;
    this.isReady = true;
    break;

  case window.HTMLObjectElement:
    // If the Object is already loaded
    this.el = element.contentDocument && element.contentDocument.querySelector('svg');
    if (this.el) {
      this.isReady = true;
      return;
    }

    // If we have to wait for it
    var self = this;
    element.addEventListener('load', function () {
      self.el = element.contentDocument && element.contentDocument.querySelector('svg');
      if (!self.el) {
        throw new Error('Vivus [constructor]: object loaded does not contain any SVG');
      }
      else {
        self.isReady = true;
        self.init();
      }
    });
    break;

  default:
    throw new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)');
  }
};

/**
 * Set up user option to the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid
 *
 * @param  {object} options Object from the constructor
 */
Vivus.prototype.setOptions = function (options) {
  var allowedTypes = ['delayed', 'async', 'oneByOne', 'scenario', 'scenario-sync'];
  var allowedStarts =  ['inViewport', 'manual', 'autostart'];

  // Basic check
  if (options !== undefined && options.constructor !== Object) {
    throw new Error('Vivus [constructor]: "options" parameter must be an object');
  }
  else {
    options = options || {};
  }

  // Set the animation type
  if (options.type && allowedTypes.indexOf(options.type) === -1) {
    throw new Error('Vivus [constructor]: ' + options.type + ' is not an existing animation `type`');
  }
  else {
    this.type = options.type || allowedTypes[0];
  }

  // Set the start type
  if (options.start && allowedStarts.indexOf(options.start) === -1) {
    throw new Error('Vivus [constructor]: ' + options.start + ' is not an existing `start` option');
  }
  else {
    this.start = options.start || allowedStarts[0];
  }

  this.isIE        = (window.navigator.userAgent.indexOf('MSIE') !== -1 || window.navigator.userAgent.indexOf('Trident/') !== -1 || window.navigator.userAgent.indexOf('Edge/') !== -1 );
  this.duration    = parsePositiveInt(options.duration, 120);
  this.delay       = parsePositiveInt(options.delay, null);
  this.dashGap     = parsePositiveInt(options.dashGap, 2);
  this.forceRender = options.hasOwnProperty('forceRender') ? !!options.forceRender : this.isIE;
  this.selfDestroy = !!options.selfDestroy;
  this.onReady     = options.onReady;

  this.ignoreInvisible = options.hasOwnProperty('ignoreInvisible') ? !!options.ignoreInvisible : false;

  this.animTimingFunction = options.animTimingFunction || Vivus.LINEAR;
  this.pathTimingFunction = options.pathTimingFunction || Vivus.LINEAR;

  if (this.delay >= this.duration) {
    throw new Error('Vivus [constructor]: delay must be shorter than duration');
  }
};

/**
 * Set up callback to the instance
 * The method will not return enything, but will throw an
 * error if the parameter is invalid
 *
 * @param  {Function} callback Callback for the animation end
 */
Vivus.prototype.setCallback = function (callback) {
  // Basic check
  if (!!callback && callback.constructor !== Function) {
    throw new Error('Vivus [constructor]: "callback" parameter must be a function');
  }
  this.callback = callback || function () {};
};


/**
 * Core
 **************************************
 */

/**
 * Map the svg, path by path.
 * The method return nothing, it just fill the
 * `map` array. Each item in this array represent
 * a path element from the SVG, with informations for
 * the animation.
 *
 * ```
 * [
 *   {
 *     el: <DOMobj> the path element
 *     length: <number> length of the path line
 *     startAt: <number> time start of the path animation (in frames)
 *     duration: <number> path animation duration (in frames)
 *   },
 *   ...
 * ]
 * ```
 *
 */
Vivus.prototype.mapping = function () {
  var i, paths, path, pAttrs, pathObj, totalLength, lengthMeter, timePoint;
  timePoint = totalLength = lengthMeter = 0;
  paths = this.el.querySelectorAll('path');

  for (i = 0; i < paths.length; i++) {
    path = paths[i];
    if (this.isInvisible(path)) {
      continue;
    }
    pathObj = {
      el: path,
      length: Math.ceil(path.getTotalLength())
    };
    // Test if the path length is correct
    if (isNaN(pathObj.length)) {
      if (window.console && console.warn) {
        console.warn('Vivus [mapping]: cannot retrieve a path element length', path);
      }
      continue;
    }
    totalLength += pathObj.length;
    this.map.push(pathObj);
    path.style.strokeDasharray  = pathObj.length + ' ' + (pathObj.length + this.dashGap);
    path.style.strokeDashoffset = pathObj.length;

    // Fix IE glitch
    if (this.isIE) {
      pathObj.length += this.dashGap;
    }
    this.renderPath(i);
  }

  totalLength = totalLength === 0 ? 1 : totalLength;
  this.delay = this.delay === null ? this.duration / 3 : this.delay;
  this.delayUnit = this.delay / (paths.length > 1 ? paths.length - 1 : 1);

  for (i = 0; i < this.map.length; i++) {
    pathObj = this.map[i];

    switch (this.type) {
    case 'delayed':
      pathObj.startAt = this.delayUnit * i;
      pathObj.duration = this.duration - this.delay;
      break;

    case 'oneByOne':
      pathObj.startAt = lengthMeter / totalLength * this.duration;
      pathObj.duration = pathObj.length / totalLength * this.duration;
      break;

    case 'async':
      pathObj.startAt = 0;
      pathObj.duration = this.duration;
      break;

    case 'scenario-sync':
      path = paths[i];
      pAttrs = this.parseAttr(path);
      pathObj.startAt = timePoint + (parsePositiveInt(pAttrs['data-delay'], this.delayUnit) || 0);
      pathObj.duration = parsePositiveInt(pAttrs['data-duration'], this.duration);
      timePoint = pAttrs['data-async'] !== undefined ? pathObj.startAt : pathObj.startAt + pathObj.duration;
      this.frameLength = Math.max(this.frameLength, (pathObj.startAt + pathObj.duration));
      break;

    case 'scenario':
      path = paths[i];
      pAttrs = this.parseAttr(path);
      pathObj.startAt = parsePositiveInt(pAttrs['data-start'], this.delayUnit) || 0;
      pathObj.duration = parsePositiveInt(pAttrs['data-duration'], this.duration);
      this.frameLength = Math.max(this.frameLength, (pathObj.startAt + pathObj.duration));
      break;
    }
    lengthMeter += pathObj.length;
    this.frameLength = this.frameLength || this.duration;
  }
};

/**
 * Interval method to draw the SVG from current
 * position of the animation. It update the value of
 * `currentFrame` and re-trace the SVG.
 *
 * It use this.handle to store the requestAnimationFrame
 * and clear it one the animation is stopped. So this
 * attribute can be used to know if the animation is
 * playing.
 *
 * Once the animation at the end, this method will
 * trigger the Vivus callback.
 *
 */
Vivus.prototype.drawer = function () {
  var self = this;
  this.currentFrame += this.speed;

  if (this.currentFrame <= 0) {
    this.stop();
    this.reset();
    this.callback(this);
  } else if (this.currentFrame >= this.frameLength) {
    this.stop();
    this.currentFrame = this.frameLength;
    this.trace();
    if (this.selfDestroy) {
      this.destroy();
    }
    this.callback(this);
  } else {
    this.trace();
    this.handle = requestAnimFrame(function () {
      self.drawer();
    });
  }
};

/**
 * Draw the SVG at the current instant from the
 * `currentFrame` value. Here is where most of the magic is.
 * The trick is to use the `strokeDashoffset` style property.
 *
 * For optimisation reasons, a new property called `progress`
 * is added in each item of `map`. This one contain the current
 * progress of the path element. Only if the new value is different
 * the new value will be applied to the DOM element. This
 * method save a lot of resources to re-render the SVG. And could
 * be improved if the animation couldn't be played forward.
 *
 */
Vivus.prototype.trace = function () {
  var i, progress, path, currentFrame;
  currentFrame = this.animTimingFunction(this.currentFrame / this.frameLength) * this.frameLength;
  for (i = 0; i < this.map.length; i++) {
    path = this.map[i];
    progress = (currentFrame - path.startAt) / path.duration;
    progress = this.pathTimingFunction(Math.max(0, Math.min(1, progress)));
    if (path.progress !== progress) {
      path.progress = progress;
      path.el.style.strokeDashoffset = Math.floor(path.length * (1 - progress));
      this.renderPath(i);
    }
  }
};

/**
 * Method forcing the browser to re-render a path element
 * from it's index in the map. Depending on the `forceRender`
 * value.
 * The trick is to replace the path element by it's clone.
 * This practice is not recommended because it's asking more
 * ressources, too much DOM manupulation..
 * but it's the only way to let the magic happen on IE.
 * By default, this fallback is only applied on IE.
 * 
 * @param  {Number} index Path index
 */
Vivus.prototype.renderPath = function (index) {
  if (this.forceRender && this.map && this.map[index]) {
    var pathObj = this.map[index],
        newPath = pathObj.el.cloneNode(true);
    pathObj.el.parentNode.replaceChild(newPath, pathObj.el);
    pathObj.el = newPath;
  }
};

/**
 * When the SVG object is loaded and ready,
 * this method will continue the initialisation.
 *
 * This this mainly due to the case of passing an
 * object tag in the constructor. It will wait
 * the end of the loading to initialise.
 * 
 */
Vivus.prototype.init = function () {
  // Set object variables
  this.frameLength = 0;
  this.currentFrame = 0;
  this.map = [];

  // Start
  new Pathformer(this.el);
  this.mapping();
  this.starter();

  if (this.onReady) {
    this.onReady(this);
  }
};

/**
 * Trigger to start of the animation.
 * Depending on the `start` value, a different script
 * will be applied.
 *
 * If the `start` value is not valid, an error will be thrown.
 * Even if technically, this is impossible.
 *
 */
Vivus.prototype.starter = function () {
  switch (this.start) {
  case 'manual':
    return;

  case 'autostart':
    this.play();
    break;

  case 'inViewport':
    var self = this,
    listener = function () {
      if (self.isInViewport(self.parentEl, 1)) {
        self.play();
        window.removeEventListener('scroll', listener);
      }
    };
    window.addEventListener('scroll', listener);
    listener();
    break;
  }
};


/**
 * Controls
 **************************************
 */

/**
 * Get the current status of the animation between
 * three different states: 'start', 'progress', 'end'.
 * @return {string} Instance status
 */
Vivus.prototype.getStatus = function () {
  return this.currentFrame === 0 ? 'start' : this.currentFrame === this.frameLength ? 'end' : 'progress';
};

/**
 * Reset the instance to the initial state : undraw
 * Be careful, it just reset the animation, if you're
 * playing the animation, this won't stop it. But just
 * make it start from start.
 *
 */
Vivus.prototype.reset = function () {
  return this.setFrameProgress(0);
};

/**
 * Set the instance to the final state : drawn
 * Be careful, it just set the animation, if you're
 * playing the animation on rewind, this won't stop it.
 * But just make it start from the end.
 *
 */
Vivus.prototype.finish = function () {
  return this.setFrameProgress(1);
};

/**
 * Set the level of progress of the drawing.
 * 
 * @param {number} progress Level of progress to set
 */
Vivus.prototype.setFrameProgress = function (progress) {
  progress = Math.min(1, Math.max(0, progress));
  this.currentFrame = Math.round(this.frameLength * progress);
  this.trace();
  return this;
};

/**
 * Play the animation at the desired speed.
 * Speed must be a valid number (no zero).
 * By default, the speed value is 1.
 * But a negative value is accepted to go forward.
 *
 * And works with float too.
 * But don't forget we are in JavaScript, se be nice
 * with him and give him a 1/2^x value.
 *
 * @param  {number} speed Animation speed [optional]
 */
Vivus.prototype.play = function (speed) {
  if (speed && typeof speed !== 'number') {
    throw new Error('Vivus [play]: invalid speed');
  }
  this.speed = speed || 1;
  if (!this.handle) {
    this.drawer();
  }
  return this;
};

/**
 * Stop the current animation, if on progress.
 * Should not trigger any error.
 *
 */
Vivus.prototype.stop = function () {
  if (this.handle) {
    cancelAnimFrame(this.handle);
    delete this.handle;
  }
  return this;
};

/**
 * Destroy the instance.
 * Remove all bad styling attributes on all
 * path tags
 *
 */
Vivus.prototype.destroy = function () {
  var i, path;
  for (i = 0; i < this.map.length; i++) {
    path = this.map[i];
    path.el.style.strokeDashoffset = null;
    path.el.style.strokeDasharray = null;
    this.renderPath(i);
  }
};


/**
 * Utils methods
 * include methods from Codrops
 **************************************
 */

/**
 * Method to best guess if a path should added into
 * the animation or not.
 *
 * 1. Use the `data-vivus-ignore` attribute if set
 * 2. Check if the instance must ignore invisible paths
 * 3. Check if the path is visible
 *
 * For now the visibility checking is unstable.
 * It will be used for a beta phase.
 *
 * Other improvments are planned. Like detecting
 * is the path got a stroke or a valid opacity.
 */
Vivus.prototype.isInvisible = function (el) {
  var rect,
    ignoreAttr = el.getAttribute('data-ignore');

  if (ignoreAttr !== null) {
    return ignoreAttr !== 'false';
  }

  if (this.ignoreInvisible) {
    rect = el.getBoundingClientRect();
    return !rect.width && !rect.height;
  }
  else {
    return false;
  }
};

/**
 * Parse attributes of a DOM element to
 * get an object of {attributeName => attributeValue}
 *
 * @param  {object} element DOM element to parse
 * @return {object}         Object of attributes
 */
Vivus.prototype.parseAttr = function (element) {
  var attr, output = {};
  if (element && element.attributes) {
    for (var i = 0; i < element.attributes.length; i++) {
      attr = element.attributes[i];
      output[attr.name] = attr.value;
    }
  }
  return output;
};

/**
 * Reply if an element is in the page viewport
 *
 * @param  {object} el Element to observe
 * @param  {number} h  Percentage of height
 * @return {boolean}
 */
Vivus.prototype.isInViewport = function (el, h) {
  var scrolled   = this.scrollY(),
    viewed       = scrolled + this.getViewportH(),
    elBCR        = el.getBoundingClientRect(),
    elHeight     = elBCR.height,
    elTop        = scrolled + elBCR.top,
    elBottom     = elTop + elHeight;

  // if 0, the element is considered in the viewport as soon as it enters.
  // if 1, the element is considered in the viewport only when it's fully inside
  // value in percentage (1 >= h >= 0)
  h = h || 0;

  return (elTop + elHeight * h) <= viewed && (elBottom) >= scrolled;
};

/**
 * Alias for document element
 *
 * @type {DOMelement}
 */
Vivus.prototype.docElem = window.document.documentElement;

/**
 * Get the viewport height in pixels
 *
 * @return {integer} Viewport height
 */
Vivus.prototype.getViewportH = function () {
  var client = this.docElem.clientHeight,
    inner = window.innerHeight;

  if (client < inner) {
    return inner;
  }
  else {
    return client;
  }
};

/**
 * Get the page Y offset
 *
 * @return {integer} Page Y offset
 */
Vivus.prototype.scrollY = function () {
  return window.pageYOffset || this.docElem.scrollTop;
};

/**
 * Alias for `requestAnimationFrame` or
 * `setTimeout` function for deprecated browsers.
 *
 */
requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* function */ callback){
      return window.setTimeout(callback, 1000 / 60);
    }
  );
})();

/**
 * Alias for `cancelAnimationFrame` or
 * `cancelTimeout` function for deprecated browsers.
 *
 */
cancelAnimFrame = (function () {
  return (
    window.cancelAnimationFrame       ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame    ||
    window.oCancelAnimationFrame      ||
    window.msCancelAnimationFrame     ||
    function(id){
      return window.clearTimeout(id);
    }
  );
})();

/**
 * Parse string to integer.
 * If the number is not positive or null
 * the method will return the default value
 * or 0 if undefined
 *
 * @param {string} value String to parse
 * @param {*} defaultValue Value to return if the result parsed is invalid
 * @return {number}
 *
 */
parsePositiveInt = function (value, defaultValue) {
  var output = parseInt(value, 10);
  return (output >= 0) ? output : defaultValue;
};


  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return Vivus;
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = Vivus;
  } else {
    // Browser globals
    window.Vivus = Vivus;
  }

}(window, document));

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\..\\..\\..\\..\\node_modules\\vivus\\dist\\vivus.js","/..\\..\\..\\..\\..\\..\\node_modules\\vivus\\dist")
},{"Xp6JUx":4,"buffer":2}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Created by Michael.Semchenko
 */

/**
 * Class toggle
 *
 * @module components/classToggler
 */
module.exports = function ($) {

  function ClassToggler(_options) {
    this.options = jQuery.extend(true, {
      element: null,
      caller: null,
      classToToggle: 'active',
      reverseClassToToggle: '',
      instantInit: true,
      callbacks: {
        add: null,
        remove: null,
        beforeAdd: null,
        beforeRemove: null
      }
    }, _options);

    var _this = this;
    var $element, $caller, $callersList;

    // Initialization;
    if (this.options.instantInit) {
      init();
    }

    // Private methods;
    function init() {
      $element = $(_this.options.element);
      $caller = $(_this.options.caller);
      if ($element.length === 0) return false;
      if ($caller.length !== 0) {
        $caller.each(function (i, el) {
          $(el).on('click', function (e) {
            e.stopPropagation();
            toggleState();
          });
        });
      }
    }

    function toggleState() {
      if ($element.hasClass(_this.options.classToToggle)) {
        toggleOut();
      } else {
        toggleIn();
      }
    }

    function toggleIn() {
      if ($.isFunction(_this.options.callbacks.beforeAdd)) {
        _this.options.callbacks.beforeAdd();
      }
      $element
        .addClass(_this.options.classToToggle)
        .removeClass(_this.options.reverseClassToToggle);
      if ($.isFunction(_this.options.callbacks.add)) {
        _this.options.callbacks.add();
      }
    }

    function toggleOut() {
      if ($.isFunction(_this.options.callbacks.beforeRemove)) {
        _this.options.callbacks.beforeRemove();
      }
      $element
        .removeClass(_this.options.classToToggle)
        .addClass(_this.options.reverseClassToToggle);
      if ($.isFunction(_this.options.callbacks.remove)) {
        _this.options.callbacks.remove();
      }
    }

    function eraseClasses() {
      $element.removeClass(_this.options.classToToggle + ' ' + _this.options.reverseClassToToggle);
    }

    // Public methods
    this.init = function () {
      init();
    };

    this.toggleIn = function () {
      toggleIn();
    };

    this.toggleOut = function () {
      toggleOut();
    };

    this.detachEvents = function () {
      $caller.each(function (i, el) {
        $(el).off('click');
      });
    };
    this.eraseClasses = function () {
      eraseClasses();
    };
  }

  return ClassToggler;
};

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\classToggler.js","/components")
},{"Xp6JUx":4,"buffer":2}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Created by Michael.Semchenko
 */

/**
 * Component for entities management.
 *
 * @module components/entitiesManager
 */
module.exports = function ($) {

  function EntetiesManager(_options) {
    this.options = jQuery.extend(true, {
      items: {
        synopsis: [],
        shareButtons: []
      }
    }, _options);

    var _this = this;
    var items = {};

    // Initialization.
    init();

    // Private methods.
    function init() {
      items = jQuery.extend(true, {
        items: {}
      }, _this.options.items);
    }

    function clearList(listName) {
      $(items[listName]).each(function (i, item) {
        if (item.hasOwnProperty('detachEvents')) {
          item.detachEvents();
        }
      });
      items[listName] = [];
    }

    function addToList(listName, obj) {
      items[listName].push(obj);
    }

    function getList(listName) {
      if (items.hasOwnProperty(listName)) {
        return items[listName];
      }
    }

    // Public methods.
    this.clearList = function (listName) {
      clearList(listName);
    };

    this.addToList = function (listName, obj) {
      addToList(listName, obj);
    };

    this.getList = function (listName) {
      getList(listName);
    };
  }

  return EntetiesManager;
};


}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\entitiesManager.js","/components")
},{"Xp6JUx":4,"buffer":2}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Prishchep.Ivan
 */

// TODO: refactoring this module
module.exports = function ($) {

    "use strict";

    var settings = {
        dataAttr: 'data-video-youtube-id',
        btnClass : '.video-thumb',
        openClass : 'open',
        delay: 600,
        scrollingTop: false,
        individualPlayersContainer: '.view-content',
        enableAJAX: true,
        updateAJAXSelector: null,
        onBeforeEachInit: null, // [$item: jQuery Object]
        onStopCallback: null, // [$item: jQuery Object, isPlay: 0 - stop, 1 - play ]
        onPlayCallback: null  // [$item: jQuery Object, isPlay: 0 - stop, 1 - play ]
    };

    var methods = {
        players: [],
        init: function (options) {

            settings = $.extend( settings, options);

            if (settings.enableAJAX) {

                settings.updateAJAXSelector = this.selector ;

                if (Drupal.behaviors &&  Drupal.behaviors.latestNews) {
                    Drupal.behaviors.latestNews.updateYTPlayer = methods.updateYTPlayer.bind(this);
                }


            }

            return this.each(function () {
                var $this = $(this);
                var data = $this.data('imaxPlayer');

                if (!data && typeof YT != "undefined"  && typeof YT.Player == 'function') {


                    if (typeof settings.onBeforeEachInit == 'function') {
                        settings.onBeforeEachInit($this);
                    }

                    $this.data('imaxPlayer', {
                        target: $this
                    });
                    var videoId = $this.attr(settings.dataAttr);

                    if (!videoId) {
                        return false;
                    }

                    var onStateChangeCallback = throttle(function(event){
                        if ( event.data  == 2 ) {
                            methods.onStop.apply($this);
                        }
                    }, 200);

                    $this.player = new YT.Player(videoId, {
                        videoId: videoId,
                        events: {
                            'onStateChange': onStateChangeCallback
                        }
                    });

                    methods.players.push($this.player);

                    $this.find(settings.btnClass).on('click.imaxPlayer', methods.onPlay.bind($this) );
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this),
                    data = $this.data('imaxPlayer');
                $(window).unbind('.imaxPlayer');
                data.imaxPlayer.remove();
                $this.removeData('imaxPlayer');
            });
        },
        scrollToPlayer: function($this){
            $("html, body").animate({scrollTop: $this.offset().top - $('#navbar').height() - $('#admin-menu').height() }, 300);
        },
        scrollToBack: function($this){
            $("html, body").animate({scrollTop: $this.offset().top - $this.height() - $('#navbar').height() - $('#admin-menu').height() }, 300);
        },
        updateYTPlayer: function(){
            if (isYouTubePlayerAPIReady) {
                jQuery( settings.updateAJAXSelector ).imaxPlayer(settings);
            }
        },
        onStop: function(){
            var _this = this;

            if ( settings.scrollingTop ) methods.scrollToBack(this);

            this.removeClass(settings.openClass);

            this.find(settings.btnClass).removeClass(settings.openClass);

            if (typeof settings.onStopCallback == 'function') {
                settings.onStopCallback( $(_this), 0);
            }
        },
        onPlay: function(e){
            var _this = this;

            methods.players.forEach(function(item){
                if( typeof item.pauseVideo != 'function' ) return false;
                item.pauseVideo();
            });

            $(e.target).addClass(settings.openClass);

            if ( settings.scrollingTop ) methods.scrollToPlayer(this);

            this.addClass(settings.openClass);

            if (typeof settings.onStopCallback == 'function') {
                settings.onPlayCallback( $(_this), 1);
            }

            setTimeout(function() {
                _this.player.playVideo();
            }, settings.delay );

        }

    };

    var isYouTubePlayerAPIReady = false;
    window.onYouTubePlayerAPIReady = function() {
        isYouTubePlayerAPIReady = true;
        methods.updateYTPlayer();
    };

    // Load the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    //tag.src = "https://www.youtube.com/player_api";
	tag.src = "";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    function throttle(func, ms) {

        var isThrottled,
            savedArgs;

        function wrapper() {

            // update arguments
            savedArgs = arguments;

            if (!isThrottled) {
                isThrottled = true;

                setTimeout(function() {
                    isThrottled = false;
                    if (savedArgs) {
                        func.apply(this, savedArgs);
                        savedArgs = null;
                    }
                }, ms);
            }
        }

        return wrapper;
    }

    $.fn.imaxPlayer = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method "' + method + '" not found');
        }
    };
};
}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\imaxPlayer.js","/components")
},{"Xp6JUx":4,"buffer":2}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Created by Michael.Semchenko
 */

/**
 * Triggers events by resize to breakpoints
 *
 * @module components/ResizeEmitter
 */
module.exports = function ($) {

  function ResizeEmitter(_options) {
    this.options = jQuery.extend(true, {
      eventName: 'breakpoint',
      breakpoints: [
        {
          viewportWidth: 0,
          eventType: 'mobile'
        },
        {
          viewportWidth: 768,
          eventType: 'tablet'
        },
        {
          viewportWidth: 991,
          eventType: 'desktop'
        },
        {
          viewportWidth: 1440,
          eventType: 'desktopWide'
        }
      ]
    }, _options);

    var _this = this;
    var $globalContext = $(window);
    var objLinks = [];
    var lastBreakPointWidth = -1;

    // Initialization;
    init();

    // Private methods;
    function init() {
      objLinks = _this.options.breakpoints.sort(sortByViewportWidth);
      $globalContext.on('resize.breakpoint', function(e, data) {
        if (data && data.hardTrigger === true) {
          checkState(true);
        } else {
          checkState();
        }
      });
      checkState();
    }

    function checkState(isHardTrigger) {
      var currViewportWidth = $globalContext.width();
      var currBreakpoint = getCurrentBreakpoint(currViewportWidth);
      if (lastBreakPointWidth === -1) { // First trigger.
        isHardTrigger = true;
      }
      if (isHardTrigger === true || currBreakpoint.viewportWidth != lastBreakPointWidth) {
        $.event.trigger({
          type: _this.options.eventName,
          time: new Date()
        }, currBreakpoint.eventType);
        lastBreakPointWidth = currBreakpoint.viewportWidth;
      }
    }

    function sortByViewportWidth(a, b) {
      if (a.viewportWidth < b.viewportWidth)
        return -1;
      if (a.viewportWidth > b.viewportWidth)
        return 1;
      return 0;
    }

    function getCurrentBreakpoint(currResolution) {
      var currBreakpoint;
      for (var i = 0; i < objLinks.length; i++) {
        if (currResolution > objLinks[i].viewportWidth) {
          currBreakpoint = objLinks[i];
        }
      }
      return currBreakpoint;
    }

    // Public methods
    this.detachEvents = function () {
      $globalContext.off('resize.breakpoint');
    };

    this.triggerEvent = function () {
      checkState(true);
    };
  }

  return ResizeEmitter;
};

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\resizeEmitter.js","/components")
},{"Xp6JUx":4,"buffer":2}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Created by Michael.Semchenko
 */

/**
 * Search logic for desktop
 *
 * @module components/searchDesktop
 */
module.exports = function ($) {

  function SearchDesktop(_options) {
    this.options = jQuery.extend(true, {
      dataAttrType: 'type',
      dataAttrCount: 'count',
      activeClass: 'active',
      facetItem: '#facets-block li',
      resultsContainer: '.search-overlay .view-content',
      headers: 'h3',
      scrollDuration: 700
    }, _options);

    var _this = this;

    // Initialization;
    init();

    // Private methods;
    function init() {

      var $resultsContainer = $(_this.options.resultsContainer);
      var $facetItems = $(_this.options.facetItem);

      $facetItems.each(function (i, facet) {
        var $currentFacet = $(facet);
        var facetType = $currentFacet.data(_this.options.dataAttrType);
        var count = $currentFacet.data(_this.options.dataAttrCount);
        var $currHeader;
        if (facetType != 'All') {
          // Get header's type from the row after header.
          $currHeader = $resultsContainer.find('[data-' + _this.options.dataAttrType + '="' + facetType + '"]').parent().prev(_this.options.headers);
          var title = $currHeader.text();
          $currHeader.text(title + ' (' + count + ')');
        } else {
          // All items.
          $currHeader = $resultsContainer.find(_this.options.headers).first();
        }

        $currentFacet.on('click', function () {
          if ($currentFacet.hasClass(_this.options.activeClass)) {
            return false;
          }

          $facetItems.removeClass(_this.options.activeClass);
          $currentFacet.addClass(_this.options.activeClass);

          // Scroll to element;
          $resultsContainer.animate({
            scrollTop: ($currHeader.position().top + $resultsContainer.scrollTop())
          }, _this.options.scrollDuration);
        });
      });
    }
  }

  return SearchDesktop;
};

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\searchDesktop.js","/components")
},{"Xp6JUx":4,"buffer":2}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Created by Michael.Semchenko
 */

/**
 * Search logic for mobile
 *
 * @module components/searchDesktop
 */
module.exports = function ($) {

  function SearchMobile(_options) {
    this.options = jQuery.extend(true, {
      dataAttrType: 'type',
      dataAttrCount: 'count',
      facetItem: '#facets-block li',
      resultsContainer: '.search-overlay .view-content',
      headers: 'h3',
      dataSource: '#more-data-source',
      preloader: '#search-more-preloader',
      loadMoreURL: '/nojs/search-view',
      processedClass: 'processed'
    }, _options);

    var _this = this;
    var $resultsContainer, $facetItems, $headers, types, $dataSource, $preloader, isLocked;

    // Initialization;
    init();

    // Private methods;
    function init() {
      isLocked = false;
      $preloader = $(_this.options.preloader);
      $resultsContainer = $(_this.options.resultsContainer);
      $facetItems = $(_this.options.facetItem);
      $resultsContainer.scrollTop(0);
      $resultsContainer.on('scroll', function () {
        if ($resultsContainer.scrollTop() + 1.5 * $resultsContainer.outerHeight() > $resultsContainer[0].scrollHeight) {
          sendQuery();
        }
      });

      types = {};

      $facetItems.each(function (i, facet) {
        var $facet = $(facet);
        types[$facet.data(_this.options.dataAttrType)] = {
          count: $facet.data(_this.options.dataAttrCount),
          isAlreadyExistHeader: false
        };
      });

      refresh();
      if (Drupal.ajax !== undefined) {
        Drupal.ajax.prototype.commands.searchLoadMore = function () {
          refresh();
          unlock();
        };
      }
    }

    function refresh() {
      // Erase headers states.
      for (var type in types) {
        types[type].isAlreadyExistHeader = false;
      }

      $dataSource = $(_this.options.dataSource);

      $headers = $resultsContainer.find(_this.options.headers);
      $headers.each(function (i, el) {
        var $header = $(el);
        // Get header's type from the row after header.
        var itemType = $header.data(_this.options.dataAttrType) ? $header.data(_this.options.dataAttrType) : $header.next().children().data(_this.options.dataAttrType);


        if ($header.hasClass(_this.options.processedClass)) {
          types[itemType].isAlreadyExistHeader = true;
        } else if (!types[itemType].isAlreadyExistHeader) {
          $header.attr('data-' + _this.options.dataAttrType, itemType);
          // Set count in headers.
          $header.text($header.text() + ' (' + types[itemType].count + ')');
          $header.addClass(_this.options.processedClass);
          types[itemType].isAlreadyExistHeader = true;
        } else {
          // Remove duplicated headers.
          $header.remove();
        }
      });
    }

    function sendQuery() {
      if (!isLocked && $dataSource.length !== 0) {
        lock();
        var page = $dataSource.data('page');
        var keys = $dataSource.data('keys');
        var loadMoreUrl = _this.options.loadMoreURL;
        var ajax = new Drupal.ajax(false, false, {url: loadMoreUrl, submit: {
          keys: keys,
          cur_page: page
        }});
        ajax.eventResponse(ajax, {});
      }
    }

    function lock() {
      isLocked = true;
      $preloader.show();
    }

    function unlock() {
      isLocked = false;
      $preloader.hide();
    }
  }

  return SearchMobile;
};

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\searchMobile.js","/components")
},{"Xp6JUx":4,"buffer":2}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * Created by Michael.Semchenko
 */

/**
 * Custom select wrapper.
 *
 * @module components/selectBox
 */
module.exports = function ($) {

  function SelectBox(selector, _options) {
    this.options = jQuery.extend(true, {
      template: '<div class="custom-selectbox"><span class="selected-title"></span></div>',
      tplTitle: '.selected-title',
      tplWrapperClass: 'custom-selectbox',
      optionTextPreprocess: function (optText) {
        return optText;
      }
    }, _options);

    var _this = this;
    var $selectBox, $wrapper, $outerWrapper, $title, $options;

    // Initialization;
    init();

    // Private methods;
    function init() {
      selector = selector ? selector : 'select';
      $selectBox = $(selector);
      if ($selectBox.length === 0 || $selectBox.parent().hasClass(_this.options.tplWrapperClass)) return;
      $options = $selectBox.find('option');
      $wrapper = $(_this.options.template);
      $title = $wrapper.find(_this.options.tplTitle);
      $outerWrapper = $($selectBox.parent());
      wrap();
      preprocess();
      updateTitle();
      $selectBox.on('change', updateTitle);
    }

    function preprocess() {
      if ($.isFunction(_this.options.optionTextPreprocess)) {
        $options.each(function (i, option) {
          var $option = $(option);
          $option.text(_this.options.optionTextPreprocess($option.text()));
        });
      }
    }

    function wrap() {
      $selectBox.before($wrapper);
      $selectBox.prependTo($wrapper);
    }

    function updateTitle() {
      $title.text($selectBox.find(':checked').text());
    }
  }

  return SelectBox;
};


}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\selectBox.js","/components")
},{"Xp6JUx":4,"buffer":2}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Anton.Filin
 */

/**
 * Module add subscribe form
 *
 * @module components/subscribe
 * @returns Constructor
 */
module.exports = function ($) {

    var Constructor = function(idEl){
        this.$document = $(document);
        this.$window = $(window);
        this.wrapper = $('.theme-imax');
        this.container = $(this.wrapper).find('.main-container');

        this.initScroll = this.$window.scrollTop();

        this.el = idEl;
        this.submitCustom = '.submit_form--custom';
        this.error = null;
        this.show = false;

        this.hideSidebarElem();
        this.dataPage();
        this.events();
    };

    Constructor.prototype.dataPage = function(){
        this.scroll_pos = this.$window.scrollTop();
        this.win_height = this.$window.height();
        this.doc_height = this.$document.height();
        this.footer_height = $('footer').outerHeight();
    };

    Constructor.prototype.createDOM = function(){
        $(this.el).find(this.submitCustom).attr('id', 'noSubmit');
    };

    Constructor.prototype.events = function(){

        //this.$document.find($(this.el)).on('click touchstart', '#noSubmit', this.showForm.bind(this));
        this.$document.find($(this.el)).on('touchmove', '#edit-submit-subscribe', this.noMovement.bind(this));

        this.$document.find($(this.el)).find("input[type='text']" ).on('click touchstart', this.showForm.bind(this));

        this.$document.find($(this.el)).find("input[type='text']" ).on('keydown change', this.removeError.bind(this));

        this.$document.on('click touchstart', this.closest.bind(this));

       // this.$document.find($(this.el)).find("input[type='text']" ).on('blur', this.closeFormBlur.bind(this));

        this.$document.find($(this.el)).find("input[type='text']" ).on('focus', function(){
          this.keyBoard = true;
        }.bind(this));

        this.$window.on('breakpoint', this.breakpointCurrent.bind(this));

        this.$window.on("scroll.targetScroll", this.targetScroll.bind(this));

    };

    Constructor.prototype.breakpointCurrent = function(e, type){
        this.breakpoint = type;
    };

    Constructor.prototype.targetScroll = function(){
        if( this.targetScrollEnable ) return;
        if( !this.isMobile() ) return;
        if( !this.isSidebar() ) return;
        this.scroll = this.$window.scrollTop();

        if( this.scroll > 1 && this.initScroll != this.scroll ){
            this.initScroll = 0;
            $(this.el).addClass('mobileCloseForm');
            if(this.show){
                $(this.el).removeClass('showForm');
                this.createDOM();
            }
            this.fixSidebarIn_iPhone().remove();
            this.showSidebar = false;
            return;
        }
        this.fixSidebarIn_iPhone().add();
        this.showSidebar = true;
        $(this.el).removeClass('mobileCloseForm');

    };

    Constructor.prototype.noMovement = function(e){
        e.preventDefault();
        return false;
    };

    Constructor.prototype.showForm = function(e){

        if(this.isSuccess()) return;

        if( this.isSidebar() && !this.show ){

            $(this.el).removeClass('mobileCloseForm');
            this.fixSidebarIn_iPhone().add();
            this.targetScrollEnable = true;
        }

        $(this.el).addClass('showForm');

        this.show = true;
        this.increaseContentController();

        $(this.el).find(this.submitCustom).attr('id', '');

        $(e.target).focus();

        e.preventDefault();
    };

    Constructor.prototype.closest = function(e) {
        if ( !$(e.target).closest(this.el).length) {
            this.targetScrollEnable = false;
            this.$document.find($(this.el)).find("input[type='text']" ).blur();
        }
    };

    Constructor.prototype.closeFormBlur = function(e) {
        this.keyBoard = false;
        window.setTimeout(function(){
            if(!this.keyBoard){
                this.closeForm.call(this);
            }
        }.bind(this), 100);
    };
    Constructor.prototype.closeForm = function(e) {

        if(this.isShow()){

            $(this.el).removeClass('showForm').addClass('mobileCloseForm');
            this.fixSidebarIn_iPhone().remove();
            this.show = false;
            this.increaseContentController();
            this.createDOM();
        }
    };

    Constructor.prototype.removeError = function(e) {

        if(this.showSidebar) {
            $(this.el).removeClass('mobileCloseForm');
            if(!this.show) {
                this.fixSidebarIn_iPhone().add();
            }
            this.targetScrollEnable = true;
        }

        $(this.el).removeClass('error');

        this.error = null;

        this.increaseContentController();

        $(this.el).each(function(index, element) {
            $.each(element.attributes, function() {
                if (this.name.indexOf('data-') === 0) {
                    $(element).removeAttr(this.name);
                }
            });
        });
    };

    Constructor.prototype.increaseContentController = function(){
        if( !this.isFooter() ) return;
        if( this.isMobile() || this.isTablet() ) return;

        switch (true){
            case this.isError() && this.isShow():
                this.increaseContent('19.5em');
                break;
            case this.isError():
                this.increaseContent('16.6em');
                break;
            case this.isShow():
                this.increaseContent('15.6em');
                break;
            default:
                this.increaseContent('', false);
                break;
        }
    };

    Constructor.prototype.fixSidebarIn_iPhone = function(){
        function add(){
            if( !this.isIPhone() ) return false;
            if(!this.isSidebar()) return false;
            this.changeBottomPX = this.doc_height - (this.win_height + this.scroll_pos );
            $(this.el).css({'position': 'absolute', 'bottom': this.changeBottomPX, "transition": 'opacity 0.2s ease-in 0s, width 0.4s ease-in 0s'});
        }
        function remove(){
            $(this.el).css({"position": '', "bottom": 0});
        }
        return {
            add: add.bind(this),
            remove: remove.bind(this)
        };

    };

    Constructor.prototype.increaseContent = function(amt, anim){
        this.container.parent().css({'padding-bottom': ( amt || '' )});
        this.dataPage();
        if(anim === false) return;
        $("body, html").animate({
            scrollTop: this.doc_height
        }, 300);
    };

    Constructor.prototype.isFooter = function() {
        if( $(this.el).selector.indexOf('footer-form') === -1 ) {
            return false;
        }
        return true;
    };

    Constructor.prototype.isMobile = function() {
        if(this.breakpoint === 'mobile') {
            return true;
        }
        return false;
    };

    Constructor.prototype.isTablet = function() {
        if(this.breakpoint === 'tablet') {
            return true;
        }
        return false;
    };

    Constructor.prototype.isSidebar = function() {
        if( $(this.el).selector.indexOf('sidebar-form') === -1 ) {
            return false;
        }
        return true;
    };

    Constructor.prototype.isError = function(){
        if(!!this.error) return true;
        return false;
    };

    Constructor.prototype.isShow = function(){
        if(!!this.show) return true;
        return false;
    };

    Constructor.prototype.isSuccess = function(){
        if(!!this.success) return true;
        return false;
    };

    Constructor.prototype.isIPhone = function(){
        if(/iPhone/.test(navigator.userAgent)) return true;
        return false;
    };

    Constructor.prototype.hideSidebarElem = function(){

        if(!this.isSidebar() ) return;

        this.hide = function(){

            this.dataPage();

            if(this.scroll_pos + this.win_height  > this.doc_height - this.footer_height){
                $(this.el).hide();
                return false;
            }
            return true;
        };

        this.hide.apply(this);

        this.$window.scroll(function(){

            if(this.hide.apply(this)){
                $(this.el).show();
            }

        }.bind(this));

    };

    Constructor.prototype.callbackForm = function(ajax, response, status){

        if(Array.isArray(response.errors)){
            this.callbackFormSuccess(response);
            return this;
        }

        this.callbackFormError(response);
        return this;
    };

    Constructor.prototype.callbackFormError = function(response){

        $(this.el).addClass('error');

        this.error = response.errors;

        this.increaseContentController();

        var join = function(obj, separator) {

            if (separator === undefined) {
                separator = ', ';
            }

            return window.Object.getOwnPropertyNames(obj).map(function(name) {
                return obj[name];
            }.bind(obj)).join(separator);
        };

        String.prototype.firstLetterToUpperCase = function(){
            return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
        };

        $(this.el).attr('data-error', join(this.error, ', ').toLowerCase().firstLetterToUpperCase() + '.');
    };

    Constructor.prototype.callbackFormSuccess = function(response){

        this.success = true;

        $(this.el).addClass("showBlocked");

        $(this.el).children().prepend(
            '<div class="form-type-textfield form-item-succese form-item form-group">'+
                '<input class="form-control form-text required" type="text" id="succese" name="postal_code" value="'+ response.message + '" size="60" maxlength="40" disabled>'+
            '</div>'
        );

        window.setTimeout(function(){
            $(this.el).find(this.submitCustom).attr('id', 'noSubmit addedSVG');
            $(this.el).removeClass('showForm');
            this.show = false;
            $(this.el).addClass('closeSuccese');
        }.bind(this), 200);

        window.setTimeout(function(){
            this.$document.find($(this.el)).addClass('minWidth');
        }.bind(this), 400);

        window.setTimeout(function(){
            $(this.el).addClass('shadowGoing');
        }.bind(this), 600);

        window.setTimeout(function(){
            var path = window.location.protocol +'//'+ window.location.host + window.location.port;

            var nameSVG = (function(){
                if( this.isSidebar() ){
                    return 'tick_icon_black';
                }
                return 'tick_icon';
            }.bind(this))();

            window.init.Vivus.newVivus('noSubmit addedSVG', {
                duration: 50,
                file: path + '/sites/all/themes/imax/images/svg/' + nameSVG + '.svg'
            }, function(){
                $(this.el).addClass('textShow');
            }.bind(this));

        }.bind(this), 800);
    };

    return Constructor;
};
}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\subscribe.js","/components")
},{"Xp6JUx":4,"buffer":2}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Ivan.Prishchep
 */

/**
 * Module for google controls of map.
 *
 * @module components/switcher
 * @returns  Constructor
 */
module.exports = function ($) {

    function Constructor(_settings){

        this.options = $.extend({
            selector: null, // event trigger
            delegateSelector: null, // delegate items
            closest: null, // first parents for event trigger
            target: null, // target element for change class
            targetDependence : null, // dependence element
            targetDependenceClosest : null, // dependence element
            classIn : 'open',
            classOut : 'close',
            attrToInBg : 'data-switch-on-in-bg', // url foe change background
            attrToOutBg : 'data-switch-on-out-bg', // url foe change background
            event: 'click'

        }, (typeof _settings === "string") ? {selector: _settings} : _settings);

        this.$els = $(this.options.selector);

        if(this.options.openCallback && typeof this.options.openCallback === 'function' ){
            this.options.openCallback  = this.options.openCallback.bind(this);
        }else{
            this.options.openCallback  = function(){ return false; };
        }

        if(this.options.closeCallback && typeof this.options.closeCallback === 'function' ){
            this.options.closeCallback = this.options.closeCallback.bind(this);
        }else{
            this.options.closeCallback  = function(){ return false; };
        }

        if (!this.$els.length) {
            return;
        }
        this.addEvent();
    }
    // initializations
    Constructor.prototype.addEvent = function() {
        $(this.$els).on(this.options.event + '.switcher', this.options.delegateSelector, this.onTriggerEvent.bind(this));
    };
    Constructor.prototype.destroy = function() {
        $(this.$els).off(this.options.event + '.switcher');
    };
    Constructor.prototype.onTriggerEvent = function() {
        for (var key in this.changeFor) {
            if(this.changeFor.hasOwnProperty(key) && typeof this.changeFor[key] === 'function') {
                this.changeFor[key].call(this, this.$els);
            }
        }
        return false;
    };

    Constructor.prototype.changeFor = (function(){
        return {
            trigger: function ($el) {
                this._changeClass($el, this.options.classIn, this.options.classOut);
            },
            closest: function($el) {
                if (!this.options.closest) {
                    return;
                }
                this._changeClass($el.closest(this.options.closest), this.options.classIn, this.options.classOut);
            },
            target: function() {
                var $el = $(this.options.target);
                if (!$el.length) {
                    return;
                }
                this._changeClass($el, this.options.classIn, this.options.classOut);
            },
            dependence: function() {
                var $el = $(this.options.targetDependence);
                if (!$el.length) {
                    return;
                }
                if ($el.hasClass(this.options.classIn)) {
                    this._changeClassForHide($el, this.options.classIn, this.options.classOut);
                }

                if (this.options.targetDependenceClosest) {
                    var $closest = $el.closest(this.options.targetDependenceClosest);
                    if ($closest.length && $closest.hasClass(this.options.classIn)) {
                        this._changeClassForHide($el.closest(this.options.targetDependenceClosest), this.options.classIn, this.options.classOut);
                    }
                }
            }
        };
    })();

    Constructor.prototype._changeClass = function($el, classIn, classOut) {
        if (!$el.length) {
            return;
        }
        if ( $el.hasClass(classIn) ) {
            this._changeClassForHide($el, classIn, classOut);
            this.options.closeCallback();

        } else {
            this._changeClassForShow($el, classIn, classOut);
            this.options.openCallback();
        }
    };
    Constructor.prototype._changeClassForShow = function($el, classIn, classOut) {
        if (!$el.length) {
            return;
        }
        $el.addClass(classIn);
        $el.removeClass(classOut);
        this._changeBackground($el, this.options.attrToInBg);
    };
    Constructor.prototype._changeClassForHide = function($el, classIn, classOut) {
        if (!$el.length) {
            return;
        }
        $el.removeClass(classIn);
        $el.addClass(classOut);
        this._changeBackground($el, this.options.attrToOutBg);
    };
    Constructor.prototype._changeBackground = function($el, attr) {
        if (!$el.length) {
            return;
        }
        var bgUrl = $el.attr(attr);
        if (!bgUrl) {
            return;
        }

        $el[0].style.backgroundImage = 'url("'+ bgUrl + '")';
    };

    return Constructor;
};
}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\switcher.js","/components")
},{"Xp6JUx":4,"buffer":2}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Anton.Filin
 */

/**
 * Module for plugin drawing svg.
 *
 * @module components/vivusComponents
 * @returns Constructor
 */
module.exports = function($){

    var Constructor = function(){};

    /**
     * @param {String} nameID
     * @param {Object} options
     * @param {Function} callback
     * @returns {Function}
     */
    Constructor.prototype.newVivus = function(nameID, options, callback){
        if(typeof nameID != "string" || typeof options != "object" || typeof callback != "function") return false;

        var Vivus = require('vivus');
        if(!nameID) return false;

        var vivus = new Vivus(nameID, options, callback);
        return vivus;
    };

    return Constructor;
};
}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components\\vivusComponents.js","/components")
},{"Xp6JUx":4,"buffer":2,"vivus":5}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
(function ($) {

  require('./components/imaxPlayer.js')($);

  var EntitiesManager = require('./components/entitiesManager.js')($);
  var SelectBox = require('./components/selectBox.js')($);
  var ClassToggler = require('./components/classToggler.js')($);
  var SearchMobile = require('./components/searchMobile.js')($);
  var SearchDesktop = require('./components/searchDesktop.js')($);
  var ResizeEmitter = require('./components/resizeEmitter.js')($);
  var Switcher = require('./components/switcher.js')($);

  // Entities manager.
  var entitiesManager = new EntitiesManager({
    items: {
      synopsis: [],
      shareButtons: [],
      newsCollapsing: []
    }
  });

  var bodyScrollClassToggler = new ClassToggler({
    element: 'body',
    classToToggle: 'no-scrollable-item',
    instantInit: false
  });

  function Application() {
    bodyScrollClassToggler.init();

    new Switcher({
      selector: '#menu-toggle',
      closest: 'div',
      target: '#menu-aside, #block-system-main-menu > .menu h2, #block-system-main-menu > .menu ul.dropdown-menu',
      targetDependence: '#search-toggle, #navbar .search-wrapper',
      targetDependenceClosest: 'div',
      openCallback: function () {
        if ($('.search-overlay').length) {
          bodyScrollClassToggler.toggleOut();
        }
      }
    });
    new Switcher({
      selector: '#search-toggle',
      closest: 'div',
      target: '#navbar .search-wrapper',
      targetDependence: '#menu-toggle, #menu-aside',
      targetDependenceClosest: 'div',
      openCallback: function () {
        if ($('.search-overlay').length) {
          bodyScrollClassToggler.toggleIn();
        }
        $('.search-wrapper').find('input').focus();
      },
      closeCallback: function () {
        if ($('.search-overlay').length) {
          bodyScrollClassToggler.toggleOut();
        }
        $('.search-wrapper').find('input').blur();
      }
    });

    new Switcher({
      selector: '#block-locale-language .block-title',
      target: '#block-locale-language .language-switcher-locale-url',
      targetDependence: '#block-system-main-menu > .menu h2, #block-system-main-menu > .menu ul.dropdown-menu'
    });

    new Switcher({
      selector: '#block-system-main-menu > .menu h2',
      target: '#block-system-main-menu > .menu ul.dropdown-menu',
      targetDependence: '#block-locale-language .block-title, #block-locale-language .language-switcher-locale-url'
    });

    var VivusComponents = require('./components/vivusComponents.js')($);
    this.Vivus = new VivusComponents();

    var Subscribe = require('./components/subscribe.js')($);
    this.footerSubscribe = new Subscribe('[id *= "imax-subscribe-form"].footer-form');
    this.sidebarSubscribe = new Subscribe('[id *= "imax-subscribe-form"].sidebar-form');

    // Toggle class when footer is visible
    function FooterVisibilityToggler() {
      var toggler = new ClassToggler({
        element: 'body',
        classToToggle: 'footer-visible'
      });
      var $globalContext = $(window);
      var $content = $('.main-container');
      var spacing = parseInt($content.css('padding-bottom'));
      $globalContext
        .on('scroll', refresh)
        .on('resize', refresh);

      function refresh() {
        var viewportHeight = $globalContext.height();
        var contentHeight = $content.outerHeight();
        var currTopCoord = $globalContext.scrollTop();
        if (currTopCoord > contentHeight - viewportHeight + spacing * 2) {
          toggler.toggleIn();
        } else {
          toggler.toggleOut();
        }
      }
    }

    new FooterVisibilityToggler();
    var onloadToggle = new ClassToggler({
      element: 'body',
      classToToggle: 'domready'
    });
    onloadToggle.toggleIn();

    //$('#block-system-main [data-video-youtube-id]').imaxPlayer(); // for press
    $('[id^=block-views-related-news-block] [data-video-youtube-id], #block-system-main [data-video-youtube-id]').imaxPlayer({
      onStopCallback: onChangeStateImaxPlayer,
      onPlayCallback: onChangeStateImaxPlayer
    });

    function onChangeStateImaxPlayer($item, isPlay) {
      var parent = $item.closest('.views-row');
      if  (isPlay) {
        parent.addClass('open');
      } else {
        parent.removeClass('open');
      }
    }
    new ResizeEmitter();
  }

  $(document).ready(function () {
    window.init = new Application();
  });

  Drupal.behaviors.shareButtons = {
    attach: function (/*context, settings*/) {
      entitiesManager.clearList('shareButtons');
      var shareButtons = $('.share-buttons');
      shareButtons.each(function (i, el) {
        var shareObj = new ClassToggler({
          element: $(el),
          caller: $(el).find('.share-icon'),
          classToToggle: 'open'
        });
        entitiesManager.addToList('shareButtons', shareObj);
      });

      window.Share = {
        vkontakte: function (purl, ptitle, pimg, text) {
          var url = 'http://vkontakte.ru/share.php?';
          url = url + 'url=' + encodeURIComponent(purl);
          url = url + '&title=' + encodeURIComponent(ptitle);
          url = url + '&description=' + encodeURIComponent(text);
          url = url + '&image=' + encodeURIComponent(pimg);
          url = url + '&noparse=true';
          this.popup(url);
        },
        odnoklassniki: function (purl, text) {
          var url = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
          url = url + '&st.comments=' + encodeURIComponent(text);
          url = url + '&st._surl=' + encodeURIComponent(purl);
          this.popup(url);
        },
        facebook: function (purl, ptitle, pimg, text) {
          var url = 'http://www.facebook.com/sharer.php?s=100';
          url = url + '&p[title]=' + encodeURIComponent(ptitle);
          url = url + '&p[summary]=' + encodeURIComponent(text);
          url = url + '&p[url]=' + encodeURIComponent(purl);
          url = url + '&p[images][0]=' + encodeURIComponent(pimg);
          this.popup(url);
        },
        twitter: function (purl, ptitle) {
          var url = 'http://twitter.com/share?';
          url = url + 'text=' + encodeURIComponent(ptitle);
          url = url + '&url=' + encodeURIComponent(purl);
          url = url + '&counturl=' + encodeURIComponent(purl);
          this.popup(url);
        },
        mailru: function (purl, ptitle, pimg, text) {
          var url = 'http://connect.mail.ru/share?';
          url = url + 'url=' + encodeURIComponent(purl);
          url = url + '&title=' + encodeURIComponent(ptitle);
          url = url + '&description=' + encodeURIComponent(text);
          url = url + '&imageurl=' + encodeURIComponent(pimg);
          this.popup(url);
        },
        popup: function (url) {
          window.open(url, '', 'toolbar=0,status=0,width=626,height=436');
        }
      };
    }
  };

  // var searchMobile = new SearchMobile();
  Drupal.behaviors.searchBehavior = {
    attach: function (/*context, settings*/) {
      $('.view-search').once(function () {

        var $overlay = $('.search-overlay');
        if ($overlay.length) {
          bodyScrollClassToggler.toggleIn();
        }

        if ($overlay.hasClass('mobile-search')) {
          // Mobile logic
          new SearchMobile();
        } else if ($overlay.hasClass('desktop-search')) {
          // Desktop logic.
          new SearchDesktop();
        }
      });
    }
  };

  Drupal.behaviors.selectBehavior = {
    attach: function (/*context, settings*/) {
      // Related news year selectbox.
      new SelectBox('.view-related-news select', {
        optionTextPreprocess: function(optText) {
          return optText.replace(/^-/,'');
        }
      });
      new SelectBox('.view-related-movies select', {
        optionTextPreprocess: function(optText) {
          return optText.replace(/^-/,'');
        }
      });
    }
  };

  Drupal.behaviors.latestNews = {
    attach: function (/*context, settings*/) {
      // Synopsis.
      entitiesManager.clearList('newsCollapsing');

      $('.view-related-news .views-row').each(function (i, el) {
        var $newsItem = $(el);

        // collapse toggle
        var $toggler = $newsItem.find('.collapse-toggler');
        var $toggledContent = $newsItem.find('.collapsed-content');
        // Hard replacement toggle-close arrow.
        $newsItem.find('.toggle-close').appendTo($toggledContent.find('p').last());

        if ($toggler.length !== 0 && $toggledContent !== 0) {
          var newsObj = new ClassToggler({
            element: $newsItem,
            caller: $toggler,
            classToToggle: 'open',
            callbacks: {
              add: function () {
                $toggledContent.slideDown();
              },
              remove: function () {
                $toggledContent.slideUp();
              }
            }
          });
          entitiesManager.addToList('newsCollapsing', newsObj);
        }
      });

      this.updateApp();
      this.updateYTPlayer();

    },
    updateApp: function() {

    },
    updateYTPlayer: function() {

    }
  };

  Drupal.behaviors.synopsis = {
    attach: function (/*context, settings*/) {
      // Synopsis.
      entitiesManager.clearList('synopsis');
      $('.component-synopsis').each(function (i, el) {
        var $synopsis = $(el);
        var $synopsisHeader = $synopsis.find('.title-wrapper');
        var $synopsisBody = $synopsis.find('article');
        var synopsisObj = new ClassToggler({
          element: $synopsis,
          caller: [$synopsisHeader, $synopsisBody],
          classToToggle: 'open',
          callbacks: {
            add: function () {
              $synopsisBody.slideDown();
            },
            remove: function () {
              $synopsisBody.slideUp();
            }
          }
        });
        entitiesManager.addToList('synopsis', synopsisObj);
      });
    }
  };

})(jQuery);

}).call(this,require("Xp6JUx"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_7ee2ec16.js","/")
},{"./components/classToggler.js":6,"./components/entitiesManager.js":7,"./components/imaxPlayer.js":8,"./components/resizeEmitter.js":9,"./components/searchDesktop.js":10,"./components/searchMobile.js":11,"./components/selectBox.js":12,"./components/subscribe.js":13,"./components/switcher.js":14,"./components/vivusComponents.js":15,"Xp6JUx":4,"buffer":2}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFx4YW1wcFxcaHRkb2NzXFxpbWF4XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCJDOi94YW1wcC9odGRvY3MvaW1heC9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJDOi94YW1wcC9odGRvY3MvaW1heC9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiQzoveGFtcHAvaHRkb2NzL2ltYXgvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJDOi94YW1wcC9odGRvY3MvaW1heC9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiQzoveGFtcHAvaHRkb2NzL2ltYXgvbm9kZV9tb2R1bGVzL3ZpdnVzL2Rpc3Qvdml2dXMuanMiLCJDOi94YW1wcC9odGRvY3MvaW1heC9zaXRlcy9hbGwvdGhlbWVzL2ltYXgvanMvYXBwL2NvbXBvbmVudHMvY2xhc3NUb2dnbGVyLmpzIiwiQzoveGFtcHAvaHRkb2NzL2ltYXgvc2l0ZXMvYWxsL3RoZW1lcy9pbWF4L2pzL2FwcC9jb21wb25lbnRzL2VudGl0aWVzTWFuYWdlci5qcyIsIkM6L3hhbXBwL2h0ZG9jcy9pbWF4L3NpdGVzL2FsbC90aGVtZXMvaW1heC9qcy9hcHAvY29tcG9uZW50cy9pbWF4UGxheWVyLmpzIiwiQzoveGFtcHAvaHRkb2NzL2ltYXgvc2l0ZXMvYWxsL3RoZW1lcy9pbWF4L2pzL2FwcC9jb21wb25lbnRzL3Jlc2l6ZUVtaXR0ZXIuanMiLCJDOi94YW1wcC9odGRvY3MvaW1heC9zaXRlcy9hbGwvdGhlbWVzL2ltYXgvanMvYXBwL2NvbXBvbmVudHMvc2VhcmNoRGVza3RvcC5qcyIsIkM6L3hhbXBwL2h0ZG9jcy9pbWF4L3NpdGVzL2FsbC90aGVtZXMvaW1heC9qcy9hcHAvY29tcG9uZW50cy9zZWFyY2hNb2JpbGUuanMiLCJDOi94YW1wcC9odGRvY3MvaW1heC9zaXRlcy9hbGwvdGhlbWVzL2ltYXgvanMvYXBwL2NvbXBvbmVudHMvc2VsZWN0Qm94LmpzIiwiQzoveGFtcHAvaHRkb2NzL2ltYXgvc2l0ZXMvYWxsL3RoZW1lcy9pbWF4L2pzL2FwcC9jb21wb25lbnRzL3N1YnNjcmliZS5qcyIsIkM6L3hhbXBwL2h0ZG9jcy9pbWF4L3NpdGVzL2FsbC90aGVtZXMvaW1heC9qcy9hcHAvY29tcG9uZW50cy9zd2l0Y2hlci5qcyIsIkM6L3hhbXBwL2h0ZG9jcy9pbWF4L3NpdGVzL2FsbC90aGVtZXMvaW1heC9qcy9hcHAvY29tcG9uZW50cy92aXZ1c0NvbXBvbmVudHMuanMiLCJDOi94YW1wcC9odGRvY3MvaW1heC9zaXRlcy9hbGwvdGhlbWVzL2ltYXgvanMvYXBwL2Zha2VfN2VlMmVjMTYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbC9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcXFxcYjY0LmpzXCIsXCIvLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIlhwNkpVeFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIlhwNkpVeFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXFxcXGJyb3dzZXIuanNcIixcIi8uLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxccHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICogdml2dXMgLSBKYXZhU2NyaXB0IGxpYnJhcnkgdG8gbWFrZSBkcmF3aW5nIGFuaW1hdGlvbiBvbiBTVkdcbiAqIEB2ZXJzaW9uIHYwLjIuM1xuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL21heHdlbGxpdG8vdml2dXNcbiAqIEBsaWNlbnNlIE1JVFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50KSB7XG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFBhdGhmb3JtZXJcbiAqIEJldGEgdmVyc2lvblxuICpcbiAqIFRha2UgYW55IFNWRyB2ZXJzaW9uIDEuMSBhbmQgdHJhbnNmb3JtXG4gKiBjaGlsZCBlbGVtZW50cyB0byAncGF0aCcgZWxlbWVudHNcbiAqXG4gKiBUaGlzIGNvZGUgaXMgcHVyZWx5IGZvcmtlZCBmcm9tXG4gKiBodHRwczovL2dpdGh1Yi5jb20vV2Flc3QvU1ZHUGF0aENvbnZlcnRlclxuICovXG5cbi8qKlxuICogQ2xhc3MgY29uc3RydWN0b3JcbiAqXG4gKiBAcGFyYW0ge0RPTXxTdHJpbmd9IGVsZW1lbnQgRG9tIGVsZW1lbnQgb2YgdGhlIFNWRyBvciBpZCBvZiBpdFxuICovXG5mdW5jdGlvbiBQYXRoZm9ybWVyKGVsZW1lbnQpIHtcbiAgLy8gVGVzdCBwYXJhbXNcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBFcnJvcignUGF0aGZvcm1lciBbY29uc3RydWN0b3JdOiBcImVsZW1lbnRcIiBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgZWxlbWVudFxuICBpZiAoZWxlbWVudC5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKSB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnQpO1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXRoZm9ybWVyIFtjb25zdHJ1Y3Rvcl06IFwiZWxlbWVudFwiIHBhcmFtZXRlciBpcyBub3QgcmVsYXRlZCB0byBhbiBleGlzdGluZyBJRCcpO1xuICAgIH1cbiAgfVxuICBpZiAoZWxlbWVudC5jb25zdHJ1Y3RvciBpbnN0YW5jZW9mIHdpbmRvdy5TVkdFbGVtZW50IHx8IC9ec3ZnJC9pLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkpIHtcbiAgICB0aGlzLmVsID0gZWxlbWVudDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGhmb3JtZXIgW2NvbnN0cnVjdG9yXTogXCJlbGVtZW50XCIgcGFyYW1ldGVyIG11c3QgYmUgYSBzdHJpbmcgb3IgYSBTVkdlbGVtZW50Jyk7XG4gIH1cblxuICAvLyBTdGFydFxuICB0aGlzLnNjYW4oZWxlbWVudCk7XG59XG5cbi8qKlxuICogTGlzdCBvZiB0YWdzIHdoaWNoIGNhbiBiZSB0cmFuc2Zvcm1lZFxuICogdG8gcGF0aCBlbGVtZW50c1xuICpcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuUGF0aGZvcm1lci5wcm90b3R5cGUuVFlQRVMgPSBbJ2xpbmUnLCAnZWxsaXBzZScsICdjaXJjbGUnLCAncG9seWdvbicsICdwb2x5bGluZScsICdyZWN0J107XG5cbi8qKlxuICogTGlzdCBvZiBhdHRyaWJ1dGUgbmFtZXMgd2hpY2ggY29udGFpblxuICogZGF0YS4gVGhpcyBhcnJheSBsaXN0IHRoZW0gdG8gY2hlY2sgaWZcbiAqIHRoZXkgY29udGFpbiBiYWQgdmFsdWVzLCBsaWtlIHBlcmNlbnRhZ2UuIFxuICpcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuUGF0aGZvcm1lci5wcm90b3R5cGUuQVRUUl9XQVRDSCA9IFsnY3gnLCAnY3knLCAncG9pbnRzJywgJ3InLCAncngnLCAncnknLCAneCcsICd4MScsICd4MicsICd5JywgJ3kxJywgJ3kyJ107XG5cbi8qKlxuICogRmluZHMgdGhlIGVsZW1lbnRzIGNvbXBhdGlibGUgZm9yIHRyYW5zZm9ybVxuICogYW5kIGFwcGx5IHRoZSBsaWtlZCBtZXRob2RcbiAqXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IGZyb20gdGhlIGNvbnN0cnVjdG9yXG4gKi9cblBhdGhmb3JtZXIucHJvdG90eXBlLnNjYW4gPSBmdW5jdGlvbiAoc3ZnKSB7XG4gIHZhciBmbiwgZWxlbWVudCwgcGF0aERhdGEsIHBhdGhEb20sXG4gICAgZWxlbWVudHMgPSBzdmcucXVlcnlTZWxlY3RvckFsbCh0aGlzLlRZUEVTLmpvaW4oJywnKSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgZm4gPSB0aGlzW2VsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICsgJ1RvUGF0aCddO1xuICAgIHBhdGhEYXRhID0gZm4odGhpcy5wYXJzZUF0dHIoZWxlbWVudC5hdHRyaWJ1dGVzKSk7XG4gICAgcGF0aERvbSA9IHRoaXMucGF0aE1ha2VyKGVsZW1lbnQsIHBhdGhEYXRhKTtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHBhdGhEb20sIGVsZW1lbnQpO1xuICB9XG59O1xuXG5cbi8qKlxuICogUmVhZCBgbGluZWAgZWxlbWVudCB0byBleHRyYWN0IGFuZCB0cmFuc2Zvcm1cbiAqIGRhdGEsIHRvIG1ha2UgaXQgcmVhZHkgZm9yIGEgYHBhdGhgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gIHtET01lbGVtZW50fSBlbGVtZW50IExpbmUgZWxlbWVudCB0byB0cmFuc2Zvcm1cbiAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgICAgRGF0YSBmb3IgYSBgcGF0aGAgZWxlbWVudFxuICovXG5QYXRoZm9ybWVyLnByb3RvdHlwZS5saW5lVG9QYXRoID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdmFyIG5ld0VsZW1lbnQgPSB7fTtcbiAgbmV3RWxlbWVudC5kID0gJ00nICsgZWxlbWVudC54MSArICcsJyArIGVsZW1lbnQueTEgKyAnTCcgKyBlbGVtZW50LngyICsgJywnICsgZWxlbWVudC55MjtcbiAgcmV0dXJuIG5ld0VsZW1lbnQ7XG59O1xuXG4vKipcbiAqIFJlYWQgYHJlY3RgIGVsZW1lbnQgdG8gZXh0cmFjdCBhbmQgdHJhbnNmb3JtXG4gKiBkYXRhLCB0byBtYWtlIGl0IHJlYWR5IGZvciBhIGBwYXRoYCBvYmplY3QuXG4gKiBUaGUgcmFkaXVzLWJvcmRlciBpcyBub3QgdGFrZW4gaW4gY2hhcmdlIHlldC5cbiAqICh5b3VyIGhlbHAgaXMgbW9yZSB0aGFuIHdlbGNvbWVkKVxuICpcbiAqIEBwYXJhbSAge0RPTWVsZW1lbnR9IGVsZW1lbnQgUmVjdCBlbGVtZW50IHRvIHRyYW5zZm9ybVxuICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICAgICBEYXRhIGZvciBhIGBwYXRoYCBlbGVtZW50XG4gKi9cblBhdGhmb3JtZXIucHJvdG90eXBlLnJlY3RUb1BhdGggPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIgbmV3RWxlbWVudCA9IHt9LFxuICAgIHggPSBwYXJzZUZsb2F0KGVsZW1lbnQueCkgfHwgMCxcbiAgICB5ID0gcGFyc2VGbG9hdChlbGVtZW50LnkpIHx8IDAsXG4gICAgd2lkdGggPSBwYXJzZUZsb2F0KGVsZW1lbnQud2lkdGgpIHx8IDAsXG4gICAgaGVpZ2h0ID0gcGFyc2VGbG9hdChlbGVtZW50LmhlaWdodCkgfHwgMDtcbiAgbmV3RWxlbWVudC5kICA9ICdNJyArIHggKyAnICcgKyB5ICsgJyAnO1xuICBuZXdFbGVtZW50LmQgKz0gJ0wnICsgKHggKyB3aWR0aCkgKyAnICcgKyB5ICsgJyAnO1xuICBuZXdFbGVtZW50LmQgKz0gJ0wnICsgKHggKyB3aWR0aCkgKyAnICcgKyAoeSArIGhlaWdodCkgKyAnICc7XG4gIG5ld0VsZW1lbnQuZCArPSAnTCcgKyB4ICsgJyAnICsgKHkgKyBoZWlnaHQpICsgJyBaJztcbiAgcmV0dXJuIG5ld0VsZW1lbnQ7XG59O1xuXG4vKipcbiAqIFJlYWQgYHBvbHlsaW5lYCBlbGVtZW50IHRvIGV4dHJhY3QgYW5kIHRyYW5zZm9ybVxuICogZGF0YSwgdG8gbWFrZSBpdCByZWFkeSBmb3IgYSBgcGF0aGAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSAge0RPTWVsZW1lbnR9IGVsZW1lbnQgUG9seWxpbmUgZWxlbWVudCB0byB0cmFuc2Zvcm1cbiAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgICAgRGF0YSBmb3IgYSBgcGF0aGAgZWxlbWVudFxuICovXG5QYXRoZm9ybWVyLnByb3RvdHlwZS5wb2x5bGluZVRvUGF0aCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBpLCBwYXRoO1xuICB2YXIgbmV3RWxlbWVudCA9IHt9O1xuICB2YXIgcG9pbnRzID0gZWxlbWVudC5wb2ludHMudHJpbSgpLnNwbGl0KCcgJyk7XG4gIFxuICAvLyBSZWZvcm1hdHRpbmcgaWYgcG9pbnRzIGFyZSBkZWZpbmVkIHdpdGhvdXQgY29tbWFzXG4gIGlmIChlbGVtZW50LnBvaW50cy5pbmRleE9mKCcsJykgPT09IC0xKSB7XG4gICAgdmFyIGZvcm1hdHRlZFBvaW50cyA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKz0yKSB7XG4gICAgICBmb3JtYXR0ZWRQb2ludHMucHVzaChwb2ludHNbaV0gKyAnLCcgKyBwb2ludHNbaSsxXSk7XG4gICAgfVxuICAgIHBvaW50cyA9IGZvcm1hdHRlZFBvaW50cztcbiAgfVxuXG4gIC8vIEdlbmVyYXRlIHRoZSBwYXRoLmQgdmFsdWVcbiAgcGF0aCA9ICdNJyArIHBvaW50c1swXTtcbiAgZm9yKGkgPSAxOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHBvaW50c1tpXS5pbmRleE9mKCcsJykgIT09IC0xKSB7XG4gICAgICBwYXRoICs9ICdMJyArIHBvaW50c1tpXTtcbiAgICB9XG4gIH1cbiAgbmV3RWxlbWVudC5kID0gcGF0aDtcbiAgcmV0dXJuIG5ld0VsZW1lbnQ7XG59O1xuXG4vKipcbiAqIFJlYWQgYHBvbHlnb25gIGVsZW1lbnQgdG8gZXh0cmFjdCBhbmQgdHJhbnNmb3JtXG4gKiBkYXRhLCB0byBtYWtlIGl0IHJlYWR5IGZvciBhIGBwYXRoYCBvYmplY3QuXG4gKiBUaGlzIG1ldGhvZCByZWx5IG9uIHBvbHlsaW5lVG9QYXRoLCBiZWNhdXNlIHRoZVxuICogbG9naWMgaXMgc2ltaWxhci4gVGhlIHBhdGggY3JlYXRlZCBpcyBqdXN0IGNsb3NlZCxcbiAqIHNvIGl0IG5lZWRzIGFuICdaJyBhdCB0aGUgZW5kLlxuICpcbiAqIEBwYXJhbSAge0RPTWVsZW1lbnR9IGVsZW1lbnQgUG9seWdvbiBlbGVtZW50IHRvIHRyYW5zZm9ybVxuICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICAgICBEYXRhIGZvciBhIGBwYXRoYCBlbGVtZW50XG4gKi9cblBhdGhmb3JtZXIucHJvdG90eXBlLnBvbHlnb25Ub1BhdGggPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIgbmV3RWxlbWVudCA9IFBhdGhmb3JtZXIucHJvdG90eXBlLnBvbHlsaW5lVG9QYXRoKGVsZW1lbnQpO1xuICBuZXdFbGVtZW50LmQgKz0gJ1onO1xuICByZXR1cm4gbmV3RWxlbWVudDtcbn07XG5cbi8qKlxuICogUmVhZCBgZWxsaXBzZWAgZWxlbWVudCB0byBleHRyYWN0IGFuZCB0cmFuc2Zvcm1cbiAqIGRhdGEsIHRvIG1ha2UgaXQgcmVhZHkgZm9yIGEgYHBhdGhgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gIHtET01lbGVtZW50fSBlbGVtZW50IGVsbGlwc2UgZWxlbWVudCB0byB0cmFuc2Zvcm1cbiAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgICAgRGF0YSBmb3IgYSBgcGF0aGAgZWxlbWVudFxuICovXG5QYXRoZm9ybWVyLnByb3RvdHlwZS5lbGxpcHNlVG9QYXRoID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdmFyIHN0YXJ0WCA9IGVsZW1lbnQuY3ggLSBlbGVtZW50LnJ4LFxuICAgICAgc3RhcnRZID0gZWxlbWVudC5jeTtcbiAgdmFyIGVuZFggPSBwYXJzZUZsb2F0KGVsZW1lbnQuY3gpICsgcGFyc2VGbG9hdChlbGVtZW50LnJ4KSxcbiAgICAgIGVuZFkgPSBlbGVtZW50LmN5O1xuXG4gIHZhciBuZXdFbGVtZW50ID0ge307XG4gIG5ld0VsZW1lbnQuZCA9ICdNJyArIHN0YXJ0WCArICcsJyArIHN0YXJ0WSArXG4gICAgICAgICAgICAgICAgICdBJyArIGVsZW1lbnQucnggKyAnLCcgKyBlbGVtZW50LnJ5ICsgJyAwLDEsMSAnICsgZW5kWCArICcsJyArIGVuZFkgK1xuICAgICAgICAgICAgICAgICAnQScgKyBlbGVtZW50LnJ4ICsgJywnICsgZWxlbWVudC5yeSArICcgMCwxLDEgJyArIHN0YXJ0WCArICcsJyArIGVuZFk7XG4gIHJldHVybiBuZXdFbGVtZW50O1xufTtcblxuLyoqXG4gKiBSZWFkIGBjaXJjbGVgIGVsZW1lbnQgdG8gZXh0cmFjdCBhbmQgdHJhbnNmb3JtXG4gKiBkYXRhLCB0byBtYWtlIGl0IHJlYWR5IGZvciBhIGBwYXRoYCBvYmplY3QuXG4gKlxuICogQHBhcmFtICB7RE9NZWxlbWVudH0gZWxlbWVudCBDaXJjbGUgZWxlbWVudCB0byB0cmFuc2Zvcm1cbiAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgICAgRGF0YSBmb3IgYSBgcGF0aGAgZWxlbWVudFxuICovXG5QYXRoZm9ybWVyLnByb3RvdHlwZS5jaXJjbGVUb1BhdGggPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIgbmV3RWxlbWVudCA9IHt9O1xuICB2YXIgc3RhcnRYID0gZWxlbWVudC5jeCAtIGVsZW1lbnQucixcbiAgICAgIHN0YXJ0WSA9IGVsZW1lbnQuY3k7XG4gIHZhciBlbmRYID0gcGFyc2VGbG9hdChlbGVtZW50LmN4KSArIHBhcnNlRmxvYXQoZWxlbWVudC5yKSxcbiAgICAgIGVuZFkgPSBlbGVtZW50LmN5O1xuICBuZXdFbGVtZW50LmQgPSAgJ00nICsgc3RhcnRYICsgJywnICsgc3RhcnRZICtcbiAgICAgICAgICAgICAgICAgICdBJyArIGVsZW1lbnQuciArICcsJyArIGVsZW1lbnQuciArICcgMCwxLDEgJyArIGVuZFggKyAnLCcgKyBlbmRZICtcbiAgICAgICAgICAgICAgICAgICdBJyArIGVsZW1lbnQuciArICcsJyArIGVsZW1lbnQuciArICcgMCwxLDEgJyArIHN0YXJ0WCArICcsJyArIGVuZFk7XG4gIHJldHVybiBuZXdFbGVtZW50O1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYHBhdGhgIGVsZW1lbnRzIGZvcm0gb3JpZ2luYWwgZWxlbWVudFxuICogYW5kIHByZXBhcmVkIG9iamVjdHNcbiAqXG4gKiBAcGFyYW0gIHtET01lbGVtZW50fSBlbGVtZW50ICBPcmlnaW5hbCBlbGVtZW50IHRvIHRyYW5zZm9ybVxuICogQHBhcmFtICB7b2JqZWN0fSBwYXRoRGF0YSAgICAgUGF0aCBkYXRhIChmcm9tIGB0b1BhdGhgIG1ldGhvZHMpXG4gKiBAcmV0dXJuIHtET01lbGVtZW50fSAgICAgICAgICBQYXRoIGVsZW1lbnRcbiAqL1xuUGF0aGZvcm1lci5wcm90b3R5cGUucGF0aE1ha2VyID0gZnVuY3Rpb24gKGVsZW1lbnQsIHBhdGhEYXRhKSB7XG4gIHZhciBpLCBhdHRyLCBwYXRoVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3BhdGgnKTtcbiAgZm9yKGkgPSAwOyBpIDwgZWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXR0ciA9IGVsZW1lbnQuYXR0cmlidXRlc1tpXTtcbiAgICBpZiAodGhpcy5BVFRSX1dBVENILmluZGV4T2YoYXR0ci5uYW1lKSA9PT0gLTEpIHtcbiAgICAgIHBhdGhUYWcuc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSk7XG4gICAgfVxuICB9XG4gIGZvcihpIGluIHBhdGhEYXRhKSB7XG4gICAgcGF0aFRhZy5zZXRBdHRyaWJ1dGUoaSwgcGF0aERhdGFbaV0pO1xuICB9XG4gIHJldHVybiBwYXRoVGFnO1xufTtcblxuLyoqXG4gKiBQYXJzZSBhdHRyaWJ1dGVzIG9mIGEgRE9NIGVsZW1lbnQgdG9cbiAqIGdldCBhbiBvYmplY3Qgb2YgYXR0cmlidXRlID0+IHZhbHVlXG4gKlxuICogQHBhcmFtICB7TmFtZWROb2RlTWFwfSBhdHRyaWJ1dGVzIEF0dHJpYnV0ZXMgb2JqZWN0IGZyb20gRE9NIGVsZW1lbnQgdG8gcGFyc2VcbiAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICAgICAgICAgICBPYmplY3Qgb2YgYXR0cmlidXRlc1xuICovXG5QYXRoZm9ybWVyLnByb3RvdHlwZS5wYXJzZUF0dHIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIgYXR0ciwgb3V0cHV0ID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudC5sZW5ndGg7IGkrKykge1xuICAgIGF0dHIgPSBlbGVtZW50W2ldO1xuICAgIC8vIENoZWNrIGlmIG5vIGRhdGEgYXR0cmlidXRlIGNvbnRhaW5zICclJywgb3IgdGhlIHRyYW5zZm9ybWF0aW9uIGlzIGltcG9zc2libGVcbiAgICBpZiAodGhpcy5BVFRSX1dBVENILmluZGV4T2YoYXR0ci5uYW1lKSAhPT0gLTEgJiYgYXR0ci52YWx1ZS5pbmRleE9mKCclJykgIT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhdGhmb3JtZXIgW3BhcnNlQXR0cl06IGEgU1ZHIHNoYXBlIGdvdCB2YWx1ZXMgaW4gcGVyY2VudGFnZS4gVGhpcyBjYW5ub3QgYmUgdHJhbnNmb3JtZWQgaW50byBcXCdwYXRoXFwnIHRhZ3MuIFBsZWFzZSB1c2UgXFwndmlld0JveFxcJy4nKTtcbiAgICB9XG4gICAgb3V0cHV0W2F0dHIubmFtZV0gPSBhdHRyLnZhbHVlO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4gICd1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVlc3RBbmltRnJhbWUsIGNhbmNlbEFuaW1GcmFtZSwgcGFyc2VQb3NpdGl2ZUludDtcblxuLyoqXG4gKiBWaXZ1c1xuICogQmV0YSB2ZXJzaW9uXG4gKlxuICogVGFrZSBhbnkgU1ZHIGFuZCBtYWtlIHRoZSBhbmltYXRpb25cbiAqIHRvIGdpdmUgZ2l2ZSB0aGUgaW1wcmVzc2lvbiBvZiBsaXZlIGRyYXdpbmdcbiAqXG4gKiBUaGlzIGluIG1vcmUgdGhhbiBqdXN0IGluc3BpcmVkIGZyb20gY29kcm9wc1xuICogQXQgdGhhdCBwb2ludCwgaXQncyBhIHB1cmUgZm9yay5cbiAqL1xuXG4vKipcbiAqIENsYXNzIGNvbnN0cnVjdG9yXG4gKiBvcHRpb24gc3RydWN0dXJlXG4gKiAgIHR5cGU6ICdkZWxheWVkJ3wnYXN5bmMnfCdvbmVCeU9uZSd8J3NjcmlwdCcgKHRvIGtub3cgaWYgdGhlIGl0ZW0gbXVzdCBiZSBkcmF3biBhc3luY2hyb25vdXNseSBvciBub3QsIGRlZmF1bHQ6IGRlbGF5ZWQpXG4gKiAgIGR1cmF0aW9uOiA8aW50PiAoaW4gZnJhbWVzKVxuICogICBzdGFydDogJ2luVmlld3BvcnQnfCdtYW51YWwnfCdhdXRvc3RhcnQnIChzdGFydCBhdXRvbWF0aWNhbGx5IHRoZSBhbmltYXRpb24sIGRlZmF1bHQ6IGluVmlld3BvcnQpXG4gKiAgIGRlbGF5OiA8aW50PiAoZGVsYXkgYmV0d2VlbiB0aGUgZHJhd2luZyBvZiBmaXJzdCBhbmQgbGFzdCBwYXRoKVxuICogICBkYXNoR2FwIDxpbnRlZ2VyPiB3aGl0ZXNwYWNlIGV4dHJhIG1hcmdpbiBiZXR3ZWVuIGRhc2hlc1xuICogICBwYXRoVGltaW5nRnVuY3Rpb24gPGZ1bmN0aW9uPiB0aW1pbmcgYW5pbWF0aW9uIGZ1bmN0aW9uIGZvciBlYWNoIHBhdGggZWxlbWVudCBvZiB0aGUgU1ZHXG4gKiAgIGFuaW1UaW1pbmdGdW5jdGlvbiA8ZnVuY3Rpb24+IHRpbWluZyBhbmltYXRpb24gZnVuY3Rpb24gZm9yIHRoZSBjb21wbGV0ZSBTVkdcbiAqICAgZm9yY2VSZW5kZXIgPGJvb2xlYW4+IGZvcmNlIHRoZSBicm93c2VyIHRvIHJlLXJlbmRlciBhbGwgdXBkYXRlZCBwYXRoIGl0ZW1zXG4gKiAgIHNlbGZEZXN0cm95IDxib29sZWFuPiByZW1vdmVzIGFsbCBleHRyYSBzdHlsaW5nIG9uIHRoZSBTVkcsIGFuZCBsZWF2ZXMgaXQgYXMgb3JpZ2luYWxcbiAqXG4gKiBUaGUgYXR0cmlidXRlICd0eXBlJyBpcyBieSBkZWZhdWx0IG9uICdkZWxheWVkJy5cbiAqICAtICdkZWxheWVkJ1xuICogICAgYWxsIHBhdGhzIGFyZSBkcmF3IGF0IHRoZSBzYW1lIHRpbWUgYnV0IHdpdGggYVxuICogICAgbGl0dGxlIGRlbGF5IGJldHdlZW4gdGhlbSBiZWZvcmUgc3RhcnRcbiAqICAtICdhc3luYydcbiAqICAgIGFsbCBwYXRoIGFyZSBzdGFydCBhbmQgZmluaXNoIGF0IHRoZSBzYW1lIHRpbWVcbiAqICAtICdvbmVCeU9uZSdcbiAqICAgIG9ubHkgb25lIHBhdGggaXMgZHJhdyBhdCB0aGUgdGltZVxuICogICAgdGhlIGVuZCBvZiB0aGUgZmlyc3Qgb25lIHdpbGwgdHJpZ2dlciB0aGUgZHJhd1xuICogICAgb2YgdGhlIG5leHQgb25lXG4gKlxuICogQWxsIHRoZXNlIHZhbHVlcyBjYW4gYmUgb3ZlcndyaXR0ZW4gaW5kaXZpZHVhbGx5XG4gKiBmb3IgZWFjaCBwYXRoIGl0ZW0gaW4gdGhlIFNWR1xuICogVGhlIHZhbHVlIG9mIGZyYW1lcyB3aWxsIGFsd2F5cyB0YWtlIHRoZSBhZHZhbnRhZ2Ugb2ZcbiAqIHRoZSBkdXJhdGlvbiB2YWx1ZS5cbiAqIElmIHlvdSBmYWlsIHNvbWV3aGVyZSwgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKiBHb29kIGx1Y2suXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAdGhpcyB7Vml2dXN9XG4gKiBAcGFyYW0ge0RPTXxTdHJpbmd9ICAgZWxlbWVudCAgRG9tIGVsZW1lbnQgb2YgdGhlIFNWRyBvciBpZCBvZiBpdFxuICogQHBhcmFtIHtPYmplY3R9ICAgICAgIG9wdGlvbnMgIE9wdGlvbnMgYWJvdXQgdGhlIGFuaW1hdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gICAgIGNhbGxiYWNrIENhbGxiYWNrIGZvciB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb25cbiAqL1xuZnVuY3Rpb24gVml2dXMgKGVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cbiAgLy8gU2V0dXBcbiAgdGhpcy5pc1JlYWR5ID0gZmFsc2U7XG4gIHRoaXMuc2V0RWxlbWVudChlbGVtZW50LCBvcHRpb25zKTtcbiAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICB0aGlzLnNldENhbGxiYWNrKGNhbGxiYWNrKTtcblxuICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaW1pbmcgZnVuY3Rpb25zXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gKiBcbiAqIERlZmF1bHQgZnVuY3Rpb25zIHRvIGhlbHAgZGV2ZWxvcGVycy5cbiAqIEl0IGFsd2F5cyB0YWtlIGEgbnVtYmVyIGFzIHBhcmFtZXRlciAoYmV0d2VlbiAwIHRvIDEpIHRoZW5cbiAqIHJldHVybiBhIG51bWJlciAoYmV0d2VlbiAwIGFuZCAxKVxuICovXG5WaXZ1cy5MSU5FQVIgICAgICAgICAgPSBmdW5jdGlvbiAoeCkge3JldHVybiB4O307XG5WaXZ1cy5FQVNFICAgICAgICAgICAgPSBmdW5jdGlvbiAoeCkge3JldHVybiAtTWF0aC5jb3MoeCAqIE1hdGguUEkpIC8gMiArIDAuNTt9O1xuVml2dXMuRUFTRV9PVVQgICAgICAgID0gZnVuY3Rpb24gKHgpIHtyZXR1cm4gMSAtIE1hdGgucG93KDEteCwgMyk7fTtcblZpdnVzLkVBU0VfSU4gICAgICAgICA9IGZ1bmN0aW9uICh4KSB7cmV0dXJuIE1hdGgucG93KHgsIDMpO307XG5WaXZ1cy5FQVNFX09VVF9CT1VOQ0UgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYmFzZSA9IC1NYXRoLmNvcyh4ICogKDAuNSAqIE1hdGguUEkpKSArIDEsXG4gICAgcmF0ZSA9IE1hdGgucG93KGJhc2UsMS41KSxcbiAgICByYXRlUiA9IE1hdGgucG93KDEgLSB4LCAyKSxcbiAgICBwcm9ncmVzcyA9IC1NYXRoLmFicyhNYXRoLmNvcyhyYXRlICogKDIuNSAqIE1hdGguUEkpICkpICsgMTtcbiAgcmV0dXJuICgxLSByYXRlUikgKyAocHJvZ3Jlc3MgKiByYXRlUik7XG59O1xuXG5cbi8qKlxuICogU2V0dGVyc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKi9cblxuLyoqXG4gKiBDaGVjayBhbmQgc2V0IHRoZSBlbGVtZW50IGluIHRoZSBpbnN0YW5jZVxuICogVGhlIG1ldGhvZCB3aWxsIG5vdCByZXR1cm4gYW55dGhpbmcsIGJ1dCB3aWxsIHRocm93IGFuXG4gKiBlcnJvciBpZiB0aGUgcGFyYW1ldGVyIGlzIGludmFsaWRcbiAqXG4gKiBAcGFyYW0ge0RPTXxTdHJpbmd9ICAgZWxlbWVudCAgU1ZHIERvbSBlbGVtZW50IG9yIGlkIG9mIGl0XG4gKi9cblZpdnVzLnByb3RvdHlwZS5zZXRFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgLy8gQmFzaWMgY2hlY2tcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93IG5ldyBFcnJvcignVml2dXMgW2NvbnN0cnVjdG9yXTogXCJlbGVtZW50XCIgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICAvLyBTZXQgdGhlIGVsZW1lbnRcbiAgaWYgKGVsZW1lbnQuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50KTtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVml2dXMgW2NvbnN0cnVjdG9yXTogXCJlbGVtZW50XCIgcGFyYW1ldGVyIGlzIG5vdCByZWxhdGVkIHRvIGFuIGV4aXN0aW5nIElEJyk7XG4gICAgfVxuICB9XG4gIHRoaXMucGFyZW50RWwgPSBlbGVtZW50O1xuXG4gIC8vIENyZWF0ZSB0aGUgb2JqZWN0IGVsZW1lbnQgaWYgdGhlIHByb3BlcnR5IGBmaWxlYCBleGlzdHMgaW4gdGhlIG9wdGlvbnMgb2JqZWN0XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZmlsZSkge1xuICAgIHZhciBvYmpFbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICBvYmpFbG0uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2ltYWdlL3N2Zyt4bWwnKTtcbiAgICBvYmpFbG0uc2V0QXR0cmlidXRlKCdkYXRhJywgb3B0aW9ucy5maWxlKTtcbiAgICBvYmpFbG0uc2V0QXR0cmlidXRlKCd3aWR0aCcsICcxMDAlJyk7XG4gICAgb2JqRWxtLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgJzEwMCUnKTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKG9iakVsbSk7XG4gICAgZWxlbWVudCA9IG9iakVsbTtcbiAgfVxuXG4gIHN3aXRjaCAoZWxlbWVudC5jb25zdHJ1Y3Rvcikge1xuICBjYXNlIHdpbmRvdy5TVkdTVkdFbGVtZW50OlxuICBjYXNlIHdpbmRvdy5TVkdFbGVtZW50OlxuICAgIHRoaXMuZWwgPSBlbGVtZW50O1xuICAgIHRoaXMuaXNSZWFkeSA9IHRydWU7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSB3aW5kb3cuSFRNTE9iamVjdEVsZW1lbnQ6XG4gICAgLy8gSWYgdGhlIE9iamVjdCBpcyBhbHJlYWR5IGxvYWRlZFxuICAgIHRoaXMuZWwgPSBlbGVtZW50LmNvbnRlbnREb2N1bWVudCAmJiBlbGVtZW50LmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzdmcnKTtcbiAgICBpZiAodGhpcy5lbCkge1xuICAgICAgdGhpcy5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBoYXZlIHRvIHdhaXQgZm9yIGl0XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuZWwgPSBlbGVtZW50LmNvbnRlbnREb2N1bWVudCAmJiBlbGVtZW50LmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzdmcnKTtcbiAgICAgIGlmICghc2VsZi5lbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZpdnVzIFtjb25zdHJ1Y3Rvcl06IG9iamVjdCBsb2FkZWQgZG9lcyBub3QgY29udGFpbiBhbnkgU1ZHJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZi5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5pbml0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYnJlYWs7XG5cbiAgZGVmYXVsdDpcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZpdnVzIFtjb25zdHJ1Y3Rvcl06IFwiZWxlbWVudFwiIHBhcmFtZXRlciBpcyBub3QgdmFsaWQgKG9yIG1pc3MgdGhlIFwiZmlsZVwiIGF0dHJpYnV0ZSknKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgdXAgdXNlciBvcHRpb24gdG8gdGhlIGluc3RhbmNlXG4gKiBUaGUgbWV0aG9kIHdpbGwgbm90IHJldHVybiBhbnl0aGluZywgYnV0IHdpbGwgdGhyb3cgYW5cbiAqIGVycm9yIGlmIHRoZSBwYXJhbWV0ZXIgaXMgaW52YWxpZFxuICpcbiAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBPYmplY3QgZnJvbSB0aGUgY29uc3RydWN0b3JcbiAqL1xuVml2dXMucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB2YXIgYWxsb3dlZFR5cGVzID0gWydkZWxheWVkJywgJ2FzeW5jJywgJ29uZUJ5T25lJywgJ3NjZW5hcmlvJywgJ3NjZW5hcmlvLXN5bmMnXTtcbiAgdmFyIGFsbG93ZWRTdGFydHMgPSAgWydpblZpZXdwb3J0JywgJ21hbnVhbCcsICdhdXRvc3RhcnQnXTtcblxuICAvLyBCYXNpYyBjaGVja1xuICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVml2dXMgW2NvbnN0cnVjdG9yXTogXCJvcHRpb25zXCIgcGFyYW1ldGVyIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIH1cblxuICAvLyBTZXQgdGhlIGFuaW1hdGlvbiB0eXBlXG4gIGlmIChvcHRpb25zLnR5cGUgJiYgYWxsb3dlZFR5cGVzLmluZGV4T2Yob3B0aW9ucy50eXBlKSA9PT0gLTEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZpdnVzIFtjb25zdHJ1Y3Rvcl06ICcgKyBvcHRpb25zLnR5cGUgKyAnIGlzIG5vdCBhbiBleGlzdGluZyBhbmltYXRpb24gYHR5cGVgJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy50eXBlID0gb3B0aW9ucy50eXBlIHx8IGFsbG93ZWRUeXBlc1swXTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgc3RhcnQgdHlwZVxuICBpZiAob3B0aW9ucy5zdGFydCAmJiBhbGxvd2VkU3RhcnRzLmluZGV4T2Yob3B0aW9ucy5zdGFydCkgPT09IC0xKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdWaXZ1cyBbY29uc3RydWN0b3JdOiAnICsgb3B0aW9ucy5zdGFydCArICcgaXMgbm90IGFuIGV4aXN0aW5nIGBzdGFydGAgb3B0aW9uJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5zdGFydCA9IG9wdGlvbnMuc3RhcnQgfHwgYWxsb3dlZFN0YXJ0c1swXTtcbiAgfVxuXG4gIHRoaXMuaXNJRSAgICAgICAgPSAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMSB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdUcmlkZW50LycpICE9PSAtMSB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdFZGdlLycpICE9PSAtMSApO1xuICB0aGlzLmR1cmF0aW9uICAgID0gcGFyc2VQb3NpdGl2ZUludChvcHRpb25zLmR1cmF0aW9uLCAxMjApO1xuICB0aGlzLmRlbGF5ICAgICAgID0gcGFyc2VQb3NpdGl2ZUludChvcHRpb25zLmRlbGF5LCBudWxsKTtcbiAgdGhpcy5kYXNoR2FwICAgICA9IHBhcnNlUG9zaXRpdmVJbnQob3B0aW9ucy5kYXNoR2FwLCAyKTtcbiAgdGhpcy5mb3JjZVJlbmRlciA9IG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2ZvcmNlUmVuZGVyJykgPyAhIW9wdGlvbnMuZm9yY2VSZW5kZXIgOiB0aGlzLmlzSUU7XG4gIHRoaXMuc2VsZkRlc3Ryb3kgPSAhIW9wdGlvbnMuc2VsZkRlc3Ryb3k7XG4gIHRoaXMub25SZWFkeSAgICAgPSBvcHRpb25zLm9uUmVhZHk7XG5cbiAgdGhpcy5pZ25vcmVJbnZpc2libGUgPSBvcHRpb25zLmhhc093blByb3BlcnR5KCdpZ25vcmVJbnZpc2libGUnKSA/ICEhb3B0aW9ucy5pZ25vcmVJbnZpc2libGUgOiBmYWxzZTtcblxuICB0aGlzLmFuaW1UaW1pbmdGdW5jdGlvbiA9IG9wdGlvbnMuYW5pbVRpbWluZ0Z1bmN0aW9uIHx8IFZpdnVzLkxJTkVBUjtcbiAgdGhpcy5wYXRoVGltaW5nRnVuY3Rpb24gPSBvcHRpb25zLnBhdGhUaW1pbmdGdW5jdGlvbiB8fCBWaXZ1cy5MSU5FQVI7XG5cbiAgaWYgKHRoaXMuZGVsYXkgPj0gdGhpcy5kdXJhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignVml2dXMgW2NvbnN0cnVjdG9yXTogZGVsYXkgbXVzdCBiZSBzaG9ydGVyIHRoYW4gZHVyYXRpb24nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgdXAgY2FsbGJhY2sgdG8gdGhlIGluc3RhbmNlXG4gKiBUaGUgbWV0aG9kIHdpbGwgbm90IHJldHVybiBlbnl0aGluZywgYnV0IHdpbGwgdGhyb3cgYW5cbiAqIGVycm9yIGlmIHRoZSBwYXJhbWV0ZXIgaXMgaW52YWxpZFxuICpcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmb3IgdGhlIGFuaW1hdGlvbiBlbmRcbiAqL1xuVml2dXMucHJvdG90eXBlLnNldENhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIC8vIEJhc2ljIGNoZWNrXG4gIGlmICghIWNhbGxiYWNrICYmIGNhbGxiYWNrLmNvbnN0cnVjdG9yICE9PSBGdW5jdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignVml2dXMgW2NvbnN0cnVjdG9yXTogXCJjYWxsYmFja1wiIHBhcmFtZXRlciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgfVxuICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG59O1xuXG5cbi8qKlxuICogQ29yZVxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKi9cblxuLyoqXG4gKiBNYXAgdGhlIHN2ZywgcGF0aCBieSBwYXRoLlxuICogVGhlIG1ldGhvZCByZXR1cm4gbm90aGluZywgaXQganVzdCBmaWxsIHRoZVxuICogYG1hcGAgYXJyYXkuIEVhY2ggaXRlbSBpbiB0aGlzIGFycmF5IHJlcHJlc2VudFxuICogYSBwYXRoIGVsZW1lbnQgZnJvbSB0aGUgU1ZHLCB3aXRoIGluZm9ybWF0aW9ucyBmb3JcbiAqIHRoZSBhbmltYXRpb24uXG4gKlxuICogYGBgXG4gKiBbXG4gKiAgIHtcbiAqICAgICBlbDogPERPTW9iaj4gdGhlIHBhdGggZWxlbWVudFxuICogICAgIGxlbmd0aDogPG51bWJlcj4gbGVuZ3RoIG9mIHRoZSBwYXRoIGxpbmVcbiAqICAgICBzdGFydEF0OiA8bnVtYmVyPiB0aW1lIHN0YXJ0IG9mIHRoZSBwYXRoIGFuaW1hdGlvbiAoaW4gZnJhbWVzKVxuICogICAgIGR1cmF0aW9uOiA8bnVtYmVyPiBwYXRoIGFuaW1hdGlvbiBkdXJhdGlvbiAoaW4gZnJhbWVzKVxuICogICB9LFxuICogICAuLi5cbiAqIF1cbiAqIGBgYFxuICpcbiAqL1xuVml2dXMucHJvdG90eXBlLm1hcHBpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpLCBwYXRocywgcGF0aCwgcEF0dHJzLCBwYXRoT2JqLCB0b3RhbExlbmd0aCwgbGVuZ3RoTWV0ZXIsIHRpbWVQb2ludDtcbiAgdGltZVBvaW50ID0gdG90YWxMZW5ndGggPSBsZW5ndGhNZXRlciA9IDA7XG4gIHBhdGhzID0gdGhpcy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdwYXRoJyk7XG5cbiAgZm9yIChpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcGF0aCA9IHBhdGhzW2ldO1xuICAgIGlmICh0aGlzLmlzSW52aXNpYmxlKHBhdGgpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcGF0aE9iaiA9IHtcbiAgICAgIGVsOiBwYXRoLFxuICAgICAgbGVuZ3RoOiBNYXRoLmNlaWwocGF0aC5nZXRUb3RhbExlbmd0aCgpKVxuICAgIH07XG4gICAgLy8gVGVzdCBpZiB0aGUgcGF0aCBsZW5ndGggaXMgY29ycmVjdFxuICAgIGlmIChpc05hTihwYXRoT2JqLmxlbmd0aCkpIHtcbiAgICAgIGlmICh3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdWaXZ1cyBbbWFwcGluZ106IGNhbm5vdCByZXRyaWV2ZSBhIHBhdGggZWxlbWVudCBsZW5ndGgnLCBwYXRoKTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICB0b3RhbExlbmd0aCArPSBwYXRoT2JqLmxlbmd0aDtcbiAgICB0aGlzLm1hcC5wdXNoKHBhdGhPYmopO1xuICAgIHBhdGguc3R5bGUuc3Ryb2tlRGFzaGFycmF5ICA9IHBhdGhPYmoubGVuZ3RoICsgJyAnICsgKHBhdGhPYmoubGVuZ3RoICsgdGhpcy5kYXNoR2FwKTtcbiAgICBwYXRoLnN0eWxlLnN0cm9rZURhc2hvZmZzZXQgPSBwYXRoT2JqLmxlbmd0aDtcblxuICAgIC8vIEZpeCBJRSBnbGl0Y2hcbiAgICBpZiAodGhpcy5pc0lFKSB7XG4gICAgICBwYXRoT2JqLmxlbmd0aCArPSB0aGlzLmRhc2hHYXA7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyUGF0aChpKTtcbiAgfVxuXG4gIHRvdGFsTGVuZ3RoID0gdG90YWxMZW5ndGggPT09IDAgPyAxIDogdG90YWxMZW5ndGg7XG4gIHRoaXMuZGVsYXkgPSB0aGlzLmRlbGF5ID09PSBudWxsID8gdGhpcy5kdXJhdGlvbiAvIDMgOiB0aGlzLmRlbGF5O1xuICB0aGlzLmRlbGF5VW5pdCA9IHRoaXMuZGVsYXkgLyAocGF0aHMubGVuZ3RoID4gMSA/IHBhdGhzLmxlbmd0aCAtIDEgOiAxKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5tYXAubGVuZ3RoOyBpKyspIHtcbiAgICBwYXRoT2JqID0gdGhpcy5tYXBbaV07XG5cbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgIGNhc2UgJ2RlbGF5ZWQnOlxuICAgICAgcGF0aE9iai5zdGFydEF0ID0gdGhpcy5kZWxheVVuaXQgKiBpO1xuICAgICAgcGF0aE9iai5kdXJhdGlvbiA9IHRoaXMuZHVyYXRpb24gLSB0aGlzLmRlbGF5O1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdvbmVCeU9uZSc6XG4gICAgICBwYXRoT2JqLnN0YXJ0QXQgPSBsZW5ndGhNZXRlciAvIHRvdGFsTGVuZ3RoICogdGhpcy5kdXJhdGlvbjtcbiAgICAgIHBhdGhPYmouZHVyYXRpb24gPSBwYXRoT2JqLmxlbmd0aCAvIHRvdGFsTGVuZ3RoICogdGhpcy5kdXJhdGlvbjtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYXN5bmMnOlxuICAgICAgcGF0aE9iai5zdGFydEF0ID0gMDtcbiAgICAgIHBhdGhPYmouZHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdzY2VuYXJpby1zeW5jJzpcbiAgICAgIHBhdGggPSBwYXRoc1tpXTtcbiAgICAgIHBBdHRycyA9IHRoaXMucGFyc2VBdHRyKHBhdGgpO1xuICAgICAgcGF0aE9iai5zdGFydEF0ID0gdGltZVBvaW50ICsgKHBhcnNlUG9zaXRpdmVJbnQocEF0dHJzWydkYXRhLWRlbGF5J10sIHRoaXMuZGVsYXlVbml0KSB8fCAwKTtcbiAgICAgIHBhdGhPYmouZHVyYXRpb24gPSBwYXJzZVBvc2l0aXZlSW50KHBBdHRyc1snZGF0YS1kdXJhdGlvbiddLCB0aGlzLmR1cmF0aW9uKTtcbiAgICAgIHRpbWVQb2ludCA9IHBBdHRyc1snZGF0YS1hc3luYyddICE9PSB1bmRlZmluZWQgPyBwYXRoT2JqLnN0YXJ0QXQgOiBwYXRoT2JqLnN0YXJ0QXQgKyBwYXRoT2JqLmR1cmF0aW9uO1xuICAgICAgdGhpcy5mcmFtZUxlbmd0aCA9IE1hdGgubWF4KHRoaXMuZnJhbWVMZW5ndGgsIChwYXRoT2JqLnN0YXJ0QXQgKyBwYXRoT2JqLmR1cmF0aW9uKSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3NjZW5hcmlvJzpcbiAgICAgIHBhdGggPSBwYXRoc1tpXTtcbiAgICAgIHBBdHRycyA9IHRoaXMucGFyc2VBdHRyKHBhdGgpO1xuICAgICAgcGF0aE9iai5zdGFydEF0ID0gcGFyc2VQb3NpdGl2ZUludChwQXR0cnNbJ2RhdGEtc3RhcnQnXSwgdGhpcy5kZWxheVVuaXQpIHx8IDA7XG4gICAgICBwYXRoT2JqLmR1cmF0aW9uID0gcGFyc2VQb3NpdGl2ZUludChwQXR0cnNbJ2RhdGEtZHVyYXRpb24nXSwgdGhpcy5kdXJhdGlvbik7XG4gICAgICB0aGlzLmZyYW1lTGVuZ3RoID0gTWF0aC5tYXgodGhpcy5mcmFtZUxlbmd0aCwgKHBhdGhPYmouc3RhcnRBdCArIHBhdGhPYmouZHVyYXRpb24pKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZW5ndGhNZXRlciArPSBwYXRoT2JqLmxlbmd0aDtcbiAgICB0aGlzLmZyYW1lTGVuZ3RoID0gdGhpcy5mcmFtZUxlbmd0aCB8fCB0aGlzLmR1cmF0aW9uO1xuICB9XG59O1xuXG4vKipcbiAqIEludGVydmFsIG1ldGhvZCB0byBkcmF3IHRoZSBTVkcgZnJvbSBjdXJyZW50XG4gKiBwb3NpdGlvbiBvZiB0aGUgYW5pbWF0aW9uLiBJdCB1cGRhdGUgdGhlIHZhbHVlIG9mXG4gKiBgY3VycmVudEZyYW1lYCBhbmQgcmUtdHJhY2UgdGhlIFNWRy5cbiAqXG4gKiBJdCB1c2UgdGhpcy5oYW5kbGUgdG8gc3RvcmUgdGhlIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICogYW5kIGNsZWFyIGl0IG9uZSB0aGUgYW5pbWF0aW9uIGlzIHN0b3BwZWQuIFNvIHRoaXNcbiAqIGF0dHJpYnV0ZSBjYW4gYmUgdXNlZCB0byBrbm93IGlmIHRoZSBhbmltYXRpb24gaXNcbiAqIHBsYXlpbmcuXG4gKlxuICogT25jZSB0aGUgYW5pbWF0aW9uIGF0IHRoZSBlbmQsIHRoaXMgbWV0aG9kIHdpbGxcbiAqIHRyaWdnZXIgdGhlIFZpdnVzIGNhbGxiYWNrLlxuICpcbiAqL1xuVml2dXMucHJvdG90eXBlLmRyYXdlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLmN1cnJlbnRGcmFtZSArPSB0aGlzLnNwZWVkO1xuXG4gIGlmICh0aGlzLmN1cnJlbnRGcmFtZSA8PSAwKSB7XG4gICAgdGhpcy5zdG9wKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMuY2FsbGJhY2sodGhpcyk7XG4gIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50RnJhbWUgPj0gdGhpcy5mcmFtZUxlbmd0aCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMuY3VycmVudEZyYW1lID0gdGhpcy5mcmFtZUxlbmd0aDtcbiAgICB0aGlzLnRyYWNlKCk7XG4gICAgaWYgKHRoaXMuc2VsZkRlc3Ryb3kpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrKHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMudHJhY2UoKTtcbiAgICB0aGlzLmhhbmRsZSA9IHJlcXVlc3RBbmltRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5kcmF3ZXIoKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3IHRoZSBTVkcgYXQgdGhlIGN1cnJlbnQgaW5zdGFudCBmcm9tIHRoZVxuICogYGN1cnJlbnRGcmFtZWAgdmFsdWUuIEhlcmUgaXMgd2hlcmUgbW9zdCBvZiB0aGUgbWFnaWMgaXMuXG4gKiBUaGUgdHJpY2sgaXMgdG8gdXNlIHRoZSBgc3Ryb2tlRGFzaG9mZnNldGAgc3R5bGUgcHJvcGVydHkuXG4gKlxuICogRm9yIG9wdGltaXNhdGlvbiByZWFzb25zLCBhIG5ldyBwcm9wZXJ0eSBjYWxsZWQgYHByb2dyZXNzYFxuICogaXMgYWRkZWQgaW4gZWFjaCBpdGVtIG9mIGBtYXBgLiBUaGlzIG9uZSBjb250YWluIHRoZSBjdXJyZW50XG4gKiBwcm9ncmVzcyBvZiB0aGUgcGF0aCBlbGVtZW50LiBPbmx5IGlmIHRoZSBuZXcgdmFsdWUgaXMgZGlmZmVyZW50XG4gKiB0aGUgbmV3IHZhbHVlIHdpbGwgYmUgYXBwbGllZCB0byB0aGUgRE9NIGVsZW1lbnQuIFRoaXNcbiAqIG1ldGhvZCBzYXZlIGEgbG90IG9mIHJlc291cmNlcyB0byByZS1yZW5kZXIgdGhlIFNWRy4gQW5kIGNvdWxkXG4gKiBiZSBpbXByb3ZlZCBpZiB0aGUgYW5pbWF0aW9uIGNvdWxkbid0IGJlIHBsYXllZCBmb3J3YXJkLlxuICpcbiAqL1xuVml2dXMucHJvdG90eXBlLnRyYWNlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaSwgcHJvZ3Jlc3MsIHBhdGgsIGN1cnJlbnRGcmFtZTtcbiAgY3VycmVudEZyYW1lID0gdGhpcy5hbmltVGltaW5nRnVuY3Rpb24odGhpcy5jdXJyZW50RnJhbWUgLyB0aGlzLmZyYW1lTGVuZ3RoKSAqIHRoaXMuZnJhbWVMZW5ndGg7XG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLm1hcC5sZW5ndGg7IGkrKykge1xuICAgIHBhdGggPSB0aGlzLm1hcFtpXTtcbiAgICBwcm9ncmVzcyA9IChjdXJyZW50RnJhbWUgLSBwYXRoLnN0YXJ0QXQpIC8gcGF0aC5kdXJhdGlvbjtcbiAgICBwcm9ncmVzcyA9IHRoaXMucGF0aFRpbWluZ0Z1bmN0aW9uKE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHByb2dyZXNzKSkpO1xuICAgIGlmIChwYXRoLnByb2dyZXNzICE9PSBwcm9ncmVzcykge1xuICAgICAgcGF0aC5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgcGF0aC5lbC5zdHlsZS5zdHJva2VEYXNob2Zmc2V0ID0gTWF0aC5mbG9vcihwYXRoLmxlbmd0aCAqICgxIC0gcHJvZ3Jlc3MpKTtcbiAgICAgIHRoaXMucmVuZGVyUGF0aChpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogTWV0aG9kIGZvcmNpbmcgdGhlIGJyb3dzZXIgdG8gcmUtcmVuZGVyIGEgcGF0aCBlbGVtZW50XG4gKiBmcm9tIGl0J3MgaW5kZXggaW4gdGhlIG1hcC4gRGVwZW5kaW5nIG9uIHRoZSBgZm9yY2VSZW5kZXJgXG4gKiB2YWx1ZS5cbiAqIFRoZSB0cmljayBpcyB0byByZXBsYWNlIHRoZSBwYXRoIGVsZW1lbnQgYnkgaXQncyBjbG9uZS5cbiAqIFRoaXMgcHJhY3RpY2UgaXMgbm90IHJlY29tbWVuZGVkIGJlY2F1c2UgaXQncyBhc2tpbmcgbW9yZVxuICogcmVzc291cmNlcywgdG9vIG11Y2ggRE9NIG1hbnVwdWxhdGlvbi4uXG4gKiBidXQgaXQncyB0aGUgb25seSB3YXkgdG8gbGV0IHRoZSBtYWdpYyBoYXBwZW4gb24gSUUuXG4gKiBCeSBkZWZhdWx0LCB0aGlzIGZhbGxiYWNrIGlzIG9ubHkgYXBwbGllZCBvbiBJRS5cbiAqIFxuICogQHBhcmFtICB7TnVtYmVyfSBpbmRleCBQYXRoIGluZGV4XG4gKi9cblZpdnVzLnByb3RvdHlwZS5yZW5kZXJQYXRoID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gIGlmICh0aGlzLmZvcmNlUmVuZGVyICYmIHRoaXMubWFwICYmIHRoaXMubWFwW2luZGV4XSkge1xuICAgIHZhciBwYXRoT2JqID0gdGhpcy5tYXBbaW5kZXhdLFxuICAgICAgICBuZXdQYXRoID0gcGF0aE9iai5lbC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgcGF0aE9iai5lbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdQYXRoLCBwYXRoT2JqLmVsKTtcbiAgICBwYXRoT2JqLmVsID0gbmV3UGF0aDtcbiAgfVxufTtcblxuLyoqXG4gKiBXaGVuIHRoZSBTVkcgb2JqZWN0IGlzIGxvYWRlZCBhbmQgcmVhZHksXG4gKiB0aGlzIG1ldGhvZCB3aWxsIGNvbnRpbnVlIHRoZSBpbml0aWFsaXNhdGlvbi5cbiAqXG4gKiBUaGlzIHRoaXMgbWFpbmx5IGR1ZSB0byB0aGUgY2FzZSBvZiBwYXNzaW5nIGFuXG4gKiBvYmplY3QgdGFnIGluIHRoZSBjb25zdHJ1Y3Rvci4gSXQgd2lsbCB3YWl0XG4gKiB0aGUgZW5kIG9mIHRoZSBsb2FkaW5nIHRvIGluaXRpYWxpc2UuXG4gKiBcbiAqL1xuVml2dXMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFNldCBvYmplY3QgdmFyaWFibGVzXG4gIHRoaXMuZnJhbWVMZW5ndGggPSAwO1xuICB0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XG4gIHRoaXMubWFwID0gW107XG5cbiAgLy8gU3RhcnRcbiAgbmV3IFBhdGhmb3JtZXIodGhpcy5lbCk7XG4gIHRoaXMubWFwcGluZygpO1xuICB0aGlzLnN0YXJ0ZXIoKTtcblxuICBpZiAodGhpcy5vblJlYWR5KSB7XG4gICAgdGhpcy5vblJlYWR5KHRoaXMpO1xuICB9XG59O1xuXG4vKipcbiAqIFRyaWdnZXIgdG8gc3RhcnQgb2YgdGhlIGFuaW1hdGlvbi5cbiAqIERlcGVuZGluZyBvbiB0aGUgYHN0YXJ0YCB2YWx1ZSwgYSBkaWZmZXJlbnQgc2NyaXB0XG4gKiB3aWxsIGJlIGFwcGxpZWQuXG4gKlxuICogSWYgdGhlIGBzdGFydGAgdmFsdWUgaXMgbm90IHZhbGlkLCBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAqIEV2ZW4gaWYgdGVjaG5pY2FsbHksIHRoaXMgaXMgaW1wb3NzaWJsZS5cbiAqXG4gKi9cblZpdnVzLnByb3RvdHlwZS5zdGFydGVyID0gZnVuY3Rpb24gKCkge1xuICBzd2l0Y2ggKHRoaXMuc3RhcnQpIHtcbiAgY2FzZSAnbWFudWFsJzpcbiAgICByZXR1cm47XG5cbiAgY2FzZSAnYXV0b3N0YXJ0JzpcbiAgICB0aGlzLnBsYXkoKTtcbiAgICBicmVhaztcblxuICBjYXNlICdpblZpZXdwb3J0JzpcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgbGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5pc0luVmlld3BvcnQoc2VsZi5wYXJlbnRFbCwgMSkpIHtcbiAgICAgICAgc2VsZi5wbGF5KCk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgbGlzdGVuZXIpO1xuICAgIGxpc3RlbmVyKCk7XG4gICAgYnJlYWs7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBDb250cm9sc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKi9cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIHRoZSBhbmltYXRpb24gYmV0d2VlblxuICogdGhyZWUgZGlmZmVyZW50IHN0YXRlczogJ3N0YXJ0JywgJ3Byb2dyZXNzJywgJ2VuZCcuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEluc3RhbmNlIHN0YXR1c1xuICovXG5WaXZ1cy5wcm90b3R5cGUuZ2V0U3RhdHVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50RnJhbWUgPT09IDAgPyAnc3RhcnQnIDogdGhpcy5jdXJyZW50RnJhbWUgPT09IHRoaXMuZnJhbWVMZW5ndGggPyAnZW5kJyA6ICdwcm9ncmVzcyc7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBpbnN0YW5jZSB0byB0aGUgaW5pdGlhbCBzdGF0ZSA6IHVuZHJhd1xuICogQmUgY2FyZWZ1bCwgaXQganVzdCByZXNldCB0aGUgYW5pbWF0aW9uLCBpZiB5b3UncmVcbiAqIHBsYXlpbmcgdGhlIGFuaW1hdGlvbiwgdGhpcyB3b24ndCBzdG9wIGl0LiBCdXQganVzdFxuICogbWFrZSBpdCBzdGFydCBmcm9tIHN0YXJ0LlxuICpcbiAqL1xuVml2dXMucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5zZXRGcmFtZVByb2dyZXNzKDApO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGluc3RhbmNlIHRvIHRoZSBmaW5hbCBzdGF0ZSA6IGRyYXduXG4gKiBCZSBjYXJlZnVsLCBpdCBqdXN0IHNldCB0aGUgYW5pbWF0aW9uLCBpZiB5b3UncmVcbiAqIHBsYXlpbmcgdGhlIGFuaW1hdGlvbiBvbiByZXdpbmQsIHRoaXMgd29uJ3Qgc3RvcCBpdC5cbiAqIEJ1dCBqdXN0IG1ha2UgaXQgc3RhcnQgZnJvbSB0aGUgZW5kLlxuICpcbiAqL1xuVml2dXMucHJvdG90eXBlLmZpbmlzaCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc2V0RnJhbWVQcm9ncmVzcygxKTtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBsZXZlbCBvZiBwcm9ncmVzcyBvZiB0aGUgZHJhd2luZy5cbiAqIFxuICogQHBhcmFtIHtudW1iZXJ9IHByb2dyZXNzIExldmVsIG9mIHByb2dyZXNzIHRvIHNldFxuICovXG5WaXZ1cy5wcm90b3R5cGUuc2V0RnJhbWVQcm9ncmVzcyA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICBwcm9ncmVzcyA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIHByb2dyZXNzKSk7XG4gIHRoaXMuY3VycmVudEZyYW1lID0gTWF0aC5yb3VuZCh0aGlzLmZyYW1lTGVuZ3RoICogcHJvZ3Jlc3MpO1xuICB0aGlzLnRyYWNlKCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQbGF5IHRoZSBhbmltYXRpb24gYXQgdGhlIGRlc2lyZWQgc3BlZWQuXG4gKiBTcGVlZCBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyIChubyB6ZXJvKS5cbiAqIEJ5IGRlZmF1bHQsIHRoZSBzcGVlZCB2YWx1ZSBpcyAxLlxuICogQnV0IGEgbmVnYXRpdmUgdmFsdWUgaXMgYWNjZXB0ZWQgdG8gZ28gZm9yd2FyZC5cbiAqXG4gKiBBbmQgd29ya3Mgd2l0aCBmbG9hdCB0b28uXG4gKiBCdXQgZG9uJ3QgZm9yZ2V0IHdlIGFyZSBpbiBKYXZhU2NyaXB0LCBzZSBiZSBuaWNlXG4gKiB3aXRoIGhpbSBhbmQgZ2l2ZSBoaW0gYSAxLzJeeCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHNwZWVkIEFuaW1hdGlvbiBzcGVlZCBbb3B0aW9uYWxdXG4gKi9cblZpdnVzLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24gKHNwZWVkKSB7XG4gIGlmIChzcGVlZCAmJiB0eXBlb2Ygc3BlZWQgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdWaXZ1cyBbcGxheV06IGludmFsaWQgc3BlZWQnKTtcbiAgfVxuICB0aGlzLnNwZWVkID0gc3BlZWQgfHwgMTtcbiAgaWYgKCF0aGlzLmhhbmRsZSkge1xuICAgIHRoaXMuZHJhd2VyKCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN0b3AgdGhlIGN1cnJlbnQgYW5pbWF0aW9uLCBpZiBvbiBwcm9ncmVzcy5cbiAqIFNob3VsZCBub3QgdHJpZ2dlciBhbnkgZXJyb3IuXG4gKlxuICovXG5WaXZ1cy5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuaGFuZGxlKSB7XG4gICAgY2FuY2VsQW5pbUZyYW1lKHRoaXMuaGFuZGxlKTtcbiAgICBkZWxldGUgdGhpcy5oYW5kbGU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERlc3Ryb3kgdGhlIGluc3RhbmNlLlxuICogUmVtb3ZlIGFsbCBiYWQgc3R5bGluZyBhdHRyaWJ1dGVzIG9uIGFsbFxuICogcGF0aCB0YWdzXG4gKlxuICovXG5WaXZ1cy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGksIHBhdGg7XG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLm1hcC5sZW5ndGg7IGkrKykge1xuICAgIHBhdGggPSB0aGlzLm1hcFtpXTtcbiAgICBwYXRoLmVsLnN0eWxlLnN0cm9rZURhc2hvZmZzZXQgPSBudWxsO1xuICAgIHBhdGguZWwuc3R5bGUuc3Ryb2tlRGFzaGFycmF5ID0gbnVsbDtcbiAgICB0aGlzLnJlbmRlclBhdGgoaSk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBVdGlscyBtZXRob2RzXG4gKiBpbmNsdWRlIG1ldGhvZHMgZnJvbSBDb2Ryb3BzXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqL1xuXG4vKipcbiAqIE1ldGhvZCB0byBiZXN0IGd1ZXNzIGlmIGEgcGF0aCBzaG91bGQgYWRkZWQgaW50b1xuICogdGhlIGFuaW1hdGlvbiBvciBub3QuXG4gKlxuICogMS4gVXNlIHRoZSBgZGF0YS12aXZ1cy1pZ25vcmVgIGF0dHJpYnV0ZSBpZiBzZXRcbiAqIDIuIENoZWNrIGlmIHRoZSBpbnN0YW5jZSBtdXN0IGlnbm9yZSBpbnZpc2libGUgcGF0aHNcbiAqIDMuIENoZWNrIGlmIHRoZSBwYXRoIGlzIHZpc2libGVcbiAqXG4gKiBGb3Igbm93IHRoZSB2aXNpYmlsaXR5IGNoZWNraW5nIGlzIHVuc3RhYmxlLlxuICogSXQgd2lsbCBiZSB1c2VkIGZvciBhIGJldGEgcGhhc2UuXG4gKlxuICogT3RoZXIgaW1wcm92bWVudHMgYXJlIHBsYW5uZWQuIExpa2UgZGV0ZWN0aW5nXG4gKiBpcyB0aGUgcGF0aCBnb3QgYSBzdHJva2Ugb3IgYSB2YWxpZCBvcGFjaXR5LlxuICovXG5WaXZ1cy5wcm90b3R5cGUuaXNJbnZpc2libGUgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIHJlY3QsXG4gICAgaWdub3JlQXR0ciA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pZ25vcmUnKTtcblxuICBpZiAoaWdub3JlQXR0ciAhPT0gbnVsbCkge1xuICAgIHJldHVybiBpZ25vcmVBdHRyICE9PSAnZmFsc2UnO1xuICB9XG5cbiAgaWYgKHRoaXMuaWdub3JlSW52aXNpYmxlKSB7XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiAhcmVjdC53aWR0aCAmJiAhcmVjdC5oZWlnaHQ7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIFBhcnNlIGF0dHJpYnV0ZXMgb2YgYSBET00gZWxlbWVudCB0b1xuICogZ2V0IGFuIG9iamVjdCBvZiB7YXR0cmlidXRlTmFtZSA9PiBhdHRyaWJ1dGVWYWx1ZX1cbiAqXG4gKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgRE9NIGVsZW1lbnQgdG8gcGFyc2VcbiAqIEByZXR1cm4ge29iamVjdH0gICAgICAgICBPYmplY3Qgb2YgYXR0cmlidXRlc1xuICovXG5WaXZ1cy5wcm90b3R5cGUucGFyc2VBdHRyID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdmFyIGF0dHIsIG91dHB1dCA9IHt9O1xuICBpZiAoZWxlbWVudCAmJiBlbGVtZW50LmF0dHJpYnV0ZXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0ciA9IGVsZW1lbnQuYXR0cmlidXRlc1tpXTtcbiAgICAgIG91dHB1dFthdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogUmVwbHkgaWYgYW4gZWxlbWVudCBpcyBpbiB0aGUgcGFnZSB2aWV3cG9ydFxuICpcbiAqIEBwYXJhbSAge29iamVjdH0gZWwgRWxlbWVudCB0byBvYnNlcnZlXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGggIFBlcmNlbnRhZ2Ugb2YgaGVpZ2h0XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5WaXZ1cy5wcm90b3R5cGUuaXNJblZpZXdwb3J0ID0gZnVuY3Rpb24gKGVsLCBoKSB7XG4gIHZhciBzY3JvbGxlZCAgID0gdGhpcy5zY3JvbGxZKCksXG4gICAgdmlld2VkICAgICAgID0gc2Nyb2xsZWQgKyB0aGlzLmdldFZpZXdwb3J0SCgpLFxuICAgIGVsQkNSICAgICAgICA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgIGVsSGVpZ2h0ICAgICA9IGVsQkNSLmhlaWdodCxcbiAgICBlbFRvcCAgICAgICAgPSBzY3JvbGxlZCArIGVsQkNSLnRvcCxcbiAgICBlbEJvdHRvbSAgICAgPSBlbFRvcCArIGVsSGVpZ2h0O1xuXG4gIC8vIGlmIDAsIHRoZSBlbGVtZW50IGlzIGNvbnNpZGVyZWQgaW4gdGhlIHZpZXdwb3J0IGFzIHNvb24gYXMgaXQgZW50ZXJzLlxuICAvLyBpZiAxLCB0aGUgZWxlbWVudCBpcyBjb25zaWRlcmVkIGluIHRoZSB2aWV3cG9ydCBvbmx5IHdoZW4gaXQncyBmdWxseSBpbnNpZGVcbiAgLy8gdmFsdWUgaW4gcGVyY2VudGFnZSAoMSA+PSBoID49IDApXG4gIGggPSBoIHx8IDA7XG5cbiAgcmV0dXJuIChlbFRvcCArIGVsSGVpZ2h0ICogaCkgPD0gdmlld2VkICYmIChlbEJvdHRvbSkgPj0gc2Nyb2xsZWQ7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciBkb2N1bWVudCBlbGVtZW50XG4gKlxuICogQHR5cGUge0RPTWVsZW1lbnR9XG4gKi9cblZpdnVzLnByb3RvdHlwZS5kb2NFbGVtID0gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuLyoqXG4gKiBHZXQgdGhlIHZpZXdwb3J0IGhlaWdodCBpbiBwaXhlbHNcbiAqXG4gKiBAcmV0dXJuIHtpbnRlZ2VyfSBWaWV3cG9ydCBoZWlnaHRcbiAqL1xuVml2dXMucHJvdG90eXBlLmdldFZpZXdwb3J0SCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNsaWVudCA9IHRoaXMuZG9jRWxlbS5jbGllbnRIZWlnaHQsXG4gICAgaW5uZXIgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgaWYgKGNsaWVudCA8IGlubmVyKSB7XG4gICAgcmV0dXJuIGlubmVyO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBjbGllbnQ7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0IHRoZSBwYWdlIFkgb2Zmc2V0XG4gKlxuICogQHJldHVybiB7aW50ZWdlcn0gUGFnZSBZIG9mZnNldFxuICovXG5WaXZ1cy5wcm90b3R5cGUuc2Nyb2xsWSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpbmRvdy5wYWdlWU9mZnNldCB8fCB0aGlzLmRvY0VsZW0uc2Nyb2xsVG9wO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3IgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgb3JcbiAqIGBzZXRUaW1lb3V0YCBmdW5jdGlvbiBmb3IgZGVwcmVjYXRlZCBicm93c2Vycy5cbiAqXG4gKi9cbnJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gKFxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICAgfHxcbiAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fFxuICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHxcbiAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8XG4gICAgZnVuY3Rpb24oLyogZnVuY3Rpb24gKi8gY2FsbGJhY2spe1xuICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgIH1cbiAgKTtcbn0pKCk7XG5cbi8qKlxuICogQWxpYXMgZm9yIGBjYW5jZWxBbmltYXRpb25GcmFtZWAgb3JcbiAqIGBjYW5jZWxUaW1lb3V0YCBmdW5jdGlvbiBmb3IgZGVwcmVjYXRlZCBicm93c2Vycy5cbiAqXG4gKi9cbmNhbmNlbEFuaW1GcmFtZSA9IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAoXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lICAgICAgIHx8XG4gICAgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lICAgIHx8XG4gICAgd2luZG93Lm9DYW5jZWxBbmltYXRpb25GcmFtZSAgICAgIHx8XG4gICAgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWUgICAgIHx8XG4gICAgZnVuY3Rpb24oaWQpe1xuICAgICAgcmV0dXJuIHdpbmRvdy5jbGVhclRpbWVvdXQoaWQpO1xuICAgIH1cbiAgKTtcbn0pKCk7XG5cbi8qKlxuICogUGFyc2Ugc3RyaW5nIHRvIGludGVnZXIuXG4gKiBJZiB0aGUgbnVtYmVyIGlzIG5vdCBwb3NpdGl2ZSBvciBudWxsXG4gKiB0aGUgbWV0aG9kIHdpbGwgcmV0dXJuIHRoZSBkZWZhdWx0IHZhbHVlXG4gKiBvciAwIGlmIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBTdHJpbmcgdG8gcGFyc2VcbiAqIEBwYXJhbSB7Kn0gZGVmYXVsdFZhbHVlIFZhbHVlIHRvIHJldHVybiBpZiB0aGUgcmVzdWx0IHBhcnNlZCBpcyBpbnZhbGlkXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKlxuICovXG5wYXJzZVBvc2l0aXZlSW50ID0gZnVuY3Rpb24gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgdmFyIG91dHB1dCA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XG4gIHJldHVybiAob3V0cHV0ID49IDApID8gb3V0cHV0IDogZGVmYXVsdFZhbHVlO1xufTtcblxuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBWaXZ1cztcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAvLyBsaWtlIE5vZGUuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWaXZ1cztcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICB3aW5kb3cuVml2dXMgPSBWaXZ1cztcbiAgfVxuXG59KHdpbmRvdywgZG9jdW1lbnQpKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJYcDZKVXhcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcdml2dXNcXFxcZGlzdFxcXFx2aXZ1cy5qc1wiLFwiLy4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFx2aXZ1c1xcXFxkaXN0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypcbiAqIENyZWF0ZWQgYnkgTWljaGFlbC5TZW1jaGVua29cbiAqL1xuXG4vKipcbiAqIENsYXNzIHRvZ2dsZVxuICpcbiAqIEBtb2R1bGUgY29tcG9uZW50cy9jbGFzc1RvZ2dsZXJcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJCkge1xuXG4gIGZ1bmN0aW9uIENsYXNzVG9nZ2xlcihfb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge1xuICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgIGNhbGxlcjogbnVsbCxcbiAgICAgIGNsYXNzVG9Ub2dnbGU6ICdhY3RpdmUnLFxuICAgICAgcmV2ZXJzZUNsYXNzVG9Ub2dnbGU6ICcnLFxuICAgICAgaW5zdGFudEluaXQ6IHRydWUsXG4gICAgICBjYWxsYmFja3M6IHtcbiAgICAgICAgYWRkOiBudWxsLFxuICAgICAgICByZW1vdmU6IG51bGwsXG4gICAgICAgIGJlZm9yZUFkZDogbnVsbCxcbiAgICAgICAgYmVmb3JlUmVtb3ZlOiBudWxsXG4gICAgICB9XG4gICAgfSwgX29wdGlvbnMpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgJGVsZW1lbnQsICRjYWxsZXIsICRjYWxsZXJzTGlzdDtcblxuICAgIC8vIEluaXRpYWxpemF0aW9uO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaW5zdGFudEluaXQpIHtcbiAgICAgIGluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlIG1ldGhvZHM7XG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICRlbGVtZW50ID0gJChfdGhpcy5vcHRpb25zLmVsZW1lbnQpO1xuICAgICAgJGNhbGxlciA9ICQoX3RoaXMub3B0aW9ucy5jYWxsZXIpO1xuICAgICAgaWYgKCRlbGVtZW50Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCRjYWxsZXIubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICRjYWxsZXIuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAkKGVsKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHRvZ2dsZVN0YXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZVN0YXRlKCkge1xuICAgICAgaWYgKCRlbGVtZW50Lmhhc0NsYXNzKF90aGlzLm9wdGlvbnMuY2xhc3NUb1RvZ2dsZSkpIHtcbiAgICAgICAgdG9nZ2xlT3V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2dnbGVJbigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZUluKCkge1xuICAgICAgaWYgKCQuaXNGdW5jdGlvbihfdGhpcy5vcHRpb25zLmNhbGxiYWNrcy5iZWZvcmVBZGQpKSB7XG4gICAgICAgIF90aGlzLm9wdGlvbnMuY2FsbGJhY2tzLmJlZm9yZUFkZCgpO1xuICAgICAgfVxuICAgICAgJGVsZW1lbnRcbiAgICAgICAgLmFkZENsYXNzKF90aGlzLm9wdGlvbnMuY2xhc3NUb1RvZ2dsZSlcbiAgICAgICAgLnJlbW92ZUNsYXNzKF90aGlzLm9wdGlvbnMucmV2ZXJzZUNsYXNzVG9Ub2dnbGUpO1xuICAgICAgaWYgKCQuaXNGdW5jdGlvbihfdGhpcy5vcHRpb25zLmNhbGxiYWNrcy5hZGQpKSB7XG4gICAgICAgIF90aGlzLm9wdGlvbnMuY2FsbGJhY2tzLmFkZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZU91dCgpIHtcbiAgICAgIGlmICgkLmlzRnVuY3Rpb24oX3RoaXMub3B0aW9ucy5jYWxsYmFja3MuYmVmb3JlUmVtb3ZlKSkge1xuICAgICAgICBfdGhpcy5vcHRpb25zLmNhbGxiYWNrcy5iZWZvcmVSZW1vdmUoKTtcbiAgICAgIH1cbiAgICAgICRlbGVtZW50XG4gICAgICAgIC5yZW1vdmVDbGFzcyhfdGhpcy5vcHRpb25zLmNsYXNzVG9Ub2dnbGUpXG4gICAgICAgIC5hZGRDbGFzcyhfdGhpcy5vcHRpb25zLnJldmVyc2VDbGFzc1RvVG9nZ2xlKTtcbiAgICAgIGlmICgkLmlzRnVuY3Rpb24oX3RoaXMub3B0aW9ucy5jYWxsYmFja3MucmVtb3ZlKSkge1xuICAgICAgICBfdGhpcy5vcHRpb25zLmNhbGxiYWNrcy5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlcmFzZUNsYXNzZXMoKSB7XG4gICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcyhfdGhpcy5vcHRpb25zLmNsYXNzVG9Ub2dnbGUgKyAnICcgKyBfdGhpcy5vcHRpb25zLnJldmVyc2VDbGFzc1RvVG9nZ2xlKTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWMgbWV0aG9kc1xuICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGluaXQoKTtcbiAgICB9O1xuXG4gICAgdGhpcy50b2dnbGVJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRvZ2dsZUluKCk7XG4gICAgfTtcblxuICAgIHRoaXMudG9nZ2xlT3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdG9nZ2xlT3V0KCk7XG4gICAgfTtcblxuICAgIHRoaXMuZGV0YWNoRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgJGNhbGxlci5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAkKGVsKS5vZmYoJ2NsaWNrJyk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHRoaXMuZXJhc2VDbGFzc2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgZXJhc2VDbGFzc2VzKCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBDbGFzc1RvZ2dsZXI7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIlhwNkpVeFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NvbXBvbmVudHNcXFxcY2xhc3NUb2dnbGVyLmpzXCIsXCIvY29tcG9uZW50c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qXG4gKiBDcmVhdGVkIGJ5IE1pY2hhZWwuU2VtY2hlbmtvXG4gKi9cblxuLyoqXG4gKiBDb21wb25lbnQgZm9yIGVudGl0aWVzIG1hbmFnZW1lbnQuXG4gKlxuICogQG1vZHVsZSBjb21wb25lbnRzL2VudGl0aWVzTWFuYWdlclxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkKSB7XG5cbiAgZnVuY3Rpb24gRW50ZXRpZXNNYW5hZ2VyKF9vcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7XG4gICAgICBpdGVtczoge1xuICAgICAgICBzeW5vcHNpczogW10sXG4gICAgICAgIHNoYXJlQnV0dG9uczogW11cbiAgICAgIH1cbiAgICB9LCBfb3B0aW9ucyk7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBpdGVtcyA9IHt9O1xuXG4gICAgLy8gSW5pdGlhbGl6YXRpb24uXG4gICAgaW5pdCgpO1xuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2RzLlxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICBpdGVtcyA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge1xuICAgICAgICBpdGVtczoge31cbiAgICAgIH0sIF90aGlzLm9wdGlvbnMuaXRlbXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFyTGlzdChsaXN0TmFtZSkge1xuICAgICAgJChpdGVtc1tsaXN0TmFtZV0pLmVhY2goZnVuY3Rpb24gKGksIGl0ZW0pIHtcbiAgICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ2RldGFjaEV2ZW50cycpKSB7XG4gICAgICAgICAgaXRlbS5kZXRhY2hFdmVudHMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpdGVtc1tsaXN0TmFtZV0gPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRUb0xpc3QobGlzdE5hbWUsIG9iaikge1xuICAgICAgaXRlbXNbbGlzdE5hbWVdLnB1c2gob2JqKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRMaXN0KGxpc3ROYW1lKSB7XG4gICAgICBpZiAoaXRlbXMuaGFzT3duUHJvcGVydHkobGlzdE5hbWUpKSB7XG4gICAgICAgIHJldHVybiBpdGVtc1tsaXN0TmFtZV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUHVibGljIG1ldGhvZHMuXG4gICAgdGhpcy5jbGVhckxpc3QgPSBmdW5jdGlvbiAobGlzdE5hbWUpIHtcbiAgICAgIGNsZWFyTGlzdChsaXN0TmFtZSk7XG4gICAgfTtcblxuICAgIHRoaXMuYWRkVG9MaXN0ID0gZnVuY3Rpb24gKGxpc3ROYW1lLCBvYmopIHtcbiAgICAgIGFkZFRvTGlzdChsaXN0TmFtZSwgb2JqKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRMaXN0ID0gZnVuY3Rpb24gKGxpc3ROYW1lKSB7XG4gICAgICBnZXRMaXN0KGxpc3ROYW1lKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIEVudGV0aWVzTWFuYWdlcjtcbn07XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJYcDZKVXhcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb21wb25lbnRzXFxcXGVudGl0aWVzTWFuYWdlci5qc1wiLFwiL2NvbXBvbmVudHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIENyZWF0ZWQgYnkgUHJpc2hjaGVwLkl2YW5cbiAqL1xuXG4vLyBUT0RPOiByZWZhY3RvcmluZyB0aGlzIG1vZHVsZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgICAgIGRhdGFBdHRyOiAnZGF0YS12aWRlby15b3V0dWJlLWlkJyxcbiAgICAgICAgYnRuQ2xhc3MgOiAnLnZpZGVvLXRodW1iJyxcbiAgICAgICAgb3BlbkNsYXNzIDogJ29wZW4nLFxuICAgICAgICBkZWxheTogNjAwLFxuICAgICAgICBzY3JvbGxpbmdUb3A6IGZhbHNlLFxuICAgICAgICBpbmRpdmlkdWFsUGxheWVyc0NvbnRhaW5lcjogJy52aWV3LWNvbnRlbnQnLFxuICAgICAgICBlbmFibGVBSkFYOiB0cnVlLFxuICAgICAgICB1cGRhdGVBSkFYU2VsZWN0b3I6IG51bGwsXG4gICAgICAgIG9uQmVmb3JlRWFjaEluaXQ6IG51bGwsIC8vIFskaXRlbTogalF1ZXJ5IE9iamVjdF1cbiAgICAgICAgb25TdG9wQ2FsbGJhY2s6IG51bGwsIC8vIFskaXRlbTogalF1ZXJ5IE9iamVjdCwgaXNQbGF5OiAwIC0gc3RvcCwgMSAtIHBsYXkgXVxuICAgICAgICBvblBsYXlDYWxsYmFjazogbnVsbCAgLy8gWyRpdGVtOiBqUXVlcnkgT2JqZWN0LCBpc1BsYXk6IDAgLSBzdG9wLCAxIC0gcGxheSBdXG4gICAgfTtcblxuICAgIHZhciBtZXRob2RzID0ge1xuICAgICAgICBwbGF5ZXJzOiBbXSxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICAgICAgICAgICAgc2V0dGluZ3MgPSAkLmV4dGVuZCggc2V0dGluZ3MsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuZW5hYmxlQUpBWCkge1xuXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MudXBkYXRlQUpBWFNlbGVjdG9yID0gdGhpcy5zZWxlY3RvciA7XG5cbiAgICAgICAgICAgICAgICBpZiAoRHJ1cGFsLmJlaGF2aW9ycyAmJiAgRHJ1cGFsLmJlaGF2aW9ycy5sYXRlc3ROZXdzKSB7XG4gICAgICAgICAgICAgICAgICAgIERydXBhbC5iZWhhdmlvcnMubGF0ZXN0TmV3cy51cGRhdGVZVFBsYXllciA9IG1ldGhvZHMudXBkYXRlWVRQbGF5ZXIuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gJHRoaXMuZGF0YSgnaW1heFBsYXllcicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFkYXRhICYmIHR5cGVvZiBZVCAhPSBcInVuZGVmaW5lZFwiICAmJiB0eXBlb2YgWVQuUGxheWVyID09ICdmdW5jdGlvbicpIHtcblxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3Mub25CZWZvcmVFYWNoSW5pdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5vbkJlZm9yZUVhY2hJbml0KCR0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoJ2ltYXhQbGF5ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6ICR0aGlzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmlkZW9JZCA9ICR0aGlzLmF0dHIoc2V0dGluZ3MuZGF0YUF0dHIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmlkZW9JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9uU3RhdGVDaGFuZ2VDYWxsYmFjayA9IHRocm90dGxlKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggZXZlbnQuZGF0YSAgPT0gMiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzLm9uU3RvcC5hcHBseSgkdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHRoaXMucGxheWVyID0gbmV3IFlULlBsYXllcih2aWRlb0lkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb0lkOiB2aWRlb0lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiBvblN0YXRlQ2hhbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wbGF5ZXJzLnB1c2goJHRoaXMucGxheWVyKTtcblxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5maW5kKHNldHRpbmdzLmJ0bkNsYXNzKS5vbignY2xpY2suaW1heFBsYXllcicsIG1ldGhvZHMub25QbGF5LmJpbmQoJHRoaXMpICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdpbWF4UGxheWVyJyk7XG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnVuYmluZCgnLmltYXhQbGF5ZXInKTtcbiAgICAgICAgICAgICAgICBkYXRhLmltYXhQbGF5ZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlRGF0YSgnaW1heFBsYXllcicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNjcm9sbFRvUGxheWVyOiBmdW5jdGlvbigkdGhpcyl7XG4gICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHtzY3JvbGxUb3A6ICR0aGlzLm9mZnNldCgpLnRvcCAtICQoJyNuYXZiYXInKS5oZWlnaHQoKSAtICQoJyNhZG1pbi1tZW51JykuaGVpZ2h0KCkgfSwgMzAwKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2Nyb2xsVG9CYWNrOiBmdW5jdGlvbigkdGhpcyl7XG4gICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHtzY3JvbGxUb3A6ICR0aGlzLm9mZnNldCgpLnRvcCAtICR0aGlzLmhlaWdodCgpIC0gJCgnI25hdmJhcicpLmhlaWdodCgpIC0gJCgnI2FkbWluLW1lbnUnKS5oZWlnaHQoKSB9LCAzMDApO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVZVFBsYXllcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChpc1lvdVR1YmVQbGF5ZXJBUElSZWFkeSkge1xuICAgICAgICAgICAgICAgIGpRdWVyeSggc2V0dGluZ3MudXBkYXRlQUpBWFNlbGVjdG9yICkuaW1heFBsYXllcihzZXR0aW5ncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uU3RvcDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICggc2V0dGluZ3Muc2Nyb2xsaW5nVG9wICkgbWV0aG9kcy5zY3JvbGxUb0JhY2sodGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3Moc2V0dGluZ3Mub3BlbkNsYXNzKTtcblxuICAgICAgICAgICAgdGhpcy5maW5kKHNldHRpbmdzLmJ0bkNsYXNzKS5yZW1vdmVDbGFzcyhzZXR0aW5ncy5vcGVuQ2xhc3MpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLm9uU3RvcENhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5vblN0b3BDYWxsYmFjayggJChfdGhpcyksIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvblBsYXk6IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgbWV0aG9kcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICAgICAgaWYoIHR5cGVvZiBpdGVtLnBhdXNlVmlkZW8gIT0gJ2Z1bmN0aW9uJyApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpdGVtLnBhdXNlVmlkZW8oKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcyhzZXR0aW5ncy5vcGVuQ2xhc3MpO1xuXG4gICAgICAgICAgICBpZiAoIHNldHRpbmdzLnNjcm9sbGluZ1RvcCApIG1ldGhvZHMuc2Nyb2xsVG9QbGF5ZXIodGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3Moc2V0dGluZ3Mub3BlbkNsYXNzKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5vblN0b3BDYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Mub25QbGF5Q2FsbGJhY2soICQoX3RoaXMpLCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5wbGF5ZXIucGxheVZpZGVvKCk7XG4gICAgICAgICAgICB9LCBzZXR0aW5ncy5kZWxheSApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICB2YXIgaXNZb3VUdWJlUGxheWVyQVBJUmVhZHkgPSBmYWxzZTtcbiAgICB3aW5kb3cub25Zb3VUdWJlUGxheWVyQVBJUmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaXNZb3VUdWJlUGxheWVyQVBJUmVhZHkgPSB0cnVlO1xuICAgICAgICBtZXRob2RzLnVwZGF0ZVlUUGxheWVyKCk7XG4gICAgfTtcblxuICAgIC8vIExvYWQgdGhlIElGcmFtZSBQbGF5ZXIgQVBJIGNvZGUgYXN5bmNocm9ub3VzbHkuXG4gICAgdmFyIHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHRhZy5zcmMgPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3BsYXllcl9hcGlcIjtcbiAgICB2YXIgZmlyc3RTY3JpcHRUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gICAgZmlyc3RTY3JpcHRUYWcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGFnLCBmaXJzdFNjcmlwdFRhZyk7XG5cbiAgICBmdW5jdGlvbiB0aHJvdHRsZShmdW5jLCBtcykge1xuXG4gICAgICAgIHZhciBpc1Rocm90dGxlZCxcbiAgICAgICAgICAgIHNhdmVkQXJncztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVyKCkge1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgYXJndW1lbnRzXG4gICAgICAgICAgICBzYXZlZEFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgICAgIGlmICghaXNUaHJvdHRsZWQpIHtcbiAgICAgICAgICAgICAgICBpc1Rocm90dGxlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpc1Rocm90dGxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2F2ZWRBcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jLmFwcGx5KHRoaXMsIHNhdmVkQXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlZEFyZ3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdyYXBwZXI7XG4gICAgfVxuXG4gICAgJC5mbi5pbWF4UGxheWVyID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICBpZiAobWV0aG9kc1ttZXRob2RdKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXRob2QgPT09ICdvYmplY3QnIHx8ICFtZXRob2QpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQuZXJyb3IoJ01ldGhvZCBcIicgKyBtZXRob2QgKyAnXCIgbm90IGZvdW5kJyk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFxpbWF4UGxheWVyLmpzXCIsXCIvY29tcG9uZW50c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qXG4gKiBDcmVhdGVkIGJ5IE1pY2hhZWwuU2VtY2hlbmtvXG4gKi9cblxuLyoqXG4gKiBUcmlnZ2VycyBldmVudHMgYnkgcmVzaXplIHRvIGJyZWFrcG9pbnRzXG4gKlxuICogQG1vZHVsZSBjb21wb25lbnRzL1Jlc2l6ZUVtaXR0ZXJcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJCkge1xuXG4gIGZ1bmN0aW9uIFJlc2l6ZUVtaXR0ZXIoX29wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHtcbiAgICAgIGV2ZW50TmFtZTogJ2JyZWFrcG9pbnQnLFxuICAgICAgYnJlYWtwb2ludHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHZpZXdwb3J0V2lkdGg6IDAsXG4gICAgICAgICAgZXZlbnRUeXBlOiAnbW9iaWxlJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdmlld3BvcnRXaWR0aDogNzY4LFxuICAgICAgICAgIGV2ZW50VHlwZTogJ3RhYmxldCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHZpZXdwb3J0V2lkdGg6IDk5MSxcbiAgICAgICAgICBldmVudFR5cGU6ICdkZXNrdG9wJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdmlld3BvcnRXaWR0aDogMTQ0MCxcbiAgICAgICAgICBldmVudFR5cGU6ICdkZXNrdG9wV2lkZSdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sIF9vcHRpb25zKTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyICRnbG9iYWxDb250ZXh0ID0gJCh3aW5kb3cpO1xuICAgIHZhciBvYmpMaW5rcyA9IFtdO1xuICAgIHZhciBsYXN0QnJlYWtQb2ludFdpZHRoID0gLTE7XG5cbiAgICAvLyBJbml0aWFsaXphdGlvbjtcbiAgICBpbml0KCk7XG5cbiAgICAvLyBQcml2YXRlIG1ldGhvZHM7XG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIG9iakxpbmtzID0gX3RoaXMub3B0aW9ucy5icmVha3BvaW50cy5zb3J0KHNvcnRCeVZpZXdwb3J0V2lkdGgpO1xuICAgICAgJGdsb2JhbENvbnRleHQub24oJ3Jlc2l6ZS5icmVha3BvaW50JywgZnVuY3Rpb24oZSwgZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmhhcmRUcmlnZ2VyID09PSB0cnVlKSB7XG4gICAgICAgICAgY2hlY2tTdGF0ZSh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGVja1N0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY2hlY2tTdGF0ZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrU3RhdGUoaXNIYXJkVHJpZ2dlcikge1xuICAgICAgdmFyIGN1cnJWaWV3cG9ydFdpZHRoID0gJGdsb2JhbENvbnRleHQud2lkdGgoKTtcbiAgICAgIHZhciBjdXJyQnJlYWtwb2ludCA9IGdldEN1cnJlbnRCcmVha3BvaW50KGN1cnJWaWV3cG9ydFdpZHRoKTtcbiAgICAgIGlmIChsYXN0QnJlYWtQb2ludFdpZHRoID09PSAtMSkgeyAvLyBGaXJzdCB0cmlnZ2VyLlxuICAgICAgICBpc0hhcmRUcmlnZ2VyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0hhcmRUcmlnZ2VyID09PSB0cnVlIHx8IGN1cnJCcmVha3BvaW50LnZpZXdwb3J0V2lkdGggIT0gbGFzdEJyZWFrUG9pbnRXaWR0aCkge1xuICAgICAgICAkLmV2ZW50LnRyaWdnZXIoe1xuICAgICAgICAgIHR5cGU6IF90aGlzLm9wdGlvbnMuZXZlbnROYW1lLFxuICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKClcbiAgICAgICAgfSwgY3VyckJyZWFrcG9pbnQuZXZlbnRUeXBlKTtcbiAgICAgICAgbGFzdEJyZWFrUG9pbnRXaWR0aCA9IGN1cnJCcmVha3BvaW50LnZpZXdwb3J0V2lkdGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc29ydEJ5Vmlld3BvcnRXaWR0aChhLCBiKSB7XG4gICAgICBpZiAoYS52aWV3cG9ydFdpZHRoIDwgYi52aWV3cG9ydFdpZHRoKVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgICBpZiAoYS52aWV3cG9ydFdpZHRoID4gYi52aWV3cG9ydFdpZHRoKVxuICAgICAgICByZXR1cm4gMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRCcmVha3BvaW50KGN1cnJSZXNvbHV0aW9uKSB7XG4gICAgICB2YXIgY3VyckJyZWFrcG9pbnQ7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iakxpbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjdXJyUmVzb2x1dGlvbiA+IG9iakxpbmtzW2ldLnZpZXdwb3J0V2lkdGgpIHtcbiAgICAgICAgICBjdXJyQnJlYWtwb2ludCA9IG9iakxpbmtzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VyckJyZWFrcG9pbnQ7XG4gICAgfVxuXG4gICAgLy8gUHVibGljIG1ldGhvZHNcbiAgICB0aGlzLmRldGFjaEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRnbG9iYWxDb250ZXh0Lm9mZigncmVzaXplLmJyZWFrcG9pbnQnKTtcbiAgICB9O1xuXG4gICAgdGhpcy50cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjaGVja1N0YXRlKHRydWUpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gUmVzaXplRW1pdHRlcjtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFxyZXNpemVFbWl0dGVyLmpzXCIsXCIvY29tcG9uZW50c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qXG4gKiBDcmVhdGVkIGJ5IE1pY2hhZWwuU2VtY2hlbmtvXG4gKi9cblxuLyoqXG4gKiBTZWFyY2ggbG9naWMgZm9yIGRlc2t0b3BcbiAqXG4gKiBAbW9kdWxlIGNvbXBvbmVudHMvc2VhcmNoRGVza3RvcFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkKSB7XG5cbiAgZnVuY3Rpb24gU2VhcmNoRGVza3RvcChfb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge1xuICAgICAgZGF0YUF0dHJUeXBlOiAndHlwZScsXG4gICAgICBkYXRhQXR0ckNvdW50OiAnY291bnQnLFxuICAgICAgYWN0aXZlQ2xhc3M6ICdhY3RpdmUnLFxuICAgICAgZmFjZXRJdGVtOiAnI2ZhY2V0cy1ibG9jayBsaScsXG4gICAgICByZXN1bHRzQ29udGFpbmVyOiAnLnNlYXJjaC1vdmVybGF5IC52aWV3LWNvbnRlbnQnLFxuICAgICAgaGVhZGVyczogJ2gzJyxcbiAgICAgIHNjcm9sbER1cmF0aW9uOiA3MDBcbiAgICB9LCBfb3B0aW9ucyk7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSW5pdGlhbGl6YXRpb247XG4gICAgaW5pdCgpO1xuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2RzO1xuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICAgIHZhciAkcmVzdWx0c0NvbnRhaW5lciA9ICQoX3RoaXMub3B0aW9ucy5yZXN1bHRzQ29udGFpbmVyKTtcbiAgICAgIHZhciAkZmFjZXRJdGVtcyA9ICQoX3RoaXMub3B0aW9ucy5mYWNldEl0ZW0pO1xuXG4gICAgICAkZmFjZXRJdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBmYWNldCkge1xuICAgICAgICB2YXIgJGN1cnJlbnRGYWNldCA9ICQoZmFjZXQpO1xuICAgICAgICB2YXIgZmFjZXRUeXBlID0gJGN1cnJlbnRGYWNldC5kYXRhKF90aGlzLm9wdGlvbnMuZGF0YUF0dHJUeXBlKTtcbiAgICAgICAgdmFyIGNvdW50ID0gJGN1cnJlbnRGYWNldC5kYXRhKF90aGlzLm9wdGlvbnMuZGF0YUF0dHJDb3VudCk7XG4gICAgICAgIHZhciAkY3VyckhlYWRlcjtcbiAgICAgICAgaWYgKGZhY2V0VHlwZSAhPSAnQWxsJykge1xuICAgICAgICAgIC8vIEdldCBoZWFkZXIncyB0eXBlIGZyb20gdGhlIHJvdyBhZnRlciBoZWFkZXIuXG4gICAgICAgICAgJGN1cnJIZWFkZXIgPSAkcmVzdWx0c0NvbnRhaW5lci5maW5kKCdbZGF0YS0nICsgX3RoaXMub3B0aW9ucy5kYXRhQXR0clR5cGUgKyAnPVwiJyArIGZhY2V0VHlwZSArICdcIl0nKS5wYXJlbnQoKS5wcmV2KF90aGlzLm9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgdmFyIHRpdGxlID0gJGN1cnJIZWFkZXIudGV4dCgpO1xuICAgICAgICAgICRjdXJySGVhZGVyLnRleHQodGl0bGUgKyAnICgnICsgY291bnQgKyAnKScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEFsbCBpdGVtcy5cbiAgICAgICAgICAkY3VyckhlYWRlciA9ICRyZXN1bHRzQ29udGFpbmVyLmZpbmQoX3RoaXMub3B0aW9ucy5oZWFkZXJzKS5maXJzdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGN1cnJlbnRGYWNldC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCRjdXJyZW50RmFjZXQuaGFzQ2xhc3MoX3RoaXMub3B0aW9ucy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkZmFjZXRJdGVtcy5yZW1vdmVDbGFzcyhfdGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAkY3VycmVudEZhY2V0LmFkZENsYXNzKF90aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuXG4gICAgICAgICAgLy8gU2Nyb2xsIHRvIGVsZW1lbnQ7XG4gICAgICAgICAgJHJlc3VsdHNDb250YWluZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6ICgkY3VyckhlYWRlci5wb3NpdGlvbigpLnRvcCArICRyZXN1bHRzQ29udGFpbmVyLnNjcm9sbFRvcCgpKVxuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuc2Nyb2xsRHVyYXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBTZWFyY2hEZXNrdG9wO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJYcDZKVXhcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb21wb25lbnRzXFxcXHNlYXJjaERlc2t0b3AuanNcIixcIi9jb21wb25lbnRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypcbiAqIENyZWF0ZWQgYnkgTWljaGFlbC5TZW1jaGVua29cbiAqL1xuXG4vKipcbiAqIFNlYXJjaCBsb2dpYyBmb3IgbW9iaWxlXG4gKlxuICogQG1vZHVsZSBjb21wb25lbnRzL3NlYXJjaERlc2t0b3BcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJCkge1xuXG4gIGZ1bmN0aW9uIFNlYXJjaE1vYmlsZShfb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge1xuICAgICAgZGF0YUF0dHJUeXBlOiAndHlwZScsXG4gICAgICBkYXRhQXR0ckNvdW50OiAnY291bnQnLFxuICAgICAgZmFjZXRJdGVtOiAnI2ZhY2V0cy1ibG9jayBsaScsXG4gICAgICByZXN1bHRzQ29udGFpbmVyOiAnLnNlYXJjaC1vdmVybGF5IC52aWV3LWNvbnRlbnQnLFxuICAgICAgaGVhZGVyczogJ2gzJyxcbiAgICAgIGRhdGFTb3VyY2U6ICcjbW9yZS1kYXRhLXNvdXJjZScsXG4gICAgICBwcmVsb2FkZXI6ICcjc2VhcmNoLW1vcmUtcHJlbG9hZGVyJyxcbiAgICAgIGxvYWRNb3JlVVJMOiAnL25vanMvc2VhcmNoLXZpZXcnLFxuICAgICAgcHJvY2Vzc2VkQ2xhc3M6ICdwcm9jZXNzZWQnXG4gICAgfSwgX29wdGlvbnMpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgJHJlc3VsdHNDb250YWluZXIsICRmYWNldEl0ZW1zLCAkaGVhZGVycywgdHlwZXMsICRkYXRhU291cmNlLCAkcHJlbG9hZGVyLCBpc0xvY2tlZDtcblxuICAgIC8vIEluaXRpYWxpemF0aW9uO1xuICAgIGluaXQoKTtcblxuICAgIC8vIFByaXZhdGUgbWV0aG9kcztcbiAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICRwcmVsb2FkZXIgPSAkKF90aGlzLm9wdGlvbnMucHJlbG9hZGVyKTtcbiAgICAgICRyZXN1bHRzQ29udGFpbmVyID0gJChfdGhpcy5vcHRpb25zLnJlc3VsdHNDb250YWluZXIpO1xuICAgICAgJGZhY2V0SXRlbXMgPSAkKF90aGlzLm9wdGlvbnMuZmFjZXRJdGVtKTtcbiAgICAgICRyZXN1bHRzQ29udGFpbmVyLnNjcm9sbFRvcCgwKTtcbiAgICAgICRyZXN1bHRzQ29udGFpbmVyLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkcmVzdWx0c0NvbnRhaW5lci5zY3JvbGxUb3AoKSArIDEuNSAqICRyZXN1bHRzQ29udGFpbmVyLm91dGVySGVpZ2h0KCkgPiAkcmVzdWx0c0NvbnRhaW5lclswXS5zY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICBzZW5kUXVlcnkoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHR5cGVzID0ge307XG5cbiAgICAgICRmYWNldEl0ZW1zLmVhY2goZnVuY3Rpb24gKGksIGZhY2V0KSB7XG4gICAgICAgIHZhciAkZmFjZXQgPSAkKGZhY2V0KTtcbiAgICAgICAgdHlwZXNbJGZhY2V0LmRhdGEoX3RoaXMub3B0aW9ucy5kYXRhQXR0clR5cGUpXSA9IHtcbiAgICAgICAgICBjb3VudDogJGZhY2V0LmRhdGEoX3RoaXMub3B0aW9ucy5kYXRhQXR0ckNvdW50KSxcbiAgICAgICAgICBpc0FscmVhZHlFeGlzdEhlYWRlcjogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICByZWZyZXNoKCk7XG4gICAgICBpZiAoRHJ1cGFsLmFqYXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBEcnVwYWwuYWpheC5wcm90b3R5cGUuY29tbWFuZHMuc2VhcmNoTG9hZE1vcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICAgIHVubG9jaygpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlZnJlc2goKSB7XG4gICAgICAvLyBFcmFzZSBoZWFkZXJzIHN0YXRlcy5cbiAgICAgIGZvciAodmFyIHR5cGUgaW4gdHlwZXMpIHtcbiAgICAgICAgdHlwZXNbdHlwZV0uaXNBbHJlYWR5RXhpc3RIZWFkZXIgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgJGRhdGFTb3VyY2UgPSAkKF90aGlzLm9wdGlvbnMuZGF0YVNvdXJjZSk7XG5cbiAgICAgICRoZWFkZXJzID0gJHJlc3VsdHNDb250YWluZXIuZmluZChfdGhpcy5vcHRpb25zLmhlYWRlcnMpO1xuICAgICAgJGhlYWRlcnMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgdmFyICRoZWFkZXIgPSAkKGVsKTtcbiAgICAgICAgLy8gR2V0IGhlYWRlcidzIHR5cGUgZnJvbSB0aGUgcm93IGFmdGVyIGhlYWRlci5cbiAgICAgICAgdmFyIGl0ZW1UeXBlID0gJGhlYWRlci5kYXRhKF90aGlzLm9wdGlvbnMuZGF0YUF0dHJUeXBlKSA/ICRoZWFkZXIuZGF0YShfdGhpcy5vcHRpb25zLmRhdGFBdHRyVHlwZSkgOiAkaGVhZGVyLm5leHQoKS5jaGlsZHJlbigpLmRhdGEoX3RoaXMub3B0aW9ucy5kYXRhQXR0clR5cGUpO1xuXG5cbiAgICAgICAgaWYgKCRoZWFkZXIuaGFzQ2xhc3MoX3RoaXMub3B0aW9ucy5wcm9jZXNzZWRDbGFzcykpIHtcbiAgICAgICAgICB0eXBlc1tpdGVtVHlwZV0uaXNBbHJlYWR5RXhpc3RIZWFkZXIgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCF0eXBlc1tpdGVtVHlwZV0uaXNBbHJlYWR5RXhpc3RIZWFkZXIpIHtcbiAgICAgICAgICAkaGVhZGVyLmF0dHIoJ2RhdGEtJyArIF90aGlzLm9wdGlvbnMuZGF0YUF0dHJUeXBlLCBpdGVtVHlwZSk7XG4gICAgICAgICAgLy8gU2V0IGNvdW50IGluIGhlYWRlcnMuXG4gICAgICAgICAgJGhlYWRlci50ZXh0KCRoZWFkZXIudGV4dCgpICsgJyAoJyArIHR5cGVzW2l0ZW1UeXBlXS5jb3VudCArICcpJyk7XG4gICAgICAgICAgJGhlYWRlci5hZGRDbGFzcyhfdGhpcy5vcHRpb25zLnByb2Nlc3NlZENsYXNzKTtcbiAgICAgICAgICB0eXBlc1tpdGVtVHlwZV0uaXNBbHJlYWR5RXhpc3RIZWFkZXIgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVkIGhlYWRlcnMuXG4gICAgICAgICAgJGhlYWRlci5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VuZFF1ZXJ5KCkge1xuICAgICAgaWYgKCFpc0xvY2tlZCAmJiAkZGF0YVNvdXJjZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgbG9jaygpO1xuICAgICAgICB2YXIgcGFnZSA9ICRkYXRhU291cmNlLmRhdGEoJ3BhZ2UnKTtcbiAgICAgICAgdmFyIGtleXMgPSAkZGF0YVNvdXJjZS5kYXRhKCdrZXlzJyk7XG4gICAgICAgIHZhciBsb2FkTW9yZVVybCA9IF90aGlzLm9wdGlvbnMubG9hZE1vcmVVUkw7XG4gICAgICAgIHZhciBhamF4ID0gbmV3IERydXBhbC5hamF4KGZhbHNlLCBmYWxzZSwge3VybDogbG9hZE1vcmVVcmwsIHN1Ym1pdDoge1xuICAgICAgICAgIGtleXM6IGtleXMsXG4gICAgICAgICAgY3VyX3BhZ2U6IHBhZ2VcbiAgICAgICAgfX0pO1xuICAgICAgICBhamF4LmV2ZW50UmVzcG9uc2UoYWpheCwge30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvY2soKSB7XG4gICAgICBpc0xvY2tlZCA9IHRydWU7XG4gICAgICAkcHJlbG9hZGVyLnNob3coKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bmxvY2soKSB7XG4gICAgICBpc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgJHByZWxvYWRlci5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFNlYXJjaE1vYmlsZTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFxzZWFyY2hNb2JpbGUuanNcIixcIi9jb21wb25lbnRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypcbiAqIENyZWF0ZWQgYnkgTWljaGFlbC5TZW1jaGVua29cbiAqL1xuXG4vKipcbiAqIEN1c3RvbSBzZWxlY3Qgd3JhcHBlci5cbiAqXG4gKiBAbW9kdWxlIGNvbXBvbmVudHMvc2VsZWN0Qm94XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCQpIHtcblxuICBmdW5jdGlvbiBTZWxlY3RCb3goc2VsZWN0b3IsIF9vcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0galF1ZXJ5LmV4dGVuZCh0cnVlLCB7XG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjdXN0b20tc2VsZWN0Ym94XCI+PHNwYW4gY2xhc3M9XCJzZWxlY3RlZC10aXRsZVwiPjwvc3Bhbj48L2Rpdj4nLFxuICAgICAgdHBsVGl0bGU6ICcuc2VsZWN0ZWQtdGl0bGUnLFxuICAgICAgdHBsV3JhcHBlckNsYXNzOiAnY3VzdG9tLXNlbGVjdGJveCcsXG4gICAgICBvcHRpb25UZXh0UHJlcHJvY2VzczogZnVuY3Rpb24gKG9wdFRleHQpIHtcbiAgICAgICAgcmV0dXJuIG9wdFRleHQ7XG4gICAgICB9XG4gICAgfSwgX29wdGlvbnMpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgJHNlbGVjdEJveCwgJHdyYXBwZXIsICRvdXRlcldyYXBwZXIsICR0aXRsZSwgJG9wdGlvbnM7XG5cbiAgICAvLyBJbml0aWFsaXphdGlvbjtcbiAgICBpbml0KCk7XG5cbiAgICAvLyBQcml2YXRlIG1ldGhvZHM7XG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgPyBzZWxlY3RvciA6ICdzZWxlY3QnO1xuICAgICAgJHNlbGVjdEJveCA9ICQoc2VsZWN0b3IpO1xuICAgICAgaWYgKCRzZWxlY3RCb3gubGVuZ3RoID09PSAwIHx8ICRzZWxlY3RCb3gucGFyZW50KCkuaGFzQ2xhc3MoX3RoaXMub3B0aW9ucy50cGxXcmFwcGVyQ2xhc3MpKSByZXR1cm47XG4gICAgICAkb3B0aW9ucyA9ICRzZWxlY3RCb3guZmluZCgnb3B0aW9uJyk7XG4gICAgICAkd3JhcHBlciA9ICQoX3RoaXMub3B0aW9ucy50ZW1wbGF0ZSk7XG4gICAgICAkdGl0bGUgPSAkd3JhcHBlci5maW5kKF90aGlzLm9wdGlvbnMudHBsVGl0bGUpO1xuICAgICAgJG91dGVyV3JhcHBlciA9ICQoJHNlbGVjdEJveC5wYXJlbnQoKSk7XG4gICAgICB3cmFwKCk7XG4gICAgICBwcmVwcm9jZXNzKCk7XG4gICAgICB1cGRhdGVUaXRsZSgpO1xuICAgICAgJHNlbGVjdEJveC5vbignY2hhbmdlJywgdXBkYXRlVGl0bGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZXByb2Nlc3MoKSB7XG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKF90aGlzLm9wdGlvbnMub3B0aW9uVGV4dFByZXByb2Nlc3MpKSB7XG4gICAgICAgICRvcHRpb25zLmVhY2goZnVuY3Rpb24gKGksIG9wdGlvbikge1xuICAgICAgICAgIHZhciAkb3B0aW9uID0gJChvcHRpb24pO1xuICAgICAgICAgICRvcHRpb24udGV4dChfdGhpcy5vcHRpb25zLm9wdGlvblRleHRQcmVwcm9jZXNzKCRvcHRpb24udGV4dCgpKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgICAkc2VsZWN0Qm94LmJlZm9yZSgkd3JhcHBlcik7XG4gICAgICAkc2VsZWN0Qm94LnByZXBlbmRUbygkd3JhcHBlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVGl0bGUoKSB7XG4gICAgICAkdGl0bGUudGV4dCgkc2VsZWN0Qm94LmZpbmQoJzpjaGVja2VkJykudGV4dCgpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gU2VsZWN0Qm94O1xufTtcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIlhwNkpVeFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NvbXBvbmVudHNcXFxcc2VsZWN0Qm94LmpzXCIsXCIvY29tcG9uZW50c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICogQ3JlYXRlZCBieSBBbnRvbi5GaWxpblxuICovXG5cbi8qKlxuICogTW9kdWxlIGFkZCBzdWJzY3JpYmUgZm9ybVxuICpcbiAqIEBtb2R1bGUgY29tcG9uZW50cy9zdWJzY3JpYmVcbiAqIEByZXR1cm5zIENvbnN0cnVjdG9yXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciBDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKGlkRWwpe1xuICAgICAgICB0aGlzLiRkb2N1bWVudCA9ICQoZG9jdW1lbnQpO1xuICAgICAgICB0aGlzLiR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gICAgICAgIHRoaXMud3JhcHBlciA9ICQoJy50aGVtZS1pbWF4Jyk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gJCh0aGlzLndyYXBwZXIpLmZpbmQoJy5tYWluLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIHRoaXMuaW5pdFNjcm9sbCA9IHRoaXMuJHdpbmRvdy5zY3JvbGxUb3AoKTtcblxuICAgICAgICB0aGlzLmVsID0gaWRFbDtcbiAgICAgICAgdGhpcy5zdWJtaXRDdXN0b20gPSAnLnN1Ym1pdF9mb3JtLS1jdXN0b20nO1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5oaWRlU2lkZWJhckVsZW0oKTtcbiAgICAgICAgdGhpcy5kYXRhUGFnZSgpO1xuICAgICAgICB0aGlzLmV2ZW50cygpO1xuICAgIH07XG5cbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZGF0YVBhZ2UgPSBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLnNjcm9sbF9wb3MgPSB0aGlzLiR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHRoaXMud2luX2hlaWdodCA9IHRoaXMuJHdpbmRvdy5oZWlnaHQoKTtcbiAgICAgICAgdGhpcy5kb2NfaGVpZ2h0ID0gdGhpcy4kZG9jdW1lbnQuaGVpZ2h0KCk7XG4gICAgICAgIHRoaXMuZm9vdGVyX2hlaWdodCA9ICQoJ2Zvb3RlcicpLm91dGVySGVpZ2h0KCk7XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5jcmVhdGVET00gPSBmdW5jdGlvbigpe1xuICAgICAgICAkKHRoaXMuZWwpLmZpbmQodGhpcy5zdWJtaXRDdXN0b20pLmF0dHIoJ2lkJywgJ25vU3VibWl0Jyk7XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5ldmVudHMgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIHRoaXMuJGRvY3VtZW50LmZpbmQoJCh0aGlzLmVsKSkub24oJ2NsaWNrIHRvdWNoc3RhcnQnLCAnI25vU3VibWl0JywgdGhpcy5zaG93Rm9ybS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy4kZG9jdW1lbnQuZmluZCgkKHRoaXMuZWwpKS5vbigndG91Y2htb3ZlJywgJyNlZGl0LXN1Ym1pdC1zdWJzY3JpYmUnLCB0aGlzLm5vTW92ZW1lbnQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy4kZG9jdW1lbnQuZmluZCgkKHRoaXMuZWwpKS5maW5kKFwiaW5wdXRbdHlwZT0ndGV4dCddXCIgKS5vbignY2xpY2sgdG91Y2hzdGFydCcsIHRoaXMuc2hvd0Zvcm0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy4kZG9jdW1lbnQuZmluZCgkKHRoaXMuZWwpKS5maW5kKFwiaW5wdXRbdHlwZT0ndGV4dCddXCIgKS5vbigna2V5ZG93biBjaGFuZ2UnLCB0aGlzLnJlbW92ZUVycm9yLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuJGRvY3VtZW50Lm9uKCdjbGljayB0b3VjaHN0YXJ0JywgdGhpcy5jbG9zZXN0LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuJGRvY3VtZW50LmZpbmQoJCh0aGlzLmVsKSkuZmluZChcImlucHV0W3R5cGU9J3RleHQnXVwiICkub24oJ2JsdXInLCB0aGlzLmNsb3NlRm9ybUJsdXIuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy4kZG9jdW1lbnQuZmluZCgkKHRoaXMuZWwpKS5maW5kKFwiaW5wdXRbdHlwZT0ndGV4dCddXCIgKS5vbignZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgICAgIHRoaXMua2V5Qm9hcmQgPSB0cnVlO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuJHdpbmRvdy5vbignYnJlYWtwb2ludCcsIHRoaXMuYnJlYWtwb2ludEN1cnJlbnQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy4kd2luZG93Lm9uKFwic2Nyb2xsLnRhcmdldFNjcm9sbFwiLCB0aGlzLnRhcmdldFNjcm9sbC5iaW5kKHRoaXMpKTtcblxuICAgIH07XG5cbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuYnJlYWtwb2ludEN1cnJlbnQgPSBmdW5jdGlvbihlLCB0eXBlKXtcbiAgICAgICAgdGhpcy5icmVha3BvaW50ID0gdHlwZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLnRhcmdldFNjcm9sbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKCB0aGlzLnRhcmdldFNjcm9sbEVuYWJsZSApIHJldHVybjtcbiAgICAgICAgaWYoICF0aGlzLmlzTW9iaWxlKCkgKSByZXR1cm47XG4gICAgICAgIGlmKCAhdGhpcy5pc1NpZGViYXIoKSApIHJldHVybjtcbiAgICAgICAgdGhpcy5zY3JvbGwgPSB0aGlzLiR3aW5kb3cuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgaWYoIHRoaXMuc2Nyb2xsID4gMSAmJiB0aGlzLmluaXRTY3JvbGwgIT0gdGhpcy5zY3JvbGwgKXtcbiAgICAgICAgICAgIHRoaXMuaW5pdFNjcm9sbCA9IDA7XG4gICAgICAgICAgICAkKHRoaXMuZWwpLmFkZENsYXNzKCdtb2JpbGVDbG9zZUZvcm0nKTtcbiAgICAgICAgICAgIGlmKHRoaXMuc2hvdyl7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5yZW1vdmVDbGFzcygnc2hvd0Zvcm0nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZURPTSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5maXhTaWRlYmFySW5faVBob25lKCkucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLnNob3dTaWRlYmFyID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maXhTaWRlYmFySW5faVBob25lKCkuYWRkKCk7XG4gICAgICAgIHRoaXMuc2hvd1NpZGViYXIgPSB0cnVlO1xuICAgICAgICAkKHRoaXMuZWwpLnJlbW92ZUNsYXNzKCdtb2JpbGVDbG9zZUZvcm0nKTtcblxuICAgIH07XG5cbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUubm9Nb3ZlbWVudCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLnNob3dGb3JtID0gZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgaWYodGhpcy5pc1N1Y2Nlc3MoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmKCB0aGlzLmlzU2lkZWJhcigpICYmICF0aGlzLnNob3cgKXtcblxuICAgICAgICAgICAgJCh0aGlzLmVsKS5yZW1vdmVDbGFzcygnbW9iaWxlQ2xvc2VGb3JtJyk7XG4gICAgICAgICAgICB0aGlzLmZpeFNpZGViYXJJbl9pUGhvbmUoKS5hZGQoKTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0U2Nyb2xsRW5hYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgICQodGhpcy5lbCkuYWRkQ2xhc3MoJ3Nob3dGb3JtJyk7XG5cbiAgICAgICAgdGhpcy5zaG93ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbmNyZWFzZUNvbnRlbnRDb250cm9sbGVyKCk7XG5cbiAgICAgICAgJCh0aGlzLmVsKS5maW5kKHRoaXMuc3VibWl0Q3VzdG9tKS5hdHRyKCdpZCcsICcnKTtcblxuICAgICAgICAkKGUudGFyZ2V0KS5mb2N1cygpO1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICggISQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5lbCkubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnRhcmdldFNjcm9sbEVuYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy4kZG9jdW1lbnQuZmluZCgkKHRoaXMuZWwpKS5maW5kKFwiaW5wdXRbdHlwZT0ndGV4dCddXCIgKS5ibHVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmNsb3NlRm9ybUJsdXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMua2V5Qm9hcmQgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLmtleUJvYXJkKXtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlRm9ybS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcyksIDEwMCk7XG4gICAgfTtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuY2xvc2VGb3JtID0gZnVuY3Rpb24oZSkge1xuXG4gICAgICAgIGlmKHRoaXMuaXNTaG93KCkpe1xuXG4gICAgICAgICAgICAkKHRoaXMuZWwpLnJlbW92ZUNsYXNzKCdzaG93Rm9ybScpLmFkZENsYXNzKCdtb2JpbGVDbG9zZUZvcm0nKTtcbiAgICAgICAgICAgIHRoaXMuZml4U2lkZWJhckluX2lQaG9uZSgpLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmluY3JlYXNlQ29udGVudENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRE9NKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLnJlbW92ZUVycm9yID0gZnVuY3Rpb24oZSkge1xuXG4gICAgICAgIGlmKHRoaXMuc2hvd1NpZGViYXIpIHtcbiAgICAgICAgICAgICQodGhpcy5lbCkucmVtb3ZlQ2xhc3MoJ21vYmlsZUNsb3NlRm9ybScpO1xuICAgICAgICAgICAgaWYoIXRoaXMuc2hvdykge1xuICAgICAgICAgICAgICAgIHRoaXMuZml4U2lkZWJhckluX2lQaG9uZSgpLmFkZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50YXJnZXRTY3JvbGxFbmFibGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh0aGlzLmVsKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcblxuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcblxuICAgICAgICB0aGlzLmluY3JlYXNlQ29udGVudENvbnRyb2xsZXIoKTtcblxuICAgICAgICAkKHRoaXMuZWwpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICQuZWFjaChlbGVtZW50LmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5hbWUuaW5kZXhPZignZGF0YS0nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLnJlbW92ZUF0dHIodGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5pbmNyZWFzZUNvbnRlbnRDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoICF0aGlzLmlzRm9vdGVyKCkgKSByZXR1cm47XG4gICAgICAgIGlmKCB0aGlzLmlzTW9iaWxlKCkgfHwgdGhpcy5pc1RhYmxldCgpICkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAodHJ1ZSl7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNFcnJvcigpICYmIHRoaXMuaXNTaG93KCk6XG4gICAgICAgICAgICAgICAgdGhpcy5pbmNyZWFzZUNvbnRlbnQoJzE5LjVlbScpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmlzRXJyb3IoKTpcbiAgICAgICAgICAgICAgICB0aGlzLmluY3JlYXNlQ29udGVudCgnMTYuNmVtJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNTaG93KCk6XG4gICAgICAgICAgICAgICAgdGhpcy5pbmNyZWFzZUNvbnRlbnQoJzE1LjZlbScpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmluY3JlYXNlQ29udGVudCgnJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5maXhTaWRlYmFySW5faVBob25lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZnVuY3Rpb24gYWRkKCl7XG4gICAgICAgICAgICBpZiggIXRoaXMuaXNJUGhvbmUoKSApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmKCF0aGlzLmlzU2lkZWJhcigpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUJvdHRvbVBYID0gdGhpcy5kb2NfaGVpZ2h0IC0gKHRoaXMud2luX2hlaWdodCArIHRoaXMuc2Nyb2xsX3BvcyApO1xuICAgICAgICAgICAgJCh0aGlzLmVsKS5jc3Moeydwb3NpdGlvbic6ICdhYnNvbHV0ZScsICdib3R0b20nOiB0aGlzLmNoYW5nZUJvdHRvbVBYLCBcInRyYW5zaXRpb25cIjogJ29wYWNpdHkgMC4ycyBlYXNlLWluIDBzLCB3aWR0aCAwLjRzIGVhc2UtaW4gMHMnfSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlKCl7XG4gICAgICAgICAgICAkKHRoaXMuZWwpLmNzcyh7XCJwb3NpdGlvblwiOiAnJywgXCJib3R0b21cIjogMH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhZGQ6IGFkZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgcmVtb3ZlOiByZW1vdmUuYmluZCh0aGlzKVxuICAgICAgICB9O1xuXG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5pbmNyZWFzZUNvbnRlbnQgPSBmdW5jdGlvbihhbXQsIGFuaW0pe1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5wYXJlbnQoKS5jc3MoeydwYWRkaW5nLWJvdHRvbSc6ICggYW10IHx8ICcnICl9KTtcbiAgICAgICAgdGhpcy5kYXRhUGFnZSgpO1xuICAgICAgICBpZihhbmltID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAkKFwiYm9keSwgaHRtbFwiKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogdGhpcy5kb2NfaGVpZ2h0XG4gICAgICAgIH0sIDMwMCk7XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5pc0Zvb3RlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiggJCh0aGlzLmVsKS5zZWxlY3Rvci5pbmRleE9mKCdmb290ZXItZm9ybScpID09PSAtMSApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmlzTW9iaWxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHRoaXMuYnJlYWtwb2ludCA9PT0gJ21vYmlsZScpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmlzVGFibGV0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHRoaXMuYnJlYWtwb2ludCA9PT0gJ3RhYmxldCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmlzU2lkZWJhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiggJCh0aGlzLmVsKS5zZWxlY3Rvci5pbmRleE9mKCdzaWRlYmFyLWZvcm0nKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5pc0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoISF0aGlzLmVycm9yKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuaXNTaG93ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoISF0aGlzLnNob3cpIHJldHVybiB0cnVlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5pc1N1Y2Nlc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZighIXRoaXMuc3VjY2VzcykgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmlzSVBob25lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoL2lQaG9uZS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmhpZGVTaWRlYmFyRWxlbSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIXRoaXMuaXNTaWRlYmFyKCkgKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5oaWRlID0gZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgdGhpcy5kYXRhUGFnZSgpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnNjcm9sbF9wb3MgKyB0aGlzLndpbl9oZWlnaHQgID4gdGhpcy5kb2NfaGVpZ2h0IC0gdGhpcy5mb290ZXJfaGVpZ2h0KXtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhpZGUuYXBwbHkodGhpcyk7XG5cbiAgICAgICAgdGhpcy4kd2luZG93LnNjcm9sbChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICBpZih0aGlzLmhpZGUuYXBwbHkodGhpcykpe1xuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuc2hvdygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmNhbGxiYWNrRm9ybSA9IGZ1bmN0aW9uKGFqYXgsIHJlc3BvbnNlLCBzdGF0dXMpe1xuXG4gICAgICAgIGlmKEFycmF5LmlzQXJyYXkocmVzcG9uc2UuZXJyb3JzKSl7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrRm9ybVN1Y2Nlc3MocmVzcG9uc2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhbGxiYWNrRm9ybUVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5jYWxsYmFja0Zvcm1FcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuICAgICAgICAkKHRoaXMuZWwpLmFkZENsYXNzKCdlcnJvcicpO1xuXG4gICAgICAgIHRoaXMuZXJyb3IgPSByZXNwb25zZS5lcnJvcnM7XG5cbiAgICAgICAgdGhpcy5pbmNyZWFzZUNvbnRlbnRDb250cm9sbGVyKCk7XG5cbiAgICAgICAgdmFyIGpvaW4gPSBmdW5jdGlvbihvYmosIHNlcGFyYXRvcikge1xuXG4gICAgICAgICAgICBpZiAoc2VwYXJhdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzZXBhcmF0b3IgPSAnLCAnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gd2luZG93Lk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikubWFwKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqW25hbWVdO1xuICAgICAgICAgICAgfS5iaW5kKG9iaikpLmpvaW4oc2VwYXJhdG9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICBTdHJpbmcucHJvdG90eXBlLmZpcnN0TGV0dGVyVG9VcHBlckNhc2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgICQodGhpcy5lbCkuYXR0cignZGF0YS1lcnJvcicsIGpvaW4odGhpcy5lcnJvciwgJywgJykudG9Mb3dlckNhc2UoKS5maXJzdExldHRlclRvVXBwZXJDYXNlKCkgKyAnLicpO1xuICAgIH07XG5cbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuY2FsbGJhY2tGb3JtU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuICAgICAgICB0aGlzLnN1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgICQodGhpcy5lbCkuYWRkQ2xhc3MoXCJzaG93QmxvY2tlZFwiKTtcblxuICAgICAgICAkKHRoaXMuZWwpLmNoaWxkcmVuKCkucHJlcGVuZChcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiZm9ybS10eXBlLXRleHRmaWVsZCBmb3JtLWl0ZW0tc3VjY2VzZSBmb3JtLWl0ZW0gZm9ybS1ncm91cFwiPicrXG4gICAgICAgICAgICAgICAgJzxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbCBmb3JtLXRleHQgcmVxdWlyZWRcIiB0eXBlPVwidGV4dFwiIGlkPVwic3VjY2VzZVwiIG5hbWU9XCJwb3N0YWxfY29kZVwiIHZhbHVlPVwiJysgcmVzcG9uc2UubWVzc2FnZSArICdcIiBzaXplPVwiNjBcIiBtYXhsZW5ndGg9XCI0MFwiIGRpc2FibGVkPicrXG4gICAgICAgICAgICAnPC9kaXY+J1xuICAgICAgICApO1xuXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMuZWwpLmZpbmQodGhpcy5zdWJtaXRDdXN0b20pLmF0dHIoJ2lkJywgJ25vU3VibWl0IGFkZGVkU1ZHJyk7XG4gICAgICAgICAgICAkKHRoaXMuZWwpLnJlbW92ZUNsYXNzKCdzaG93Rm9ybScpO1xuICAgICAgICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICAkKHRoaXMuZWwpLmFkZENsYXNzKCdjbG9zZVN1Y2Nlc2UnKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCAyMDApO1xuXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLiRkb2N1bWVudC5maW5kKCQodGhpcy5lbCkpLmFkZENsYXNzKCdtaW5XaWR0aCcpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XG5cbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcy5lbCkuYWRkQ2xhc3MoJ3NoYWRvd0dvaW5nJyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgNjAwKTtcblxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHBhdGggPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKycvLycrIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBvcnQ7XG5cbiAgICAgICAgICAgIHZhciBuYW1lU1ZHID0gKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNTaWRlYmFyKCkgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICd0aWNrX2ljb25fYmxhY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RpY2tfaWNvbic7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpKCk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5pbml0LlZpdnVzLm5ld1ZpdnVzKCdub1N1Ym1pdCBhZGRlZFNWRycsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNTAsXG4gICAgICAgICAgICAgICAgZmlsZTogcGF0aCArICcvc2l0ZXMvYWxsL3RoZW1lcy9pbWF4L2ltYWdlcy9zdmcvJyArIG5hbWVTVkcgKyAnLnN2ZydcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5hZGRDbGFzcygndGV4dFNob3cnKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpLCA4MDApO1xuICAgIH07XG5cbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG59O1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJYcDZKVXhcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb21wb25lbnRzXFxcXHN1YnNjcmliZS5qc1wiLFwiL2NvbXBvbmVudHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIENyZWF0ZWQgYnkgSXZhbi5QcmlzaGNoZXBcbiAqL1xuXG4vKipcbiAqIE1vZHVsZSBmb3IgZ29vZ2xlIGNvbnRyb2xzIG9mIG1hcC5cbiAqXG4gKiBAbW9kdWxlIGNvbXBvbmVudHMvc3dpdGNoZXJcbiAqIEByZXR1cm5zICBDb25zdHJ1Y3RvclxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBDb25zdHJ1Y3Rvcihfc2V0dGluZ3Mpe1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHtcbiAgICAgICAgICAgIHNlbGVjdG9yOiBudWxsLCAvLyBldmVudCB0cmlnZ2VyXG4gICAgICAgICAgICBkZWxlZ2F0ZVNlbGVjdG9yOiBudWxsLCAvLyBkZWxlZ2F0ZSBpdGVtc1xuICAgICAgICAgICAgY2xvc2VzdDogbnVsbCwgLy8gZmlyc3QgcGFyZW50cyBmb3IgZXZlbnQgdHJpZ2dlclxuICAgICAgICAgICAgdGFyZ2V0OiBudWxsLCAvLyB0YXJnZXQgZWxlbWVudCBmb3IgY2hhbmdlIGNsYXNzXG4gICAgICAgICAgICB0YXJnZXREZXBlbmRlbmNlIDogbnVsbCwgLy8gZGVwZW5kZW5jZSBlbGVtZW50XG4gICAgICAgICAgICB0YXJnZXREZXBlbmRlbmNlQ2xvc2VzdCA6IG51bGwsIC8vIGRlcGVuZGVuY2UgZWxlbWVudFxuICAgICAgICAgICAgY2xhc3NJbiA6ICdvcGVuJyxcbiAgICAgICAgICAgIGNsYXNzT3V0IDogJ2Nsb3NlJyxcbiAgICAgICAgICAgIGF0dHJUb0luQmcgOiAnZGF0YS1zd2l0Y2gtb24taW4tYmcnLCAvLyB1cmwgZm9lIGNoYW5nZSBiYWNrZ3JvdW5kXG4gICAgICAgICAgICBhdHRyVG9PdXRCZyA6ICdkYXRhLXN3aXRjaC1vbi1vdXQtYmcnLCAvLyB1cmwgZm9lIGNoYW5nZSBiYWNrZ3JvdW5kXG4gICAgICAgICAgICBldmVudDogJ2NsaWNrJ1xuXG4gICAgICAgIH0sICh0eXBlb2YgX3NldHRpbmdzID09PSBcInN0cmluZ1wiKSA/IHtzZWxlY3RvcjogX3NldHRpbmdzfSA6IF9zZXR0aW5ncyk7XG5cbiAgICAgICAgdGhpcy4kZWxzID0gJCh0aGlzLm9wdGlvbnMuc2VsZWN0b3IpO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5vcGVuQ2FsbGJhY2sgJiYgdHlwZW9mIHRoaXMub3B0aW9ucy5vcGVuQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vcGVuQ2FsbGJhY2sgID0gdGhpcy5vcHRpb25zLm9wZW5DYWxsYmFjay5iaW5kKHRoaXMpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vcGVuQ2FsbGJhY2sgID0gZnVuY3Rpb24oKXsgcmV0dXJuIGZhbHNlOyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmNsb3NlQ2FsbGJhY2sgJiYgdHlwZW9mIHRoaXMub3B0aW9ucy5jbG9zZUNhbGxiYWNrID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuY2xvc2VDYWxsYmFjayA9IHRoaXMub3B0aW9ucy5jbG9zZUNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNsb3NlQ2FsbGJhY2sgID0gZnVuY3Rpb24oKXsgcmV0dXJuIGZhbHNlOyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLiRlbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZGRFdmVudCgpO1xuICAgIH1cbiAgICAvLyBpbml0aWFsaXphdGlvbnNcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuYWRkRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzLiRlbHMpLm9uKHRoaXMub3B0aW9ucy5ldmVudCArICcuc3dpdGNoZXInLCB0aGlzLm9wdGlvbnMuZGVsZWdhdGVTZWxlY3RvciwgdGhpcy5vblRyaWdnZXJFdmVudC5iaW5kKHRoaXMpKTtcbiAgICB9O1xuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcy4kZWxzKS5vZmYodGhpcy5vcHRpb25zLmV2ZW50ICsgJy5zd2l0Y2hlcicpO1xuICAgIH07XG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLm9uVHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmNoYW5nZUZvcikge1xuICAgICAgICAgICAgaWYodGhpcy5jaGFuZ2VGb3IuaGFzT3duUHJvcGVydHkoa2V5KSAmJiB0eXBlb2YgdGhpcy5jaGFuZ2VGb3Jba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlRm9yW2tleV0uY2FsbCh0aGlzLCB0aGlzLiRlbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmNoYW5nZUZvciA9IChmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24gKCRlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZUNsYXNzKCRlbCwgdGhpcy5vcHRpb25zLmNsYXNzSW4sIHRoaXMub3B0aW9ucy5jbGFzc091dCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xvc2VzdDogZnVuY3Rpb24oJGVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY2xvc2VzdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZUNsYXNzKCRlbC5jbG9zZXN0KHRoaXMub3B0aW9ucy5jbG9zZXN0KSwgdGhpcy5vcHRpb25zLmNsYXNzSW4sIHRoaXMub3B0aW9ucy5jbGFzc091dCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzLm9wdGlvbnMudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBpZiAoISRlbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VDbGFzcygkZWwsIHRoaXMub3B0aW9ucy5jbGFzc0luLCB0aGlzLm9wdGlvbnMuY2xhc3NPdXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlcGVuZGVuY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciAkZWwgPSAkKHRoaXMub3B0aW9ucy50YXJnZXREZXBlbmRlbmNlKTtcbiAgICAgICAgICAgICAgICBpZiAoISRlbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoJGVsLmhhc0NsYXNzKHRoaXMub3B0aW9ucy5jbGFzc0luKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VDbGFzc0ZvckhpZGUoJGVsLCB0aGlzLm9wdGlvbnMuY2xhc3NJbiwgdGhpcy5vcHRpb25zLmNsYXNzT3V0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRhcmdldERlcGVuZGVuY2VDbG9zZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkY2xvc2VzdCA9ICRlbC5jbG9zZXN0KHRoaXMub3B0aW9ucy50YXJnZXREZXBlbmRlbmNlQ2xvc2VzdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkY2xvc2VzdC5sZW5ndGggJiYgJGNsb3Nlc3QuaGFzQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzSW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VDbGFzc0ZvckhpZGUoJGVsLmNsb3Nlc3QodGhpcy5vcHRpb25zLnRhcmdldERlcGVuZGVuY2VDbG9zZXN0KSwgdGhpcy5vcHRpb25zLmNsYXNzSW4sIHRoaXMub3B0aW9ucy5jbGFzc091dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSkoKTtcblxuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5fY2hhbmdlQ2xhc3MgPSBmdW5jdGlvbigkZWwsIGNsYXNzSW4sIGNsYXNzT3V0KSB7XG4gICAgICAgIGlmICghJGVsLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICggJGVsLmhhc0NsYXNzKGNsYXNzSW4pICkge1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlQ2xhc3NGb3JIaWRlKCRlbCwgY2xhc3NJbiwgY2xhc3NPdXQpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNsb3NlQ2FsbGJhY2soKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlQ2xhc3NGb3JTaG93KCRlbCwgY2xhc3NJbiwgY2xhc3NPdXQpO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9wZW5DYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuX2NoYW5nZUNsYXNzRm9yU2hvdyA9IGZ1bmN0aW9uKCRlbCwgY2xhc3NJbiwgY2xhc3NPdXQpIHtcbiAgICAgICAgaWYgKCEkZWwubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJGVsLmFkZENsYXNzKGNsYXNzSW4pO1xuICAgICAgICAkZWwucmVtb3ZlQ2xhc3MoY2xhc3NPdXQpO1xuICAgICAgICB0aGlzLl9jaGFuZ2VCYWNrZ3JvdW5kKCRlbCwgdGhpcy5vcHRpb25zLmF0dHJUb0luQmcpO1xuICAgIH07XG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLl9jaGFuZ2VDbGFzc0ZvckhpZGUgPSBmdW5jdGlvbigkZWwsIGNsYXNzSW4sIGNsYXNzT3V0KSB7XG4gICAgICAgIGlmICghJGVsLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRlbC5yZW1vdmVDbGFzcyhjbGFzc0luKTtcbiAgICAgICAgJGVsLmFkZENsYXNzKGNsYXNzT3V0KTtcbiAgICAgICAgdGhpcy5fY2hhbmdlQmFja2dyb3VuZCgkZWwsIHRoaXMub3B0aW9ucy5hdHRyVG9PdXRCZyk7XG4gICAgfTtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuX2NoYW5nZUJhY2tncm91bmQgPSBmdW5jdGlvbigkZWwsIGF0dHIpIHtcbiAgICAgICAgaWYgKCEkZWwubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJnVXJsID0gJGVsLmF0dHIoYXR0cik7XG4gICAgICAgIGlmICghYmdVcmwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRlbFswXS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKFwiJysgYmdVcmwgKyAnXCIpJztcbiAgICB9O1xuXG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xufTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFxzd2l0Y2hlci5qc1wiLFwiL2NvbXBvbmVudHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIENyZWF0ZWQgYnkgQW50b24uRmlsaW5cbiAqL1xuXG4vKipcbiAqIE1vZHVsZSBmb3IgcGx1Z2luIGRyYXdpbmcgc3ZnLlxuICpcbiAqIEBtb2R1bGUgY29tcG9uZW50cy92aXZ1c0NvbXBvbmVudHNcbiAqIEByZXR1cm5zIENvbnN0cnVjdG9yXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJCl7XG5cbiAgICB2YXIgQ29uc3RydWN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZUlEXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICAgKi9cbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUubmV3Vml2dXMgPSBmdW5jdGlvbihuYW1lSUQsIG9wdGlvbnMsIGNhbGxiYWNrKXtcbiAgICAgICAgaWYodHlwZW9mIG5hbWVJRCAhPSBcInN0cmluZ1wiIHx8IHR5cGVvZiBvcHRpb25zICE9IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGxiYWNrICE9IFwiZnVuY3Rpb25cIikgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHZhciBWaXZ1cyA9IHJlcXVpcmUoJ3ZpdnVzJyk7XG4gICAgICAgIGlmKCFuYW1lSUQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB2YXIgdml2dXMgPSBuZXcgVml2dXMobmFtZUlELCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiB2aXZ1cztcbiAgICB9O1xuXG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xufTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29tcG9uZW50c1xcXFx2aXZ1c0NvbXBvbmVudHMuanNcIixcIi9jb21wb25lbnRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuKGZ1bmN0aW9uICgkKSB7XG5cbiAgcmVxdWlyZSgnLi9jb21wb25lbnRzL2ltYXhQbGF5ZXIuanMnKSgkKTtcblxuICB2YXIgRW50aXRpZXNNYW5hZ2VyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2VudGl0aWVzTWFuYWdlci5qcycpKCQpO1xuICB2YXIgU2VsZWN0Qm94ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3NlbGVjdEJveC5qcycpKCQpO1xuICB2YXIgQ2xhc3NUb2dnbGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2NsYXNzVG9nZ2xlci5qcycpKCQpO1xuICB2YXIgU2VhcmNoTW9iaWxlID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3NlYXJjaE1vYmlsZS5qcycpKCQpO1xuICB2YXIgU2VhcmNoRGVza3RvcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zZWFyY2hEZXNrdG9wLmpzJykoJCk7XG4gIHZhciBSZXNpemVFbWl0dGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3Jlc2l6ZUVtaXR0ZXIuanMnKSgkKTtcbiAgdmFyIFN3aXRjaGVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3N3aXRjaGVyLmpzJykoJCk7XG5cbiAgLy8gRW50aXRpZXMgbWFuYWdlci5cbiAgdmFyIGVudGl0aWVzTWFuYWdlciA9IG5ldyBFbnRpdGllc01hbmFnZXIoe1xuICAgIGl0ZW1zOiB7XG4gICAgICBzeW5vcHNpczogW10sXG4gICAgICBzaGFyZUJ1dHRvbnM6IFtdLFxuICAgICAgbmV3c0NvbGxhcHNpbmc6IFtdXG4gICAgfVxuICB9KTtcblxuICB2YXIgYm9keVNjcm9sbENsYXNzVG9nZ2xlciA9IG5ldyBDbGFzc1RvZ2dsZXIoe1xuICAgIGVsZW1lbnQ6ICdib2R5JyxcbiAgICBjbGFzc1RvVG9nZ2xlOiAnbm8tc2Nyb2xsYWJsZS1pdGVtJyxcbiAgICBpbnN0YW50SW5pdDogZmFsc2VcbiAgfSk7XG5cbiAgZnVuY3Rpb24gQXBwbGljYXRpb24oKSB7XG4gICAgYm9keVNjcm9sbENsYXNzVG9nZ2xlci5pbml0KCk7XG5cbiAgICBuZXcgU3dpdGNoZXIoe1xuICAgICAgc2VsZWN0b3I6ICcjbWVudS10b2dnbGUnLFxuICAgICAgY2xvc2VzdDogJ2RpdicsXG4gICAgICB0YXJnZXQ6ICcjbWVudS1hc2lkZSwgI2Jsb2NrLXN5c3RlbS1tYWluLW1lbnUgPiAubWVudSBoMiwgI2Jsb2NrLXN5c3RlbS1tYWluLW1lbnUgPiAubWVudSB1bC5kcm9wZG93bi1tZW51JyxcbiAgICAgIHRhcmdldERlcGVuZGVuY2U6ICcjc2VhcmNoLXRvZ2dsZSwgI25hdmJhciAuc2VhcmNoLXdyYXBwZXInLFxuICAgICAgdGFyZ2V0RGVwZW5kZW5jZUNsb3Nlc3Q6ICdkaXYnLFxuICAgICAgb3BlbkNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkKCcuc2VhcmNoLW92ZXJsYXknKS5sZW5ndGgpIHtcbiAgICAgICAgICBib2R5U2Nyb2xsQ2xhc3NUb2dnbGVyLnRvZ2dsZU91dCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgbmV3IFN3aXRjaGVyKHtcbiAgICAgIHNlbGVjdG9yOiAnI3NlYXJjaC10b2dnbGUnLFxuICAgICAgY2xvc2VzdDogJ2RpdicsXG4gICAgICB0YXJnZXQ6ICcjbmF2YmFyIC5zZWFyY2gtd3JhcHBlcicsXG4gICAgICB0YXJnZXREZXBlbmRlbmNlOiAnI21lbnUtdG9nZ2xlLCAjbWVudS1hc2lkZScsXG4gICAgICB0YXJnZXREZXBlbmRlbmNlQ2xvc2VzdDogJ2RpdicsXG4gICAgICBvcGVuQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCQoJy5zZWFyY2gtb3ZlcmxheScpLmxlbmd0aCkge1xuICAgICAgICAgIGJvZHlTY3JvbGxDbGFzc1RvZ2dsZXIudG9nZ2xlSW4oKTtcbiAgICAgICAgfVxuICAgICAgICAkKCcuc2VhcmNoLXdyYXBwZXInKS5maW5kKCdpbnB1dCcpLmZvY3VzKCk7XG4gICAgICB9LFxuICAgICAgY2xvc2VDYWxsYmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJCgnLnNlYXJjaC1vdmVybGF5JykubGVuZ3RoKSB7XG4gICAgICAgICAgYm9keVNjcm9sbENsYXNzVG9nZ2xlci50b2dnbGVPdXQoKTtcbiAgICAgICAgfVxuICAgICAgICAkKCcuc2VhcmNoLXdyYXBwZXInKS5maW5kKCdpbnB1dCcpLmJsdXIoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG5ldyBTd2l0Y2hlcih7XG4gICAgICBzZWxlY3RvcjogJyNibG9jay1sb2NhbGUtbGFuZ3VhZ2UgLmJsb2NrLXRpdGxlJyxcbiAgICAgIHRhcmdldDogJyNibG9jay1sb2NhbGUtbGFuZ3VhZ2UgLmxhbmd1YWdlLXN3aXRjaGVyLWxvY2FsZS11cmwnLFxuICAgICAgdGFyZ2V0RGVwZW5kZW5jZTogJyNibG9jay1zeXN0ZW0tbWFpbi1tZW51ID4gLm1lbnUgaDIsICNibG9jay1zeXN0ZW0tbWFpbi1tZW51ID4gLm1lbnUgdWwuZHJvcGRvd24tbWVudSdcbiAgICB9KTtcblxuICAgIG5ldyBTd2l0Y2hlcih7XG4gICAgICBzZWxlY3RvcjogJyNibG9jay1zeXN0ZW0tbWFpbi1tZW51ID4gLm1lbnUgaDInLFxuICAgICAgdGFyZ2V0OiAnI2Jsb2NrLXN5c3RlbS1tYWluLW1lbnUgPiAubWVudSB1bC5kcm9wZG93bi1tZW51JyxcbiAgICAgIHRhcmdldERlcGVuZGVuY2U6ICcjYmxvY2stbG9jYWxlLWxhbmd1YWdlIC5ibG9jay10aXRsZSwgI2Jsb2NrLWxvY2FsZS1sYW5ndWFnZSAubGFuZ3VhZ2Utc3dpdGNoZXItbG9jYWxlLXVybCdcbiAgICB9KTtcblxuICAgIHZhciBWaXZ1c0NvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdml2dXNDb21wb25lbnRzLmpzJykoJCk7XG4gICAgdGhpcy5WaXZ1cyA9IG5ldyBWaXZ1c0NvbXBvbmVudHMoKTtcblxuICAgIHZhciBTdWJzY3JpYmUgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc3Vic2NyaWJlLmpzJykoJCk7XG4gICAgdGhpcy5mb290ZXJTdWJzY3JpYmUgPSBuZXcgU3Vic2NyaWJlKCdbaWQgKj0gXCJpbWF4LXN1YnNjcmliZS1mb3JtXCJdLmZvb3Rlci1mb3JtJyk7XG4gICAgdGhpcy5zaWRlYmFyU3Vic2NyaWJlID0gbmV3IFN1YnNjcmliZSgnW2lkICo9IFwiaW1heC1zdWJzY3JpYmUtZm9ybVwiXS5zaWRlYmFyLWZvcm0nKTtcblxuICAgIC8vIFRvZ2dsZSBjbGFzcyB3aGVuIGZvb3RlciBpcyB2aXNpYmxlXG4gICAgZnVuY3Rpb24gRm9vdGVyVmlzaWJpbGl0eVRvZ2dsZXIoKSB7XG4gICAgICB2YXIgdG9nZ2xlciA9IG5ldyBDbGFzc1RvZ2dsZXIoe1xuICAgICAgICBlbGVtZW50OiAnYm9keScsXG4gICAgICAgIGNsYXNzVG9Ub2dnbGU6ICdmb290ZXItdmlzaWJsZSdcbiAgICAgIH0pO1xuICAgICAgdmFyICRnbG9iYWxDb250ZXh0ID0gJCh3aW5kb3cpO1xuICAgICAgdmFyICRjb250ZW50ID0gJCgnLm1haW4tY29udGFpbmVyJyk7XG4gICAgICB2YXIgc3BhY2luZyA9IHBhcnNlSW50KCRjb250ZW50LmNzcygncGFkZGluZy1ib3R0b20nKSk7XG4gICAgICAkZ2xvYmFsQ29udGV4dFxuICAgICAgICAub24oJ3Njcm9sbCcsIHJlZnJlc2gpXG4gICAgICAgIC5vbigncmVzaXplJywgcmVmcmVzaCk7XG5cbiAgICAgIGZ1bmN0aW9uIHJlZnJlc2goKSB7XG4gICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9ICRnbG9iYWxDb250ZXh0LmhlaWdodCgpO1xuICAgICAgICB2YXIgY29udGVudEhlaWdodCA9ICRjb250ZW50Lm91dGVySGVpZ2h0KCk7XG4gICAgICAgIHZhciBjdXJyVG9wQ29vcmQgPSAkZ2xvYmFsQ29udGV4dC5zY3JvbGxUb3AoKTtcbiAgICAgICAgaWYgKGN1cnJUb3BDb29yZCA+IGNvbnRlbnRIZWlnaHQgLSB2aWV3cG9ydEhlaWdodCArIHNwYWNpbmcgKiAyKSB7XG4gICAgICAgICAgdG9nZ2xlci50b2dnbGVJbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvZ2dsZXIudG9nZ2xlT3V0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBuZXcgRm9vdGVyVmlzaWJpbGl0eVRvZ2dsZXIoKTtcbiAgICB2YXIgb25sb2FkVG9nZ2xlID0gbmV3IENsYXNzVG9nZ2xlcih7XG4gICAgICBlbGVtZW50OiAnYm9keScsXG4gICAgICBjbGFzc1RvVG9nZ2xlOiAnZG9tcmVhZHknXG4gICAgfSk7XG4gICAgb25sb2FkVG9nZ2xlLnRvZ2dsZUluKCk7XG5cbiAgICAvLyQoJyNibG9jay1zeXN0ZW0tbWFpbiBbZGF0YS12aWRlby15b3V0dWJlLWlkXScpLmltYXhQbGF5ZXIoKTsgLy8gZm9yIHByZXNzXG4gICAgJCgnW2lkXj1ibG9jay12aWV3cy1yZWxhdGVkLW5ld3MtYmxvY2tdIFtkYXRhLXZpZGVvLXlvdXR1YmUtaWRdLCAjYmxvY2stc3lzdGVtLW1haW4gW2RhdGEtdmlkZW8teW91dHViZS1pZF0nKS5pbWF4UGxheWVyKHtcbiAgICAgIG9uU3RvcENhbGxiYWNrOiBvbkNoYW5nZVN0YXRlSW1heFBsYXllcixcbiAgICAgIG9uUGxheUNhbGxiYWNrOiBvbkNoYW5nZVN0YXRlSW1heFBsYXllclxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gb25DaGFuZ2VTdGF0ZUltYXhQbGF5ZXIoJGl0ZW0sIGlzUGxheSkge1xuICAgICAgdmFyIHBhcmVudCA9ICRpdGVtLmNsb3Nlc3QoJy52aWV3cy1yb3cnKTtcbiAgICAgIGlmICAoaXNQbGF5KSB7XG4gICAgICAgIHBhcmVudC5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICB9XG4gICAgfVxuICAgIG5ldyBSZXNpemVFbWl0dGVyKCk7XG4gIH1cblxuICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmluaXQgPSBuZXcgQXBwbGljYXRpb24oKTtcbiAgfSk7XG5cbiAgRHJ1cGFsLmJlaGF2aW9ycy5zaGFyZUJ1dHRvbnMgPSB7XG4gICAgYXR0YWNoOiBmdW5jdGlvbiAoLypjb250ZXh0LCBzZXR0aW5ncyovKSB7XG4gICAgICBlbnRpdGllc01hbmFnZXIuY2xlYXJMaXN0KCdzaGFyZUJ1dHRvbnMnKTtcbiAgICAgIHZhciBzaGFyZUJ1dHRvbnMgPSAkKCcuc2hhcmUtYnV0dG9ucycpO1xuICAgICAgc2hhcmVCdXR0b25zLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgIHZhciBzaGFyZU9iaiA9IG5ldyBDbGFzc1RvZ2dsZXIoe1xuICAgICAgICAgIGVsZW1lbnQ6ICQoZWwpLFxuICAgICAgICAgIGNhbGxlcjogJChlbCkuZmluZCgnLnNoYXJlLWljb24nKSxcbiAgICAgICAgICBjbGFzc1RvVG9nZ2xlOiAnb3BlbidcbiAgICAgICAgfSk7XG4gICAgICAgIGVudGl0aWVzTWFuYWdlci5hZGRUb0xpc3QoJ3NoYXJlQnV0dG9ucycsIHNoYXJlT2JqKTtcbiAgICAgIH0pO1xuXG4gICAgICB3aW5kb3cuU2hhcmUgPSB7XG4gICAgICAgIHZrb250YWt0ZTogZnVuY3Rpb24gKHB1cmwsIHB0aXRsZSwgcGltZywgdGV4dCkge1xuICAgICAgICAgIHZhciB1cmwgPSAnaHR0cDovL3Zrb250YWt0ZS5ydS9zaGFyZS5waHA/JztcbiAgICAgICAgICB1cmwgPSB1cmwgKyAndXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQocHVybCk7XG4gICAgICAgICAgdXJsID0gdXJsICsgJyZ0aXRsZT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHB0aXRsZSk7XG4gICAgICAgICAgdXJsID0gdXJsICsgJyZkZXNjcmlwdGlvbj0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpO1xuICAgICAgICAgIHVybCA9IHVybCArICcmaW1hZ2U9JyArIGVuY29kZVVSSUNvbXBvbmVudChwaW1nKTtcbiAgICAgICAgICB1cmwgPSB1cmwgKyAnJm5vcGFyc2U9dHJ1ZSc7XG4gICAgICAgICAgdGhpcy5wb3B1cCh1cmwpO1xuICAgICAgICB9LFxuICAgICAgICBvZG5va2xhc3NuaWtpOiBmdW5jdGlvbiAocHVybCwgdGV4dCkge1xuICAgICAgICAgIHZhciB1cmwgPSAnaHR0cDovL3d3dy5vZG5va2xhc3NuaWtpLnJ1L2RrP3N0LmNtZD1hZGRTaGFyZSZzdC5zPTEnO1xuICAgICAgICAgIHVybCA9IHVybCArICcmc3QuY29tbWVudHM9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KTtcbiAgICAgICAgICB1cmwgPSB1cmwgKyAnJnN0Ll9zdXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQocHVybCk7XG4gICAgICAgICAgdGhpcy5wb3B1cCh1cmwpO1xuICAgICAgICB9LFxuICAgICAgICBmYWNlYm9vazogZnVuY3Rpb24gKHB1cmwsIHB0aXRsZSwgcGltZywgdGV4dCkge1xuICAgICAgICAgIHZhciB1cmwgPSAnaHR0cDovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyLnBocD9zPTEwMCc7XG4gICAgICAgICAgdXJsID0gdXJsICsgJyZwW3RpdGxlXT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHB0aXRsZSk7XG4gICAgICAgICAgdXJsID0gdXJsICsgJyZwW3N1bW1hcnldPScgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCk7XG4gICAgICAgICAgdXJsID0gdXJsICsgJyZwW3VybF09JyArIGVuY29kZVVSSUNvbXBvbmVudChwdXJsKTtcbiAgICAgICAgICB1cmwgPSB1cmwgKyAnJnBbaW1hZ2VzXVswXT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHBpbWcpO1xuICAgICAgICAgIHRoaXMucG9wdXAodXJsKTtcbiAgICAgICAgfSxcbiAgICAgICAgdHdpdHRlcjogZnVuY3Rpb24gKHB1cmwsIHB0aXRsZSkge1xuICAgICAgICAgIHZhciB1cmwgPSAnaHR0cDovL3R3aXR0ZXIuY29tL3NoYXJlPyc7XG4gICAgICAgICAgdXJsID0gdXJsICsgJ3RleHQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChwdGl0bGUpO1xuICAgICAgICAgIHVybCA9IHVybCArICcmdXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQocHVybCk7XG4gICAgICAgICAgdXJsID0gdXJsICsgJyZjb3VudHVybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHB1cmwpO1xuICAgICAgICAgIHRoaXMucG9wdXAodXJsKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWFpbHJ1OiBmdW5jdGlvbiAocHVybCwgcHRpdGxlLCBwaW1nLCB0ZXh0KSB7XG4gICAgICAgICAgdmFyIHVybCA9ICdodHRwOi8vY29ubmVjdC5tYWlsLnJ1L3NoYXJlPyc7XG4gICAgICAgICAgdXJsID0gdXJsICsgJ3VybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHB1cmwpO1xuICAgICAgICAgIHVybCA9IHVybCArICcmdGl0bGU9JyArIGVuY29kZVVSSUNvbXBvbmVudChwdGl0bGUpO1xuICAgICAgICAgIHVybCA9IHVybCArICcmZGVzY3JpcHRpb249JyArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KTtcbiAgICAgICAgICB1cmwgPSB1cmwgKyAnJmltYWdldXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQocGltZyk7XG4gICAgICAgICAgdGhpcy5wb3B1cCh1cmwpO1xuICAgICAgICB9LFxuICAgICAgICBwb3B1cDogZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJycsICd0b29sYmFyPTAsc3RhdHVzPTAsd2lkdGg9NjI2LGhlaWdodD00MzYnKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgLy8gdmFyIHNlYXJjaE1vYmlsZSA9IG5ldyBTZWFyY2hNb2JpbGUoKTtcbiAgRHJ1cGFsLmJlaGF2aW9ycy5zZWFyY2hCZWhhdmlvciA9IHtcbiAgICBhdHRhY2g6IGZ1bmN0aW9uICgvKmNvbnRleHQsIHNldHRpbmdzKi8pIHtcbiAgICAgICQoJy52aWV3LXNlYXJjaCcpLm9uY2UoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciAkb3ZlcmxheSA9ICQoJy5zZWFyY2gtb3ZlcmxheScpO1xuICAgICAgICBpZiAoJG92ZXJsYXkubGVuZ3RoKSB7XG4gICAgICAgICAgYm9keVNjcm9sbENsYXNzVG9nZ2xlci50b2dnbGVJbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRvdmVybGF5Lmhhc0NsYXNzKCdtb2JpbGUtc2VhcmNoJykpIHtcbiAgICAgICAgICAvLyBNb2JpbGUgbG9naWNcbiAgICAgICAgICBuZXcgU2VhcmNoTW9iaWxlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoJG92ZXJsYXkuaGFzQ2xhc3MoJ2Rlc2t0b3Atc2VhcmNoJykpIHtcbiAgICAgICAgICAvLyBEZXNrdG9wIGxvZ2ljLlxuICAgICAgICAgIG5ldyBTZWFyY2hEZXNrdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBEcnVwYWwuYmVoYXZpb3JzLnNlbGVjdEJlaGF2aW9yID0ge1xuICAgIGF0dGFjaDogZnVuY3Rpb24gKC8qY29udGV4dCwgc2V0dGluZ3MqLykge1xuICAgICAgLy8gUmVsYXRlZCBuZXdzIHllYXIgc2VsZWN0Ym94LlxuICAgICAgbmV3IFNlbGVjdEJveCgnLnZpZXctcmVsYXRlZC1uZXdzIHNlbGVjdCcsIHtcbiAgICAgICAgb3B0aW9uVGV4dFByZXByb2Nlc3M6IGZ1bmN0aW9uKG9wdFRleHQpIHtcbiAgICAgICAgICByZXR1cm4gb3B0VGV4dC5yZXBsYWNlKC9eLS8sJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG5ldyBTZWxlY3RCb3goJy52aWV3LXJlbGF0ZWQtbW92aWVzIHNlbGVjdCcsIHtcbiAgICAgICAgb3B0aW9uVGV4dFByZXByb2Nlc3M6IGZ1bmN0aW9uKG9wdFRleHQpIHtcbiAgICAgICAgICByZXR1cm4gb3B0VGV4dC5yZXBsYWNlKC9eLS8sJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgRHJ1cGFsLmJlaGF2aW9ycy5sYXRlc3ROZXdzID0ge1xuICAgIGF0dGFjaDogZnVuY3Rpb24gKC8qY29udGV4dCwgc2V0dGluZ3MqLykge1xuICAgICAgLy8gU3lub3BzaXMuXG4gICAgICBlbnRpdGllc01hbmFnZXIuY2xlYXJMaXN0KCduZXdzQ29sbGFwc2luZycpO1xuXG4gICAgICAkKCcudmlldy1yZWxhdGVkLW5ld3MgLnZpZXdzLXJvdycpLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgIHZhciAkbmV3c0l0ZW0gPSAkKGVsKTtcblxuICAgICAgICAvLyBjb2xsYXBzZSB0b2dnbGVcbiAgICAgICAgdmFyICR0b2dnbGVyID0gJG5ld3NJdGVtLmZpbmQoJy5jb2xsYXBzZS10b2dnbGVyJyk7XG4gICAgICAgIHZhciAkdG9nZ2xlZENvbnRlbnQgPSAkbmV3c0l0ZW0uZmluZCgnLmNvbGxhcHNlZC1jb250ZW50Jyk7XG4gICAgICAgIC8vIEhhcmQgcmVwbGFjZW1lbnQgdG9nZ2xlLWNsb3NlIGFycm93LlxuICAgICAgICAkbmV3c0l0ZW0uZmluZCgnLnRvZ2dsZS1jbG9zZScpLmFwcGVuZFRvKCR0b2dnbGVkQ29udGVudC5maW5kKCdwJykubGFzdCgpKTtcblxuICAgICAgICBpZiAoJHRvZ2dsZXIubGVuZ3RoICE9PSAwICYmICR0b2dnbGVkQ29udGVudCAhPT0gMCkge1xuICAgICAgICAgIHZhciBuZXdzT2JqID0gbmV3IENsYXNzVG9nZ2xlcih7XG4gICAgICAgICAgICBlbGVtZW50OiAkbmV3c0l0ZW0sXG4gICAgICAgICAgICBjYWxsZXI6ICR0b2dnbGVyLFxuICAgICAgICAgICAgY2xhc3NUb1RvZ2dsZTogJ29wZW4nLFxuICAgICAgICAgICAgY2FsbGJhY2tzOiB7XG4gICAgICAgICAgICAgIGFkZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICR0b2dnbGVkQ29udGVudC5zbGlkZURvd24oKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHRvZ2dsZWRDb250ZW50LnNsaWRlVXAoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVudGl0aWVzTWFuYWdlci5hZGRUb0xpc3QoJ25ld3NDb2xsYXBzaW5nJywgbmV3c09iaik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnVwZGF0ZUFwcCgpO1xuICAgICAgdGhpcy51cGRhdGVZVFBsYXllcigpO1xuXG4gICAgfSxcbiAgICB1cGRhdGVBcHA6IGZ1bmN0aW9uKCkge1xuXG4gICAgfSxcbiAgICB1cGRhdGVZVFBsYXllcjogZnVuY3Rpb24oKSB7XG5cbiAgICB9XG4gIH07XG5cbiAgRHJ1cGFsLmJlaGF2aW9ycy5zeW5vcHNpcyA9IHtcbiAgICBhdHRhY2g6IGZ1bmN0aW9uICgvKmNvbnRleHQsIHNldHRpbmdzKi8pIHtcbiAgICAgIC8vIFN5bm9wc2lzLlxuICAgICAgZW50aXRpZXNNYW5hZ2VyLmNsZWFyTGlzdCgnc3lub3BzaXMnKTtcbiAgICAgICQoJy5jb21wb25lbnQtc3lub3BzaXMnKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICB2YXIgJHN5bm9wc2lzID0gJChlbCk7XG4gICAgICAgIHZhciAkc3lub3BzaXNIZWFkZXIgPSAkc3lub3BzaXMuZmluZCgnLnRpdGxlLXdyYXBwZXInKTtcbiAgICAgICAgdmFyICRzeW5vcHNpc0JvZHkgPSAkc3lub3BzaXMuZmluZCgnYXJ0aWNsZScpO1xuICAgICAgICB2YXIgc3lub3BzaXNPYmogPSBuZXcgQ2xhc3NUb2dnbGVyKHtcbiAgICAgICAgICBlbGVtZW50OiAkc3lub3BzaXMsXG4gICAgICAgICAgY2FsbGVyOiBbJHN5bm9wc2lzSGVhZGVyLCAkc3lub3BzaXNCb2R5XSxcbiAgICAgICAgICBjbGFzc1RvVG9nZ2xlOiAnb3BlbicsXG4gICAgICAgICAgY2FsbGJhY2tzOiB7XG4gICAgICAgICAgICBhZGQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJHN5bm9wc2lzQm9keS5zbGlkZURvd24oKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJHN5bm9wc2lzQm9keS5zbGlkZVVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZW50aXRpZXNNYW5hZ2VyLmFkZFRvTGlzdCgnc3lub3BzaXMnLCBzeW5vcHNpc09iaik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiWHA2SlV4XCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV83ZWUyZWMxNi5qc1wiLFwiL1wiKSJdfQ==
;
