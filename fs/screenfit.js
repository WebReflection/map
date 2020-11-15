(function(document){
  /*! (c) Andrea Giammarchi - ISC */
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
  // possible work around for iOS < 13 ... but not sure how
  // document.addEventListener('focus', resize, true);
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
