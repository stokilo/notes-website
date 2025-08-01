import React, { useState, useEffect, useRef } from 'react';
import DraggableItem from './DraggableItem';
import DebugPanel from '../DebugPanel';
import ContextPanel from '../context/ContextPanel';
import TopContextPanel from '../context/TopContextPanel';
import BoxSetItem from '../items/BoxSetItem';
import ContextMenu from '../menu/ContextMenu';
import CommentEditor from '../CommentEditor';
import RectangleItem from "../items/RectangleItem";
import CircleItem from "../items/CircleItem";
import SeparatorItem from '../items/SeparatorItem';
import ArrowItem from '../items/ArrowItem';
import CirclesPathItem from '../items/CirclesPathItem';
import TwoPointsPathItem from '../items/TwoPointsPathItem';
import ShikiCodeBlockItem from '../items/ShikiCodeBlockItem';
import TextItem from '../items/TextItem';
import FolderStructureItem from '../items/FolderStructureItem';
import DatabaseItem from '../items/DatabaseItem';
import IconItem from '../items/IconItem';

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
  type: 'box' | 'circle' | 'boxSet' | 'boxSetContainer' | 'separator' | 'arrow' | 'circlesPath' | 'twoPointsPath' | 'codeBlock' | 'text' | 'folderStructure' | 'database' | 'icon';
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
  isViewMode?: boolean;
  text?: string;
  folderData?: Array<{
    id: string;
    name: string;
    type: 'file' | 'folder';
    children?: Array<any>;
    isExpanded?: boolean;
  }>;
  iconName?: string;
  code?: string;
  language?: string;
  url?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [isViewMode, setIsViewMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStartPosition = useRef<{ x: number; y: number } | null>(null);
  const [viewModePadding, setViewModePadding] = useState({ x: 0, y: 0 });

  // Function to load scene from URL
  const loadSceneFromUrl = async (url: string) => {
    try {
      // Clear existing localStorage data before import
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HISTORY_STORAGE_KEY);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const importedData = await response.json();
      
      // Validate the imported data
      if (!importedData.items || !Array.isArray(importedData.items)) {
        throw new Error('Invalid scene data format');
      }

      // Reset the scene and set new items
      setItems(importedData.items);
      setSelectedItemIds([]);
      setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
      setCopiedItem(null);
      
      // Initialize history with the imported scene
      const initialHistory = [importedData.items];
      setHistory(initialHistory);
      setHistoryIndex(0);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData.items));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initialHistory));

      // Update URL to remove the import parameters
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('import');
      currentUrl.searchParams.delete('importUrl');
      window.history.replaceState({}, '', currentUrl.toString());
    } catch (error) {
      console.error('Error loading scene from URL:', error);
      alert('Error loading scene from URL: ' + (error instanceof Error ? error.message : 'Unknown error'));
      
      // If import fails, try to restore from localStorage if available
      const savedScene = localStorage.getItem(STORAGE_KEY);
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      
      if (savedScene && savedHistory) {
        try {
          const parsedScene = JSON.parse(savedScene);
          const parsedHistory = JSON.parse(savedHistory);
          
          setItems(parsedScene);
          setHistory(parsedHistory);
          setHistoryIndex(parsedHistory.length - 1);
        } catch (e) {
          console.error('Error restoring from localStorage after failed import:', e);
        }
      }
    }
  };

  // Check for import parameters on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const importParam = urlParams.get('import');
    const importUrlParam = urlParams.get('importUrl');
    
    if (importParam) {
      // Construct the full URL using the current origin for local imports
      const importUrl = `${window.location.origin}/${importParam}`;
      loadSceneFromUrl(importUrl);
    } else if (importUrlParam) {
      // Use the provided external URL directly
      loadSceneFromUrl(importUrlParam);
    }
  }, []); // Empty dependency array to ensure this only runs once on mount

  // Check for view mode on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewMode = urlParams.get('viewMode') === 'true';
    setIsViewMode(viewMode);
  }, []);

  // Update ref when state changes
  useEffect(() => {
    selectionAreaRef.current = selectionArea;
  }, [selectionArea]);

  // Load scene and history from localStorage on initial mount
  useEffect(() => {
    const savedScene = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    
    // Only load from localStorage if there's no import parameter
    const urlParams = new URLSearchParams(window.location.search);
    const importParam = urlParams.get('import');
    
    if (!importParam) {
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
      
      console.log('Setting items:', nextItems);
      
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
      // Check if we're currently editing a label
      const isEditingLabel = document.querySelector('input[type="text"]:focus');
      if (isEditingLabel) {
        return; // Don't handle keyboard shortcuts while editing
      }

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

    // Calculate position relative to the container
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;

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
    const endX = e.clientX - containerRect.left;
    const endY = e.clientY - containerRect.top;

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
      left: Math.min(currentSelection.start.x, currentSelection.end.x) / zoom,
      right: Math.max(currentSelection.start.x, currentSelection.end.x) / zoom,
      top: Math.min(currentSelection.start.y, currentSelection.end.y) / zoom,
      bottom: Math.max(currentSelection.start.y, currentSelection.end.y) / zoom
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

    // Only deselect if we clicked directly on the container or its background
    const target = e.target as HTMLElement;
    if (target === containerRef.current || 
        target.className === 'draggable-container' ||
        target.closest('.draggable-container') === containerRef.current) {
      // Check if we clicked on a draggable item
      const clickedOnItem = target.closest('.draggable-item');
      if (!clickedOnItem) {
        setSelectedItemIds([]);
        setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
      }
    }
  };

  // Add back handleItemClick function
  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
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

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
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
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, position: newPosition } : item
        )
      );
    }
  };

  const handleDragEnd = (id: string, position: { x: number; y: number }) => {
    if (isDragging && dragStartPosition.current) {
      if (isDraggingSelection) {
        const currentItems = JSON.parse(JSON.stringify(items));
        addToHistory(currentItems);
        setIsDraggingSelection(false);
        dragStartPositions.current = {};
      } else {
        const movedItem = items.find(item => item.id === id);
        const startItem = dragStartItems.current.find(item => item.id === id);
        
        if (movedItem && startItem && 
            (movedItem.position.x !== startItem.position.x || 
             movedItem.position.y !== startItem.position.y)) {
          const currentItems = JSON.parse(JSON.stringify(items));
          addToHistory(currentItems);
        }
      }
    }
    
    setIsDragging(false);
    dragStartPosition.current = null;
    dragStartItems.current = [];
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

  const addItem = (type: 'box' | 'circle', position: { x: number; y: number }) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = (containerRect.width / 2) / zoom;
    const centerY = (containerRect.height / 2) / zoom;

    const newItem: DraggableItem = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: centerX - 50, y: centerY - 50 }, // Subtract half of the item size to center it
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
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const menuItems = [];

    if (item.type === 'codeBlock') {
      menuItems.push(
        { label: 'Show Code', onClick: () => {
          setCodePreviewItemId(itemId);
          setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
        }},
        { label: 'Edit Code', onClick: () => {
          setItemsWithHistory(prevItems =>
            prevItems.map(prevItem =>
              prevItem.id === itemId
                ? {
                    ...prevItem,
                    props: {
                      ...prevItem.props,
                      showEditor: true
                    }
                  }
                : prevItem
            )
          );
          setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
        }},
        { label: item.label ? 'Edit Label' : 'Add Label', onClick: () => {
          setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
          // Create a temporary input element for editing
          const input = document.createElement('input');
          input.type = 'text';
          input.value = item.label || '';
          input.style.position = 'absolute';
          input.style.left = `${e.clientX}px`;
          input.style.top = `${e.clientY}px`;
          input.style.zIndex = '1000';
          input.style.padding = '4px';
          input.style.border = '1px solid #4a90e2';
          input.style.borderRadius = '4px';
          input.style.fontSize = '14px';
          input.style.minWidth = '100px';

          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              setItemsWithHistory(prevItems =>
                prevItems.map(prevItem =>
                  prevItem.id === itemId
                    ? {
                        ...prevItem,
                        label: input.value
                      }
                    : prevItem
                )
              );
              cleanup();
            } else if (e.key === 'Escape') {
              cleanup();
            }
          };

          const handleClickOutside = (e: MouseEvent) => {
            if (e.target !== input) {
              setItemsWithHistory(prevItems =>
                prevItems.map(prevItem =>
                  prevItem.id === itemId
                    ? {
                        ...prevItem,
                        label: input.value
                      }
                    : prevItem
                )
              );
              cleanup();
            }
          };

          const cleanup = () => {
            input.remove();
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
          };

          document.body.appendChild(input);
          input.focus();
          input.select();

          document.addEventListener('keydown', handleKeyDown);
          document.addEventListener('mousedown', handleClickOutside);
        }},
        { label: 'Remove Label', onClick: () => {
          setItemsWithHistory(prevItems =>
            prevItems.map(prevItem =>
              prevItem.id === itemId
                ? {
                    ...prevItem,
                    label: undefined
                  }
                : prevItem
            )
          );
          setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
        },
        disabled: !item.label
      },
        { label: 'Delete', onClick: () => handleDeleteItem(itemId) }
      );
    } else if (item.type === 'text') {
      menuItems.push(
        { label: item.props?.hasBorder !== false ? 'Remove Border' : 'Add Border', onClick: () => handleToggleTextBorder(itemId) },
        { label: 'Delete', onClick: () => handleDeleteItem(itemId) }
      );
    } else {
      menuItems.push(
        { label: 'Copy', onClick: () => handleCopy(itemId) },
        { label: 'Paste', onClick: handlePaste, disabled: !copiedItem },
        { label: 'Delete', onClick: () => handleDeleteItem(itemId) }
      );
    }

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
    const newItem: DraggableItem = {
      id: `boxSet-${Date.now()}`,
      type: 'boxSet',
      position,
      size: { width: 20, height: 20 },
      props: {},
      label: undefined,
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const addSeparator = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `separator-${Date.now()}`,
      type: 'separator',
      position,
      size: { width: 2, height: 100 },
      props: { color: '#e0e0e0' },
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const addArrow = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `arrow-${Date.now()}`,
      type: 'arrow',
      position,
      size: { width: 120, height: 40 },
      props: { 
        segments: 3,
        rotation: 0,
        isAnimating: false,
        curve: 0
      },
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const handleToggleArrowAnimation = (itemId: string) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.type === 'arrow'
          ? {
              ...item,
              props: {
                ...item.props,
                isAnimating: !item.props.isAnimating
              }
            }
          : item
      )
    );
  };

  const handleArrowCurve = (itemId: string, curve: number) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.type === 'arrow'
          ? {
              ...item,
              props: {
                ...item.props,
                curve
              }
            }
          : item
      )
    );
  };

  const addCirclesPath = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `circlesPath-${Date.now()}`,
      type: 'circlesPath',
      position,
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
    const newItem: DraggableItem = {
      id: `twoPointsPath-${Date.now()}`,
      type: 'twoPointsPath',
      position,
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

  const handleLanguageChange = (itemId: string, newLanguage: string) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              props: {
                ...item.props,
                language: newLanguage
              }
            }
          : item
      )
    );
  };

  const handleExportScene = () => {
    const sceneData = {
      items,
      version: '1.0',
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportScene = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Validate the imported data
        if (!importedData.items || !Array.isArray(importedData.items)) {
          throw new Error('Invalid scene data format');
        }

        // Reset the scene and set new items
        setItems(importedData.items);
        setSelectedItemIds([]);
        setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
        setCopiedItem(null);
        
        // Initialize history with the imported scene
        const initialHistory = [importedData.items];
        setHistory(initialHistory);
        setHistoryIndex(0);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData.items));
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initialHistory));
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error importing scene:', error);
        alert('Error importing scene: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  // Add panning functionality
  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isViewMode) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsPanning(true);
    panStartPosition.current = { x: clientX, y: clientY };
  };

  const handlePanMove = (e: MouseEvent | TouchEvent) => {
    if (!isPanning || !panStartPosition.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = (clientX - panStartPosition.current.x) / zoom;
    const deltaY = (clientY - panStartPosition.current.y) / zoom;
    
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    panStartPosition.current = { x: clientX, y: clientY };
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    panStartPosition.current = null;
  };

  // Add panning event listeners
  useEffect(() => {
    if (!isViewMode) return;

    const handleMouseMove = (e: MouseEvent) => handlePanMove(e);
    const handleTouchMove = (e: TouchEvent) => handlePanMove(e);
    const handleMouseUp = () => handlePanEnd();
    const handleTouchEnd = () => handlePanEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isViewMode, isPanning, zoom]);

  // Add function to calculate view mode padding and adjust positions
  const calculateViewModePadding = (items: DraggableItem[]) => {
    if (!items.length) return { x: 0, y: 0 };

    // Find the bounds of all items
    const bounds = items.reduce((acc, item) => {
      return {
        minX: Math.min(acc.minX, item.position.x),
        minY: Math.min(acc.minY, item.position.y),
        maxX: Math.max(acc.maxX, item.position.x + item.size.width),
        maxY: Math.max(acc.maxY, item.position.y + item.size.height)
      };
    }, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    });

    // Calculate padding (1% of the total width/height)
    const paddingX = (bounds.maxX - bounds.minX) * 0.01;
    const paddingY = (bounds.maxY - bounds.minY) * 0.01;

    // Calculate offset to shift items
    const offsetX = bounds.minX - paddingX;
    const offsetY = bounds.minY - paddingY;

    return { x: offsetX, y: offsetY };
  };

  // Update view mode padding when items change
  useEffect(() => {
    if (isViewMode) {
      setViewModePadding(calculateViewModePadding(items));
    }
  }, [isViewMode, items]);

  // Modify renderItem to adjust positions in view mode
  const renderItem = (item: DraggableItem) => {
    const adjustedPosition = isViewMode ? {
      x: item.position.x - viewModePadding.x,
      y: item.position.y - viewModePadding.y
    } : item.position;

    const commonProps = {
      id: item.id,
      initialPosition: adjustedPosition,
      initialSize: item.size,
      onPositionChange: (pos: { x: number; y: number }) => handlePositionChange(item.id, pos),
      onSizeChange: (size: { width: number; height: number }) => handleSizeChange(item.id, size),
      onResizeEnd: handleResizeEnd,
      onDragStart: (pos: { x: number; y: number }) => handleDragStart(item.id, pos),
      onDragEnd: (pos: { x: number; y: number }) => handleDragEnd(item.id, pos),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, item.id),
      onClick: (e: React.MouseEvent) => handleItemClick(e, item.id),
      isSelected: selectedItemIds.includes(item.id),
      zoom: zoom,
      disableAnimations: true,
      isViewMode
    };

    return (
      <DraggableItem key={item.id} {...commonProps}>
        {item.type === 'box' && (
          <RectangleItem
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        )}
        {item.type === 'circle' && (
          <CircleItem
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        )}
        {item.type === 'boxSet' && (
          <BoxSetItem
            width={item.size.width}
            height={item.size.height}
            comment={item.comment}
            commentLabel={item.commentLabel}
            onContextMenu={(e) => handleContextMenu(e, item.id)}
            onAddComment={(e) => {
              setCommentEditor({
                show: true,
                itemId: item.id,
                position: { x: e.clientX, y: e.clientY },
              });
            }}
            isViewMode={isViewMode}
          />
        )}

        {item.type === 'separator' && (
          <SeparatorItem
            width={item.size.width}
            height={item.size.height}
            color={item.props.color}
          />
        )}
        {item.type === 'arrow' && (
          <ArrowItem
            width={item.size.width}
            height={item.size.height}
            rotation={item.props.rotation}
            isAnimating={item.props.isAnimating}
            curve={item.props.curve}
            label={item.label}
          />
        )}
        {item.type === 'circlesPath' && (
          <CirclesPathItem
            key={item.id}
            width={item.size.width}
            height={item.size.height}
            isAnimating={item.props.isAnimating}
            position={item.position}
            circlePositions={item.circlePositions || []}
            onPositionsChange={(newPositions) => {
              setItemsWithHistory(prevItems =>
                prevItems.map(prevItem =>
                  prevItem.id === item.id
                    ? { ...prevItem, circlePositions: newPositions }
                    : prevItem
                )
              );
            }}
          />
        )}
        {item.type === 'twoPointsPath' && (
          <TwoPointsPathItem
            key={item.id}
            width={item.size.width}
            height={item.size.height}
            isAnimating={item.props.isAnimating}
            position={item.position}
            circlePositions={item.circlePositions || []}
            onPositionsChange={(newPositions) => {
              setItemsWithHistory(prevItems =>
                prevItems.map(prevItem =>
                  prevItem.id === item.id
                    ? { ...prevItem, circlePositions: newPositions }
                    : prevItem
                )
              );
            }}
          />
        )}
        {item.type === 'codeBlock' && (
          <ShikiCodeBlockItem
            width={item.size.width}
            height={item.size.height}
            code={item.props?.code}
            url={item.props?.url}
            language={item.props?.language}
            showPreview={codePreviewItemId === item.id}
            onClosePreview={() => {
              setCodePreviewItemId(null);
              setItemsWithHistory(prevItems =>
                prevItems.map(prevItem =>
                  prevItem.id === item.id
                    ? {
                        ...prevItem,
                        props: {
                          ...prevItem.props,
                          showEditor: false
                        }
                      }
                    : prevItem
                )
              );
            }}
            onShowPreview={() => setCodePreviewItemId(item.id)}
            onCodeChange={(newCode) => {
              setItemsWithHistory(prevItems =>
                prevItems.map(prevItem =>
                  prevItem.id === item.id
                    ? {
                        ...prevItem,
                        props: {
                          ...prevItem.props,
                          code: newCode
                        }
                      }
                    : prevItem
                )
              );
            }}
            onLanguageChange={(newLanguage) => handleLanguageChange(item.id, newLanguage)}
            isViewMode={isViewMode}
            showEditor={item.props?.showEditor}
            label={item.label}
          />
        )}
        {item.type === 'text' && (
          <TextItem
            width={item.size.width}
            height={item.size.height}
            text={item.text || ''}
            onTextChange={(newText) => handleTextChange(item.id, newText)}
            isViewMode={isViewMode}
            isSelected={selectedItemIds.includes(item.id)}
            hasBorder={item.props?.hasBorder !== false}
          />
        )}
        {item.type === 'folderStructure' && (
          <FolderStructureItem
            width={item.size.width}
            height={item.size.height}
            data={item.folderData}
            onDataChange={(newData) => handleFolderDataChange(item.id, newData)}
            isViewMode={isViewMode}
          />
        )}
        {item.type === 'database' && (
          <DatabaseItem
            width={item.size.width}
            height={item.size.height}
            animated={item.props.animated !== false}
            label={item.label}
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        )}
        {item.type === 'icon' && (
          <IconItem
            width={item.size.width}
            height={item.size.height}
            animated={item.props.animated !== false}
            label={item.label}
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
            iconName={item.iconName}
          />
        )}
      </DraggableItem>
    );
  };

  const addText = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      position,
      size: { width: 200, height: 100 },
      props: {
        hasBorder: true
      },
      text: 'Click to edit text',
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const handleTextChange = (itemId: string, newText: string) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, text: newText }
          : item
      )
    );
  };

  const handleToggleTextBorder = (itemId: string) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              props: {
                ...(item.props || {}),
                hasBorder: !(item.props?.hasBorder ?? true)
              }
            }
          : item
      )
    );
  };

  const addFolderStructure = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `folderStructure-${Date.now()}`,
      type: 'folderStructure',
      position,
      size: { width: 300, height: 400 },
      props: {},
      folderData: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          isExpanded: true,
          children: []
        }
      ]
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const handleFolderDataChange = (itemId: string, newData: Array<any>) => {
    setItemsWithHistory(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, folderData: newData }
          : item
      )
    );
  };

  const addDatabase = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `database-${Date.now()}`,
      type: 'database',
      position,
      size: { width: 64, height: 64 },
      props: { animated: true },
    };
    setItemsWithHistory(prev => [...prev, newItem]);
  };

  const addIcon = (position: { x: number; y: number }, iconName: string) => {
    const newItem: DraggableItem = {
      id: `icon-${Date.now()}`,
      type: 'icon',
      position,
      size: { width: 64, height: 64 },
      props: { animated: true },
      iconName,
    };
    setItemsWithHistory(prev => [...prev, newItem]);
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
        cursor: isViewMode ? (isPanning ? 'grabbing' : 'grab') : 'default',
      }}
      onClick={(e) => {
        if (isViewMode) return;
        // Only handle clicks directly on the container
        if (e.target === containerRef.current) {
          setSelectedItemIds([]);
          setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
        }
      }}
      onMouseDown={isViewMode ? handlePanStart : handleSelectionStart}
      onTouchStart={isViewMode ? handlePanStart : undefined}
      tabIndex={0}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${zoom}) translate(${isViewMode ? panOffset.x : 0}px, ${isViewMode ? panOffset.y : 0}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Add background div to catch clicks */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
          onClick={(e) => {
            if (isViewMode) return;
            e.stopPropagation();
            setSelectedItemIds([]);
            setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
          }}
        />
        {items.map(item => renderItem({
          ...item,
          isViewMode
        }))}
      </div>

      {/* Selection rectangle */}
      {!isViewMode && selectionArea.isSelecting && (
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

      {/* Fixed UI elements that don't scale with zoom */}
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <DebugPanel />
        {!isViewMode && (
          <>
            <ContextPanel
              position={{ x: contextMenu.x, y: contextMenu.y }}
              onAddBox={() => addItem('box', { x: contextMenu.x, y: contextMenu.y })}
              onAddCircle={() => addItem('circle', { x: contextMenu.x, y: contextMenu.y })}
              onClearScene={handleClearScene}
              onClose={() => setContextMenu({ show: false, x: 0, y: 0, itemId: '' })}
              onExport={handleExportScene}
              onImport={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportScene}
              style={{ display: 'none' }}
            />
            <TopContextPanel
              onAddSingleBoxSet={() => addSingleBoxSet({ x: window.innerWidth / 2 - 10, y: window.innerHeight / 2 - 10 })}
              onAddSeparator={() => addSeparator({ x: window.innerWidth / 2 - 1, y: window.innerHeight / 2 - 50 })}
              onAddArrow={() => addArrow({ x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 20 })}
              onAddCirclesPath={() => addCirclesPath({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 })}
              onAddTwoPointsPath={() => addTwoPointsPath({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 })}
              onAddCodeBlock={(position) => {
                const newItem: DraggableItem = {
                  id: `code-${Date.now()}`,
                  type: 'codeBlock',
                  position,
                  size: { width: 48, height: 24 },
                  props: {
                    width: 48,
                    height: 24,
                    language: 'java',
                    code: '',
                  }
                };
                setItemsWithHistory(prev => [...prev, newItem]);
              }}
              onAddGrid={() => {}}
              onAddText={addText}
              onAddFolderStructure={addFolderStructure}
              onAddDatabase={addDatabase}
              onAddIcon={addIcon}
            />
          </>
        )}
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
          <button
            onClick={() => setIsViewMode(prev => !prev)}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '3px',
              backgroundColor: isViewMode ? '#4a90e2' : 'white',
              color: isViewMode ? 'white' : 'black',
            }}
            title={isViewMode ? "Exit View Mode" : "Enter View Mode"}
          >
            👁️
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
                  label: item.label ? 'Edit Label' : 'Add Label',
                  onClick: () => {
                    // Temporarily disable animation while editing
                    const wasAnimating = item.props.isAnimating;
                    if (wasAnimating) {
                      handleToggleArrowAnimation(contextMenu.itemId);
                    }

                    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                    // Create a temporary input element for editing
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = item.label || '';
                    input.style.position = 'absolute';
                    input.style.left = `${contextMenu.x}px`;
                    input.style.top = `${contextMenu.y}px`;
                    input.style.zIndex = '1000';
                    input.style.padding = '4px';
                    input.style.border = '1px solid #4a90e2';
                    input.style.borderRadius = '4px';
                    input.style.fontSize = '14px';
                    input.style.minWidth = '100px';

                    const handleKeyDown = (e: KeyboardEvent) => {
                      if (e.key === 'Enter') {
                        handleLabelChange(contextMenu.itemId, input.value);
                        cleanup();
                      } else if (e.key === 'Escape') {
                        cleanup();
                      }
                    };

                    const handleClickOutside = (e: MouseEvent) => {
                      if (e.target !== input) {
                        handleLabelChange(contextMenu.itemId, input.value);
                        cleanup();
                      }
                    };

                    const cleanup = () => {
                      input.remove();
                      document.removeEventListener('keydown', handleKeyDown);
                      document.removeEventListener('mousedown', handleClickOutside);
                      // Restore animation state if it was enabled before
                      if (wasAnimating) {
                        handleToggleArrowAnimation(contextMenu.itemId);
                      }
                    };

                    document.body.appendChild(input);
                    input.focus();
                    input.select();

                    document.addEventListener('keydown', handleKeyDown);
                    document.addEventListener('mousedown', handleClickOutside);
                  }
                },
                {
                  label: 'Curve',
                  submenu: [
                    {
                      label: 'Straight',
                      onClick: () => handleArrowCurve(contextMenu.itemId, 0),
                    },
                    {
                      label: 'Slight Up',
                      onClick: () => handleArrowCurve(contextMenu.itemId, 0.3),
                    },
                    {
                      label: 'Slight Down',
                      onClick: () => handleArrowCurve(contextMenu.itemId, -0.3),
                    },
                    {
                      label: 'Strong Up',
                      onClick: () => handleArrowCurve(contextMenu.itemId, 0.7),
                    },
                    {
                      label: 'Strong Down',
                      onClick: () => handleArrowCurve(contextMenu.itemId, -0.7),
                    },
                  ],
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
                {
                  label: 'Edit Code',
                  onClick: () => {
                    setItemsWithHistory(prevItems =>
                      prevItems.map(prevItem =>
                        prevItem.id === contextMenu.itemId
                          ? {
                              ...prevItem,
                              props: {
                                ...prevItem.props,
                                showEditor: true
                              }
                            }
                          : prevItem
                      )
                    );
                    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                  },
                  disabled: isViewMode
                },
                {
                  label: item.label ? 'Edit Label' : 'Add Label',
                  onClick: () => {
                    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                    // Create a temporary input element for editing
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = item.label || '';
                    input.style.position = 'absolute';
                    input.style.left = `${contextMenu.x}px`;
                    input.style.top = `${contextMenu.y}px`;
                    input.style.zIndex = '1000';
                    input.style.padding = '4px';
                    input.style.border = '1px solid #4a90e2';
                    input.style.borderRadius = '4px';
                    input.style.fontSize = '14px';
                    input.style.minWidth = '100px';

                    const handleKeyDown = (e: KeyboardEvent) => {
                      if (e.key === 'Enter') {
                        setItemsWithHistory(prevItems =>
                          prevItems.map(prevItem =>
                            prevItem.id === contextMenu.itemId
                              ? {
                                  ...prevItem,
                                  label: input.value
                                }
                              : prevItem
                          )
                        );
                        cleanup();
                      } else if (e.key === 'Escape') {
                        cleanup();
                      }
                    };

                    const handleClickOutside = (e: MouseEvent) => {
                      if (e.target !== input) {
                        setItemsWithHistory(prevItems =>
                          prevItems.map(prevItem =>
                            prevItem.id === contextMenu.itemId
                              ? {
                                  ...prevItem,
                                  label: input.value
                                }
                              : prevItem
                          )
                        );
                        cleanup();
                      }
                    };

                    const cleanup = () => {
                      input.remove();
                      document.removeEventListener('keydown', handleKeyDown);
                      document.removeEventListener('mousedown', handleClickOutside);
                    };

                    document.body.appendChild(input);
                    input.focus();
                    input.select();

                    document.addEventListener('keydown', handleKeyDown);
                    document.addEventListener('mousedown', handleClickOutside);
                  }
                },
                {
                  label: 'Remove Label',
                  onClick: () => {
                    setItemsWithHistory(prevItems =>
                      prevItems.map(prevItem =>
                        prevItem.id === contextMenu.itemId
                          ? {
                              ...prevItem,
                              label: undefined
                            }
                          : prevItem
                      )
                    );
                    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
                  },
                  disabled: !item.label
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

            // For text items, only show base items
            if (item.type === 'text') {
              return [
                {
                  label: item.props?.hasBorder !== false ? 'Remove Border' : 'Add Border',
                  onClick: () => handleToggleTextBorder(contextMenu.itemId),
                },
                ...baseItems,
              ];
            }

            if (item.type === 'database') {
              return [
                {
                  label: 'Add Label',
                  onClick: () => handleLabelChange(contextMenu.itemId, ''),
                },
                ...baseItems,
              ];
            }

            return [
              {
                label: 'Add Label',
                onClick: () => handleLabelChange(contextMenu.itemId, ''),
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
          isViewMode={isViewMode}
        />
      )}
    </div>
  );
};

export default DraggableContainer; 