from flask import Blueprint
from ckan.plugins import toolkit

b2find = Blueprint('b2find', __name__)


@b2find.route('/help/searchguide.html', endpoint='help')
def searchguide():
    return toolkit.render('ckanext/docs/help/searchguide.html')


@b2find.route('/guidelines/index.html', endpoint='guidelines')
def guidelines():
    return toolkit.render('ckanext/docs/guidelines/index.html')


@b2find.route('/guidelines/providing.html', endpoint='guidelines_providing')
def providing():
    return toolkit.render('ckanext/docs/guidelines/providing.html')


@b2find.route('/guidelines/harvesting.html', endpoint='guidelines_harvesting')
def harvesting():
    return toolkit.render('ckanext/docs/guidelines/harvesting.html')


@b2find.route('/guidelines/mapping.html', endpoint='guidelines_mapping')
def mapping():
    return toolkit.render('ckanext/docs/guidelines/mapping.html')
