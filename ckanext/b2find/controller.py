import ckan.plugins as plugins
import ckan.lib.base as base

class LegalController(base.BaseController):
    def index(self):
        return plugins.toolkit.render('ckanext/legal/index.html')

    def nutzungsbedingungen(self):
        return plugins.toolkit.render('ckanext/legal/nutzungsbedingungen.html')

class HelpController(base.BaseController):
    def searchguide(self):
        return plugins.toolkit.render('ckanext/docs/help/searchguide.html')

class GuidelinesController(base.BaseController):
    def index(self):
        return plugins.toolkit.render('ckanext/docs/guidelines/index.html')

    def providing(self):
        return plugins.toolkit.render('ckanext/docs/guidelines/providing.html')

    def harvesting(self):
        return plugins.toolkit.render('ckanext/docs/guidelines/harvesting.html')

    def mapping(self):
        return plugins.toolkit.render('ckanext/docs/guidelines/mapping.html')
