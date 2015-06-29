var app = angular.module('b2findApp', []);

var controllers = {};

controllers.BasicFacetController = function ($scope) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;

    var params = getJsonFromUrl();

    for (var k in basic_facets) {
        if (basic_facets.hasOwnProperty(k)) {
            // Copy properties over
            $scope[k] = basic_facets[k];

            // Set default limit for facet items
            $scope[k].limit = $scope.facetMinLimit;

            // Set default order
            $scope[k].order = "-c";

            $scope[k].data.forEach(function (e) {
                // Set truncated label (lazily)
                define(e, 't', function () {
                    return truncate(this.l);
                });

                // Set element activity state (lazily)
                define(e, 'a', (function (name) {
                    return function () {
                        if (params[name]) {
                            return params[name].some(function (value) {
                                return value == this.l;
                            }, this);
                        }
                        return false;
                    }
                })($scope[k].name));
            });

            // Set facet activity state
            $scope[k].active = Boolean(params[$scope[k].name]);
        }
    }

    // Free basic_facets
    basic_facets = null;

    /** Truncates a string to length */
    function truncate(str, len) {
        if (!str) {
            return "";
        }
        if (!len) {
            len = 22;
        }
        if (str.length <= len) {
            return str;
        }
        return str.substr(0, len) + "...";
    }

    /**
     * Defines a lazy property on object
     * Copyright (c) 2012 John Crepezzi
     * The MIT License
     * https://github.com/seejohnrun/laze
     */
    function define(obj, prop, def) {
        Object.defineProperty(obj, prop, {
            configurable: true,
            enumerable: true,
            get: function () {
                var value = def.bind(this)();
                Object.defineProperty(this, prop, {
                    value: value,
                    configurable: false,
                    writable: false
                });
                return value;
            }
        });
    }

    /**
     * Bulk defines lazy properties on object
     * Copyright (c) 2012 John Crepezzi
     * The MIT License
     * https://github.com/seejohnrun/laze
     */
    function defineAll(obj, props) {
        for (var key in props) {
            if (props.hasOwnProperty(key)) {
                define(obj, key, props[key]);
            }
        }
    }
};

app.controller(controllers);

// Modification of http://stackoverflow.com/a/8486188
function getJsonFromUrl() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        if (item[1]) {
            if (!result[item[0]]) {
                result[item[0]] = [];
            }
            result[item[0]].push(decodeURIComponent(item[1]));
        }
    });
    return result;
}
