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

from mapfishsample.lib.base import *
from mapfish.plugins import pgrouting
from mapfish.pfpfeature import FeatureCollection

import geojson

log = logging.getLogger(__name__)

class EpflController(BaseController):

    @jsonify
    def room(self):
        if 'query' in request.params:
            rooms = model.Session.query(model.Node).filter(model.Node.room.like(request.params['query'] + '%'))
            return {'results': [{'id': r.room, 'title': r.room} for r in rooms.order_by(model.nodes_table.c.room)]}

    def routing(self):
        source_id = model.Session.query(model.Node).filter(model.nodes_table.c.room == request.params['from'])[0].node_id
        target_id = model.Session.query(model.Node).filter(model.nodes_table.c.room == request.params['to'])[0].node_id
        
        if 'disabled' in request.params and request.params['disabled'] == '1':
            cost = "CASE WHEN type = '9.2' THEN -1.0::float8 ELSE length::float8 END"
        else:
            cost = "length::float8"
            
        route = pgrouting.shortest_path(config['pylons.g'].sa_routing_engine,
                                        "SELECT gid AS id, node1_id::int4 AS source, node2_id::int4 AS target, %(cost)s AS cost FROM lines2"%{'cost': cost},
                                        int(source_id), int(target_id)).fetchall()

        source_f = model.Session.query(model.Node).get(route[0]['vertex_id']).toFeature()
        target_f = model.Session.query(model.Node).get(route[-1]['vertex_id']).toFeature()
        
        source_f.properties['_isSourceNode'] = True
        target_f.properties['_isTargetNode'] = True

        lines = [model.Session.query(model.Line).get(i['edge_id']) for i in route]
        result = FeatureCollection([line.toFeature() for line in lines if line is not None and line.geom is not None])

        result.extend([source_f, target_f])
        #length = sum([line.length for line in lines if line is not None])

        return geojson.dumps(result)

