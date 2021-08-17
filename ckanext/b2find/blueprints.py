from flask import Blueprint
from ckan.plugins import toolkit
from ckantoolkit import request
import ckan.lib.search

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


@b2find.route('/mysolr/select', endpoint='solr_select', methods=['GET', 'POST'])
def solr_select():
    solr = ckan.lib.search.make_connection()
    # print(f"request params: {request.params}")
    solr_params = {
        'echoParams': 'none',
        'rows': 0,
        'wt': 'json',
        'q': '*',
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
