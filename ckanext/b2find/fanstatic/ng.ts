/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/lodash/lodash.d.ts" />

interface FacetItem {
    l:string,
    c:number,
    n:string,
    h?:string
}

interface Facet {
    name:string,
    data:FacetItem[]
}

declare var basic_facets:Object;
const app = angular.module('b2findApp', []);
const controllers = {};

controllers.BasicFacetController = function ($scope) {
    $scope.facetMinLimit = 10;
    $scope.facetMaxLimit = 100;

    const params = getJsonFromUrl();

    /** Bail out if basic_facets not defined */
    if (typeof basic_facets === 'undefined') {
        return;
    }

    for (let k in basic_facets) {
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
                // Set truncated label (lazily)
                define(e, 't', ():string => _.trunc(e.l, 22));

                // Set deburred (ascii) label (lazily)
                define(e, 'd', ():string => _.deburr(e.l));

                // Set lowercase label (lazily)
                define(e, 'll', ():string => e.l.toLowerCase());

                // Set element activity state (lazily)
                define(e, 'a', ((x:string, y:FacetItem):Function =>
                    ():boolean => params[x] ?
                        params[x].some((value) => value == (y.n ? y.n : y.l))
                        : false)(facet.name, e));

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
                f.ordered.na = _.sortByOrder(f.data, ['ll'], ['asc']);
                f.ordered.nd = _.sortByOrder(f.data, ['ll'], ['desc']);
                f.ordered.ca = _.sortByOrder(f.data, ['c', 'll'], ['asc', 'asc'])
            }, facet);
            facet.ordered.cd = _.sortByOrder(facet.data, ['c', 'll'], ['desc', 'asc']);

            // Set facet activity state
            facet.active = Boolean(params[facet.name]);
        }
    }

    // Free basic_facets
    basic_facets = null;

    /**
     * Defines a lazy property on object
     * Copyright (c) 2012 John Crepezzi
     * The MIT License
     * https://github.com/seejohnrun/laze
     */
    function define(obj:Object, prop:string, def:Function) {
        Object.defineProperty(obj, prop, {
            configurable: true,
            enumerable: true,
            get: function () {
                const value = def.bind(this)();
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
    function defineAll(obj:Object, props:Object) {
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                define(obj, key, props[key]);
            }
        }
    }

    $scope.deburr = _.deburr;

    /**
     * Return data belonging to facet
     */
    $scope.getData = function (facet:string):FacetItem[] {
        const scope = $scope[facet];
        return scope.ordered[scope.order]
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
