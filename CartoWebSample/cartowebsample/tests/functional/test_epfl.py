from cartowebsample.tests import *

class TestEpflController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='epfl'))
        # Test response...
