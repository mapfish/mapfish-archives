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

package org.mapfish.print.config.layout;

import com.lowagie.text.DocumentException;
import com.lowagie.text.pdf.PdfPCell;
import org.mapfish.print.PDFUtils;
import org.mapfish.print.RenderingContext;
import org.mapfish.print.utils.PJsonObject;

public class ColumnDef {
    private Block header;
    private Block cell;

    public void setHeader(Block header) {
        this.header = header;
    }

    public void setCell(Block cell) {
        this.cell = cell;
    }

    public PdfPCell createHeaderPdfCell(PJsonObject params, RenderingContext context, int col, int nbRows, int nbCols, TableConfig config) throws DocumentException {
        return PDFUtils.createCell(params, context, header, 0, col, nbRows, nbCols, config);
    }

    public PdfPCell createContentPdfCell(PJsonObject params, RenderingContext context, int row, int col, int nbRows, int nbCols, TableConfig config) throws DocumentException {
        return PDFUtils.createCell(params, context, cell, row, col, nbRows, nbCols, config);
    }
}
