!function(a){
if(!Function.bind)Function.prototype.bind=function(b){var a,c=this,d=[].slice.call(arguments,1);return function(){a=d.slice(0);a.push.apply(a,arguments);return c.apply(b,a)}};
a.write('<script src="//unpkg.com/@ungap/custom-event">\x3c/script>');
a.write('<script src="//unpkg.com/@ungap/map">\x3c/script>');
a.write('<script src="//cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js">\x3c/script>');
a.write('<script src="//unpkg.com/whatwg-fetch">\x3c/script>');
a.documentElement.className="legacy";
}(document);
