import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.b2find.helpers as helpers


class B2FindPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IRoutes, inherit=True)

    def get_helpers(self):
        return {
            'featured_groups': helpers.featured_groups,
            'extras_to_exclude': helpers.extras_to_exclude
        }

    def update_config(self, config):
        toolkit.add_public_directory(config, 'public')
        toolkit.add_template_directory(config, 'templates')
        toolkit.add_resource('fanstatic', 'b2find_theme')

    def dataset_facets(self, facets_dict, package_type):
        return self._facets(facets_dict)

    def group_facets(self, facets_dict, group_type, package_type):
        return self._facets(facets_dict)

    def organization_facets(self, facets_dict, organization_type, package_type):
        return self._facets(facets_dict)

    def after_map(self, map):
        map.connect(
            'legal',
            '/legal',
            controller='ckanext.b2find.controller:LegalController',
            action='index'
        )
        map.connect(
            'legal_action',
            '/legal/{action}.html',
            controller='ckanext.b2find.controller:LegalController'
        )
        map.connect(
            'docs_search_guide',
            '/docs/b2find_search-guide.html',
            controller='ckanext.b2find.controller:DocsController',
            action='search_guide'
        )

        return map

    def _facets(self, facets_dict):
        # Deleted facets
        facets_dict.pop('organization', None)
        facets_dict.pop('license_id', None)
        facets_dict.pop('res_format', None)

        # Renamed facets
        if 'groups' in facets_dict:
            facets_dict['groups'] = 'Communities'

        # New facets
        facets_dict['author'] = 'Creator'
        facets_dict['extras_Discipline'] = 'Discipline'
        facets_dict['extras_Language'] = 'Language'
        facets_dict['extras_Publisher'] = 'Publisher'
        # facets_dict['extras_Origin'] = 'Origin'
        # facets_dict['extras_PublicationYear'] = 'Publication Year'
        # facets_dict['extras_Format'] = 'Format'

        return facets_dict
