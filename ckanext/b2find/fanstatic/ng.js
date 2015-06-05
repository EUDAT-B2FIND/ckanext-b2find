var app = angular.module('b2findApp', []);

var controllers = {};

controllers.BasicFacetController = function ($scope) {
    // Copy properties over
    for (var k in basic_facets) {
        if (basic_facets.hasOwnProperty(k)) {
            $scope[k] = basic_facets[k];
        }
    }
};

app.controller(controllers);
