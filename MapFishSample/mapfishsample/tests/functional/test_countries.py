from mapfishsample.tests import *

class TestCountriesController(TestController):
    def test_index(self):
        response = self.app.get(url_for(controller='countries'))
        # Test response...
