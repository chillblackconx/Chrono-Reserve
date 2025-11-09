import React, { useState } from 'react';
import * as storage from '../utils/storage';
import { User } from '../types';

interface AuthScreenProps {
    onLoginSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => { // Simulate network latency
            try {
                if (isLoginView) {
                    const user = storage.loginUser(username, password);
                    if (user) {
                        onLoginSuccess(user);
                    } else {
                        setError('Nom d\'utilisateur ou mot de passe incorrect.');
                    }
                } else {
                    if(!name || !username || !password) {
                        setError('Tous les champs sont requis.');
                        setLoading(false);
                        return;
                    }
                    const result = storage.registerUser(name, username, password);
                    if (result.success) {
                        setIsLoginView(true); // Switch to login view after successful registration
                    } else {
                        setError(result.message);
                    }
                }
            } catch (err) {
                setError('Une erreur est survenue.');
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8">
                <h1 className="text-3xl font-bold text-center text-cyan-300 mb-2">Chrono-Réserve</h1>
                <h2 className="text-xl font-semibold text-center text-gray-400 mb-8">{isLoginView ? 'Connexion' : 'Créer un compte'}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginView && (
                        <input type="text" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    )}
                    <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    
                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full mt-4 bg-cyan-600 text-white font-bold py-3 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-gray-500">
                        {loading ? 'Chargement...' : (isLoginView ? 'Se connecter' : 'Créer un compte')}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    {isLoginView ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-semibold text-cyan-400 hover:text-cyan-300 ml-2">
                        {isLoginView ? "S'inscrire" : "Se connecter"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;