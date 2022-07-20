import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckanext.b2find.blueprints as blueprints
import ckanext.b2find.helpers as helpers


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
        toolkit.add_resource('public/b2find', 'ckanext-b2find')
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
        # facets_dict.pop('organization', None)
        # facets_dict.pop('license_id', None)
        # facets_dict.pop('res_format', None)

        # Renamed facets
        if 'organization' in facets_dict:
            facets_dict['organization'] = 'Repositories'
        if 'groups' in facets_dict:
            facets_dict['groups'] = 'Communities'
        if 'tags' in facets_dict:
            facets_dict['tags'] = 'Keywords'
        facets_dict['author'] = 'Creator'

        # New facets
        facets_dict['extras_TempCoverage'] = 'TemporalCoverage'
        facets_dict['extras_PublicationYear'] = 'PublicationYear'
        facets_dict['extras_bbox'] = 'BoundingBox'
        facets_dict['extras_spatial'] = 'Geometry'
        facets_dict['extras_Instrument'] = 'Instrument'
        facets_dict['extras_Discipline'] = 'Discipline'
        facets_dict['extras_Language'] = 'Language'
        facets_dict['extras_Publisher'] = 'Publisher'
        facets_dict['extras_Contributor'] = 'Contributor'
        facets_dict['extras_ResourceType'] = 'ResourceType'
        facets_dict['extras_FundingReference'] = 'FundingReference'
        facets_dict['extras_OpenAccess'] = 'OpenAccess'

        return facets_dict

    def before_search(self, search_params):
        if 'q' in search_params:
            search_params['defType'] = 'edismax'
            q = search_params['q']
            if len(q) > 3:
                q += "~"
                search_params['q'] = q 
            # print(search_params)   
        return search_params
    
    # IBlueprint
    def get_blueprint(self):
        return [blueprints.b2find]
