import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';
import { TutorialStep } from '../types';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const steps: TutorialStep[] = [
  {
    description: "Welcome to the Survival Challenge. The game starts easy but increases in difficulty with every level you pass.",
    showButton: true
  },
  {
    description: "Your goal is to survive as long as possible. The game continues indefinitely until you make a mistake or run out of time.",
  },
  {
    description: "Three bubbles will appear on screen. Your task is to select each bubble in order from the LOWEST to the HIGHEST value.",
  },
  {
    description: "You can deselect a bubble by clicking on it again. However, if you select the third bubble in the wrong order, it's Game Over.",
  },
  {
    description: "Each level has a 15-second timer. Think fast!",
  }
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-sky-100 w-full max-w-2xl min-h-[300px] md:min-h-[320px] rounded-sm shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Close/Skip button top right */}
        <button 
            onClick={onComplete}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-12 py-10 text-center">
          
          <p className="text-slate-700 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
            {steps[currentStep].description}
          </p>

          {steps[currentStep].showButton && (
             <button 
                onClick={handleNext}
                className="mt-8 bg-black text-white px-8 py-3 rounded-sm text-sm tracking-widest font-semibold hover:bg-slate-800 transition-colors uppercase"
             >
                Start Challenge
             </button>
          )}

           {/* Decorative icon for interaction hints */}
           {currentStep === 2 && (
            <div className="mt-6 flex gap-4 opacity-50">
               <div className="w-12 h-12 rounded-full border-2 border-slate-400 flex items-center justify-center text-slate-500 font-bold text-xs">1</div>
               <div className="w-12 h-12 rounded-full border-2 border-slate-400 flex items-center justify-center text-slate-500 font-bold text-xs">2</div>
               <div className="w-12 h-12 rounded-full border-2 border-slate-400 flex items-center justify-center text-slate-500 font-bold text-xs">3</div>
            </div>
           )}

           {currentStep === 3 && (
             <MousePointer2 className="mt-8 text-slate-600 animate-bounce" size={32} />
           )}

        </div>

        {/* Navigation Bar */}
        <div className="h-16 flex items-center justify-between px-6 bg-transparent w-full pb-4">
           {/* Left Arrow */}
           <button 
             onClick={handlePrev} 
             className={`p-2 rounded-full hover:bg-black/5 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
           >
             <ChevronLeft size={32} className="text-slate-700" />
           </button>

           {/* Pagination Dots */}
           <div className="flex gap-3">
             {steps.map((_, idx) => (
               <div 
                 key={idx} 
                 className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-slate-800 scale-125' : 'bg-slate-400 border border-slate-500'}`}
               />
             ))}
           </div>

           {/* Right Arrow */}
           <button 
             onClick={handleNext} 
             className={`p-2 rounded-full hover:bg-black/5 transition-colors ${currentStep === steps.length - 1 && !steps[currentStep].showButton ? '' : ''}`}
           >
              {/* Only show chevron if not the very last step or if it's the specific flow */}
             {(!steps[currentStep].showButton) && (
                 <ChevronRight size={32} className="text-slate-700" />
             )}
           </button>
        </div>
      </div>
    </div>
  );
};