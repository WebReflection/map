/*! (c) Andrea Giammarchi - ISC */
Function.prototype.bind=function bind(context){
  var self = this;
  var rest = [].slice.call(arguments, 1);
  return function () {
    var args = rest.slice(0);
    args.push.apply(args, arguments);
    return self.apply(context, args);
  };
};

document.documentElement.className += ' kindle';
