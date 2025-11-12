import React, { useState } from 'react';
import * as storage from '../utils/storage';
import { User } from '../types';

interface AuthScreenProps {
    onLoginSuccess: (user: User) => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 21 21">
        <path fill="#f25022" d="M1 1h9v9H1z"/>
        <path fill="#00a4ef" d="M1 11h9v9H1z"/>
        <path fill="#7fba00" d="M11 1h9v9h-9z"/>
        <path fill="#ffb900" d="M11 11h9v9h-9z"/>
    </svg>
);


const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLoginView) {
                const user = await storage.loginUser(email, password);
                if (user) {
                    onLoginSuccess(user);
                } else {
                    setError('Adresse e-mail ou mot de passe incorrect.');
                    setLoading(false);
                }
            } else {
                if(!name || !email || !password) {
                    setError('Tous les champs sont requis.');
                    setLoading(false);
                    return;
                }
                const result = await storage.registerUser(name, email, password);
                if (result.success) {
                    setIsLoginView(true);
                    setError('');
                    alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError('Une erreur est survenue.');
        } finally {
            if (!isLoginView) {
                setLoading(false);
            }
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
        setError('');
        setLoading(true);
        const loginFn = provider === 'google' ? storage.signInWithGoogle : storage.signInWithMicrosoft;
        try {
            const user = await loginFn();
            if (user) {
                onLoginSuccess(user);
            } else {
                setError(`Impossible de se connecter avec ${provider}.`);
                setLoading(false);
            }
        } catch (error: any) {
             if (error.code === 'auth/account-exists-with-different-credential') {
                setError("Un compte existe déjà avec cet e-mail. Essayez un autre fournisseur.");
            } else {
                setError(`Une erreur est survenue lors de la connexion avec ${provider}.`);
            }
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8">
                <h1 className="text-3xl font-bold text-center text-cyan-300 mb-2">Chrono-Réserve</h1>
                <h2 className="text-xl font-semibold text-center text-gray-400 mb-8">{isLoginView ? 'Connexion' : 'Créer un compte'}</h2>
                
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {!isLoginView && (
                        <input type="text" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    )}
                    <input type="email" placeholder="Adresse e-mail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    
                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full mt-4 bg-cyan-600 text-white font-bold py-3 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {loading ? 'Chargement...' : (isLoginView ? 'Se connecter' : 'Créer un compte')}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="mx-4 flex-shrink text-sm text-gray-400">Ou</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => handleSocialLogin('google')} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 hover:bg-gray-600 transition-colors disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <GoogleIcon />
                        <span>Continuer avec Google</span>
                    </button>
                     <button onClick={() => handleSocialLogin('microsoft')} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 hover:bg-gray-600 transition-colors disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <MicrosoftIcon />
                        <span>Continuer avec Microsoft</span>
                    </button>
                </div>


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