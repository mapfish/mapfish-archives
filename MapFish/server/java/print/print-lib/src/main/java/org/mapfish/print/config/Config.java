/*
 * Copyright (C) 2008  Camptocamp
 *
 * This file is part of MapFish Server
 *
 * MapFish Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapFish Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with MapFish Server.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.mapfish.print.config;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethodBase;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.params.HttpConnectionManagerParams;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.ho.yaml.CustomYamlConfig;
import org.ho.yaml.YamlConfig;
import org.json.JSONException;
import org.json.JSONWriter;
import org.mapfish.print.InvalidValueException;
import org.mapfish.print.config.layout.Layout;
import org.mapfish.print.config.layout.Layouts;
import org.mapfish.print.map.MapTileTask;
import org.mapfish.print.map.readers.WMSServerInfo;
import org.pvalsecc.concurrent.OrderedResultsExecutor;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.SocketException;
import java.net.URI;
import java.net.UnknownHostException;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;

/**
 * Bean mapping the root of the configuration file.
 */
public class Config {
    public static final Logger LOGGER = Logger.getLogger(Config.class);

    private Layouts layouts;

    private TreeSet<Integer> dpis;

    private TreeSet<Integer> scales;

    private TreeSet<String> fonts = null;

    private List<HostMatcher> hosts = new ArrayList<HostMatcher>();

    private int globalParallelFetches = 5;
    private int perHostParallelFetches = 5;

    private boolean tilecacheMerging = false;

    /**
     * How much of the asked map we tolerate to be outside of the printed area.
     * Used only in case of bbox printing (use by the PrintAction JS component).
     */
    private static final double BEST_SCALE_TOLERANCE = 0.98;

    /**
     * The bunch of threads that will be used to do the // fetching of the map
     * chunks
     */
    private OrderedResultsExecutor<MapTileTask> mapRenderingExecutor = null;
    private HttpClient httpClient;

    public Config() {
        hosts.add(new LocalHostMatcher());
    }

    /**
     * Create an instance out of the given file.
     */
    public static Config fromYaml(File file) throws FileNotFoundException {
        YamlConfig config = new CustomYamlConfig();
        Config result = config.loadType(file, Config.class);
        result.validate();
        return result;
    }

    public static Config fromInputStream(InputStream instream) {
        YamlConfig config = new CustomYamlConfig();
        Config result = config.loadType(instream, Config.class);
        result.validate();
        return result;
    }

    public static Config fromString(String strConfig) {
        YamlConfig config = new CustomYamlConfig();
        Config result = config.loadType(strConfig, Config.class);
        result.validate();
        return result;
    }

    public Layout getLayout(String name) {
        return layouts.get(name);
    }

    public void setLayouts(Layouts layouts) {
        this.layouts = layouts;
    }

    public void setDpis(TreeSet<Integer> dpis) {
        this.dpis = dpis;
    }

    public TreeSet<Integer> getDpis() {
        return dpis;
    }

    public void printClientConfig(JSONWriter json) throws JSONException {
        json.key("scales");
        json.array();
        for (Integer scale : scales) {
            json.object();
            json.key("name").value("1:" + NumberFormat.getIntegerInstance().format(scale));
            json.key("value").value(scale.toString());
            json.endObject();
        }
        json.endArray();

        json.key("dpis");
        json.array();
        for (Integer dpi : dpis) {
            json.object();
            json.key("name").value(dpi.toString());
            json.key("value").value(dpi.toString());
            json.endObject();
        }
        json.endArray();

        json.key("layouts");
        json.array();
        ArrayList<String> sortedLayouts = new ArrayList<String>();
        sortedLayouts.addAll(layouts.keySet());
        Collections.sort(sortedLayouts);
        for (int i = 0; i < sortedLayouts.size(); i++) {
            String key = sortedLayouts.get(i);
            json.object();
            json.key("name").value(key);
            layouts.get(key).printClientConfig(json);
            json.endObject();
        }
        json.endArray();
    }

    public void setScales(TreeSet<Integer> scales) {
        this.scales = scales;
    }

    public boolean isScalePresent(int scale) {
        return scales.contains(scale);
    }

    public void setHosts(List<HostMatcher> hosts) {
        this.hosts = hosts;
    }

    public void setFonts(TreeSet<String> fonts) {
        this.fonts = fonts;
    }

    public TreeSet<String> getFonts() {
        return fonts;
    }

    /**
     * Make sure an URI is authorized
     */
    public boolean validateUri(URI uri) throws UnknownHostException, SocketException, MalformedURLException {
        for (int i = 0; i < hosts.size(); i++) {
            HostMatcher matcher = hosts.get(i);
            if (matcher.validate(uri)) {
                if (LOGGER.isDebugEnabled()) {
                    LOGGER.debug("URI [" + uri + "] accepted by: " + matcher);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Called just after the config has been loaded to check it is valid.
     *
     * @throws InvalidValueException When there is a problem
     */
    public void validate() {
        if (layouts == null) throw new InvalidValueException("layouts", "null");
        layouts.validate();

        if (dpis == null) throw new InvalidValueException("dpis", "null");
        if (dpis.size() < 1) throw new InvalidValueException("dpis", "[]");

        if (scales == null) throw new InvalidValueException("scales", "null");
        if (scales.size() < 1) throw new InvalidValueException("scales", "[]");

        if (hosts == null) throw new InvalidValueException("hosts", "null");
        if (hosts.size() < 1) throw new InvalidValueException("hosts", "[]");

        if (globalParallelFetches < 1) {
            throw new InvalidValueException("globalParallelFetches", Integer.toString(globalParallelFetches));
        }
        if (perHostParallelFetches < 1) {
            throw new InvalidValueException("perHostParallelFetches", Integer.toString(perHostParallelFetches));
        }
    }

    /**
     * @return The first scale that is bigger or equal than the target.
     */
    public int getBestScale(double target) {
        target *= BEST_SCALE_TOLERANCE;
        for (Integer scale : scales) {
            if (scale >= target) {
                return scale;
            }
        }
        return scales.last();
    }

    public synchronized OrderedResultsExecutor<MapTileTask> getMapRenderingExecutor() {
        if (mapRenderingExecutor == null && globalParallelFetches > 1) {
            mapRenderingExecutor = new OrderedResultsExecutor<MapTileTask>(globalParallelFetches, "tilesReader");
            mapRenderingExecutor.start();
        }
        return mapRenderingExecutor;
    }

    /**
     * Stop all the threads and stuff used for this config.
     */
    public synchronized void stop() {
        WMSServerInfo.clearCache();
        if (mapRenderingExecutor != null) {
            mapRenderingExecutor.stop();
        }
        if (httpClient != null) {
            httpClient.getHttpConnectionManager().closeIdleConnections(0);
        }
    }

    public void setGlobalParallelFetches(int globalParallelFetches) {
        this.globalParallelFetches = globalParallelFetches;
    }

    public void setPerHostParallelFetches(int perHostParallelFetches) {
        this.perHostParallelFetches = perHostParallelFetches;
        System.getProperties().setProperty("http.maxConnections", Integer.toString(perHostParallelFetches));
    }

    /**
     * Get or create the http client to be used to fetch all the map data.
     */
    public synchronized HttpClient getHttpClient() {
        if (httpClient == null) {
            MultiThreadedHttpConnectionManager connectionManager =
                    new MultiThreadedHttpConnectionManager();
            final HttpConnectionManagerParams params = connectionManager.getParams();
            params.setDefaultMaxConnectionsPerHost(this.perHostParallelFetches);
            params.setMaxTotalConnections(this.globalParallelFetches);
            httpClient = new HttpClient(connectionManager);

            //httpclient is a bit pesky about loading everything in memory...
            //disabling the warnings.
            Logger.getLogger(HttpMethodBase.class).setLevel(Level.ERROR);
        }
        return httpClient;
    }

    public void setTilecacheMerging(boolean tilecacheMerging) {
        this.tilecacheMerging = tilecacheMerging;
    }

    public boolean isTilecacheMerging() {
        return tilecacheMerging;
    }
}
