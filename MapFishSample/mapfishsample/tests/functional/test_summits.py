from mapfishsample.tests import *
from geojson import loads

class TestSummitsController(TestController):
    def test_index(self):
        response = self.app.get(url_for(controller='summits'))
        assert response.response.content_type == 'application/json'
        assert "FeatureCollection" in response

    def test_index_limit_offset(self):
        # limit
        params = {"limit": 10}
        response = self.app.get(url_for(controller='summits'),
                                params=params)
        geojson = loads(response.response._body)
        features = geojson["features"]
        assert len(features) == 10

        fid1 = features[1]["id"]

        # limit & offset
        params = {"limit": 10, "offset": 1}
        response = self.app.get(url_for(controller='summits'),
                                params=params)
        geojson = loads(response.response._body)
        features = geojson['features']
        assert len(features) == 10
        assert features[0]["id"] == fid1

    def test_index_lonlat(self):
        params = {"lon": 5, "lat": 45, "tolerance": 0.5}
        response = self.app.get(url_for(controller='summits'),
                                params=params)
        geojson = loads(response.response._body)
        features = geojson["features"]
        for f in features:
            coords = f["geometry"]["coordinates"]
            assert abs(coords[0] - 5) <= 0.5 
            assert abs(coords[1] - 45) <= 0.5

    def test_index_box(self):
        params = {"box": "5,45,5.5,45.5"}
        response = self.app.get(url_for(controller='summits'),
                                params=params)
        geojson = loads(response.response._body)
        features = geojson["features"]
        for f in features:
            coords = f["geometry"]["coordinates"]
            assert coords[0] >= 5
            assert coords[1] >= 45
            assert coords[0] <= 5.5
            assert coords[1] <= 45.5

    def test_index_min(self):
        params = {"limit": 5, "min": 2000}
        response = self.app.get(url_for(controller='summits'),
                                params=params)
        geojson = loads(response.response._body)
        features = geojson["features"]
        for f in features:
            elevation = f["properties"]["elevation"]
            assert elevation >= 2000

    def test_index_max(self):
        params = {"limit": 5, "max": 2000}
        response = self.app.get(url_for(controller='summits'),
                                params=params)
        geojson = loads(response.response._body)
        features = geojson["features"]
        for f in features:
            elevation = f["properties"]["elevation"]
            assert elevation <= 2000
