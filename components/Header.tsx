import React from 'react';
import { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => (
  <header className="relative text-center p-6 md:p-10">
    <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 tracking-widest uppercase" style={{ textShadow: '0 0 8px #0891b2, 0 0 16px #0891b2' }}>
      Chrono-Réserve
    </h1>
    {user && (
        <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="text-gray-300 hidden sm:inline">Bonjour, {user.name}</span>
            <button
                onClick={onLogout}
                className="bg-cyan-800/70 text-cyan-200 font-bold py-2 px-4 rounded-md hover:bg-cyan-700 transition-colors border border-cyan-700"
            >
                Déconnexion
            </button>
        </div>
    )}
  </header>
);

export default Header;