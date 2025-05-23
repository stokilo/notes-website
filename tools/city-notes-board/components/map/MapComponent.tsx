import React, { useState, useEffect, useRef } from 'react';

interface MapComponentProps {
  width?: number;
  height?: number;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

interface Building {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  comment?: string;
  commentLabel?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  width = 400,
  height = 400,
  label,
  onLabelChange,
}) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [isAddingBuilding, setIsAddingBuilding] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Generate initial buildings
  useEffect(() => {
    const initialBuildings: Building[] = Array.from({ length: 15 }, (_, i) => ({
      id: `building-${i}`,
      x: Math.random() * (width - 60),
      y: Math.random() * (height - 60),
      width: 40 + Math.random() * 40,
      height: 40 + Math.random() * 40,
      color: `hsl(${Math.random() * 360}, 70%, 80%)`,
    }));
    setBuildings(initialBuildings);
  }, [width, height]);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isAddingBuilding || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      x,
      y,
      width: 60,
      height: 60,
      color: `hsl(${Math.random() * 360}, 70%, 80%)`,
    };

    setBuildings(prev => [...prev, newBuilding]);
    setIsAddingBuilding(false);
  };

  const handleBuildingClick = (buildingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBuilding(buildingId);
  };

  const handleAddBuilding = () => {
    setIsAddingBuilding(true);
  };

  const handleAddComment = (buildingId: string, comment: string, commentLabel: string) => {
    setBuildings(prev =>
      prev.map(building =>
        building.id === buildingId
          ? { ...building, comment, commentLabel }
          : building
      )
    );
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          {label}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#e8f4f8',
          position: 'relative',
          overflow: 'hidden',
          cursor: isAddingBuilding ? 'crosshair' : 'default',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        onClick={handleMapClick}
      >
        {/* Buildings */}
        {buildings.map(building => (
          <div
            key={building.id}
            style={{
              position: 'absolute',
              left: building.x,
              top: building.y,
              width: building.width,
              height: building.height,
              backgroundColor: building.color,
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: selectedBuilding === building.id ? '2px solid #4a90e2' : 'none',
            }}
            onClick={(e) => handleBuildingClick(building.id, e)}
          >
            {/* Comment indicator */}
            {building.comment && (
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  zIndex: 1001,
                }}
              >
                {building.commentLabel || 'Comment'}
              </div>
            )}
          </div>
        ))}

        {/* Add Building Button */}
        <button
          onClick={handleAddBuilding}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            padding: '8px 16px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
          }}
        >
          Add Building
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
