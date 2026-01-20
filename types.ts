export enum ComponentType {
  MICROCONTROLLER = 'MICROCONTROLLER',
  ACTUATOR = 'ACTUATOR',
  SENSOR = 'SENSOR',
  POWER = 'POWER',
  BOARD = 'BOARD'
}

export interface Pin {
  id: string;
  name: string;
  type: 'digital' | 'analog' | 'power' | 'ground';
  x: number; // Relative position on component
  y: number;
}

export interface ComponentData {
  id: string;
  type: ComponentType;
  name: string;
  description: string;
  image?: string; // Placeholder or icon name
  pins: Pin[];
  width: number;
  height: number;
  properties?: Record<string, any>;
}

export interface PlacedComponent extends ComponentData {
  uid: string; // Unique instance ID
  position: { x: number; y: number };
}

export interface Connection {
  id: string;
  fromCompUid: string;
  fromPinId: string;
  toCompUid: string;
  toPinId: string;
  color: string;
}

export interface SimulationState {
  isRunning: boolean;
  time: number;
  logs: string[];
  robotPosition: { x: number; y: number; rotation: number };
  pinStates: Record<string, number>; // key: "compUid-pinId", value: voltage/logic level
}

export type LogType = 'info' | 'error' | 'system';

export interface ConsoleLog {
  id: string;
  message: string;
  type: LogType;
  timestamp: number;
}