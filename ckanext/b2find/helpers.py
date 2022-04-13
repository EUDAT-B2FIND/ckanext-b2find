def extras_to_exclude():
    exclude_list = [
        # 'B2SHARE-Domain',
        # 'checksum',
        'fulltext',
        # 'identifiers',
        # 'ManagerVersion',
        # 'MapperVersion',
        # 'maxx', 'maxy', 'minx', 'miny',
        # 'oai_set', 'oai_identifier',
        'PublicationTimestamp',
        'spatial',
        'TempCoverage',
        'TempCoverageBegin',
        'TempCoverageEnd',
        'TemporalCoverage:BeginDate',
        'TemporalCoverage:EndDate']
    return exclude_list


def strip_brackets(*args, **kw):
    if not args:
        return False

    return args[0].strip("{}")


def equals_ignore_case(*args, **kw):
    if not args:
        return False

    try:
        if args[0].lower() == args[1].lower():
            return True
        else:
            return False
    except IndexError:
        return False


def split_extra(*args, **kw):
    if not args:
        return False

    return args[0].split(';')
