import logging

from sqlalchemy.sql import and_

from cartowebsample.lib.base import *

from cartoweb.pfpfeature import FeatureCollection
from cartoweb.plugins.search import Search

import geojson

log = logging.getLogger(__name__)

class CountriesController(BaseController):

    def show(self):
        search = Search(
            model.countries_table.c.gid,
            model.countries_table.c.simplify,
            4326, 'degrees')
        expr = search.buildExpression(request)
        objects = search.query(model.Session, model.Country, model.countries_table, expr)
        if len(objects) != 0:
            return geojson.dumps(FeatureCollection([f.toFeature() for f in objects]))
