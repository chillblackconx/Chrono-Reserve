import { User } from '../types';

interface StoredUser extends User {
    passwordHash: string; // For simulation, we'll store a mock hash
}

interface StorageData {
    bookings: { [date: string]: string[] };
    users: StoredUser[];
}

const STORAGE_KEY = 'chronoReserveData_v2';

// --- Hashing Simulation ---
// In a real app, use a library like bcrypt. This is just for demonstration.
const simpleHash = (s: string): string => {
    return 'hashed_' + s.split('').reverse().join('');
}

const getInitialData = (): StorageData => ({
    bookings: {},
    users: [],
});

export const getData = (): StorageData => {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) {
            const initialData = getInitialData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return initialData;
        }
        const parsed = JSON.parse(rawData);
        return { ...getInitialData(), ...parsed };
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return getInitialData();
    }
};

const saveData = (data: StorageData) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
};

// --- Auth ---
const SESSION_USER_KEY = 'chrono_session_user';

export const registerUser = (name: string, username: string, password: string): { success: boolean, message: string } => {
    const data = getData();
    if (data.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: "Ce nom d'utilisateur est déjà pris." };
    }
    const newUser: StoredUser = {
        name,
        username,
        passwordHash: simpleHash(password)
    };
    data.users.push(newUser);
    saveData(data);
    return { success: true, message: 'Compte créé avec succès !' };
};

export const loginUser = (username: string, password: string): User | null => {
    const data = getData();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.passwordHash === simpleHash(password)) {
        const sessionUser: User = { username: user.username, name: user.name };
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(sessionUser));
        return sessionUser;
    }
    return null;
};

export const logoutUser = () => {
    sessionStorage.removeItem(SESSION_USER_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = sessionStorage.getItem(SESSION_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch {
        return null;
    }
};


// --- Bookings ---
export const getBookingsForDate = (date: Date): string[] => {
    const data = getData();
    const dateString = date.toISOString().split('T')[0];
    return data.bookings[dateString] || [];
};

export const addBooking = (date: Date, timeSlots: string[]) => {
    const data = getData();
    const dateString = date.toISOString().split('T')[0];
    const existingBookings = data.bookings[dateString] || [];
    const newBookings = [...new Set([...existingBookings, ...timeSlots])];
    data.bookings[dateString] = newBookings.sort();
    saveData(data);
};

export const removeBooking = (date: Date, timeSlot: string) => {
    const data = getData();
    const dateString = date.toISOString().split('T')[0];
    if (data.bookings[dateString]) {
        data.bookings[dateString] = data.bookings[dateString].filter(t => t !== timeSlot);
        if(data.bookings[dateString].length === 0) {
            delete data.bookings[dateString];
        }
    }
    saveData(data);
};

// --- Hardcoded Configs (previously in storage) ---
export const getScheduleConfig = () => ({ startHour: 9, endHour: 15 });
export const getGlobalMessage = () => null; // No more global message
