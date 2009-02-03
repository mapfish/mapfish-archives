"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper
from mapfish.controllers import printer

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False
    
    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    # CUSTOM ROUTES HERE

    printer.addRoutes(map, '/print/', 'printer')

    map.resource('summit', 'summits')
    map.resource('country', 'countries')
    map.resource('city', 'cities')
    map.resource('polygon', 'polygons')
    map.resource('line', 'lines')
    map.resource('point', 'points')

    map.connect('/{controller}/{action}')
    map.connect('/{controller}/{action}/{id}')

    return map
