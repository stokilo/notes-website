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
    setItems(prev => [...prev, newItem]);
  };


  const handleCommentChange = (itemId: string, comment: string, label: string) => {
    setItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.type === 'boxSetContainer' && item.props.children) {
          const updatedChildren = item.props.children.map(child => 
            child.id === itemId 
              ? { ...child, comment, commentLabel: label }
              : child
          );
          
          // If we found and updated the child, return the updated container
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
        
        // If this is the item itself (not a child of a container)
        return item.id === itemId 
          ? { ...item, comment, commentLabel: label }
          : item;
      });

      // Save to localStorage after updating state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
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
    setItems(prevItems =>
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

  const addSingleBoxSet = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `boxSet-${Date.now()}`,
      type: 'boxSet',
      position,
      size: { width: 20, height: 20 },
      props: {},
      label: undefined,
    };
    setItems(prev => [...prev, newItem]);
  };

  const addSeparator = (position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `separator-${Date.now()}`,
      type: 'separator',
      position,
      size: { width: 2, height: 100 }, // Default size for separator
      props: { color: '#e0e0e0' },
    };
    setItems(prev => [...prev, newItem]);
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
    setItems(prev => [...prev, newItem]);
  };

  const handleToggleArrowAnimation = (itemId: string) => {
    setItems(prevItems => {
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
      
      // Save to localStorage after updating state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
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
        code: '// Your code here\nconst example = "Hello, World!";',
        language: 'typescript',
      },
    };
    setItems([...items, newItem]);
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
        <DraggableItem key={item.id} {...commonProps}>
          <ShikiCodeBlockItem
            width={item.size.width}
            height={item.size.height}
            code={item.props.code}
            language={item.props.language}
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
      {items.map(renderItem)}
      <DebugPanel />
      <ContextPanel
        onAddBox={() => addItem('box', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
        onAddCircle={() => addItem('circle', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
        onAddCodeBlock={() => addCodeBlock({ x: window.innerWidth / 2 - 20, y: window.innerHeight / 2 - 20 })}
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
      <TopContextPanel
        onAddSingleBoxSet={() => addSingleBoxSet({ x: window.innerWidth / 2 - 10, y: window.innerHeight / 2 - 10 })}
        onAddSeparator={() => addSeparator({ x: window.innerWidth / 2 - 1, y: window.innerHeight / 2 - 50 })}
        onAddArrow={() => addArrow({ x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 20 })}
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