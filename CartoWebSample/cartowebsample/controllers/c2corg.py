import logging

from sqlalchemy.sql import select
from sqlalchemy.sql import and_
from sqlalchemy.sql import func

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

    def search(self):
        expr = None
        if ('coords' in request.params and 
            'bbox' in request.params and
            'width' in request.params):
            coords = request.params['coords'].split(',')
            x = float(coords[0])
            y = float(coords[1])
            # derive tolerance from bbox and map width
            bbox = request.params['bbox'].split(',')
            tol = ((float(bbox[2]) - float(bbox[0])) * self.TOL_PX) / float(request.params['width'])
            point = Point(x, y)
            # prepare query
            dist = func.distance(
                func.transform(model.summits_table.c.geom, self.PROJ_EPSG),
                func.pointfromtext(point.wkt, self.PROJ_EPSG)
            )
            log.info(dist)
            # query
            objects = model.Session.query(model.Summit).from_statement(
                select([model.summits_table], dist < tol).limit(self.SELECT_LIMIT)).all()
            if len(objects) != 0:
                return geojson.dumps(FeatureCollection([f.toFeature() for f in objects]))
            return ''
        if ('coords' in request.params):
            coords = request.params['coords'].split(',')
            # define polygon from box
            pointA = (float(coords[0]), float(coords[1]))
            pointB = (float(coords[0]), float(coords[3]))
            pointC = (float(coords[2]), float(coords[3]))
            pointD = (float(coords[2]), float(coords[1]))
            pointE = pointA
            coords = (pointA, pointB, pointC, pointD, pointE)
            poly = Polygon(coords)
            # prepare query
            expr = model.summits_table.c.geom.op('&&')(
                func.transform(
                     func.geomfromtext(poly.wkt, self.PROJ_EPSG),
                     self.PROJ_USER
                )
            )
        if ('min' in request.params and
            'max' in request.params):
            if (expr is not None):
                expr = and_(
                    model.summits_table.c.elevation >= int(request.params['min']),
                    model.summits_table.c.elevation <= int(request.params['max']),
                    expr
                )
            else:
                expr = and_(
                    model.summits_table.c.elevation >= int(request.params['min']),
                    model.summits_table.c.elevation <= int(request.params['max'])
                )
        if ('name' in request.params):
            e = model.summits_table.c.name.like('%' + request.params['name'] + '%')
            if (expr is not None):
                expr = and_(expr, e)
            else:
                expr = e
        if (expr is not None):
            objects = model.Session.query(model.Summit).from_statement(
                select([model.summits_table], expr).limit(self.SELECT_LIMIT)).all()
            if len(objects) != 0:
                return geojson.dumps(FeatureCollection([f.toFeature() for f in objects]))
        return ''
