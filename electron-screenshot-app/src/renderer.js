const { ipcRenderer } = require('electron');
const { desktopCapturer } = require('electron');
const sharp = require('sharp');

class ScreenshotApp {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.selections = [];
        this.currentSelection = null;
        this.isDrawing = false;
        this.startPoint = null;
        this.selectedShapeIndex = -1;
        this.draggedShapeIndex = -1;
        this.dragOffset = null;
        this.originalImage = null;
        
        // Current styles
        this.currentShape = 'rectangle';
        this.currentBorder = 'solid';
        this.currentColor = 'red';
        this.currentPillStyle = 'modern';
        this.blurRadius = 0;
        
        this.initializeCanvas();
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeCanvas() {
        // Set initial canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Clear canvas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    initializeEventListeners() {
        // Toolbar buttons
        const screenshotBtn = document.getElementById('screenshotBtn');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => this.startScreenshot());
        }

        const openBtn = document.getElementById('openBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openImage());
        }

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveImage());
        }

        const saveSelectedBtn = document.getElementById('saveSelectedBtn');
        if (saveSelectedBtn) {
            saveSelectedBtn.addEventListener('click', () => this.saveSelectedAreas());
        }

        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSelections());
        }

        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoLastSelection());
        }

        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyLastSelection());
        }

        // Style buttons
        document.querySelectorAll('.shape-buttons button').forEach(btn => {
            btn.addEventListener('click', () => this.setShape(btn.dataset.shape));
        });

        document.querySelectorAll('.border-buttons button').forEach(btn => {
            btn.addEventListener('click', () => this.setBorder(btn.dataset.border));
        });

        document.querySelectorAll('.color-buttons button').forEach(btn => {
            btn.addEventListener('click', () => this.setColor(btn.dataset.color));
        });

        document.querySelectorAll('.pill-buttons button').forEach(btn => {
            btn.addEventListener('click', () => this.setPillStyle(btn.dataset.pill));
        });

        // Blur radius
        const blurRadius = document.getElementById('blurRadius');
        if (blurRadius) {
            blurRadius.addEventListener('change', (e) => {
                this.blurRadius = parseInt(e.target.value);
                this.updateCanvas();
            });
        }

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // IPC events
        ipcRenderer.on('screenshot-captured', (event, selection) => {
            this.displayScreenshot(selection);
        });

        ipcRenderer.on('settings-loaded', (event, settings) => {
            if (settings) {
                this.applySettings(settings);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.initializeCanvas();
            this.updateCanvas();
        });
    }

    loadSettings() {
        ipcRenderer.send('load-settings');
    }

    applySettings(settings) {
        this.currentShape = settings.shape || this.currentShape;
        this.currentBorder = settings.border || this.currentBorder;
        this.currentColor = settings.color || this.currentColor;
        this.currentPillStyle = settings.pillStyle || this.currentPillStyle;
        this.blurRadius = settings.blurRadius || this.blurRadius;

        // Update UI
        document.querySelector(`[data-shape="${this.currentShape}"]`).classList.add('active');
        document.querySelector(`[data-border="${this.currentBorder}"]`).classList.add('active');
        document.querySelector(`[data-color="${this.currentColor}"]`).classList.add('active');
        document.querySelector(`[data-pill="${this.currentPillStyle}"]`).classList.add('active');
        document.getElementById('blurRadius').value = this.blurRadius;
    }

    saveSettings() {
        const settings = {
            shape: this.currentShape,
            border: this.currentBorder,
            color: this.currentColor,
            pillStyle: this.currentPillStyle,
            blurRadius: this.blurRadius
        };
        ipcRenderer.send('save-settings', settings);
    }

    setShape(shape) {
        this.currentShape = shape;
        document.querySelectorAll('.shape-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shape === shape);
        });
        this.saveSettings();
    }

    setBorder(border) {
        this.currentBorder = border;
        document.querySelectorAll('.border-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.border === border);
        });
        this.saveSettings();
    }

    setColor(color) {
        this.currentColor = color;
        document.querySelectorAll('.color-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
        this.saveSettings();
    }

    setPillStyle(style) {
        this.currentPillStyle = style;
        document.querySelectorAll('.pill-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pill === style);
        });
        this.saveSettings();
    }

    loadScreenshot(dataUrl, bounds) {
        const img = new Image();
        img.onload = () => {
            this.canvas.width = bounds.width;
            this.canvas.height = bounds.height;
            this.ctx.drawImage(img, 0, 0);
            this.updateButtonStates();
        };
        img.src = dataUrl;
    }

    openImage() {
        // Implementation for opening image files
    }

    saveImage() {
        // Implementation for saving the entire image
    }

    saveSelectedAreas() {
        // Implementation for saving only selected areas
    }

    clearSelections() {
        this.selections = [];
        this.selectedShapeIndex = -1;
        this.updateCanvas();
        this.updateButtonStates();
    }

    undoLastSelection() {
        if (this.selections.length > 0) {
            this.selections.pop();
            this.selectedShapeIndex = -1;
            this.updateCanvas();
            this.updateButtonStates();
        }
    }

    copyLastSelection() {
        if (this.selections.length > 0) {
            const lastSelection = this.selections[this.selections.length - 1];
            const newSelection = {
                ...lastSelection,
                x: lastSelection.x + 20,
                y: lastSelection.y + 20
            };
            this.selections.push(newSelection);
            this.updateCanvas();
            this.updateButtonStates();
        }
    }

    updateButtonStates() {
        const hasSelections = this.selections.length > 0;
        const hasImage = this.originalImage !== null;
        
        document.getElementById('saveBtn').disabled = !hasImage;
        document.getElementById('saveSelectedBtn').disabled = !hasSelections;
        document.getElementById('clearBtn').disabled = !hasSelections;
        document.getElementById('undoBtn').disabled = !hasSelections;
        document.getElementById('copyBtn').disabled = !hasSelections;
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a selection
        for (let i = this.selections.length - 1; i >= 0; i--) {
            const selection = this.selections[i];
            if (this.isPointInSelection(x, y, selection)) {
                this.selectedShapeIndex = i;
                this.draggedShapeIndex = i;
                this.dragOffset = {
                    x: x - selection.x,
                    y: y - selection.y
                };
                this.updateCanvas();
                return;
            }
        }

        // Start new selection
        this.selectedShapeIndex = -1;
        this.isDrawing = true;
        this.startPoint = { x, y };
        this.currentSelection = {
            x,
            y,
            width: 0,
            height: 0,
            shape: this.currentShape,
            border: this.currentBorder,
            color: this.currentColor,
            pillStyle: this.currentPillStyle
        };
    }

    handleMouseMove(e) {
        if (this.isDrawing && this.startPoint) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.currentSelection.x = Math.min(this.startPoint.x, x);
            this.currentSelection.y = Math.min(this.startPoint.y, y);
            this.currentSelection.width = Math.abs(x - this.startPoint.x);
            this.currentSelection.height = Math.abs(y - this.startPoint.y);

            this.updateCanvas();
        } else if (this.draggedShapeIndex !== -1 && this.dragOffset) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const selection = this.selections[this.draggedShapeIndex];
            selection.x = x - this.dragOffset.x;
            selection.y = y - this.dragOffset.y;

            this.updateCanvas();
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing && this.currentSelection) {
            if (this.currentSelection.width > 10 && this.currentSelection.height > 10) {
                this.selections.push(this.currentSelection);
                this.updateButtonStates();
            }
        }

        this.isDrawing = false;
        this.draggedShapeIndex = -1;
        this.dragOffset = null;
        this.currentSelection = null;
        this.updateCanvas();
    }

    isPointInSelection(x, y, selection) {
        return x >= selection.x && x <= selection.x + selection.width &&
               y >= selection.y && y <= selection.y + selection.height;
    }

    updateCanvas() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw original image
        // ... (implementation depends on how you're storing the original image)

        // Draw selections
        this.selections.forEach((selection, index) => {
            this.drawSelection(selection, index === this.selectedShapeIndex);
        });

        // Draw current selection if drawing
        if (this.isDrawing && this.currentSelection) {
            this.drawSelection(this.currentSelection, false);
        }
    }

    drawSelection(selection, isSelected) {
        // Implementation for drawing different shapes with styles
        // This will be a complex method handling all the different shapes and styles
    }

    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    async startScreenshot() {
        try {
            // Hide the main window
            ipcRenderer.send('start-screenshot');

            // Capture the screen
            const sources = await desktopCapturer.getSources({
                types: ['screen'],
                thumbnailSize: { width: 0, height: 0 }
            });

            if (sources.length > 0) {
                const source = sources[0];
                const image = source.thumbnail.toDataURL();
                const { width, height } = source.thumbnail.getSize();

                // Send the screenshot data to the selection window
                ipcRenderer.send('screenshot-data', {
                    image,
                    bounds: { x: 0, y: 0, width, height },
                    scaleFactor: source.display_id ? source.display_id : 1
                });
            } else {
                this.showNotification('No screen source found', true);
            }
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            this.showNotification('Failed to capture screenshot', true);
        }
    }

    displayScreenshot(selection) {
        console.log('Displaying screenshot:', selection);
        if (!selection || !selection.image) {
            console.error('Invalid screenshot data:', selection);
            this.showNotification('Invalid screenshot data', true);
            return;
        }

        try {
            // Create a new image from the captured data
            const img = new Image();
            
            img.onload = () => {
                console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
                
                // Update main canvas size to match the image
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                
                // Draw the image directly on the main canvas
                this.ctx.drawImage(img, 0, 0);

                // Store the original image
                this.originalImage = img;

                // Update UI
                this.updateButtonStates();
                this.showNotification('Screenshot captured successfully');
            };

            img.onerror = (error) => {
                console.error('Failed to load image:', error);
                this.showNotification('Failed to load screenshot', true);
            };

            console.log('Setting image source');
            img.src = selection.image;
        } catch (error) {
            console.error('Failed to display screenshot:', error);
            this.showNotification('Failed to display screenshot', true);
        }
    }
}

// Initialize the app
const app = new ScreenshotApp(); 