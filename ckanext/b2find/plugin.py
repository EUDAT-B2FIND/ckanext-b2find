import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.b2find.blueprints as blueprints
import ckanext.b2find.helpers as helpers
from ckan.common import c

import json


class B2FindPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IPackageController, inherit=True)
    plugins.implements(plugins.IBlueprint)

    # IConfigurer
    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_public_directory(config_, 'assets')
        toolkit.add_resource('assets', 'ckanext-b2find')
        return config_

    # ITemplateHelpers
    def get_helpers(self):
        return {
            'extras_to_exclude': helpers.extras_to_exclude,
            'strip_brackets': helpers.strip_brackets,
            'equals_ignore_case': helpers.equals_ignore_case,
            'split_extra': helpers.split_extra
        }

    # IFacets
    def dataset_facets(self, facets_dict, package_type):
        return self._facets(facets_dict)

    def group_facets(self, facets_dict, group_type, package_type):
        return self._facets(facets_dict)

    def organization_facets(self, facets_dict, organization_type, package_type):
        return self._facets(facets_dict)

    def _facets(self, facets_dict):
        # Deleted facets
        facets_dict.pop('organization', None)
        facets_dict.pop('license_id', None)
        facets_dict.pop('res_format', None)

        # Renamed facets
        if 'groups' in facets_dict:
            facets_dict['groups'] = 'Communities'
        if 'tags' in facets_dict:
            facets_dict['tags'] = 'Keywords'

        # New facets
        facets_dict['author'] = 'Creator'
        facets_dict['extras_Instrument'] = 'Instrument'
        facets_dict['extras_Discipline'] = 'Discipline'
        facets_dict['extras_Language'] = 'Language'
        facets_dict['extras_Publisher'] = 'Publisher'
        facets_dict['extras_Contributor'] = 'Contributor'
        facets_dict['extras_ResourceType'] = 'ResourceType'
        facets_dict['extras_OpenAccess'] = 'OpenAccess'

        return facets_dict

    # IPackageController
    def before_search(self, search_params):
        search_params = self.pubyear_before_search(search_params)
        search_params = self.tempcov_before_search(search_params)
        return search_params

    def pubyear_before_search(self, search_params):
        # publication year
        start = end = None
        extras = search_params.get('extras')
        if extras:
            start = extras.get('ext_pstart')
            end = extras.get('ext_pend')
        # print(search_params)

        if not start and not end:
            # The user didn't select either a start and/or end date, so do nothing.
            return search_params
        start = start or '*'
        end = end or '*'

        # Add a date-range query with the selected start and/or end dates into the Solr facet queries.
        fq = search_params.get('fq', '')
        print(type(fq))
        print(fq)
        fq = f"{fq} extras_PublicationYear:[{start} TO {end}]"

        search_params['fq'] = fq
        return search_params

    def tempcov_before_search(self, search_params):
        # publication year
        start = end = None
        extras = search_params.get('extras')
        if extras:
            start = extras.get('ext_tstart')
            end = extras.get('ext_tend')
        # print(search_params)

        if not start and not end:
            # The user didn't select either a start and/or end date, so do nothing.
            return search_params
        start = start or '*'
        end = end or '*'

        # Add a date-range query with the selected start and/or end dates into the Solr facet queries.
        fq = search_params.get('fq', '')
        fq = f"{fq} extras_TempCoverage:[{start}-01-01T00:00:00Z TO {end}-12-31T23:59:59Z]"

        search_params['fq'] = fq
        return search_params

    def after_search(self, search_results, search_params):
        # Exports Solr 'q' and 'fq' to the context so the timeline can use them
        # c.timeline_q = search_params.get('q', '')
        # print("after", search_params.get('fq'))
        c.b2find_fq = json.dumps(search_params.get('fq', []))
        return search_results

    # IBlueprint
    def get_blueprint(self):
        return [blueprints.b2find]
