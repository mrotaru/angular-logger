'use strict';

angular.module('lib.logger', []).provider('LoggerConfig', LoggerConfig).config(config);

function LoggerConfig() {
  var _config = {
    showLocation: false,
    storeEntries: false,
    maxStoredEntries: 10
  };
  var storedEntries = [];
  this.config = function (params) {
    angular.merge(_config, params);
  };
  this.getConfig = function () {
    return _config;
  };
  this.storeEntry = function (entry) {
    if (!_config.storeEntries) return;
    storedEntries.push(entry);
    var sd = storedEntries.length - _config.maxStoredEntries;
    if (sd > 0) storedEntries.splice(0, sd);
  };
  this.getStoredEntries = function () {
    return storedEntries;
  };

  this.$get = function () {
    return _config;
  };
}

config.$inject = ['$provide', 'LoggerConfigProvider'];
function config($provide, LoggerConfigProvider) {
  var cfg = LoggerConfigProvider.getConfig();
  $provide.decorator('$log', decorator);

  decorator.$inject = ['$delegate'];
  function decorator($log) {
    var Logger = {
      context: null
    };
    if (cfg.storeEntries) Logger.storedEntries = [];
    $log.getStoredEntries = LoggerConfigProvider.getStoredEntries;
    var fns = ['log', 'info', 'warn', 'debug', 'error'];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var fn = _step.value;

        Logger[fn] = function (message) {
          var location = '';
          if (cfg.showLocation) {
            var stack = new Error().stack.split(/\n/);
            var secondLine = stack[2];
            location = secondLine.match(/((?:http.*)|(?:file:.*))$/)[1];
          }
          var prefix = this.context ? '[' + this.context + '] ' : '';

          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          $log[fn].apply(this, ['' + prefix + message].concat(args, [location]));
          if (cfg.storeEntries) {
            LoggerConfigProvider.storeEntry('(' + fn + ')' + prefix + message);
          }
        };
      };

      for (var _iterator = fns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    $log.getInstance = function () {
      var context = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var instance = Object.create(Logger);
      if (context) instance.context = context;
      return instance;
    };
    return $log;
  }
}
