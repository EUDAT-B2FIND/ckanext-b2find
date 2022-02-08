import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.b2find.blueprints as blueprints
import ckanext.b2find.helpers as helpers

# from ckan.lib.search.query import VALID_SOLR_PARAMETERS
# VALID_SOLR_PARAMETERS.add('json.facet')
# VALID_SOLR_PARAMETERS.add('facet.sort')


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
        # toolkit.add_public_directory(config_, 'assets')
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
        # search_params["rows"] = 3
        # search_params["facet"] = "true"
        # search_params["facet.limit"] = 3
        # search_params["facet.sort"] = "count"
        # search_params["json.facet"] = '{"tags":{"type":"terms", "field":"tags","limit":3,"sort":{"count":"asc"}}}'
        # print(search_params)
        return search_params

    def after_search(self, search_results, search_params):
        # print(search_results)
        return search_results

    # IBlueprint
    def get_blueprint(self):
        return [blueprints.b2find]
