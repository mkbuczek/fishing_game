import { useEffect } from 'react';
import './Toast.css';
 
export default function Toast({ message, onDismiss, duration = 2500 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);
 
  return (
    <div className="toast" onClick={onDismiss}>
      {message}
    </div>
  );
}