import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationState, ConsoleLog, LogType, ComponentType } from "../types";

// Types for simulation loop
type LoopFunction = () => void;
type SetupFunction = () => void;

interface UseSimulationProps {
  code: string;
  components: any[];
  connections: any[];
}

export const useSimulation = ({ code, components, connections }: UseSimulationProps) => {
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

  const runSimulation = useCallback(async () => {
    stopSimulation();
    setConsoleLogs([]);
    logToConsole("Compiling code...", "system");

    // --- SHARED DEFINITIONS (Available to both Regex and AI execution paths) ---

    // 1. Sandbox Helper Functions
    const __writePin = (pin: any, val: any) => {
      const p = String(pin);
      const v = Number(val);
      virtualPins.current[p] = v;
    };
    
    const __pwmPin = (pin: any, val: any) => {
      const p = String(pin);
      const v = Number(val);
      virtualPins.current[p] = v / 255;
    };

    const __readPin = (pin: any) => {
       return virtualPins.current[String(pin)] || 0;
    };

    const __readAnalog = (pin: any) => {
       return virtualPins.current[String(pin)] || 0;
    };

    const __log = (msg: any) => {
      if (Math.random() < 0.1) logToConsole(String(msg));
    };

    // 2. Simulation Loop (Standard JS Interval)
    const startLoop = () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
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
      }, 100); 
    };

    // 3. Physics Engine (Animation Frame)
    const physicsTick = () => {
        setSimState((prev) => {
           let { x, y, rotation } = prev.robotPosition;
           
           let totalLinearVelocity = 0;
           let totalAngularVelocity = 0;
           let activeMotors = 0;

           // Dynamics Parameters
           // const DRAG = 0.95; // Velocity decay
           // const ROTATIONAL_DRAG = 0.8;

           // 1. Iterate through all components to find Actuators (Motors)
           components.forEach(comp => {
              if (comp.simulation?.type === 'motor') {
                 // Check Pin States for this motor
                 // Assumption: 'POS' and 'NEG' pins control it, or 'IN1'/'IN2' via driver
                 // For now, let's look for "Signal" or "Power" pins that might be high.
                 
                 // Simpler: Look at the WIRES connected to this motor.
                 // If a wire connected to 'POS' is HIGH and 'NEG' is LOW -> Forward
                 // If 'POS' is LOW and 'NEG' is HIGH -> Backward
                 const getPinVoltage = (pinId: string) => {
                    // Find wire connected to this component's pin
                    const wire = connections.find(c => c.to.compUid === comp.uid && c.to.pinId === pinId);
                    if (!wire) return 0;
                    
                    // Trace back to source
                    if (wire.from.type === 'pin') {
                       const sourceComp = components.find(c => c.uid === wire.from.compUid);
                       if (!sourceComp) return 0;

                       // Case A: Source is MCU
                       if (sourceComp.type === ComponentType.MICROCONTROLLER) {
                          let val = virtualPins.current[wire.from.pinId!] || 0;
                          if (wire.from.pinId?.startsWith('D')) {
                             val = virtualPins.current[wire.from.pinId.substring(1)] || val;
                          }
                          return val;
                       }
                       
                       // Case B: Source is Motor Driver (Logic)
                       if (sourceComp.simulation?.type === 'driver') {
                          const getDriverInput = (inPinId: string) => {
                             const inWire = connections.find(c => c.to.compUid === sourceComp.uid && c.to.pinId === inPinId);
                             if (!inWire) return 0;
                             if (inWire.from.type === 'pin') {
                                let val = virtualPins.current[inWire.from.pinId!] || 0;
                                if (inWire.from.pinId?.startsWith('D')) {
                                   val = virtualPins.current[inWire.from.pinId.substring(1)] || val;
                                }
                                return val;
                             }
                             return 0;
                          };

                          const IN1 = getDriverInput('IN1');
                          const IN2 = getDriverInput('IN2');
                          const IN3 = getDriverInput('IN3');
                          const IN4 = getDriverInput('IN4');
                          
                          // Motor A (OUT1/OUT2)
                          if (wire.from.pinId === 'OUT1') return (IN1 && !IN2) ? 1 : 0; 
                          if (wire.from.pinId === 'OUT2') return (!IN1 && IN2) ? 1 : 0; 
                          
                          // Motor B (OUT3/OUT4)
                          if (wire.from.pinId === 'OUT3') return (IN3 && !IN4) ? 1 : 0;
                          if (wire.from.pinId === 'OUT4') return (!IN3 && IN4) ? 1 : 0;
                       }
                    }
                    return 0;
                 };

                 const vPos = getPinVoltage('POS');
                 const vNeg = getPinVoltage('NEG');
                 
                 const speed = (comp.simulation?.maxSpeed || 2);
                 
                 let motorForce = 0;
                 const voltDiff = vPos - vNeg;
                 
                 if (voltDiff > 0.1) motorForce = 1 * voltDiff;
                 else if (voltDiff < -0.1) motorForce = 1 * voltDiff;
                 
                 if (Math.abs(motorForce) > 0.01) {
                    activeMotors++;
                    totalLinearVelocity += motorForce * speed;
                    
                    const isLeft = comp.properties?.position === 'left' || comp.position.x < 300; 
                    
                    if (isLeft) {
                        totalAngularVelocity += motorForce * (comp.simulation?.force || 0.05);
                    } else {
                        totalAngularVelocity -= motorForce * (comp.simulation?.force || 0.05);
                    }
                 }
              }
           });
           
           if (activeMotors > 0) {
              totalLinearVelocity = totalLinearVelocity / Math.max(1, activeMotors * 0.5); 
           }
           
           const newRotation = rotation + totalAngularVelocity;
           const newX = x + Math.sin(newRotation) * totalLinearVelocity;
           const newY = y - Math.cos(newRotation) * totalLinearVelocity;

           const clampedX = Math.max(20, Math.min(580, newX));
           const clampedY = Math.max(20, Math.min(380, newY));

           return {
             ...prev,
             robotPosition: { x: clampedX, y: clampedY, rotation: newRotation },
           };
        });
        requestRef.current = requestAnimationFrame(physicsTick);
      };

      // --- EXECUTION ---

    try {
      // 1. Pre-processing (Regex Transpiler)
      //    This is a MOCK compiler. In a real app, you'd use Emscripten or a backend.
      //    We'll support basic Arduino-like syntax: setup(), loop(), digitalWrite(), delay()

      // Extract setup and loop bodies
      // VERY naive parsing for demo purposes
      // 0. Extract bodies first to handle global vars vs local
      const setupMatch = code.match(/void\s+setup\s*\(\)\s*{([\s\S]*?)}/);
      const loopMatch = code.match(/void\s+loop\s*\(\)\s*{([\s\S]*?)}/);

      const setupBody = setupMatch ? setupMatch[1] : "";
      const loopBody = loopMatch ? loopMatch[1] : "";

      // Create Transpiled Function Bodies
      // Replace C++ calls with JS equivalents that interact with our virtualPins
      // 1. Transpilation (C++ to JS)
      // Robust Regex-based approach for client-side execution
      const transpile = (src: string) => {
        let js = src;
        
        // Remove comments
        js = js.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

        // 1. Variable Declarations
        // int x = 10; -> let x = 10;
        // const int x = 10; -> const x = 10;
        // float, double, bool, String -> let
        js = js.replace(/const\s+\w+\s+(\w+)\s*=/g, "const $1 =");
        js = js.replace(/(int|float|double|bool|String|long|char)\s+(\w+)(?:\s*=\s*([^;]+))?;/g, "let $2 = $3;");
        js = js.replace(/let\s+(\w+)\s*=\s*undefined;/g, "let $1 = 0;"); // Default init

        // 2. Pin Operations
        // digitalWrite(pin, val) -> __writePin(pin, val)
        js = js.replace(/digitalWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/g, "__writePin($1, $2);");
        // analogWrite(pin, val) -> __pwmPin(pin, val)
        js = js.replace(/analogWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/g, "__pwmPin($1, $2);");
        // digitalRead(pin) -> __readPin(pin)
        js = js.replace(/digitalRead\s*\(\s*([^)]+)\s*\)/g, "__readPin($1)");
        // analogRead(pin) -> __readAnalog(pin)
        js = js.replace(/analogRead\s*\(\s*([^)]+)\s*\)/g, "__readAnalog($1)");

        // 3. Time
        // delay(ms) -> __delay(ms) (Note: Blocking delay is hard in JS loop, we'll mock it or ignore for physics tick)
        // For physics sim, true blocking delay freezes UI. 
        // We will ignore delay() for now to keep frames moving, OR implement async loop later.
        // Current decision: Ignore delay to keep simulation fluid (physics-based).
        js = js.replace(/delay\s*\(\s*([^)]+)\s*\);/g, "// delay($1) ignored for fluid sim");

        // 4. Serial
        js = js.replace(/Serial\.begin\s*\([^)]+\);/g, "");
        js = js.replace(/Serial\.println\s*\((.*?)\);/g, `__log($1);`);
        js = js.replace(/Serial\.print\s*\((.*?)\);/g, `__log($1);`);

        // 5. Constants
        js = js.replace(/\bHIGH\b/g, "1").replace(/\bLOW\b/g, "0");
        js = js.replace(/\bINPUT\b/g, "'INPUT'").replace(/\bOUTPUT\b/g, "'OUTPUT'");
        js = js.replace(/\bA0\b/g, `"A0"`).replace(/\bA1\b/g, `"A1"`).replace(/\bA2\b/g, `"A2"`).replace(/\bA3\b/g, `"A3"`).replace(/\bA4\b/g, `"A4"`).replace(/\bA5\b/g, `"A5"`);

        return js;
      };

      const jsSetup = transpile(setupBody);
      const jsLoop = transpile(loopBody);

      // 2. Evaluate Transpiled Code in a Sandbox
      //    We use a Function constructor to create a sandboxed environment.
      //    This allows us to inject our helper functions (__writePin, __readPin, etc.)
      //    and prevent the user code from accessing global scope directly.
      const createSandboxedFunction = (codeStr: string, funcName: string) => {
        // eslint-disable-next-line no-new-func
        return new Function(
          "__writePin", "__pwmPin", "__readPin", "__readAnalog", "__log",
          `
          let __globalVars = {}; // Simple scope for global variables
          ${codeStr}
          return ${funcName};
          `
        )(__writePin, __pwmPin, __readPin, __readAnalog, __log);
      };

      const setupFunc = createSandboxedFunction(jsSetup, "setup");
      const loopFunc = createSandboxedFunction(jsLoop, "loop");

      userCodeClosure.current = { setup: setupFunc, loop: loopFunc };

      logToConsole("Code compiled (Regex). Starting...", "system");
      setSimState((prev) => ({ ...prev, isRunning: true }));

      // Run setup() once
      if (userCodeClosure.current.setup) {
        userCodeClosure.current.setup();
      }

      // Start the main simulation loop
      startLoop();

      // Physics Loop (for robot movement, etc.)
      requestRef.current = requestAnimationFrame(physicsTick);
    } catch (err: any) {
         // FALLBACK: AI Transpilation
         logToConsole(`Standard compilation failed (${err.message}). Trying AI Compiler...`, "system");
         
         const apiKey = localStorage.getItem("robo-sparrow-api-key");
         if (!apiKey) {
            logToConsole("Compilation failed and no API Key for AI fallback.", "error");
            return;
         }

         try {
             // Dynamic import to avoid circular dependency potentially
             const { transpileCode } = await import("../services/geminiService");
             const aiResultStr = await transpileCode(apiKey, "gemini-3-flash-preview", code);
             const aiResult = JSON.parse(aiResultStr);
             
             const createAiFunc = (body: string) => {
                 return new Function(
                    "__writePin", "__pwmPin", "__readPin", "__readAnalog", "__log",
                    body
                 ) as (w: any, pwm: any, r: any, ra: any, l: any) => void;
             };

             const aiSetupFn = createAiFunc(aiResult.setup || "");
             const aiLoopFn = createAiFunc(aiResult.loop || "");

             userCodeClosure.current = {
                setup: () => aiSetupFn(__writePin, __pwmPin, __readPin, __readAnalog, __log),
                loop: () => aiLoopFn(__writePin, __pwmPin, __readPin, __readAnalog, __log),
             };

             logToConsole("AI Compilation successful! Starting...", "system");
             setSimState((prev) => ({ ...prev, isRunning: true }));
             
             if (userCodeClosure.current.setup) userCodeClosure.current.setup();
             startLoop();
             requestRef.current = requestAnimationFrame(physicsTick);

         } catch (aiErr: any) {
             logToConsole(`AI Compile Error: ${aiErr.message}`, "error");
         }
    }
  }, [code, logToConsole, stopSimulation, connections, components]);

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
