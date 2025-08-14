// MAIS Political Command Center - Logo Component
// Swiss Precision Standards - Intelligent Fallback System

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, MapPin } from 'lucide-react';

interface MAISLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
};

export const MAISLogo: React.FC<MAISLogoProps> = ({
  size = 'md',
  variant = 'full',
  animated = true,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animation variants
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Fallback icon component with MAIS colors
  const FallbackIcon = () => (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {/* Background gradient circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 opacity-90" />
      
      {/* Icon overlay */}
      <div className="relative z-10 flex items-center justify-center text-white">
        {size === 'sm' ? (
          <Zap className="h-4 w-4" />
        ) : size === 'md' ? (
          <Users className="h-6 w-6" />
        ) : (
          <MapPin className="h-8 w-8" />
        )}
      </div>
      
      {/* Animated ring */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          variants={pulseVariants}
          animate="animate"
        />
      )}
    </div>
  );

  // Text component
  const LogoText = () => (
    <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 bg-clip-text text-transparent`}>
      MAIS
    </span>
  );

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    console.warn('MAIS Logo image failed to load, using fallback');
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Render based on variant
  const renderLogo = () => {
    if (variant === 'text') {
      return <LogoText />;
    }

    if (variant === 'icon' || imageError) {
      return <FallbackIcon />;
    }

    // Full variant - try to load image first, fallback to icon
    return (
      <div className="relative">
        {!imageError && (
          <img
            src="/mais-logo.png"
            alt="MAIS Logo"
            className={`${sizeClasses[size]} object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
        
        {/* Show fallback while loading or on error */}
        {(!imageLoaded || imageError) && (
          <div className={imageError ? '' : 'absolute inset-0'}>
            <FallbackIcon />
          </div>
        )}
      </div>
    );
  };

  const MotionWrapper = animated ? motion.div : 'div';
  const motionProps = animated ? {
    variants: logoVariants,
    initial: "initial",
    animate: "animate",
    whileHover: "hover"
  } : {};

  return (
    <MotionWrapper
      className={`inline-flex items-center justify-center ${className}`}
      {...motionProps}
    >
      {variant === 'full' ? (
        <div className="flex items-center space-x-3">
          {renderLogo()}
          <LogoText />
        </div>
      ) : (
        renderLogo()
      )}
    </MotionWrapper>
  );
};

// Specialized variants for common use cases
export const MAISLogoHeader: React.FC<{ className?: string }> = ({ className }) => (
  <MAISLogo size="lg" variant="full" animated={true} className={className} />
);

export const MAISLogoIcon: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => (
  <MAISLogo size={size} variant="icon" animated={false} className={className} />
);

export const MAISLogoText: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => (
  <MAISLogo size={size} variant="text" animated={false} className={className} />
);

export default MAISLogo;