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
        return plugins.toolkit.render('ckanext/docs/search-guide.html')

class HelpController(base.BaseController):
    def index(self):
        return plugins.toolkit.render('ckanext/help/index.html')

    def search_guide(self):
        return plugins.toolkit.render('ckanext/help/search-guide.html')

    def termofuse(self):
        return plugins.toolkit.render('ckanext/help/termofuse.html')

    def dataprotection(self):
        return plugins.toolkit.render('ckanext/help/dataprotection.html')

class GuidelinesController(base.BaseController):
    def introduction(self):
        return plugins.toolkit.render('ckanext/guidelines/introduction.html')

    def providing(self):
        return plugins.toolkit.render('ckanext/guidelines/providing.html')

    def harvesting(self):
        return plugins.toolkit.render('ckanext/guidelines/harvesting.html')

    def mdschema(self):
        return plugins.toolkit.render('ckanext/guidelines/mdschema.html')

    def mapping(self):
        return plugins.toolkit.render('ckanext/guidelines/mapping.html')


class ContactController(base.BaseController):
    def index(self):
        return plugins.toolkit.render('ckanext/contact/index.html')

    def eudatcontact(self):
        return plugins.toolkit.render('ckanext/contact/eudatcontact.html')

    def applyform(self):
        return plugins.toolkit.render('ckanext/contact/applyform.html')

