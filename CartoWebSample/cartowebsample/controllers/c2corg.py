import logging

from sqlalchemy import and_

from cartowebsample.lib.base import *
from shapely.geometry.point import Point
from shapely.geometry.polygon import Polygon

from cartoweb.pfpfeature import FeatureCollection
import geojson

log = logging.getLogger(__name__)

class C2CorgController(BaseController):
    PROJ_EPSG       = 4236
    PROJ_USER       = 32768
    SELECT_LIMIT    = 50
    TOL_PX          = 6.

    def __before__(self):
        self.engine = model.sac.get_engine('c2corg')
        
    def search(self):
        expr = None
        if ('x' in request.params and 
            'y' in request.params and 
            'bbox' in request.params and
            'width' in request.params):
            # derive tolerance from bbox and map width
            bbox = request.params['bbox'].split(',')
            tol = ((float(bbox[2]) - float(bbox[0])) * self.TOL_PX) / float(request.params['width'])
            point = Point(float(request.params['x']), float(request.params['y']))
            # prepare query
            dist = self.engine.func.distance(
                self.engine.func.transform(model.Summit.c.geom, self.PROJ_EPSG),
                self.engine.func.pointfromtext(point.wkt, self.PROJ_EPSG)
            )
            # query
            objects = model.Summit.select(dist < tol, limit=self.SELECT_LIMIT)
            if len(objects) != 0:
                return geojson.dumps(FeatureCollection([f.toFeature() for f in objects]))
            return ''
        if ('bbox' in request.params):
            bbox = request.params['bbox'].split(',')
            # define polygon from box
            pointA = (float(bbox[0]), float(bbox[1]))
            pointB = (float(bbox[0]), float(bbox[3]))
            pointC = (float(bbox[2]), float(bbox[3]))
            pointD = (float(bbox[2]), float(bbox[1]))
            pointE = pointA
            coords = (pointA, pointB, pointC, pointD, pointE)
            poly = Polygon(coords)
            # prepare query
            expr = model.Summit.c.geom.op('&&')(
                self.engine.func.transform(
                     self.engine.func.geomfromtext(poly.wkt, self.PROJ_EPSG),
                     self.PROJ_USER
                )
            )
        if ('min' in request.params and
            'max' in request.params):
            if (expr is not None):
                expr = and_(
                    model.Summit.c.elevation >= int(request.params['min']),
                    model.Summit.c.elevation <= int(request.params['max']),
                    expr
                )
            else:
                expr = and_(
                    model.Summit.c.elevation >= int(request.params['min']),
                    model.Summit.c.elevation <= int(request.params['max'])
                )
        if ('name' in request.params):
            e = model.Summit.c.name.like('%' + request.params['name'] + '%')
            if (expr is not None):
                expr = and_(expr, e)
            else:
                expr = e
        if (expr is not None):
            objects = model.Summit.select(expr, limit=self.SELECT_LIMIT)
            if len(objects) != 0:
                return geojson.dumps(FeatureCollection([f.toFeature() for f in objects]))
        return ''
