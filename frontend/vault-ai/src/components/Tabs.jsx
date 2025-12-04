export function Tabs({ children, className = '', ariaLabel = 'Content tabs' }) {
  return (
    <div className={`tabs ${className}`} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

export function TabList({ children, className = '' }) {
  return (
    <div className={`tab-list ${className}`} role="tablist">
      {children}
    </div>
  );
}

export function Tab({ children, active = false, onClick, className = '', id, panelId }) {
  return (
    <button
      className={`tab ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      id={id}
      tabIndex={active ? 0 : -1}
    >
      {children}
    </button>
  );
}

export function TabPanel({ children, active = false, className = '', id, tabId }) {
  return (
    <div
      className={`tab-panel ${className}`}
      role="tabpanel"
      id={id}
      aria-labelledby={tabId}
      hidden={!active}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
