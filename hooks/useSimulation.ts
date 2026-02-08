import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationState, ConsoleLog, LogType, ComponentType } from "../types";

// Types for simulation loop
type LoopFunction = () => void;
type SetupFunction = () => void;

interface UseSimulationProps {
  code: string;
  components: any[];
}

export const useSimulation = ({ code, components }: UseSimulationProps) => {
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    time: 0,
    logs: [],
    robotPosition: { x: 300, y: 200, rotation: 0 },
    pinStates: {},
  });

  const requestRef = useRef<number | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userCodeClosure = useRef<{
    setup: SetupFunction | null;
    loop: LoopFunction | null;
  }>({ setup: null, loop: null });
  const virtualPins = useRef<Record<number, number>>({});

  const logToConsole = useCallback((msg: string, type: LogType = "info") => {
    setConsoleLogs((prev) => [
      ...prev.slice(-49),
      {
        id: Math.random().toString(),
        message: msg,
        type,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const stopSimulation = useCallback(() => {
    setSimState((prev) => ({ ...prev, isRunning: false }));
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    virtualPins.current = {};
  }, []);

  const runSimulation = useCallback(() => {
    stopSimulation();
    setConsoleLogs([]);
    logToConsole("Compiling code...", "system");

    try {
      // 1. Pre-processing (Simple C++ to JS transpilation for browser)
      //    This is a MOCK compiler. In a real app, you'd use Emscripten or a backend.
      //    We'll support basic Arduino-like syntax: setup(), loop(), digitalWrite(), delay()

      // Extract setup and loop bodies
      // VERY naive parsing for demo purposes
      const setupMatch = code.match(/void\s+setup\s*\(\)\s*{([\s\S]*?)}/);
      const loopMatch = code.match(/void\s+loop\s*\(\)\s*{([\s\S]*?)}/);

      const setupBody = setupMatch ? setupMatch[1] : "";
      const loopBody = loopMatch ? loopMatch[1] : "";

      // Create Transpiled Function Bodies
      // Replace C++ calls with JS equivalents that interact with our virtualPins
      const transpile = (src: string) => {
        return src
          .replace(
            /digitalWrite\s*\(\s*(\d+|A\d+)\s*,\s*(HIGH|LOW)\s*\);/g,
            (_match, pin, val) => {
              const valInt = val === "HIGH" ? 1 : 0;
              return `__writePin(${pin}, ${valInt});`;
            },
          )
          .replace(/delay\s*\(\s*(\d+)\s*\);/g, "/* delay not supported */") // Async-ify later
          .replace(/Serial\.println\s*\((.*?)\);/g, `__log($1);`);
      };

      const jsSetup = transpile(setupBody);
      const jsLoop = transpile(loopBody);

      // Create Sandbox Functions
      const __writePin = (pin: any, val: number) => {
        virtualPins.current[pin] = val;
        // Update Sim State for visual feedback
        setSimState((prev) => ({
          ...prev,
          pinStates: { ...prev.pinStates, [pin]: val },
        }));
      };

      const __log = (msg: any) => {
        logToConsole(String(msg));
      };

      // Eval / Function Constructor
      // Note: "Function" constructor is safer than eval but still has access to global scope if not careful.
      // We are scoping it here.
      // eslint-disable-next-line no-new-func
      const setupFn = new Function(
        "__writePin",
        "__log",
        jsSetup,
      ) as (w: any, l: any) => void;
      
      // eslint-disable-next-line no-new-func
      const loopFn = new Function(
        "__writePin",
        "__log",
        jsLoop,
      ) as (w: any, l: any) => void;

      userCodeClosure.current = {
        setup: () => setupFn(__writePin, __log),
        loop: () => loopFn(__writePin, __log),
      };

      // 2. Execution
      logToConsole("Upload complete. Starting...", "system");
      setSimState((prev) => ({ ...prev, isRunning: true }));

      // Run Setup Once
      if (userCodeClosure.current.setup) {
        userCodeClosure.current.setup();
      }

      // Start Loop Interval (approx 60Hz or slower for visual clarity)
      simIntervalRef.current = setInterval(() => {
        if (userCodeClosure.current.loop) {
          try {
            userCodeClosure.current.loop();
            setSimState((prev) => ({ ...prev, time: prev.time + 1 }));
          } catch (e: any) {
             console.error(e);
             logToConsole(`Runtime Error: ${e.message}`, "error");
             stopSimulation();
          }
        }
      }, 100); // 100ms per loop iteration for demo

      // Physics Loop (Animation Frame) - Separation of concerns
      const physicsTick = () => {
        // Simple distinct physics: Robot movement based on motor pins
        // Assume Pin 5 = Left Motor, Pin 6 = Right Motor (PWM-ish)
        // For digital simple demo:
        const leftMotor = virtualPins.current[5] ? 1 : 0;
        const rightMotor = virtualPins.current[6] ? 1 : 0;

        setSimState((prev) => {
          let { x, y, rotation } = prev.robotPosition;
          const speed = 2;
          const turnSpeed = 0.05;

          let linearVelocity = 0;
          let angularVelocity = 0;

          if (leftMotor && rightMotor) {
            linearVelocity = speed; // Forward
          } else if (leftMotor && !rightMotor) {
            angularVelocity = turnSpeed; // Turn Right
            linearVelocity = speed * 0.5;
          } else if (!leftMotor && rightMotor) {
            angularVelocity = -turnSpeed; // Turn Left
            linearVelocity = speed * 0.5;
          }

          const newRotation = rotation + angularVelocity;
          const newX = x + Math.sin(newRotation) * linearVelocity;
          const newY = y - Math.cos(newRotation) * linearVelocity;

          const clampedX = Math.max(20, Math.min(580, newX));
          const clampedY = Math.max(20, Math.min(380, newY));

          return {
            ...prev,
            robotPosition: { x: clampedX, y: clampedY, rotation: newRotation },
          };
        });
        requestRef.current = requestAnimationFrame(physicsTick);
      };

      requestRef.current = requestAnimationFrame(physicsTick);
    } catch (err: any) {
      logToConsole(`Compilation Error: ${err.message}`, "error");
    }
  }, [code, logToConsole, stopSimulation]);

  return {
    simState,
    setSimState,
    consoleLogs,
    setConsoleLogs,
    runSimulation,
    stopSimulation,
    logToConsole,
  };
};
