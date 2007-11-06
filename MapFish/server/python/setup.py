# 
# Copyright (C) 2007  Camptocamp
#  
# This file is part of MapFish
#  
# MapFish is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#  
# MapFish is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#  
# You should have received a copy of the GNU Lesser General Public License
# along with MapFish.  If not, see <http://www.gnu.org/licenses/>.
#


from setuptools import setup

setup(name             = 'MapFish',
      version          = '0.1',
      license          = 'LGPLv3',
      install_requires = ['SQLAlchemy == 0.4.0',
                          'Shapely == 1.0a7',
                          'GeoJSON == 1.0a3'],
      zip_safe         = True,
      packages         = ['mapfish', 'mapfish.plugins'],
      classifiers      = [
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: GNU Library or Lesser General Public License (LGPL)',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Scientific/Engineering :: GIS',
        ],
      entry_points      = """
        [paste.paster_create_template]
        mapfish = mapfish.util:MapFishTemplate
        """
)

