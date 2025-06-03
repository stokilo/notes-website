import React, { useEffect, useRef, useState } from 'react';

interface MenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  submenu?: MenuItem[];
}

interface ContextMenuProps {
  items: MenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose,
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuActive = activeSubmenu === index;

    return (
      <div key={index} style={{ position: 'relative' }}>
        <button
          onClick={() => {
            if (hasSubmenu) {
              setActiveSubmenu(isSubmenuActive ? null : index);
            } else if (item.onClick) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          style={{
            width: '100%',
            padding: '8px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            textAlign: 'left',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            color: item.disabled ? '#999' : '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
          }}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmenuActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {item.icon}
            <span>{item.label}</span>
          </div>
          {hasSubmenu && (
            <span style={{ marginLeft: '8px' }}>▶</span>
          )}
        </button>
        {hasSubmenu && isSubmenuActive && (
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              minWidth: '200px',
              zIndex: 1001,
            }}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            {item.submenu!.map((subItem, subIndex) => (
              <button
                key={subIndex}
                onClick={() => {
                  if (subItem.onClick) {
                    subItem.onClick();
                    onClose();
                  }
                }}
                disabled={subItem.disabled}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: subItem.disabled ? 'not-allowed' : 'pointer',
                  color: subItem.disabled ? '#999' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  if (!subItem.disabled) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {subItem.icon}
                <span>{subItem.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className={`context-menu ${className}`}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        minWidth: '200px',
      }}
    >
      {items.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
};

export default ContextMenu; 