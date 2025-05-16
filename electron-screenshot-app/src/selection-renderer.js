const { ipcRenderer } = require('electron');

class SelectionWindow {
    constructor() {
        this.canvas = document.getElementById('selectionCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.startPoint = null;
        this.currentSelection = null;
        this.originalImage = null;
        this.bounds = null;
        this.scaleFactor = 1;

        // Set canvas size to match window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.initializeEventListeners();
        this.initializeKeyboardShortcuts();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.originalImage) {
            this.updateCanvas();
        }
    }

    initializeEventListeners() {
        try {
            // Canvas events
            this.canvas.addEventListener('mousedown', (e) => {
                console.log('Mouse down event:', e);
                this.handleMouseDown(e);
            });
            this.canvas.addEventListener('mousemove', (e) => {
                if (this.isDrawing) {
                    console.log('Mouse move event:', e);
                    this.handleMouseMove(e);
                }
            });
            this.canvas.addEventListener('mouseup', (e) => {
                console.log('Mouse up event:', e);
                this.handleMouseUp(e);
            });

            // Control panel buttons
            const captureBtn = document.getElementById('captureBtn');
            const newSelectionBtn = document.getElementById('newSelectionBtn');
            const cancelBtn = document.getElementById('cancelBtn');

            if (!captureBtn || !newSelectionBtn || !cancelBtn) {
                console.error('Control panel buttons not found!');
                return;
            }

            captureBtn.addEventListener('click', () => {
                console.log('Capture button clicked');
                this.captureSelection();
            });
            newSelectionBtn.addEventListener('click', () => {
                console.log('New selection button clicked');
                this.resetSelection();
            });
            cancelBtn.addEventListener('click', () => {
                console.log('Cancel button clicked');
                this.cancelSelection();
            });

            // IPC events
            ipcRenderer.on('screenshot-data', (event, data) => {
                console.log('Received screenshot data:', data);
                if (!data || !data.image) {
                    console.error('Invalid screenshot data received');
                    return;
                }
                this.loadScreenshot(data.image, data.bounds, data.scaleFactor);
            });
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Return') {
                this.captureSelection();
            } else if (e.key === 'Escape') {
                this.cancelSelection();
            }
        });
    }

    loadScreenshot(dataUrl, bounds, scaleFactor) {
        console.log('Loading screenshot with bounds:', bounds);
        if (!dataUrl) {
            console.error('No image data provided');
            return;
        }

        this.bounds = bounds;
        this.scaleFactor = scaleFactor;
        
        // Create a new image and wait for it to load
        const img = new Image();
        
        img.onload = () => {
            console.log('Original image loaded successfully');
            console.log('Image dimensions:', img.width, 'x', img.height);
            
            // Store the loaded image
            this.originalImage = img;
            
            // Set canvas size to match image size
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            
            // Draw the image
            this.ctx.drawImage(img, 0, 0);
            
            // Draw initial overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            console.log('Canvas initialized with image');
        };

        img.onerror = (error) => {
            console.error('Error loading image:', error);
        };

        console.log('Setting image source');
        img.src = dataUrl;
    }

    handleMouseDown(e) {
        console.log('Handling mouse down');
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        console.log('Mouse position:', x, y);
        console.log('Canvas bounds:', rect);

        this.isDrawing = true;
        this.startPoint = { x, y };
        this.currentSelection = {
            x,
            y,
            width: 0,
            height: 0
        };
        console.log('Started selection at:', this.startPoint);
    }

    handleMouseMove(e) {
        if (!this.isDrawing || !this.startPoint) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.currentSelection.x = Math.min(this.startPoint.x, x);
        this.currentSelection.y = Math.min(this.startPoint.y, y);
        this.currentSelection.width = Math.abs(x - this.startPoint.x);
        this.currentSelection.height = Math.abs(y - this.startPoint.y);

        console.log('Current selection:', this.currentSelection);
        this.updateCanvas();
    }

    handleMouseUp(e) {
        console.log('Handling mouse up');
        if (this.isDrawing && this.currentSelection) {
            if (this.currentSelection.width > 10 && this.currentSelection.height > 10) {
                console.log('Selection completed:', this.currentSelection);
                this.updateCanvas();
            } else {
                console.log('Selection too small, resetting');
                this.resetSelection();
            }
        }
        this.isDrawing = false;
    }

    updateCanvas() {
        try {
            if (!this.originalImage) {
                console.error('No original image available for update');
                return;
            }

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw original image
            this.ctx.drawImage(this.originalImage, 0, 0);

            // Draw semi-transparent overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw selection
            if (this.currentSelection) {
                // Clear the selection area
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

                // Draw size info
                const sizeText = `${Math.round(this.currentSelection.width)} x ${Math.round(this.currentSelection.height)}`;
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = '14px Arial';
                this.ctx.fillText(sizeText, this.currentSelection.x, this.currentSelection.y - 5);
            }
        } catch (error) {
            console.error('Error updating canvas:', error);
        }
    }

    captureSelection() {
        console.log('Capturing selection');
        console.log('Current selection:', this.currentSelection);
        console.log('Original image:', this.originalImage);

        if (!this.currentSelection) {
            console.error('No selection available');
            return;
        }

        if (!this.originalImage) {
            console.error('No original image available');
            return;
        }

        const selection = {
            x: Math.round(this.currentSelection.x * this.scaleFactor),
            y: Math.round(this.currentSelection.y * this.scaleFactor),
            width: Math.round(this.currentSelection.width * this.scaleFactor),
            height: Math.round(this.currentSelection.height * this.scaleFactor),
            image: this.originalImage.src
        };

        console.log('Sending selection:', selection);
        ipcRenderer.send('capture-screen', selection);
    }

    resetSelection() {
        console.log('Resetting selection');
        this.currentSelection = null;
        this.updateCanvas();
    }

    cancelSelection() {
        console.log('Canceling selection');
        ipcRenderer.send('cancel-screenshot');
    }
}

// Initialize the selection window
const selectionWindow = new SelectionWindow(); 