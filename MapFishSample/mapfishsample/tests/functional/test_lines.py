from mapfishsample.tests import *

class TestLinesController(TestController):
    def test_index(self):
        response = self.app.get(url_for(controller='lines'))
        # Test response...
