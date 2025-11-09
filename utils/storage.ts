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

interface StorageData {
    bookings: { [date: string]: string[] };
    splashConfig: SplashConfig;
    globalMessage: string;
    scheduleConfig: ScheduleConfig;
}

const STORAGE_KEY = 'chronoReserveData';

const getInitialData = (): StorageData => ({
    bookings: {},
    splashConfig: {
        message: 'Réservez votre futur',
        gradientStart: '#1f2937',
        gradientEnd: '#000000',
    },
    globalMessage: 'Annonce importante : Maintenance prévue ce week-end.',
    scheduleConfig: {
        startHour: 9,
        endHour: 15,
    },
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
        // Merge with initial data to ensure all keys are present, even if storage is old
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
