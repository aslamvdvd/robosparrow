import React, { useState, useRef, useEffect, useCallback } from "react";

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export const useCanvas = () => {
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Zoom on wheel (Ctrl+Wheel or Meta+Wheel)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const newScale = Math.min(
          Math.max(transform.scale - e.deltaY * zoomSensitivity, 0.1),
          5,
        );

        setTransform((prev) => ({ ...prev, scale: newScale }));
      } else {
        // Pan on wheel
        // If Shift is pressed, treat vertical scroll as horizontal (standard behavior)
        const dx = e.shiftKey && e.deltaY !== 0 ? e.deltaY : e.deltaX;
        const dy = e.shiftKey && e.deltaY !== 0 ? 0 : e.deltaY;

        setTransform((prev) => ({
          ...prev,
          x: prev.x - dx,
          y: prev.y - dy,
        }));
      }
    },
    [transform.scale],
  );

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse (1) or Left click (0) on background starts pan
    if (e.button === 1 || e.button === 0) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;

        setTransform((prev) => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        }));

        panStartRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isPanning],
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const zoomIn = useCallback(
    () =>
      setTransform((prev) => ({
        ...prev,
        scale: Math.min(prev.scale * 1.2, 5),
      })),
    [],
  );

  const zoomOut = useCallback(
    () =>
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(prev.scale / 1.2, 0.1),
      })),
    [],
  );

  const resetView = useCallback(
    () => setTransform({ x: 0, y: 0, scale: 1 }),
    [],
  );

  return {
    transform,
    setTransform,
    viewportSize,
    canvasRef,
    handleWheel,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    zoomIn,
    zoomOut,
    resetView,
  };
};
