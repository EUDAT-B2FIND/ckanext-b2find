from setuptools import setup, find_packages

setup(
    name='ckanext-b2find',
    version='2.4.0',
    description='CKAN extension for B2FIND',
    long_description=
    '''
    ''',
    classifiers=[],  # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
    keywords='ckan ckanext b2find eudat',
    author='Michael Kurtz',
    author_email='kurtz@dkrz.de',
    url='https://github.com/EUDAT-B2FIND/ckanext-b2find',
    license='AGPLv3',
    packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
    namespace_packages=['ckanext', 'ckanext.b2find'],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        # -*- Extra requirements: -*-
    ],
    entry_points=
    '''
    [ckan.plugins]
    b2find=ckanext.b2find.plugin:B2FindPlugin
    ''',
)
