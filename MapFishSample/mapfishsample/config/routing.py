"""Routes configuration

The more specific and detailed routes should be defined first so they may take
precedent over the more generic routes. For more information refer to the
routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper
from mapfish.controllers import printer

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])

    # The ErrorController route (handles 404/500 error pages); it should likely
    # stay at the top, ensuring it can always be resolved
    map.connect('error/:action/:id', controller='error')

    # CUSTOM ROUTES HERE

    printer.addRoutes(map, 'print/', 'printer')

    map.connect('c2corg/', controller='c2corg', action='show', conditions=dict(method=['GET']))
    map.connect('c2corg/:(id).:(format)', controller='c2corg', action='show', conditions=dict(method=['GET']))
    map.connect('countries/', controller='countries', action='show', conditions=dict(method=['GET']))
    map.connect('countries/:(id).:(format)', controller='countries', action='show', conditions=dict(method=['GET']))
    map.connect('cities/', controller='cities', action='show', conditions=dict(method=['GET']))
    map.connect('cities/:(id).:(format)', controller='cities', action='show', conditions=dict(method=['GET']))
    map.connect(':controller/:action/:id')
    map.connect('*url', controller='template', action='view')

    return map
