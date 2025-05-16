# Electron Screenshot App

A powerful screenshot application built with Electron that allows you to capture, edit, and annotate screenshots with various shapes and styles.

## Features

- Take screenshots of the entire screen or selected areas
- Draw various shapes (rectangles, circles, arrows, etc.)
- Customize shapes with different border styles and colors
- Add blur effects to selected areas
- Save screenshots in different formats
- Copy selections to clipboard
- Undo/redo functionality
- Modern and intuitive user interface

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd electron-screenshot-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Development

To run the application in development mode with hot reloading:

```bash
npm run dev
```

## Building

To build the application for your platform:

```bash
npm run build
```

## Usage

### Taking Screenshots

- Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (macOS) to take a screenshot
- Click and drag to select an area
- Use the toolbar buttons to customize your selection

### Drawing Shapes

1. Select a shape from the toolbar
2. Click and drag on the canvas to draw
3. Use the style panel to customize:
   - Border style (solid, dashed, dotted)
   - Color
   - Pill style (modern, classic)
   - Blur radius

### Editing

- Click on a shape to select it
- Drag to move selected shapes
- Use the toolbar buttons to:
  - Delete selected shape
  - Copy selected shape
  - Undo last action
  - Clear all shapes

### Saving

- Click the save button to save the entire screenshot
- Use "Save Selected" to save only the selected areas
- Images are saved in PNG format by default

## Keyboard Shortcuts

- `Ctrl+Shift+S` / `Cmd+Shift+S`: Take screenshot
- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+C` / `Cmd+C`: Copy selected
- `Delete`: Delete selected shape
- `Esc`: Cancel screenshot

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 