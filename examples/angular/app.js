var app = angular.module("beaconApp", ["ngTable"]);

app.service("DataService", function($http){
  this.getData = function(){
    return $http({
      method: 'GET',
      url: 'http://155.69.146.180:8889/location'
    });
  };
});

app.controller("TableCtrl", function($scope, $http, $interval, DataService) {
  console.log("Getting data");

  //filter setting
  $("[name='filterStatus']").bootstrapSwitch();
  $('input[name="filterStatus"]').on('switchChange.bootstrapSwitch', function(event, state) {

    var url = 'http://155.69.146.180:8889/location/filter';
    var filterData = $.param({
      filterStatus: state
    });
    var config = {
      headers : {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
      }
    };
    $http.post(url, filterData, config)
   .then(
       function(response){
       }, 
       function(response){
       }
    );
  });

  var loadData = function(){
      DataService.getData().then(function(dataResponse){
        $scope.data = dataResponse.data.data;
      });
  };

  //get data
  $interval(loadData, 1000);
});