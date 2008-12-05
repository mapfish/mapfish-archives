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

package org.mapfish.print;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfTemplate;
import org.mapfish.print.config.layout.*;
import org.mapfish.print.utils.PJsonObject;
import org.pvalsecc.misc.FileUtilities;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLConnection;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PDFUtils {
    public static Image createEmptyImage(double width, double height) throws BadElementException {
        Image background = Image.getInstance(1, 1, 1, 1, new byte[]{0}, new int[]{0, 0});
        background.scaleAbsolute((float) width, (float) height);
        return background;
    }

    /**
     * Gets an iText image with a cache that uses PdfTemplates to re-use the same
     * bitmap content multiple times in order to reduce the file size.
     */
     public static Image getImage(RenderingContext context, URI uri, float w, float h) throws IOException, DocumentException {
         Map<URI, PdfTemplate> cache = context.getTemplateCache();

         PdfTemplate template = cache.get(uri);
         if (template == null) {
             Image content = getImageDirect(context, uri);
             content.setAbsolutePosition(0, 0);
             template = context.getDirectContent().createTemplate(content.getPlainWidth(), content.getPlainHeight());
             template.addImage(content);
             cache.put(uri, template);
         }


        //fix the size/aspect ratio of the image in function of what is specified by the user
         if (w == 0.0f) {
             if (h == 0.0f) {
                 w = template.getWidth();
                 h = template.getHeight();
             } else {
                 w = h / template.getHeight() * template.getWidth();
             }
         } else {
             if (h == 0.0f) {
                 h = w / template.getWidth() * template.getHeight();
             }
         }

         final Image result = Image.getInstance(template);
         result.scaleAbsolute(w, h);
         return result;
     }

     /**
      * Gets an iText image. Avoids doing the query twice.
      */
     private static Image getImageDirect(RenderingContext context, URI uri) throws IOException, BadElementException {
         if (!uri.isAbsolute()) {
             //non-absolute URI are local, so we can use the normal iText method
             return Image.getInstance(uri.toString());
         } else {
             //read the whole image content in memory, then give that to iText
             final URLConnection urlConnection = uri.toURL().openConnection();
             if (context.getReferer() != null) {
                 urlConnection.setRequestProperty("Referer", context.getReferer());
             }
             InputStream is = urlConnection.getInputStream();
             ByteArrayOutputStream imageBytes = new ByteArrayOutputStream();
             try {
                 FileUtilities.copyStream(is, imageBytes);
             } finally {
                is.close();
            }
            return Image.getInstance(imageBytes.toByteArray());
        }
    }

    /**
     * When we have to do some custom drawing in a block that is layed out by
     * iText, we first give an empty table with the good dimensions to iText,
     * then iText will call a callback with the actual position. When that
     * happens, we use the given drawer to do the actual drawing.
     */
    public static PdfPTable createPlaceholderTable(double width, double height, double spacingAfter,
                                                   ChunkDrawer drawer, HorizontalAlign align,
                                                   PDFCustomBlocks customBlocks) {
        PdfPTable placeHolderTable = new PdfPTable(1);
        placeHolderTable.setLockedWidth(true);
        placeHolderTable.setTotalWidth((float) width);
        final PdfPCell placeHolderCell = new PdfPCell();
        placeHolderCell.setMinimumHeight((float) height);
        placeHolderCell.setPadding(0f);
        placeHolderCell.setBorder(PdfPCell.NO_BORDER);
        placeHolderTable.addCell(placeHolderCell);
        customBlocks.addChunkDrawer(drawer);
        placeHolderTable.setTableEvent(drawer);
        placeHolderTable.setComplete(true);

        final PdfPCell surroundingCell = new PdfPCell(placeHolderTable);
        surroundingCell.setPadding(0f);
        surroundingCell.setBorder(PdfPCell.NO_BORDER);
        if (align != null) {
            placeHolderTable.setHorizontalAlignment(align.getCode());
            surroundingCell.setHorizontalAlignment(align.getCode());
        }

        PdfPTable surroundingTable = new PdfPTable(1);
        surroundingTable.setSpacingAfter((float) spacingAfter);
        surroundingTable.addCell(surroundingCell);
        surroundingTable.setComplete(true);

        return surroundingTable;
    }

    private static final Pattern VAR_REGEXP = Pattern.compile("\\$\\{([^}]+)\\}");

    public static Phrase renderString(RenderingContext context, PJsonObject params, String val, com.lowagie.text.Font font) throws BadElementException {
        Phrase result = new Phrase();
        while (true) {
            Matcher matcher = VAR_REGEXP.matcher(val);
            if (matcher.find()) {
                result.add(val.substring(0, matcher.start()));
                final String value;
                final String varName = matcher.group(1);
                if (varName.equals("pageTot")) {
                    result.add(context.getCustomBlocks().getOrCreateTotalPagesBlock(font));
                } else {
                    value = getContextValue(context, params, varName);
                    result.add(value);
                }
                val = val.substring(matcher.end());
            } else {
                break;
            }
        }
        result.add(val);
        return result;
    }

    /**
     * Evaluates stuff like "toto ${titi}"
     */
    public static String evalString(RenderingContext context, PJsonObject params, String val) {
        if (val == null) {
            return null;
        }
        StringBuilder result = new StringBuilder();
        while (true) {
            Matcher matcher = VAR_REGEXP.matcher(val);
            if (matcher.find()) {
                result.append(val.substring(0, matcher.start()));
                result.append(getContextValue(context, params, matcher.group(1)));
                val = val.substring(matcher.end());
            } else {
                break;
            }
        }
        result.append(val);
        return result.toString();
    }

    private static Pattern FORMAT_PATTERN = Pattern.compile("^format\\s+(%[-+# 0,(]*\\d*(\\.\\d*)?(d))\\s+(.*)$");

    private static String getContextValue(RenderingContext context, PJsonObject params, String key) {
        Matcher matcher;
        if (key.equals("pageNum")) {
            return Integer.toString(context.getWriter().getPageNumber());
        } else if (key.equals("now")) {
            return new Date().toString();
        } else if (key.startsWith("now ")) {
            return formatTime(context, key);
        } else if ((matcher = FORMAT_PATTERN.matcher(key)) != null && matcher.matches()) {
            return format(context, params, matcher);
        } else if (key.equals("configDir")) {
            return context.getConfigDir().replace('\\', '/');
        } else if (key.equals("scale")) {
            return Integer.toString(context.getLayout().getMainPage().getMap().createTransformer(context, params).getScale());
        }

        String result = context.getGlobalParams().optString(key);
        if (result == null) {
            result = params.getString(key);
        }
        return result;
    }

    private static String format(RenderingContext context, PJsonObject params, Matcher matcher) {
        final String valueTxt = getContextValue(context, params, matcher.group(4));
        final Object value;
        switch (matcher.group(3).charAt(0)) {
            case 'd':
            case 'o':
            case 'x':
            case 'X':
                value = Long.valueOf(valueTxt);
                break;
            case 'e':
            case 'E':
            case 'f':
            case 'g':
            case 'G':
            case 'a':
            case 'A':
                value = Double.valueOf(valueTxt);
                break;
            default:
                value = valueTxt;
        }
        try {
            return String.format(matcher.group(1), value);
        } catch (RuntimeException e) {
            // gracefuly fallback to the standard format
            context.addError(e);
            return valueTxt;
        }
    }

    private static String formatTime(RenderingContext context, String key) {
        try {
            SimpleDateFormat format = new SimpleDateFormat(key.substring(4));
            return format.format(new Date());
        } catch (IllegalArgumentException e) {
            // gracefuly fallback to the standard format
            context.addError(e);
            return new Date().toString();
        }
    }

    public static PdfPTable buildTable(ArrayList<Block> items, PJsonObject params, RenderingContext context, int nbColumns, TableConfig tableConfig) throws DocumentException {
        int nbCells = 0;
        for (int i = 0; i < items.size(); i++) {
            final Block block = items.get(i);
            if (block.isVisible(context, params)) {
                nbCells++;
            }
        }
        nbColumns = nbColumns > 0 ? nbColumns : nbCells;
        int nbRows = (nbCells + nbColumns - 1) / nbColumns;
        final PdfPTable table = new PdfPTable(nbColumns);
        table.setWidthPercentage(100f);

        int cellNum = 0;
        for (int i = 0; i < items.size(); i++) {
            final Block block = items.get(i);
            if (block.isVisible(context, params)) {
                final PdfPCell cell = createCell(params, context, block, cellNum / nbColumns, cellNum % nbColumns, nbRows, nbColumns, tableConfig);
                table.addCell(cell);
                cellNum++;
            }
        }
        table.setComplete(true);
        return table;
    }

    public static PdfPCell createCell(final PJsonObject params, final RenderingContext context, final Block block, final int row,
                                      final int col, final int nbRows, final int nbCols, final TableConfig tableConfig) throws DocumentException {
        final PdfPCell[] cell = new PdfPCell[1];
        block.render(params, new Block.PdfElement() {
            public void add(Element element) throws DocumentException {
                if (element instanceof PdfPTable) {
                    cell[0] = new PdfPCell((PdfPTable) element);
                } else {
                    final Phrase phrase = new Phrase();
                    phrase.add(element);
                    cell[0] = new PdfPCell(phrase);
                }
                cell[0].setBorder(PdfPCell.NO_BORDER);
                cell[0].setPadding(0);
                if (tableConfig != null) {
                    tableConfig.apply(cell[0], row, col, nbRows, nbCols);
                }
                if (block.getAlign() != null)
                    cell[0].setHorizontalAlignment(block.getAlign().getCode());
                if (block.getVertAlign() != null)
                    cell[0].setVerticalAlignment(block.getVertAlign().getCode());
                if (!(block instanceof MapBlock) && !(block instanceof ScalebarBlock) && block.getBackgroundColorVal(context, params) != null) {
                    cell[0].setBackgroundColor(block.getBackgroundColorVal(context, params));
                }
            }
        }, context);
        return cell[0];
    }

    public static Chunk createImageChunk(RenderingContext context, double maxWidth, double maxHeight, URI url, float rotation) throws DocumentException {
        final Image image = createImage(context, maxWidth, maxHeight, url, rotation);
        return new Chunk(image, 0f, 0f, true);
    }

    public static Image createImage(RenderingContext context, double maxWidth, double maxHeight, URI url, float rotation) throws DocumentException {
        final Image image;
        try {
            image = getImage(context, url, (float) maxWidth, (float) maxHeight);
        } catch (IOException e) {
            throw new InvalidValueException("url", url.toString(), e);
        }

        if (rotation != 0.0F) {
            image.setRotation(rotation);
        }
        return image;
    }
}
