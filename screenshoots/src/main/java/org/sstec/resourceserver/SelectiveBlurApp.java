package org.sstec.resourceserver;

// SelectiveBlurApp.java
import javax.swing.*;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.awt.geom.Area;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import javax.swing.filechooser.FileNameExtensionFilter;

public class SelectiveBlurApp extends JFrame {

    private ImagePanel imagePanel;
    private JButton openButton, saveButton, clearButton;
    private JButton saveSelectedOnlyButton;
    private JButton screenshotButton;
    private JButton undoButton;
    private JButton copyButton;
    private JButton deleteButton;
    private JComboBox<String> shapeSelector;
    private JComboBox<String> borderStyleSelector;
    private JComboBox<String> borderColorSelector;
    private JComboBox<String> pillStyleSelector;
    private JComboBox<String> blurRadiusSelector;
    private JLabel blurRadiusLabel;
    private BufferedImage zoomIcon; // Add this field
    private JWindow selectionWindow; // Add window for selection overlay
    private Rectangle selectedScreenArea; // Store selected screen area
    private Point selectionStartPoint; // Store selection start point
    private boolean isSelectingArea = false; // Flag for selection mode
    private String currentShape = "Rounded Rectangle"; // Default shape
    private String currentBorderStyle = "Dashed";
    private String currentBorderColor = "Red";
    private String currentPillStyle = "Modern";

    private BufferedImage originalImage;
    private BufferedImage fullyBlurredImageCache; // Cache for current blur radius
    private BufferedImage processedImage;
    private List<Rectangle> selections = new ArrayList<>();
    private int blurRadius = 23;
    private boolean blurRadiusChangedSinceLastFullBlur = true; // Flag

    private Timer blurUpdateTimer; // For debouncing slider updates
    private final BasicStroke SELECTION_BORDER_STROKE = new BasicStroke(2f); // Border thickness

    private Rectangle lastSelectionRect = null; // Add this field to remember last selection

    public SelectiveBlurApp() {
        setTitle("Selective Blur Tool");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        // Initialize components
        initComponents();
        
        // Setup layout
        layoutComponents();
        
        // Add listeners
        addListeners();
        
        // Setup selection window
        setupSelectionWindow();
        
        // Initialize blur update timer
        blurUpdateTimer = new Timer(100, e -> {
            if (originalImage != null) {
                blurRadiusChangedSinceLastFullBlur = true;
                updateProcessedImage();
            }
        });
        blurUpdateTimer.setRepeats(false);
        
        // Load zoom icon
        loadZoomIcon();
        
        // Set initial window size and position
        setSize(800, 600);
        setMinimumSize(new Dimension(800, 600));
        setLocationRelativeTo(null);
    }

    private void initComponents() {
        imagePanel = new ImagePanel();
        
        // Create buttons with icons
        openButton = createIconButton("open", "Open Image", 32, 32);
        saveButton = createIconButton("save", "Save Image", 32, 32);
        saveSelectedOnlyButton = createIconButton("save-selected", "Save Selected Areas", 32, 32);
        clearButton = createIconButton("clear", "Clear Selections", 32, 32);
        screenshotButton = createIconButton("screenshot", "Take Screenshot", 32, 32);
        undoButton = createIconButton("undo", "Undo Last Selection", 32, 32);
        copyButton = createIconButton("copy", "Copy Last Selection", 32, 32);
        deleteButton = createIconButton("delete", "Delete Selected Shape", 32, 32);
        
        // Create shape selector with more options
        String[] shapes = {
            "Rectangle", 
            "Ellipse", 
            "Rounded Rectangle",
            "Diamond",
            "Star",
            "Hexagon",
            "Octagon"
        };
        shapeSelector = new JComboBox<>(shapes);
        shapeSelector.setPreferredSize(new Dimension(120, 28));
        shapeSelector.setSelectedItem("Rounded Rectangle");
        shapeSelector.addActionListener(e -> {
            currentShape = (String) shapeSelector.getSelectedItem();
            imagePanel.setCurrentShape(currentShape);
        });

        // Create border style selector
        String[] borderStyles = {
            "Solid",
            "Dashed",
            "Dotted",
            "Double",
            "Groove",
            "Ridge"
        };
        borderStyleSelector = new JComboBox<>(borderStyles);
        borderStyleSelector.setPreferredSize(new Dimension(100, 28));
        borderStyleSelector.setSelectedItem("Dashed");
        borderStyleSelector.addActionListener(e -> {
            currentBorderStyle = (String) borderStyleSelector.getSelectedItem();
            imagePanel.setBorderStyle(currentBorderStyle);
        });

        // Create border color selector
        String[] borderColors = {
            "Red",
            "Blue",
            "Green",
            "Purple",
            "Orange",
            "Teal"
        };
        borderColorSelector = new JComboBox<>(borderColors);
        borderColorSelector.setPreferredSize(new Dimension(80, 28));
        borderColorSelector.setSelectedItem("Red");
        borderColorSelector.addActionListener(e -> {
            currentBorderColor = (String) borderColorSelector.getSelectedItem();
            imagePanel.setBorderColor(currentBorderColor);
        });

        // Create pill style selector
        String[] pillStyles = {
            "Modern",
            "Classic",
            "Minimal",
            "Bold",
            "Outline"
        };
        pillStyleSelector = new JComboBox<>(pillStyles);
        pillStyleSelector.setPreferredSize(new Dimension(100, 28));
        pillStyleSelector.setSelectedItem("Modern");
        pillStyleSelector.addActionListener(e -> {
            currentPillStyle = (String) pillStyleSelector.getSelectedItem();
            imagePanel.setPillStyle(currentPillStyle);
        });
        
        // Create blur radius selector
        String[] blurValues = {"0", "5", "10", "15", "20", "25", "30", "35", "40", "45", "50"};
        blurRadiusSelector = new JComboBox<>(blurValues);
        blurRadiusSelector.setPreferredSize(new Dimension(60, 28));
        blurRadiusSelector.setSelectedItem("23");
        blurRadiusSelector.addActionListener(e -> {
            blurRadius = Integer.parseInt((String) blurRadiusSelector.getSelectedItem());
            blurRadiusChangedSinceLastFullBlur = true;
            if (originalImage != null) {
                if (blurUpdateTimer.isRunning()) {
                    blurUpdateTimer.restart();
                } else {
                    blurUpdateTimer.start();
                }
            }
        });
        
        // Add delete button action
        deleteButton.addActionListener(e -> {
            imagePanel.deleteSelectedShape();
            updateProcessedImage();
            updateButtonStates();
        });

        // Set initial states
        saveButton.setEnabled(false);
        saveSelectedOnlyButton.setEnabled(false);
        clearButton.setEnabled(false);
        screenshotButton.setEnabled(true);
        blurRadiusSelector.setEnabled(false);
        undoButton.setEnabled(false);
        copyButton.setEnabled(false);
        deleteButton.setEnabled(false);
    }

    private void layoutComponents() {
        // Create control panel with WrapLayout
        JPanel controlPanel = new JPanel(new WrapLayout(FlowLayout.LEFT, 8, 8));
        controlPanel.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        controlPanel.setBackground(new Color(245, 245, 245));
        
        // Add controls to panel
        controlPanel.add(openButton);
        controlPanel.add(screenshotButton);
        controlPanel.add(saveButton);
        controlPanel.add(saveSelectedOnlyButton);
        controlPanel.add(clearButton);
        controlPanel.add(undoButton);
        controlPanel.add(copyButton);
        controlPanel.add(deleteButton);
        controlPanel.add(new JSeparator(SwingConstants.VERTICAL));
        
        // Create a panel for shape controls
        JPanel shapePanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        shapePanel.setOpaque(false);
        shapePanel.add(new JLabel("Shape:"));
        shapePanel.add(shapeSelector);
        controlPanel.add(shapePanel);
        
        // Create a panel for border controls
        JPanel borderPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        borderPanel.setOpaque(false);
        borderPanel.add(new JLabel("Border:"));
        borderPanel.add(borderStyleSelector);
        borderPanel.add(borderColorSelector);
        controlPanel.add(borderPanel);
        
        // Create a panel for pill controls
        JPanel pillPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        pillPanel.setOpaque(false);
        pillPanel.add(new JLabel("Pill:"));
        pillPanel.add(pillStyleSelector);
        controlPanel.add(pillPanel);
        
        // Create a panel for blur controls
        JPanel blurPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        blurPanel.setOpaque(false);
        blurPanel.add(new JLabel("Blur:"));
        blurPanel.add(blurRadiusSelector);
        controlPanel.add(blurPanel);

        // Create scroll pane for image panel
        JScrollPane scrollPane = new JScrollPane(imagePanel);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setBorder(null);
        scrollPane.setPreferredSize(new Dimension(800, 500));

        // Set layout and add components
        setLayout(new BorderLayout());
        add(controlPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
    }

    private void addListeners() {
        openButton.addActionListener(e -> openImage());
        saveButton.addActionListener(e -> saveBlurredImageAction());
        saveSelectedOnlyButton.addActionListener(e -> saveSelectedAreasOnlyAction());
        screenshotButton.addActionListener(e -> takeScreenshot());
        clearButton.addActionListener(e -> {
            if (originalImage == null) return;
            selections.clear();
            imagePanel.setSelectionsForDrawingFeedback(selections);
            updateProcessedImage();
            updateButtonStates();
        });

        undoButton.addActionListener(e -> {
            if (!selections.isEmpty()) {
                selections.remove(selections.size() - 1);
                imagePanel.setSelectionsForDrawingFeedback(selections);
                updateProcessedImage();
                updateButtonStates();
            }
        });

        copyButton.addActionListener(e -> {
            if (!selections.isEmpty()) {
                Rectangle lastRect = selections.get(selections.size() - 1);
                Rectangle newRect = new Rectangle(lastRect);
                newRect.translate(20, 20); // Offset the copy
                selections.add(newRect);
                imagePanel.setSelectionsForDrawingFeedback(selections);
                updateButtonStates();
            }
        });

        imagePanel.setRectangleDrawnListener(rect -> {
            if (originalImage == null) return;
            if (rect.width > 0 && rect.height > 0) {
                selections.add(rect);
                imagePanel.setSelectionsForDrawingFeedback(selections);
                updateProcessedImage();
                updateButtonStates();
            }
        });

        // Add mouse listener for dragging selections
        imagePanel.addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                if (originalImage == null) return;
                Point imagePoint = imagePanel.panelToImageCoordinates(e.getPoint());
                for (int i = selections.size() - 1; i >= 0; i--) {
                    Rectangle rect = selections.get(i);
                    if (rect.contains(imagePoint)) {
                        imagePanel.setDraggedSelection(i, e.getPoint());
                        break;
                    }
                }
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                imagePanel.clearDraggedSelection();
                updateProcessedImage();
            }
        });

        imagePanel.addMouseMotionListener(new MouseMotionAdapter() {
            @Override
            public void mouseDragged(MouseEvent e) {
                if (imagePanel.isDraggingSelection()) {
                    imagePanel.updateDraggedSelection(e.getPoint());
                    updateProcessedImage();
                }
            }
        });
    }

    private void updateButtonStates() {
        boolean hasSelections = !selections.isEmpty();
        saveSelectedOnlyButton.setEnabled(hasSelections);
        clearButton.setEnabled(hasSelections);
        undoButton.setEnabled(hasSelections);
        copyButton.setEnabled(hasSelections);
        deleteButton.setEnabled(hasSelections);
    }

    private void openImage() {
        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Open Image");
        fileChooser.setFileFilter(new FileNameExtensionFilter(
            "Image Files", "jpg", "jpeg", "png", "gif", "bmp"));
        fileChooser.setCurrentDirectory(new File(System.getProperty("user.home"), "Desktop"));

        if (fileChooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            File selectedFile = fileChooser.getSelectedFile();
            try {
                BufferedImage image = ImageIO.read(selectedFile);
                if (image == null) {
                    JOptionPane.showMessageDialog(this, "Could not read image file.",
                        "Error", JOptionPane.ERROR_MESSAGE);
                    return;
                }

                originalImage = image;
                processedImage = new BufferedImage(
                    image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_ARGB);
                processedImage.getGraphics().drawImage(image, 0, 0, null);
                imagePanel.setImage(image);
                imagePanel.setProcessedImageToDisplay(processedImage);
                updateButtonStates();
                repaint();
            } catch (IOException ex) {
                JOptionPane.showMessageDialog(this, "Error opening image: " + ex.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void saveBlurredImageAction() {
        if (processedImage == null) {
            JOptionPane.showMessageDialog(this, "No processed image to save.", "Warning", JOptionPane.WARNING_MESSAGE);
            return;
        }
        saveImage();
    }

    private void saveSelectedAreasOnlyAction() {
        if (originalImage == null) {
            JOptionPane.showMessageDialog(this, "No original image loaded.", "Warning", JOptionPane.WARNING_MESSAGE);
            return;
        }
        if (selections.isEmpty()) {
            JOptionPane.showMessageDialog(this, "No areas selected to save.", "Info", JOptionPane.INFORMATION_MESSAGE);
            return;
        }

        // Create a new image with a white background
        BufferedImage selectedAreasImage = new BufferedImage(
                originalImage.getWidth(),
                originalImage.getHeight(),
                BufferedImage.TYPE_INT_ARGB // Use ARGB for potential transparency if needed later, though filling white
        );
        Graphics2D g2d = selectedAreasImage.createGraphics();

        // Fill background with white
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, selectedAreasImage.getWidth(), selectedAreasImage.getHeight());

        // Draw only the selected portions from the original image
        for (Rectangle rect : selections) {
            Rectangle clippedRect = rect.intersection(new Rectangle(0, 0, originalImage.getWidth(), originalImage.getHeight()));
            if (clippedRect.width > 0 && clippedRect.height > 0) {
                try {
                    BufferedImage portion = originalImage.getSubimage(
                            clippedRect.x,
                            clippedRect.y,
                            clippedRect.width,
                            clippedRect.height
                    );
                    g2d.drawImage(portion, clippedRect.x, clippedRect.y, null);
                } catch (RasterFormatException rfe) {
                    // This can happen if the rectangle, after clipping, is outside the original image bounds
                    // (though the intersection should prevent this for getSubimage).
                    // Or if width/height become zero due to clipping.
                    System.err.println("Error creating subimage for rect: " + clippedRect + " - " + rfe.getMessage());
                }
            }
        }
        g2d.dispose();

        // Save this newly created image
        saveImageToFile(selectedAreasImage, "selected_areas_only.png");
    }

    private void saveImageToFile(BufferedImage imageToSave, String defaultFileName) {
        JFileChooser fileChooser = new JFileChooser();
        
        // Set default directory to user's Desktop
        String userHome = System.getProperty("user.home");
        File desktopDir = new File(userHome, "Desktop");
        if (desktopDir.exists() && desktopDir.isDirectory()) {
            fileChooser.setCurrentDirectory(desktopDir);
        }
        
        fileChooser.setDialogTitle("Save Image As");
        fileChooser.setSelectedFile(new File(defaultFileName));
        javax.swing.filechooser.FileNameExtensionFilter pngFilter = new javax.swing.filechooser.FileNameExtensionFilter("PNG Images (*.png)", "png");
        fileChooser.addChoosableFileFilter(pngFilter);
        fileChooser.setFileFilter(pngFilter);

        if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
            File outputFile = fileChooser.getSelectedFile();
            String filePath = outputFile.getAbsolutePath();
            
            // Ensure the file has .png extension
            if (!filePath.toLowerCase().endsWith(".png")) {
                outputFile = new File(filePath + ".png");
                filePath = outputFile.getAbsolutePath();
            }

            try {
                // Create a new image that includes the pills
                BufferedImage finalImage = new BufferedImage(imageToSave.getWidth(), imageToSave.getHeight(), BufferedImage.TYPE_INT_ARGB);
                Graphics2D g2d = finalImage.createGraphics();
                
                // Draw the processed image
                g2d.drawImage(imageToSave, 0, 0, null);
                
                // Draw pills
                for (int i = 0; i < selections.size(); i++) {
                    Rectangle rect = selections.get(i);
                    int position = imagePanel.getPillPositions().getOrDefault(i, 0);
                    
                    // Calculate pill size
                    int pillWidth = (int)(rect.width * ImagePanel.PILL_SIZE_RATIO);
                    int pillHeight = (int)(rect.height * ImagePanel.PILL_SIZE_RATIO);
                    pillWidth = Math.max(ImagePanel.MIN_PILL_SIZE, Math.min(ImagePanel.MAX_PILL_SIZE, pillWidth));
                    pillHeight = Math.max(ImagePanel.MIN_PILL_SIZE, Math.min(ImagePanel.MAX_PILL_SIZE, pillHeight));
                    
                    // Draw pill
                    String number = String.valueOf(i + 1);
                    Font originalFont = g2d.getFont();
                    int fontSize = (int) (Math.min(pillWidth, pillHeight) * 0.6);
                    g2d.setFont(new Font(originalFont.getName(), Font.BOLD, fontSize));
                    
                    FontMetrics fm = g2d.getFontMetrics();
                    int textWidth = fm.stringWidth(number);
                    pillWidth = Math.max(pillWidth, textWidth + (pillHeight / 4));
                    
                    // Calculate pill position
                    int pillX, pillY;
                    int padding = pillHeight / 4;
                    
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
                    
                    // Draw pill shadow
                    g2d.setColor(new Color(0, 0, 0, 40));
                    g2d.fillRoundRect(pillX + 2, pillY + 2, pillWidth, pillHeight, 
                                    pillHeight / 2, pillHeight / 2);
                    
                    // Draw pill background
                    g2d.setColor(new Color(255, 59, 48, 230));
                    g2d.fillRoundRect(pillX, pillY, pillWidth, pillHeight, 
                                    pillHeight / 2, pillHeight / 2);
                    
                    // Draw pill text
                    g2d.setColor(Color.WHITE);
                    int textX = pillX + (pillWidth - textWidth) / 2;
                    int textY = pillY + (pillHeight + fm.getAscent() - fm.getDescent()) / 2;
                    g2d.drawString(number, textX, textY);
                    
                    // Restore original font
                    g2d.setFont(originalFont);
                }
                
                g2d.dispose();
                
                // Save the final image with pills
                boolean success = ImageIO.write(finalImage, "PNG", outputFile);
                if (success) {
                    JOptionPane.showMessageDialog(this, 
                        "Image saved successfully to:\n" + outputFile.getAbsolutePath(), 
                        "Success", 
                        JOptionPane.INFORMATION_MESSAGE);
                } else {
                    JOptionPane.showMessageDialog(this, 
                        "Failed to save image. ImageIO writer error.", 
                        "Error", 
                        JOptionPane.ERROR_MESSAGE);
                }
            } catch (IOException ex) {
                JOptionPane.showMessageDialog(this, 
                    "Error saving image: " + ex.getMessage(), 
                    "Error", 
                    JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void loadZoomIcon() {
        try {
            // Load SVG from resources
            InputStream svgStream = getClass().getResourceAsStream("/zoom-in.svg");
            if (svgStream == null) {
                System.err.println("Could not find zoom-in.svg in resources");
                return;
            }

            // Create a transcoder input
            TranscoderInput input = new TranscoderInput(svgStream);

            // Create a transcoder output
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            TranscoderOutput output = new TranscoderOutput(outputStream);

            // Create a PNG transcoder
            PNGTranscoder transcoder = new PNGTranscoder();
            transcoder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, 20f);
            transcoder.addTranscodingHint(PNGTranscoder.KEY_HEIGHT, 20f);

            // Transcode the SVG to PNG
            transcoder.transcode(input, output);

            // Convert the PNG data to a BufferedImage
            byte[] pngData = outputStream.toByteArray();
            zoomIcon = ImageIO.read(new java.io.ByteArrayInputStream(pngData));

        } catch (Exception e) {
            System.err.println("Error loading zoom icon: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void updateProcessedImage() {
        if (originalImage == null) {
            processedImage = null;
            imagePanel.setProcessedImageToDisplay(null);
            imagePanel.repaint();
            return;
        }

        if (blurRadiusChangedSinceLastFullBlur || fullyBlurredImageCache == null) {
            GaussianFilter filter = new GaussianFilter(blurRadius);
            fullyBlurredImageCache = new BufferedImage(originalImage.getWidth(), originalImage.getHeight(), BufferedImage.TYPE_INT_ARGB);
            filter.filter(originalImage, fullyBlurredImageCache);
            blurRadiusChangedSinceLastFullBlur = false;
        }

        processedImage = new BufferedImage(originalImage.getWidth(), originalImage.getHeight(), BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2dProcessed = processedImage.createGraphics();
        
        // Enable high-quality rendering
        g2dProcessed.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2dProcessed.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2dProcessed.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);
        
        // Draw the blurred background
        g2dProcessed.drawImage(fullyBlurredImageCache, 0, 0, null);

        if (!selections.isEmpty()) {
            for (int i = 0; i < selections.size(); i++) {
                Rectangle rect = selections.get(i);
                Rectangle clippedRect = rect.intersection(new Rectangle(0, 0, originalImage.getWidth(), originalImage.getHeight()));
                if (clippedRect.width > 0 && clippedRect.height > 0) {
                    // Paste unblurred portion from original image
                    BufferedImage unblurredPortion = originalImage.getSubimage(
                            clippedRect.x, clippedRect.y, clippedRect.width, clippedRect.height
                    );
                    g2dProcessed.drawImage(unblurredPortion, clippedRect.x, clippedRect.y, null);

                    // Draw shadow for elevation effect
                    g2dProcessed.setColor(new Color(0, 0, 0, 30));
                    g2dProcessed.fillRect(clippedRect.x + 3, clippedRect.y + 3, 
                                       clippedRect.width, clippedRect.height);
                    
                    // Draw dashed border
                    Stroke originalStroke = g2dProcessed.getStroke();
                    float[] dash = {5.0f, 5.0f};
                    g2dProcessed.setStroke(new BasicStroke(2.5f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 
                        10.0f, dash, 0.0f));
                    g2dProcessed.setColor(new Color(255, 59, 48)); // Modern red
                    g2dProcessed.drawRect(clippedRect.x, clippedRect.y, 
                                       clippedRect.width, clippedRect.height);
                    g2dProcessed.setStroke(originalStroke);
                }
            }
        }
        g2dProcessed.dispose();

        imagePanel.setProcessedImageToDisplay(processedImage);
    }

    private void setupSelectionWindow() {
        selectionWindow = new JWindow();
        selectionWindow.setAlwaysOnTop(true);
        selectionWindow.setBackground(new Color(0, 0, 0, 0));
        
        JPanel selectionPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2d = (Graphics2D) g.create();
                
                // Enable anti-aliasing
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                
                // Draw selection rectangle if selecting
                if (isSelectingArea && selectedScreenArea != null) {
                    // Draw border
                    g2d.setColor(Color.RED);
                    g2d.setStroke(new BasicStroke(2));
                    g2d.drawRect(selectedScreenArea.x, selectedScreenArea.y, 
                               selectedScreenArea.width, selectedScreenArea.height);
                    
                    // Draw size info
                    String sizeText = selectedScreenArea.width + " x " + selectedScreenArea.height;
                    g2d.setColor(Color.RED);
                    g2d.setFont(new Font("Arial", Font.BOLD, 14));
                    FontMetrics fm = g2d.getFontMetrics();
                    int textX = selectedScreenArea.x + (selectedScreenArea.width - fm.stringWidth(sizeText)) / 2;
                    int textY = selectedScreenArea.y + selectedScreenArea.height + 20;
                    g2d.drawString(sizeText, textX, textY);
                }
                
                g2d.dispose();
            }
        };
        
        // Set crosshair cursor
        selectionPanel.setCursor(Toolkit.getDefaultToolkit().createCustomCursor(
            new BufferedImage(16, 16, BufferedImage.TYPE_INT_ARGB),
            new Point(8, 8),
            "crosshair"
        ));
        
        selectionPanel.addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                selectionStartPoint = e.getPoint();
                selectedScreenArea = new Rectangle(selectionStartPoint.x, selectionStartPoint.y, 0, 0);
                isSelectingArea = true;
                selectionPanel.repaint();
            }
            
            @Override
            public void mouseReleased(MouseEvent e) {
                if (selectedScreenArea != null && selectedScreenArea.width > 10 && selectedScreenArea.height > 10) {
                    takeScreenshot();
                }
                isSelectingArea = false;
                selectionWindow.setVisible(false);
            }
        });
        
        selectionPanel.addMouseMotionListener(new MouseMotionAdapter() {
            @Override
            public void mouseDragged(MouseEvent e) {
                if (isSelectingArea && selectionStartPoint != null) {
                    int x = Math.min(selectionStartPoint.x, e.getX());
                    int y = Math.min(selectionStartPoint.y, e.getY());
                    int width = Math.abs(selectionStartPoint.x - e.getX());
                    int height = Math.abs(selectionStartPoint.y - e.getY());
                    selectedScreenArea.setBounds(x, y, width, height);
                    selectionPanel.repaint();
                }
            }
        });
        
        selectionWindow.add(selectionPanel);
    }

    private void takeScreenshot() {
        try {
            // Hide the main window temporarily
            setVisible(false);
            Thread.sleep(100); // Small delay to ensure window is hidden
            
            // Capture the entire screen first
            Rectangle screenRect = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
            BufferedImage screenImage = new Robot().createScreenCapture(screenRect);
            
            // Create a full-screen window for selection
            JWindow selectionWindow = new JWindow();
            selectionWindow.setAlwaysOnTop(true);
            
            // Create a panel that displays the screenshot and handles selection
            class SelectionPanel extends JPanel {
                private Point startPoint;
                private Rectangle selectionRect;
                private JPanel controlPanel;
                
                public SelectionPanel() {
                    setLayout(null); // Use absolute positioning
                    setCursor(Cursor.getPredefinedCursor(Cursor.CROSSHAIR_CURSOR));
                    
                    // Create control panel
                    controlPanel = new JPanel();
                    controlPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 10, 5));
                    controlPanel.setOpaque(true);
                    controlPanel.setBackground(new Color(0, 0, 0, 180));
                    
                    // Create buttons
                    JButton captureButton = new JButton("Capture (Enter)");
                    JButton newSelectionButton = new JButton("New Selection");
                    JButton cancelButton = new JButton("Cancel (Esc)");
                    
                    // Style buttons
                    for (JButton btn : new JButton[]{captureButton, newSelectionButton, cancelButton}) {
                        btn.setFocusPainted(false);
                        btn.setBackground(new Color(60, 60, 60));
                        btn.setForeground(Color.WHITE);
                        btn.setBorder(BorderFactory.createCompoundBorder(
                            BorderFactory.createLineBorder(new Color(100, 100, 100)),
                            BorderFactory.createEmptyBorder(5, 10, 5, 10)
                        ));
                    }
                    
                    // Add button actions
                    captureButton.addActionListener(e -> {
                        if (selectionRect != null && selectionRect.width > 10 && selectionRect.height > 10) {
                            captureSelectedArea(selectionRect, screenImage, selectionWindow);
                        }
                    });
                    
                    newSelectionButton.addActionListener(e -> {
                        selectionRect = null;
                        startPoint = null;
                        controlPanel.setVisible(false);
                        repaint();
                    });
                    
                    cancelButton.addActionListener(e -> {
                        selectionWindow.dispose();
                        setVisible(true);
                    });
                    
                    // Add buttons to control panel
                    controlPanel.add(captureButton);
                    controlPanel.add(newSelectionButton);
                    controlPanel.add(cancelButton);
                    
                    // Add control panel to selection panel
                    add(controlPanel);
                    
                    // Initialize selection rect with last used position if available
                    if (lastSelectionRect != null) {
                        selectionRect = new Rectangle(lastSelectionRect);
                        startPoint = new Point(selectionRect.x, selectionRect.y);
                        // Position and show control panel
                        updateControlPanelPosition();
                        controlPanel.setVisible(true);
                    } else {
                        controlPanel.setVisible(false);
                    }
                }
                
                private void updateControlPanelPosition() {
                    if (selectionRect != null) {
                        int panelWidth = controlPanel.getPreferredSize().width;
                        int panelHeight = controlPanel.getPreferredSize().height;
                        
                        // Calculate position to center the panel at the bottom of the selection
                        int x = selectionRect.x + (selectionRect.width - panelWidth) / 2;
                        int y = selectionRect.y + selectionRect.height - panelHeight - 10; // 10px padding from bottom
                        
                        // Ensure the panel stays within screen bounds
                        x = Math.max(0, Math.min(x, getWidth() - panelWidth));
                        y = Math.max(0, Math.min(y, getHeight() - panelHeight));
                        
                        controlPanel.setBounds(x, y, panelWidth, panelHeight);
                    }
                }
                
                @Override
                protected void paintComponent(Graphics g) {
                    super.paintComponent(g);
                    Graphics2D g2d = (Graphics2D) g.create();
                    
                    // Draw the screenshot
                    g2d.drawImage(screenImage, 0, 0, null);
                    
                    // Draw semi-transparent overlay
                    g2d.setColor(new Color(0, 0, 0, 100));
                    g2d.fillRect(0, 0, getWidth(), getHeight());
                    
                    // Draw selection rectangle if exists
                    if (selectionRect != null) {
                        // Create a shape for the selection area
                        Area selectionArea = new Area(new Rectangle(0, 0, getWidth(), getHeight()));
                        selectionArea.subtract(new Area(selectionRect));
                        
                        // Draw the overlay everywhere except the selection area
                        g2d.setColor(new Color(0, 0, 0, 100));
                        g2d.fill(selectionArea);
                        
                        // Draw selection border
                        g2d.setColor(Color.RED);
                        g2d.setStroke(new BasicStroke(2));
                        g2d.draw(selectionRect);
                        
                        // Draw size info at the top of the selection
                        String sizeText = selectionRect.width + " x " + selectionRect.height;
                        g2d.setColor(Color.RED);
                        g2d.setFont(new Font("Arial", Font.BOLD, 14));
                        FontMetrics fm = g2d.getFontMetrics();
                        int textX = selectionRect.x + (selectionRect.width - fm.stringWidth(sizeText)) / 2;
                        int textY = selectionRect.y + 20; // 20px from top
                        g2d.drawString(sizeText, textX, textY);
                        
                        // Update control panel position
                        updateControlPanelPosition();
                    }
                    
                    g2d.dispose();
                }
            }
            
            SelectionPanel selectionPanel = new SelectionPanel();
            
            // Add mouse listeners for selection
            selectionPanel.addMouseListener(new MouseAdapter() {
                @Override
                public void mousePressed(MouseEvent e) {
                    SelectionPanel panel = (SelectionPanel)e.getSource();
                    panel.startPoint = e.getPoint();
                    panel.selectionRect = new Rectangle(
                        panel.startPoint.x,
                        panel.startPoint.y,
                        0, 0
                    );
                    panel.controlPanel.setVisible(false);
                    panel.repaint();
                }
                
                @Override
                public void mouseReleased(MouseEvent e) {
                    SelectionPanel panel = (SelectionPanel)e.getSource();
                    if (panel.selectionRect != null && 
                        panel.selectionRect.width > 10 && 
                        panel.selectionRect.height > 10) {
                        panel.controlPanel.setVisible(true);
                        panel.repaint();
                    }
                }
            });
            
            selectionPanel.addMouseMotionListener(new MouseMotionAdapter() {
                @Override
                public void mouseDragged(MouseEvent e) {
                    SelectionPanel panel = (SelectionPanel)e.getSource();
                    if (panel.startPoint != null) {
                        int x = Math.min(panel.startPoint.x, e.getX());
                        int y = Math.min(panel.startPoint.y, e.getY());
                        int width = Math.abs(panel.startPoint.x - e.getX());
                        int height = Math.abs(panel.startPoint.y - e.getY());
                        panel.selectionRect.setBounds(x, y, width, height);
                        panel.repaint();
                    }
                }
            });
            
            // Add keyboard listeners
            KeyStroke escapeKeyStroke = KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0, false);
            KeyStroke enterKeyStroke = KeyStroke.getKeyStroke(KeyEvent.VK_ENTER, 0, false);
            
            Action escapeAction = new AbstractAction() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    selectionWindow.dispose();
                    setVisible(true);
                }
            };
            
            Action enterAction = new AbstractAction() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    SelectionPanel panel = (SelectionPanel)selectionWindow.getContentPane();
                    if (panel.selectionRect != null && 
                        panel.selectionRect.width > 10 && 
                        panel.selectionRect.height > 10) {
                        captureSelectedArea(panel.selectionRect, screenImage, selectionWindow);
                    }
                }
            };
            
            selectionWindow.getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
                .put(escapeKeyStroke, "ESCAPE");
            selectionWindow.getRootPane().getActionMap().put("ESCAPE", escapeAction);
            
            selectionWindow.getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
                .put(enterKeyStroke, "ENTER");
            selectionWindow.getRootPane().getActionMap().put("ENTER", enterAction);
            
            // Set up the selection window
            selectionWindow.setContentPane(selectionPanel);
            selectionWindow.setSize(screenRect.width, screenRect.height);
            selectionWindow.setLocation(0, 0);
            selectionWindow.setVisible(true);
            
        } catch (Exception ex) {
            setVisible(true);
            JOptionPane.showMessageDialog(this, 
                "Error preparing screenshot: " + ex.getMessage(), 
                "Screenshot Error", 
                JOptionPane.ERROR_MESSAGE);
        }
    }

    private void captureSelectedArea(Rectangle selectionRect, BufferedImage screenImage, JWindow selectionWindow) {
        // Remember the selection for next time
        lastSelectionRect = new Rectangle(selectionRect);
        
        // Capture the selected area
        BufferedImage selectedArea = screenImage.getSubimage(
            selectionRect.x,
            selectionRect.y,
            selectionRect.width,
            selectionRect.height
        );
        
        // Close selection window
        selectionWindow.dispose();
        
        // Show main window and process the selected area
        setVisible(true);
        processScreenshot(selectedArea);
    }

    private void processScreenshot(BufferedImage screenshot) {
        if (screenshot != null) {
            // Set blur radius to 0 for screenshots
            blurRadius = 0;
            blurRadiusSelector.setSelectedItem("0");
            blurRadiusChangedSinceLastFullBlur = true;
            fullyBlurredImageCache = null;
            
            // Load the screenshot into the application
            originalImage = screenshot;
            selections.clear();
            imagePanel.setImage(originalImage);
            imagePanel.setSelectionsForDrawingFeedback(selections);
            updateProcessedImage();
            
            // Enable controls
            saveButton.setEnabled(true);
            clearButton.setEnabled(true);
            blurRadiusSelector.setEnabled(true);
            saveSelectedOnlyButton.setEnabled(!selections.isEmpty());
            updateButtonStates();
            
            // Set window size based on image
            Dimension newSize = new Dimension(
                Math.max(800, originalImage.getWidth() + 50),
                Math.max(600, originalImage.getHeight() + 100)
            );
            setSize(newSize);
            setLocationRelativeTo(null);
        }
    }

    private JButton createIconButton(String iconName, String tooltip, int width, int height) {
        JButton button = new JButton();
        button.setToolTipText(tooltip);
        button.setPreferredSize(new Dimension(width, height));
        button.setMinimumSize(new Dimension(width, height));
        button.setMaximumSize(new Dimension(width, height));
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));
        
        try {
            // Load SVG from resources
            InputStream svgStream = getClass().getResourceAsStream("/icons/" + iconName + ".svg");
            if (svgStream == null) {
                System.err.println("Could not find " + iconName + ".svg in resources");
                return button;
            }

            // Create a transcoder input
            TranscoderInput input = new TranscoderInput(svgStream);

            // Create a transcoder output
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            TranscoderOutput output = new TranscoderOutput(outputStream);

            // Create a PNG transcoder
            PNGTranscoder transcoder = new PNGTranscoder();
            transcoder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, (float)width);
            transcoder.addTranscodingHint(PNGTranscoder.KEY_HEIGHT, (float)height);

            // Transcode the SVG to PNG
            transcoder.transcode(input, output);

            // Convert the PNG data to a BufferedImage
            byte[] pngData = outputStream.toByteArray();
            BufferedImage icon = ImageIO.read(new ByteArrayInputStream(pngData));
            
            // Create disabled version of the icon
            BufferedImage disabledIcon = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = disabledIcon.createGraphics();
            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.4f));
            g2d.drawImage(icon, 0, 0, null);
            g2d.dispose();

            // Set the icons
            button.setIcon(new ImageIcon(icon));
            button.setDisabledIcon(new ImageIcon(disabledIcon));
            
            // Add hover effect
            button.addMouseListener(new MouseAdapter() {
                @Override
                public void mouseEntered(MouseEvent e) {
                    if (button.isEnabled()) {
                        button.setBackground(new Color(0, 0, 0, 20));
                        button.setContentAreaFilled(true);
                    }
                }
                
                @Override
                public void mouseExited(MouseEvent e) {
                    button.setContentAreaFilled(false);
                }
            });

        } catch (Exception e) {
            System.err.println("Error loading icon " + iconName + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return button;
    }

    private void saveImage() {
        if (processedImage == null) return;

        JFileChooser fileChooser = new JFileChooser();
        fileChooser.setDialogTitle("Save Image");
        fileChooser.setFileFilter(new FileNameExtensionFilter("PNG Images", "png"));
        fileChooser.setCurrentDirectory(new File(System.getProperty("user.home"), "Desktop"));

        if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
            File selectedFile = fileChooser.getSelectedFile();
            if (!selectedFile.getName().toLowerCase().endsWith(".png")) {
                selectedFile = new File(selectedFile.getAbsolutePath() + ".png");
            }

            try {
                // Create a new image with the same dimensions as the processed image
                BufferedImage finalImage = new BufferedImage(
                    processedImage.getWidth(),
                    processedImage.getHeight(),
                    BufferedImage.TYPE_INT_ARGB
                );
                Graphics2D g2d = finalImage.createGraphics();

                // Set high-quality rendering hints
                g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                // Fill background with white
                g2d.setColor(Color.WHITE);
                g2d.fillRect(0, 0, finalImage.getWidth(), finalImage.getHeight());

                // Draw the processed image
                g2d.drawImage(processedImage, 0, 0, null);

                // Draw all shapes with their specific styles
                List<Rectangle> selections = imagePanel.getSelections();
                for (int i = 0; i < selections.size(); i++) {
                    Rectangle rect = selections.get(i);
                    String shape = imagePanel.getShapeForSelection(i);
                    String borderStyle = imagePanel.getBorderStyleForSelection(i);
                    String borderColor = imagePanel.getBorderColorForSelection(i);
                    String pillStyle = imagePanel.getPillStyleForSelection(i);
                    int pillPosition = imagePanel.getPillPositions().getOrDefault(i, 0);

                    // Draw the shape with its specific style
                    drawShapeWithStyle(g2d, rect, shape, borderStyle, borderColor);
                    drawPillWithStyle(g2d, rect, i, pillPosition, pillStyle);
                }

                g2d.dispose();

                // Save the image
                ImageIO.write(finalImage, "png", selectedFile);

                JOptionPane.showMessageDialog(this, "Image saved successfully!");
            } catch (IOException ex) {
                JOptionPane.showMessageDialog(this, "Error saving image: " + ex.getMessage(),
                    "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    // Helper methods for saving/loading maps
    private <T> String mapToString(Map<Integer, T> map) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<Integer, T> entry : map.entrySet()) {
            if (sb.length() > 0) sb.append(",");
            sb.append(entry.getKey()).append(":").append(entry.getValue());
        }
        return sb.toString();
    }

    private Map<Integer, String> stringToMap(String str) {
        Map<Integer, String> map = new HashMap<>();
        if (str == null || str.isEmpty()) return map;
        
        String[] entries = str.split(",");
        for (String entry : entries) {
            String[] parts = entry.split(":");
            if (parts.length == 2) {
                try {
                    map.put(Integer.parseInt(parts[0]), parts[1]);
                } catch (NumberFormatException e) {
                    // Skip invalid entries
                }
            }
        }
        return map;
    }

    private Map<Integer, Integer> stringToIntMap(String str) {
        Map<Integer, Integer> map = new HashMap<>();
        if (str == null || str.isEmpty()) return map;
        
        String[] entries = str.split(",");
        for (String entry : entries) {
            String[] parts = entry.split(":");
            if (parts.length == 2) {
                try {
                    map.put(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
                } catch (NumberFormatException e) {
                    // Skip invalid entries
                }
            }
        }
        return map;
    }

    private void drawShapeWithStyle(Graphics2D g2d, Rectangle rect, String shape, String borderStyle, String borderColor) {
        // Draw shape shadow
        g2d.setColor(new Color(0, 0, 0, 40));
        switch (shape) {
            case "Ellipse":
                g2d.fillOval(rect.x + 2, rect.y + 2, rect.width, rect.height);
                break;
            case "Diamond":
                int[] xPoints = {
                    rect.x + rect.width/2 + 2,
                    rect.x + rect.width + 2,
                    rect.x + rect.width/2 + 2,
                    rect.x + 2
                };
                int[] yPoints = {
                    rect.y + 2,
                    rect.y + rect.height/2 + 2,
                    rect.y + rect.height + 2,
                    rect.y + rect.height/2 + 2
                };
                g2d.fillPolygon(xPoints, yPoints, 4);
                break;
            case "Star":
                int centerX = rect.x + rect.width/2 + 2;
                int centerY = rect.y + rect.height/2 + 2;
                int outerRadius = Math.min(rect.width, rect.height)/2;
                int innerRadius = outerRadius/2;
                int[] starXPoints = new int[10];
                int[] starYPoints = new int[10];
                for (int j = 0; j < 10; j++) {
                    double angle = Math.PI * j / 5;
                    int radius = (j % 2 == 0) ? outerRadius : innerRadius;
                    starXPoints[j] = centerX + (int)(radius * Math.sin(angle));
                    starYPoints[j] = centerY - (int)(radius * Math.cos(angle));
                }
                g2d.fillPolygon(starXPoints, starYPoints, 10);
                break;
            case "Hexagon":
                int[] hexXPoints = new int[6];
                int[] hexYPoints = new int[6];
                for (int j = 0; j < 6; j++) {
                    double angle = 2 * Math.PI * j / 6;
                    int radius = Math.min(rect.width, rect.height)/2;
                    hexXPoints[j] = rect.x + rect.width/2 + 2 + (int)(radius * Math.cos(angle));
                    hexYPoints[j] = rect.y + rect.height/2 + 2 + (int)(radius * Math.sin(angle));
                }
                g2d.fillPolygon(hexXPoints, hexYPoints, 6);
                break;
            case "Octagon":
                int[] octXPoints = new int[8];
                int[] octYPoints = new int[8];
                for (int j = 0; j < 8; j++) {
                    double angle = 2 * Math.PI * j / 8;
                    int radius = Math.min(rect.width, rect.height)/2;
                    octXPoints[j] = rect.x + rect.width/2 + 2 + (int)(radius * Math.cos(angle));
                    octYPoints[j] = rect.y + rect.height/2 + 2 + (int)(radius * Math.sin(angle));
                }
                g2d.fillPolygon(octXPoints, octYPoints, 8);
                break;
            case "Rounded Rectangle":
                g2d.fillRoundRect(rect.x + 2, rect.y + 2, rect.width, rect.height, 20, 20);
                break;
            default: // Rectangle
                g2d.fillRect(rect.x + 2, rect.y + 2, rect.width, rect.height);
        }

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
                        10.0f, new float[]{5.0f, 5.0f}, 0.0f));
                } else {
                    g2d.setStroke(new BasicStroke(2.5f));
                }
        }

        // Set border color
        switch (borderColor) {
            case "Blue":
                g2d.setColor(new Color(0, 122, 255));
                break;
            case "Green":
                g2d.setColor(new Color(52, 199, 89));
                break;
            case "Purple":
                g2d.setColor(new Color(175, 82, 222));
                break;
            case "Orange":
                g2d.setColor(new Color(255, 149, 0));
                break;
            case "Teal":
                g2d.setColor(new Color(90, 200, 250));
                break;
            default: // Red
                g2d.setColor(new Color(255, 59, 48));
        }

        // Draw the shape
        switch (shape) {
            case "Ellipse":
                g2d.drawOval(rect.x, rect.y, rect.width, rect.height);
                break;
            case "Diamond":
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
                g2d.drawPolygon(xPoints, yPoints, 4);
                break;
            case "Star":
                int centerX = rect.x + rect.width/2;
                int centerY = rect.y + rect.height/2;
                int outerRadius = Math.min(rect.width, rect.height)/2;
                int innerRadius = outerRadius/2;
                int[] starXPoints = new int[10];
                int[] starYPoints = new int[10];
                for (int j = 0; j < 10; j++) {
                    double angle = Math.PI * j / 5;
                    int radius = (j % 2 == 0) ? outerRadius : innerRadius;
                    starXPoints[j] = centerX + (int)(radius * Math.sin(angle));
                    starYPoints[j] = centerY - (int)(radius * Math.cos(angle));
                }
                g2d.drawPolygon(starXPoints, starYPoints, 10);
                break;
            case "Hexagon":
                int[] hexXPoints = new int[6];
                int[] hexYPoints = new int[6];
                for (int j = 0; j < 6; j++) {
                    double angle = 2 * Math.PI * j / 6;
                    int radius = Math.min(rect.width, rect.height)/2;
                    hexXPoints[j] = rect.x + rect.width/2 + (int)(radius * Math.cos(angle));
                    hexYPoints[j] = rect.y + rect.height/2 + (int)(radius * Math.sin(angle));
                }
                g2d.drawPolygon(hexXPoints, hexYPoints, 6);
                break;
            case "Octagon":
                int[] octXPoints = new int[8];
                int[] octYPoints = new int[8];
                for (int j = 0; j < 8; j++) {
                    double angle = 2 * Math.PI * j / 8;
                    int radius = Math.min(rect.width, rect.height)/2;
                    octXPoints[j] = rect.x + rect.width/2 + (int)(radius * Math.cos(angle));
                    octYPoints[j] = rect.y + rect.height/2 + (int)(radius * Math.sin(angle));
                }
                g2d.drawPolygon(octXPoints, octYPoints, 8);
                break;
            case "Rounded Rectangle":
                g2d.drawRoundRect(rect.x, rect.y, rect.width, rect.height, 20, 20);
                break;
            default: // Rectangle
                g2d.drawRect(rect.x, rect.y, rect.width, rect.height);
        }

        // Draw additional border effects
        if (borderStyle.equals("Double")) {
            g2d.setStroke(new BasicStroke(1.0f));
            g2d.drawRect(rect.x + 3, rect.y + 3, rect.width - 6, rect.height - 6);
        } else if (borderStyle.equals("Groove")) {
            g2d.setColor(new Color(0, 0, 0, 50));
            g2d.drawRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2);
        } else if (borderStyle.equals("Ridge")) {
            g2d.setColor(new Color(255, 255, 255, 50));
            g2d.drawRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2);
        }
    }

    private void drawPillWithStyle(Graphics2D g2d, Rectangle rect, int index, int position, String pillStyle) {
        // Calculate pill size
        int pillWidth = (int)(rect.width * ImagePanel.PILL_SIZE_RATIO);
        int pillHeight = (int)(rect.height * ImagePanel.PILL_SIZE_RATIO);
        pillWidth = Math.max(ImagePanel.MIN_PILL_SIZE, Math.min(ImagePanel.MAX_PILL_SIZE, pillWidth));
        pillHeight = Math.max(ImagePanel.MIN_PILL_SIZE, Math.min(ImagePanel.MAX_PILL_SIZE, pillHeight));
        
        // Draw pill
        String number = String.valueOf(index + 1);
        Font originalFont = g2d.getFont();
        int fontSize = (int) (Math.min(pillWidth, pillHeight) * 0.6);
        g2d.setFont(new Font(originalFont.getName(), Font.BOLD, fontSize));
        
        FontMetrics fm = g2d.getFontMetrics();
        int textWidth = fm.stringWidth(number);
        pillWidth = Math.max(pillWidth, textWidth + (pillHeight / 4));
        
        // Calculate pill position
        int pillX, pillY;
        int padding = pillHeight / 4;
        
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

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            SelectiveBlurApp app = new SelectiveBlurApp();
            app.setVisible(true);
        });
    }
}