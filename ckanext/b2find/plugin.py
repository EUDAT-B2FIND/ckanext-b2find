# encoding: utf-8
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.b2find.helpers as helpers

def legacy_pager(self, *args, **kwargs):
    kwargs.update(
        format=u"<div class='pagination-wrapper pagination pagination-centered'><ul>"
        "$link_previous ~2~ $link_next</ul></div>",
        symbol_previous=u'«', symbol_next=u'»',
        curpage_attr={'class': 'active'}, link_attr={}
    )
    from ckan.lib.helpers import Page
    return super(Page, self).pager(*args, **kwargs)

class B2FindPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IRoutes, inherit=True)

    def get_helpers(self):
        return {
            'featured_groups': helpers.featured_groups,
            'extras_to_exclude': helpers.extras_to_exclude,
            'link_fields': helpers.link_fields,
            'strip_brackets': helpers.strip_brackets,
            'equals_ignore_case': helpers.equals_ignore_case,
            'split_extra': helpers.split_extra
        }

    def update_config(self, config):
        toolkit.add_public_directory(config, 'public')
        toolkit.add_template_directory(config, 'templates')
        toolkit.add_resource('fanstatic', 'ckanext-b2find')

        if 'ckan.base_templates_folder' in config and config['ckan.base_templates_folder'] == 'templates-bs2':
            from ckan.lib.helpers import Page
            Page.pager = legacy_pager
        return config

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
