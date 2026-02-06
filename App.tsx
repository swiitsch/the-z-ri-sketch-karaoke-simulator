
import React, { useState } from 'react';
import { GameState, Character, ScoreData, DifficultyLevel } from './types';
import { CHARACTERS, OTHER_PEOPLE } from './constants';
import PixelButton from './components/PixelButton';
import KaraokeArena from './components/KaraokeArena';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(GameState.WELCOME);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY);
  const [userLyrics, setUserLyrics] = useState('');
  const [score, setScore] = useState<ScoreData | null>(null);

  const startSession = () => {
    if (!userLyrics.trim() || !selectedChar) return;
    setState(GameState.PLAYING);
  };

  const resetGame = () => {
    setScore(null);
    setUserLyrics('');
    setState(GameState.LOBBY);
  };

  const handleAbort = () => {
    setState(GameState.LOBBY);
  };

  return (
    <div className="w-screen h-screen pixel-bg text-white flex items-center justify-center overflow-hidden">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-10">
         {OTHER_PEOPLE.map((img, i) => (
           <img 
            key={i} 
            src={img} 
            className="absolute" 
            style={{ 
              left: `${(i * 20) + 5}%`, 
              bottom: '5%', 
              width: '64px', 
              height: '64px',
              imageRendering: 'pixelated'
            }} 
            alt="npc" 
          />
         ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-4xl h-full md:h-[90%] flex flex-col bg-gray-900 md:pixel-border">
        
        {state === GameState.WELCOME && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-5xl font-bold text-yellow-400 drop-shadow-lg leading-tight animate-pulse">
                THE ZÜRI SKETCH<br/>KARAOKE SIMULATOR
              </h1>
              <p className="text-[10px] text-pink-500 font-bold uppercase tracking-[0.2em]">Rhythmic Edition</p>
            </div>
            <p className="text-xs md:text-base text-gray-400 max-w-lg leading-relaxed">
              No AI. No lag. Just your lyrics and your rhythm.<br/>Enter the bar and show them your timing.
            </p>
            <PixelButton onClick={() => setState(GameState.CHARACTER_SELECT)}>
              ENTER BAR
            </PixelButton>
          </div>
        )}

        {state === GameState.CHARACTER_SELECT && (
          <div className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto">
            <h2 className="text-xl md:text-3xl text-yellow-400 text-center uppercase tracking-tighter">Choose Your Legend</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto w-full">
              {CHARACTERS.map(char => (
                <div 
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className={`
                    group cursor-pointer p-2 border-4 transition-all hover:translate-y-[-4px]
                    ${selectedChar?.id === char.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-800 bg-black/40'}
                  `}
                >
                  <div className={`relative overflow-hidden aspect-square pixel-border bg-gray-800 transition-colors ${selectedChar?.id === char.id ? 'bg-yellow-400/40' : ''}`}>
                    <img 
                      src={char.image} 
                      alt={char.name} 
                      className={`w-full h-full transition-all duration-300 ${selectedChar?.id === char.id ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`} 
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className={`mt-3 py-2 text-center text-[8px] md:text-xs font-bold uppercase tracking-widest ${selectedChar?.id === char.id ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {char.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-8">
              <PixelButton 
                disabled={!selectedChar} 
                onClick={() => setState(GameState.LOBBY)}
              >
                CONFIRM SINGER
              </PixelButton>
            </div>
          </div>
        )}

        {state === GameState.LOBBY && selectedChar && (
          <div className="flex-1 flex flex-col p-6 items-center justify-start space-y-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6">
              <img 
                src={selectedChar.image} 
                alt="Selected" 
                className="w-16 h-16 md:w-24 md:h-24 pixel-border bg-gray-800"
                style={{ imageRendering: 'pixelated' }}
              />
              <div>
                <h3 className="text-xl md:text-2xl text-yellow-400 uppercase font-black">{selectedChar.name}</h3>
                <p className="text-[8px] text-gray-500">READY TO PERFORM</p>
              </div>
            </div>

            <div className="w-full max-w-2xl flex flex-col space-y-3">
              <label className="text-[10px] text-pink-500 uppercase font-bold tracking-widest">Difficulty:</label>
              <div className="flex gap-2">
                {[
                  { id: DifficultyLevel.EASY, label: 'EASY (1.0s)', color: 'bg-green-600' },
                  { id: DifficultyLevel.MEDIUM, label: 'MEDIUM (0.75s)', color: 'bg-orange-600' },
                  { id: DifficultyLevel.HARD, label: 'HARD (0.5s)', color: 'bg-red-600' }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`flex-1 py-2 text-[8px] md:text-[10px] font-bold uppercase pixel-border transition-all ${
                      difficulty === d.id ? `${d.color} text-white scale-105` : 'bg-gray-800 text-gray-500 opacity-60'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full max-w-2xl flex flex-col space-y-3">
              <label className="text-[10px] text-pink-500 uppercase font-bold tracking-widest">Type your lyrics below:</label>
              <textarea 
                placeholder="EVERYBODY WAS KUNG FU FIGHTING..."
                className="w-full h-32 md:h-40 p-4 bg-black/60 border-4 border-gray-800 text-xs md:text-sm uppercase outline-none focus:border-yellow-400 placeholder:text-gray-800 transition-colors font-mono resize-none leading-relaxed"
                value={userLyrics}
                onChange={(e) => setUserLyrics(e.target.value)}
              />
              <PixelButton 
                className="w-full" 
                onClick={startSession}
                disabled={!userLyrics.trim()}
              >
                START THE SHOW
              </PixelButton>
            </div>
          </div>
        )}

        {state === GameState.PLAYING && userLyrics && selectedChar && (
          <KaraokeArena 
            lyricsString={userLyrics} 
            difficulty={difficulty}
            character={selectedChar}
            onFinish={(results) => {
              setScore(results);
              setState(GameState.RESULTS);
            }} 
            onAbort={handleAbort}
          />
        )}

        {state === GameState.RESULTS && score && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <h2 className="text-4xl text-yellow-400 uppercase mb-2">GIG OVER!</h2>
              <p className="text-[10px] text-pink-500 font-black tracking-widest mb-8">ZÜRI HEARTS YOU</p>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mb-8 bg-black/60 p-8 pixel-border w-full max-w-2xl">
              <div className="space-y-2">
                <p className="text-[8px] text-gray-500 uppercase">HITS</p>
                <p className="text-3xl text-green-400 font-bold">{score.hits}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[8px] text-gray-500 uppercase">MISSES</p>
                <p className="text-3xl text-red-500 font-bold">{score.misses}</p>
              </div>
              <div className="space-y-2 border-l-2 border-gray-800">
                <p className="text-[8px] text-gray-500 uppercase">ACCURACY</p>
                <p className="text-3xl text-white font-bold">{score.accuracy}%</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <PixelButton onClick={resetGame}>ENCORE!</PixelButton>
              <PixelButton onClick={() => setState(GameState.CHARACTER_SELECT)} className="bg-pink-600 hover:bg-pink-500">BACK TO LOUNGE</PixelButton>
            </div>
          </div>
        )}

      </div>

      <div className="fixed top-4 left-4 text-[8px] text-gray-700 pointer-events-none uppercase tracking-tighter">
        The Züri Sketch // Local Engine v3.0
      </div>
    </div>
  );
};

export default App;
