from setuptools import setup, find_packages
import sys, os

version = '1.0'

setup(
    name='ckanext-b2find',
    version=version,
    description="CKAN extension for b2find.eudat.eu",
    long_description='''
    ''',
    classifiers=[], # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
    keywords='',
    author='',
    author_email='',
    url='',
    license='',
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    namespace_packages=['ckanext', 'ckanext.b2find'],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        # -*- Extra requirements: -*-
    ],
    entry_points='''
        [ckan.plugins]
        # Add plugins here, e.g.
        # myplugin=ckanext.b2find.plugin:PluginClass
        b2find=ckanext.b2find.plugin:B2FindPlugin
    ''',
)
