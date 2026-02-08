import { useState, useEffect, useCallback } from "react";
import {
  PlacedComponent,
  ComponentData,
  Connection,
  ComponentType,
} from "../types";
import { COMPONENT_LIBRARY, INITIAL_CODE } from "../constants";

export const useCircuit = () => {
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  
  // Multi-MCU State
  const [activeMcuUid, setActiveMcuUid] = useState<string | null>(null);

  // Wiring State
  const [selectedPin, setSelectedPin] = useState<{
    compUid: string;
    pinId: string;
    x: number;
    y: number;
  } | null>(null);

  // Automatically select first MCU if none selected
  useEffect(() => {
    if (!activeMcuUid && components.length > 0) {
      const firstMcu = components.find(
        (c) => c.type === ComponentType.MICROCONTROLLER,
      );
      if (firstMcu) {
        setActiveMcuUid(firstMcu.uid);
      }
    }
  }, [components, activeMcuUid]);

  // Update code when active MCU changes
  useEffect(() => {
    if (activeMcuUid) {
      const mcu = components.find((c) => c.uid === activeMcuUid);
      if (mcu && mcu.code) {
        setCode(mcu.code);
      }
    }
  }, [activeMcuUid, components]);

  // Save code to active MCU
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setActiveMcuUid((currentUid) => {
        if (currentUid) {
            setComponents((prev) =>
                prev.map((c) => (c.uid === currentUid ? { ...c, code: newCode } : c)),
            );
        }
        return currentUid;
    });
  }, []);
    
  // Need to handle setActiveMcuUid carefully to avoid stale closure if used inside callback 
  // but here it is fine.

  // Ensure active MCU exists
  useEffect(() => {
    if (activeMcuUid && !components.find((c) => c.uid === activeMcuUid)) {
      setActiveMcuUid(null);
      setCode("");
    }
  }, [components, activeMcuUid]);

  const addComponent = useCallback((compData: ComponentData) => {
    const newComp: PlacedComponent = {
      ...compData,
      uid: Math.random().toString(36).substr(2, 9),
      position: { x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 },
      // If microcontroller, init code
      code: compData.type === ComponentType.MICROCONTROLLER ? INITIAL_CODE : undefined,
    };
    setComponents((prev) => [...prev, newComp]);
  }, []);

  const moveComponent = useCallback((uid: string, x: number, y: number) => {
    setComponents((prev) =>
      prev.map((c) => (c.uid === uid ? { ...c, position: { x, y } } : c)),
    );
  }, []);

  const deleteComponent = useCallback(() => {
    if (selectedCompId) {
      setComponents((prev) => prev.filter((c) => c.uid !== selectedCompId));
      setConnections((prev) =>
        prev.filter(
          (c) =>
            c.from.compUid !== selectedCompId &&
            c.to.compUid !== selectedCompId,
        ),
      );
      setSelectedCompId(null);
    }
  }, [selectedCompId]);

  const deleteWire = useCallback(() => {
    if (selectedWireId) {
      setConnections((prev) => prev.filter((c) => c.id !== selectedWireId));
      setSelectedWireId(null);
    }
  }, [selectedWireId]);

  // Handle Delete Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if NOT in an input/textarea
        const tagName = (e.target as HTMLElement).tagName.toLowerCase();
        if (tagName !== "input" && tagName !== "textarea" && tagName !== "div") { // contenteditable div
             if (selectedCompId) deleteComponent();
             if (selectedWireId) deleteWire();
        } else {
             // Basic check for body focus or similar? 
             // Actually, checking tagName is a good heuristic.
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCompId, selectedWireId, deleteComponent, deleteWire]);

  const handlePinClick = useCallback((
    compUid: string,
    pinId: string,
    absX: number,
    absY: number,
  ) => {
    setSelectedPin((prev) => {
        if (prev) {
          if (prev.compUid === compUid && prev.pinId === pinId) {
            return null; // Deselect
          }
          // Create Connection
          const newConnection: Connection = {
            id: Math.random().toString(36).substr(2, 9),
            from: {
              type: "pin",
              compUid: prev.compUid,
              pinId: prev.pinId,
            },
            to: { type: "pin", compUid: compUid, pinId: pinId },
            waypoints: [],
            color: ["#ef4444", "#22c55e", "#3b82f6", "#eab308"][
              Math.floor(Math.random() * 4)
            ],
          };
          setConnections((curr) => [...curr, newConnection]);
          return null;
        } else {
            return { compUid, pinId, x: absX, y: absY };
        }
    });
  }, []);

  return {
    components,
    setComponents,
    connections,
    setConnections,
    code,
    setCode,
    activeMcuUid,
    setActiveMcuUid,
    handleCodeChange,
    selectedCompId,
    setSelectedCompId,
    selectedWireId,
    setSelectedWireId,
    selectedPin,
    setSelectedPin,
    addComponent,
    moveComponent,
    deleteComponent,
    deleteWire,
    handlePinClick,
  };
};
