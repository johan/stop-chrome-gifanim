// when a given url is an animated gif, run dataUrlCallback(dataURL of file)
function is_animated_gif(url, dataUrlCallback) {
  var xhr = new XMLHttpRequest;
  xhr.open('GET', url, !!'async');

  // http://www.tohoho-web.com/wwwgif.htm
  // Animated GIF goes like
  //  - Gif Header starts with 'GIF89a', then follows 7-775 Bytes
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
  // Normal GIF have neither the Application Extension nor the repeating part
  var is_animated = new RegExp('^GIF89a[\\s\\S]{7,775}' + // GIF header
                               '!\xFF\x0BNETSCAPE2\\.0[\\s\\S]\x01[\\s\\S]{2}\x00' + // animation specs
                               /*'!\xF9[\\s\\S]{5}\x00' + // Graphic Control
                               ',[\\s\\S]*?\x00' + // first animation frame's Image Block
                               '!\xF9'*/);

  // XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
  xhr.overrideMimeType('text/plain; charset=x-user-defined');

  xhr.onreadystatechange = function() {
    function is_gif() {
      return /^image\/.*gif/i.test(xhr.getResponseHeader('content-type') || '');
    }

    switch (xhr.readyState) {
      case XMLHttpRequest.prototype.HEADERS_RECEIVED:
        if (!is_gif()) xhr.abort();
        console.log('is gif');
        break;

      case XMLHttpRequest.prototype.DONE:
        console.log('is done');
        if (xhr.status >= 200 && xhr.status < 300 && is_gif()) {
          console.log('is ok');
          var data = xhr.responseText.replace(/[\u0100-\uFFFF]/g, function (c) {
            // drop upper bytes slipping in during binary parsing as UTF-16 text
            return String.fromCharCode(c.charCodeAt(0) & 0xFF);
          });
          if (is_animated.test(data)) {
            console.log('is animated');
            dataUrlCallback('data:image/gif;base64,'+ btoa(data));
          }
        }
        break;
    }
  };

  xhr.send(null);
}
