import { User } from '../types';

export interface SplashConfig {
    message: string;
    gradientStart: string;
    gradientEnd: string;
}

export interface ScheduleConfig {
    startHour: number;
    endHour: number;
}

interface MockUser extends User {
    passwordHash: string; // For mock purposes, not secure
}

interface StorageData {
    bookings: { [date: string]: string[] };
    splashConfig: SplashConfig;
    globalMessage: string;
    scheduleConfig: ScheduleConfig;
    users: MockUser[];
}

const STORAGE_KEY = 'chronoReserveData';
const SESSION_USER_KEY = 'chronoReserveUser';

const getInitialData = (): StorageData => ({
    bookings: {},
    splashConfig: {
        message: 'Bienvenue dans le Futur',
        gradientStart: '#1f2937',
        gradientEnd: '#000000',
    },
    globalMessage: 'Annonce importante : la maintenance est prévue ce week-end.',
    scheduleConfig: {
        startHour: 9,
        endHour: 15,
    },
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

// --- Splash Config ---
export const getSplashConfig = (): SplashConfig => getData().splashConfig;
export const setSplashConfig = (config: SplashConfig) => {
    const data = getData();
    data.splashConfig = config;
    saveData(data);
};

// --- Global Message ---
export const getGlobalMessage = (): string => getData().globalMessage;
export const setGlobalMessage = (message: string) => {
    const data = getData();
    data.globalMessage = message;
    saveData(data);
};

// --- Schedule Config ---
export const getScheduleConfig = (): ScheduleConfig => getData().scheduleConfig;
export const setScheduleConfig = (config: ScheduleConfig) => {
    const data = getData();
    data.scheduleConfig = config;
    saveData(data);
};

// --- Auth ---
export const registerUser = async (name: string, email: string, password: string): Promise<User | { error: string }> => {
    const data = getData();
    if (data.users.find(u => u.email === email)) {
        return { error: 'Cet e-mail est déjà utilisé.' };
    }
    const newUser: MockUser = {
        id: Date.now().toString(),
        name,
        email,
        passwordHash: password // In a real app, hash this!
    };
    data.users.push(newUser);
    saveData(data);
    const { passwordHash, ...user } = newUser;
    return user;
};

export const loginUser = async (email: string, password: string): Promise<User | { error: string }> => {
    const data = getData();
    const foundUser = data.users.find(u => u.email === email);
    if (!foundUser || foundUser.passwordHash !== password) {
        return { error: 'E-mail ou mot de passe incorrect.' };
    }
    const { passwordHash, ...user } = foundUser;
    return user;
};

export const setCurrentUser = (user: User) => {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = sessionStorage.getItem(SESSION_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch {
        return null;
    }
};

export const logoutUser = () => {
    sessionStorage.removeItem(SESSION_USER_KEY);
};