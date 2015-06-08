var app = angular.module('b2findApp', []);

var controllers = {};

controllers.BasicFacetController = function ($scope) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;

    // Copy properties over
    for (var k in basic_facets) {
        if (basic_facets.hasOwnProperty(k)) {
            $scope[k] = basic_facets[k];
            $scope[k].limit = $scope.facetMinLimit;
            $scope[k].active = $scope[k].data.some(function (val) {
                return val.active;
            });
        }
    }
};

app.controller(controllers);
