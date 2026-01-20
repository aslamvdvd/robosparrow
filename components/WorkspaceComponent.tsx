import React, { useState, useRef } from 'react';
import { PlacedComponent, Pin } from '../types';

interface Props {
  component: PlacedComponent;
  onMove: (id: string, x: number, y: number) => void;
  onPinClick: (compUid: string, pinId: string, x: number, y: number) => void;
  isSelected: boolean;
  selectedPin: { compUid: string; pinId: string } | null;
}

const WorkspaceComponent: React.FC<Props> = ({ component, onMove, onPinClick, isSelected, selectedPin }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - component.position.x,
      y: e.clientY - component.position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove(component.uid, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Determine Visual Style based on type
  const getBodyStyle = () => {
    switch (component.type) {
      case 'MICROCONTROLLER': return 'bg-teal-900 border-teal-600';
      case 'POWER': return 'bg-yellow-900 border-yellow-600';
      case 'ACTUATOR': return 'bg-orange-900 border-orange-600';
      default: return 'bg-gray-800 border-gray-600';
    }
  };

  return (
    <div
      className={`absolute shadow-lg rounded-md border-2 select-none ${getBodyStyle()} ${isSelected ? 'ring-2 ring-white' : ''}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.width,
        height: component.height,
        zIndex: isDragging ? 50 : 10,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute top-0 left-0 w-full p-1 bg-black/20 text-[10px] font-mono text-center truncate text-white/80 pointer-events-none">
        {component.name}
      </div>

      {component.pins.map((pin) => {
        const isPinSelected = selectedPin?.compUid === component.uid && selectedPin?.pinId === pin.id;
        return (
          <div
            key={pin.id}
            onClick={(e) => {
              e.stopPropagation();
              // Calculate absolute position of pin center for the wire
              const rect = e.currentTarget.getBoundingClientRect();
               // We need position relative to workspace. 
               // However, the workspace coordinates are managed by parent state. 
               // We will pass the component's relative x/y + pin offset.
              onPinClick(component.uid, pin.id, component.position.x + pin.x, component.position.y + pin.y);
            }}
            className={`absolute w-3 h-3 rounded-full border border-gray-900 hover:scale-150 transition-transform cursor-crosshair z-20 ${
              isPinSelected ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 
              pin.type === 'power' ? 'bg-red-500' : 
              pin.type === 'ground' ? 'bg-black' : 'bg-green-400'
            }`}
            style={{ left: pin.x - 6, top: pin.y - 6 }}
            title={pin.name}
          />
        );
      })}
    </div>
  );
};

export default WorkspaceComponent;