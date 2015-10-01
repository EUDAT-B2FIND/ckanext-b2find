var app = angular.module('b2findApp', []);
var controllers = {};
controllers.BasicFacetController = function ($scope) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;
    var params = getJsonFromUrl();
    /** Bail out if basic_facets not defined */
    if (typeof basic_facets === 'undefined') {
        return;
    }
    for (var k in basic_facets) {
        if (basic_facets.hasOwnProperty(k)) {
            // Copy properties over
            $scope[k] = {
                name: basic_facets[k].name,
                data: _.map(basic_facets[k].data, function (x) { return ({ l: x[0], c: x[1], n: x[2] }); })
            };
            var facet = $scope[k];
            // Set default limit for facet items
            facet.limit = $scope.facetMinLimit;
            // Set default order
            facet.order = "cd";
            // Order data in different ways
            facet.ordered = {};
            defineAll(facet.ordered, (function (x) { return ({
                na: function () { return _.sortByOrder(x.data, ['ll'], ['asc']); },
                nd: function () { return _.sortByOrder(x.data, ['ll'], ['desc']); },
                ca: function () { return _.sortByOrder(x.data, ['c', 'll'], ['asc', 'asc']); },
                cd: function () { return _.sortByOrder(x.data, ['c', 'll'], ['desc', 'asc']); }
            }); })(facet));
            facet.data.forEach(function (e) {
                // Set truncated label (lazily)
                define(e, 't', function () { return truncate(e.l); });
                // Set deburred (ascii) label (lazily)
                define(e, 'd', function () { return _.deburr(e.l); });
                // Set lowercase label (lazily)
                define(e, 'll', function () { return e.l.toLowerCase(); });
                // Set element activity state (lazily)
                define(e, 'a', (function (x, y) {
                    return function () { return params[x] ?
                        params[x].some(function (value) { return value == (y.n ? y.n : y.l); })
                        : false; };
                })(facet.name, e));
                // Set element href
                e.h = "/dataset?" + jQuery.param((function (name, n_params) {
                    if (!n_params[name]) {
                        n_params[name] = [];
                    }
                    var value = e.n ? e.n : e.l;
                    if (_.includes(n_params[name], value)) {
                        _.pull(n_params[name], value);
                    }
                    else {
                        n_params[name].push(value);
                    }
                    return n_params;
                })(facet.name, angular.copy(params)), true);
            });
            // Set facet activity state
            facet.active = Boolean(params[facet.name]);
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
    $scope.deburr = _.deburr;
    /**
     * Return data belonging to facet
     */
    $scope.getData = function (facet) {
        var scope = $scope[facet];
        return scope.ordered[scope.order];
    };
};
app.controller(controllers);
/**
 * Build object of GET parameters from location URL
 * Modification of http://stackoverflow.com/a/8486188
 */
function getJsonFromUrl() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        if (item[1]) {
            if (!result[item[0]]) {
                result[item[0]] = [];
            }
            result[item[0]].push(decodeURIComponent(item[1]).replace(/\+/g, " "));
        }
    });
    return result;
}
