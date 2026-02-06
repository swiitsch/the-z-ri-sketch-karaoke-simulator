
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SongData, SongLyric, ScoreData } from '../types';
import { generateSongAudio } from '../services/geminiService';

interface FloatingWord extends SongLyric {
  id: number;
  x: number;
  y: number;
  active: boolean;
  clicked: boolean;
  missed: boolean;
  spawnTime: number;
}

interface KaraokeArenaProps {
  song: SongData;
  voiceName?: string;
  onFinish: (score: ScoreData) => void;
}

const KaraokeArena: React.FC<KaraokeArenaProps> = ({ song, voiceName = 'Kore', onFinish }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [score, setScore] = useState<ScoreData>({ hits: 0, misses: 0, accuracy: 0 });
  const [nextWordIndex, setNextWordIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; x: number; y: number } | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number>();
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const fullLyrics = song.lyrics.map(l => l.word).join(' ');
        const base64Audio = await generateSongAudio(fullLyrics, voiceName);
        
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        audioSourceRef.current = source;
        
        setIsAudioLoading(false);
      } catch (err) {
        console.error("Audio init error:", err);
        setIsAudioLoading(false);
      }
    };

    initAudio();
    return () => {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) {}
      }
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [song, voiceName]);

  const startLevel = () => {
    if (audioSourceRef.current) audioSourceRef.current.start();
    setStartTime(Date.now());
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || !startTime) return;

    const update = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);
      
      if (nextWordIndex >= song.lyrics.length && floatingWords.every(w => w.clicked || w.missed)) {
        setTimeout(() => {
          onFinish({
            ...score,
            accuracy: Math.round((score.hits / (score.hits + score.misses || 1)) * 100)
          });
        }, 1500);
        return;
      }
      timerRef.current = requestAnimationFrame(update);
    };

    timerRef.current = requestAnimationFrame(update);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying, startTime, nextWordIndex, floatingWords, score, onFinish, song.lyrics.length]);

  useEffect(() => {
    if (!isPlaying) return;
    
    // Increased from 6.0 to 10.0 seconds to show words extremely early
    const spawnWindow = currentTime + 10.0;
    
    const wordsToSpawn = song.lyrics
      .slice(nextWordIndex)
      .filter(l => l.startTime <= spawnWindow);

    if (wordsToSpawn.length > 0) {
      const newFloatingWords = wordsToSpawn.map((l, i) => ({
        ...l,
        id: nextWordIndex + i,
        x: 15 + Math.random() * 70, 
        y: 25 + Math.random() * 50,
        active: true,
        clicked: false,
        missed: false,
        spawnTime: currentTime
      }));

      setFloatingWords(prev => [...prev, ...newFloatingWords]);
      setNextWordIndex(prev => prev + wordsToSpawn.length);
    }
  }, [currentTime, isPlaying, song.lyrics, nextWordIndex]);

  useEffect(() => {
    setFloatingWords(prev => prev.map(w => {
      // Allow more time to click (1.5s instead of 0.8s)
      if (!w.clicked && !w.missed && currentTime > w.startTime + 1.5) {
        setScore(s => ({ ...s, misses: s.misses + 1 }));
        return { ...w, missed: true, active: false };
      }
      return w;
    }));
  }, [currentTime]);

  const handleWordClick = useCallback((wordId: number, e: React.MouseEvent) => {
    setFloatingWords(prev => {
      const target = prev.find(w => w.id === wordId);
      if (!target || target.clicked || target.missed) return prev;

      const activeSequence = prev
        .filter(w => !w.clicked && !w.missed)
        .sort((a, b) => a.startTime - b.startTime);
      
      const isNextInSequence = activeSequence[0]?.id === wordId;
      const timingDiff = Math.abs(currentTime - target.startTime);
      
      let rating = "";
      if (isNextInSequence) {
        if (timingDiff < 0.5) {
          rating = "PERFECT!";
          setScore(s => ({ ...s, hits: s.hits + 1 }));
        } else if (timingDiff < 1.0) {
          rating = "GOOD";
          setScore(s => ({ ...s, hits: s.hits + 1 }));
        } else {
          rating = "OK";
          setScore(s => ({ ...s, hits: s.hits + 1 }));
        }
      } else {
        rating = "WAIT!";
        setScore(s => ({ ...s, misses: s.misses + 1 }));
      }

      setFeedback({ text: rating, x: e.clientX, y: e.clientY });
      setTimeout(() => setFeedback(null), 800);

      return prev.map(w => w.id === wordId ? { ...w, clicked: true, active: false } : w);
    });
  }, [currentTime]);

  if (isAudioLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-black">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent animate-spin pixel-border"></div>
        <p className="text-yellow-400 text-xs animate-pulse">WARMING UP THE VOCALS...</p>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-black">
        <div className="text-center space-y-4">
          <h2 className="text-2xl text-yellow-400 uppercase">Stage Ready</h2>
          <p className="text-[10px] text-gray-400">Click the words as they light up in rhythm!</p>
        </div>
        <button 
          onClick={startLevel}
          className="px-12 py-6 bg-pink-600 hover:bg-pink-500 text-white pixel-border text-2xl animate-bounce font-bold"
        >
          START SINGING
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900 flex flex-col cursor-crosshair">
      <div className="p-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="bg-black/90 p-3 border-2 border-yellow-400 text-[10px] space-y-1">
          <p className="text-yellow-400">{song.title.toUpperCase()}</p>
          <p className="text-white/60">{song.artist.toUpperCase()}</p>
        </div>
        <div className="bg-black/90 p-3 border-2 border-yellow-400 text-[10px] text-right space-y-1">
          <p className="text-green-400">COMBO: {score.hits}</p>
          <p className="text-red-400">MISS: {score.misses}</p>
        </div>
      </div>

      <div className="flex-1 relative">
        {floatingWords.map(w => (
          w.active && (
            <button
              key={w.id}
              onMouseDown={(e) => handleWordClick(w.id, e)}
              className={`
                absolute px-10 py-8 text-lg md:text-3xl pixel-border transition-all
                ${currentTime >= w.startTime - 0.5 ? 'bg-yellow-400 text-black scale-125 z-50 shadow-[0_0_40px_rgba(253,224,71,0.9)]' : 'bg-gray-800 text-gray-400 opacity-40'}
                hover:border-white select-none whitespace-nowrap
              `}
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
                transform: `translate(-50%, -50%)`,
              }}
            >
              {w.word.toUpperCase()}
            </button>
          )
        ))}

        {feedback && (
          <div 
            className="fixed pointer-events-none text-white text-xl font-bold uppercase animate-ping z-[100]"
            style={{ left: feedback.x, top: feedback.y }}
          >
            {feedback.text}
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-center gap-1 opacity-20 pointer-events-none">
          {[...Array(32)].map((_, i) => (
            <div 
              key={i} 
              className="w-2 bg-pink-500"
              style={{ 
                height: `${10 + Math.random() * 80}%`,
                transition: 'height 0.1s ease-out'
              }}
            />
          ))}
        </div>
      </div>

      <div className="h-2 bg-gray-800 w-full">
        <div 
          className="h-full bg-yellow-400 shadow-[0_0_10px_#facc15]" 
          style={{ width: `${Math.min((currentTime / (song.lyrics[song.lyrics.length-1]?.startTime + 2)) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default KaraokeArena;
