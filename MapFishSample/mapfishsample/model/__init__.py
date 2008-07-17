# 
# Copyright (C) 2007-2008  Camptocamp
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


from pylons import config

from sqlalchemy import Column, MetaData, Table, types
from sqlalchemy.orm import mapper
from sqlalchemy.orm import scoped_session, sessionmaker

from mapfish.sqlalchemygeom import Geometry
from mapfish.sqlalchemygeom import GeometryTableMixIn

from geojson import Feature

Session = scoped_session(sessionmaker(transactional=True, autoflush=True))

## routing 
nodes_table = Table('nodes2', MetaData(config['pylons.g'].sa_mapfishsample_engine),
                    Column('node_id', types.Integer, primary_key=True),
                    Column('room', types.String, unique=True),
                    Column('level', types.Integer),
                    Column('geom', Geometry))

class Node(object):
    __table__ = nodes_table
    def toFeature(self):
        return Feature(id=int(self.node_id), geometry=self.geom,
                       properties={'room': str(self.room), 'floor': str(self.level)})

lines_table = Table('lines2', MetaData(config['pylons.g'].sa_mapfishsample_engine),
                    Column('gid', types.Integer, primary_key=True),
                    Column('length', types.Float),
                    Column('geom', Geometry))

class Line(object):
    def toFeature(self):
        return Feature(id=int(self.gid), geometry=self.geom,
                       properties={'distance': float(self.length)})

mapper(Node, nodes_table)
mapper(Line, lines_table)

## world_factbk
countries_table = Table('world_factbk_simplified', MetaData(config['pylons.g'].sa_mapfishsample_engine),
                        Column('gid', types.Integer, primary_key=True),
                        Column('country', types.String),
                        Column('birth_rt', types.Float),
                        Column('death_rt', types.Float),
                        Column('fertility', types.Float),
                        Column('simplify', Geometry))

class Country(GeometryTableMixIn):
    __table__ = countries_table

mapper(Country, countries_table)

## world_cities
cities_table = Table('world_cities', MetaData(config['pylons.g'].sa_mapfishsample_engine),
                     Column('id', types.Integer, primary_key=True),
                     Column('ufi', types.Integer),
                     Column('admin_code', types.Integer),
                     Column('mgcc', types.Integer),
                     Column('name', types.String),
                     Column('attrib', types.Integer),
                     Column('population', types.Integer),
                     Column('the_geom', Geometry(4326)))

class City(GeometryTableMixIn):
    __table__ = cities_table

mapper(City, cities_table)

