import json
import ckan.plugins as p


def featured_groups():
    data_dict = {'sort': 'name', 'all_fields': True}
    group_list = p.toolkit.get_action('group_list')
    result = group_list({}, data_dict)
    return result


def extras_to_exclude():
    exclude_list = ['B2SHARE-Domain', 'checksum', 'fulltext', 'identifiers', 'ManagerVersion', 'MapperVersion', 'maxx', 'maxy', 'minx', 'miny', 'oai_set',
                    'oai_identifier', 'PublicationTimestamp', 'spatial', 'TempCoverageBegin', 'TempCoverageEnd', 'TemporalCoverage:BeginDate',
                    'TemporalCoverage:EndDate']
    return exclude_list


def generate_facet_json(items, name, label_function):
    data = []

    for item in items:
        label = label_function(item) if label_function else item.get('display_name')
        if not item.get('name') == label:
            d = dict(l=label, c=item.get('count'), n=item.get('name'))
        else:
            d = dict(l=label, c=item.get('count'))
        data.append(d)

    fdict = {'name': name, 'data': data}

    return json.dumps(fdict, separators=(',', ':'), check_circular=False)
