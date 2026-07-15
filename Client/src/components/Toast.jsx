import React, { useEffect } from 'react';
import '../App.css'; 

const Toast = ({ message, show, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (show && duration) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    return (
        <div className="toast">
            {message}
        </div>
    );
};

export default Toast;
