import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('userTheme');
            if (savedTheme) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const toggleTheme = async (value) => {
        setIsDark(value);
        try {
            await AsyncStorage.setItem('userTheme', value ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const theme = {
        isDark,
        colors: isDark ? {
            background: '#121212',
            card: '#242424',
            text: '#e0e0e0',
            subText: '#a0a0a0',
            primary: '#81c784',
            border: '#404040',
            header: '#1b5e20',
            danger: '#ef5350',
        } : {
            background: '#f8f9fa',
            card: '#ffffff',
            text: '#2c3e50',
            subText: '#6c757d',
            primary: '#2e7d32',
            border: '#e9ecef',
            header: '#2e7d32',
            danger: '#e53935',
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};
