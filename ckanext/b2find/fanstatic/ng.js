var app = angular.module('b2findApp', []);
var controllers = {};
controllers.BasicFacetController = function ($scope, $q) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;
    var params = getJsonFromUrl();
    var q = $("#timeline-q").val();
    var fq = JSON.parse($("#timeline-fq").val());
    var populated = false;
    function populate(limit) {
        var solrParams = $.param([
            { name: "echoParams", value: "none" },
            { name: "wt", value: "json" },
            { name: "q", value: q },
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
            { name: "facet.field", value: "extras_Contributor" },
            { name: "facet.field", value: "extras_ResourceType" },
            { name: "facet.field", value: "extras_OpenAccess" },
            { name: "facet.field", value: "extras_Instrument" }
        ].concat(fq.map(function (x) { return ({ name: "fq", value: x }); })));
        var cached = false;
        localforage.getItem("timestamp").then(function (timestamp) {
            if (timestamp && (Date.now() > timestamp + 1000 * 60 * 60)) {
                return localforage.clear();
            }
            return;
        }).then(function () { return $q.all([
            localforage.getItem(solrParams).then(function (data) {
                if (data) {
                    cached = true;
                    return data;
                }
                else {
                    return $.post("/solr/select", solrParams);
                }
            }),
            localforage.getItem("groups").then(function (group_data) {
                if (group_data)
                    return group_data;
                else
                    return $.get("/api/3/action/group_list?all_fields=true");
            })
        ]); }).then(function (result) {
            var data = result[0];
            var group_data = result[1];
            if (!cached) {
                localforage.setItem(solrParams, data);
                localforage.setItem("groups", group_data);
                localforage.setItem("timestamp", Date.now());
            }
            /** Don't populate smaller set */
            if (populated)
                return;
            var groups = _.reduce(group_data.result, function (a, v) {
                a[v.name] = v.title;
                return a;
            }, {});
            //data = JSON.parse(data);
            var fields = data.facet_counts.facet_fields;
            var basic_facets = {
                communities: {
                    data: _(fields.groups).chunk(2).map(function (x) { return _(x).push(groups[x[0]]).reverse().value(); }).value(),
                    name: "groups"
                },
                keywords: { data: _.chunk(fields.tags, 2), name: "tags" },
                creator: { data: _.chunk(fields.author, 2), name: "author" },
                instrument: { data: _.chunk(fields.extras_Instrument, 2), name: "extras_Instrument" },
                discipline: { data: _.chunk(fields.extras_Discipline, 2), name: "extras_Discipline" },
                language: { data: _.chunk(fields.extras_Language, 2), name: "extras_Language" },
                publisher: { data: _.chunk(fields.extras_Publisher, 2), name: "extras_Publisher" },
                contributor: { data: _.chunk(fields.extras_Contributor, 2), name: "extras_Contributor" },
                resourcetype: { data: _.chunk(fields.extras_ResourceType, 2), name: "extras_ResourceType" },
                openaccess: { data: _.chunk(fields.extras_OpenAccess, 2), name: "extras_OpenAccess" }
            };
            /** Mark full population started */
            if (limit == -1)
                populated = true;
            for (var k in basic_facets) {
                if (basic_facets.hasOwnProperty(k)) {
                    var old_facet = $scope[k];
                    // Copy properties over
                    $scope[k] = {
                        name: basic_facets[k].name,
                        data: _.map(basic_facets[k].data, function (x) { return ({ l: x[0], c: x[1], n: x[2] }); })
                    };
                    var facet = $scope[k];
                    // Set previous or empty search filter
                    facet.search = old_facet ? old_facet.search : null;
                    // Set previous or default limit
                    facet.limit = old_facet ? old_facet.limit : $scope.facetMinLimit;
                    // Set previous or default order
                    facet.order = old_facet ? old_facet.order : "cd";
                    facet.data.forEach(function (e) {
                        // Set deburred (ascii) label
                        e.d = _.deburr(e.l.toLowerCase());
                        // Set lowercase label
                        e.ll = e.l.toLowerCase();
                    });
                    // Order data in different ways
                    facet.ordered = {};
                    // Set facet activity state
                    facet.active = Boolean(params[facet.name]);
                }
            }
            $scope.$apply();
        });
    }
    populate(100);
    populate(-1);
    /**
     * Build and return data belonging to facet
     */
    $scope.getData = function (facet) {
        var scope = $scope[facet];
        if (!scope)
            return;
        if (!scope.ordered[scope.order]) {
            switch (scope.order) {
                case "na":
                    scope.ordered.na = _.orderBy(scope.data, ['ll'], ['asc']);
                    break;
                case "nd":
                    scope.ordered.nd = _.orderBy(scope.data, ['ll'], ['desc']);
                    break;
                case "ca":
                    scope.ordered.ca = _.orderBy(scope.data, ['c', 'll'], ['asc', 'asc']);
                    break;
                case "cd":
                    scope.ordered.cd = _.orderBy(scope.data, ['c', 'll'], ['desc', 'asc']);
                    break;
            }
        }
        var ordered = scope.ordered[scope.order];
        if (!scope.search)
            return ordered;
        var pred = _.deburr(scope.search.toLowerCase());
        return _.filter(ordered, function (x) { return _.includes(x.d, pred); });
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
    /**
     * Build and return truncated label
     */
    $scope.truncate = function (e) {
        if (!e.t)
            e.t = _.truncate(e.l, { length: 22 });
        return e.t;
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
