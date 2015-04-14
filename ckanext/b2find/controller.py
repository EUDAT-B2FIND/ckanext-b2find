import ckan.plugins as plugins
import ckan.lib.base as base


class LegalController(base.BaseController):
    def index(self):
        return plugins.toolkit.render('ckanext/legal/index.html')

    def datenschutz(self):
        return plugins.toolkit.render('ckanext/legal/datenschutz.html')

    def nutzungsbedingungen(self):
        return plugins.toolkit.render('ckanext/legal/nutzungsbedingungen.html')


class DocsController(base.BaseController):
    def search_guide(self):
        return plugins.toolkit.render('ckanext/docs/b2find_search-guide.html')
