from flask import Blueprint
from ckan.plugins.toolkit import request
import ckan.lib.search
import requests

b2find = Blueprint('b2find', __name__)


def _translate_sort(sort=None):
    if sort == "cd":
        sort_param = {"count": "desc"}
    elif sort == "ca":
        sort_param = {"count": "asc"}
    elif sort == "id":
        sort_param = {"index": "desc"}
    elif sort == "ia":
        sort_param = {"index": "asc"}
    else:
        sort_param = {"count": "desc"}
    return sort_param


@b2find.route('/b2find/query', endpoint='query_facets',
              methods=['POST'])
def query_facets():
    print("query")
    content_type = request.headers.get('Content-Type')
    if (content_type != 'application/json'):
        return {}
    json_query = request.json

    solr = ckan.lib.search.make_connection()
    resp = requests.post(
        url=f"{solr.url}/query",
        json=json_query)
    return resp.json()
