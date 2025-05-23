import React, { useState, useEffect, useRef } from 'react';
import ContextMenu from '../ContextMenu';
import CommentEditor from '../CommentEditor';

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
  color: { start: string; end: string };
  comment?: string;
  commentLabel?: string;
  originalData?: any;
  points: { x: number; y: number }[];
}

interface Street {
  id: string;
  points: { x: number; y: number }[];
  width: number;
  color: string;
  gradient: { start: string; end: string };
  dashArray: string;
  originalData?: any;
}

const MapComponent: React.FC<MapComponentProps> = ({
  width = 400,
  height = 400,
  label,
  onLabelChange,
}) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [center, setCenter] = useState({ lat: 50.0617, lng: 19.9373 }); // Kraków city center
  const [zoom, setZoom] = useState(17); // Adjusted zoom level for better city detail
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Fetch OpenStreetMap data
  useEffect(() => {
    const fetchMapData = async () => {
      setIsLoading(true);
      try {
        // Calculate bounding box
        const bbox = calculateBoundingBox(center, zoom, width, height);
        const bboxString = `${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}`;
        
        // Fetch buildings
        const buildingsResponse = await fetch(
          `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];` +
          `(way["building"](${bboxString}););` +
          `out body;>;out skel qt;`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!buildingsResponse.ok) {
          throw new Error(`HTTP error! status: ${buildingsResponse.status}`);
        }

        const buildingsData = await buildingsResponse.json();

        // Fetch streets
        const streetsResponse = await fetch(
          `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];` +
          `(way["highway"](${bboxString}););` +
          `out body;>;out skel qt;`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!streetsResponse.ok) {
          throw new Error(`HTTP error! status: ${streetsResponse.status}`);
        }

        const streetsData = await streetsResponse.json();

        // Process buildings
        const processedBuildings = processBuildings(buildingsData, bbox, width, height);
        setBuildings(processedBuildings);

        // Process streets
        const processedStreets = processStreets(streetsData, bbox, width, height);
        setStreets(processedStreets);
      } catch (error) {
        console.error('Error fetching map data:', error);
        // Fallback to random buildings if API fails
        const fallbackBuildings: Building[] = Array.from({ length: 15 }, (_, i) => ({
          id: `building-${i}`,
          x: Math.random() * (width - 60),
          y: Math.random() * (height - 60),
          width: 40 + Math.random() * 40,
          height: 40 + Math.random() * 40,
          color: { start: `hsl(${Math.random() * 360}, 70%, 85%)`, end: `hsl(${(Math.random() * 360 + 30) % 360}, 70%, 75%)` },
          points: [],
        }));
        setBuildings(fallbackBuildings);
        setStreets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, [center, zoom, width, height]);

  const calculateBoundingBox = (center: { lat: number; lng: number }, zoom: number, width: number, height: number) => {
    try {
      // Convert zoom level to meters per pixel
      const metersPerPixel = 156543.03392 * Math.cos(center.lat * Math.PI / 180) / Math.pow(2, zoom);
      
      // Calculate bounds in meters
      const widthMeters = width * metersPerPixel;
      const heightMeters = height * metersPerPixel;
      
      // Convert to lat/lng
      const latDelta = heightMeters / 111320; // 111320 meters per degree of latitude
      const lngDelta = widthMeters / (111320 * Math.cos(center.lat * Math.PI / 180));
      
      const bbox = {
        minLat: center.lat - latDelta / 2,
        maxLat: center.lat + latDelta / 2,
        minLng: center.lng - lngDelta / 2,
        maxLng: center.lng + lngDelta / 2,
      };

      // Validate bbox
      if (
        isNaN(bbox.minLat) || isNaN(bbox.maxLat) || isNaN(bbox.minLng) || isNaN(bbox.maxLng) ||
        bbox.minLat >= bbox.maxLat || bbox.minLng >= bbox.maxLng
      ) {
        throw new Error('Invalid bounding box calculated');
      }

      return bbox;
    } catch (error) {
      console.error('Error calculating bounding box:', error);
      // Return a default bounding box around the center point
      return {
        minLat: center.lat - 0.01,
        maxLat: center.lat + 0.01,
        minLng: center.lng - 0.01,
        maxLng: center.lng + 0.01,
      };
    }
  };

  const processBuildings = (data: any, bbox: any, width: number, height: number) => {
    const buildings: Building[] = [];
    const nodeMap = new Map();
    
    // First, create a map of all nodes
    data.elements.forEach((element: any) => {
      if (element.type === 'node') {
        nodeMap.set(element.id, { lat: element.lat, lon: element.lon });
      }
    });
    
    // Then process ways that are buildings
    data.elements.forEach((element: any) => {
      if (element.type === 'way' && element.tags && element.tags.building && element.nodes) {
        try {
          // Get coordinates for all nodes in this way
          const points = element.nodes
            .map((nodeId: number) => nodeMap.get(nodeId))
            .filter((node: any) => node && typeof node.lon === 'number' && typeof node.lat === 'number')
            .map((node: any) => ({
              x: ((node.lon - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * width,
              y: ((bbox.maxLat - node.lat) / (bbox.maxLat - bbox.minLat)) * height,
            }));

          if (points.length < 3) {
            console.warn('Building has less than 3 valid points, skipping');
            return;
          }

          // Calculate building bounds
          const bounds = points.reduce((acc: any, point: any) => ({
            minX: Math.min(acc.minX, point.x),
            maxX: Math.max(acc.maxX, point.x),
            minY: Math.min(acc.minY, point.y),
            maxY: Math.max(acc.maxY, point.y),
          }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

          // Validate bounds
          if (
            isNaN(bounds.minX) || isNaN(bounds.maxX) || isNaN(bounds.minY) || isNaN(bounds.maxY) ||
            bounds.minX === Infinity || bounds.maxX === -Infinity ||
            bounds.minY === Infinity || bounds.maxY === -Infinity
          ) {
            console.warn('Invalid bounds calculated for building, skipping');
            return;
          }

          const buildingWidth = bounds.maxX - bounds.minX;
          const buildingHeight = bounds.maxY - bounds.minY;

          // Skip buildings that are too small or too large
          if (buildingWidth < 1 || buildingHeight < 1 || buildingWidth > width || buildingHeight > height) {
            console.warn('Building dimensions out of bounds, skipping');
            return;
          }

          // Generate random gradient colors
          const hue = Math.random() * 360;
          const gradientColors = {
            start: `hsl(${hue}, 70%, 85%)`,
            end: `hsl(${(hue + 30) % 360}, 70%, 75%)`,
          };

          buildings.push({
            id: `building-${element.id}`,
            x: bounds.minX,
            y: bounds.minY,
            width: buildingWidth,
            height: buildingHeight,
            color: gradientColors,
            originalData: element,
            points: points,
          });
        } catch (error) {
          console.warn('Error processing building:', error);
        }
      }
    });

    return buildings;
  };

  const processStreets = (data: any, bbox: any, width: number, height: number) => {
    const streets: Street[] = [];
    const nodeMap = new Map();
    
    // First, create a map of all nodes
    data.elements.forEach((element: any) => {
      if (element.type === 'node') {
        nodeMap.set(element.id, { lat: element.lat, lon: element.lon });
      }
    });
    
    // Then process ways that are streets
    data.elements.forEach((element: any) => {
      if (element.type === 'way' && element.tags && element.tags.highway && element.nodes) {
        try {
          // Get coordinates for all nodes in this way
          const points = element.nodes
            .map((nodeId: number) => nodeMap.get(nodeId))
            .filter((node: any) => node && typeof node.lon === 'number' && typeof node.lat === 'number')
            .map((node: any) => ({
              x: ((node.lon - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * width,
              y: ((bbox.maxLat - node.lat) / (bbox.maxLat - bbox.minLat)) * height,
            }));

          if (points.length < 2) {
            console.warn('Street has less than 2 valid points, skipping');
            return;
          }

          // Validate points
          const hasInvalidPoints = points.some(point => 
            isNaN(point.x) || isNaN(point.y) ||
            point.x < 0 || point.x > width ||
            point.y < 0 || point.y > height
          );

          if (hasInvalidPoints) {
            console.warn('Street has invalid points, skipping');
            return;
          }

          // Generate road style based on highway type
          const roadStyle = getRoadStyle(element.tags.highway);

          streets.push({
            id: `street-${element.id}`,
            points,
            width: roadStyle.width,
            color: roadStyle.color,
            gradient: roadStyle.gradient,
            dashArray: roadStyle.dashArray,
            originalData: element,
          });
        } catch (error) {
          console.warn('Error processing street:', error);
        }
      }
    });

    return streets;
  };

  const getRoadStyle = (highwayType: string) => {
    switch (highwayType) {
      case 'motorway':
      case 'trunk':
        return {
          width: 12,
          color: '#4a4a4a',
          gradient: {
            start: '#666666',
            end: '#333333',
          },
          dashArray: 'none',
        };
      case 'primary':
        return {
          width: 10,
          color: '#666666',
          gradient: {
            start: '#777777',
            end: '#444444',
          },
          dashArray: 'none',
        };
      case 'secondary':
        return {
          width: 8,
          color: '#777777',
          gradient: {
            start: '#888888',
            end: '#555555',
          },
          dashArray: 'none',
        };
      case 'tertiary':
        return {
          width: 6,
          color: '#888888',
          gradient: {
            start: '#999999',
            end: '#666666',
          },
          dashArray: 'none',
        };
      case 'residential':
      case 'unclassified':
        return {
          width: 4,
          color: '#999999',
          gradient: {
            start: '#aaaaaa',
            end: '#777777',
          },
          dashArray: '2,2',
        };
      default:
        return {
          width: 3,
          color: '#aaaaaa',
          gradient: {
            start: '#bbbbbb',
            end: '#888888',
          },
          dashArray: '1,1',
        };
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (e.target === mapRef.current) {
      setSelectedBuilding(null);
    }
  };

  const handleBuildingClick = (buildingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBuilding(buildingId);
  };

  const handleAddComment = (buildingId: string, comment: string, commentLabel: string) => {
    setBuildings(prevBuildings =>
      prevBuildings.map(building =>
        building.id === buildingId
          ? { ...building, comment, commentLabel }
          : building
      )
    );
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: 'default',
        }}
        onClick={handleMapClick}
      >
        {isLoading ? (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#666',
              fontSize: '16px',
            }}
          >
            Loading map data...
          </div>
        ) : (
          <>
            {streets.map(street => (
              <svg
                key={street.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <defs>
                  <linearGradient
                    id={`road-gradient-${street.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={street.gradient.start} />
                    <stop offset="100%" stopColor={street.gradient.end} />
                  </linearGradient>
                </defs>
                {/* Road shadow */}
                <path
                  d={`M ${street.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="rgba(0, 0, 0, 0.2)"
                  strokeWidth={street.width + 2}
                  fill="none"
                  transform="translate(1, 1)"
                />
                {/* Road base */}
                <path
                  d={`M ${street.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke={`url(#road-gradient-${street.id})`}
                  strokeWidth={street.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={street.dashArray}
                />
                {/* Road highlight */}
                <path
                  d={`M ${street.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={street.width - 2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={street.dashArray}
                />
              </svg>
            ))}
            {buildings.map(building => (
              <div
                key={building.id}
                style={{
                  position: 'absolute',
                  left: building.x,
                  top: building.y,
                  width: building.width,
                  height: building.height,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  transform: selectedBuilding === building.id ? 'scale(1.05)' : 'scale(1)',
                  zIndex: selectedBuilding === building.id ? 2 : 1,
                }}
                onClick={(e) => handleBuildingClick(building.id, e)}
              >
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <defs>
                    <linearGradient
                      id={`gradient-${building.id}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={building.color.start} />
                      <stop offset="100%" stopColor={building.color.end} />
                    </linearGradient>
                  </defs>
                  {/* Building shadow */}
                  <path
                    d={`M ${building.points.map(p => `${p.x - building.x},${p.y - building.y}`).join(' L ')} Z`}
                    fill="rgba(0, 0, 0, 0.2)"
                    transform="translate(2, 2)"
                  />
                  {/* Building base with gradient */}
                  <path
                    d={`M ${building.points.map(p => `${p.x - building.x},${p.y - building.y}`).join(' L ')} Z`}
                    fill={`url(#gradient-${building.id})`}
                    stroke="#666"
                    strokeWidth="0.5"
                  />
                  {/* Building highlights */}
                  <path
                    d={`M ${building.points.map(p => `${p.x - building.x},${p.y - building.y}`).join(' L ')} Z`}
                    fill="rgba(255, 255, 255, 0.1)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="0.5"
                  />
                </svg>
                {building.comment && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      whiteSpace: 'nowrap',
                      zIndex: 3,
                    }}
                  >
                    {building.commentLabel && (
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                        {building.commentLabel}
                      </div>
                    )}
                    {building.comment}
                  </div>
                )}
              </div>
            ))}
            {selectedBuilding && (
              <ContextMenu
                items={[
                  {
                    label: 'Add Comment',
                    onClick: () => {
                      const building = buildings.find(b => b.id === selectedBuilding);
                      if (building) {
                        setShowCommentEditor(true);
                        setCommentPosition({
                          x: building.x + building.width / 2,
                          y: building.y - 40,
                        });
                      }
                    },
                  },
                ]}
                position={{
                  x: buildings.find(b => b.id === selectedBuilding)?.x || 0,
                  y: buildings.find(b => b.id === selectedBuilding)?.y || 0,
                }}
                onClose={() => setSelectedBuilding(null)}
              />
            )}
            {showCommentEditor && (
              <CommentEditor
                initialContent={buildings.find(b => b.id === selectedBuilding)?.comment || ''}
                initialLabel={buildings.find(b => b.id === selectedBuilding)?.commentLabel || ''}
                position={commentPosition}
                onSave={(content, label) => {
                  if (selectedBuilding) {
                    handleAddComment(selectedBuilding, content, label);
                  }
                  setShowCommentEditor(false);
                }}
                onClose={() => setShowCommentEditor(false)}
              />
            )}
          </>
        )}
      </div>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
