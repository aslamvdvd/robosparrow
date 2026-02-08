import React, { useMemo, useRef, useEffect } from "react";
import { PlacedComponent } from "../types";

interface Props {
  components: PlacedComponent[];
  transform: { x: number; y: number; scale: number };
  viewportSize: { width: number; height: number };
  onNavigate: (x: number, y: number) => void;
}

const Minimap: React.FC<Props> = ({
  components,
  transform,
  viewportSize,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Calculate World Bounds
  const worldBounds = useMemo(() => {
    if (components.length === 0)
      return {
        minX: 0,
        minY: 0,
        maxX: 800,
        maxY: 600,
        width: 800,
        height: 600,
      };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    components.forEach((c) => {
      minX = Math.min(minX, c.position.x);
      minY = Math.min(minY, c.position.y);
      maxX = Math.max(maxX, c.position.x + c.width);
      maxY = Math.max(maxY, c.position.y + c.height);
    });

    // Add padding
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Ensure connection lines (approximate) or default size are covered?
    // For now, focusing on components + padding is usually enough.
    // Also include the current Viewport in the bounds to prevent "losing" the view?
    // Actually, distinct separation of Content vs Viewport is better.

    // Force a minimum size to avoid divide by zero or tiny maps
    if (maxX - minX < 500) maxX = minX + 500;
    if (maxY - minY < 500) maxY = minY + 500;

    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }, [components]);

  // 2. Constants
  const MINIMAP_WIDTH = 200;
  // Calculate height to maintain aspect ratio, but cap it
  const aspectRatio = worldBounds.width / worldBounds.height;
  const MINIMAP_HEIGHT = Math.min(MINIMAP_WIDTH / aspectRatio, 200);

  const scaleX = MINIMAP_WIDTH / worldBounds.width;
  const scaleY = MINIMAP_HEIGHT / worldBounds.height;
  // Use uniform scale to fit
  const minimapScale = Math.min(scaleX, scaleY);

  // Re-calculate visual width/height based on uniform scale
  const visualWidth = worldBounds.width * minimapScale;
  const visualHeight = worldBounds.height * minimapScale;

  // 3. Coordinate conversion helpers
  // World (Component Coords) -> Minimap Pixel Coords
  const toMinimap = (x: number, y: number) => ({
    x: (x - worldBounds.minX) * minimapScale,
    y: (y - worldBounds.minY) * minimapScale,
  });

  // Minimap Pixel Coords -> World (Component Coords)
  const toWorld = (mx: number, my: number) => ({
    x: mx / minimapScale + worldBounds.minX,
    y: my / minimapScale + worldBounds.minY,
  });

  // Handle Click / Drag to Navigate
  const handleInteraction = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click (minimap pixel) to World Coordinate
    const worldPos = toWorld(clickX, clickY);

    // We want this world position to be the Center of the Viewport
    // transform.x = -worldPos.x * transform.scale + viewportWidth / 2
    // formula derivation:
    // screenCenter = worldPos * scale + translate
    // translate = screenCenter - worldPos * scale

    const newTx = viewportSize.width / 2 - worldPos.x * transform.scale;
    const newTy = viewportSize.height / 2 - worldPos.y * transform.scale;

    onNavigate(newTx, newTy);
  };

  // Viewport Rect Calculation
  // Viewport in World Coords:
  // left = -transform.x / transform.scale
  // top = -transform.y / transform.scale
  // width = viewportSize.width / transform.scale
  // height = viewportSize.height / transform.scale

  const viewportWorld = {
    x: -transform.x / transform.scale,
    y: -transform.y / transform.scale,
    w: viewportSize.width / transform.scale,
    h: viewportSize.height / transform.scale,
  };

  const viewportMini = {
    ...toMinimap(viewportWorld.x, viewportWorld.y),
    w: viewportWorld.w * minimapScale,
    h: viewportWorld.h * minimapScale,
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-6 right-6 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 select-none cursor-crosshair group"
      style={{ width: visualWidth, height: visualHeight }}
      onMouseDown={(e) => {
        if (e.buttons === 1) handleInteraction(e);
      }}
      onMouseMove={(e) => {
        if (e.buttons === 1) handleInteraction(e);
      }}
    >
      {/* Background/Grid hint */}
      <div className="w-full h-full opacity-20 bg-gray-800" />

      {/* Components */}
      {components.map((c) => {
        const pos = toMinimap(c.position.x, c.position.y);
        const w = c.width * minimapScale;
        const h = c.height * minimapScale;
        // Determine color based on type
        let color = "#9ca3af";
        if (c.type === "MICROCONTROLLER") color = "#14b8a6"; // Teal
        if (c.id.includes("breadboard")) color = "#f3f4f6"; // White

        return (
          <div
            key={c.uid}
            className="absolute rounded-[1px]"
            style={{
              left: pos.x,
              top: pos.y,
              width: Math.max(w, 2), // Ensure at least visible
              height: Math.max(h, 2),
              backgroundColor: color,
            }}
          />
        );
      })}

      {/* Viewport Rect (The "Camera") */}
      <div
        className="absolute border-2 border-blue-500 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-75 ease-linear pointer-events-none"
        style={{
          left: viewportMini.x,
          top: viewportMini.y,
          width: viewportMini.w,
          height: viewportMini.h,
        }}
      />
    </div>
  );
};

export default Minimap;
