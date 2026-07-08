import React, { useEffect, useState } from 'react';

/**
 * Toggle button to enable/disable the glass blur effect.
 * When enabled, adds the `glass-enabled` class to the <html> element,
 * which activates the backdrop-filter styles defined in index.css.
 */
const PerformanceToggle: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);

  // Apply or remove the class on mount and when the state changes
  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('glass-enabled');
    } else {
      root.classList.remove('glass-enabled');
    }
  }, [enabled]);

  const toggle = () => setEnabled((prev) => !prev);

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 text-white px-4 py-2 shadow-lg hover:bg-blue-700 transition-colors"
      aria-pressed={enabled}
    >
      {enabled ? 'Disable Glass' : 'Enable Glass'}
    </button>
  );
};

export default PerformanceToggle;
