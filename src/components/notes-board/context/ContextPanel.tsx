import React from 'react';
import ContextButton from './ContextButton';
import { MdFileUpload, MdFileDownload } from 'react-icons/md';

interface ContextPanelProps {
  position: { x: number; y: number };
  onAddBox: () => void;
  onAddCircle: () => void;
  onClearScene: () => void;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
  onAddBox,
  onAddCircle,
  onClearScene,
  onClose,
  onExport,
  onImport,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000,
      }}
    >
      <ContextButton
        onClick={onAddBox}
        icon="/box.svg"
        text=""
        title="Add Building"
      />
      <ContextButton
        onClick={onAddCircle}
        icon="/circle.svg"
        text=""
        title="Add Street"
      />
      <div style={{ width: '100%', height: '1px', backgroundColor: '#ccc', margin: '4px 0' }} />
      <ContextButton
        onClick={onExport}
        icon={<MdFileDownload size={24} />}
        text=""
        title="Export Scene"
      />
      <ContextButton
        onClick={onImport}
        icon={<MdFileUpload size={24} />}
        text=""
        title="Import Scene"
      />
      <div style={{ width: '100%', height: '1px', backgroundColor: '#ccc', margin: '4px 0' }} />
      <ContextButton
        onClick={onClearScene}
        icon="/trash.svg"
        text=""
        title="Clear Scene"
        backgroundColor="#ff4444"
        textColor="white"
      />
    </div>
  );
};

export default ContextPanel; 