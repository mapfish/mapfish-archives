# 
# Copyright (C) 2007-2008  Camptocamp
#  
# This file is part of MapFish Server
#  
# MapFish Server is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#  
# MapFish Server is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#  
# You should have received a copy of the GNU Lesser General Public License
# along with MapFish Server.  If not, see <http://www.gnu.org/licenses/>.
#

"""The application's model objects"""
import sqlalchemy as sa
from sqlalchemy import orm

from geojson import Feature

from mapfishsample.model import meta
from mapfish.sqlalchemygeom import Geometry

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    ## Reflected tables must be defined and mapped here
    #global reflected_table
    #reflected_table = sa.Table("Reflected", meta.metadata, autoload=True,
    #                           autoload_with=engine)
    #orm.mapper(Reflected, reflected_table)

    sm = orm.sessionmaker(autoflush=True, autocommit=False, bind=engine)

    meta.engine = engine
    meta.Session = orm.scoped_session(sm)


nodes_table = sa.Table('nodes2', meta.metadata,
    sa.Column('node_id', sa.types.Integer, primary_key=True),
    sa.Column('room', sa.types.String, unique=True),
    sa.Column('level', sa.types.Integer),
    sa.Column('geom', Geometry))

class Node(object):
    __table__ = nodes_table
    def toFeature(self):
        return Feature(id=int(self.node_id), geometry=self.geom,
            properties={'room': str(self.room), 'floor': str(self.level)})

orm.mapper(Node, nodes_table)

lines_table = sa.Table('lines2', meta.metadata,
    sa.Column('gid', sa.types.Integer, primary_key=True),
    sa.Column('length', sa.types.Float),
    sa.Column('geom', Geometry))

class Line(object):
    def toFeature(self):
        return Feature(id=int(self.gid), geometry=self.geom,
            properties={'distance': float(self.length)})

orm.mapper(Line, lines_table)

## Classes for reflected tables may be defined here, but the table and
## mapping itself must be done in the init_model function
#reflected_table = None
#
#class Reflected(object):
#    pass
