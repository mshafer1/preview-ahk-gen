try {
    LZUTF8 = require('lzutf8');
} catch (error) {
    console.debug("Error, could not import lzutf8", error)
    // pass
}

function zip(string) {
    var result = LZUTF8.compress(string,  {outputEncoding: 'Base64'} )
    return result;
}

function unzip(compressed) {
    var result = LZUTF8.decompress(compressed,  {inputEncoding: 'Base64'} );
    return result
}

try {
    var exports = module.exports = {};
    exports.zip = zip;
    exports.unzip = unzip;
} catch (error) {
    // pass
    console.log(error);
}