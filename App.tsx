import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TutorialOverlay } from './components/TutorialOverlay';
import { Bubble } from './components/Bubble';
import { BubbleData, GameStatus } from './types';
import { generateMathLevel } from './services/geminiService';
import { Trophy, RotateCcw, AlertCircle, Loader2, Zap } from 'lucide-react';

const TIMER_SECONDS = 15;

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.INTRO);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [feedbackStatus, setFeedbackStatus] = useState<'default' | 'correct' | 'wrong'>('default');
  
  // Ref for timer interval
  const timerRef = useRef<number | null>(null);

  // Initialize Level
  const loadLevel = useCallback(async (levelToLoad: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setGameStatus(GameStatus.LOADING);
    setFeedbackStatus('default');
    setSelectedIds([]);
    setTimeLeft(TIMER_SECONDS);

    // Generate level based on current level number
    const data = await generateMathLevel(levelToLoad);
    setBubbles(data);
    setGameStatus(GameStatus.PLAYING);
  }, []);

  // Start Timer
  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             // Time ran out
             handleLevelComplete(false, true);
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  // Handle Bubble Click
  const handleBubbleClick = (id: string) => {
    if (gameStatus !== GameStatus.PLAYING) return;

    setSelectedIds(prev => {
      // Deselect if already selected
      if (prev.includes(id)) {
        return prev.filter(bubbleId => bubbleId !== id);
      }
      
      // Select
      const newSelection = [...prev, id];
      
      // Check if this was the 3rd selection
      if (newSelection.length === 3) {
        // Need to validate immediately after state update
        // We defer this slightly to let the UI update the 3rd badge
        setTimeout(() => validateSelection(newSelection), 500);
      }
      
      return newSelection;
    });
  };

  const validateSelection = (selection: string[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameStatus(GameStatus.CHECKING);

    // Create array of values in selected order
    const selectedValues = selection.map(id => bubbles.find(b => b.id === id)?.value || 0);
    
    // Check if sorted ascending
    const isSorted = selectedValues.every((val, i, arr) => !i || (arr[i-1] <= val));
    
    if (isSorted) {
      setFeedbackStatus('correct');
      setTimeout(() => handleLevelComplete(true), 1000);
    } else {
      setFeedbackStatus('wrong');
      setTimeout(() => handleLevelComplete(false), 1000);
    }
  };

  const handleLevelComplete = (success: boolean, timeOut: boolean = false) => {
    if (success) {
      setScore(prev => prev + 100 + (timeLeft * 10));
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      loadLevel(nextLevel);
    } else {
      // Game Over on failure
      setGameStatus(GameStatus.GAME_OVER);
    }
  };

  const handleTutorialComplete = () => {
    setCurrentLevel(1);
    loadLevel(1);
  };

  const handleRestart = () => {
    setCurrentLevel(1);
    setScore(0);
    loadLevel(1);
  };

  // --- RENDERERS ---

  if (gameStatus === GameStatus.INTRO) {
    return <TutorialOverlay onComplete={handleTutorialComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0)_0%,rgba(0,0,0,0.5)_100%)]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center text-slate-300 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/50">
             {currentLevel}
           </div>
           <span className="text-sm uppercase tracking-widest font-semibold text-slate-400">Level</span>
        </div>
        <div className="flex items-center gap-2 text-yellow-500">
           <Trophy size={20} />
           <span className="font-bold text-xl">{score}</span>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-6">
        
        {gameStatus === GameStatus.LOADING && (
          <div className="flex flex-col items-center gap-4 text-cyan-400">
             <Loader2 size={48} className="animate-spin" />
             <p className="text-sm uppercase tracking-widest animate-pulse">Generating Challenge...</p>
          </div>
        )}

        {gameStatus === GameStatus.GAME_OVER && (
          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-md w-full animate-in zoom-in duration-300 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
             
             <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Game Over</h2>
             <p className="text-slate-400 mb-8">You reached Level {currentLevel}</p>
             
             <div className="flex flex-col gap-4 mb-8">
               <div className="flex justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                 <span className="text-slate-400">Final Score</span>
                 <span className="text-yellow-500 font-bold text-2xl">{score}</span>
               </div>
             </div>

             <button 
                onClick={handleRestart}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
             >
               <RotateCcw size={20} />
               Try Again
             </button>
          </div>
        )}

        {(gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.CHECKING) && (
          <div className="relative w-full max-w-4xl h-[60vh] flex items-center justify-center">
             
             {/* Instructions Hint */}
             <div className="absolute top-0 text-slate-500 text-xs md:text-sm tracking-widest uppercase font-medium flex items-center gap-2">
               <Zap size={14} className="text-yellow-500" />
               Select Lowest to Highest
             </div>

             {/* Bubbles Container */}
             <div className="relative w-full h-full">
                {bubbles.map((bubble, idx) => {
                    // Calculate random-ish but pleasing positions based on index
                    let posClass = "";
                    if (idx === 0) posClass = "top-[20%] left-[10%] md:left-[25%]";
                    if (idx === 1) posClass = "top-[40%] right-[10%] md:right-[25%]";
                    if (idx === 2) posClass = "bottom-[20%] left-[25%] md:left-[35%]";

                    return (
                        <div key={bubble.id} className={`absolute ${posClass}`}>
                            <Bubble 
                                data={bubble}
                                index={idx}
                                isSelected={selectedIds.includes(bubble.id)}
                                selectionOrder={selectedIds.indexOf(bubble.id) + 1 || null}
                                onClick={handleBubbleClick}
                                disabled={gameStatus === GameStatus.CHECKING}
                                status={feedbackStatus}
                            />
                        </div>
                    );
                })}
             </div>
          </div>
        )}
      </main>

      {/* Footer / Timer Area */}
      {(gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.CHECKING) && (
        <footer className="relative z-10 p-8 flex flex-col items-center justify-center">
           <div className="w-full max-w-md">
             <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                <span>Time Remaining</span>
                <span>{timeLeft}s</span>
             </div>
             
             {/* Custom Timer Bar */}
             <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-cyan-500'}`}
                  style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
                />
             </div>
           </div>

           <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm">
              <AlertCircle size={16} />
              <span>Click a bubble to select. Click again to deselect.</span>
           </div>
        </footer>
      )}
    </div>
  );
};

export default App;