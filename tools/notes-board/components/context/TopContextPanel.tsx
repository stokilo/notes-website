import React, { useState } from 'react';
import BoxSetItem from '../items/BoxSetItem';
import SeparatorItem from '../items/SeparatorItem';
import ArrowItem from '../items/ArrowItem';
import CirclesPathItem from '../items/CirclesPathItem';
import TwoPointsPathItem from '../items/TwoPointsPathItem';
import ShikiCodeBlockItem from '../items/ShikiCodeBlockItem';
import { FolderIcon, DatabaseIcon } from '../icons/FileIcons';
import IconSearchDialog from '../dialog/IconSearchDialog';

interface TopContextPanelProps {
  onAddSingleBoxSet: () => void;
  onAddSeparator: () => void;
  onAddArrow: () => void;
  onAddCirclesPath: () => void;
  onAddTwoPointsPath: () => void;
  onAddCodeBlock: (position: { x: number; y: number }) => void;
  onAddGrid: () => void;
  onAddText: (position: { x: number; y: number }) => void;
  onAddFolderStructure: (position: { x: number; y: number }) => void;
  onAddDatabase: (position: { x: number; y: number }) => void;
  onAddIcon: (position: { x: number; y: number }, iconName: string) => void;
}

const TopContextPanel: React.FC<TopContextPanelProps> = ({
  onAddSingleBoxSet,
  onAddSeparator,
  onAddArrow,
  onAddCirclesPath,
  onAddTwoPointsPath,
  onAddCodeBlock,
  onAddGrid,
  onAddText,
  onAddFolderStructure,
  onAddDatabase,
  onAddIcon,
}) => {
  const [showIconSearch, setShowIconSearch] = useState(false);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          zIndex: 1000,
        }}
      >
        <div
          onClick={onAddSingleBoxSet}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <BoxSetItem width={24} height={24} />
        </div>
        <div
          onClick={onAddSeparator}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <SeparatorItem width={2} height={24} />
        </div>
        <div
          onClick={onAddArrow}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <ArrowItem width={48} height={16} animated={false} />
        </div>
        <div
          onClick={onAddCirclesPath}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ width: 48, height: 24, position: 'relative' }}>
            <CirclesPathItem 
              width={48} 
              height={24} 
              isAnimating={true}
              position={{ x: 0, y: 0 }}
            />
          </div>
        </div>
        <div
          onClick={onAddTwoPointsPath}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ width: 48, height: 24, position: 'relative' }}>
            <TwoPointsPathItem 
              width={48} 
              height={24} 
              isAnimating={true}
              position={{ x: 0, y: 0 }}
            />
          </div>
        </div>
        <div
          onClick={() => onAddCodeBlock({ x: window.innerWidth / 2 - 20, y: window.innerHeight / 2 - 20 })}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ width: 48, height: 24, position: 'relative' }}>
            <ShikiCodeBlockItem 
              width={48} 
              height={24}
              language="java"
              isPreview={true}
            />
          </div>
        </div>
        <div
          onClick={() => onAddText({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 20 })}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ width: 48, height: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>T</span>
          </div>
        </div>
        <div
          onClick={() => onAddFolderStructure({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 200 })}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ width: 48, height: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderIcon size={24} />
          </div>
        </div>
        <div
          onClick={() => onAddDatabase({ x: window.innerWidth / 2 - 32, y: window.innerHeight / 2 - 32 })}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <DatabaseIcon size={32} color="#4a90e2" />
        </div>
        <div
          onClick={() => setShowIconSearch(true)}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ width: 48, height: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>🔍</span>
          </div>
        </div>
      </div>

      {showIconSearch && (
        <IconSearchDialog
          onClose={() => setShowIconSearch(false)}
          onSelect={(iconName) => {
            onAddIcon(
              { x: window.innerWidth / 2 - 32, y: window.innerHeight / 2 - 32 },
              iconName
            );
            setShowIconSearch(false);
          }}
        />
      )}
    </>
  );
};

export default TopContextPanel; 