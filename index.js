angular
  .module('lib.logger', [])
  .provider('LoggerConfig', LoggerConfig)
  .config(config)

function LoggerConfig() {
  let _config = {
    showLocation: false
  };
  this.config = (params) => { angular.merge(_config, params); }
  this.getConfig = () => { return _config; }

  this.$get = function() {
    return _config;
  }
}

config.$inject = ['$provide', 'LoggerConfigProvider'];
function config($provide, LoggerConfigProvider) {
  let cfg = LoggerConfigProvider.getConfig();

  $provide.decorator('$log', decorator);

  decorator.$inject = ['$delegate'];
  function decorator($log) {
    const fns = ['log', 'info', 'warn', 'debug', 'error'];

    $log.getInstance = function(context = null) {
      let instance = {
        context: context
      };
      for(let fn of fns) {
        instance[fn] = (message, ...args) => {
          let location = '';
          if(cfg.showLocation) {
            let stack = (new Error()).stack.split(/\n/);
            let secondLine = stack[2];
            location = secondLine.match(/((?:http.*)|(?:file:.*))$/)[1];
          }
          let prefix = context ? `[${context}] ` : '';
          $log[fn].apply(this, [`${prefix}${message}`, ...args,  location]);
        }
      }
      return instance;
    }
    return $log;
  }
}
