import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.b2find.helpers as helpers
import ckanext.b2find.blueprints as blueprints
from ckan.common import c

from ckanext.b2find import timeline, pubyear

import json


class B2FindPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IPackageController, inherit=True)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IBlueprint)

    # IConfigurer

    def get_helpers(self):
        return {
            'featured_groups': helpers.featured_groups,
            'extras_to_exclude': helpers.extras_to_exclude,
            'link_fields': helpers.link_fields,
            'strip_brackets': helpers.strip_brackets,
            'equals_ignore_case': helpers.equals_ignore_case,
            'split_extra': helpers.split_extra
        }

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_public_directory(config_, 'fanstatic')
        toolkit.add_resource('fanstatic', 'ckanext-b2find')
        return config_

    def before_search(self, search_params):
        search_params = pubyear.before_search(search_params)
        search_params = timeline.before_search(search_params)
        return search_params

    def after_search(self, search_results, search_params):
        # Exports Solr 'q' and 'fq' to the context so the timeline can use them
        c.timeline_q = search_params.get('q', '')
        c.timeline_fq = json.dumps(search_params.get('fq', []))

        search_params = timeline.after_search(search_params)
        search_params = pubyear.after_search(search_params)
        return search_results

    def dataset_facets(self, facets_dict, package_type):
        return self._facets(facets_dict)

    def group_facets(self, facets_dict, group_type, package_type):
        return self._facets(facets_dict)

    def organization_facets(self, facets_dict, organization_type, package_type):
        return self._facets(facets_dict)

    def get_blueprint(self):
        return [blueprints.b2find]

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
#        facets_dict['instrument'] = 'Instrument'
        facets_dict['extras_Discipline'] = 'Discipline'
        facets_dict['extras_Language'] = 'Language'
        facets_dict['extras_Publisher'] = 'Publisher'
        facets_dict['extras_Contributor'] = 'Contributor'
        facets_dict['extras_ResourceType'] = 'ResourceType'
        facets_dict['extras_OpenAccess'] = 'OpenAccess'

        return facets_dict
