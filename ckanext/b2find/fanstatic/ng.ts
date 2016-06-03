/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts" />

interface FacetItem {
    a:boolean
    c:number,
    d:string
    h:string
    l:string,
    ll:string
    n:string,
    t:string
}

interface Facet {
    name:string,
    data:FacetItem[]
}

const app = angular.module('b2findApp', []);
const controllers = {};

controllers.BasicFacetController = function ($scope, $q) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;

    const params = getJsonFromUrl();
    const q = $("#timeline-q").val();
    const fq = $("#timeline-fq").val();
    let populated = false;

    function populate(limit) {
        const solrParams = $.param([
            {name: "echoParams", value: "none"},
            {name: "wt", value: "json"},
            {name: "q", value: q},
            {name: "fq", value: fq},
            {name: "rows", value: 0},
            {name: "facet", value: true},
            {name: "facet.limit", value: limit},
            {name: "facet.mincount", value: 1},
            {name: "facet.field", value: "author"},
            {name: "facet.field", value: "tags"},
            {name: "facet.field", value: "groups"},
            {name: "facet.field", value: "extras_Publisher"},
            {name: "facet.field", value: "extras_Language"},
            {name: "facet.field", value: "extras_Discipline"},
        ]);
        let cached = false;

        localforage.getItem("timestamp").then((timestamp) => {
            if (timestamp && (Date.now() > timestamp + 1000 * 60 * 60)) {
                return localforage.clear();
            }
            return;
        }).then(
            () => $q.all([
                localforage.getItem(solrParams).then(
                    (data) => {
                        if (data) {
                            cached = true;
                            return data;
                        }
                        else {
                            return $.post("/solr/select", solrParams);
                        }
                    }),
                localforage.getItem("groups").then(
                    (group_data) => {
                        if (group_data)
                            return group_data;
                        else
                            return $.get("/api/3/action/group_list?all_fields=true");
                    })
            ])
        ).then((result) => {
            let data = result[0];
            let group_data = result[1];

            if (!cached) {
                localforage.setItem(solrParams, data);
                localforage.setItem("groups", group_data);
                localforage.setItem("timestamp", Date.now());
            }

            /** Don't populate smaller set */
            if (populated)
                return;

            const groups = _.reduce(group_data.result, (a, v) => {
                a[v.name] = v.title;
                return a;
            }, {});
            data = <SolrReply> JSON.parse(data);
            const fields = data.facet_counts.facet_fields;
            const basic_facets = {
                communities: {
                    data: _(<Array<string>>fields.groups).chunk(2).map((x) => _(x).push(groups[x[0]]).reverse().value()).value(),
                    name: "groups"
                },
                tags: {data: _.chunk(fields.tags, 2), name: "tags"},
                creator: {data: _.chunk(fields.author, 2), name: "author"},
                discipline: {data: _.chunk(fields.extras_Discipline, 2), name: "extras_Discipline"},
                language: {data: _.chunk(fields.extras_Language, 2), name: "extras_Language"},
                publisher: {data: _.chunk(fields.extras_Publisher, 2), name: "extras_Publisher"},
            };

            /** Mark full population started */
            if (limit == -1)
                populated = true;

            for (const k in basic_facets) {
                if (basic_facets.hasOwnProperty(k)) {
                    // Copy properties over
                    $scope[k] = <Facet> {
                        name: basic_facets[k].name,
                        data: <FacetItem[]> _.map(basic_facets[k].data, (x) => ({l: x[0], c: x[1], n: x[2]})),
                    };

                    const facet = $scope[k];

                    // Set default limit for facet items
                    facet.limit = $scope.facetMinLimit;

                    // Set default order
                    facet.order = "cd";

                    facet.data.forEach(function (e:FacetItem) {
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
    $scope.getData = function (facet:string):FacetItem[] {
        const scope = $scope[facet];
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

        const ordered = <FacetItem[]> scope.ordered[scope.order];

        if (!scope.search)
            return ordered;
        const pred = _.deburr(scope.search.toLowerCase());
        return _.filter(ordered, (x) => _.includes(x.d, pred));
    };

    /**
     * Build and return element href
     */
    $scope.href = function (e, name) {
        if (!e.h) {
            e.h = "/dataset?" + jQuery.param(((name:string, n_params:Object):Object => {
                    if (!n_params[name]) {
                        n_params[name] = [];
                    }
                    const value = e.n ? e.n : e.l;
                    _.includes(n_params[name], value) ?
                        _.pull(n_params[name], value)
                        : n_params[name].push(value);
                    return n_params;
                })(name, angular.copy(params)), true);

            // Set element activity state
            e.a = params[name] ?
                params[name].some((value) => value == (e.n ? e.n : e.l))
                : false;
        }
        return e.h;
    };

    /**
     * Build and return truncated label
     */
    $scope.truncate = function (e) {
        if (!e.t)
            e.t = _.truncate(e.l, {length: 22});
        return e.t;
    };
};

app.controller(controllers);

/**
 * Build object of GET parameters from location URL
 * Modification of http://stackoverflow.com/a/8486188
 */
function getJsonFromUrl():Object {
    const query = location.search.substr(1);
    const result = {};
    query.split("&").forEach((part) => {
        const item = part.split("=");
        if (item[1]) {
            if (!result[item[0]]) {
                result[item[0]] = [];
            }
            result[item[0]].push(decodeURIComponent(item[1]).replace(/\+/g, " "));
        }
    });
    return result;
}
