import React, { useState, useEffect } from 'react';
import * as storage from '../utils/storage';

const ADMIN_PASSWORD = 'F_u_T_u_R_3_@d_M_!_n_P_@_N_3_L';
const SESSION_KEY = 'admin_session_active';

const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookings, setBookings] = useState<string[]>([]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (sessionStorage.getItem(SESSION_KEY) === 'true') {
                 sessionStorage.removeItem(SESSION_KEY);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        if (sessionStorage.getItem(SESSION_KEY) === 'true') {
            setIsAuthenticated(true);
        }

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);
    
    useEffect(() => {
        if(isAuthenticated) {
            const date = new Date(selectedDate);
            const timezoneOffset = date.getTimezoneOffset() * 60000;
            setBookings(storage.getBookingsForDate(new Date(date.getTime() + timezoneOffset)));
        }
    }, [selectedDate, isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (sessionStorage.getItem(SESSION_KEY) && sessionStorage.getItem(SESSION_KEY) !== 'true') {
            setError("Une session administrateur est déjà active dans un autre onglet.");
            return;
        }
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Mot de passe incorrect.');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
    };

    const handleDeleteBooking = (timeSlot: string) => {
        const date = new Date(selectedDate);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + timezoneOffset);

        if (window.confirm(`Voulez-vous vraiment supprimer la réservation de ${timeSlot} pour le ${adjustedDate.toLocaleDateString('fr-FR')} ?`)) {
            storage.removeBooking(adjustedDate, timeSlot);
            setBookings(storage.getBookingsForDate(adjustedDate));
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-2xl shadow-cyan-500/20 w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-center text-cyan-300 mb-6">Accès Administrateur</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        className="w-full bg-gray-700 text-white p-3 rounded-md border-2 border-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button type="submit" className="w-full mt-4 bg-cyan-600 text-white font-bold py-3 rounded-md hover:bg-cyan-500 transition-colors">
                        Connexion
                    </button>
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                </form>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-cyan-300">Panneau d'Administration</h1>
                <button onClick={handleLogout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition-colors">Déconnexion</button>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Gestion des Réservations</h2>
                <label className="block mb-2 text-sm text-gray-400">Sélectionner une date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 mb-4" />
                
                <h3 className="text-lg font-bold mb-2">Réservations pour le {new Date(selectedDate).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}</h3>
                {bookings.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {bookings.map(time => (
                            <li key={time} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                <span className="font-mono text-cyan-300">{time}</span>
                                <button onClick={() => handleDeleteBooking(time)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Supprimer</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">Aucune réservation pour cette date.</p>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;