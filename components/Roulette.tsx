import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Person } from '../types';

interface Props {
  people: Person[];
  onClose: () => void;
}

const MusicalChairs: React.FC<Props> = ({ people, onClose }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'scrambling' | 'result'>('idle');
  const [loserId, setLoserId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [seatAssignments, setSeatAssignments] = useState<Record<string, number>>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const beatIntervalRef = useRef<number | null>(null);
  const rotationRef = useRef(0);

  // Constants for layout - Optimized for visibility and separation
  const ARENA_SIZE = 360;
  const CHAIR_RADIUS = 90; // Significantly further from center to avoid overlap
  const OUTER_RADIUS = 145; // People orbit further out
  const CHAIR_COUNT = people.length - 1;

  // Sync rotation ref for logic calculation
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (beatIntervalRef.current) {
      window.clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
  };

  const playMerryBeat = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    let step = 0;
    const tempo = 135; // BPM
    const stepDuration = 60 / tempo / 2; // 8th notes
    const notes = [261.63, 329.63, 392.00, 440.00]; // C4, E4, G4, A4

    beatIntervalRef.current = window.setInterval(() => {
      const now = ctx.currentTime;
      if (step % 4 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
      if (step % 4 === 2) {
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start(now);
      }
      if (step % 2 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteIdx = Math.floor(Math.random() * notes.length);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[noteIdx], now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
      step = (step + 1) % 16;
    }, stepDuration * 1000);
  };

  useEffect(() => {
    let interval: any;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setRotation(prev => (prev + 4) % 360);
      }, 30);
    } else {
      clearInterval(interval);
      stopAudio();
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const triggerScramble = () => {
    setGameState('scrambling');
    stopAudio();

    // 1. Get current angular positions of all people
    const currentRotation = rotationRef.current;
    const personAngles = people.map((p, i) => {
      // Must match rendering: (i * 360) / people.length + rotation - 90
      return ((i * 360) / people.length + currentRotation - 90) % 360;
    });

    // 2. Get angular positions of chairs
    const chairAngles = Array.from({ length: CHAIR_COUNT }).map((_, j) => {
      // Must match rendering: (j * 360) / CHAIR_COUNT - 90
      return ((j * 360) / CHAIR_COUNT - 90) % 360;
    });

    // 3. For each person, calculate their closest chair and distance
    const info = personAngles.map((pAngle, personIdx) => {
      let minDistance = 360;
      let closestChairIdx = 0;
      chairAngles.forEach((cAngle, cIdx) => {
        let diff = Math.abs(pAngle - cAngle);
        if (diff > 180) diff = 360 - diff;
        if (diff < minDistance) {
          minDistance = diff;
          closestChairIdx = cIdx;
        }
      });
      return { personId: people[personIdx].id, distance: minDistance, chairIdx: closestChairIdx };
    });

    // 4. Identify the loser: the person with the largest minimum distance to any chair
    const sortedByStrandedness = [...info].sort((a, b) => b.distance - a.distance);
    const chosenLoserId = sortedByStrandedness[0].personId;

    // 5. Finalize assignments for winners.
    // We want winners to snap to the chair they were closest to. 
    // If two people claim the same chair, we assign remaining chairs greedily to avoid overlap.
    const assignments: Record<string, number> = {};
    const occupiedChairs = new Set<number>();
    const winners = info.filter(i => i.personId !== chosenLoserId);

    // First pass: assign people to their absolute closest chair if available
    winners.sort((a, b) => a.distance - b.distance).forEach(w => {
      if (!occupiedChairs.has(w.chairIdx)) {
        assignments[w.personId] = w.chairIdx;
        occupiedChairs.add(w.chairIdx);
      }
    });

    // Second pass: assign any remaining winners to any remaining empty chairs
    winners.forEach(w => {
      if (assignments[w.personId] === undefined) {
        for (let i = 0; i < CHAIR_COUNT; i++) {
          if (!occupiedChairs.has(i)) {
            assignments[w.personId] = i;
            occupiedChairs.add(i);
            break;
          }
        }
      }
    });

    setTimeout(() => {
      setSeatAssignments(assignments);
      setLoserId(chosenLoserId);
      setGameState('result');
    }, 1000);
  };

  const startGame = () => {
    if (gameState === 'playing' || gameState === 'scrambling') return;
    setGameState('playing');
    setLoserId(null);
    setSeatAssignments({});
    playMerryBeat();
    const duration = 3500 + Math.random() * 4000;
    setTimeout(triggerScramble, duration);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center relative overflow-hidden min-h-[620px]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-20"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Musical Chairs</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Wait for the silence!</p>
        </div>

        {/* The Game Arena */}
        <div 
          className="relative flex items-center justify-center mb-10"
          style={{ width: ARENA_SIZE, height: ARENA_SIZE }}
        >
          {/* Central Music Visualizer */}
          <div className="absolute w-28 h-28 bg-slate-50 dark:bg-slate-800/50 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center z-10">
             {gameState === 'playing' && (
               <div className="flex flex-col items-center animate-bounce">
                 <i className="fa-solid fa-music text-indigo-500 text-3xl mb-1"></i>
                 <div className="flex gap-1.5 h-6 items-end">
                   <span className="w-1.5 h-3 bg-indigo-400 rounded-full animate-[pulse_0.6s_infinite]"></span>
                   <span className="w-1.5 h-5 bg-indigo-500 rounded-full animate-[pulse_0.4s_infinite]"></span>
                   <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-[pulse_0.8s_infinite]"></span>
                 </div>
               </div>
             )}
          </div>
          
          {/* Chairs in a circle */}
          {people.length > 1 && Array.from({ length: CHAIR_COUNT }).map((_, i) => {
            const angle = (i * 360) / CHAIR_COUNT - 90;
            const x = Math.cos((angle * Math.PI) / 180) * CHAIR_RADIUS;
            const y = Math.sin((angle * Math.PI) / 180) * CHAIR_RADIUS;
            
            return (
              <div 
                key={`chair-${i}`}
                className="absolute transition-all duration-700 flex items-center justify-center"
                style={{ 
                  transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
                  opacity: gameState === 'playing' ? 0.4 : 1
                }}
              >
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center shadow-lg border-2 border-indigo-100 dark:border-indigo-800">
                  <i className="fa-solid fa-chair text-indigo-400 dark:text-indigo-500 text-2xl"></i>
                </div>
              </div>
            );
          })}

          {/* People Moving Around */}
          {people.map((p, i) => {
            const isLoser = loserId === p.id;
            let x = 0;
            let y = 0;
            let scale = 1;

            if (gameState === 'idle') {
              const angle = (i * 360) / people.length - 90;
              x = Math.cos((angle * Math.PI) / 180) * OUTER_RADIUS;
              y = Math.sin((angle * Math.PI) / 180) * OUTER_RADIUS;
            } else if (gameState === 'playing') {
              const angle = (i * 360) / people.length + rotation - 90;
              const bounce = Math.sin(rotation * 0.2) * 6;
              x = Math.cos((angle * Math.PI) / 180) * (OUTER_RADIUS + bounce);
              y = Math.sin((angle * Math.PI) / 180) * (OUTER_RADIUS + bounce);
            } else if (gameState === 'scrambling') {
              const angle = (i * 360) / people.length + rotation - 90;
              x = Math.cos((angle * Math.PI) / 180) * CHAIR_RADIUS;
              y = Math.sin((angle * Math.PI) / 180) * CHAIR_RADIUS;
              scale = 0.85;
            } else if (gameState === 'result' && loserId) {
              if (isLoser) {
                x = 0;
                y = 0;
                scale = 1.5;
              } else {
                // winners sit based on pre-calculated assignments
                const chairIndex = seatAssignments[p.id] ?? 0;
                const angle = (chairIndex * 360) / CHAIR_COUNT - 90;
                x = Math.cos((angle * Math.PI) / 180) * CHAIR_RADIUS;
                y = Math.sin((angle * Math.PI) / 180) * CHAIR_RADIUS;
                scale = 1.1;
              }
            }

            return (
              <div 
                key={p.id}
                className="absolute flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                style={{ 
                  transform: `translate(${x}px, ${y}px) scale(${scale})`,
                  zIndex: isLoser ? 50 : 20
                }}
              >
                <div className="relative group">
                  <div className={`w-14 h-14 rounded-[1.25rem] ${p.avatarColor} border-4 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center text-white text-lg font-black transition-all`}>
                    {p.name.charAt(0).toUpperCase()}
                    {gameState === 'result' && isLoser && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-[10px] border-4 border-white dark:border-slate-900 animate-bounce shadow-lg">
                        <i className="fa-solid fa-bolt"></i>
                      </div>
                    )}
                  </div>
                  {gameState !== 'playing' && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase whitespace-nowrap text-slate-800 dark:text-slate-200">
                      {p.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Game Status & Controls */}
        <div className="w-full mt-auto">
          {gameState === 'idle' && (
            <button
              onClick={startGame}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-4 group"
            >
              <i className="fa-solid fa-play text-xl group-hover:scale-125 transition-transform"></i>
              START MUSIC
            </button>
          )}

          {gameState === 'playing' && (
            <div className="py-5 bg-white dark:bg-slate-800/50 rounded-[2rem] border-4 border-indigo-500 shadow-xl text-center">
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] flex items-center justify-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                DANCING...
              </p>
            </div>
          )}

          {gameState === 'scrambling' && (
            <div className="py-5 bg-rose-600 text-white rounded-[2rem] text-center shadow-2xl shadow-rose-200 dark:shadow-none animate-pulse">
              <p className="text-lg font-black uppercase tracking-[0.3em]">
                SIT DOWN!
              </p>
            </div>
          )}

          {gameState === 'result' && loserId && (
            <div className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
              <div className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-100 dark:border-rose-900/50 p-6 rounded-[2.5rem] w-full mb-6 flex items-center gap-5 shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-3xl text-white shadow-xl shadow-rose-500/30">
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Stranded Player</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50">{people.find(p => p.id === loserId)?.name}</h3>
                  <p className="text-xs text-slate-500 font-medium italic">You're footing the bill! 💸</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={startGame}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  REMATCH
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
                >
                  CONFIRM
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicalChairs;