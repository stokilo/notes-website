import React, { useState } from 'react';
import {
  FolderIcon,
  FolderOpenIcon,
  TypeScriptIcon,
  JavaScriptIcon,
  HtmlIcon,
  CssIcon,
  JsonIcon,
  MarkdownIcon,
  ImageIcon,
  DefaultFileIcon,
  JavaIcon
} from '../icons/FileIcons';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FolderStructureItemProps {
  width?: number;
  height?: number;
  data?: FileNode[];
  onDataChange?: (newData: FileNode[]) => void;
  isViewMode?: boolean;
}

const FolderStructureItem: React.FC<FolderStructureItemProps> = ({
  width = 300,
  height = 400,
  data = [
    {
      id: 'root',
      name: 'Project',
      type: 'folder',
      isExpanded: true,
      children: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          isExpanded: true,
          children: [
            { id: 'index.ts', name: 'index.ts', type: 'file' },
            { id: 'app.ts', name: 'app.ts', type: 'file' }
          ]
        },
        {
          id: 'public',
          name: 'public',
          type: 'folder',
          isExpanded: true,
          children: [
            { id: 'index.html', name: 'index.html', type: 'file' }
          ]
        }
      ]
    }
  ],
  onDataChange,
  isViewMode = false
}) => {
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleToggleExpand = (nodeId: string) => {
    if (isViewMode) return;
    
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    onDataChange?.(updateNode(data));
  };

  const handleStartEdit = (node: FileNode) => {
    if (isViewMode) return;
    setEditingNode(node.id);
    setEditValue(node.name);
  };

  const handleEditComplete = () => {
    if (!editingNode) return;

    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === editingNode) {
          return { ...node, name: editValue };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    onDataChange?.(updateNode(data));
    setEditingNode(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setEditingNode(null);
    }
  };

  const handleAddItem = (parentId: string, type: 'file' | 'folder') => {
    const newId = `${type}-${Date.now()}`;
    const newName = type === 'folder' ? 'New Folder' : 'New File';

    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [
              ...(node.children || []),
              {
                id: newId,
                name: newName,
                type,
                ...(type === 'folder' ? { children: [], isExpanded: true } : {})
              }
            ]
          };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    onDataChange?.(updateNode(data));
    setEditingNode(newId);
    setEditValue(newName);
  };

  const handleRemoveItem = (nodeId: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => {
        if (node.id === nodeId) {
          return false;
        }
        if (node.children) {
          node.children = updateNode(node.children);
        }
        return true;
      });
    };

    onDataChange?.(updateNode(data));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts':
      case 'tsx':
        return <TypeScriptIcon size={20} />;
      case 'js':
      case 'jsx':
        return <JavaScriptIcon size={20} />;
      case 'java':
        return <JavaIcon size={20} />;
      case 'html':
        return <HtmlIcon size={20} />;
      case 'css':
        return <CssIcon size={20} />;
      case 'json':
        return <JsonIcon size={20} />;
      case 'md':
        return <MarkdownIcon size={20} />;
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <ImageIcon size={20} />;
      default:
        return <DefaultFileIcon size={20} />;
    }
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = node.isExpanded ?? true;
    const isEditing = editingNode === node.id;

    return (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            cursor: isViewMode ? 'default' : 'pointer',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease'
          }}
        >
          {isFolder && (
            <span
              onClick={() => handleToggleExpand(node.id)}
              style={{
                marginRight: '8px',
                cursor: isViewMode ? 'default' : 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isExpanded ? <FolderOpenIcon size={20} /> : <FolderIcon size={20} />}
            </span>
          )}
          {!isFolder && (
            <span 
              style={{ 
                marginRight: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {getFileIcon(node.name)}
            </span>
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '2px 4px',
                fontSize: '14px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
            />
          ) : (
            <span
              onDoubleClick={() => handleStartEdit(node)}
              style={{ 
                fontSize: '14px',
                color: isFolder ? '#2196F3' : '#333',
                fontWeight: isFolder ? 500 : 400,
                flex: 1
              }}
            >
              {node.name}
            </span>
          )}

          {!isViewMode && (
            <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
              {isFolder && (
                <>
                  <button
                    onClick={() => handleAddItem(node.id, 'folder')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#2196F3',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Add Folder"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleAddItem(node.id, 'file')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#4CAF50',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Add File"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(node.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#f44336',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Remove"
                  >
                    -
                  </button>
                </>
              )}
              {!isFolder && (
                <button
                  onClick={() => handleRemoveItem(node.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#f44336',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  title="Remove"
                >
                  -
                </button>
              )}
            </div>
          )}
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: 'transparent',
        borderRadius: '8px',
        padding: '16px',
        overflow: 'auto'
      }}
    >
      {data.map(node => renderNode(node))}
    </div>
  );
};

export default FolderStructureItem; 