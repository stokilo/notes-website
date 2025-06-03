import React, { useState, useEffect } from 'react';

interface IconSearchDialogProps {
  onClose: () => void;
  onSelect: (iconName: string) => void;
}

interface IconInfo {
  name: string;
  prefix: string;
}

// Popular icon sets to search through
const ICON_SETS = [
  'mdi', // Material Design Icons
  'fa',  // Font Awesome
  'bi',  // Bootstrap Icons
  'ri',  // Remix Icons
  'ph',  // Phosphor Icons
  'tabler', // Tabler Icons
  'heroicons', // Heroicons
  'carbon', // Carbon Icons
  'ant-design', // Ant Design Icons
  'fluent', // Fluent UI Icons
];

const IconSearchDialog: React.FC<IconSearchDialogProps> = ({ onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IconInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    const searchIcons = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(searchQuery)}&limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.icons.map((icon: string) => {
            const [prefix, name] = icon.split(':');
            return { prefix, name };
          }));
        }
      } catch (error) {
        console.error('Error searching icons:', error);
        setSearchResults([]);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(searchIcons, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleIconSelect = (icon: IconInfo) => {
    const iconId = `${icon.prefix}:${icon.name}`;
    setSelectedIcon(iconId);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0, color: '#333' }}>Search Icons</h2>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for icons..."
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '12px',
            overflowY: 'auto',
            maxHeight: 'calc(80vh - 200px)',
            padding: '8px',
          }}
        >
          {isLoading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
              Loading...
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
              {searchQuery ? 'No icons found' : 'Start typing to search icons'}
            </div>
          ) : (
            searchResults.map((icon) => {
              const iconId = `${icon.prefix}:${icon.name}`;
              return (
                <div
                  key={iconId}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedIcon === iconId ? '#e3f2fd' : 'transparent',
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={() => handleIconSelect(icon)}
                >
                  <img
                    src={`https://api.iconify.design/${iconId}.svg`}
                    alt={icon.name}
                    style={{ width: '32px', height: '32px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                    {icon.name}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => selectedIcon && onSelect(selectedIcon)}
            disabled={!selectedIcon}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: selectedIcon ? '#4a90e2' : '#ccc',
              color: 'white',
              cursor: selectedIcon ? 'pointer' : 'not-allowed',
            }}
          >
            Select Icon
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconSearchDialog; 