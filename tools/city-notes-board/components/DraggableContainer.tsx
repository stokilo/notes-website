import React, { useState, useEffect, useRef } from 'react';
import DraggableItem from './DraggableItem';
import DebugPanel from './DebugPanel';
import ContextPanel from './ContextPanel';
import IsometricBuilding from './IsometricBuilding';
import IsometricStreet from './IsometricStreet';
import Grass from './Grass';
import QuestionBox from './QuestionBox';
import ContextMenu from './ContextMenu';
import CommentEditor from './CommentEditor';

interface DraggableContainerProps {
  className?: string;
}

interface DraggableItem {
  id: string;
  type: 'building' | 'street' | 'grass' | 'questionBox';
  position: { x: number; y: number };
  size: { width: number; height: number };
  props?: any;
  label?: string;
  comment?: string;
  commentLabel?: string;
}

const STORAGE_KEY = 'city-notes-scene';

const DraggableContainer: React.FC<DraggableContainerProps> = ({ className = '' }) => {
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    itemId: string;
  }>({ show: false, x: 0, y: 0, itemId: '' });
  const [copiedItem, setCopiedItem] = useState<DraggableItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [commentEditor, setCommentEditor] = useState<{
    show: boolean;
    itemId: string;
    position: { x: number; y: number };
  }>({ show: false, itemId: '', position: { x: 0, y: 0 } });

  // Load scene from localStorage on initial mount
  useEffect(() => {
    console.log('Attempting to load saved scene...');
    const savedScene = localStorage.getItem(STORAGE_KEY);
    if (savedScene) {
      try {
        const parsedScene = JSON.parse(savedScene);
        console.log('Successfully loaded scene:', parsedScene);
        setItems(parsedScene);
      } catch (error) {
        console.error('Error loading saved scene:', error);
      }
    } else {
      console.log('No saved scene found in localStorage');
    }
  }, []);

  // Save scene to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      console.log('Saving scene to localStorage:', items);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

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

    setItems(prev => [...prev, newItem]);
    console.log('Item pasted:', newItem);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CMD+C (Mac) or CTRL+C (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
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
    };

    // Add event listener to the document instead of window
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, copiedItem, items]); // Add items to dependencies

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    );
  };

  const handleSizeChange = (id: string, newSize: { width: number; height: number }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, size: newSize } : item
      )
    );
  };

  const addItem = (type: 'building' | 'street' | 'grass', position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      size: { width: 100, height: 100 },
      props: type === 'building' 
        ? { color: '#4a90e2', size: 100, height: 80 } 
        : type === 'street'
        ? { width: 100, length: 200 }
        : { width: 100, height: 100 },
      label: undefined
    };
    setItems(prev => [...prev, newItem]);
  };

  const addQuestionBox = (position: { x: number; y: number }) => {
    // Find all existing question boxes for this position
    const existingBoxes = items.filter(item => 
      item.type === 'questionBox' && 
      Math.abs(item.position.x - position.x) < 10
    );

    // Calculate the new position based on existing boxes
    const verticalOffset = 50; // Space between boxes
    const newY = position.y + (existingBoxes.length * verticalOffset);

    const newItem: DraggableItem = {
      id: `questionBox-${Date.now()}`,
      type: 'questionBox',
      position: { ...position, y: newY },
      size: { width: 40, height: 40 },
      props: {},
      label: undefined
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleCommentChange = (itemId: string, comment: string, label: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, comment, commentLabel: label } : item
      )
    );
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
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, label: newLabel } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
  };

  const renderItem = (item: DraggableItem) => {
    const commonProps = {
      id: item.id,
      initialPosition: item.position,
      initialSize: item.size,
      onPositionChange: (pos: { x: number; y: number }) => handlePositionChange(item.id, pos),
      onSizeChange: (size: { width: number; height: number }) => handleSizeChange(item.id, size),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, item.id),
      onClick: (e: React.MouseEvent) => handleItemClick(e, item.id),
      isSelected: item.id === selectedItemId,
    };

    return (
      <DraggableItem key={item.id} {...commonProps}>
        {item.type === 'building' ? (
          <IsometricBuilding 
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        ) : item.type === 'street' ? (
          <IsometricStreet 
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        ) : item.type === 'questionBox' ? (
          <QuestionBox
            width={item.size.width}
            height={item.size.height}
            label={item.label}
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        ) : (
          <Grass
            {...item.props}
            width={item.size.width}
            height={item.size.height}
            label={item.label}
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
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
      {items.map(renderItem)}
      <DebugPanel />
      <ContextPanel
        onAddBuilding={() => addItem('building', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
        onAddStreet={() => addItem('street', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
        onClearScene={() => {
          if (window.confirm('Are you sure you want to clear the entire scene? This action cannot be undone.')) {
            setItems([]);
            setSelectedItemId(null);
            setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
            setCopiedItem(null);
            localStorage.removeItem(STORAGE_KEY);
          }
        }}
      />
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

            if (item.type === 'questionBox') {
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

            return [
              {
                label: 'Add Label',
                onClick: () => {
                  handleLabelChange(contextMenu.itemId, '');
                },
              },
              {
                label: 'Add Question Box',
                onClick: () => {
                  const offset = 50;
                  const newPosition = {
                    x: item.position.x + item.size.width + offset,
                    y: item.position.y,
                  };
                  addQuestionBox(newPosition);
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
          initialContent={items.find(i => i.id === commentEditor.itemId)?.comment}
          initialLabel={items.find(i => i.id === commentEditor.itemId)?.commentLabel}
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