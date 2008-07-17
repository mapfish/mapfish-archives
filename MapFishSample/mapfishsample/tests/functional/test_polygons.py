from mapfishsample.tests import *

class TestPolygonsController(TestController):
    def test_index(self):
        response = self.app.get(url_for(controller='polygons'))
        # Test response...
