angular
  .module('lib.logger', [])
  .provider('LoggerConfig', LoggerConfig)
  .config(config)

function LoggerConfig() {
  let _config = {
    showLocation: false,
    storeEntries: false,
    maxStoredEntries: 10
  };
  let storedEntries = [];
  this.config = (params) => {
    angular.merge(_config, params);
  }
  this.getConfig = () => { return _config; }
  this.storeEntry = (entry) => {
    if(!_config.storeEntries)
      return;
    storedEntries.push(entry);
    var sd = storedEntries.length - _config.maxStoredEntries;
    if(sd > 0)
      storedEntries.splice(0, sd);
  }
  this.getStoredEntries = () => { return storedEntries; }

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
    let Logger = {
      context: null
    };
    if(cfg.storeEntries)
      Logger.storedEntries = [];
    $log.getStoredEntries = LoggerConfigProvider.getStoredEntries;
    const fns = ['log', 'info', 'warn', 'debug', 'error'];
    for(let fn of fns) {
      Logger[fn] = function(message, ...args) {
        let location = '';
        if(cfg.showLocation) {
          let stack = (new Error()).stack.split(/\n/);
          let secondLine = stack[2];
          location = secondLine.match(/((?:http.*)|(?:file:.*))$/)[1];
        }
        let prefix = this.context ? `[${this.context}] ` : '';
        $log[fn].apply(this, [`${prefix}${message}`, ...args,  location]);
        if(cfg.storeEntries) {
          LoggerConfigProvider.storeEntry(`(${fn})${prefix}${message}`);
        }
      }
    }

    $log.getInstance = function(context = null) {
      let instance = Object.create(Logger);
      if(context)
        instance.context = context;
      return instance;
    }
    return $log;
  }
}
