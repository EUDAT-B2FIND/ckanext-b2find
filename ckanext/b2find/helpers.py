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
