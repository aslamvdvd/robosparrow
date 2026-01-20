import React, { useEffect, useRef } from 'react';
import { SimulationState } from '../types';

interface Props {
  state: SimulationState;
}

const SimulationViewer: React.FC<Props> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Ground)
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Draw Robot
    const { x, y, rotation } = state.robotPosition;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Chassis Body
    ctx.fillStyle = '#60a5fa'; // Blue-400
    ctx.shadowColor = 'rgba(96, 165, 250, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillRect(-20, -30, 40, 60);

    // Wheels
    ctx.fillStyle = '#1f2937'; // Gray-800
    ctx.shadowBlur = 0;
    // Front Left
    ctx.fillRect(-24, -25, 6, 15);
    // Front Right
    ctx.fillRect(18, -25, 6, 15);
    // Back Left
    ctx.fillRect(-24, 10, 6, 15);
    // Back Right
    ctx.fillRect(18, 10, 6, 15);

    // Direction Indicator (LED)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -20, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw "Sensor" Lines (Conceptual)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, -100);
    ctx.stroke();
    ctx.restore();

  }, [state.robotPosition]);

  return (
    <div className="w-full h-full relative bg-gray-950 overflow-hidden rounded-lg border border-gray-800">
      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur text-xs text-blue-300 rounded border border-blue-900/50">
        World Sim
      </div>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="w-full h-full object-cover"
      />
      {state.isRunning && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-400 font-mono">LIVE</span>
        </div>
      )}
    </div>
  );
};

export default SimulationViewer;