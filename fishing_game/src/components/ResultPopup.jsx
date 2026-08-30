import { useEffect, useState } from 'react';
import './ResultPopup.css';
import { buildGradient } from '../utils/buildGradient';
 
export default function ResultPopup({ outcome, catchName, icon, gradient, onDismiss, autoDismissMs = 5000 }) {
  // Auto-dismiss after a delay, but the effect cleans itself up if the
  // player dismisses manually first via the overlay's onClick below.
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const graceTimer = setTimeout(() => {
        setCanDismiss(true);
    }, 500); // 500 ms grace period before allowing dismissal
    return () => clearTimeout(graceTimer);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code === 'Space' && canDismiss) {
        event.preventDefault();
        onDismiss();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canDismiss, onDismiss]);
 
  function handleOverlayClick() {
    if (canDismiss) {
      onDismiss();
    }
  }

  const isCaught = outcome === 'caught';
 
  return (
    <div className="result-popup-overlay" onClick={handleOverlayClick}>
      <div className={`result-popup ${isCaught ? 'result-popup-caught' : 'result-popup-escaped'}`}>
        <p className="result-popup-title">
          {isCaught ? (
            <>
              {icon} Caught a{' '}
              <span
                className="catch-name-gradient"
                style={{backgroundImage: buildGradient(gradient)}} 
              >
                {catchName}
              </span>
              !
            </>
          ) : (
            'It got away...'
          )}
        </p>
        <p className="result-popup-hint">click or space to continue</p>
      </div>
    </div>
  );
}