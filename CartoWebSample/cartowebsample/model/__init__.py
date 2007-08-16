from sacontext import PylonsSAContext

sac = PylonsSAContext()
sac.add_engine_from_config('routing')
sac.add_engine_from_config('c2corg')

from sqlalchemy import *
from cartoweb.sqlalchemygeom import Geometry
from cartoweb.pfpfeature import Feature

from sqlalchemy.ext.assignmapper import assign_mapper

## routing 
nodes_table = Table('nodes2', sac.get_metadata('routing'),
                    Column('node_id', Integer, primary_key=True),
                    Column('room', String, unique=True),
                    Column('level', Integer),
                    Column('geom', Geometry))

class Node(object):
    def toFeature(self):
        return Feature(id=int(self.node_id), geometry=self.geom,
                       room=str(self.room), floor=str(self.level))


lines_table = Table('lines2', sac.get_metadata('routing'),
                    Column('gid', Integer, primary_key=True),
                    Column('length', Float),
                    Column('geom', Geometry))

class Line(object):
    def toFeature(self):
        return Feature(id=int(self.gid), geometry=self.geom,
                       distance=float(self.length))

assign_mapper(sac.session_context, Node, nodes_table)
assign_mapper(sac.session_context, Line, lines_table)
#mapper(Node, nodes_table, extension=sac.ext)

## c2c org
summits_table = Table('sommets_out', sac.get_metadata('c2corg'),
    Column('sommet_id', Integer, primary_key=True),
    Column('elevation', Integer),
    Column('name', String),
    Column('geom', Geometry)
)

class Summit(object):
    def __str__(self):
        return self.name

    def toFeature(self):
        return Feature(id=self.sommet_id, geometry=self.geom,
                       elevation=float(self.elevation),
                       name=self.name)

assign_mapper(sac.session_context, Summit, summits_table)


