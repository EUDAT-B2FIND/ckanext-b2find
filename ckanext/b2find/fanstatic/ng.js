var app = angular.module('b2findApp', []);

var controllers = {};

controllers.BasicFacetController = function ($scope) {
    // Copy properties over
    for (var k in basic_facet_data) {
        if (basic_facet_data.hasOwnProperty(k)) {
            $scope[k] = basic_facet_data[k];
        }
    }
};

app.controller(controllers);
