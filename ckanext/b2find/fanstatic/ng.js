var app = angular.module('b2findApp', []);
var controllers = {};
controllers.BasicFacetController = function ($scope) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;
    var params = getJsonFromUrl();
    var q = $("#timeline-q").val();
    var fq = $("#timeline-fq").val();
    $.post("/api/3/action/group_list?all_fields=true").then(function (group_data) {
        var groups = _.reduce(group_data.result, function (a, v) {
            a[v.name] = v.title;
            return a;
        }, {});
        var _loop_1 = function(limit) {
            var solrParams = $.param([
                { name: "echoParams", value: "none" },
                { name: "wt", value: "json" },
                { name: "q", value: q },
                { name: "fq", value: fq },
                { name: "rows", value: 0 },
                { name: "facet", value: true },
                { name: "facet.limit", value: limit },
                { name: "facet.mincount", value: 1 },
                { name: "facet.field", value: "author" },
                { name: "facet.field", value: "tags" },
                { name: "facet.field", value: "groups" },
                { name: "facet.field", value: "extras_Publisher" },
                { name: "facet.field", value: "extras_Language" },
                { name: "facet.field", value: "extras_Discipline" },
            ]);
            $.post("/solr/select", solrParams).then(function (data) {
                data = JSON.parse(data);
                var fields = data.facet_counts.facet_fields;
                var basic_facets = {
                    communities: {
                        data: _(fields.groups).chunk(2).map(function (x) { return _(x).push(groups[x[0]]).reverse().value(); }).value(),
                        name: "groups"
                    },
                    tags: { data: _.chunk(fields.tags, 2), name: "tags" },
                    creator: { data: _.chunk(fields.author, 2), name: "author" },
                    discipline: { data: _.chunk(fields.extras_Discipline, 2), name: "extras_Discipline" },
                    language: { data: _.chunk(fields.extras_Language, 2), name: "extras_Language" },
                    publisher: { data: _.chunk(fields.extras_Publisher, 2), name: "extras_Publisher" }
                };
                var _loop_2 = function(k) {
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
                            e.d = _.deburr(e.l.toLowerCase());
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
                    _loop_2(k);
                }
                $scope.$apply();
            });
        };
        for (var _i = 0, _a = [100, -1]; _i < _a.length; _i++) {
            var limit = _a[_i];
            _loop_1(limit);
        }
    });
    $scope.deburr = _.deburr;
    /**
     * Return data belonging to facet
     */
    $scope.getData = function (facet) {
        var scope = $scope[facet];
        if (!scope)
            return;
        var ordered = scope.ordered[scope.order];
        if (!scope.search)
            return ordered;
        var pred = _.deburr(scope.search.toLowerCase());
        return _.filter(ordered, function (x) { return _.includes(x.d, pred); });
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
