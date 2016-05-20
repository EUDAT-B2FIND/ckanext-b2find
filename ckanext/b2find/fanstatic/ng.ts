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

controllers.BasicFacetController = function ($scope) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;

    const params = getJsonFromUrl();
    const q = $("#timeline-q").val();
    const fq = $("#timeline-fq").val();

    $.post("/api/3/action/group_list?all_fields=true").then(
        (group_data) => {
            const groups = _.reduce(group_data.result, (a, v) => {
                a[v.name] = v.title;
                return a;
            }, {});

            for (const limit of [100, -1]) {
                $.post("/solr/select",
                    $.param([
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
                    ])
                ).then((data) => {
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
                                // Set truncated label
                                e.t = _.truncate(e.l, {length: 22});

                                // Set deburred (ascii) label
                                e.d = _.deburr(e.l.toLowerCase());

                                // Set lowercase label
                                e.ll = e.l.toLowerCase();

                                // Set element activity state
                                e.a = params[facet.name] ?
                                    params[facet.name].some((value) => value == (e.n ? e.n : e.l))
                                    : false;

                                // Set element href
                                e.h = "/dataset?" + jQuery.param(((name:string, n_params:Object):Object => {
                                        if (!n_params[name]) {
                                            n_params[name] = [];
                                        }
                                        const value = e.n ? e.n : e.l;
                                        _.includes(n_params[name], value) ?
                                            _.pull(n_params[name], value)
                                            : n_params[name].push(value);
                                        return n_params;
                                    })(facet.name, angular.copy(params)), true);
                            });

                            // Order data in different ways
                            facet.ordered = {};
                            _.defer((f) => {
                                f.ordered.na = _.orderBy(f.data, ['ll'], ['asc']);
                                f.ordered.nd = _.orderBy(f.data, ['ll'], ['desc']);
                                f.ordered.ca = _.orderBy(f.data, ['c', 'll'], ['asc', 'asc']);
                            }, facet);
                            facet.ordered.cd = _.orderBy(facet.data, ['c', 'll'], ['desc', 'asc']);

                            // Set facet activity state
                            facet.active = Boolean(params[facet.name]);
                        }
                    }

                    $scope.$apply();
                });
            }
        });

    $scope.deburr = _.deburr;

    /**
     * Return data belonging to facet
     */
    $scope.getData = function (facet:string):FacetItem[] {
        const scope = $scope[facet];
        if (!scope)
            return;
        const ordered = <FacetItem[]> scope.ordered[scope.order];
        if (!scope.search)
            return ordered;
        const pred = _.deburr(scope.search.toLowerCase());
        return _.filter(ordered, (x) => _.includes(x.d, pred));
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
