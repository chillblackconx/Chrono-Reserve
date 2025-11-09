import React, { useState } from 'react';
import * as storage from '../utils/storage';
import { User } from '../types';

interface AuthScreenProps {
    onLoginSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSocialLogin = (provider: string) => {
        // Mock social login
        const mockUser: User = { id: 'social_' + Date.now(), name: `${provider} User`, email: `user@${provider.toLowerCase()}.com`};
        onLoginSuccess(mockUser);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLoginView) {
                result = await storage.loginUser(email, password);
            } else {
                result = await storage.registerUser(name, email, password);
            }

            if ('error' in result) {
                setError(result.error);
            } else {
                onLoginSuccess(result);
            }
        } catch (err) {
            setError('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8">
                <h1 className="text-3xl font-bold text-center text-cyan-300 mb-2">Chrono-Réserve</h1>
                <h2 className="text-xl font-semibold text-center text-gray-400 mb-8">{isLoginView ? 'Connexion' : 'Créer un compte'}</h2>

                <div className="space-y-4">
                    <button onClick={() => handleSocialLogin('Google')} className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.641-3.657-11.28-8.588l-6.521 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                        Continuer avec Google
                    </button>
                    <button onClick={() => handleSocialLogin('Microsoft')} className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        <svg className="w-6 h-6" viewBox="0 0 23 23"><path fill="#f3f3f3" d="M1 1h10v10H1z" transform="translate(0,0)" style={{fill:'#F25022'}}/><path fill="#f3f3f3" d="M1 1h10v10H1z" transform="translate(11,0)" style={{fill:'#7FBA00'}}/><path fill="#f3f3f3" d="M1 1h10v10H1z" transform="translate(0,11)" style={{fill:'#00A4EF'}}/><path fill="#f3f3f3" d="M1 1h10v10H1z" transform="translate(11,11)" style={{fill:'#FFB900'}}/></svg>
                        Continuer avec Microsoft
                    </button>
                </div>
                
                <div className="my-6 flex items-center">
                    <hr className="flex-grow border-gray-600" />
                    <span className="mx-4 text-gray-500 text-sm">OU</span>
                    <hr className="flex-grow border-gray-600" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginView && (
                        <input type="text" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    )}
                    <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
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