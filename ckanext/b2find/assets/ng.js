var app = angular.module('b2findApp', []);
var controllers = {};
console.log("b2f ng");
controllers.BasicFacetController = function ($scope, $q) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;
    console.log("b2f controller");
    var params = getJsonFromUrl();
    // var q = "*:*"; // $("#timeline-q").val();
    // var fq = "*"; // JSON.parse($("#timeline-fq").val());

    /**
     * Build and return data belonging to facet
     */
    $scope.getData = function (facet) {
        console.log("b2f getData: " + facet);
        var scope = $scope[facet];
        scope = {};
        console.log("b2f scope: " + scope);
        // call solr
        // Set previous or empty search filter
        scope.search = null;
        // Set previous or default limit
        scope.limit = $scope.facetMinLimit;
        // Set previous or default order
        scope.order = "cd";
        // Set facet activity state
        scope.active = Boolean(params[facet.name]);
        var solrParams = $.param([
            { name: "q", value: q },
            { name: "field", value: facet },
            { name: "limit", value: 10 },
        ].concat(fq.map(function (x) { return ({ name: "fq", value: x }); })) );
        $.ajax({
            async: false,
            type: "GET",
            url: "/b2find/query",
            data: solrParams,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                scope.data = data;
                console.log("b2f data: " + scope.data);
            }
        });
        return scope.data;
    };
    /**
     * Build and return element href
     */
    $scope.href = function (e, name) {
        if (!e.h) {
            e.h = "/dataset?" + jQuery.param((function (name, n_params) {
                if (!n_params[name]) {
                    n_params[name] = [];
                }
                var value = e.n ? e.n : e.l;
                _.includes(n_params[name], value) ?
                    _.pull(n_params[name], value)
                    : n_params[name].push(value);
                return n_params;
            })(name, angular.copy(params)), true);
            // Set element activity state
            e.a = params[name] ?
                params[name].some(function (value) { return value == (e.n ? e.n : e.l); })
                : false;
        }
        return e.h;
    };
};
console.log("b2f ng2");
app.controller(controllers);
/**
 * Build object of GET parameters from location URL
 * Modification of http://stackoverflow.com/a/8486188
 */
function getJsonFromUrl() {
    console.log("getJsonFromUrl");
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
  console.log("b2f ng3");
