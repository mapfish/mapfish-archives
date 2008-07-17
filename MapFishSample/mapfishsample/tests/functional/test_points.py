from mapfishsample.tests import *

class TestPointsController(TestController):
    def test_index(self):
        response = self.app.get(url_for(controller='points'))
        # Test response...
