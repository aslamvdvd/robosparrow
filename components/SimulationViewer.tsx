import React, { useEffect, useRef } from "react";
import { SimulationState } from "../types";

interface Props {
  state: SimulationState;
}

const SimulationViewer: React.FC<Props> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Ground)
    ctx.strokeStyle = "#374151";
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

    // Draw Robot Body (Dynamic Chassis)
    // We'll draw a generic chassis box, but scaled to fit components?
    // For now, keep the blue box as "Base", but maybe larger.

    ctx.save();
    const { x, y, rotation } = state.robotPosition;
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Chassis Body
    ctx.fillStyle = "#60a5fa"; // Blue-400
    ctx.shadowColor = "rgba(96, 165, 250, 0.5)";
    ctx.shadowBlur = 15;
    ctx.fillRect(-30, -40, 60, 80); // Slightly larger

    // Front indicator
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, -30, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Dynamic Wheels (Visual Feedback)
    // We don't have access to 'components' prop here in current signature.
    // Ideally we should pass 'components' to SimulationViewer to draw them relative.
    // For this "Lite" version, we'll just animate generic wheels based on if it's moving.

    ctx.fillStyle = "#1f2937"; // Gray-800
    const isMoving = state.logs.length > 0 && state.isRunning; // Primitive check, or pass velocity?

    // Generic Wheel positions for a 2WD bot
    ctx.fillRect(-34, -10, 8, 20); // Left Wheel
    ctx.fillRect(26, -10, 8, 20); // Right Wheel

    // If we passed components, we could do:
    // components.filter(c => c.simulation.type === 'motor').forEach(...)

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
