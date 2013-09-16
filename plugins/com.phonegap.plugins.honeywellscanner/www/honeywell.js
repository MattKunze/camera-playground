cordova.define("cordova/plugin/HoneywellScanner",

  function (require, exports, module) {

    var exec = require("cordova/exec");

    function HoneywellScanner() {
    };

    HoneywellScanner.prototype.trigger = function() {
      exec(null, null, 'HoneywellScanner', 'trigger', [] );
    };

    HoneywellScanner.prototype.register = function(callback) {
      exec(null, null, 'HoneywellScanner', 'registerCallback', [ callback ] );
    };

    // exports
    var plugin = new HoneywellScanner();
    module.exports = plugin;
  });


