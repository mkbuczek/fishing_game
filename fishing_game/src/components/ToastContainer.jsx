import Toast from './Toast';
import './ToastContainer.css';
 
export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}