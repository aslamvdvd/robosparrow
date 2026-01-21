import { ComponentData, ComponentType } from './types';

export const COMPONENT_LIBRARY: ComponentData[] = [
  {
    id: 'arduino-uno',
    type: ComponentType.MICROCONTROLLER,
    name: 'Arduino Uno R3',
    description: 'The standard Arduino board. ATmega328P based.',
    width: 260,
    height: 190,
    pins: [
      // --- Digital High Side (Top, Right to Left) ---
      // SCL/SDA are past D13
      { id: 'SCL', name: 'SCL', type: 'digital', x: 20, y: 10 },
      { id: 'SDA', name: 'SDA', type: 'digital', x: 32, y: 10 },
      { id: 'AREF', name: 'AREF', type: 'digital', x: 44, y: 10 },
      { id: 'GND_DIG', name: 'GND', type: 'ground', x: 56, y: 10 },
      { id: 'D13', name: 'D13', type: 'digital', x: 68, y: 10 },
      { id: 'D12', name: 'D12', type: 'digital', x: 80, y: 10 },
      { id: 'D11', name: 'D11', type: 'digital', x: 92, y: 10 },
      { id: 'D10', name: 'D10', type: 'digital', x: 104, y: 10 },
      { id: 'D9', name: 'D9', type: 'digital', x: 116, y: 10 },
      { id: 'D8', name: 'D8', type: 'digital', x: 128, y: 10 },
      
      // Gap
      { id: 'D7', name: 'D7', type: 'digital', x: 152, y: 10 },
      { id: 'D6', name: 'D6', type: 'digital', x: 164, y: 10 },
      { id: 'D5', name: 'D5', type: 'digital', x: 176, y: 10 },
      { id: 'D4', name: 'D4', type: 'digital', x: 188, y: 10 },
      { id: 'D3', name: 'D3', type: 'digital', x: 200, y: 10 },
      { id: 'D2', name: 'D2', type: 'digital', x: 212, y: 10 },
      { id: 'D1', name: 'TX>1', type: 'digital', x: 224, y: 10 },
      { id: 'D0', name: 'RX<0', type: 'digital', x: 236, y: 10 },

      // --- Analog & Power Low Side (Bottom, Left to Right) ---
      // Power Header
      // NC, IOREF, RESET, 3V3, 5V, GND, GND, VIN
      { id: 'NC', name: 'NC', type: 'digital', x: 170, y: 175 }, // Placeholder/Empty
      { id: 'IOREF', name: 'IOREF', type: 'power', x: 158, y: 175 },
      { id: 'RESET', name: 'RESET', type: 'digital', x: 146, y: 175 },
      { id: '3V3', name: '3.3V', type: 'power', x: 134, y: 175 },
      { id: '5V', name: '5V', type: 'power', x: 122, y: 175 },
      { id: 'GND_1', name: 'GND', type: 'ground', x: 110, y: 175 },
      { id: 'GND_2', name: 'GND', type: 'ground', x: 98, y: 175 },
      { id: 'VIN', name: 'VIN', type: 'power', x: 86, y: 175 },

      // Analog Header Gap
      { id: 'A0', name: 'A0', type: 'analog', x: 62, y: 175 },
      { id: 'A1', name: 'A1', type: 'analog', x: 50, y: 175 },
      { id: 'A2', name: 'A2', type: 'analog', x: 38, y: 175 },
      { id: 'A3', name: 'A3', type: 'analog', x: 26, y: 175 },
      { id: 'A4', name: 'A4', type: 'analog', x: 14, y: 175 },
      { id: 'A5', name: 'A5', type: 'analog', x: 2, y: 175 },

      // --- ICSP Headers (Mid-board) ---
      // ICSP (Main, near AtMega328)
      { id: 'ICSP_MISO', name: 'MISO', type: 'digital', x: 245, y: 85 },
      { id: 'ICSP_VCC', name: 'VCC', type: 'power', x: 245, y: 95 },
      { id: 'ICSP_SCK', name: 'SCK', type: 'digital', x: 235, y: 85 },
      { id: 'ICSP_MOSI', name: 'MOSI', type: 'digital', x: 235, y: 95 },
      { id: 'ICSP_RST', name: 'RST', type: 'digital', x: 225, y: 85 },
      { id: 'ICSP_GND', name: 'GND', type: 'ground', x: 225, y: 95 },
    ]
  },
  {
    id: 'motor-driver-l298n',
    type: ComponentType.BOARD,
    name: 'L298N Motor Driver',
    description: 'Dual H-Bridge motor driver for DC motors.',
    width: 120,
    height: 120,
    pins: [
      { id: 'IN1', name: 'IN1', type: 'digital', x: 10, y: 20 },
      { id: 'IN2', name: 'IN2', type: 'digital', x: 10, y: 40 },
      { id: 'IN3', name: 'IN3', type: 'digital', x: 10, y: 80 },
      { id: 'IN4', name: 'IN4', type: 'digital', x: 10, y: 100 },
      { id: 'OUT1', name: 'OUT1', type: 'power', x: 110, y: 20 }, // Motor A
      { id: 'OUT2', name: 'OUT2', type: 'power', x: 110, y: 40 },
      { id: 'OUT3', name: 'OUT3', type: 'power', x: 110, y: 80 }, // Motor B
      { id: 'OUT4', name: 'OUT4', type: 'power', x: 110, y: 100 },
      { id: '12V', name: '12V', type: 'power', x: 60, y: 110 },
      { id: 'GND', name: 'GND', type: 'ground', x: 60, y: 10 },
    ]
  },
  {
    id: 'dc-motor-wheel',
    type: ComponentType.ACTUATOR,
    name: 'DC Motor + Wheel',
    description: 'Standard yellow DC Gear Motor with Wheel.',
    width: 100,
    height: 100,
    pins: [
      { id: 'POS', name: '+', type: 'power', x: 10, y: 40 },
      { id: 'NEG', name: '-', type: 'ground', x: 10, y: 60 },
    ],
    properties: {
      position: 'left' // or right
    }
  },
  {
    id: 'battery-9v',
    type: ComponentType.POWER,
    name: '9V Battery',
    description: 'Standard 9V power source.',
    width: 80,
    height: 120,
    pins: [
      { id: 'POS', name: '+', type: 'power', x: 40, y: 10 },
      { id: 'NEG', name: '-', type: 'ground', x: 60, y: 10 },
    ]
  }
];

export const INITIAL_CODE = `// RoboLab v1.0
// Write standard Arduino-like JavaScript
// Available globals: digitalWrite(pin, val), delay(ms), console.log(msg)

let speed = 255;

function setup() {
  console.log("RoboCar Initialized");
  // Motor A (Left)
  pinMode(5, 'OUTPUT'); 
  pinMode(6, 'OUTPUT');
  
  // Motor B (Right)
  pinMode(9, 'OUTPUT');
  pinMode(10, 'OUTPUT');
}

function loop() {
  console.log("Driving Forward");
  
  // Left Motor Forward
  digitalWrite(5, HIGH);
  digitalWrite(6, LOW);
  
  // Right Motor Forward
  digitalWrite(9, HIGH);
  digitalWrite(10, LOW);
  
  delay(1000);
  
  console.log("Stopping");
  digitalWrite(5, LOW);
  digitalWrite(9, LOW);
  
  delay(500);
}
`;
