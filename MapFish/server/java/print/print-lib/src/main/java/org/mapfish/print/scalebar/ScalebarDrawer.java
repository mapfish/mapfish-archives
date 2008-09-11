package org.mapfish.print.scalebar;

import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import org.mapfish.print.PDFCustomBlocks;
import org.mapfish.print.config.layout.ScalebarBlock;

import java.awt.geom.AffineTransform;
import java.util.List;

/**
 * Base class for drawing a scale bar.
 */
public abstract class ScalebarDrawer implements PDFCustomBlocks.ChunkDrawer {
    protected final ScalebarBlock block;
    protected final List<Label> labels;
    protected final int barSize;
    private final int labelDistance;
    protected final int subIntervals;
    protected final float intervalWidth;
    private final Font pdfFont;
    private final float leftLabelMargin;
    private final float rightLabelMargin;
    private final float maxLabelWidth;
    private final float maxLabelHeight;

    public ScalebarDrawer(ScalebarBlock block, List<Label> labels, int barSize,
                          int labelDistance, int subIntervals, float intervalWidth, Font pdfFont,
                          float leftLabelMargin, float rightLabelMargin, float maxLabelWidth, float maxLabelHeight
    ) {
        this.block = block;
        this.labels = labels;
        this.barSize = barSize;
        this.labelDistance = labelDistance;
        this.subIntervals = subIntervals;
        this.intervalWidth = intervalWidth;
        this.pdfFont = pdfFont;
        this.leftLabelMargin = leftLabelMargin;
        this.rightLabelMargin = rightLabelMargin;
        this.maxLabelWidth = maxLabelWidth;
        this.maxLabelHeight = maxLabelHeight;
    }

    public static ScalebarDrawer create(ScalebarBlock block, Type type, List<Label> labels,
                                        int barSize, int labelDistance,
                                        int subIntervals, float intervalWidth, Font pdfFont, float leftLabelMargin,
                                        float rightLabelMargin, float maxLabelWidth, float maxLabelHeight) {
        switch (type) {
            case BAR:
                return new BarScalebarDrawer(block, labels, barSize, labelDistance, subIntervals, intervalWidth, pdfFont, leftLabelMargin, rightLabelMargin, maxLabelWidth, maxLabelHeight);
            case BAR_SUB:
                return new BarSubScalebarDrawer(block, labels, barSize, labelDistance, subIntervals, intervalWidth, pdfFont, leftLabelMargin, rightLabelMargin, maxLabelWidth, maxLabelHeight);
            case LINE:
                return new LineScalebarDrawer(block, labels, barSize, labelDistance, subIntervals, intervalWidth, pdfFont, leftLabelMargin, rightLabelMargin, maxLabelWidth, maxLabelHeight);
            default:
                throw new RuntimeException("Unknown type: " + type);
        }
    }

    public void render(Rectangle rectangle, PdfContentByte dc) {
        dc.saveState();
        try {
            //sets the transformation for drawing the labels and do it
            final AffineTransform rotate = getRotationTransform(block.getBarDirection());
            final AffineTransform labelTransform = AffineTransform.getTranslateInstance(
                    rectangle.getLeft(),
                    rectangle.getBottom());
            labelTransform.concatenate(rotate);
            labelTransform.translate(leftLabelMargin, maxLabelHeight);
            dc.transform(labelTransform);
            dc.setColorStroke(block.getColor());
            dc.setFontAndSize(pdfFont.getCalculatedBaseFont(false), pdfFont.getSize());
            drawLabels(dc);

            dc.restoreState();
            dc.saveState();

            //sets the transformation for drawing the bar and do it
            final AffineTransform lineTransform = AffineTransform.getTranslateInstance(
                    rectangle.getLeft(),
                    rectangle.getBottom());
            lineTransform.concatenate(rotate);
            lineTransform.translate(leftLabelMargin, labelDistance + maxLabelHeight);
            dc.transform(lineTransform);
            dc.setLineWidth(block.getLineWidth());
            dc.setColorStroke(block.getColor());
            drawBar(dc);
        } finally {
            dc.restoreState();
        }
    }

    private AffineTransform getRotationTransform(Direction direction) {
        AffineTransform rotate;
        switch (direction) {
            case UP:
                rotate = new AffineTransform(1, 0, 0, 1, 0, 0);
                break;
            case DOWN:
                rotate = new AffineTransform(-1, 0, 0, -1, getTotalWidth(), getTotalHeight());
                break;
            case LEFT:
                rotate = new AffineTransform(0, 1, -1, 0, getTotalHeight(), 0);
                break;
            case RIGHT:
                rotate = new AffineTransform(0, -1, 1, 0, 0, getTotalWidth());
                break;
            default:
                throw new RuntimeException("Unknown orientation: " + direction);
        }
        return rotate;
    }

    private float getTotalWidth() {
        return intervalWidth * block.getIntervals() + leftLabelMargin + rightLabelMargin;
    }

    private float getTotalHeight() {
        return barSize + labelDistance + maxLabelHeight;
    }

    /**
     * Draws the labels. The transformation is setup in a manner where the
     * position of the labels is at (label.paperOffset,0).
     */
    private void drawLabels(PdfContentByte dc) {
        float prevPos = getTotalWidth();

        for (int i = labels.size() - 1; i >= 0; --i) {
            Label label = labels.get(i);
            final float offsetH;
            final float offsetV;
            if (block.getTextDirection().getAngle() == block.getBarDirection().getAngle()) {
                //same direction
                offsetH = -label.width / 2;
                offsetV = -maxLabelHeight;

            } else if (block.getTextDirection().getAngle() == -block.getBarDirection().getAngle()) {
                //opposite direction
                offsetH = label.width / 2;
                offsetV = 0;
            } else if (block.getTextDirection().getAngle() - block.getBarDirection().getAngle() < 0) {
                offsetH = label.width / 2;
                offsetV = -label.height;
            } else {
                offsetH = -label.width / 2;
                offsetV = 0;
            }

            if (label.paperOffset + Math.abs(offsetH) <= prevPos - 1) {
                dc.beginText();
                dc.showTextAligned(PdfContentByte.ALIGN_LEFT, label.label,
                        label.paperOffset + offsetH, offsetV, (float) (block.getBarDirection().getAngle() - block.getTextDirection().getAngle()));
                dc.endText();
                prevPos = label.paperOffset - Math.abs(offsetH);
            } else {
                //the label would be written over the previous one => ignore it
                label.label = null;
            }
        }
    }

    /**
     * Draws the bar itself. The transformation is setup in a manner where the
     * bar starts at (0,0) and ends at (intervals*intervalWidth, lineWidth)
     */
    protected abstract void drawBar(PdfContentByte dc);

}
