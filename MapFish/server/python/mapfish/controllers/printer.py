#
# Copyright (C) 2007-2008  Camptocamp
#
# This file is part of MapFish Server
#
# MapFish Server is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# MapFish Server is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with MapFish Server.  If not, see <http://www.gnu.org/licenses/>.
#

import logging

from os.path import basename, getsize
from os import unlink, listdir, sep, stat
import time
from subprocess import Popen, PIPE
from tempfile import NamedTemporaryFile, gettempdir
import re
import simplejson

from routes import url_for
from pylons.controllers import WSGIController
from pylons import config, request, response, session

def addRoutes(map, baseUrl="print/", controller="printer"):
    """
    Add the pylons routes for the print module to the given map
    """
    map.connect(baseUrl + "info.json", controller = controller,
                action = 'info', conditions = dict(method = ['GET']))
    map.connect(baseUrl + "print.pdf", controller = controller,
                action = 'doPrint', conditions  =  dict(method = ['GET']))
    map.connect(baseUrl + "create.json", controller = controller,
                action = 'create', conditions = dict(method = ['POST']))
    map.connect(baseUrl + ":id.pdf", controller = controller,
                action = 'get', conditions = dict(method = ['GET']))

log = logging.getLogger(__name__)

class PrinterController(WSGIController):
    TEMP_FILE_PREFIX = "mfPrintTempFile"
    TEMP_FILE_SUFFIX = ".pdf"
    TEMP_FILE_PURGE_SECONDS = 600

    def __init__(self):
        WSGIController.__init__(self)
        self._setupConfig()

    def info(self):
        """
        To get (in JSON) the information about the available formats and CO.
        """
        cmd = ['java', '-cp', self.jarPath, 'org.mapfish.print.ShellMapPrinter',
               '--config=' + self.configPath, '--clientConfig', '--verbose='+_getJavaLogLevel()]
        self._addCommonJavaParams(cmd)
        exe = Popen(cmd, stdout = PIPE, stderr = PIPE)
        result = exe.stdout.read()
        error = exe.stderr.read()
        if len(error)>0:
            log.error(error)
        ret = exe.wait()
        if ret == 0:
            response.status = 200
            response.headers['Content-Type'] = 'application/json; charset=utf-8'
            result = self._addURLs(result)
            if request.params.has_key('var'):
                return 'var ' + request.params['var'].encode('utf8') + '=' + result + ';'
            else:
                return result
        else:
            response.status = 500
            response.headers['Content-Type'] = 'text/plain; charset=utf-8'
            return "ERROR(" + str(ret) + ")\n\n" + error

    def doPrint(self):
        """
        All in one method: creates and returns the PDF to the client.
        """
        cmd = ['java', '-cp', self.jarPath, 'org.mapfish.print.ShellMapPrinter',
             '--config=' + self.configPath, '--verbose='+_getJavaLogLevel()]
        self._addCommonJavaParams(cmd)
        exe = Popen(cmd, stdin = PIPE, stdout = PIPE, stderr = PIPE)
        spec = request.params['spec'].encode('utf8')
        exe.stdin.write(spec)
        exe.stdin.close()
        result = exe.stdout.read()
        error = exe.stderr.read()
        if len(error)>0:
            log.error(error)
        ret = exe.wait()
        if ret == 0:
            response.status = 200
            response.headers['Content-Type'] = 'application/pdf'
            return result
        else:
            response.status = 500
            response.headers['Content-Type'] = 'text/plain; charset=utf-8'
            return "ERROR(" + str(ret) + ")\n\nspec=" + spec + "\n\n" + error

    def create(self):
        """
        Create the PDF and returns to the client (in JSON) the URL to get the
        PDF.
        """
        self._purgeOldFiles()
        pdfFile = NamedTemporaryFile("w+b", -1, self.TEMP_FILE_SUFFIX, self.TEMP_FILE_PREFIX)
        pdfFilename = pdfFile.name
        pdfFile.close()
        cmd = ['java',
               '-cp', self.jarPath,
               'org.mapfish.print.ShellMapPrinter',
               '--config=' + self.configPath,
               '--verbose='+_getJavaLogLevel(),
               '--output=' + pdfFilename]
        self._addCommonJavaParams(cmd)
        exe = Popen(cmd, stdin = PIPE, stderr = PIPE)
        spec = request.environ['wsgi.input'].read()
        exe.stdin.write(spec)
        exe.stdin.close()
        error = exe.stderr.read()
        if len(error)>0:
            log.error(error)
        ret = exe.wait()
        if ret == 0:
            curId = basename(pdfFilename)[len(self.TEMP_FILE_PREFIX):-len(self.TEMP_FILE_SUFFIX)]

            response.status = 200
            response.headers['Content-Type'] = 'application/json; charset=utf-8'
            getURL = self._urlForAction("create", "get", id = curId)
            return simplejson.dumps({
                'getURL': getURL,
                'messages': error
            })
        else:
            unlink(pdfFilename)
            response.status = 500
            response.headers['Content-Type'] = 'text/plain; charset=utf-8'
            return "ERROR(" + str(ret) + ")\n\nspec=" + spec + "\n\n" + error
        return request

    def get(self, id):
        """
        To get the PDF created previously.
        """
        name = gettempdir() + sep + self.TEMP_FILE_PREFIX + id + self.TEMP_FILE_SUFFIX

        response.status = 200
        response.headers['Content-Length'] = getsize(name)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename='+id+'.pdf'
        response.headers['Pragma'] = 'public'
        response.headers['Expires'] = '0'
        response.headers['Cache-Control'] = 'private'
        response.content = FileIterable(name)

    def _addCommonJavaParams(self, cmd):
        """
        Adds the java system properties for the locale. Gets it from the request
        parameter "locale" or try to guess it from the "Accept-Language" HTTP
        header parameter.
        Adds as well the referer.
        """
        if request.headers.has_key('REFERER'):
            cmd.append("--referer="+request.headers['REFERER'])

        #allows to run the process without X11
        cmd.insert(1, "-Djava.awt.headless=true")

        if request.params.has_key('locale'):
            locale = request.params['locale']
        else:
            if request.headers.has_key('Accept-Language'):
                locale = request.headers['Accept-Language'].split(',')[0]
            else:
                return
        splitted = re.split("[-_]", locale)
        language = splitted[0]
        cmd.insert(1, "-Duser.language="+language)
        if len(splitted)>1:
            country = splitted[1]
            cmd.insert(1, "-Duser.country="+country)

    def _setupConfig(self):
        self.jarPath = config['print.jar']
        self.configPath = config['print.config']

    def _urlForAction(self, fromAction, actionName, id = None):
        """
        We cannot trust the URL from the request to get the hostname (proxy).
        This method is returning the base URL for accessing the different
        actions of this controller.
        """
        actionUrl = url_for(action = actionName, id = id)
        if request.params.has_key('url'):
            fullUrl = request.params['url'].encode('utf8')
            myUrl = url_for(action = fromAction)
            if fullUrl == myUrl[1:]:  # support for very short relative URLs
                return actionUrl[1:]
            if fullUrl.endswith(myUrl):
                return fullUrl[0:-len(myUrl)] + actionUrl
            log.warn("Cannot guess the base URL for " + fullUrl + " (action=" + myUrl + ")")
        return request.scheme + "://" + request.host + actionUrl

    def _addURLs(self, json):
        expr = re.compile('}$')
        printURL = simplejson.dumps(self._urlForAction("info", "doPrint"))
        createURL = simplejson.dumps(self._urlForAction("info", "create"))
        return expr.sub(',"printURL":' + printURL + ',' +
                        '"createURL":' + createURL + '}', json)

    def _purgeOldFiles(self):
        """
        Delete temp files that are more than TEMP_FILE_PURGE_SECONDS seconds old
        """
        files=listdir(gettempdir())
        for file in files:
            if file.startswith(self.TEMP_FILE_PREFIX) and file.endswith(self.TEMP_FILE_SUFFIX):
                fullname = gettempdir() + sep + file
                age = time.time() - stat(fullname).st_mtime
                if age > self.TEMP_FILE_PURGE_SECONDS:
                    log.info("deleting leftover file :" + fullname + " (age=" + str(age) + "s)")
                    unlink(fullname)


# taken here: http://pythonpaste.org/webob/file-example.html
class FileIterable(object):
     def __init__(self, filename, start = None, stop = None):
         self.filename = filename
         self.start = start
         self.stop = stop
     def __iter__(self):
         return FileIterator(self.filename, self.start, self.stop)
     def app_iter_range(self, start, stop):
         return self.__class__(self.filename, start, stop)

class FileIterator(object):
     chunk_size = 4096
     def __init__(self, filename, start, stop):
         self.filename = filename
         self.fileobj = open(self.filename, 'rb')
         if start:
             self.fileobj.seek(start)
         if stop is not None:
             self.length = stop - start
         else:
             self.length = None
     def __iter__(self):
         return self
     def next(self):
         if self.length is not None and self.length <= 0:
             #unlink(self.filename)
             raise StopIteration
         chunk = self.fileobj.read(self.chunk_size)
         if not chunk:
             #unlink(self.filename)
             raise StopIteration
         if self.length is not None:
             self.length -= len(chunk)
             if self.length < 0:
                 # Chop off the extra:
                 chunk = chunk[:self.length]
         return chunk

def _getJavaLogLevel():
    """
    Convert the python log level into a value to be used with the java
    "--verbose" parameter
    """
    level = log.getEffectiveLevel()
    if level >= 30:
        return '0'
    elif level >= 20:
        return '1'
    else:
        return '2'
