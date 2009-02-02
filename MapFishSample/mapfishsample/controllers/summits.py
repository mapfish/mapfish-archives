# 
# Copyright (C) 2007-2008  Camptocamp
#  
# This file is part of MapFish Server
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

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from mapfishsample.lib.base import BaseController
from mapfishsample.model.summits import Summit
from mapfishsample.model.meta import Session

from mapfish.lib.filters import *
from mapfish.lib.protocol import Protocol, create_default_filter

class SummitsController(BaseController):
    readonly = True # if set to True, only GET is supported

    def __init__(self):
        self.protocol = Protocol(Session, Summit, self.readonly)

    def index(self, format='json'):
        """GET /: return all features."""
        filter = logical.Logical(logical.Logical.AND, [
            create_default_filter(
                request,
                Summit.primary_key_column(),
                Summit.geometry_column()
            )
        ])
        if 'min' in request.params and len(request.params['min']) > 0:
            filter.filters.append(
                comparison.Comparison(
                    comparison.Comparison.GREATER_THAN_OR_EQUAL_TO,
                    Summit.elevation,
                    value=int(request.params['min'])
                )
            )
        if 'max' in request.params and len(request.params['max']) > 0:
            filter.filters.append(
                comparison.Comparison(
                    comparison.Comparison.LOWER_THAN_OR_EQUAL_TO,
                    Summit.elevation,
                    value=int(request.params['max'])
                )
            )
        if 'name' in request.params:
            filter.filters.append(
                comparison.Comparison(
                    comparison.Comparison.ILIKE,
                    Summit.name,
                    value=request.params['name']
                )
            )
        return self.protocol.index(request, response, format=format, filter=filter)

    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        return self.protocol.show(request, response, id, format=format)

    def create(self):
        """POST /: Create a new feature."""
        return self.protocol.create(request, response)

    def update(self, id):
        """PUT /id: Update an existing feature."""
        return self.protocol.update(request, response, id)

    def delete(self, id):
        """DELETE /id: Delete an existing feature."""
        return self.protocol.delete(request, response, id)
