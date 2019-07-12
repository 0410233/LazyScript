// demo.js
console.log('demo.js');
LazyScript.load('jquery', function(global) {
  console.log(global.jQuery.fn);
});
