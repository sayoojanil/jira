import React, { useEffect, useState } from 'react';

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


};

export default PerformanceToggle;
