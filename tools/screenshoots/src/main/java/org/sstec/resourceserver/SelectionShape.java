package org.sstec.resourceserver;

import java.awt.Rectangle;

public class SelectionShape {
    private Rectangle bounds;
    private String shape;
    private String borderStyle;
    private String borderColor;
    private String pillStyle;
    private int pillPosition;
    private double pillSize;

    public SelectionShape(Rectangle bounds, String shape, String borderStyle, 
                         String borderColor, String pillStyle, int pillPosition) {
        this.bounds = bounds;
        this.shape = shape;
        this.borderStyle = borderStyle;
        this.borderColor = borderColor;
        this.pillStyle = pillStyle;
        this.pillPosition = pillPosition;
        this.pillSize = 0.10; // Default pill size ratio
    }

    // Getters
    public Rectangle getBounds() { return bounds; }
    public String getShape() { return shape; }
    public String getBorderStyle() { return borderStyle; }
    public String getBorderColor() { return borderColor; }
    public String getPillStyle() { return pillStyle; }
    public int getPillPosition() { return pillPosition; }
    public double getPillSize() { return pillSize; }

    // Setters
    public void setBounds(Rectangle bounds) { this.bounds = bounds; }
    public void setShape(String shape) { this.shape = shape; }
    public void setBorderStyle(String borderStyle) { this.borderStyle = borderStyle; }
    public void setBorderColor(String borderColor) { this.borderColor = borderColor; }
    public void setPillStyle(String pillStyle) { this.pillStyle = pillStyle; }
    public void setPillPosition(int pillPosition) { this.pillPosition = pillPosition; }
    public void setPillSize(double pillSize) { this.pillSize = pillSize; }

    // Create a copy of this shape
    public SelectionShape copy() {
        SelectionShape copy = new SelectionShape(
            new Rectangle(bounds),
            shape,
            borderStyle,
            borderColor,
            pillStyle,
            pillPosition
        );
        copy.setPillSize(pillSize);
        return copy;
    }
} 