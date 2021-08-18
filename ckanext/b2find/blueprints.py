from flask import Blueprint
from ckan.plugins import toolkit
from ckan.plugins.toolkit import request
import ckan.lib.search

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


@b2find.route('/b2find/facets/search', endpoint='search_facets', methods=['GET', 'POST'])
def search_facets():
    solr = ckan.lib.search.make_connection()
    LOGGER.debug(f"solr search request params: {request.params}")
    q = request.params.get('q')
    fq = request.params.get('fq')
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
