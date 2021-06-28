import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit


class B2FindPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic',
            'b2find')
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
            'help_action',
            '/help/{action}.html',
            controller='ckanext.b2find.controller:HelpController'
        )
        map.connect(
            'guidelines',
            '/guidelines',
            controller='ckanext.b2find.controller:GuidelinesController',
            action='index'
        )
        map.connect(
            'guidelines_action',
            '/guidelines/{action}.html',
            controller='ckanext.b2find.controller:GuidelinesController'
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
