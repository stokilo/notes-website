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
  type: 'box' | 'circle' | 'boxSet' | 'boxSetContainer' | 'separator' | 'arrow' | 'codeBlock';
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
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

  // Load scene and history from localStorage on initial mount
  useEffect(() => {
    console.log('Attempting to load saved scene...');
    const savedScene = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    
    if (savedScene) {
      try {
        const parsedScene = JSON.parse(savedScene);
        console.log('Successfully loaded scene:', parsedScene);
        setItems(parsedScene);
        // Initialize history with the loaded scene
        setHistory([parsedScene]);
        setHistoryIndex(0);
      } catch (error) {
        console.error('Error loading saved scene:', error);
        // Reset to empty state if loading fails
        setItems([]);
        setHistory([[]]);
        setHistoryIndex(0);
      }
    } else {
      console.log('No saved scene found in localStorage');
      // Initialize with empty state
      setItems([]);
      setHistory([[]]);
      setHistoryIndex(0);
    }

    // Only load history if it matches the current scene
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          // Check if the last history state matches the current scene
          const lastHistoryState = parsedHistory[parsedHistory.length - 1];
          const currentScene = JSON.parse(savedScene || '[]');
          if (JSON.stringify(lastHistoryState) === JSON.stringify(currentScene)) {
            setHistory(parsedHistory);
            setHistoryIndex(parsedHistory.length - 1);
          } else {
            // If history doesn't match, reset it
            setHistory([currentScene]);
            setHistoryIndex(0);
          }
        }
      } catch (error) {
        console.error('Error loading saved history:', error);
        // Reset history if loading fails
        setHistory([JSON.parse(savedScene || '[]')]);
        setHistoryIndex(0);
      }
    }
  }, []);

  // Save scene and history to localStorage whenever they change
  useEffect(() => {
    if (items.length > 0) {
      console.log('Saving scene to localStorage:', items);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [items]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } else {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, [history]);

  // Handle scene reset
  const handleClearScene = () => {
    if (window.confirm('Are you sure you want to clear the entire scene? This action cannot be undone.')) {
      setItems([]);
      setSelectedItemId(null);
      setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
      setCopiedItem(null);
      // Reset history when clearing scene
      setHistory([[]]);
      setHistoryIndex(0);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  // Add current state to history
  const addToHistory = (newItems: DraggableItem[]) => {
    if (!newItems) {
      console.log('Cannot add to history - newItems is undefined');
      return;
    }
    
    console.log('Adding to history:', {
      currentHistoryLength: history.length,
      currentHistoryIndex: historyIndex,
      newItemsLength: newItems.length,
      newItems
    });

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
      
      console.log('History updated', { 
        newHistoryLength: trimmedHistory.length,
        newHistoryIndex: trimmedHistory.length - 1,
        addedState: stateToAdd
      });
      
      return trimmedHistory;
    });
  };

  // Handle undo
  const handleUndo = () => {
    console.log('Undo triggered', { historyIndex, historyLength: history.length });
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      console.log('Previous state found', { 
        newIndex, 
        previousState,
        historyLength: history.length,
        currentItems: items
      });
      
      if (previousState) {
        // Create a deep copy of the previous state
        const restoredState = JSON.parse(JSON.stringify(previousState));
        
        // Update both states atomically
        setHistoryIndex(newIndex);
        setItems(restoredState);
        
        console.log('State restored to previous version', {
          from: items,
          to: restoredState
        });
      }
    } else {
      console.log('Cannot undo - no history available');
    }
  };

  // Wrap setItems to automatically add to history
  const setItemsWithHistory = (newItems: DraggableItem[] | ((prev: DraggableItem[]) => DraggableItem[])) => {
    setItems(prevItems => {
      const nextItems = typeof newItems === 'function' ? newItems(prevItems) : newItems;
      
      // Only add to history if there are actual changes
      if (JSON.stringify(nextItems) !== JSON.stringify(prevItems)) {
        console.log('Adding to history via setItemsWithHistory', { 
          prevItemsLength: prevItems.length, 
          nextItemsLength: nextItems.length,
          prevItems,
          nextItems
        });
        addToHistory(nextItems);
      }
      
      return nextItems;
    });
  };

  const handleCopy = (itemId: string) => {
    const itemToCopy = items.find(item => item.id === itemId);
    if (itemToCopy) {
      setCopiedItem(itemToCopy);
      console.log('Item copied:', itemToCopy);
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
    console.log('Item pasted:', newItem);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CMD+Z (Mac) or CTRL+Z (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        console.log('CMD+Z/CTRL+Z detected', {
          historyIndex,
          historyLength: history.length,
          currentItems: items
        });
        e.preventDefault();
        handleUndo();
      }
      // Check for CMD+C (Mac) or CTRL+C (Windows)
      else if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        if (selectedItemId) {
          handleCopy(selectedItemId);
        }
      }
      // Check for CMD+V (Mac) or CTRL+V (Windows)
      else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
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
      else if (selectedItemId) {
        const selectedItem = items.find(item => item.id === selectedItemId);
        if (selectedItem?.type === 'arrow') {
          switch (e.key) {
            case 'r':
              if (e.shiftKey) {
                // Shift + R: Rotate 90° counter-clockwise
                handleRotateArrow(selectedItemId, -90);
              } else {
                // R: Rotate 90° clockwise
                handleRotateArrow(selectedItemId, 90);
              }
              e.preventDefault();
              break;
            case 'e':
              if (e.shiftKey) {
                // Shift + E: Rotate 45° counter-clockwise
                handleRotateArrow(selectedItemId, -45);
              } else {
                // E: Rotate 45° clockwise
                handleRotateArrow(selectedItemId, 45);
              }
              e.preventDefault();
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, copiedItem, items, historyIndex, history, handleUndo]);

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

  const handleDragStart = (id: string, position: { x: number; y: number }) => {
    console.log('Drag start:', { id, position });
    setIsDragging(true);
    dragStartPosition.current = position;
    dragStartItems.current = JSON.parse(JSON.stringify(items));
  };

  const handleDragEnd = (id: string, position: { x: number; y: number }) => {
    console.log('Drag end:', { id, position, isDragging });
    if (isDragging && dragStartPosition.current) {
      // Only add to history if the item was actually moved
      const movedItem = items.find(item => item.id === id);
      const startItem = dragStartItems.current.find(item => item.id === id);
      
      if (movedItem && startItem && 
          (movedItem.position.x !== startItem.position.x || 
           movedItem.position.y !== startItem.position.y)) {
        console.log('Adding drag end to history - item was moved');
        addToHistory(items);
      }
    }
    
    setIsDragging(false);
    dragStartPosition.current = null;
    dragStartItems.current = [];
  };

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    );
  };

  const handleSizeChange = (id: string, newSize: { width: number; height: number }) => {
    console.log('Size change:', { id, newSize });
    setIsResizing(true);
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, size: newSize } : item
      )
    );
  };

  const handleResizeEnd = () => {
    console.log('Resize end');
    setIsResizing(false);
    // Add the final size to history
    addToHistory(items);
  };

  const addItem = (type: 'box' | 'circle' , position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      size: { width: 100, height: 100 },
      props: type === 'box'
        ? { color: '#4a90e2', size: 100, height: 80 } 
        : type === 'circle'
        ? { width: 100, length: 200 }
        : { width: 100, height: 100 },
      label: undefined
    };
    setItemsWithHistory(prev => [...prev, newItem]);
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
    setSelectedItemId(itemId);
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

  const handleClick = (e: React.MouseEvent) => {
    // Only clear selection if clicking directly on the container
    if (e.target === containerRef.current) {
      setSelectedItemId(null);
      setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
    }
  };

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setSelectedItemId(itemId);
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
    const newItem: DraggableItem = {
      id: generateId(),
      type: 'codeBlock',
      position,
      size: { width: 40, height: 40 },
      props: {
        url: 'https://raw.githubusercontent.com/stokilo/notes-website/refs/heads/main/chapters/keycloak/chapter3-custom-scopes/src/main/java/org/sstec/resourceserver/SecurityConfig.java',
        language: 'java',
      },
    };
    setItemsWithHistory([...items, newItem]);
  };

  const renderItem = (item: DraggableItem) => {
    const commonProps = {
      id: item.id,
      initialPosition: item.position,
      initialSize: item.size,
      onPositionChange: (pos: { x: number; y: number }) => handlePositionChange(item.id, pos),
      onSizeChange: (size: { width: number; height: number }) => handleSizeChange(item.id, size),
      onResizeEnd: handleResizeEnd,
      onDragStart: (pos: { x: number; y: number }) => handleDragStart(item.id, pos),
      onDragEnd: (pos: { x: number; y: number }) => handleDragEnd(item.id, pos),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, item.id),
      onClick: (e: React.MouseEvent) => handleItemClick(e, item.id),
      isSelected: item.id === selectedItemId,
      zoom: zoom,
    };

    if (item.type === 'boxSetContainer') {
      const containerboxSetes = item.props.children || [];
      return (
        <DraggableItem key={item.id} {...commonProps}>
          <BoxGridContainer width={item.size.width} height={item.size.height} containerId={item.id}>
          </BoxGridContainer>
        </DraggableItem>
      );
    }

    if (item.type === 'codeBlock') {
      return (
        <DraggableItem key={item.id} {...commonProps} disableAnimations={true}>
          <ShikiCodeBlockItem
            width={item.size.width}
            height={item.size.height}
            code={item.props.code}
            url={item.props.url}
            language={item.props.language}
            showPreview={item.id === codePreviewItemId}
            onClosePreview={() => setCodePreviewItemId(null)}
          />
        </DraggableItem>
      );
    }

    return (
      <DraggableItem key={item.id} {...commonProps}>
        {item.type === 'box' ? (
          <RectangleItem
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        ) : item.type === 'circle' ? (
          <CircleItem
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        ) : item.type === 'boxSet' ? (
          <BoxSetItem
            width={item.size.width}
            height={item.size.height}
            comment={item.comment}
            commentLabel={item.commentLabel}
          />
        ) : item.type === 'separator' ? (
          <SeparatorItem
            width={item.size.width}
            height={item.size.height}
            color={item.props.color}
          />
        ) : item.type === 'arrow' ? (
          <ArrowItem
            width={item.size.width}
            height={item.size.height}
            segments={item.props.segments}
            rotation={item.props.rotation}
            isAnimating={item.props.isAnimating}
          />
        ) : (
          <span>nothing here</span>
        )}
      </DraggableItem>
    );
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