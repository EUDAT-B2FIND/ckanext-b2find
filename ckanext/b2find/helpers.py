import json
import ckan.plugins as p


def featured_groups():
    data_dict = {'sort': 'name', 'all_fields': True}
    group_list = p.toolkit.get_action('group_list')
    result = group_list({}, data_dict)
    return result

def extras_to_exclude():
    exclude_list = ['B2SHARE-Domain', 'checksum', 'fulltext', 'identifiers', 'ManagerVersion', 'MapperVersion',
                    'maxx', 'maxy', 'minx', 'miny', 'oai_set', 'oai_identifier', 'PublicationTimestamp', 'spatial',
                    'TempCoverageBegin', 'TempCoverageEnd', 'TemporalCoverage:BeginDate', 'TemporalCoverage:EndDate']
    return exclude_list

def link_fields():
    field_list = [ 'MetaDataAccess', 'PID', 'DOI' ]
    return field_list

def equals_ignore_case(*args, **kw):
    '''
    '''
    if not args:
        return False

    try:
        if args[0].lower() == args[1].lower():
            return True
        else:
            return False
    except IndexError:
        return False
