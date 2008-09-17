# 
# Copyright (C) 2007-2008 Camptocamp
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

__all__ = ['Geometry', 'GeometryTableMixIn']


"""
SQLAlchemy geometry type support
see: http://www.sqlalchemy.org/docs/04/types.html#types_custom

  Example
  -------
from sqlalchemy import *
from sqlalchemygeom import Geometry

# see: http://www.sqlalchemy.org/docs/dbengine.html
db = create_engine('postgres://www-data:www-data@kirishima.c2c:5433/epfl')

metadata = MetaData()
metadata.connect(db)

wifi_t = Table('wifi', metadata,
               Column('gid', Integer, primary_key=True),
               # add more columns here ...
               Column('the_geom', Geometry(4326))
               )

# basic select
r = wifi_t.select(wifi_t.c.gid == 10).execute()
w = r.fetchone()
print w.the_geom

# advanced select
from shapely.geometry.point import Point
from binascii import b2a_hex
me = Point(532778, 152205)

r = wifi_t.select(metadata.engine.func.distance(wifi_t.c.the_geom, b2a_hex(me.wkb)) < 100).execute()
print [(i.gid, i.the_geom.distance(me)) for i in r]

## update
#u = wifi_t.update(wifi_t.c.gid == 10)
#w.the_geom.y += 9.0
#u.execute(the_geom = w.the_geom)
"""

from sqlalchemy.types import TypeEngine
from sqlalchemy import Table
from shapely.wkb import loads

from geojson import Feature

class Geometry(TypeEngine):
    def __init__(self, srid=-1, dims=2):
        super(Geometry, self).__init__()
        self.srid = srid
        self.dims = dims

    def get_col_spec(self):
        return 'GEOMETRY()'

    def compare_values(self, x, y):
        return x.equals(y)

    def bind_processor(self, dialect):
        """convert value from a geometry object to database"""
        def convert(value):
            if value is None:
                return None
            else:
                return "SRID=%s;%s" % (self.srid, value.wkb.encode('hex'))
        return convert

    def result_processor(self, dialect):
        """convert value from database to a geometry object"""
        def convert(value):
            if value is None:
                return None
            else:
                return loads(value.decode('hex'))
        return convert

class GeometryTableMixIn(object):
    exported_keys = None
    __geometry_column__ = None
    __primary_key_column__ = None

    def _getfid(self):
        return getattr(self, self.primary_key_column().name)

    def _setfid(self, val):
        setattr(self, self.primary_key_column().name, val)

    fid = property(_getfid, _setfid)

    def _getgeom(self):
        return getattr(self, self.geometry_column().name)

    def _setgeom(self, val):
        setattr(self, self.geometry_column().name, val)

    geometry = property(_getgeom, _setgeom)

    def __getitem__(self, key):
        return getattr(self, key)

    def __setitem__(self, key, val):
         if key in self.__table__.c.keys():
             setattr(self, key, val)

    def __contains__(self, key):
        return hasattr(self, key)

    @classmethod
    def geometry_column(cls):
        """ Returns the table's geometry column or None if the table has no geometry column. """
        if not cls.__geometry_column__:
            columns = [c for c in cls.__table__.columns if isinstance(c.type, Geometry)]
            if not columns:
                return None
            elif len(columns) > 1:
                raise Exception("There is more than one geometry column")
            else:
                cls.__geometry_column__ = columns.pop()
        return cls.__geometry_column__

    @classmethod
    def primary_key_column(cls):
        """ Returns the table's primary key column """
        if not cls.__primary_key_column__:
            keys = [k for k in cls.__table__.primary_key]
            if not keys:
                raise Exception("No primary key found !")
            elif len(keys) > 1:
                raise Exception("There is more than one primary key column")
            else:
                cls.__primary_key_column__ = keys.pop()
        return cls.__primary_key_column__
            
    def toFeature(self):
        if not self.exported_keys:
            exported = self.__table__.c.keys()
        else:
            exported = self.exported_keys

        fid_column = self.primary_key_column().name
        geom_column = self.geometry_column().name

        attributes = {}
        for k in exported:
            k = str(k)
            if k != fid_column and k != geom_column and hasattr(self, k):
                attributes[k] = getattr(self, k)

        return Feature(id=self.fid, 
                       geometry=self.geometry,
                       properties=attributes)
