// export const
import { useState, useRef } from 'react';

export const useMessage = () => {
    const [message, setMessage] = useState<string>('');
    const messageListeners = useRef<((message: string) => void)[]>([]);

    const sendMessage = (message: string, callback?: (response: string) => void) => {
        setMessage(message);
        if (callback) {
            callback(message);
        }
        messageListeners.current.forEach(listener => listener(message));
    };

    const watchMessage = (listener: (message: string) => void) => {
        messageListeners.current.push(listener);
    };

    return {message, sendMessage, watchMessage};
}