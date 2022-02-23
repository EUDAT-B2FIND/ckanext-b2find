from flask import Blueprint
from ckan.plugins.toolkit import request
import ckan.lib.search
import requests

b2find = Blueprint('b2find', __name__)


@b2find.route('/b2find/query', endpoint='query_facets',
              methods=['POST'])
def query_facets():
    content_type = request.headers.get('Content-Type')
    if (content_type != 'application/json'):
        return {}
    json_query = request.json
    print(json_query)

    solr = ckan.lib.search.make_connection()
    resp = requests.post(
        url=f"{solr.url}/query",
        json=json_query)
    return resp.json()
