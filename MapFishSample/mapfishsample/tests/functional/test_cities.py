from mapfishsample.tests import *

class TestCitiesController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='cities'))
        # Test response...
