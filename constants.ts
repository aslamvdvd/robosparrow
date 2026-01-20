import { ComponentData, ComponentType } from './types';

export const COMPONENT_LIBRARY: ComponentData[] = [
  {
    id: 'arduino-uno',
    type: ComponentType.MICROCONTROLLER,
    name: 'Arduino Uno R3',
    description: 'The classic microcontroller board based on the ATmega328P.',
    width: 200,
    height: 150,
    pins: [
      { id: 'D2', name: 'D2', type: 'digital', x: 180, y: 10 },
      { id: 'D3', name: 'D3', type: 'digital', x: 180, y: 25 },
      { id: 'D4', name: 'D4', type: 'digital', x: 180, y: 40 },
      { id: 'D5', name: 'D5', type: 'digital', x: 180, y: 55 },
      { id: 'D6', name: 'D6', type: 'digital', x: 180, y: 70 },
      { id: 'D9', name: 'D9', type: 'digital', x: 180, y: 85 },
      { id: 'D10', name: 'D10', type: 'digital', x: 180, y: 100 },
      { id: 'D11', name: 'D11', type: 'digital', x: 180, y: 115 },
      { id: 'GND', name: 'GND', type: 'ground', x: 20, y: 130 },
      { id: '5V', name: '5V', type: 'power', x: 20, y: 115 },
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
