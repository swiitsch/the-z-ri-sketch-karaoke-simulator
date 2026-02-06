
import React, { useState, useEffect } from 'react';
import { GameState, Character, SongData, ScoreData } from './types';
import { CHARACTERS, OTHER_PEOPLE } from './constants';
import { getSongLyrics } from './services/geminiService';
import PixelButton from './components/PixelButton';
import KaraokeArena from './components/KaraokeArena';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(GameState.WELCOME);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [songQuery, setSongQuery] = useState('');
  const [songData, setSongData] = useState<SongData | null>(null);
  const [score, setScore] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map characters to TTS voices
  const getVoiceForChar = (id: string) => {
    switch (id) {
      case 'pari': return 'Kore'; // Female
      case 'vania': return 'Puck'; // Female
      case 'claudie': return 'Puck'; // Female
      case 'ramon': return 'Charon'; // Male
      case 'philip': return 'Fenrir'; // Male - Deepest/Strongest
      default: return 'Kore';
    }
  };

  const startGame = async () => {
    if (!songQuery) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSongLyrics(songQuery);
      setSongData(data);
      setState(GameState.PLAYING);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setSongData(null);
    setScore(null);
    setSongQuery('');
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
              <p className="text-[10px] text-pink-500 font-bold uppercase tracking-[0.2em]">Pixel Art Edition</p>
            </div>
            <p className="text-xs md:text-base text-gray-400 max-w-lg leading-relaxed">
              The stage is yours. The crowd is hungry.<br/>Match the rhythm, hit the words, and become the Züri Legend.
            </p>
            <PixelButton onClick={() => setState(GameState.CHARACTER_SELECT)}>
              ENTER BAR
            </PixelButton>
          </div>
        )}

        {state === GameState.CHARACTER_SELECT && (
          <div className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto">
            <h2 className="text-xl md:text-3xl text-yellow-400 text-center uppercase tracking-tighter">Choose Your Singer</h2>
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
          <div className="flex-1 flex flex-col p-8 items-center justify-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <img 
                  src={selectedChar.image} 
                  alt="Selected" 
                  className="w-32 h-32 md:w-56 md:h-56 pixel-border bg-gray-800"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-pink-500 px-4 py-1 pixel-border text-[10px] whitespace-nowrap">
                  MIC CHECK OK
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl md:text-4xl text-yellow-400 uppercase font-black">{selectedChar.name}</h3>
                <p className="text-[10px] text-gray-500 italic max-w-xs">"Zürich won't know what hit them once I start the show..."</p>
              </div>
            </div>

            <div className="w-full max-w-md space-y-4 pt-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="SONG OR ARTIST..."
                  className="w-full p-4 bg-black/60 border-4 border-gray-800 text-[10px] uppercase outline-none focus:border-yellow-400 placeholder:text-gray-700 transition-colors"
                  value={songQuery}
                  onChange={(e) => setSongQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startGame()}
                />
              </div>
              <PixelButton 
                className="w-full" 
                onClick={startGame}
                disabled={!songQuery || isLoading}
              >
                {isLoading ? 'STAGE LIGHTS ON...' : 'GO TO STAGE'}
              </PixelButton>
              {error && <p className="text-red-500 text-[8px] text-center mt-2 animate-bounce">{error}</p>}
            </div>
          </div>
        )}

        {state === GameState.PLAYING && songData && selectedChar && (
          <KaraokeArena 
            song={songData} 
            voiceName={getVoiceForChar(selectedChar.id)}
            onFinish={(results) => {
              setScore(results);
              setState(GameState.RESULTS);
            }} 
          />
        )}

        {state === GameState.RESULTS && score && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <h2 className="text-4xl text-yellow-400 uppercase mb-2">GIG OVER!</h2>
              <p className="text-[10px] text-pink-500 font-black tracking-widest mb-8">THE ZÜRI SKETCH APPLAUDS</p>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mb-8 bg-black/60 p-8 pixel-border w-full max-w-2xl">
              <div className="space-y-2">
                <p className="text-[8px] text-gray-500 uppercase">PERFECT HITS</p>
                <p className="text-3xl text-green-400 font-bold">{score.hits}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[8px] text-gray-500 uppercase">MISSES</p>
                <p className="text-3xl text-red-500 font-bold">{score.misses}</p>
              </div>
              <div className="space-y-2 border-l-2 border-gray-800">
                <p className="text-[8px] text-gray-500 uppercase">RANK</p>
                <p className="text-3xl text-white font-bold">
                  {score.accuracy > 90 ? 'S' : score.accuracy > 70 ? 'A' : score.accuracy > 50 ? 'B' : 'F'}
                </p>
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
        The Züri Sketch // Audio Engine v2.3
      </div>
    </div>
  );
};

export default App;
