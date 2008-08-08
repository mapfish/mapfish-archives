package org.mapfish.print.map.readers;

import com.lowagie.text.pdf.PdfContentByte;
import org.mapfish.print.RenderingContext;
import org.mapfish.print.Transformer;
import org.mapfish.print.map.renderers.MapRenderer;
import org.mapfish.print.utils.PJsonArray;
import org.mapfish.print.utils.PJsonObject;
import org.pvalsecc.misc.StringUtils;
import org.pvalsecc.misc.URIUtils;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MapServerMapReader extends HTTPMapReader {
    private final List<String> layers = new ArrayList<String>();

    private final String format;

    private MapServerMapReader(String layer, RenderingContext context, PJsonObject params) {
        super(context, params);
        layers.add(layer);
        format = params.getString("format");
    }

    protected void renderTiles(MapRenderer formater, Transformer transformer, URI commonUri, PdfContentByte dc) throws IOException {
        //tiling not supported for MapServer protocol...
        List<URI> uris = new ArrayList<URI>(1);
        uris.add(commonUri);
        formater.render(transformer, uris, dc, context, opacity, 1, 0, 0,
                transformer.getRotatedBitmapW(), transformer.getRotatedBitmapH());
    }

    protected MapRenderer.Format getFormat() {
        if (format.equals("image/svg+xml")) {
            return MapRenderer.Format.SVG;
        } else if (format.equals("application/x-pdf")) {
            return MapRenderer.Format.PDF;
        } else {
            return MapRenderer.Format.BITMAP;
        }
    }

    protected void addCommonQueryParams(Map<String, List<String>> result, Transformer transformer, String srs, boolean first) {
        final long w;
        final long h;
        if (format.equals("image/svg+xml")) {
            URIUtils.addParamOverride(result, "map_imagetype", "svg");
            w = transformer.getRotatedSvgW();
            h = transformer.getRotatedSvgH();
        } else if (format.equals("application/x-pdf")) {
            URIUtils.addParamOverride(result, "MAP_IMAGETYPE", "pdf");
            w = transformer.getRotatedBitmapW();
            h = transformer.getRotatedBitmapH();
        } else {
            URIUtils.addParamOverride(result, "MAP_IMAGETYPE", "png");
            w = transformer.getRotatedBitmapW();
            h = transformer.getRotatedBitmapH();
        }
        URIUtils.addParamOverride(result, "MODE", "map");
        URIUtils.addParamOverride(result, "LAYERS", StringUtils.join(layers, " "));
        //URIUtils.addParamOverride(result, "SRS", srs);
        URIUtils.addParamOverride(result, "MAP_SIZE", String.format("%d %d", w, h));
        URIUtils.addParamOverride(result, "MAPEXT", String.format("%s %s %s %s", transformer.getRotatedMinGeoX(), transformer.getRotatedMinGeoY(), transformer.getRotatedMaxGeoX(), transformer.getRotatedMaxGeoY()));
        if (!first) {
            URIUtils.addParamOverride(result, "TRANSPARENT", "true");
        }
    }

    protected static void create(List<MapReader> target, RenderingContext context, PJsonObject params) {
        PJsonArray layers = params.getJSONArray("layers");
        for (int i = 0; i < layers.size(); i++) {
            String layer = layers.getString(i);
            target.add(new MapServerMapReader(layer, context, params));
        }
    }

    public boolean testMerge(MapReader other) {
        if (canMerge(other)) {
            MapServerMapReader wms = (MapServerMapReader) other;
            layers.addAll(wms.layers);
            return true;
        }
        return false;
    }

    public boolean canMerge(MapReader other) {
        if (!super.canMerge(other)) {
            return false;
        }

        if (other instanceof MapServerMapReader) {
            MapServerMapReader wms = (MapServerMapReader) other;
            return format.equals(wms.format);
        } else {
            return false;
        }
    }
}