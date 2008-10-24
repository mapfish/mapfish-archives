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

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.PdfWriter;
import org.json.JSONException;
import org.mapfish.print.config.layout.Block;
import org.mapfish.print.config.layout.ScalebarBlock;
import org.mapfish.print.scalebar.Direction;
import org.mapfish.print.scalebar.Type;
import org.mapfish.print.utils.DistanceUnit;
import org.mapfish.print.utils.PJsonObject;
import org.pvalsecc.misc.FileUtilities;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * This is not an automated test. You have to look at the generated PDF file.
 */
public class ScalebarTest extends PrintTestCase {
    private static final int MARGIN = 40;

    public ScalebarTest(String name) {
        super(name);
    }

    public void testBars() throws IOException, DocumentException, JSONException {
        PJsonObject spec = MapPrinter.parseSpec(FileUtilities.readWholeTextFile(new File("../print-standalone/samples/spec.json")));
        PJsonObject page1 = spec.getJSONArray("pages").getJSONObject(0);
        spec.getInternalObj().put("units", "meters");

        final Document doc = new Document(PageSize.A4);
        OutputStream outFile = new FileOutputStream("target/testScalebar.pdf");
        PdfWriter writer = PdfWriter.getInstance(doc, outFile);
        writer.setFullCompression();
        RenderingContext context = new RenderingContext(doc, writer, null, spec, null, null);
        doc.setMargins(MARGIN, MARGIN, MARGIN, MARGIN * 3);
        doc.open();

        /*final PdfContentByte dc = writer.getDirectContent();
        float height = writer.getPageSize().getHeight();
        for (int i = 0; i <= 3; ++i) {
            dc.moveTo(MARGIN + 100 * i, 0);
            dc.lineTo(MARGIN + 100 * i, height);
        }
        dc.stroke();*/

        ScalebarBlock block = createBaseBlock();
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setType(Type.LINE);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setType(Type.LINE);
        block.setSubIntervals(true);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR_SUB);
        page1.getInternalObj().put("scale", 500000);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR);
        page1.getInternalObj().put("scale", 100000);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR);
        page1.getInternalObj().put("scale", 20000);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR);
        block.setUnits(DistanceUnit.IN);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR);
        block.setUnits(DistanceUnit.IN);
        page1.getInternalObj().put("scale", 100000);
        draw(page1, doc, context, block);

        block = createSmallBlock();
        draw(page1, doc, context, block);

        block = createSmallBlock();
        block.setTextDirection(Direction.LEFT);
        draw(page1, doc, context, block);

        block = createSmallBlock();
        block.setTextDirection(Direction.RIGHT);
        draw(page1, doc, context, block);

        block = createSmallBlock();
        block.setTextDirection(Direction.RIGHT);
        block.setBarDirection(Direction.RIGHT);
        draw(page1, doc, context, block);

        block = createSmallBlock();
        block.setTextDirection(Direction.RIGHT);
        block.setBarDirection(Direction.LEFT);
        draw(page1, doc, context, block);

        block = createSmallBlock();
        block.setTextDirection(Direction.RIGHT);
        block.setBarDirection(Direction.DOWN);
        draw(page1, doc, context, block);

        //check label "overload"
        block = createBaseBlock();
        block.setType(Type.BAR_SUB);
        block.setIntervals(7);
        block.setSubIntervals(true);
        block.setUnits(DistanceUnit.IN);
        page1.getInternalObj().put("scale", 100000);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setType(Type.BAR);
        block.setIntervals(1);
        block.setSubIntervals(true);
        block.setUnits(DistanceUnit.IN);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setType(Type.LINE);
        block.setIntervals(1);
        block.setUnits(DistanceUnit.IN);
        draw(page1, doc, context, block);

        doc.newPage();

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.LINE);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR);
        draw(page1, doc, context, block);

        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR_SUB);
        draw(page1, doc, context, block);


        doc.close();
        writer.close();
        outFile.close();
    }

    private ScalebarBlock createSmallBlock() {
        ScalebarBlock block;
        block = createBaseBlock();
        block.setSubIntervals(true);
        block.setType(Type.BAR);
        block.setUnits(DistanceUnit.IN);
        block.setMaxSize(150);
        return block;
    }

    private ScalebarBlock createBaseBlock() {
        ScalebarBlock block = new ScalebarBlock();
        block.setMaxSize(300);
        block.setType(Type.LINE);
        block.setSpacingAfter(30);
        return block;
    }

    private void draw(PJsonObject page1, final Document doc, RenderingContext context, ScalebarBlock block) throws DocumentException {
        block.render(page1, new Block.PdfElement() {
            public void add(Element element) throws DocumentException {
                doc.add(element);
            }
        }, context);
    }
}
