import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.b2find.helpers as helpers
import ckanext.b2find.blueprints as blueprints


class B2FindPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
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
