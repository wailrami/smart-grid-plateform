
import { useState, useEffect } from 'react';
/**
 * Custom hook to manage persistent state using localStorage.
 * @param {string} key - The key under which the state is stored in localStorage.
 * @param {*} defaultValue - The default value to use if no value is found in localStorage.
 * @returns {[*, function]} - Returns the current state and a function to update it.
 */

// --- Helper to manage localStorage ---
const usePersistentState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
};


export default usePersistentState;
