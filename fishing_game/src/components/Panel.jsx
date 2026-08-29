import './Panel.css';

export default function Panel({ title, onClose, children, className = '' }) {
  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className={`panel ${className}`} onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h2 className="panel-title">{title}</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="panel-content">
          {children}
        </div>
      </div>
    </div>
  );
}