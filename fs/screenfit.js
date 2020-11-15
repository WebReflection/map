(function(document){
  /*! (c) Andrea Giammarchi - ISC */
  /**
   * Works/Tested on:
   *  - KaiOS
   *  - Opera Mini
   *  - UCE Browser / Mini
   *  - Windows Phone
   *  - Samsung Internet
   *  - Android 6+ / Androind One
   *  - Any Chrome/ium based browser
   *  - Safari / Moble 13+
   *  - Vivaldi
   *  - Firefox / Nightly
   *
   * Gotchas:
   *  - IE11 and Kindle Browser need features detection
   *  - iOS 12 (iPad does *not* trigger any resize)
   *    possible work around for iOS < 13 -> not sure how
   *    to detect the available size without the keyboard
   *    document.addEventListener('focus', resize, true);
   */
  var head = document.head;
  var visualViewport = self.visualViewport || {
    addEventListener: addEventListener.bind(self),
    get width() { return innerWidth; },
    get height() { return innerHeight; }
  };
  head.appendChild(document.createElement('style')).textContent =
    'html,body{padding:0;margin:0;overflow:hidden;box-sizing:border-box;'+
    'height:100%;height:100vh;height:-webkit-fill-available}';
  visualViewport.addEventListener('resize', resize);
  document.addEventListener('DOMContentLoaded', resize, {once: true});
  function resize() {
    var width = visualViewport.width;
    var height = visualViewport.height;
    document.body.style.height = height + 'px';
    scrollTo(0, 0);
    setTimeout(scrollTo, 300, 0, 0); // Windows Phone
    dispatchEvent(new CustomEvent('screenfit', {
      detail: {height: height, width: width}
    }));
  }
}(document));
