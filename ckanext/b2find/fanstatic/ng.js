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
    var _loop_1 = function(k) {
        if (basic_facets.hasOwnProperty(k)) {
            // Copy properties over
            $scope[k] = {
                name: basic_facets[k].name,
                data: _.map(basic_facets[k].data, function (x) { return ({ l: x[0], c: x[1], n: x[2] }); })
            };
            var facet_1 = $scope[k];
            // Set default limit for facet items
            facet_1.limit = $scope.facetMinLimit;
            // Set default order
            facet_1.order = "cd";
            facet_1.data.forEach(function (e) {
                // Set truncated label
                e.t = _.truncate(e.l, { length: 22 });
                // Set deburred (ascii) label
                e.d = _.deburr(e.l);
                // Set lowercase label
                e.ll = e.l.toLowerCase();
                // Set element activity state
                e.a = params[facet_1.name] ?
                    params[facet_1.name].some(function (value) { return value == (e.n ? e.n : e.l); })
                    : false;
                // Set element href
                e.h = "/dataset?" + jQuery.param((function (name, n_params) {
                    if (!n_params[name]) {
                        n_params[name] = [];
                    }
                    var value = e.n ? e.n : e.l;
                    _.includes(n_params[name], value) ?
                        _.pull(n_params[name], value)
                        : n_params[name].push(value);
                    return n_params;
                })(facet_1.name, angular.copy(params)), true);
            });
            // Order data in different ways
            facet_1.ordered = {};
            _.defer(function (f) {
                f.ordered.na = _.orderBy(f.data, ['ll'], ['asc']);
                f.ordered.nd = _.orderBy(f.data, ['ll'], ['desc']);
                f.ordered.ca = _.orderBy(f.data, ['c', 'll'], ['asc', 'asc']);
            }, facet_1);
            facet_1.ordered.cd = _.orderBy(facet_1.data, ['c', 'll'], ['desc', 'asc']);
            // Set facet activity state
            facet_1.active = Boolean(params[facet_1.name]);
        }
    };
    for (var k in basic_facets) {
        _loop_1(k);
    }
    // Free basic_facets
    basic_facets = null;
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
