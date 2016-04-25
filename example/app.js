angular
  .module("app", ["lib.logger"])
  .config(["LoggerProvider", function(LoggerProvider){
    LoggerProvider.setStore(10);
  }])
  .controller("main", ["$scope", "Logger", function($scope, Logger) {
    var l1 = Logger();
//    var l2 = Logger(logger)('foo');
    var l2 = l1.logger('foo');
    var l3 = l2.logger('bar');
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
