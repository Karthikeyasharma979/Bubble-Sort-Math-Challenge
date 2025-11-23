import React from 'react';
import { BubbleData } from '../types';

interface BubbleProps {
  data: BubbleData;
  isSelected: boolean;
  selectionOrder: number | null; // 1, 2, or 3
  onClick: (id: string) => void;
  disabled: boolean;
  status: 'default' | 'correct' | 'wrong';
  index: number; // Used for animation staggering
}

export const Bubble: React.FC<BubbleProps> = ({ 
  data, 
  isSelected, 
  selectionOrder, 
  onClick, 
  disabled,
  status,
  index
}) => {
  
  // Determine styles based on state
  const baseClasses = "relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold cursor-pointer transition-all duration-300 select-none shadow-lg backdrop-blur-sm";
  
  let colorClasses = "bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white";
  
  if (isSelected) {
    if (status === 'correct') {
      colorClasses = "bg-green-500/80 border-green-400 text-white scale-110 shadow-green-500/50";
    } else if (status === 'wrong') {
      colorClasses = "bg-red-500/80 border-red-400 text-white shake shadow-red-500/50";
    } else {
      colorClasses = "bg-sky-500/80 border-sky-400 text-white scale-105 shadow-sky-500/50";
    }
  }

  const animationClass = disabled ? '' : 'animate-float';
  const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : 'delay-200';

  return (
    <div 
      onClick={() => !disabled && onClick(data.id)}
      className={`${baseClasses} ${colorClasses} ${animationClass} ${delayClass}`}
    >
      <span className="z-10">{data.expression}</span>
      
      {/* Selection Order Indicator Badge */}
      {isSelected && selectionOrder && (
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-sky-900 flex items-center justify-center text-sm font-bold shadow-md animate-bounce">
          {selectionOrder}
        </div>
      )}
      
      {/* Background decoration */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
    </div>
  );
};