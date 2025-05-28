import React from 'react';
import BoxSetItem from '../items/BoxSetItem';
import SeparatorItem from '../items/SeparatorItem';
import ArrowItem from '../items/ArrowItem';
import CirclesPathItem from '../items/CirclesPathItem';
import TwoPointsPathItem from '../items/TwoPointsPathItem';
import ShikiCodeBlockItem from '../items/ShikiCodeBlockItem';

interface TopContextPanelProps {
  onAddSingleBoxSet: () => void;
  onAddSeparator: () => void;
  onAddArrow: () => void;
  onAddCirclesPath: () => void;
  onAddTwoPointsPath: () => void;
  onAddMarkdownEditor: (position: { x: number; y: number }) => void;
  onAddGrid: () => void;
}

const TopContextPanel: React.FC<TopContextPanelProps> = ({
  onAddSingleBoxSet,
  onAddSeparator,
  onAddArrow,
  onAddCirclesPath,
  onAddTwoPointsPath,
  onAddMarkdownEditor,
  onAddGrid,
}) => {
  return (
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
        <ArrowItem width={48} height={16} segments={3} />
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
        onClick={() => onAddMarkdownEditor({ x: window.innerWidth / 2 - 20, y: window.innerHeight / 2 - 20 })}
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
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
};

export default TopContextPanel; 