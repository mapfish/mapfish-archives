import logging

from cartowebsample.lib.base import *
from cartoweb.plugins import pgrouting
from cartoweb.pfpfeature import FeatureCollection

import geojson

log = logging.getLogger(__name__)

class EpflController(BaseController):

    def routing(self):
        source_id = model.Node.select(model.nodes_table.c.room == request.params['from'])[0].node_id
        target_id = model.Node.select(model.nodes_table.c.room == request.params['to'])[0].node_id
        
        if 'disabled' in request.params and request.params['disabled'] == '1':
            cost = "CASE WHEN type = '9.2' THEN -1.0::float8 ELSE length::float8 END"
        else:
            cost = "length::float8"
            
        route = pgrouting.shortest_path(model.sac.get_engine('routing'),
                                        "SELECT gid AS id, node1_id::int4 AS source, node2_id::int4 AS target, %(cost)s AS cost FROM lines2"%{'cost': cost},
                                        int(source_id), int(target_id)).fetchall()

        source_f = model.Node.get(route[0]['vertex_id']).toFeature()
        target_f = model.Node.get(route[-1]['vertex_id']).toFeature()
        
        source_f.properties['_isSourceNode'] = True
        target_f.properties['_isTargetNode'] = True

        lines = [model.Line.get(i['edge_id']) for i in route]
        result = FeatureCollection([line.toFeature() for line in lines if (line is not None and line.geom is not None)])

        result.extend([source_f, target_f])
        #length = sum([line.length for line in lines if line is not None])

        return geojson.dumps(result)

