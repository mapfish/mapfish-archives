package org.mapfish.print.config.layout;

import com.lowagie.text.BadElementException;
import com.lowagie.text.Chunk;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.BaseFont;
import org.mapfish.print.InvalidJsonValueException;
import org.mapfish.print.InvalidValueException;
import org.mapfish.print.PDFCustomBlocks;
import org.mapfish.print.PDFUtils;
import org.mapfish.print.RenderingContext;
import org.mapfish.print.scalebar.Direction;
import org.mapfish.print.scalebar.Label;
import org.mapfish.print.scalebar.ScalebarDrawer;
import org.mapfish.print.scalebar.Type;
import org.mapfish.print.utils.DistanceUnit;
import org.mapfish.print.utils.PJsonObject;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Block for drawing a scale bar
 */
public class ScalebarBlock extends ParagraphBlock {
    private int maxSize = 150;

    private Type type = Type.LINE;

    private int intervals = 3;

    private boolean subIntervals = false;

    private DistanceUnit units = null;

    private Integer barSize = null;

    private Direction barDirection = Direction.UP;

    private Direction textDirection = Direction.UP;

    private Integer labelDistance = null;

    private String font = "Helvetica";
    private Float fontSize = null;
    private String fontEncoding = BaseFont.WINANSI;

    private Color color = Color.BLACK;

    /**
     * The background color of the odd intervals (only for the scalebar of type "bar")
     */
    private Color barBgColor = null;

    private Float lineWidth = null;


    protected void fillParagraph(RenderingContext context, PJsonObject params, Paragraph paragraph) throws DocumentException {
        final PJsonObject parent = (PJsonObject) params.getParent().getParent();
        final DistanceUnit mapUnits = DistanceUnit.fromString(parent.getString("units"));
        if (mapUnits == null) {
            throw new InvalidJsonValueException(parent, "units", parent.getString("units"));
        }
        DistanceUnit scaleUnit = (units != null ? units : mapUnits);
        final int scale = params.getInt("scale");

        final double maxWidthIntervaleDistance = DistanceUnit.PT.convertTo(maxSize, scaleUnit) * scale / intervals;
        final double intervalDistance = getNearestNiceValue(maxWidthIntervaleDistance, scaleUnit);

        final Font pdfFont = FontFactory.getFont(font, fontEncoding, getFontSize());
        tryLayout(context, paragraph, pdfFont, scaleUnit, scale, intervalDistance, 0);
    }

    /**
     * Try recursively to find the correct layout.
     */
    private void tryLayout(RenderingContext context, Paragraph paragraph, Font pdfFont, DistanceUnit scaleUnit, int scale, double intervalDistance, int tryNumber) throws DocumentException {
        if (tryNumber > 3) {
            //noinspection ThrowableInstanceNeverThrown
            context.addError(new InvalidValueException("maxSize too small", Integer.toString(maxSize)));
            return;
        }

        DistanceUnit intervalUnit = DistanceUnit.getBestUnit(intervalDistance, scaleUnit);
        final float intervalPaperWidth = (float) scaleUnit.convertTo(intervalDistance / scale, DistanceUnit.PT);

        //compute the label positions
        final List<Label> labels = new ArrayList<Label>(intervals + 1);
        final float leftLabelMargin;
        final float rightLabelMargin;
        final BaseFont baseFont = pdfFont.getCalculatedBaseFont(false);
        if (intervals > 1 || subIntervals) {
            //the label will be centered under each tick marks
            for (int i = 0; i <= intervals; ++i) {
                String labelText = createLabelText(scaleUnit, intervalDistance * i, intervalUnit);
                if (i == intervals) {
                    labelText += intervalUnit;
                }
                labels.add(new Label(intervalPaperWidth * i, labelText, baseFont, getFontSize(),
                        !barDirection.isSameOrientation(textDirection)));
            }
            leftLabelMargin = labels.get(0).width / 2.0f;
            rightLabelMargin = labels.get(labels.size() - 1).width / 2.0f;
        } else {
            //if there is only one interval, place the label centered between the two tick marks
            final Label label = new Label(intervalPaperWidth / 2.0f,
                    createLabelText(scaleUnit, intervalDistance, intervalUnit) + intervalUnit, baseFont, getFontSize(), !barDirection.isSameOrientation(textDirection));
            labels.add(label);
            leftLabelMargin = rightLabelMargin = Math.max(0.0f, label.width - intervalPaperWidth) / 2.0f;
        }


        if (intervals * intervalPaperWidth + leftLabelMargin + rightLabelMargin <= maxSize) {
            //the layout fits the maxSize
            doLayout(context, paragraph, pdfFont, labels, intervalPaperWidth, scaleUnit, intervalDistance, intervalUnit,
                    leftLabelMargin, rightLabelMargin);
        } else {
            //not enough room because of the labels, try a smaller bar
            double nextIntervalDistance = getNearestNiceValue(intervalDistance * 0.9, scaleUnit);
            tryLayout(context, paragraph, pdfFont, scaleUnit, scale, nextIntervalDistance, tryNumber + 1);
        }
    }

    /**
     * Called when the position of the labels and their content is known.
     * <p/>
     * Creates the drawer and schedule it for drawing when the position of the block is known.
     */
    private void doLayout(RenderingContext context, Paragraph paragraph, Font pdfFont, List<Label> labels,
                          float intervalWidth, DistanceUnit scaleUnit, double intervalDistance,
                          DistanceUnit intervalUnit, float leftLabelPaperMargin, float rightLabelPaperMargin) throws BadElementException {
        float maxLabelHeight = 0.0f;
        float maxLabelWidth = 0.0f;
        for (int i = 0; i < labels.size(); i++) {
            Label label = labels.get(i);
            maxLabelHeight = Math.max(maxLabelHeight, label.height);
            maxLabelWidth = Math.max(maxLabelWidth, label.width);
        }
        float width = intervalWidth * intervals + leftLabelPaperMargin + rightLabelPaperMargin;
        float height = getBarSize() + getLabelDistance() + maxLabelHeight;
        final Image background;
        if (barDirection == Direction.DOWN || barDirection == Direction.UP) {
            background = PDFUtils.createEmptyImage(width, height);
        } else {
            //noinspection SuspiciousNameCombination
            background = PDFUtils.createEmptyImage(height, width);
        }

        int numSubIntervals = 1;
        if (subIntervals) {
            numSubIntervals = getNbSubIntervals(scaleUnit, intervalDistance, intervalUnit);
        }
        PDFCustomBlocks.ChunkDrawer drawer = ScalebarDrawer.create(this, type, labels, getBarSize(), getLabelDistance(), numSubIntervals, intervalWidth, pdfFont, leftLabelPaperMargin, rightLabelPaperMargin, maxLabelWidth, maxLabelHeight);

        Chunk mapChunk = new Chunk(background, 0f, 0f, true);
        context.getCustomBlocks().addChunkDrawer(mapChunk, drawer);
        paragraph.add(mapChunk);
    }

    /**
     * Format the label text.
     */
    private String createLabelText(DistanceUnit scaleUnit, double value, DistanceUnit intervalUnit) {
        final double scaledValue = scaleUnit.convertTo(value, intervalUnit);
        return Long.toString(Math.round(scaledValue));
    }

    /**
     * Reduce the given value to the nearest 1 significant digit number starting
     * with 1, 2 or 5.
     */
    private double getNearestNiceValue(double value, DistanceUnit scaleUnit) {
        DistanceUnit bestUnit = DistanceUnit.getBestUnit(value, scaleUnit);
        double factor = scaleUnit.convertTo(1.0, bestUnit);

        // nearest power of 10 lower than value
        int digits = (int) (Math.log(value * factor) / Math.log(10));
        double pow10 = Math.pow(10, digits);

        // ok, find first character
        double firstChar = value * factor / pow10;

        // right, put it into the correct bracket
        int barLen;
        if (firstChar >= 10.0) {
            barLen = 10;
        } else if (firstChar >= 5.0) {
            barLen = 5;
        } else if (firstChar >= 2.0) {
            barLen = 2;
        } else {
            barLen = 1;
        }

        // scale it up the correct power of 10
        return barLen * pow10 / factor;
    }

    /**
     * @return The "nicest" number of sub intervals in function of the interval distance.
     */
    private int getNbSubIntervals(DistanceUnit scaleUnit, double intervalDistance, DistanceUnit intervalUnit) {
        double value = scaleUnit.convertTo(intervalDistance, intervalUnit);
        int digits = (int) (Math.log(value) / Math.log(10));
        double pow10 = Math.pow(10, digits);

        // ok, find first character
        int firstChar = (int) (value / pow10);
        switch (firstChar) {
            case 1:
                return 2;
            case 2:
                return 2;
            case 5:
                return 5;
            case 10:
                return 2;
            default:
                throw new RuntimeException("Invalid interval: " + value + intervalUnit + " (" + firstChar + ")");
        }
    }

    public void setMaxSize(int maxSize) {
        this.maxSize = maxSize;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public void setIntervals(int intervals) {
        if (intervals < 1) {
            throw new InvalidValueException("intervals", Integer.toString(intervals));
        }
        this.intervals = intervals;
    }

    public void setSubIntervals(boolean subIntervals) {
        this.subIntervals = subIntervals;
    }

    public void setUnits(DistanceUnit units) {
        this.units = units;
    }

    public void setBarSize(int barSize) {
        this.barSize = barSize;
    }

    public void setBarDirection(Direction barDirection) {
        this.barDirection = barDirection;
    }

    public void setTextDirection(Direction textDirection) {
        this.textDirection = textDirection;
    }

    public void setLabelDistance(int labelDistance) {
        this.labelDistance = labelDistance;
    }

    public void setFont(String font) {
        this.font = font;
    }

    public void setFontSize(float fontSize) {
        this.fontSize = fontSize;
    }

    public void setFontEncoding(String fontEncoding) {
        this.fontEncoding = fontEncoding;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    public void setBarBgColor(Color barBgColor) {
        this.barBgColor = barBgColor;
    }

    public void setLineWidth(Float lineWidth) {
        this.lineWidth = lineWidth;
    }

    public int getBarSize() {
        if (barSize != null) {
            return barSize;
        } else {
            return maxSize / 30;
        }
    }

    public int getLabelDistance() {
        if (labelDistance != null) {
            return labelDistance;
        } else {
            return maxSize / 40;
        }
    }

    public float getFontSize() {
        if (fontSize != null) {
            return fontSize;
        } else {
            return maxSize * 10.0f / 200.0f;
        }
    }

    public Float getLineWidth() {
        if (lineWidth != null) {
            return lineWidth;
        } else {
            return maxSize / 150.0f;
        }
    }

    public Direction getBarDirection() {
        return barDirection;
    }

    public Direction getTextDirection() {
        return textDirection;
    }

    public int getIntervals() {
        return intervals;
    }

    public Color getColor() {
        return color;
    }

    public Color getBarBgColor() {
        return barBgColor;
    }
}
