package org.sstec.resourceserver;

import javax.swing.*;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionAdapter;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

class ImagePanel extends JPanel {
    private BufferedImage originalImageRef; // For coordinate mapping
    private BufferedImage processedImageToDisplay; // This image has selections & borders baked in
    private List<SelectionShape> shapes = new ArrayList<>();
    private Rectangle currentDrawingRectPreview; // For live drawing feedback (blue rect)
    private Rectangle selectedRectangle; // For the currently selected rectangle
    private Point dragStartPoint;
    private Consumer<Rectangle> rectangleDrawnListener;
    private static final Stroke PREVIEW_BORDER_STROKE = new BasicStroke(2.0f);
    private static final Stroke SELECTION_BORDER_STROKE = new BasicStroke(2.5f);
    private static final Color SELECTION_SHADOW_COLOR = new Color(0, 0, 0, 40);
    private static final int SHADOW_OFFSET = 2;
    private static final Color PILL_BACKGROUND = new Color(255, 59, 48, 230);
    private static final Color PILL_TEXT_COLOR = Color.WHITE;
    public static final double PILL_SIZE_RATIO = 0.10; // 10% of rectangle size
    public static final double PILL_SIZE_RATIO_SMALL = 0.15; // 15% of rectangle size
    public static final double PILL_SIZE_RATIO_MEDIUM = 0.20; // 20% of rectangle size
    public static final double PILL_SIZE_RATIO_LARGE = 0.25; // 25% of rectangle size
    public static final double PILL_SIZE_RATIO_XLARGE = 0.40; // 40% of rectangle size
    public static final int MIN_PILL_SIZE = 20; // Minimum size
    public static final int MAX_PILL_SIZE = 60; // Maximum size
    private final float[] SELECTION_DASH = {5.0f, 5.0f}; // Dashed border pattern
    private String currentShape = "Rounded Rectangle";
    private String currentBorderStyle = "Dashed";
    private String currentBorderColor = "Red";
    private String currentPillStyle = "Modern";
    private final int ROUNDED_RECT_ARC = 20;
    private final int DIAMOND_POINTS = 4;
    private final int STAR_POINTS = 5;
    private final int HEXAGON_POINTS = 6;
    private final int OCTAGON_POINTS = 8;
    
    // Dragging state
    private int draggedShapeIndex = -1;
    private Point dragOffset;
    private BufferedImage placeholderImage;

    private static final int PILL_POSITION_COUNT = 8;
    private Map<Integer, Integer> pillPositions = new HashMap<>();
    private Map<Integer, String> selectionShapes = new HashMap<>();
    private Map<Integer, String> selectionBorderStyles = new HashMap<>();
    private Map<Integer, String> selectionBorderColors = new HashMap<>();
    private Map<Integer, String> selectionPillStyles = new HashMap<>();
    private int selectedShapeIndex = -1;
    private Consumer<SelectionShape> shapeSelectedListener;
    private Map<Integer, Double> pillSizes = new HashMap<>(); // Store custom pill sizes
    private Point currentMousePoint = null;

    public ImagePanel() {
        loadPlaceholderImage();
        addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                if (originalImageRef == null) return;
                
                Point imagePoint = panelToImageCoordinates(e.getPoint());
                
                // Check if clicking on a pill
                for (int i = shapes.size() - 1; i >= 0; i--) {
                    SelectionShape shape = shapes.get(i);
                    int currentPosition = pillPositions.getOrDefault(i, 0);
                    if (isPointInPill(e.getPoint(), shape.getBounds(), i, currentPosition)) {
                        // If right click, cycle pill size
                        if (SwingUtilities.isRightMouseButton(e)) {
                            double currentSize = pillSizes.getOrDefault(i, PILL_SIZE_RATIO);
                            double newSize;
                            if (currentSize == PILL_SIZE_RATIO) {
                                newSize = PILL_SIZE_RATIO_SMALL;
                            } else if (currentSize == PILL_SIZE_RATIO_SMALL) {
                                newSize = PILL_SIZE_RATIO_MEDIUM;
                            } else if (currentSize == PILL_SIZE_RATIO_MEDIUM) {
                                newSize = PILL_SIZE_RATIO_LARGE;
                            } else if (currentSize == PILL_SIZE_RATIO_LARGE) {
                                newSize = PILL_SIZE_RATIO_XLARGE;
                            } else {
                                newSize = PILL_SIZE_RATIO;
                            }
                            pillSizes.put(i, newSize);
                        } else {
                            // Left click cycles position
                            int newPosition = (currentPosition + 1) % PILL_POSITION_COUNT;
                            pillPositions.put(i, newPosition);
                        }
                        repaint();
                        return;
                    }
                }
                
                // Check if clicking on an existing selection
                for (int i = shapes.size() - 1; i >= 0; i--) {
                    SelectionShape shape = shapes.get(i);
                    if (shape.getBounds().contains(imagePoint)) {
                        setSelectedShapeIndex(i);
                        return;
                    }
                }
                
                // If no shape was clicked, deselect
                setSelectedShapeIndex(-1);
                
                // Start drawing new selection
                dragStartPoint = imagePoint;
                currentDrawingRectPreview = new Rectangle(imagePoint.x, imagePoint.y, 0, 0);
                repaint();
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                if (originalImageRef == null || currentDrawingRectPreview == null || dragStartPoint == null) {
                    currentDrawingRectPreview = null;
                    dragStartPoint = null;
                    repaint();
                    return;
                }
                
                // Only create a new selection if we were actually drawing
                if (currentDrawingRectPreview.width > 0 && currentDrawingRectPreview.height > 0) {
                    Point imageEndPoint = panelToImageCoordinates(e.getPoint());
                    updateCurrentRectPreview(dragStartPoint, imageEndPoint);

                    if (rectangleDrawnListener != null) {
                        rectangleDrawnListener.accept(new Rectangle(currentDrawingRectPreview));
                    }
                }
                
                currentDrawingRectPreview = null;
                dragStartPoint = null;
                repaint();
            }
        });

        addMouseMotionListener(new MouseMotionAdapter() {
            @Override
            public void mouseDragged(MouseEvent e) {
                if (originalImageRef == null) return;
                
                // If we're dragging a selection, don't update the drawing preview
                if (isDraggingSelection()) {
                    return;
                }
                
                if (currentDrawingRectPreview != null && dragStartPoint != null) {
                    Point imageCurrentPoint = panelToImageCoordinates(e.getPoint());
                    updateCurrentRectPreview(dragStartPoint, imageCurrentPoint);
                    repaint();
                }
            }

            @Override
            public void mouseMoved(MouseEvent e) {
                currentMousePoint = e.getPoint();
                repaint();
            }
        });
    }

    private void loadPlaceholderImage() {
        try {
            // Load SVG from resources
            InputStream svgStream = getClass().getResourceAsStream("/icons/placeholder.svg");
            if (svgStream == null) {
                System.err.println("Could not find placeholder.svg in resources");
                return;
            }

            // Create a transcoder input
            TranscoderInput input = new TranscoderInput(svgStream);

            // Create a transcoder output
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            TranscoderOutput output = new TranscoderOutput(outputStream);

            // Create a PNG transcoder
            PNGTranscoder transcoder = new PNGTranscoder();
            transcoder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, 400f);
            transcoder.addTranscodingHint(PNGTranscoder.KEY_HEIGHT, 400f);

            // Transcode the SVG to PNG
            transcoder.transcode(input, output);

            // Convert the PNG data to a BufferedImage
            byte[] pngData = outputStream.toByteArray();
            placeholderImage = ImageIO.read(new ByteArrayInputStream(pngData));

        } catch (Exception e) {
            System.err.println("Error loading placeholder image: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void setRectangleDrawnListener(Consumer<Rectangle> listener) {
        this.rectangleDrawnListener = listener;
    }

    public void setImage(BufferedImage image) {
        this.originalImageRef = image;
        this.currentDrawingRectPreview = null;
        // processedImageToDisplay will be set by the app
        repaint();
    }

    public void setProcessedImageToDisplay(BufferedImage image) {
        this.processedImageToDisplay = image;
        repaint(); // Repaint when the main processed image changes
    }

    public void setSelectionsForDrawingFeedback(List<Rectangle> newSelections) {
        // Create new shapes list
        List<SelectionShape> newShapes = new ArrayList<>();
        
        // Copy existing shapes
        for (int i = 0; i < newSelections.size(); i++) {
            if (i < shapes.size()) {
                // Keep existing shape but update bounds
                SelectionShape existingShape = shapes.get(i);
                existingShape.setBounds(newSelections.get(i));
                newShapes.add(existingShape);
            } else {
                // Create new shape with current styles
                SelectionShape newShape = new SelectionShape(
                    newSelections.get(i),
                    currentShape,
                    currentBorderStyle,
                    currentBorderColor,
                    currentPillStyle,
                    0
                );
                newShapes.add(newShape);
                
                // Initialize pill position and style for the new shape
                pillPositions.put(i, 0);
                selectionShapes.put(i, currentShape);
                selectionBorderStyles.put(i, currentBorderStyle);
                selectionBorderColors.put(i, currentBorderColor);
                selectionPillStyles.put(i, currentPillStyle);
            }
        }
        
        this.shapes = newShapes;
        repaint();
    }

    public void setSelectedRectangle(Rectangle rect) {
        this.selectedRectangle = rect;
        repaint();
    }

    public void setCurrentShape(String shape) {
        this.currentShape = shape;
        if (selectedShapeIndex >= 0 && selectedShapeIndex < shapes.size()) {
            shapes.get(selectedShapeIndex).setShape(shape);
            selectionShapes.put(selectedShapeIndex, shape);
        }
        repaint();
    }

    public void setBorderStyle(String style) {
        this.currentBorderStyle = style;
        if (selectedShapeIndex >= 0 && selectedShapeIndex < shapes.size()) {
            shapes.get(selectedShapeIndex).setBorderStyle(style);
            selectionBorderStyles.put(selectedShapeIndex, style);
        }
        repaint();
    }

    public void setBorderColor(String color) {
        this.currentBorderColor = color;
        if (selectedShapeIndex >= 0 && selectedShapeIndex < shapes.size()) {
            shapes.get(selectedShapeIndex).setBorderColor(color);
            selectionBorderColors.put(selectedShapeIndex, color);
        }
        repaint();
    }

    public void setPillStyle(String style) {
        this.currentPillStyle = style;
        if (selectedShapeIndex >= 0 && selectedShapeIndex < shapes.size()) {
            shapes.get(selectedShapeIndex).setPillStyle(style);
            selectionPillStyles.put(selectedShapeIndex, style);
        }
        repaint();
    }

    public void setDraggedSelection(int index, Point startPoint) {
        if (index >= 0 && index < shapes.size()) {
            draggedShapeIndex = index;
            SelectionShape shape = shapes.get(index);
            dragOffset = new Point(
                startPoint.x - shape.getBounds().x,
                startPoint.y - shape.getBounds().y
            );
        }
    }

    public void clearDraggedSelection() {
        draggedShapeIndex = -1;
        dragOffset = null;
    }

    public boolean isDraggingSelection() {
        return draggedShapeIndex != -1;
    }

    public void updateDraggedSelection(Point currentPoint) {
        if (draggedShapeIndex != -1 && dragOffset != null) {
            SelectionShape shape = shapes.get(draggedShapeIndex);
            Rectangle rect = shape.getBounds();
            int newX = currentPoint.x - dragOffset.x;
            int newY = currentPoint.y - dragOffset.y;
            
            // Keep the rectangle within image bounds
            if (originalImageRef != null) {
                newX = Math.max(0, Math.min(newX, originalImageRef.getWidth() - rect.width));
                newY = Math.max(0, Math.min(newY, originalImageRef.getHeight() - rect.height));
            }
            
            rect.setLocation(newX, newY);
            shape.setBounds(rect);
            repaint();
        }
    }

    private void updateCurrentRectPreview(Point imageStart, Point imageCurrent) {
        // This logic creates the rectangle in image coordinates
        int x = Math.min(imageStart.x, imageCurrent.x);
        int y = Math.min(imageStart.y, imageCurrent.y);
        int width = Math.abs(imageStart.x - imageCurrent.x);
        int height = Math.abs(imageStart.y - imageCurrent.y);

        if (originalImageRef != null) {
            x = Math.max(0, Math.min(x, originalImageRef.getWidth() - 1));
            y = Math.max(0, Math.min(y, originalImageRef.getHeight() - 1));
            width = Math.min(width, originalImageRef.getWidth() - x);
            height = Math.min(height, originalImageRef.getHeight() - y);
        }
        currentDrawingRectPreview.setBounds(x, y, width, height);
    }

    @Override
    public Dimension getPreferredSize() {
        if (processedImageToDisplay != null) {
            return new Dimension(processedImageToDisplay.getWidth(), processedImageToDisplay.getHeight());
        }
        return new Dimension(800, 600);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g.create();

        // Enable anti-aliasing and high-quality rendering
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);
        
        // Get panel size
        int panelWidth = getWidth();
        int panelHeight = getHeight();

        if (processedImageToDisplay != null) {
            // Calculate image position to center it
            int imageX = (panelWidth - processedImageToDisplay.getWidth()) / 2;
            int imageY = (panelHeight - processedImageToDisplay.getHeight()) / 2;

            // Draw guide lines
            g2d.setColor(new Color(100, 100, 100, 100));
            g2d.setStroke(new BasicStroke(1));
            
            // Vertical guide lines
            g2d.drawLine(imageX, 0, imageX, panelHeight);
            g2d.drawLine(imageX + processedImageToDisplay.getWidth(), 0, 
                        imageX + processedImageToDisplay.getWidth(), panelHeight);
            
            // Horizontal guide lines
            g2d.drawLine(0, imageY, panelWidth, imageY);
            g2d.drawLine(0, imageY + processedImageToDisplay.getHeight(), 
                        panelWidth, imageY + processedImageToDisplay.getHeight());

            // Draw the main image at original size
            g2d.drawImage(processedImageToDisplay, imageX, imageY, null);

            // Draw all shapes
            for (int i = 0; i < shapes.size(); i++) {
                SelectionShape shape = shapes.get(i);
                Rectangle rect = shape.getBounds();
                Rectangle panelRect = new Rectangle(
                    rect.x + imageX,
                    rect.y + imageY,
                    rect.width,
                    rect.height
                );
                drawShape(g2d, new SelectionShape(
                    panelRect,
                    shape.getShape(),
                    shape.getBorderStyle(),
                    shape.getBorderColor(),
                    shape.getPillStyle(),
                    pillPositions.getOrDefault(i, 0)
                ), false, i);
            }

            // Draw preview if exists
            if (currentDrawingRectPreview != null) {
                Rectangle previewRect = new Rectangle(
                    currentDrawingRectPreview.x + imageX,
                    currentDrawingRectPreview.y + imageY,
                    currentDrawingRectPreview.width,
                    currentDrawingRectPreview.height
                );
                SelectionShape previewShape = new SelectionShape(
                    previewRect,
                    currentShape,
                    currentBorderStyle,
                    currentBorderColor,
                    currentPillStyle,
                    0
                );
                drawShape(g2d, previewShape, true, -1);
            }

            // Draw mouse coordinates if available
            if (currentMousePoint != null) {
                Point imagePoint = panelToImageCoordinates(currentMousePoint);
                String coordText = String.format("Panel: (%d, %d) Image: (%d, %d)", 
                    currentMousePoint.x, currentMousePoint.y,
                    imagePoint.x, imagePoint.y);
                
                // Draw background for text
                FontMetrics fm = g2d.getFontMetrics();
                int textWidth = fm.stringWidth(coordText);
                int textHeight = fm.getHeight();
                g2d.setColor(new Color(0, 0, 0, 180));
                g2d.fillRect(10, 10, textWidth + 10, textHeight + 5);
                
                // Draw text
                g2d.setColor(Color.WHITE);
                g2d.drawString(coordText, 15, 15 + fm.getAscent());
            }
        } else if (placeholderImage != null) {
            // Calculate position to center the placeholder
            int imageX = (panelWidth - placeholderImage.getWidth()) / 2;
            int imageY = (panelHeight - placeholderImage.getHeight()) / 2;
            
            // Draw placeholder
            g2d.drawImage(placeholderImage, imageX, imageY, null);
        } else {
            // Draw fallback text if placeholder failed to load
            String text = "No Image Loaded";
            FontMetrics fm = g2d.getFontMetrics();
            int textWidth = fm.stringWidth(text);
            int x = (panelWidth - textWidth) / 2;
            int y = (panelHeight - fm.getHeight()) / 2 + fm.getAscent();
            g2d.drawString(text, x, y);
        }
        g2d.dispose();
    }

    private void drawShape(Graphics2D g2d, SelectionShape shape, boolean isPreview, int shapeIndex) {
        Stroke originalStroke = g2d.getStroke();
        Color originalColor = g2d.getColor();
        
        Rectangle rect = shape.getBounds();
        String shapeType = isPreview ? currentShape : shape.getShape();
        String borderStyle = isPreview ? currentBorderStyle : shape.getBorderStyle();
        String borderColor = isPreview ? currentBorderColor : shape.getBorderColor();
        
        // Draw shadow
        g2d.setColor(SELECTION_SHADOW_COLOR);
        g2d.fillRect(rect.x + SHADOW_OFFSET, rect.y + SHADOW_OFFSET, 
                    rect.width, rect.height);
        
        // Set border style
        switch (borderStyle) {
            case "Dotted":
                g2d.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 
                    10.0f, new float[]{2.0f, 2.0f}, 0.0f));
                break;
            case "Double":
                g2d.setStroke(new BasicStroke(2.5f));
                break;
            case "Groove":
                g2d.setStroke(new BasicStroke(3.0f));
                break;
            case "Ridge":
                g2d.setStroke(new BasicStroke(3.0f));
                break;
            default: // Solid or Dashed
                if (borderStyle.equals("Dashed")) {
                    g2d.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 
                        10.0f, SELECTION_DASH, 0.0f));
                } else {
                    g2d.setStroke(new BasicStroke(2.5f));
                }
        }
        
        // Set border color
        g2d.setColor(getColorFromName(borderColor));
        
        // Draw the shape
        switch (shapeType) {
            case "Ellipse":
                g2d.drawOval(rect.x, rect.y, rect.width, rect.height);
                break;
            case "Diamond":
                drawDiamond(g2d, rect, false);
                break;
            case "Star":
                drawStar(g2d, rect, false);
                break;
            case "Hexagon":
                drawPolygon(g2d, rect, HEXAGON_POINTS, false);
                break;
            case "Octagon":
                drawPolygon(g2d, rect, OCTAGON_POINTS, false);
                break;
            case "Rounded Rectangle":
                g2d.drawRoundRect(rect.x, rect.y, rect.width, rect.height, 
                                ROUNDED_RECT_ARC, ROUNDED_RECT_ARC);
                break;
            default: // Rectangle
                g2d.drawRect(rect.x, rect.y, rect.width, rect.height);
        }
        
        // Draw pill if not preview
        if (!isPreview) {
            drawPill(g2d, rect, shapeIndex, pillPositions.getOrDefault(shapeIndex, 0), shape.getPillStyle());
        }
        
        // Restore original stroke and color
        g2d.setStroke(originalStroke);
        g2d.setColor(originalColor);
    }

    private void drawShapeShadow(Graphics2D g2d, Rectangle rect, String shapeType) {
        // Implementation of drawShapeShadow method
    }

    private void setBorderStyle(Graphics2D g2d, String borderStyle) {
        // Implementation of setBorderStyle method
    }

    private void drawShapeOutline(Graphics2D g2d, Rectangle rect, String shapeType) {
        // Implementation of drawShapeOutline method
    }

    private void drawBorderEffects(Graphics2D g2d, Rectangle rect, String borderStyle) {
        // Implementation of drawBorderEffects method
    }

    private void drawPill(Graphics2D g2d, Rectangle rect, int index, int position, String pillStyle) {
        // Calculate pill size based on rectangle size and custom size if set
        double sizeRatio = pillSizes.getOrDefault(index, PILL_SIZE_RATIO);
        int pillWidth = (int)(rect.width * sizeRatio);
        int pillHeight = (int)(rect.height * sizeRatio);
        
        // Apply min/max constraints
        pillWidth = Math.max(MIN_PILL_SIZE, Math.min(MAX_PILL_SIZE, pillWidth));
        pillHeight = Math.max(MIN_PILL_SIZE, Math.min(MAX_PILL_SIZE, pillHeight));
        
        // Draw numbered pill
        String number = String.valueOf(index + 1);
        
        // Set font size proportional to pill size
        Font originalFont = g2d.getFont();
        int fontSize = (int) (Math.min(pillWidth, pillHeight) * 0.6);
        g2d.setFont(new Font(originalFont.getName(), Font.BOLD, fontSize));
        
        FontMetrics fm = g2d.getFontMetrics();
        int textWidth = fm.stringWidth(number);
        
        // Ensure pill is wide enough for the text
        pillWidth = Math.max(pillWidth, textWidth + (pillHeight / 4));
        
        // Calculate pill position based on the position index
        int pillX, pillY;
        int padding = pillHeight / 4;
        
        // Ensure position is within valid range
        position = position % PILL_POSITION_COUNT;
        
        switch (position) {
            case 0: // Top right inside
                pillX = rect.x + rect.width - pillWidth - padding;
                pillY = rect.y + padding;
                break;
            case 1: // Top left inside
                pillX = rect.x + padding;
                pillY = rect.y + padding;
                break;
            case 2: // Bottom left inside
                pillX = rect.x + padding;
                pillY = rect.y + rect.height - pillHeight - padding;
                break;
            case 3: // Bottom right inside
                pillX = rect.x + rect.width - pillWidth - padding;
                pillY = rect.y + rect.height - pillHeight - padding;
                break;
            case 4: // Top right outside
                pillX = rect.x + rect.width + padding;
                pillY = rect.y - pillHeight - padding;
                break;
            case 5: // Top left outside
                pillX = rect.x - pillWidth - padding;
                pillY = rect.y - pillHeight - padding;
                break;
            case 6: // Bottom left outside
                pillX = rect.x - pillWidth - padding;
                pillY = rect.y + rect.height + padding;
                break;
            case 7: // Bottom right outside
                pillX = rect.x + rect.width + padding;
                pillY = rect.y + rect.height + padding;
                break;
            default:
                pillX = rect.x + rect.width - pillWidth - padding;
                pillY = rect.y + padding;
        }
        
        // Draw pill based on style
        switch (pillStyle) {
            case "Classic":
                // Draw classic pill with gradient
                GradientPaint gradient = new GradientPaint(
                    pillX, pillY, new Color(255, 59, 48),
                    pillX, pillY + pillHeight, new Color(255, 59, 48, 200)
                );
                g2d.setPaint(gradient);
                g2d.fillRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                g2d.setColor(new Color(255, 255, 255, 50));
                g2d.drawRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                break;
            
            case "Minimal":
                // Draw minimal pill with thin border
                g2d.setColor(new Color(255, 59, 48, 180));
                g2d.fillRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                g2d.setColor(new Color(255, 59, 48));
                g2d.setStroke(new BasicStroke(1.0f));
                g2d.drawRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                break;
            
            case "Bold":
                // Draw bold pill with thick border
                g2d.setColor(new Color(255, 59, 48));
                g2d.fillRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                g2d.setColor(Color.WHITE);
                g2d.setStroke(new BasicStroke(2.0f));
                g2d.drawRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                break;
            
            case "Outline":
                // Draw outline pill with no fill
                g2d.setColor(new Color(255, 59, 48));
                g2d.setStroke(new BasicStroke(2.0f));
                g2d.drawRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                break;
            
            default: // Modern
                // Draw modern pill with shadow
                g2d.setColor(new Color(0, 0, 0, 40));
                g2d.fillRoundRect(pillX + 2, pillY + 2, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
                g2d.setColor(new Color(255, 59, 48, 230));
                g2d.fillRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                pillHeight / 2, pillHeight / 2);
        }
        
        // Draw pill text
        g2d.setColor(Color.WHITE);
        int textX = pillX + (pillWidth - textWidth) / 2;
        int textY = pillY + (pillHeight + fm.getAscent() - fm.getDescent()) / 2;
        g2d.drawString(number, textX, textY);
        
        // Restore original font
        g2d.setFont(originalFont);
    }

    private boolean isPointInPill(Point point, Rectangle rect, int index, int position) {
        // Convert rectangle to panel coordinates
        Rectangle panelRect = imageToPanelCoordinates(rect);
        
        // Calculate pill size
        double sizeRatio = pillSizes.getOrDefault(index, PILL_SIZE_RATIO);
        int pillWidth = (int)(panelRect.width * sizeRatio);
        int pillHeight = (int)(panelRect.height * sizeRatio);
        
        // Apply min/max constraints
        pillWidth = Math.max(MIN_PILL_SIZE, Math.min(MAX_PILL_SIZE, pillWidth));
        pillHeight = Math.max(MIN_PILL_SIZE, Math.min(MAX_PILL_SIZE, pillHeight));
        
        // Calculate pill position
        int pillX, pillY;
        int padding = pillHeight / 4;
        
        // Ensure position is within valid range
        position = position % PILL_POSITION_COUNT;
        
        switch (position) {
            case 0: // Top right inside
                pillX = panelRect.x + panelRect.width - pillWidth - padding;
                pillY = panelRect.y + padding;
                break;
            case 1: // Top left inside
                pillX = panelRect.x + padding;
                pillY = panelRect.y + padding;
                break;
            case 2: // Bottom left inside
                pillX = panelRect.x + padding;
                pillY = panelRect.y + panelRect.height - pillHeight - padding;
                break;
            case 3: // Bottom right inside
                pillX = panelRect.x + panelRect.width - pillWidth - padding;
                pillY = panelRect.y + panelRect.height - pillHeight - padding;
                break;
            case 4: // Top right outside
                pillX = panelRect.x + panelRect.width + padding;
                pillY = panelRect.y - pillHeight - padding;
                break;
            case 5: // Top left outside
                pillX = panelRect.x - pillWidth - padding;
                pillY = panelRect.y - pillHeight - padding;
                break;
            case 6: // Bottom left outside
                pillX = panelRect.x - pillWidth - padding;
                pillY = panelRect.y + panelRect.height + padding;
                break;
            case 7: // Bottom right outside
                pillX = panelRect.x + panelRect.width + padding;
                pillY = panelRect.y + panelRect.height + padding;
                break;
            default:
                pillX = panelRect.x + panelRect.width - pillWidth - padding;
                pillY = panelRect.y + padding;
        }
        
        // Create pill rectangle
        Rectangle pillRect = new Rectangle(pillX, pillY, pillWidth, pillHeight);
        
        // Check if point is inside pill
        return pillRect.contains(point);
    }

    public Point panelToImageCoordinates(Point panelPoint) {
        if (originalImageRef == null || getWidth() == 0 || getHeight() == 0) {
            return new Point(0,0);
        }
        
        // Calculate image position to center it
        int imageX = (getWidth() - originalImageRef.getWidth()) / 2;
        int imageY = (getHeight() - originalImageRef.getHeight()) / 2;
        
        // Adjust panel coordinates to account for centered image
        int adjustedX = panelPoint.x - imageX;
        int adjustedY = panelPoint.y - imageY;
        
        // Clamp coordinates to image bounds
        adjustedX = Math.max(0, Math.min(adjustedX, originalImageRef.getWidth() - 1));
        adjustedY = Math.max(0, Math.min(adjustedY, originalImageRef.getHeight() - 1));
        
        return new Point(adjustedX, adjustedY);
    }

    private Rectangle imageToPanelCoordinates(Rectangle imageRect) {
        if (originalImageRef == null || getWidth() == 0 || getHeight() == 0) {
            return new Rectangle(0,0,0,0);
        }
        
        // Calculate image position to center it
        int imageX = (getWidth() - originalImageRef.getWidth()) / 2;
        int imageY = (getHeight() - originalImageRef.getHeight()) / 2;
        
        // Adjust coordinates to account for centered image
        return new Rectangle(
            imageRect.x + imageX,
            imageRect.y + imageY,
            imageRect.width,
            imageRect.height
        );
    }

    // Add these methods to save and restore pill positions
    public Map<Integer, Integer> getPillPositions() {
        return new HashMap<>(pillPositions);
    }

    public void setPillPositions(Map<Integer, Integer> positions) {
        this.pillPositions = new HashMap<>(positions);
        repaint();
    }

    public Map<Integer, Double> getPillSizes() {
        return new HashMap<>(pillSizes);
    }

    public void setPillSizes(Map<Integer, Double> sizes) {
        this.pillSizes = new HashMap<>(sizes);
        repaint();
    }

    public String getShapeForSelection(int index) {
        return selectionShapes.getOrDefault(index, currentShape);
    }

    public String getBorderStyleForSelection(int index) {
        return selectionBorderStyles.getOrDefault(index, currentBorderStyle);
    }

    public String getBorderColorForSelection(int index) {
        return selectionBorderColors.getOrDefault(index, currentBorderColor);
    }

    public String getPillStyleForSelection(int index) {
        return selectionPillStyles.getOrDefault(index, currentPillStyle);
    }

    public void deleteSelectedShape() {
        if (selectedShapeIndex >= 0 && selectedShapeIndex < shapes.size()) {
            shapes.remove(selectedShapeIndex);
            selectionShapes.remove(selectedShapeIndex);
            selectionBorderStyles.remove(selectedShapeIndex);
            selectionBorderColors.remove(selectedShapeIndex);
            selectionPillStyles.remove(selectedShapeIndex);
            pillPositions.remove(selectedShapeIndex);
            
            // Update indices for remaining shapes
            Map<Integer, String> newShapes = new HashMap<>();
            Map<Integer, String> newBorderStyles = new HashMap<>();
            Map<Integer, String> newBorderColors = new HashMap<>();
            Map<Integer, String> newPillStyles = new HashMap<>();
            Map<Integer, Integer> newPillPositions = new HashMap<>();
            
            for (int i = 0; i < shapes.size(); i++) {
                if (i < selectedShapeIndex) {
                    newShapes.put(i, selectionShapes.get(i));
                    newBorderStyles.put(i, selectionBorderStyles.get(i));
                    newBorderColors.put(i, selectionBorderColors.get(i));
                    newPillStyles.put(i, selectionPillStyles.get(i));
                    newPillPositions.put(i, pillPositions.get(i));
                } else {
                    newShapes.put(i, selectionShapes.get(i + 1));
                    newBorderStyles.put(i, selectionBorderStyles.get(i + 1));
                    newBorderColors.put(i, selectionBorderColors.get(i + 1));
                    newPillStyles.put(i, selectionPillStyles.get(i + 1));
                    newPillPositions.put(i, pillPositions.get(i + 1));
                }
            }
            
            selectionShapes = newShapes;
            selectionBorderStyles = newBorderStyles;
            selectionBorderColors = newBorderColors;
            selectionPillStyles = newPillStyles;
            pillPositions = newPillPositions;
            
            selectedShapeIndex = -1;
            repaint();
        }
    }

    // Add methods to get all properties for saving
    public Map<Integer, String> getAllShapes() {
        return new HashMap<>(selectionShapes);
    }

    public Map<Integer, String> getAllBorderStyles() {
        return new HashMap<>(selectionBorderStyles);
    }

    public Map<Integer, String> getAllBorderColors() {
        return new HashMap<>(selectionBorderColors);
    }

    public Map<Integer, String> getAllPillStyles() {
        return new HashMap<>(selectionPillStyles);
    }

    public Map<Integer, Integer> getAllPillPositions() {
        return new HashMap<>(pillPositions);
    }

    // Add methods to set all properties when loading
    public void setAllShapes(Map<Integer, String> shapes) {
        this.selectionShapes = new HashMap<>(shapes);
    }

    public void setAllBorderStyles(Map<Integer, String> styles) {
        this.selectionBorderStyles = new HashMap<>(styles);
    }

    public void setAllBorderColors(Map<Integer, String> colors) {
        this.selectionBorderColors = new HashMap<>(colors);
    }

    public void setAllPillStyles(Map<Integer, String> styles) {
        this.selectionPillStyles = new HashMap<>(styles);
    }

    public void setAllPillPositions(Map<Integer, Integer> positions) {
        this.pillPositions = new HashMap<>(positions);
    }

    public List<Rectangle> getSelections() {
        return shapes.stream()
            .map(SelectionShape::getBounds)
            .collect(Collectors.toList());
    }

    private Color getColorFromName(String colorName) {
        switch (colorName) {
            case "Blue":
                return new Color(0, 122, 255);
            case "Green":
                return new Color(52, 199, 89);
            case "Purple":
                return new Color(175, 82, 222);
            case "Orange":
                return new Color(255, 149, 0);
            case "Teal":
                return new Color(90, 200, 250);
            default: // Red
                return new Color(255, 59, 48);
        }
    }

    private void drawDiamond(Graphics2D g2d, Rectangle rect, boolean isShadow) {
        int[] xPoints = {
            rect.x + rect.width/2,
            rect.x + rect.width,
            rect.x + rect.width/2,
            rect.x
        };
        int[] yPoints = {
            rect.y,
            rect.y + rect.height/2,
            rect.y + rect.height,
            rect.y + rect.height/2
        };
        if (isShadow) {
            for (int i = 0; i < xPoints.length; i++) {
                xPoints[i] += SHADOW_OFFSET;
                yPoints[i] += SHADOW_OFFSET;
            }
        }
        g2d.fillPolygon(xPoints, yPoints, DIAMOND_POINTS);
        if (!isShadow) {
            g2d.drawPolygon(xPoints, yPoints, DIAMOND_POINTS);
        }
    }

    private void drawStar(Graphics2D g2d, Rectangle rect, boolean isShadow) {
        int centerX = rect.x + rect.width/2;
        int centerY = rect.y + rect.height/2;
        int outerRadius = Math.min(rect.width, rect.height)/2;
        int innerRadius = outerRadius/2;
        
        if (isShadow) {
            centerX += SHADOW_OFFSET;
            centerY += SHADOW_OFFSET;
        }

        int[] xPoints = new int[STAR_POINTS * 2];
        int[] yPoints = new int[STAR_POINTS * 2];

        for (int i = 0; i < STAR_POINTS * 2; i++) {
            double angle = Math.PI * i / STAR_POINTS;
            int radius = (i % 2 == 0) ? outerRadius : innerRadius;
            xPoints[i] = centerX + (int)(radius * Math.sin(angle));
            yPoints[i] = centerY - (int)(radius * Math.cos(angle));
        }

        g2d.fillPolygon(xPoints, yPoints, STAR_POINTS * 2);
        if (!isShadow) {
            g2d.drawPolygon(xPoints, yPoints, STAR_POINTS * 2);
        }
    }

    private void drawPolygon(Graphics2D g2d, Rectangle rect, int sides, boolean isShadow) {
        int centerX = rect.x + rect.width/2;
        int centerY = rect.y + rect.height/2;
        int radius = Math.min(rect.width, rect.height)/2;
        
        if (isShadow) {
            centerX += SHADOW_OFFSET;
            centerY += SHADOW_OFFSET;
        }

        int[] xPoints = new int[sides];
        int[] yPoints = new int[sides];

        for (int i = 0; i < sides; i++) {
            double angle = 2 * Math.PI * i / sides;
            xPoints[i] = centerX + (int)(radius * Math.cos(angle));
            yPoints[i] = centerY + (int)(radius * Math.sin(angle));
        }

        g2d.fillPolygon(xPoints, yPoints, sides);
        if (!isShadow) {
            g2d.drawPolygon(xPoints, yPoints, sides);
        }
    }

    public List<SelectionShape> getShapes() {
        return new ArrayList<>(shapes);
    }

    public void setShapeSelectedListener(Consumer<SelectionShape> listener) {
        this.shapeSelectedListener = listener;
    }

    public void setSelectedShapeIndex(int index) {
        this.selectedShapeIndex = index;
        if (index >= 0 && index < shapes.size() && shapeSelectedListener != null) {
            shapeSelectedListener.accept(shapes.get(index));
        }
        repaint();
    }
}