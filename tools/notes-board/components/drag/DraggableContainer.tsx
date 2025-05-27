import React, { useState, useEffect, useRef } from 'react';
import DraggableItem from './DraggableItem';
import DebugPanel from '../DebugPanel';
import ContextPanel from '../context/ContextPanel';
import TopContextPanel from '../context/TopContextPanel';
import BoxSetItem from '../items/BoxSetItem';
import ContextMenu from '../menu/ContextMenu';
import CommentEditor from '../CommentEditor';
import BoxGridContainer from '../box/BoxGridContainer';
import RectangleItem from "../items/RectangleItem";
import CircleItem from "../items/CircleItem";
import SeparatorItem from '../items/SeparatorItem';
import ArrowItem from '../items/ArrowItem';
import ShikiCodeBlockItem from '../items/ShikiCodeBlockItem';
import CirclesPathItem from '../items/CirclesPathItem';
import TwoPointsPathItem from '../items/TwoPointsPathItem';
import MarkdownEditorItem from '../items/MarkdownEditorItem';
import GridItem from '../items/GridItem';

const STORAGE_KEY = 'draggable-items';
const HISTORY_STORAGE_KEY = 'draggable-items-history';

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

interface DraggableContainerProps {
  className?: string;
}

interface DraggableItem {
  id: string;
  type: 'box' | 'circle' | 'boxSet' | 'boxSetContainer' | 'separator' | 'arrow' | 'codeBlock' | 'circlesPath' | 'twoPointsPath' | 'markdown' | 'grid';
  position: { x: number; y: number };
  size: { width: number; height: number };
  props?: any;
  label?: string;
  comment?: string;
  commentLabel?: string;
  parentId?: string;
  finalPosition?: { x: number; y: number };
  isNew?: boolean;
  isPlaceholder?: boolean;
  rotation?: number;
  attachedTo?: string;
  circlePositions?: Array<{ x: number; y: number }>;
  gridCell?: { gridId: string; row: number; col: number };
  gridItems?: Array<{
    id: string;
    row: number;
    col: number;
    item: DraggableItem;
  }>;
}

interface SelectionArea {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isSelecting: boolean;
}

const DraggableContainer: React.FC<DraggableContainerProps> = ({ className = '' }) => {
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [history, setHistory] = useState<DraggableItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    itemId: string;
  }>({ show: false, x: 0, y: 0, itemId: '' });
  const [copiedItem, setCopiedItem] = useState<DraggableItem | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [codePreviewItemId, setCodePreviewItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [commentEditor, setCommentEditor] = useState<{
    show: boolean;
    itemId: string;
    position: { x: number; y: number };
  }>({ show: false, itemId: '', position: { x: 0, y: 0 } });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const dragStartItems = useRef<DraggableItem[]>([]);
  const [selectionArea, setSelectionArea] = useState<SelectionArea>({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    isSelecting: false
  });
  const selectionAreaRef = useRef<SelectionArea>(selectionArea);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const isSelectingRef = useRef(false);
  const dragStartPositions = useRef<{ [key: string]: { x: number; y: number } }>({});
  const [hoveredGridCell, setHoveredGridCell] = useState<{
    gridId: string;
    cell: { row: number; col: number };
  } | null>(null);
  const [draggingOverGridId, setDraggingOverGridId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Update ref when state changes
  useEffect(() => {
    selectionAreaRef.current = selectionArea;
  }, [selectionArea]);

  // Load scene and history from localStorage on initial mount
  useEffect(() => {
    const savedScene = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    
    
    try {
      if (savedScene) {
        const parsedScene = JSON.parse(savedScene);
        
        // Set items first
        setItems(parsedScene);
        
        // Initialize history with the loaded scene
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setHistory(parsedHistory);
            setHistoryIndex(parsedHistory.length - 1);
          } else {
            const initialHistory = [parsedScene];
            setHistory(initialHistory);
            setHistoryIndex(0);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initialHistory));
          }
        } else {
          const initialHistory = [parsedScene];
          setHistory(initialHistory);
          setHistoryIndex(0);
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initialHistory));
        }
      } else {
        const emptyHistory = [[]];
        setHistory(emptyHistory);
        setHistoryIndex(0);
        setItems([]);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(emptyHistory));
      }
    } catch (error) {
      console.error('Error loading state:', error);
      // Reset to empty state if loading fails
      const emptyHistory = [[]];
      setHistory(emptyHistory);
      setHistoryIndex(0);
      setItems([]);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(emptyHistory));
    }
  }, []); // Empty dependency array to ensure this only runs once on mount


  // Save scene to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else if (items.length === 0 && history.length > 0 && history[historyIndex]?.length === 0) {
      // Only remove from localStorage if we're intentionally in an empty state
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [items, history, historyIndex]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  // Handle scene reset
  const handleClearScene = () => {
    if (window.confirm('Are you sure you want to clear the entire scene? This action cannot be undone.')) {
      setItems([]);
      setSelectedItemIds([]);
      setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
      setCopiedItem(null);
      // Reset history when clearing scene
      setHistory([[]]);
      setHistoryIndex(0);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      if (previousState) {
        // Create a deep copy of the previous state
        const restoredState = JSON.parse(JSON.stringify(previousState));
        
        // Update both states atomically
        setHistoryIndex(newIndex);
        setItems(restoredState);
        
        // Save the restored state to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredState));
      }
    }
  };

  // Add current state to history
  const addToHistory = (newItems: DraggableItem[]) => {
    if (!newItems) {
      return;
    }
    
    // Create a deep copy of the new state
    const stateToAdd = JSON.parse(JSON.stringify(newItems));
    
    
    setHistory(prevHistory => {
      // Remove any future states if we're not at the end of history
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      
      // Add new state
      newHistory.push(stateToAdd);
      
      // Keep only last 50 states to prevent memory issues
      const trimmedHistory = newHistory.slice(-50);
      
      // Update history index
      setHistoryIndex(trimmedHistory.length - 1);
      
      // Save the updated history to localStorage
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
      
      return trimmedHistory;
    });
  };

  // Wrap setItems to automatically add to history
  const setItemsWithHistory = (newItems: DraggableItem[] | ((prev: DraggableItem[]) => DraggableItem[])) => {
    setItems(prevItems => {
      const nextItems = typeof newItems === 'function' ? newItems(prevItems) : newItems;
      
      // Only add to history if there are actual changes
      if (JSON.stringify(nextItems) !== JSON.stringify(prevItems)) {
        addToHistory(nextItems);
      }
      
      return nextItems;
    });
  };

  const handleCopy = (itemId: string) => {
    const itemToCopy = items.find(item => item.id === itemId);
    if (itemToCopy) {
      setCopiedItem(itemToCopy);
    }
  };

  const handlePaste = () => {
    if (!copiedItem) return;

    // Calculate new position with offset from original
    const offset = 20;
    const newPosition = {
      x: copiedItem.position.x + offset,
      y: copiedItem.position.y + offset,
    };

    // Ensure the new position is within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (newPosition.x + copiedItem.size.width > viewportWidth) {
      newPosition.x = viewportWidth - copiedItem.size.width - 20;
    }
    if (newPosition.y + copiedItem.size.height > viewportHeight) {
      newPosition.y = viewportHeight - copiedItem.size.height - 20;
    }

    const newItem: DraggableItem = {
      ...copiedItem,
      id: `${copiedItem.type}-${Date.now()}`,
      position: newPosition,
    };

    setItemsWithHistory(prev => [...prev, newItem]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CMD+Z (Mac) or CTRL+Z (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Check for CMD+C (Mac) or CTRL+C (Windows)
      else if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        if (selectedItemIds.length > 0) {
          selectedItemIds.forEach(id => handleCopy(id));
        }
      }
      // Check for CMD+V (Mac) or CTRL+V (Windows)
      else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
      // Check for CMD+A (Mac) or CTRL+A (Windows)
      else if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const allItemIds = items.map(item => item.id);
        setSelectedItemIds(allItemIds);
      }
      // Add Escape key handler to deselect all items
      else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedItemIds([]);
        setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
      }
      // Add zoom keyboard shortcuts
      else if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 0.1, 2));
      }
      else if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 0.1, 0.5));
      }
      else if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
      // Add rotation keyboard shortcuts
      else if (selectedItemIds.length > 0) {
        const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
        selectedItems.forEach(item => {
          if (item.type === 'arrow') {
            switch (e.key) {
              case 'r':
                if (e.shiftKey) {
                  // Shift + R: Rotate 90° counter-clockwise
                  handleRotateArrow(item.id, -90);
                } else {
                  // R: Rotate 90° clockwise
                  handleRotateArrow(item.id, 90);
                }
                e.preventDefault();
                break;
              case 'e':
                if (e.shiftKey) {
                  // Shift + E: Rotate 45° counter-clockwise
                  handleRotateArrow(item.id, -45);
                } else {
                  // E: Rotate 45° clockwise
                  handleRotateArrow(item.id, 45);
                }
                e.preventDefault();
                break;
            }
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIds, copiedItem, items, historyIndex, history, handleUndo]);

  // Add wheel zoom handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if Ctrl/Cmd is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Prevent default browser zoom
        
        // Calculate zoom delta based on wheel direction
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        
        setZoom(prev => {
          const newZoom = prev + delta;
          // Clamp zoom between 0.5 and 2
          return Math.min(Math.max(newZoom, 0.5), 2);
        });
      }
    };

    // Add wheel event listener to the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []); // Empty dependency array since we only need to set up the listener once

  const handleSelectionStart = (e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    // Don't start selection if clicking on an item
    const target = e.target as HTMLElement;
    if (target.closest('.draggable-item')) {
      return;
    }

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate position relative to the container and account for zoom
    const startX = (e.clientX - containerRect.left) / zoom;
    const startY = (e.clientY - containerRect.top) / zoom;


    isSelectingRef.current = true;
    const newSelectionArea = {
      start: { x: startX, y: startY },
      end: { x: startX, y: startY },
      isSelecting: true
    };
    setSelectionArea(newSelectionArea);
    selectionAreaRef.current = newSelectionArea;
  };

  const handleSelectionMove = (e: MouseEvent) => {
    if (!isSelectingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const endX = (e.clientX - containerRect.left) / zoom;
    const endY = (e.clientY - containerRect.top) / zoom;

    const currentSelection = selectionAreaRef.current;
    const newArea = {
      ...currentSelection,
      end: { x: endX, y: endY }
    };
    
    setSelectionArea(newArea);
    selectionAreaRef.current = newArea;
  };

  const handleSelectionEnd = () => {
    if (!isSelectingRef.current || !containerRef.current) return;

    // Get the current selection area state from the ref
    const currentSelection = selectionAreaRef.current;
    
    // Calculate the selection rectangle using the current state
    const selectionRect = {
      left: Math.min(currentSelection.start.x, currentSelection.end.x),
      right: Math.max(currentSelection.start.x, currentSelection.end.x),
      top: Math.min(currentSelection.start.y, currentSelection.end.y),
      bottom: Math.max(currentSelection.start.y, currentSelection.end.y)
    };

    // Get items directly from localStorage
    const savedScene = localStorage.getItem(STORAGE_KEY);
    const localStorageItems = savedScene ? JSON.parse(savedScene) : [];
    

    // Process the selection using localStorage items
    const selectedIds = localStorageItems
      .filter(item => {
        // Calculate item's rectangle in the same coordinate space
        const itemRect = {
          left: item.position.x,
          right: item.position.x + item.size.width,
          top: item.position.y,
          bottom: item.position.y + item.size.height
        };

        // Check if the item is at least partially within the selection area
        const isInSelection = (
          itemRect.left <= selectionRect.right &&
          itemRect.right >= selectionRect.left &&
          itemRect.top <= selectionRect.bottom &&
          itemRect.bottom >= selectionRect.top
        );


        return isInSelection;
      })
      .map(item => item.id);
    
    
    // Update the selected items immediately
    if (selectedIds.length > 0) {
      setSelectedItemIds(selectedIds);
    }
    
    // Clear the selection state
    const newArea = { ...currentSelection, isSelecting: false };
    setSelectionArea(newArea);
    selectionAreaRef.current = newArea;
    isSelectingRef.current = false;
  };

  // Remove the duplicate useEffect for selection area mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isSelectingRef.current) {
        handleSelectionMove(e);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isSelectingRef.current) {
        // Prevent the click event from firing
        e.preventDefault();
        e.stopPropagation();
        
        // Use setTimeout to ensure the selection is processed before any click events
        setTimeout(() => {
          handleSelectionEnd();
        }, 0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [zoom]); // Add zoom as dependency

  const handleClick = (e: React.MouseEvent) => {
    // Don't handle clicks during selection
    if (isSelectingRef.current) {
      return;
    }

    const target = e.target as HTMLElement;
    const isContainerClick = target === containerRef.current || 
                           target.className === 'draggable-container' ||
                           target.closest('.draggable-container') === containerRef.current;
    
    if (isContainerClick) {
      setSelectedItemIds([]);
      setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
    }
  };

  // Add back handleItemClick function
  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    
    // Don't handle clicks during selection
    if (isSelectingRef.current) {
      return;
    }

    if (e.shiftKey) {
      setSelectedItemIds(prev => {
        const newSelection = prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId];
        return newSelection;
      });
    } else {
      setSelectedItemIds([itemId]);
    }
  };

  const handleDragStart = (id: string, position: { x: number; y: number }) => {
    setIsDragging(true);
    setDraggedItemId(id);
    dragStartPosition.current = position;
    dragStartItems.current = JSON.parse(JSON.stringify(items));

    // Store initial positions of all selected items
    if (selectedItemIds.includes(id)) {
      const positions: { [key: string]: { x: number; y: number } } = {};
      selectedItemIds.forEach(itemId => {
        const item = items.find(i => i.id === itemId);
        if (item) {
          positions[itemId] = { ...item.position };
        }
      });
      dragStartPositions.current = positions;
      setIsDraggingSelection(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !draggedItemId) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left) / zoom;
    const y = (e.clientY - containerRect.top) / zoom;

    // Check if we're over a grid
    const gridItem = items.find(item => 
      item.type === 'grid' && 
      x >= item.position.x && 
      x <= item.position.x + item.size.width &&
      y >= item.position.y && 
      y <= item.position.y + item.size.height
    );

    if (gridItem) {
      const cellWidth = gridItem.size.width / (gridItem.props?.columns || 3);
      const cellHeight = gridItem.size.height / (gridItem.props?.rows || 3);
      
      // Calculate which cell we're over
      const col = Math.floor((x - gridItem.position.x) / cellWidth);
      const row = Math.floor((y - gridItem.position.y) / cellHeight);

      if (col >= 0 && col < (gridItem.props?.columns || 3) && 
          row >= 0 && row < (gridItem.props?.rows || 3)) {
        setDraggingOverGridId(gridItem.id);
        setHoveredGridCell({ gridId: gridItem.id, cell: { row, col } });
      } else {
        setDraggingOverGridId(null);
        setHoveredGridCell(null);
      }
    } else {
      setDraggingOverGridId(null);
      setHoveredGridCell(null);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, draggedItemId, zoom]);

  const handleDragEnd = (id: string, position: { x: number; y: number }) => {
    if (!isDragging || !draggedItemId) return;

    if (hoveredGridCell) {
      // Find the grid item
      const gridItem = items.find(item => item.id === hoveredGridCell.gridId);
      if (gridItem && gridItem.type === 'grid') {
        const cellWidth = gridItem.size.width / (gridItem.props?.columns || 3);
        const cellHeight = gridItem.size.height / (gridItem.props?.rows || 3);
        
        // Get the dragged item
        const draggedItem = items.find(item => item.id === draggedItemId);
        if (!draggedItem) return;

        // Calculate the snapped position to center the item in the cell
        const snappedPosition = {
          x: gridItem.position.x + (hoveredGridCell.cell.col * cellWidth) + (cellWidth / 2) - (draggedItem.size.width / 2),
          y: gridItem.position.y + (hoveredGridCell.cell.row * cellHeight) + (cellHeight / 2) - (draggedItem.size.height / 2)
        };

        // Update the item's position and grid cell info
        setItemsWithHistory(prevItems =>
          prevItems.map(item => {
            if (item.id === draggedItemId) {
              return {
                ...item,
                position: snappedPosition,
                gridCell: {
                  gridId: hoveredGridCell.gridId,
                  row: hoveredGridCell.cell.row,
                  col: hoveredGridCell.cell.col
                }
              };
            }
            return item;
          })
        );
      }
    } else {
      // If not dropped on a grid, remove any existing grid cell info
      setItemsWithHistory(prevItems =>
        prevItems.map(item =>
          item.id === draggedItemId 
            ? { ...item, position, gridCell: undefined }
            : item
        )
      );
    }

    if (isDraggingSelection) {
      const currentItems = JSON.parse(JSON.stringify(items));
      addToHistory(currentItems);
      setIsDraggingSelection(false);
      dragStartPositions.current = {};
    } else {
      const movedItem = items.find(item => item.id === draggedItemId);
      const startItem = dragStartItems.current.find(item => item.id === draggedItemId);
      
      if (movedItem && startItem && 
          (movedItem.position.x !== startItem.position.x || 
           movedItem.position.y !== startItem.position.y)) {
        const currentItems = JSON.parse(JSON.stringify(items));
        addToHistory(currentItems);
      }
    }
    
    setIsDragging(false);
    setDraggedItemId(null);
    dragStartPosition.current = null;
    dragStartItems.current = [];
    setHoveredGridCell(null);
    setDraggingOverGridId(null);
  };

  const handleSizeChange = (id: string, newSize: { width: number; height: number }) => {
    setIsResizing(true);
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, size: newSize } : item
      )
    );
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    // Add the final size to history
    const currentItems = JSON.parse(JSON.stringify(items));
    addToHistory(currentItems);
  };

  const addItem = (type: 'box' | 'circle' , position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: `${type}-${Date.now()}`,
      type,
      position: centerPos,
      size: { width: 100, height: 100 },
      props: type === 'box'
        ? { color: '#4a90e2', size: 100, height: 80 } 
        : type === 'circle'
        ? { width: 100, length: 200 }
        : { width: 100, height: 100 },
      label: undefined
    };
    setItemsWithHistory(prev => {
      const newItems = [...prev, newItem];
      return newItems;
    });
  };

  const handleCommentChange = (itemId: string, comment: string, label: string) => {
    setItemsWithHistory(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.type === 'boxSetContainer' && item.props.children) {
          const updatedChildren = item.props.children.map(child => 
            child.id === itemId 
              ? { ...child, comment, commentLabel: label }
              : child
          );
          
          if (updatedChildren.some(child => child.id === itemId)) {
            return {
              ...item,
              props: {
                ...item.props,
                children: updatedChildren
              }
            };
          }
        }
        
        return item.id === itemId 
          ? { ...item, comment, commentLabel: label }
          : item;
      });

      return updatedItems;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemIds([itemId]);
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      itemId,
    });
  };

  const handleRotateArrow = (itemId: string, degrees: number) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.type === 'arrow'
          ? {
              ...item,
              props: {
                ...item.props,
                rotation: (item.props.rotation || 0) + degrees
              }
            }
          : item
      )
    );
  };

  const handleLabelChange = (itemId: string, newLabel: string) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, label: newLabel } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItemsWithHistory(prevItems => prevItems.filter(item => item.id !== itemId));
    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
  };

  const addSingleBoxSet = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: `boxSet-${Date.now()}`,
      type: 'boxSet',
      position: centerPos,
      size: { width: 20, height: 20 },
      props: {},
      label: undefined,
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const addSeparator = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: `separator-${Date.now()}`,
      type: 'separator',
      position: centerPos,
      size: { width: 2, height: 100 },
      props: { color: '#e0e0e0' },
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const addArrow = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: `arrow-${Date.now()}`,
      type: 'arrow',
      position: centerPos,
      size: { width: 120, height: 40 },
      props: { 
        segments: 3,
        rotation: 0,
        isAnimating: false
      },
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const handleToggleArrowAnimation = (itemId: string) => {
    setItemsWithHistory(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === itemId && item.type === 'arrow'
          ? {
              ...item,
              props: {
                ...item.props,
                isAnimating: !item.props.isAnimating
              }
            }
          : item
      );
      return updatedItems;
    });
  };

  const addCodeBlock = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: generateId(),
      type: 'codeBlock',
      position: centerPos,
      size: { width: 40, height: 40 },
      props: {
        url: 'https://raw.githubusercontent.com/stokilo/notes-website/refs/heads/main/chapters/keycloak/chapter3-custom-scopes/src/main/java/org/sstec/resourceserver/SecurityConfig.java',
        language: 'java',
      },
    };
    setItemsWithHistory([...items, newItem]);
  };

  const addCirclesPath = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: `circlesPath-${Date.now()}`,
      type: 'circlesPath',
      position: centerPos,
      size: { width: 200, height: 100 },
      props: { 
        isAnimating: true
      },
      circlePositions: [
        { x: 40, y: 50 },
        { x: 100, y: 20 },
        { x: 160, y: 50 }
      ]
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const handleToggleCirclesPathAnimation = (itemId: string) => {
    setItemsWithHistory(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === itemId && item.type === 'circlesPath'
          ? {
              ...item,
              props: {
                ...item.props,
                isAnimating: !item.props.isAnimating
              }
            }
          : item
      );
      return updatedItems;
    });
  };

  const handleCirclesPathPositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, position: newPosition }
          : item
      )
    );
  };

  const handleCirclesPathCirclePositionsChange = (id: string, newPositions: Array<{ x: number; y: number }>) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, circlePositions: newPositions }
          : item
      )
    );
  };

  const handleAttachCirclesPath = (circlesPathId: string, targetId: string) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === circlesPathId
          ? { ...item, attachedTo: targetId }
          : item
      )
    );
  };

  const addTwoPointsPath = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: `twoPointsPath-${Date.now()}`,
      type: 'twoPointsPath',
      position: centerPos,
      size: { width: 200, height: 100 },
      props: { 
        isAnimating: true
      },
      circlePositions: [
        { x: 40, y: 50 },
        { x: 160, y: 50 }
      ]
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const handleToggleTwoPointsPathAnimation = (itemId: string) => {
    setItemsWithHistory(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === itemId && item.type === 'twoPointsPath'
          ? {
              ...item,
              props: {
                ...item.props,
                isAnimating: !item.props.isAnimating
              }
            }
          : item
      );
      return updatedItems;
    });
  };

  const handleTwoPointsPathPositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, position: newPosition }
          : item
      )
    );
  };

  const handleTwoPointsPathCirclePositionsChange = (id: string, newPositions: Array<{ x: number; y: number }>) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, circlePositions: newPositions }
          : item
      )
    );
  };

  const handleAttachTwoPointsPath = (twoPointsPathId: string, targetId: string) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === twoPointsPathId
          ? { ...item, attachedTo: targetId }
          : item
      )
    );
  };

  const addMarkdownEditor = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const newItem: DraggableItem = {
      id: `markdown-${Date.now()}`,
      type: 'markdown',
      position: centerPos,
      size: { width: 24, height: 24 },
      props: {
        initialContent: '',
        showPreview: false
      },
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const addGrid = (position: { x: number; y: number }) => {
    const centerPos = getCenterPosition();
    const gridSize = { width: 200, height: 200 };
    const newItem: DraggableItem = {
      id: generateId(),
      type: 'grid',
      position: {
        x: centerPos.x - (gridSize.width / 2),
        y: centerPos.y - (gridSize.height / 2)
      },
      size: gridSize,
      props: {
        rows: 3,
        columns: 3,
        isMagnet: true
      },
      isNew: true
    };
    setItemsWithHistory(prevItems => [...prevItems, newItem]);
  };

  const getCenterPosition = () => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate the center position in the container's coordinate space
    const centerX = (rect.width / 2) / zoom;
    const centerY = (rect.height / 2) / zoom;
    
    return {
      x: centerX,
      y: centerY
    };
  };

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (isDraggingSelection && selectedItemIds.includes(id)) {
      const deltaX = newPosition.x - dragStartPositions.current[id].x;
      const deltaY = newPosition.y - dragStartPositions.current[id].y;

      setItems(prevItems =>
        prevItems.map(item => {
          if (selectedItemIds.includes(item.id)) {
            const startPos = dragStartPositions.current[item.id];
            return {
              ...item,
              position: {
                x: startPos.x + deltaX,
                y: startPos.y + deltaY
              }
            };
          }
          return item;
        })
      );
    } else {
      // If the item is a grid, update positions of all items inside it
      if (item.type === 'grid') {
        setItems(prevItems =>
          prevItems.map(prevItem => {
            if (prevItem.id === id) {
              return { ...prevItem, position: newPosition };
            }
            // Update positions of items inside the grid
            if (prevItem.gridCell?.gridId === id) {
              const cellWidth = item.size.width / (item.props?.columns || 3);
              const cellHeight = item.size.height / (item.props?.rows || 3);
              
              // Calculate new position based on grid's new position and cell coordinates
              // Subtract half of the item's size to center it
              const newItemPosition = {
                x: newPosition.x + (prevItem.gridCell.col * cellWidth) + (cellWidth / 2) - (prevItem.size.width / 2),
                y: newPosition.y + (prevItem.gridCell.row * cellHeight) + (cellHeight / 2) - (prevItem.size.height / 2)
              };
              
              return {
                ...prevItem,
                position: newItemPosition
              };
            }
            return prevItem;
          })
        );
      } else {
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, position: newPosition } : item
          )
        );
      }
    }
  };

  const renderItem = (item: DraggableItem) => {
    const commonProps = {
      id: item.id,
      position: item.position,
      size: item.size,
      onDragStart: handleDragStart,
      onPositionChange: handlePositionChange,
      onDragEnd: handleDragEnd,
      onSizeChange: handleSizeChange,
      onResizeEnd: handleResizeEnd,
      onClick: (e: React.MouseEvent) => handleItemClick(e, item.id),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, item.id),
      isSelected: selectedItemIds.includes(item.id),
      isNew: item.isNew,
      finalPosition: item.finalPosition,
      rotation: item.rotation,
    };

    switch (item.type) {
      case 'box':
        return <DraggableItem key={item.id} {...commonProps}><RectangleItem width={item.size.width} height={item.size.height} /></DraggableItem>;
      case 'circle':
        return <DraggableItem key={item.id} {...commonProps}><CircleItem width={item.size.width} height={item.size.height} /></DraggableItem>;
      case 'boxSet':
        return (
          <DraggableItem key={item.id} {...commonProps}>
            <BoxSetItem
              width={item.size.width}
              height={item.size.height}
              comment={item.comment}
              commentLabel={item.commentLabel}
            />
          </DraggableItem>
        );
      case 'separator':
        return <DraggableItem key={item.id} {...commonProps}><SeparatorItem width={item.size.width} height={item.size.height} /></DraggableItem>;
      case 'arrow':
        return (
          <DraggableItem key={item.id} {...commonProps}>
            <ArrowItem
              width={item.size.width}
              height={item.size.height}
              segments={item.props?.segments || 3}
              isAnimating={item.props?.isAnimating}
            />
          </DraggableItem>
        );
      case 'codeBlock':
        return (
          <DraggableItem key={item.id} {...commonProps}>
            <ShikiCodeBlockItem
              width={item.size.width}
              height={item.size.height}
              code={item.props?.code}
              language={item.props?.language}
            />
          </DraggableItem>
        );
      case 'circlesPath':
        return (
          <DraggableItem key={item.id} {...commonProps}>
            <CirclesPathItem
              width={item.size.width}
              height={item.size.height}
              isAnimating={item.props?.isAnimating}
              position={item.position}
              circlePositions={item.circlePositions}
              onPositionChange={handleCirclesPathPositionChange}
              onCirclePositionsChange={handleCirclesPathCirclePositionsChange}
              onAttach={(targetId) => handleAttachCirclesPath(item.id, targetId)}
            />
          </DraggableItem>
        );
      case 'twoPointsPath':
        return (
          <DraggableItem key={item.id} {...commonProps}>
            <TwoPointsPathItem
              width={item.size.width}
              height={item.size.height}
              isAnimating={item.props?.isAnimating}
              position={item.position}
              circlePositions={item.circlePositions}
              onPositionChange={handleTwoPointsPathPositionChange}
              onCirclePositionsChange={handleTwoPointsPathCirclePositionsChange}
              onAttach={(targetId) => handleAttachTwoPointsPath(item.id, targetId)}
            />
          </DraggableItem>
        );
      case 'markdown':
        return (
          <DraggableItem key={item.id} {...commonProps}>
            <MarkdownEditorItem
              width={item.size.width}
              height={item.size.height}
              initialContent={item.props?.content}
            />
          </DraggableItem>
        );
      case 'grid':
        // Find all items that belong to this grid
        const gridItems = items.filter(i => i.gridCell?.gridId === item.id);
        
        return (
          <DraggableItem key={item.id} {...commonProps}>
            <GridItem
              width={item.size.width}
              height={item.size.height}
              rows={item.props?.rows || 3}
              columns={item.props?.columns || 3}
              isMagnet={item.props?.isMagnet}
              isDraggingOver={draggingOverGridId === item.id}
              droppedItems={gridItems.map(gridItem => ({
                id: gridItem.id,
                row: gridItem.gridCell.row,
                col: gridItem.gridCell.col,
                item: renderGridItem(gridItem)
              }))}
              onItemDrop={(row, col) => {
                // Remove the onItemDrop handler since we handle drops in handleDragEnd
              }}
            />
          </DraggableItem>
        );
      default:
        return null;
    }
  };

  // Separate function to render items inside grid cells
  const renderGridItem = (item: DraggableItem) => {
    switch (item.type) {
      case 'box':
        return <RectangleItem width={item.size.width} height={item.size.height} />;
      case 'circle':
        return <CircleItem width={item.size.width} height={item.size.height} />;
      case 'boxSet':
        return (
          <BoxSetItem
            width={item.size.width}
            height={item.size.height}
            comment={item.comment}
            commentLabel={item.commentLabel}
          />
        );
      case 'separator':
        return <SeparatorItem width={item.size.width} height={item.size.height} />;
      case 'arrow':
        return (
          <ArrowItem
            width={item.size.width}
            height={item.size.height}
            segments={item.props?.segments || 3}
            isAnimating={item.props?.isAnimating}
          />
        );
      case 'codeBlock':
        return (
          <ShikiCodeBlockItem
            width={item.size.width}
            height={item.size.height}
            code={item.props?.code}
            language={item.props?.language}
          />
        );
      case 'circlesPath':
        return (
          <CirclesPathItem
            width={item.size.width}
            height={item.size.height}
            isAnimating={item.props?.isAnimating}
            position={item.position}
            circlePositions={item.circlePositions}
            onPositionChange={handleCirclesPathPositionChange}
            onCirclePositionsChange={handleCirclesPathCirclePositionsChange}
            onAttach={(targetId) => handleAttachCirclesPath(item.id, targetId)}
          />
        );
      case 'twoPointsPath':
        return (
          <TwoPointsPathItem
            width={item.size.width}
            height={item.size.height}
            isAnimating={item.props?.isAnimating}
            position={item.position}
            circlePositions={item.circlePositions}
            onPositionChange={handleTwoPointsPathPositionChange}
            onCirclePositionsChange={handleTwoPointsPathCirclePositionsChange}
            onAttach={(targetId) => handleAttachTwoPointsPath(item.id, targetId)}
          />
        );
      case 'markdown':
        return (
          <MarkdownEditorItem
            width={item.size.width}
            height={item.size.height}
            initialContent={item.props?.content}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`draggable-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
      }}
      onClick={handleClick}
      onMouseDown={handleSelectionStart}
      tabIndex={0}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {items.map(renderItem)}
        {selectionArea.isSelecting && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(selectionArea.start.x, selectionArea.end.x),
              top: Math.min(selectionArea.start.y, selectionArea.end.y),
              width: Math.abs(selectionArea.end.x - selectionArea.start.x),
              height: Math.abs(selectionArea.end.y - selectionArea.start.y),
              border: '2px dashed #4a90e2',
              backgroundColor: 'rgba(74, 144, 226, 0.1)',
              pointerEvents: 'none',
              zIndex: 999,
            }}
          />
        )}
      </div>

      {/* Fixed UI elements that don't scale with zoom */}
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <DebugPanel />
        <ContextPanel
          onAddBox={() => addItem('box', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
          onAddCircle={() => addItem('circle', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
          onAddCodeBlock={() => addCodeBlock({ x: window.innerWidth / 2 - 20, y: window.innerHeight / 2 - 20 })}
          onClearScene={handleClearScene}
        />
        <TopContextPanel
          onAddSingleBoxSet={() => addSingleBoxSet({ x: window.innerWidth / 2 - 10, y: window.innerHeight / 2 - 10 })}
          onAddSeparator={() => addSeparator({ x: window.innerWidth / 2 - 1, y: window.innerHeight / 2 - 50 })}
          onAddArrow={() => addArrow({ x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 20 })}
          onAddCirclesPath={() => addCirclesPath({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 })}
          onAddTwoPointsPath={() => addTwoPointsPath({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 })}
          onAddMarkdownEditor={() => addMarkdownEditor({ x: window.innerWidth / 2 - 20, y: window.innerHeight / 2 - 20 })}
          onAddGrid={() => addGrid({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 })}
        />
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: 'white',
            }}
          >
            -
          </button>
          <span style={{ lineHeight: '30px' }}>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: 'white',
            }}
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: 'white',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {contextMenu.show && (
        <ContextMenu
          items={(() => {
            const item = items.find(i => i.id === contextMenu.itemId);
            if (!item) return [];

            const baseItems = [
              {
                label: 'Copy',
                onClick: () => handleCopy(contextMenu.itemId),
              },
              {
                label: 'Paste',
                onClick: handlePaste,
                disabled: !copiedItem,
              },
              {
                label: 'Delete',
                onClick: () => handleDeleteItem(contextMenu.itemId),
              },
            ];

            // Add rotation and animation controls for arrow items
            if (item.type === 'arrow') {
              return [
                {
                  label: item.props.isAnimating ? 'Stop Animation' : 'Start Animation',
                  onClick: () => handleToggleArrowAnimation(contextMenu.itemId),
                },
                {
                  label: 'Rotate 90° Clockwise',
                  onClick: () => handleRotateArrow(contextMenu.itemId, 90),
                },
                {
                  label: 'Rotate 90° Counter-clockwise',
                  onClick: () => handleRotateArrow(contextMenu.itemId, -90),
                },
                {
                  label: 'Rotate 45° Clockwise',
                  onClick: () => handleRotateArrow(contextMenu.itemId, 45),
                },
                {
                  label: 'Rotate 45° Counter-clockwise',
                  onClick: () => handleRotateArrow(contextMenu.itemId, -45),
                },
                ...baseItems,
              ];
            }

            const containerWithboxSet = items.find(container =>
              container.type === 'boxSetContainer' && 
              container.props.children?.some(child => child.id === contextMenu.itemId)
            );

            if (containerWithboxSet) {
              const boxSet = containerWithboxSet.props.children.find(
                child => child.id === contextMenu.itemId
              );
              
              if (boxSet) {
                return [
                  {
                    label: boxSet.comment ? 'View Comment' : 'Add Comment',
                    onClick: () => {
                      setCommentEditor({
                        show: true,
                        itemId: contextMenu.itemId,
                        position: { x: contextMenu.x, y: contextMenu.y },
                      });
                      setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                    },
                  },
                  ...baseItems,
                ];
              }
            }

            if (item.type === 'boxSet') {
              return [
                {
                  label: item.comment ? 'View Comment' : 'Add Comment',
                  onClick: () => {
                    setCommentEditor({
                      show: true,
                      itemId: contextMenu.itemId,
                      position: { x: contextMenu.x, y: contextMenu.y },
                    });
                    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                  },
                },
                ...baseItems,
              ];
            }

            if (item.type === 'codeBlock') {
              return [
                {
                  label: 'Show Code',
                  onClick: () => {
                    setCodePreviewItemId(contextMenu.itemId);
                    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                  },
                },
                ...baseItems,
              ];
            }

            if (item.type === 'circlesPath') {
              return [
                {
                  label: item.props.isAnimating ? 'Stop Animation' : 'Start Animation',
                  onClick: () => handleToggleCirclesPathAnimation(contextMenu.itemId),
                },
                {
                  label: 'Attach to...',
                  onClick: () => {}, // Add empty onClick to satisfy MenuItem type
                  submenu: items
                    .filter(i => i.id !== contextMenu.itemId && i.type !== 'circlesPath')
                    .map(targetItem => ({
                      label: `Attach to ${targetItem.type} ${targetItem.id}`,
                      onClick: () => handleAttachCirclesPath(contextMenu.itemId, targetItem.id),
                    })),
                },
                ...baseItems,
              ];
            }

            if (item.type === 'markdown') {
              return [
                {
                  label: 'Paste',
                  onClick: () => {
                    navigator.clipboard.readText().then(text => {
                      const markdownItem = items.find(i => i.id === contextMenu.itemId);
                      if (markdownItem) {
                        setItemsWithHistory(prevItems =>
                          prevItems.map(item =>
                            item.id === contextMenu.itemId
                              ? {
                                  ...item,
                                  props: {
                                    ...item.props,
                                    initialContent: (item.props.initialContent || '') + text
                                  }
                                }
                              : item
                          )
                        );
                      }
                    });
                    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                  }
                },
                ...baseItems,
              ];
            }

            return [
              {
                label: 'Add Label',
                onClick: () => {
                  handleLabelChange(contextMenu.itemId, '');
                },
              },
              ...baseItems,
            ];
          })()}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu({ show: false, x: 0, y: 0, itemId: '' })}
        />
      )}
      {commentEditor.show && (
        <CommentEditor
          initialContent={(() => {
            const standaloneBox = items.find(i => i.id === commentEditor.itemId);
            if (standaloneBox) {
              return standaloneBox.comment;
            }
            
            // If not found, check if it's in a container
            const containerWithBox = items.find(container => 
              container.type === 'boxSetContainer' && 
              container.props.children?.some(child => child.id === commentEditor.itemId)
            );
            
            if (containerWithBox) {
              const boxSet = containerWithBox.props.children.find(
                child => child.id === commentEditor.itemId
              );
              return boxSet?.comment;
            }
            
            return '';
          })()}
          initialLabel={(() => {
            const standaloneBox = items.find(i => i.id === commentEditor.itemId);
            if (standaloneBox) {
              return standaloneBox.commentLabel;
            }
            
            // If not found, check if it's in a container
            const containerWithBox = items.find(container => 
              container.type === 'boxSetContainer' && 
              container.props.children?.some(child => child.id === commentEditor.itemId)
            );
            
            if (containerWithBox) {
              const boxSet = containerWithBox.props.children.find(
                child => child.id === commentEditor.itemId
              );
              return boxSet?.commentLabel;
            }
            
            return '';
          })()}
          position={commentEditor.position}
          onSave={(content, label) => {
            handleCommentChange(commentEditor.itemId, content, label);
            setCommentEditor({ show: false, itemId: '', position: { x: 0, y: 0 } });
          }}
          onClose={() => setCommentEditor({ show: false, itemId: '', position: { x: 0, y: 0 } })}
        />
      )}
    </div>
  );
};

export default DraggableContainer; 