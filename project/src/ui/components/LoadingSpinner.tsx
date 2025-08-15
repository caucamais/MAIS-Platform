// MAIS Political Command Center - Loading Spinner
// Swiss Precision Standards - Smooth UI

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{
          width: 24,
          height: 24,
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
