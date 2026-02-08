import { useState, useRef, useEffect, useCallback } from "react";
import { SimulationState, ConsoleLog, LogType, ComponentType } from "../types";
import { getGeminiApiKey } from "../services/geminiService";

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
      let js = code;

      // Remove comments
      js = js.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

      // 1. Variable Declarations (Global & Local)
      // int x = 10; -> let x = 10;
      js = js.replace(/const\s+\w+\s+(\w+)\s*=/g, "const $1 =");
      js = js.replace(/(int|float|double|bool|String|long|char)\s+(\w+)(?:\s*=\s*([^;]+))?;/g, "let $2 = $3;");
      js = js.replace(/let\s+(\w+)\s*=\s*undefined;/g, "let $1 = 0;"); // Default init

      // 2. Pin Operations
      js = js.replace(/digitalWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/g, "__writePin($1, $2);");
      js = js.replace(/analogWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/g, "__pwmPin($1, $2);");
      js = js.replace(/digitalRead\s*\(\s*([^)]+)\s*\)/g, "__readPin($1)");
      js = js.replace(/analogRead\s*\(\s*([^)]+)\s*\)/g, "__readAnalog($1)");

      // 3. Time & Serial
      js = js.replace(/delay\s*\(\s*([^)]+)\s*\);/g, "// delay($1) ignored");
      js = js.replace(/pinMode\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/g, "");
      js = js.replace(/Serial\.begin\s*\([^)]+\);/g, "");
      js = js.replace(/Serial\.println\s*\((.*?)\);/g, `__log($1);`);
      js = js.replace(/Serial\.print\s*\((.*?)\);/g, `__log($1);`);

      // 5. Constants
      js = js.replace(/\bHIGH\b/g, "1").replace(/\bLOW\b/g, "0");
      js = js.replace(/\bINPUT\b/g, "'INPUT'").replace(/\bOUTPUT\b/g, "'OUTPUT'");
      // Simple recursive string replace for A0-A5 (better than chain)
      for(let i=0; i<=5; i++) js = js.replace(new RegExp(`\\bA${i}\\b`, 'g'), `"A${i}"`);

      // 6. Function Definitions (void setup() -> function setup())
      js = js.replace(/void\s+setup\s*\(\)\s*/g, "function setup() ");
      js = js.replace(/void\s+loop\s*\(\)\s*/g, "function loop() ");

      // 7. Add Return Statement for Extraction
      js += "\nreturn { setup, loop };";

      // 2. Evaluate Transpiled Code in a Sandbox
      const createSandboxedClosure = (codeStr: string) => {
        // eslint-disable-next-line no-new-func
        return new Function(
          "__writePin", "__pwmPin", "__readPin", "__readAnalog", "__log",
          `
          const pinMode = () => {}; 
          ${codeStr}
          `
        )(__writePin, __pwmPin, __readPin, __readAnalog, __log);
      };

      const closure = createSandboxedClosure(js);
      userCodeClosure.current = { setup: closure.setup, loop: closure.loop };

      logToConsole("Code compiled (Regex). Starting...", "system");
      setSimState((prev) => ({ ...prev, isRunning: true }));

      if (userCodeClosure.current.setup) {
        userCodeClosure.current.setup();
      }

      startLoop();
      requestRef.current = requestAnimationFrame(physicsTick);

    } catch (err: any) {
         // FALLBACK: AI Transpilation
         logToConsole(`Standard compilation failed (${err.message}). Trying AI Compiler...`, "system");
         
         // FALLBACK: AI Transpilation
         logToConsole(`Standard compilation failed (${err.message}). Trying AI Compiler...`, "system");
         
         const apiKey = getGeminiApiKey();
         if (!apiKey) {
            logToConsole("Compilation failed and no API Key for AI fallback.", "error");
            return;
         }

         try {
             // Dynamic import to avoid circular dependency potentially
             const { transpileCode } = await import("../services/geminiService");
             // Request cohesive JS script
             const aiCode = await transpileCode(apiKey, "gemini-3-flash-preview", code);
             
             const createAiClosure = (script: string) => {
                 return new Function(
                    "__writePin", "__pwmPin", "__readPin", "__readAnalog", "__log",
                    `const pinMode = () => {}; 
                     ${script}`
                 )(__writePin, __pwmPin, __readPin, __readAnalog, __log);
             };

             const aiClosure = createAiClosure(aiCode);

             userCodeClosure.current = {
                setup: aiClosure.setup,
                loop: aiClosure.loop,
             };

             logToConsole("AI Compilation successful! Starting...", "system");
             setSimState((prev) => ({ ...prev, isRunning: true }));
             
             if (userCodeClosure.current.setup) userCodeClosure.current.setup();
             startLoop();
             requestRef.current = requestAnimationFrame(physicsTick);

         } catch (aiErr: any) {
             console.error(aiErr);
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
