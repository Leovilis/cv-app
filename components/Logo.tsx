import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ width = 150, height = 60 }) => {
  return (
    <Image 
      src="/manzur-logo.png" 
      alt="Manzur Administraciones" 
      width={width} 
      height={height}
      priority
    />
  );
};