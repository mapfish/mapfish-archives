# 
# Copyright (C) 2007  Camptocamp
#  
# This file is part of CartoWeb
#  
# ClownFish is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#  
# Foobar is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#  
# You should have received a copy of the GNU Lesser General Public License
# along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
#


from pylons import config

from sqlalchemy import Column, MetaData, Table, types
from sqlalchemy.orm import mapper
from sqlalchemy.orm import scoped_session, sessionmaker

from cartoweb.sqlalchemygeom import Geometry
from cartoweb.pfpfeature import Feature

# Global session manager.  Session() returns the session object appropriate for the current web request.
binds={"nodes2": MetaData(config['pylons.g'].sa_routing_engine),
       "lines2": MetaData(config['pylons.g'].sa_routing_engine),
       "sommets_out": MetaData(config['pylons.g'].sa_search_engine),
       "world_factbk_simplified":  MetaData(config['pylons.g'].sa_geostat_engine)}

Session = scoped_session(sessionmaker(transactional=True, autoflush=True, binds=binds))

## routing 
nodes_table = Table('nodes2', MetaData(config['pylons.g'].sa_routing_engine),
                    Column('node_id', types.Integer, primary_key=True),
                    Column('room', types.String, unique=True),
                    Column('level', types.Integer),
                    Column('geom', Geometry))

class Node(object):
    def toFeature(self):
        return Feature(id=int(self.node_id), geometry=self.geom,
                       room=str(self.room), floor=str(self.level))


lines_table = Table('lines2', MetaData(config['pylons.g'].sa_routing_engine),
                    Column('gid', types.Integer, primary_key=True),
                    Column('length', types.Float),
                    Column('geom', Geometry))

class Line(object):
    def toFeature(self):
        return Feature(id=int(self.gid), geometry=self.geom,
                       distance=float(self.length))

mapper(Node, nodes_table)
mapper(Line, lines_table)

## c2c org
summits_table = Table('sommets_out', MetaData(config['pylons.g'].sa_search_engine),
                      Column('sommet_id', types.Integer, primary_key=True),
                      Column('elevation', types.Integer),
                      Column('name', types.String),
                      Column('geom', Geometry))

class Summit(object):
    def __str__(self):
        return self.name

    def toFeature(self):
        return Feature(id=self.sommet_id, geometry=self.geom,
                       elevation=float(self.elevation),
                       name=self.name)

mapper(Summit, summits_table)

## africa
countries_table = Table('world_factbk_simplified', MetaData(config['pylons.g'].sa_geostat_engine),
                        Column('gid', types.Integer, primary_key=True),
                        Column('country', types.String),
                        Column('birth_rt', types.Float),
                        Column('death_rt', types.Float),
                        Column('fertility', types.Float),
                        Column('simplify', Geometry))

class Country(object):
    def __str__(self):
        return self.country

    def toFeature(self):
        return Feature(id=self.gid, geometry=self.simplify, country=self.country,
                       birth_rt=self.birth_rt, death_rt=self.death_rt,
                       fertility=self.fertility)

mapper(Country, countries_table)
