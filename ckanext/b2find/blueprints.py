from flask import Blueprint
from ckan.plugins.toolkit import request
import ckan.lib.search
import requests

import logging

LOGGER = logging.getLogger(__name__)

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
    LOGGER.debug(f"solr search request params: {request.params}")
    query = request.params.get('q', '*:*')
    filter = request.params.get('fq', '*')
    sort = request.params.get('sort', 'tags:cd')
    limit = 3

    fields = [
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
    ]

    json_query = {
      "query": query,
      "filter": filter,
      "limit": 0,
      "facet": {},
    }

    fields_sort = {}
    for item in sort.split(","):
        key, val = item.split(":")
        fields_sort[key] = _translate_sort(val)

    for field in fields:
        json_query["facet"][field] = {
          "type": "terms",
          "field": field,
          "limit": limit,
          "mincount": 1,
          "sort": fields_sort.get(field, _translate_sort()),
        }

    resp = requests.post(
        url=f"{solr.url}/query",
        json=json_query)

    print(resp.json())
    return resp.json()
