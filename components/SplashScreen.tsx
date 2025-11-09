import React from 'react';
import { SplashConfig } from '../utils/storage';

interface SplashScreenProps {
  config: SplashConfig;
  onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ config, onEnter }) => {
  const gradientStyle = {
    background: `radial-gradient(ellipse at top, ${config.gradientStart}, ${config.gradientEnd})`,
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white"
      style={gradientStyle}
    >
      <div className="text-center animate-fade-in-down">
        <h1 className="text-5xl md:text-7xl font-bold text-cyan-300 tracking-widest uppercase" style={{ textShadow: '0 0 8px #0891b2, 0 0 16px #0891b2' }}>
          Chrono-Réserve
        </h1>
        <p className="text-gray-300 mt-4 text-lg md:text-xl">
          {config.message}
        </p>
      </div>
      <button
        onClick={onEnter}
        className="mt-12 animate-fade-in-up bg-cyan-500 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-cyan-400 transition-transform duration-300 hover:scale-105 shadow-[0_0_15px_rgba(72,209,204,0.6)] hover:shadow-[0_0_25px_rgba(72,209,204,0.8)]"
      >
        Entrer
      </button>
    </div>
  );
};

export default SplashScreen;