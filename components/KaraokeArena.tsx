
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { WordInstance, ScoreData, DifficultyLevel, Character } from '../types';

interface KaraokeArenaProps {
  lyricsString: string;
  difficulty: DifficultyLevel;
  character: Character;
  onFinish: (score: ScoreData) => void;
  onAbort: () => void;
}

const KaraokeArena: React.FC<KaraokeArenaProps> = ({ lyricsString, difficulty, character, onFinish, onAbort }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [words, setWords] = useState<WordInstance[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [displayScore, setDisplayScore] = useState({ hits: 0, misses: 0 }); 
  const [pulse, setPulse] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const scoreRef = useRef({ hits: 0, misses: 0 });
  const currentIndexRef = useRef(-1);

  // Difficulty parameters
  // Easy: 1s click window, 1.4s tick
  // Medium: 0.75s click window, 1.1s tick
  // Hard: 0.5s click window, 0.8s tick
  const settings = useMemo(() => {
    switch (difficulty) {
      case DifficultyLevel.HARD: return { tickRate: 800, activeWindow: 500 };
      case DifficultyLevel.MEDIUM: return { tickRate: 1100, activeWindow: 750 };
      case DifficultyLevel.EASY:
      default: return { tickRate: 1400, activeWindow: 1000 };
    }
  }, [difficulty]);

  useEffect(() => {
    // Limit to first 99 words as requested
    const list = lyricsString
      .split(/\s+/)
      .filter(w => w.length > 0)
      .slice(0, 99) 
      .map((text, i) => ({
        text: text.toUpperCase(),
        id: i,
        x: 15 + Math.random() * 70, 
        y: 20 + Math.random() * 60,
        active: false,
        clicked: false,
        missed: false
      }));
    setWords(list);
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lyricsString]);

  const playTickSound = () => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(currentIndexRef.current % 4 === 0 ? 880 : 440, audioCtxRef.current.currentTime);
    gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.1);
  };

  const nextTick = useCallback(() => {
    currentIndexRef.current += 1;
    const nextIdx = currentIndexRef.current;
    
    // Handle misses for the previous word
    if (nextIdx > 0) {
      const prevIdx = nextIdx - 1;
      setWords(prevWords => {
        const word = prevWords[prevIdx];
        if (word && !word.clicked && !word.missed) {
          scoreRef.current.misses += 1;
          setDisplayScore({ ...scoreRef.current });
          return prevWords.map(w => w.id === prevIdx ? { ...w, missed: true, active: false } : w);
        }
        return prevWords;
      });
    }

    // Check for end of game
    if (nextIdx >= words.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        const total = scoreRef.current.hits + scoreRef.current.misses;
        onFinish({
          hits: scoreRef.current.hits,
          misses: scoreRef.current.misses,
          accuracy: total === 0 ? 0 : Math.round((scoreRef.current.hits / total) * 100)
        });
      }, 1500);
      return;
    }

    setCurrentIndex(nextIdx);

    // Activate the current word
    setWords(prevWords => prevWords.map(w => 
      w.id === nextIdx ? { ...w, active: true } : w
    ));

    // Deactivate visually after active window
    setTimeout(() => {
      setWords(prevWords => prevWords.map(w => 
        w.id === nextIdx && !w.clicked ? { ...w, active: false } : w
      ));
    }, settings.activeWindow);

    playTickSound();
    setPulse(true);
    setTimeout(() => setPulse(false), 100);
  }, [words.length, settings, onFinish]);

  const startLevel = () => {
    setIsPlaying(true);
    timerRef.current = window.setInterval(nextTick, settings.tickRate);
  };

  const handleAbort = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onAbort();
  };

  const handleWordClick = (id: number) => {
    if (id !== currentIndexRef.current) return;
    setWords(prev => {
      const word = prev[id];
      if (word && word.active && !word.clicked && !word.missed) {
        scoreRef.current.hits += 1;
        setDisplayScore({ ...scoreRef.current });
        return prev.map(w => w.id === id ? { ...w, clicked: true, active: false } : w);
      }
      return prev;
    });
  };

  if (!isPlaying) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-black">
        <div className="flex items-center gap-6 animate-pulse">
            <img src={character.image} className="w-24 h-24 pixel-border bg-gray-800" style={{ imageRendering: 'pixelated' }} />
            <h2 className="text-3xl text-yellow-400 uppercase font-black">{character.name}</h2>
        </div>
        <div className="text-center space-y-4">
          <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed uppercase">
            Difficulty: <span className="text-pink-500 font-bold">{difficulty}</span><br/>
            Session: <span className="text-yellow-400 font-bold">{words.length} Words</span><br/>
            Wait for the beat. Follow the 5-word preview.<br/>
            Click when word is <span className="text-yellow-400">glowing</span>.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={startLevel}
            className="px-12 py-6 bg-pink-600 hover:bg-pink-500 text-white pixel-border text-2xl font-bold uppercase transition-transform hover:scale-105"
          >
            LET'S ROCK
          </button>
          <button 
            onClick={onAbort}
            className="px-6 py-6 bg-gray-800 hover:bg-gray-700 text-gray-400 pixel-border text-sm font-bold uppercase"
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  const visibleWords = words.filter(w => 
    !w.clicked && 
    !w.missed && 
    w.id >= currentIndex && 
    w.id <= currentIndex + 5
  );

  return (
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-100 ${pulse ? 'bg-gray-800' : 'bg-gray-900'} flex flex-col`}>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-800 z-30">
        <div 
          className="h-full bg-yellow-400 transition-all duration-300 shadow-[0_0_10px_#facc15]"
          style={{ width: `${(currentIndex / words.length) * 100}%` }}
        />
      </div>

      {/* HUD */}
      <div className="p-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex items-start gap-4 bg-black/90 p-3 border-2 border-yellow-400">
          <img 
            src={character.image} 
            className="w-12 h-12 pixel-border bg-gray-800" 
            style={{ imageRendering: 'pixelated' }} 
          />
          <div className="text-[8px] space-y-1">
            <p className="text-yellow-400 font-bold uppercase">{character.name}</p>
            <p className="text-gray-500">KARAOKE BAR LIVE</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/90 p-3 border-2 border-yellow-400 text-[10px] text-right space-y-1">
            <p className="text-green-400">HITS: {displayScore.hits}</p>
            <p className="text-red-400">MISS: {displayScore.misses}</p>
          </div>
          <button 
            onClick={handleAbort}
            className="pointer-events-auto bg-red-600 hover:bg-red-500 text-white pixel-border px-4 py-2 text-[8px] font-bold uppercase transition-colors"
          >
            ABORT SONG
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 relative">
        {visibleWords.map(w => {
          const isActive = w.id === currentIndex && w.active;
          const isPending = w.id > currentIndex;
          
          return (
            <button
              key={w.id}
              onMouseDown={() => handleWordClick(w.id)}
              disabled={isPending}
              className={`
                absolute transition-all duration-200 pixel-border select-none whitespace-nowrap font-black uppercase
                ${isActive 
                  ? 'px-10 py-8 text-2xl md:text-5xl bg-yellow-400 text-black scale-110 z-50 shadow-[0_0_60px_rgba(253,224,71,1)] animate-pulse' 
                  : 'px-8 py-6 text-xl md:text-3xl bg-gray-800 text-gray-500 opacity-20 z-10 grayscale'
                }
                ${isPending ? 'cursor-default pointer-events-none' : 'cursor-pointer'}
              `}
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
                transform: `translate(-50%, -50%)`,
                minWidth: '180px'
              }}
            >
              {w.text}
              {isPending && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[6px] md:text-[8px] bg-black text-gray-600 px-2 py-1">
                  PREVIEW {w.id - currentIndex}
                </div>
              )}
            </button>
          );
        })}

        {/* Miss Alert */}
        {words.find(w => w.missed && w.id === currentIndex - 1) && (
           <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 text-6xl font-black uppercase animate-ping opacity-40 pointer-events-none"
          >
            MISS!
          </div>
        )}
      </div>

      {/* Footer Beat Indicator */}
      <div className="h-12 bg-black flex items-center justify-center border-t-4 border-gray-800">
        <div className="flex gap-6">
            {[0, 1, 2, 3].map((i) => (
                <div 
                    key={i} 
                    className={`w-5 h-5 rounded-none border-2 border-gray-700 transition-all duration-75 ${currentIndex % 4 === i ? 'bg-pink-500 scale-150 rotate-45 shadow-[0_0_20px_#ec4899]' : 'bg-transparent'}`}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default KaraokeArena;
