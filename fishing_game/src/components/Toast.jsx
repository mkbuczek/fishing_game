import { useEffect, useRef } from 'react';
import './Toast.css';
 
export default function Toast({ message, onDismiss, duration = 2500 }) {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className="toast" onClick={() => onDismissRef.current()}>
      {message}
    </div>
  );
}