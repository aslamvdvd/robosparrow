import React from 'react';
import { Cpu, Code2, Zap, ArrowRight, Layout, Terminal } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const Landing: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Terminal className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">RoboLab</span>
          </div>
          <div>
            <button 
              onClick={onStart}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Enter Studio
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-700 text-blue-400 text-xs font-medium mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now in Public Beta
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Master Robotics<br />
            <span className="text-blue-500">Zero Hardware Cost</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Design, wire, and code your own robots in a powerful browser-based simulator. 
            Bridge the gap between curiosity and creation without spending a dime on components.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-blue-900/20"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl font-semibold text-lg border border-gray-800 transition-all">
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Layout className="w-8 h-8 text-purple-400" />}
            title="Virtual Workbench"
            description="Drag and drop Arduinos, breadboards, motors, and sensors onto an infinite canvas. Wire them up just like real life."
          />
          <FeatureCard 
            icon={<Code2 className="w-8 h-8 text-green-400" />}
            title="Real-time Coding"
            description="Write C++/JS code to control your microcontroller. Our physics engine simulates logic levels and PWM instantly."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="AI Assistance"
            description="Stuck on a bug? Our built-in Gemini AI helps analyze your circuit and debug your code in real-time."
          />
        </div>
      </div>

      {/* Preview Image / Graphic */}
      <div className="max-w-6xl mx-auto px-6 pb-32">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 shadow-2xl">
           <div className="aspect-video w-full bg-gray-950 rounded-lg relative overflow-hidden flex items-center justify-center border border-gray-800/50">
             <div className="absolute inset-0 grid-pattern opacity-30"></div>
             {/* Abstract Representation of the Studio */}
             <div className="flex gap-8 opacity-75">
                <div className="w-32 h-40 border-2 border-teal-600 bg-teal-900/20 rounded flex items-center justify-center text-teal-500 font-mono text-xs">Arduino</div>
                <div className="w-40 h-40 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center text-gray-600 font-mono">Physics Engine</div>
                <div className="w-32 h-40 border-2 border-yellow-600 bg-yellow-900/20 rounded flex items-center justify-center text-yellow-500 font-mono text-xs">Motor Driver</div>
             </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-70">
            <Terminal className="w-5 h-5" />
            <span className="font-semibold">RoboLab</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 RoboLab Simulation Systems. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 transition-all group">
    <div className="mb-6 p-4 bg-gray-950 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 border border-gray-800">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-100 mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">
      {description}
    </p>
  </div>
)

export default Landing;