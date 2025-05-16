const { ipcRenderer } = require('electron');

class SelectionWindow {
    constructor() {
        this.canvas = document.getElementById('selectionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.startPoint = null;
        this.currentSelection = null;
        this.originalImage = null;
        this.bounds = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Control panel buttons
        document.getElementById('captureBtn').addEventListener('click', () => this.captureSelection());
        document.getElementById('newSelectionBtn').addEventListener('click', () => this.resetSelection());
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelSelection());

        // IPC events
        ipcRenderer.on('screenshot-data', (event, data) => {
            this.loadScreenshot(data.image, data.bounds);
        });
    }

    loadScreenshot(dataUrl, bounds) {
        this.bounds = bounds;
        this.originalImage = new Image();
        this.originalImage.onload = () => {
            this.canvas.width = bounds.width;
            this.canvas.height = bounds.height;
            this.ctx.drawImage(this.originalImage, 0, 0);
        };
        this.originalImage.src = dataUrl;
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.isDrawing = true;
        this.startPoint = { x, y };
        this.currentSelection = {
            x,
            y,
            width: 0,
            height: 0
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
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing && this.currentSelection) {
            if (this.currentSelection.width > 10 && this.currentSelection.height > 10) {
                this.updateCanvas();
            } else {
                this.resetSelection();
            }
        }
        this.isDrawing = false;
    }

    updateCanvas() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw original image
        if (this.originalImage) {
            this.ctx.drawImage(this.originalImage, 0, 0);
        }

        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw selection
        if (this.currentSelection) {
            this.ctx.clearRect(
                this.currentSelection.x,
                this.currentSelection.y,
                this.currentSelection.width,
                this.currentSelection.height
            );

            // Draw selection border
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.currentSelection.x,
                this.currentSelection.y,
                this.currentSelection.width,
                this.currentSelection.height
            );
        }
    }

    captureSelection() {
        if (this.currentSelection && this.originalImage) {
            const selection = {
                x: this.currentSelection.x,
                y: this.currentSelection.y,
                width: this.currentSelection.width,
                height: this.currentSelection.height
            };

            // Create a temporary canvas to crop the selection
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = selection.width;
            tempCanvas.height = selection.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw the selected portion
            tempCtx.drawImage(
                this.originalImage,
                selection.x,
                selection.y,
                selection.width,
                selection.height,
                0,
                0,
                selection.width,
                selection.height
            );

            // Send the cropped image data back to the main window
            ipcRenderer.send('selection-captured', {
                image: tempCanvas.toDataURL(),
                bounds: {
                    x: selection.x + this.bounds.x,
                    y: selection.y + this.bounds.y,
                    width: selection.width,
                    height: selection.height
                }
            });
        }
    }

    resetSelection() {
        this.currentSelection = null;
        this.updateCanvas();
    }

    cancelSelection() {
        ipcRenderer.send('cancel-screenshot');
    }
}

// Initialize the selection window
const selectionWindow = new SelectionWindow(); 