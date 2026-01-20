import React from 'react';
import { ComponentData } from '../types';
import { Cpu, Zap, Activity, HardDrive } from 'lucide-react';

interface Props {
  component: ComponentData;
  onSelect: (c: ComponentData) => void;
}

const ComponentCard: React.FC<Props> = ({ component, onSelect }) => {
  const getIcon = () => {
    switch (component.type) {
      case 'MICROCONTROLLER': return <Cpu className="w-6 h-6 text-blue-400" />;
      case 'POWER': return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'ACTUATOR': return <Activity className="w-6 h-6 text-green-400" />;
      default: return <HardDrive className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div 
      onClick={() => onSelect(component)}
      className="p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-750 hover:border-blue-500 transition-all group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gray-900 rounded-md group-hover:scale-110 transition-transform">
          {getIcon()}
        </div>
        <h3 className="font-semibold text-sm text-gray-200">{component.name}</h3>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2">{component.description}</p>
    </div>
  );
};

export default ComponentCard;