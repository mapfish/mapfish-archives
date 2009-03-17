package org.mapfish.print;

import com.lowagie.text.BadElementException;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.HashMap;

public class PDFUtilsTest extends PdfTestCase {
    public static final Logger LOGGER = Logger.getLogger(PDFUtilsTest.class);
    private FakeHttpd httpd;
    private static final int PORT = 8181;

    public PDFUtilsTest(String name) {
        super(name);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        Logger.getLogger("org.apache.commons.httpclient").setLevel(Level.INFO);
        Logger.getLogger("httpclient").setLevel(Level.INFO);

        Map<String, FakeHttpd.HttpAnswerer> routings=new HashMap<String, FakeHttpd.HttpAnswerer>();
        routings.put("/500", new FakeHttpd.HttpAnswerer(500, "Server error", "text/plain", "Server error"));
        routings.put("/notImage", new FakeHttpd.HttpAnswerer(200, "OK", "text/plain", "Blahblah"));
        httpd=new FakeHttpd(PORT, routings);
        httpd.start();
    }

    @Override
    protected void tearDown() throws Exception {
        httpd.shutdown();
        super.tearDown();
    }

    public void testGetImageDirectWMSError() throws URISyntaxException, IOException, BadElementException {
        URI uri = new URI("http://localhost:"+PORT+"/notImage");
        try {
            doc.newPage();
            PDFUtils.getImageDirect(context, uri);
            fail("Supposed to have thrown an IOException");
        } catch (IOException ex) {
            //expected
            assertEquals("Didn't receive an image while reading: "+uri, ex.getMessage());
        }
    }

    public void testGetImageDirectHTTPError() throws URISyntaxException, IOException, BadElementException {
        URI uri = new URI("http://localhost:"+PORT+"/500");
        try {
            doc.newPage();
            PDFUtils.getImageDirect(context, uri);
            fail("Supposed to have thrown an IOException");
        } catch (IOException ex) {
            //expected
            assertEquals("Error (status=500) while reading the image from "+uri+": Server error", ex.getMessage());
        }
    }

}
