// docs from http://www.tohoho-web.com/wwwgif.htm
//  via http://github.com/edvakf/Pause--Pause--Pause-/blob/master/src/background.js
// Animated GIFs look like this:
//  - GIF Header starts with 'GIF89a', then follows 7-775 Bytes
//  - Application Extension starts with 0x21 0xFF 0x0B
//    then 'NETSCAPE2.0'
//    then the Block Size #2 (1 Byte)
//    then 0x01
//    then number of loops (2 Bytes)
//    then the Block Terminator 0x00
//  - Graphic Control starts with 0x21 0xF9, then 5 Bytes, then 0x00
//    Image Block starts with 0x2C, then ends with 0x00
//  - Graphic Control and Image Block repeats
//  - Trailer 0x3B
//
// Normal GIFs have neither the Application Extension nor the repeating part
var is_animated = new RegExp(
  '^GIF89a[^]{7,775}' +                     // GIF header
  '!\xFF\x0BNETSCAPE2[.]0[^]\x01[^]{2}\x00' // animation specs
);

// if url is an animated gif, run cb(dataURL of file)
function is_animated_gif(url, cb) {
  function is_gif() {
    return /^image\/.*gif/i.test(xhr.getResponseHeader('content-type') || '');
  }

  function test_and_abort_or_send() {
    switch (xhr.readyState) {
      case XMLHttpRequest.prototype.HEADERS_RECEIVED:
        if (!is_gif()) xhr.abort(); // wrong content-type; don't waste bandwidth
        break;

      case XMLHttpRequest.prototype.DONE:
        if (xhr.status >= 200 && xhr.status < 300 && is_gif()) {
          var data = xhr.responseText.replace(/[^\x00-\xFF]/g, function cap(c) {
            // drop upper bytes slipping in during binary parsing as UTF-16 text
            return String.fromCharCode(c.charCodeAt(0) & 0xFF);
          });
          if (is_animated.test(data)) {
            cb('data:image/gif;base64,'+ btoa(data));
          }
        }
        break;
    }
  }

  var xhr = new XMLHttpRequest;
  xhr.open('GET', url, !!'async');

  // XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
  xhr.overrideMimeType('text/plain; charset=x-user-defined');

  xhr.onreadystatechange = test_and_abort_or_send;
  xhr.send(null);
}
