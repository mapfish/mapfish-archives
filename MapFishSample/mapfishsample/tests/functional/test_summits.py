from mapfishsample.tests import *

class TestSummitsController(TestController):
    def test_index(self):
        response = self.app.get(url_for(controller='summits'))
        # Test response...
