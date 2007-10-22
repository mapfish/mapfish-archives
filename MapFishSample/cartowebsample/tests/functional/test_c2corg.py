from cartowebsample.tests import *

class TestC2CorgController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='c2corg'))
        # Test response...
