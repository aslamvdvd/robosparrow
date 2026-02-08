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
    description: "ESP-WROOM-32 (30-pin DOIT V1).",
    width: 260,
    height: 140, // Wider to fit labels
    pins: [
       // Top Row (Left to Right when USB is Left) -> Actually usually USB is top or left.
       // Let's assume USB is at LEFT.
       // Top Row: EN, VP, VN, D34, D35, D32, D33, D25, D26, D27, D14, D12, GND, D13, D2
       // Coordinates: y=10, x increments
       { id: "3V3", name: "3V3", type: "power", x: 20, y: 10 }, // VIN/3V3 often opposite
       { id: "EN", name: "EN", type: "digital", x: 35, y: 10 },
       { id: "VP", name: "VP", type: "analog", x: 50, y: 10 },
       { id: "VN", name: "VN", type: "analog", x: 65, y: 10 },
       { id: "D34", name: "D34", type: "digital", x: 80, y: 10 },
       { id: "D35", name: "D35", type: "digital", x: 95, y: 10 },
       { id: "D32", name: "D32", type: "digital", x: 110, y: 10 },
       { id: "D33", name: "D33", type: "digital", x: 125, y: 10 },
       { id: "D25", name: "D25", type: "digital", x: 140, y: 10 },
       { id: "D26", name: "D26", type: "digital", x: 155, y: 10 },
       { id: "D27", name: "D27", type: "digital", x: 170, y: 10 },
       { id: "D14", name: "D14", type: "digital", x: 185, y: 10 },
       { id: "D12", name: "D12", type: "digital", x: 200, y: 10 },
       { id: "GND_1", name: "GND", type: "ground", x: 215, y: 10 },
       { id: "D13", name: "D13", type: "digital", x: 230, y: 10 },

       // Bottom Row (Left to Right)
       // Matches opposite side of board
       // VIN, GND, D13... wait standard pinout:
       // Top: EN, VP, VN, 34, 35, 32, 33, 25, 26, 27, 14, 12, GND, 13, D2
       // Bot: VIN, GND, 15, 2, 4, 16, 17, 5, 18, 19, 21, RX, TX, 22, 23
       { id: "VIN", name: "VIN", type: "power", x: 20, y: 130 },
       { id: "GND_2", name: "GND", type: "ground", x: 35, y: 130 },
       { id: "D15", name: "D15", type: "digital", x: 50, y: 130 },
       { id: "D2", name: "D2", type: "digital", x: 65, y: 130 },
       { id: "D4", name: "D4", type: "digital", x: 80, y: 130 },
       { id: "D16", name: " RX2", type: "digital", x: 95, y: 130 }, // D16
       { id: "D17", name: " TX2", type: "digital", x: 110, y: 130 }, // D17
       { id: "D5", name: "D5", type: "digital", x: 125, y: 130 },
       { id: "D18", name: "D18", type: "digital", x: 140, y: 130 },
       { id: "D19", name: "D19", type: "digital", x: 155, y: 130 },
       { id: "D21", name: "D21", type: "digital", x: 170, y: 130 },
       { id: "RX0", name: "RX0", type: "digital", x: 185, y: 130 },
       { id: "TX0", name: "TX0", type: "digital", x: 200, y: 130 },
       { id: "D22", name: "D22", type: "digital", x: 215, y: 130 },
       { id: "D23", name: "D23", type: "digital", x: 230, y: 130 },
    ],
  },
  {
    id: "pico-w",
    type: ComponentType.MICROCONTROLLER,
    name: "Raspberry Pi Pico W",
    description: "RP2040 (Silver) with Wi-Fi.",
    width: 280, // 40 pins needed
    height: 100,
    pins: [
       // Top Row (GP0 to GP19 ish)
       // Let's assume USB LEFT.
       // Top: GP0, GP1, GND, GP2, GP3, GP4, GP5, GND, GP6, GP7, GP8, GP9, GND, GP10, GP11, GP12, GP13, GND, GP14, GP15
       { id: "GP0", name: "GP0", type: "digital", x: 25, y: 10 },
       { id: "GP1", name: "GP1", type: "digital", x: 37, y: 10 },
       { id: "GND_1", name: "GND", type: "ground", x: 49, y: 10 },
       { id: "GP2", name: "GP2", type: "digital", x: 61, y: 10 },
       { id: "GP3", name: "GP3", type: "digital", x: 73, y: 10 },
       { id: "GP4", name: "GP4", type: "digital", x: 85, y: 10 },
       { id: "GP5", name: "GP5", type: "digital", x: 97, y: 10 },
       { id: "GND_2", name: "GND", type: "ground", x: 109, y: 10 },
       { id: "GP6", name: "GP6", type: "digital", x: 121, y: 10 },
       { id: "GP7", name: "GP7", type: "digital", x: 133, y: 10 },
       { id: "GP8", name: "GP8", type: "digital", x: 145, y: 10 },
       { id: "GP9", name: "GP9", type: "digital", x: 157, y: 10 },
       { id: "GND_3", name: "GND", type: "ground", x: 169, y: 10 },
       { id: "GP10", name: "GP10", type: "digital", x: 181, y: 10 },
       { id: "GP11", name: "GP11", type: "digital", x: 193, y: 10 },
       { id: "GP12", name: "GP12", type: "digital", x: 205, y: 10 },
       { id: "GP13", name: "GP13", type: "digital", x: 217, y: 10 },
       { id: "GND_4", name: "GND", type: "ground", x: 229, y: 10 },
       { id: "GP14", name: "GP14", type: "digital", x: 241, y: 10 },
       { id: "GP15", name: "GP15", type: "digital", x: 253, y: 10 },

       // Bottom Row (VBUS, VSYS... to GP16)
       // VBUS, VSYS, GND, 3V3_EN, 3V3, VREF, GP28, GND, GP27, GP26, RUN, GP22, GND, GP21, GP20, GP19, GP18, GND, GP17, GP16
       { id: "VBUS", name: "VBUS", type: "power", x: 25, y: 90 },
       { id: "VSYS", name: "VSYS", type: "power", x: 37, y: 90 },
       { id: "GND_5", name: "GND", type: "ground", x: 49, y: 90 },
       { id: "3V3_EN", name: "3V3E", type: "digital", x: 61, y: 90 }, // Label short
       { id: "3V3_OUT", name: "3V3", type: "power", x: 73, y: 90 },
       { id: "ADC_VREF", name: "VREF", type: "power", x: 85, y: 90 },
       { id: "GP28", name: "GP28", type: "analog", x: 97, y: 90 },
       { id: "GND_6", name: "GND", type: "ground", x: 109, y: 90 },
       { id: "GP27", name: "GP27", type: "analog", x: 121, y: 90 },
       { id: "GP26", name: "GP26", type: "analog", x: 133, y: 90 },
       { id: "RUN", name: "RUN", type: "digital", x: 145, y: 90 },
       { id: "GP22", name: "GP22", type: "digital", x: 157, y: 90 },
       { id: "GND_7", name: "GND", type: "ground", x: 169, y: 90 },
       { id: "GP21", name: "GP21", type: "digital", x: 181, y: 90 },
       { id: "GP20", name: "GP20", type: "digital", x: 193, y: 90 },
       { id: "GP19", name: "GP19", type: "digital", x: 205, y: 90 },
       { id: "GP18", name: "GP18", type: "digital", x: 217, y: 90 },
       { id: "GND_8", name: "GND", type: "ground", x: 229, y: 90 },
       { id: "GP17", name: "GP17", type: "digital", x: 241, y: 90 },
       { id: "GP16", name: "GP16", type: "digital", x: 253, y: 90 },
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
