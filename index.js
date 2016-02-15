angular
  .module('lib.logger', [])
  .provider('Logger', Logger);

function Logger() {
  let config = {
    enabled: true,
  };
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
      if(!config.enabled || !this.config.enabled)
        return;
      var scopes = this.loggerScopes.map((s) => { return `${s}:` }).join('');
      $log[type](`${scopes} ${msg}`);
    }

    function instantiate(parent) {
      function _instantiate(loggerScope) {
        let ret = Object.create(logger);
        let isChild = parent && logger.isPrototypeOf(parent);
        if(isChild) {
          ret.loggerScopes = parent.loggerScopes.concat(loggerScope);
          ret.config = {
            enabled: true,
          };
        } else {
          ret.loggerScopes = [loggerScope];
          ret.config = config;
        }
        ret.logger = instantiate(ret);
        return ret;
      }
      return _instantiate;
    }

    return instantiate();
  }];

}
