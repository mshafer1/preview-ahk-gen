try {
    pako = require(['pako']);
} catch (error) {
    console.log("Error, could not import pako", error)
    // pass
}

function zip(string) {
    var result = pako.deflate(string) /// { to: 'string' }
    return _arrayBufferToBase64(result);
}

var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function _btoa(decimal) {
    var first_index = Math.floor(decimal / encodings.length);
    var second_index = decimal % encodings.length;
    return encodings[first_index] + encodings[second_index];
}

function _atob(ascii) {
    var parts = ascii.match(/.{2}/g)
    var length = parts.length;
    var result = []

    for (i = 0; i < length; i++) {
        var part = parts[i];
        var value = encodings.indexOf(part[0])*encodings.length;
        value += encodings.indexOf(part[1])
        result.push(value)
    }

    return result;
}

// from https://stackoverflow.com/a/9458996
function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += _btoa(bytes[ i ]);
    }
    return binary;
    // return window.btoa( binary );
}

function unzip(string) {
    var binary = _atob(string)
    var output = pako.inflate(binary, { to: 'string' })
    return output
}

function base64ArrayBuffer(arrayBuffer) {
    var base64    = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  
    var bytes         = new Uint8Array(arrayBuffer)
    var byteLength    = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength    = byteLength - byteRemainder
  
    var a, b, c, d
    var chunk
  
    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
  
      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
      d = chunk & 63               // 63       = 2^6 - 1
  
      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }
  
    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
      chunk = bytes[mainLength]
  
      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
  
      // Set the 4 least significant bits to zero
      b = (chunk & 3)   << 4 // 3   = 2^2 - 1
  
      base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
  
      a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
  
      // Set the 2 least significant bits to zero
      c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
  
      base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }
    
    return base64
  }

try {
    exports.zip = zip;
    exports.unzip = unzip;
    exports._btoa = _btoa;
    exports._atob = _atob;
} catch (error) {
    // pass
}