
import React from 'react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const PixelButton: React.FC<PixelButtonProps> = ({ children, onClick, className = '', disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500
        text-black font-bold text-xs md:text-sm uppercase transition-all
        pixel-border disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        boxShadow: 'inset -4px -4px 0 0 #b38600'
      }}
    >
      {children}
    </button>
  );
};

export default PixelButton;
