"""Pylons environment configuration"""
import os

from pylons import config
from sqlalchemy import engine_from_config

import cartowebsample.lib.app_globals as app_globals
import cartowebsample.lib.helpers
from cartowebsample.config.routing import make_map

def load_environment(global_conf, app_conf):
    """Configure the Pylons environment via the ``pylons.config`` object"""
    # Pylons paths
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths = dict(root=root,
                 controllers=os.path.join(root, 'controllers'),
                 static_files=os.path.join(root, 'public'),
                 templates=[os.path.join(root, 'templates')])

    # Initialize config with the basic options
    config.init_app(global_conf, app_conf, package='cartowebsample',
                    template_engine='mako', paths=paths)

    config['pylons.g'] = app_globals.Globals()
    config['pylons.h'] = cartowebsample.lib.helpers
    config['routes.map'] = make_map()

    # Customize templating options via this variable
    tmpl_options = config['buffet.template_options']

    # CONFIGURATION OPTIONS HERE (note: all config options will override any
    # Pylons config options)

    config['pylons.g'].sa_routing_engine = engine_from_config(config, 'sqlalchemy.routing.')
    config['pylons.g'].sa_search_engine = engine_from_config(config, 'sqlalchemy.search.')
