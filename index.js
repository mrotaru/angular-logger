angular
  .module('lib.logger', [])
  .provider('Logger', Logger);

function Logger() {
  let globalConfig = {
    store: 0
  };

  this.setStore = function(max) {
    globalConfig.store = max;
  };

  let storedEntries = [];
  let globalLogger = null;

  this.$get = ['$log', function($log) {

    var logger = {
      log:   function(msg) { _log.call(this, 'log', msg) },
      info:  function(msg) { _log.call(this, 'info', msg) },
      warn:  function(msg) { _log.call(this, 'warn', msg) },
      debug: function(msg) { _log.call(this, 'debug', msg) },
      error: function(msg) { _log.call(this, 'error', msg) },
      enable:  function() { this.config.enabled = true },
      disable: function() { this.config.enabled = false }
    }

    function _log(type, msg) {
      if(!this.config.enabled)
        return;
      var scopes = this.loggerScopes.map((s) => { return `${s}:` }).join('');
      var logMessage = `${scopes} ${msg}`;
      $log[type](logMessage);
      if(globalConfig.store) {
        storedEntries.push(`[${type}]${logMessage}`);
        var sd = storedEntries.length - globalConfig.store;
        if(sd > 0)
          storedEntries.splice(0, sd);
      }
    }

    function instantiate(parent) {
      function _instantiate(loggerScope) {
        if(!parent && !logger.isPrototypeOf(parent) && globalLogger)
          return globalLogger;
        let ret = Object.create(logger);
        ret.logger = instantiate(ret);
        ret.config = {
          enabled: true,
        };
        if(parent && logger.isPrototypeOf(parent)) {
          ret.loggerScopes = parent.loggerScopes.concat(loggerScope);
        } else {
          ret.loggerScopes = [];
          ret.getStoredEntries = function() {
            return storedEntries;
          }
          if(!globalLogger) {
            globalLogger = ret;
          }
        }
        return ret;
      }
      return _instantiate;
    }

    return instantiate();
  }];

}
