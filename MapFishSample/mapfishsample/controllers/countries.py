# 
# Copyright (C) 2007  Camptocamp
#  
# This file is part of MapFish
#  
# MapFish is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#  
# MapFish is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#  
# You should have received a copy of the GNU Lesser General Public License
# along with MapFish.  If not, see <http://www.gnu.org/licenses/>.
#

import logging

from sqlalchemy.sql import and_

from mapfishsample.lib.base import *

from mapfish.pfpfeature import FeatureCollection
from mapfish.plugins.search import Search

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
