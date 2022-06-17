from flask import Blueprint
from ckan.plugins import toolkit
import ckan.lib.search
import requests

b2find = Blueprint('b2find', __name__)


@b2find.route('/b2find/query', endpoint='query_facets',
              methods=['POST'])
def query_facets():
    content_type = toolkit.request.headers.get('Content-Type')
    if (content_type != 'application/json'):
        return {}
    json_query = toolkit.request.json
    # print(json_query)

    solr = ckan.lib.search.make_connection()
    resp = requests.post(
        url=f"{solr.url}/query",
        json=json_query)
    return resp.json()


@b2find.route('/b2find/facet_labels', endpoint='get_facet_labels',
              methods=['GET'])
def get_facet_labels():
    # Get a list of the members of the 'curators' group.
    # https://docs.ckan.org/en/2.9/api/index.html#api-reference
    # 
    # edit ckan.ini to set limits:
    # ckan.group_and_organization_list_max = 1000
    # ckan.group_and_organization_list_all_fields_max = 100 
    #
    groups = toolkit.get_action('group_list')(data_dict={'all_fields': True, 'limit': 1000})
    organizations = toolkit.get_action('organization_list')(data_dict={'all_fields': True, 'limit': 1000})

    labels = {
        'organization':{},
        'groups':{},
    }

    for group in groups:
        labels['groups'][group['name']] = group['title']

    for org in organizations:
        labels['organization'][org['name']] = org['title']

    return labels
