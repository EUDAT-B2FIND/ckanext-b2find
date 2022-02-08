var app = angular.module('b2findApp',[]);

app.controller('BasicFacetController', function($scope){
    $scope.getData = function (facet) {
      $.ajax({
          type: 'GET',
          url: "/b2find/query",
          dataType: 'json',
          success: function(json) {
            console.log("b2f facet: " + facet); 
            console.log("b2f json: " + json.facets.author.buckets[0].val );
            $scope.data = json.facets.author.buckets;
          },
          data: {},
          async: false
      });
      return $scope.data;
    };
});
