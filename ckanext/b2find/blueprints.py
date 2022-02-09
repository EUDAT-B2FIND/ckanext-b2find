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
              methods=['GET'])
def query_facets():
    solr = ckan.lib.search.make_connection()
    query = request.params.get('q', '*:*')
    filter = request.params.get('fq', '*')
    field = request.params.get('field', 'tags')
    limit = int(request.params.get('limit', 10))
    sort = request.params.get('sort', 'cd')

    json_query = {
      "query": query,
      "filter": filter,
      "limit": 0,
      "facet": {},
    }

    json_query["facet"][field] = {
        "type": "terms",
        "field": field,
        "limit": limit,
        "mincount": 1,
        "sort": _translate_sort(sort),
    }

    resp = requests.post(
        url=f"{solr.url}/query",
        json=json_query)

    # print(resp.json())
    result = {}
    if field in resp.json()["facets"]:
        result["items"] = resp.json()["facets"][field]["buckets"]
    else:
        result["items"] = []
    return result
