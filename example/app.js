angular
  .module('app', ['lib.logger'])
  .config(['LoggerConfigProvider', function(cfg){
    cfg.config({
      showLocation: true
    });
  }])
  .controller('main', ['$scope', '$log', function($scope, $log) {
    var l1 = $log.getInstance();
    var l2 = $log.getInstance('foo');
    var l3 = $log.getInstance('bar');
    $scope.info = function() {
      l1.info($scope.myInput);
    }
    $scope.log = function() {
      l2.log($scope.myInput);
    }
    $scope.error = function() {
      l3.error($scope.myInput);
    }
  }]);
