package org.sstec.resourceserver;

import java.awt.Rectangle;

public class SelectionShape {
    private Rectangle bounds;
    private String shape;
    private String borderStyle;
    private String borderColor;
    private String pillStyle;
    private int pillPosition;

    public SelectionShape(Rectangle bounds, String shape, String borderStyle, 
                         String borderColor, String pillStyle, int pillPosition) {
        this.bounds = bounds;
        this.shape = shape;
        this.borderStyle = borderStyle;
        this.borderColor = borderColor;
        this.pillStyle = pillStyle;
        this.pillPosition = pillPosition;
    }

    // Getters
    public Rectangle getBounds() { return bounds; }
    public String getShape() { return shape; }
    public String getBorderStyle() { return borderStyle; }
    public String getBorderColor() { return borderColor; }
    public String getPillStyle() { return pillStyle; }
    public int getPillPosition() { return pillPosition; }

    // Setters
    public void setBounds(Rectangle bounds) { this.bounds = bounds; }
    public void setShape(String shape) { this.shape = shape; }
    public void setBorderStyle(String borderStyle) { this.borderStyle = borderStyle; }
    public void setBorderColor(String borderColor) { this.borderColor = borderColor; }
    public void setPillStyle(String pillStyle) { this.pillStyle = pillStyle; }
    public void setPillPosition(int pillPosition) { this.pillPosition = pillPosition; }

    // Create a copy of this shape
    public SelectionShape copy() {
        return new SelectionShape(
            new Rectangle(bounds),
            shape,
            borderStyle,
            borderColor,
            pillStyle,
            pillPosition
        );
    }
} 