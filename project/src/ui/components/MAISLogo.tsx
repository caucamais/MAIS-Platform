// MAIS Political Command Center - MAIS Logo
// Swiss Precision Standards - Brand Identity

import React from 'react';

interface MAISLogoProps {
  className?: string;
}

const MAISLogo: React.FC<MAISLogoProps> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
    >
      <rect width="100" height="100" rx="20" fill="#3B82F6" />
      
      {/* M */}
      <path
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 70 L20 30 L35 50 L50 30 L50 70"
      />
      
      {/* A */}
      <path
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M60 70 L70 30 L80 70 M65 55 L75 55"
      />
      
      {/* Dot */}
      <circle cx="85" cy="25" r="5" fill="#FFFFFF" />
    </svg>
  );
};

export default MAISLogo;
