from flask import Blueprint
from ckan.plugins import toolkit
from ckan.plugins.toolkit import request
import ckan.lib.search

import pandas as pd

import logging

LOGGER = logging.getLogger(__name__)

b2find = Blueprint('b2find', __name__)


@b2find.route('/help/searchguide.html', endpoint='help')
def searchguide():
    return toolkit.render('ckanext/docs/help/searchguide.html')


@b2find.route('/guidelines/index.html', endpoint='guidelines')
def guidelines():
    return toolkit.render('ckanext/docs/guidelines/index.html')


@b2find.route('/guidelines/providing.html', endpoint='guidelines_providing')
def providing():
    return toolkit.render('ckanext/docs/guidelines/providing.html')


@b2find.route('/guidelines/harvesting.html', endpoint='guidelines_harvesting')
def harvesting():
    return toolkit.render('ckanext/docs/guidelines/harvesting.html')


@b2find.route('/guidelines/mapping.html', endpoint='guidelines_mapping')
def mapping():
    return toolkit.render('ckanext/docs/guidelines/mapping.html')


@b2find.route('/b2find/facets/search', endpoint='search_facets', methods=['GET'])
def search_facets():
    solr = ckan.lib.search.make_connection()
    LOGGER.debug(f"solr search request params: {request.params}")
    q = request.params.get('q', '*')
    fq = request.params.get('fq', '*')
    solr_params = {
        'echoParams': 'none',
        'rows': 0,
        'wt': 'json',
        'q': q,
        'fq': fq,
        'facet': 'true',
        'facet.sort': 'index',
        'facet.limit': 100,
        'facet.mincount': 1,
        'facet.field': [
            'author',
            'tags',
            'groups',
            'extras_Publisher',
            'extras_Language',
            'extras_Discipline',
            'extras_Contributor',
            'extras_ResourceType',
            'extras_OpenAccess',
            'extras_Instrument',
        ],
    }
    results = solr.search(**solr_params)
    return results.raw_response


@b2find.route('/b2find/facets/search2', endpoint='search_facets2', methods=['GET'])
def search_facets2():
    solr = ckan.lib.search.make_connection()
    LOGGER.debug(f"solr search2 request params: {request.params}")
    q = request.params.get('q', '*')
    fq = request.params.get('fq', '*')
    field = request.params.get('field', 'creator')
    sort = request.params.get('sort', 'count')
    # ascending = request.params.get('ascending', 'false')
    limit = int(request.params.get('limit', '10'))
    contains = request.params.get('contains')

    b2f_facet_map = dict(
        communities="groups",
        keywords="tags",
        creator="author",
        instrument="extras_Instrument",
        discipline="extras_Discipline",
        language="extras_Language",
        publisher="extras_Publisher",
        contributor="extras_Contributor",
        resourcetype="extras_ResourceType",
        openaccess="extras_OpenAccess",
    )
    facet = b2f_facet_map.get(field)

    solr_params = {
        'echoParams': 'none',
        'rows': 0,
        'wt': 'json',
        'q': q,
        'fq': fq,
        'facet': 'true',
        'facet.sort': sort,
        'facet.limit': limit,
        'facet.mincount': 1,
        'facet.field': [
            facet
        ],
    }
    if contains:
        solr_params['facet.contains'] = contains
        solr_params['facet.contains.ignoreCase'] = 'true'
    search_results = solr.search(**solr_params)
    values = search_results.facets['facet_fields'][facet]
    titles = values[0::2]
    counts = values[1::2]

    df = pd.DataFrame(list(zip(titles, counts)), columns=['title', 'count'])
    # df['label_downcase'] = df.label.str.lower()
    # if sort == "count":
    #     df.sort_values(by=['count', 'label_downcase'], inplace=True, ascending=False)
    # else:
    #     df.sort_values(by=['label_downcase'], inplace=True, ascending=True)

    df['label'] = df.title.str.slice(0, 22)
    results = df[['title', 'count', 'label']].iloc[:limit].to_json(orient="records", indent=0)
    return results
