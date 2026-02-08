import React, { useEffect, useRef } from "react";
import { SimulationState } from "../types";

interface Props {
  state: SimulationState;
  components?: any[]; // Optional for backward compat if needed, but we should pass it
}

const SimulationViewer: React.FC<Props> = ({ state, components = [] }) => {
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

    ctx.save();
    const { x, y, rotation } = state.robotPosition;

    // Robot Center
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Chassis Body
    // If we have components, we could try to bound them?
    // For now, static chassis size is fine, maybe slightly larger if 4WD.
    const is4WD =
      components.filter((c) => c.simulation?.type === "motor").length > 2;

    ctx.fillStyle = "#60a5fa"; // Blue-400
    ctx.shadowColor = "rgba(96, 165, 250, 0.5)";
    ctx.shadowBlur = 15;

    if (is4WD) {
      ctx.fillRect(-35, -50, 70, 100); // Larger chassis for 4WD
    } else {
      ctx.fillRect(-30, -40, 60, 80); // Standard chassis
    }

    // Front indicator
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, is4WD ? -40 : -30, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Components (Motors)
    const motors = components.filter((c) => c.simulation?.type === "motor");

    if (motors.length > 0) {
      motors.forEach((motor) => {
        // Heuristic to determine visual position on chassis
        // Left vs Right
        const isLeft =
          motor.properties?.position === "left" || motor.position.x < 300;
        const offsetX = isLeft ? -38 : 30; // From center

        // Front vs Back (Heuristic based on Y position in editor?)
        // Or just slot them.
        // If 4 motors: 2 left, 2 right.
        // We can check if there are multiple on left/right.

        // Simplified: Just draw generic wheels at corners if we can't map perfectly.
      });

      // Better: Dynamic Slots
      // If 2 motors: Left/Right Center
      // If 4 motors: FL, FR, BL, BR
      const leftMotors = motors.filter(
        (m) => m.properties?.position === "left" || m.position.x < 300,
      );
      const rightMotors = motors.filter(
        (m) => m.properties?.position === "right" || m.position.x >= 300,
      );

      const drawWheel = (wx: number, wy: number) => {
        ctx.fillStyle = "#1f2937"; // Gray-800
        ctx.fillRect(wx, wy, 8, 20);

        // Rim/Hub
        ctx.fillStyle = "#4b5563";
        ctx.fillRect(wx + 2, wy + 5, 4, 10);
      };

      // Left Side
      leftMotors.forEach((_, i) => {
        // i=0 -> Front, i=1 -> Back (if 2)
        // Or center if 1
        let yOffset = -10;
        if (leftMotors.length > 1) {
          yOffset = i === 0 ? -35 : 15;
        }
        drawWheel(is4WD ? -42 : -34, yOffset);
      });

      // Right Side
      rightMotors.forEach((_, i) => {
        let yOffset = -10;
        if (rightMotors.length > 1) {
          yOffset = i === 0 ? -35 : 15;
        }
        drawWheel(is4WD ? 34 : 26, yOffset);
      });
    } else {
      // Fallback 2WD
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(-34, -10, 8, 20); // L
      ctx.fillRect(26, -10, 8, 20); // R
    }

    ctx.restore();
  }, [state.robotPosition, components]);

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
