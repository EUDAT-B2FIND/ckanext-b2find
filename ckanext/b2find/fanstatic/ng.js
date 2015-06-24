var app = angular.module('b2findApp', []);

var controllers = {};

controllers.BasicFacetController = function ($scope) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;

    for (var k in basic_facets) {
        if (basic_facets.hasOwnProperty(k)) {
            // Copy properties over
            $scope[k] = basic_facets[k];

            // Set default limit for facet items
            $scope[k].limit = $scope.facetMinLimit;

            // Set default order
            $scope[k].order = "-c";

            // Set facet activity state
            $scope[k].active = $scope[k].data.some(function (val) {
                return val.a;
            });
        }
    }

    // Free basic_facets
    basic_facets = null;
};

app.controller(controllers);
