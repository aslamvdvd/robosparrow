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
      // Power Header (Left Side)
      // NC, IOREF, RESET, 3V3, 5V, GND, GND, VIN
      { id: 'NC', name: 'NC', type: 'digital', x: 20, y: 175 }, 
      { id: 'IOREF', name: 'IOREF', type: 'power', x: 32, y: 175 },
      { id: 'RESET', name: 'RESET', type: 'digital', x: 44, y: 175 },
      { id: '3V3', name: '3.3V', type: 'power', x: 56, y: 175 },
      { id: '5V', name: '5V', type: 'power', x: 68, y: 175 },
      { id: 'GND_1', name: 'GND', type: 'ground', x: 80, y: 175 },
      { id: 'GND_2', name: 'GND', type: 'ground', x: 92, y: 175 },
      { id: 'VIN', name: 'VIN', type: 'power', x: 104, y: 175 },

      // Analog Header (Right Side)
      { id: 'A0', name: 'A0', type: 'analog', x: 140, y: 175 },
      { id: 'A1', name: 'A1', type: 'analog', x: 152, y: 175 },
      { id: 'A2', name: 'A2', type: 'analog', x: 164, y: 175 },
      { id: 'A3', name: 'A3', type: 'analog', x: 176, y: 175 },
      { id: 'A4', name: 'A4', type: 'analog', x: 188, y: 175 },
      { id: 'A5', name: 'A5', type: 'analog', x: 200, y: 175 },

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
  },
  {
    id: "esp32-dev-v1",
    type: ComponentType.MICROCONTROLLER,
    name: "ESP32 Dev Module",
    description: "Powerful Wi-Fi + Bluetooth MCU (30-pin version).",
    width: 240,
    height: 120,
    pins: [
      // Left Side (Top to Bottom) - Antenna Up
      { id: "EN", name: "EN", type: "digital", x: 10, y: 10 },
      { id: "VP", name: "VP", type: "analog", x: 10, y: 20 },
      { id: "VN", name: "VN", type: "analog", x: 10, y: 30 },
      { id: "D34", name: "D34", type: "digital", x: 10, y: 40 },
      { id: "D35", name: "D35", type: "digital", x: 10, y: 50 },
      { id: "D32", name: "D32", type: "digital", x: 10, y: 60 },
      { id: "D33", name: "D33", type: "digital", x: 10, y: 70 },
      { id: "D25", name: "D25", type: "digital", x: 10, y: 80 },
      { id: "D26", name: "D26", type: "digital", x: 10, y: 90 },
      { id: "D27", name: "D27", type: "digital", x: 10, y: 100 },
      { id: "D14", name: "D14", type: "digital", x: 10, y: 110 },
      { id: "D12", name: "D12", type: "digital", x: 10, y: 120 },
      { id: "GND_L", name: "GND", type: "ground", x: 10, y: 130 },
      { id: "D13", name: "D13", type: "digital", x: 10, y: 140 },
      { id: "D2", name: "D2", type: "digital", x: 30, y: 154 }, // Onboard LED often D2

      // Right Side (Bottom to Top)
      { id: "D15", name: "D15", type: "digital", x: 230, y: 140 },
      { id: "D2", name: "D2", type: "digital", x: 230, y: 130 },
      { id: "D0", name: "D0", type: "digital", x: 230, y: 120 },
      { id: "D4", name: "D4", type: "digital", x: 230, y: 110 },
      { id: "D16", name: "D16", type: "digital", x: 230, y: 100 },
      { id: "D17", name: "D17", type: "digital", x: 230, y: 90 },
      { id: "D5", name: "D5", type: "digital", x: 230, y: 80 },
      { id: "D18", name: "D18", type: "digital", x: 230, y: 70 },
      { id: "D19", name: "D19", type: "digital", x: 230, y: 60 },
      { id: "GND_R", name: "GND", type: "ground", x: 230, y: 50 },
      { id: "D21", name: "D21", type: "digital", x: 230, y: 40 },
      { id: "RX0", name: "RX0", type: "digital", x: 230, y: 30 },
      { id: "TX0", name: "TX0", type: "digital", x: 230, y: 20 },
      { id: "D22", name: "D22", type: "digital", x: 230, y: 10 },
      { id: "D23", name: "D23", type: "digital", x: 215, y: 10 },
      { id: "VIN", name: "VIN", type: "power", x: 180, y: 154 },
      { id: "3V3", name: "3V3", type: "power", x: 200, y: 154 },
    ],
  },
  {
    id: "pico-w",
    type: ComponentType.MICROCONTROLLER,
    name: "Raspberry Pi Pico W",
    description: "RP2040 Dual Core ARM Cortex M0+ with Wi-Fi.",
    width: 200,
    height: 100,
    pins: [
      // Left Side (1-20)
      { id: "GP0", name: "GP0", type: "digital", x: 10, y: 10 },
      { id: "GP1", name: "GP1", type: "digital", x: 10, y: 20 },
      { id: "GND_1", name: "GND", type: "ground", x: 10, y: 30 },
      { id: "GP2", name: "GP2", type: "digital", x: 10, y: 40 },
      { id: "GP3", name: "GP3", type: "digital", x: 10, y: 50 },
      { id: "GP4", name: "GP4", type: "digital", x: 10, y: 60 },
      { id: "GP5", name: "GP5", type: "digital", x: 10, y: 70 },
      { id: "GND_2", name: "GND", type: "ground", x: 10, y: 80 },

      // Right Side (40-21)
      { id: "VBUS", name: "VBUS", type: "power", x: 190, y: 10 },
      { id: "VSYS", name: "VSYS", type: "power", x: 190, y: 20 },
      { id: "GND_3", name: "GND", type: "ground", x: 190, y: 30 },
      { id: "3V3_EN", name: "3V3_EN", type: "digital", x: 190, y: 40 },
      { id: "3V3_OUT", name: "3V3", type: "power", x: 190, y: 50 },
      { id: "ADC_VREF", name: "ADC_VREF", type: "power", x: 190, y: 60 },
      { id: "GP28_ADC2", name: "GP28", type: "analog", x: 190, y: 70 },
      { id: "GND_4", name: "GND", type: "ground", x: 190, y: 80 },
    ],
  },
  {
    id: "led-red",
    type: ComponentType.LED,
    name: "Red LED",
    description: "Standard 5mm Red Light Emitting Diode.",
    width: 40,
    height: 40,
    pins: [
      { id: "A", name: "A (+)", type: "power", x: 10, y: 30 },
      { id: "C", name: "C (-)", type: "ground", x: 30, y: 30 },
    ],
    properties: { color: "#ef4444" },
  },
  {
    id: "led-green",
    type: ComponentType.LED,
    name: "Green LED",
    description: "Standard 5mm Green Light Emitting Diode.",
    width: 40,
    height: 40,
    pins: [
      { id: "A", name: "A (+)", type: "power", x: 10, y: 30 },
      { id: "C", name: "C (-)", type: "ground", x: 30, y: 30 },
    ],
    properties: { color: "#22c55e" },
  },
  {
    id: "led-blue",
    type: ComponentType.LED,
    name: "Blue LED",
    description: "Standard 5mm Blue Light Emitting Diode.",
    width: 40,
    height: 40,
    pins: [
      { id: "A", name: "A (+)", type: "power", x: 10, y: 30 },
      { id: "C", name: "C (-)", type: "ground", x: 30, y: 30 },
    ],
    properties: { color: "#3b82f6" },
  },
  {
    id: "servo-sg90",
    type: ComponentType.ACTUATOR,
    name: "Micro Servo SG90",
    description: "Tiny and lightweight with high output power. Servo can rotate approximately 180 degrees.",
    width: 80,
    height: 60,
    pins: [
      { id: "SIG", name: "SIG", type: "digital", x: 10, y: 10 },
      { id: "VCC", name: "VCC", type: "power", x: 10, y: 30 },
      { id: "GND", name: "GND", type: "ground", x: 10, y: 50 },
    ],
  },
  {
    id: "sensor-ultrasonic",
    type: ComponentType.SENSOR,
    name: "Ultrasonic Sensor",
    description: "HC-SR04 distance measuring module.",
    width: 100,
    height: 60,
    pins: [
      { id: "VCC", name: "VCC", type: "power", x: 10, y: 50 },
      { id: "TRIG", name: "TRIG", type: "digital", x: 36, y: 50 },
      { id: "ECHO", name: "ECHO", type: "digital", x: 63, y: 50 },
      { id: "GND", name: "GND", type: "ground", x: 90, y: 50 },
    ],
  },
  {
    id: "sensor-ir",
    type: ComponentType.SENSOR,
    name: "IR Obstacle Sensor",
    description: "Infrared obstacle avoidance sensor module.",
    width: 80,
    height: 40,
    pins: [
      { id: "OUT", name: "OUT", type: "digital", x: 10, y: 20 },
      { id: "GND", name: "GND", type: "ground", x: 40, y: 20 },
      { id: "VCC", name: "VCC", type: "power", x: 70, y: 20 },
    ],
  },
  {
    id: "sensor-ldr",
    type: ComponentType.SENSOR,
    name: "Photoresistor",
    description: "Light Dependent Resistor (LDR) module.",
    width: 60,
    height: 60,
    pins: [
      { id: "VCC", name: "VCC", type: "power", x: 10, y: 50 },
      { id: "GND", name: "GND", type: "ground", x: 30, y: 50 },
      { id: "DO", name: "DO", type: "digital", x: 50, y: 50 },
    ],
  },
  {
    id: "breadboard-mini",
    type: ComponentType.BOARD,
    name: "Mini Breadboard",
    description: "170 Tie-points solderless breadboard.",
    width: 140,
    height: 100,
    pins: [
      // Top Rail
      { id: "T1", name: "1", type: "digital", x: 20, y: 10 },
      { id: "T2", name: "2", type: "digital", x: 35, y: 10 },
      { id: "T3", name: "3", type: "digital", x: 50, y: 10 },
      { id: "T4", name: "4", type: "digital", x: 65, y: 10 },
      { id: "T5", name: "5", type: "digital", x: 80, y: 10 },

      // Bottom Rail
      { id: "B1", name: "1", type: "digital", x: 20, y: 90 },
      { id: "B2", name: "2", type: "digital", x: 35, y: 90 },
      { id: "B3", name: "3", type: "digital", x: 50, y: 90 },
      { id: "B4", name: "4", type: "digital", x: 65, y: 90 },
      { id: "B5", name: "5", type: "digital", x: 80, y: 90 },
    ],
  },
];

export const INITIAL_CODE = `// Write your code here...
`;
