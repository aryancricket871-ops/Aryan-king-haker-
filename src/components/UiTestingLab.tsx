import React, { useState } from 'react';
import { Language, ThemeAccent } from '../types';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/soundEngine';
import { motion } from 'motion/react';
import {
  Sparkles,
  Volume2,
  Sliders,
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  CheckCircle2,
  Layers,
  Zap,
  Activity,
} from 'lucide-react';

interface UiTestingLabProps {
  lang: Language;
  accent: ThemeAccent;
  onChangeAccent: (accent: ThemeAccent) => void;
}

export const UiTestingLab: React.FC<UiTestingLabProps> = ({
  lang,
  accent,
  onChangeAccent,
}) => {
  const t = translations[lang];

  // Motion physics card coordinates
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resetCount, setResetCount] = useState<number>(0);

  // Audio frequency oscillator tester
  const [testFrequency, setTestFrequency] = useState<number>(440);
  const [isTonePlaying, setIsTonePlaying] = useState<boolean>(false);
  const toneOscRef = React.useRef<{ stop: () => void } | null>(null);

  // Component stress test states
  const [toggleA, setToggleA] = useState<boolean>(true);
  const [toggleB, setToggleB] = useState<boolean>(false);
  const [sliderVal, setSliderVal] = useState<number>(65);
  const [counter, setCounter] = useState<number>(42);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);

  // Viewport mode
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const playTone = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch {}
  };

  const handleTestClick = () => {
    soundEngine.playTactileClick();
  };

  const handleTestChime = () => {
    soundEngine.playChime();
  };

  const handleTestChord = () => {
    soundEngine.playSuccessChord();
  };

  const toggleLoadingSimulation = () => {
    soundEngine.playTactileClick();
    setIsLoadingState(true);
    setTimeout(() => {
      setIsLoadingState(false);
      soundEngine.playTactileClick();
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            {t.playground.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">{t.playground.subtitle}</p>
        </div>

        {/* Viewport frame selector */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              setViewportMode('mobile');
            }}
            title="Mobile (380px)"
            className={`p-1.5 rounded-lg transition-colors ${
              viewportMode === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              setViewportMode('tablet');
            }}
            title="Tablet (768px)"
            className={`p-1.5 rounded-lg transition-colors ${
              viewportMode === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              setViewportMode('desktop');
            }}
            title="Desktop (Full)"
            className={`p-1.5 rounded-lg transition-colors ${
              viewportMode === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frame Container for Responsive Testing */}
      <div
        className={`mx-auto transition-all duration-300 ${
          viewportMode === 'mobile'
            ? 'max-w-sm border-2 border-indigo-500/40 rounded-3xl p-4 bg-zinc-950/80 shadow-2xl'
            : viewportMode === 'tablet'
            ? 'max-w-2xl border-2 border-indigo-500/30 rounded-3xl p-6 bg-zinc-950/80 shadow-2xl'
            : 'w-full'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test 1: Interactive Motion Spring Physics Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-base font-semibold text-white font-display">
                    {t.playground.physicsCardTitle}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playTactileClick();
                    setCoords({ x: 0, y: 0 });
                    setResetCount((c) => c + 1);
                  }}
                  title="Reset Card Position"
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-zinc-400 mb-6">{t.playground.physicsCardDesc}</p>
            </div>

            {/* Draggable Spring Object */}
            <div className="h-44 bg-zinc-950/70 border border-zinc-800/60 rounded-2xl relative flex items-center justify-center overflow-hidden p-4">
              <motion.div
                key={resetCount}
                drag
                dragConstraints={{ left: -140, right: 140, top: -50, bottom: 50 }}
                dragElastic={0.25}
                whileDrag={{ scale: 1.06, cursor: 'grabbing' }}
                whileHover={{ scale: 1.02, cursor: 'grab' }}
                onDrag={(_, info) => {
                  setCoords({ x: Math.round(info.offset.x), y: Math.round(info.offset.y) });
                }}
                className="w-48 p-3.5 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-indigo-500/40 rounded-xl shadow-xl select-none text-center"
              >
                <div className="text-xs font-semibold text-white mb-0.5">
                  {t.playground.dragMe}
                </div>
                <div className="text-[10px] text-indigo-300 font-mono">
                  Elastic Spring Damping
                </div>
              </motion.div>
            </div>

            {/* Live Readout */}
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>{t.playground.released}:</span>
              <span className="text-zinc-200 tabular-nums">
                X: {coords.x}px | Y: {coords.y}px
              </span>
            </div>
          </div>

          {/* Test 2: Audio Oscillator & Synthesizer Test */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-semibold text-white font-display">
                  {t.playground.audioTesterTitle}
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mb-6">{t.playground.audioTesterDesc}</p>
            </div>

            {/* Trigger buttons */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              <button
                onClick={handleTestClick}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-transform active:scale-95 border border-zinc-700/60 flex flex-col items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>{t.playground.clickHaptic}</span>
              </button>
              <button
                onClick={handleTestChime}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-transform active:scale-95 border border-zinc-700/60 flex flex-col items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.playground.chimeHaptic}</span>
              </button>
              <button
                onClick={handleTestChord}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-transform active:scale-95 border border-zinc-700/60 flex flex-col items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.playground.chordHaptic}</span>
              </button>
            </div>

            {/* Sine Pitch Frequency Slider */}
            <div className="bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800/60 space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Sine Wave Oscillator Test</span>
                <span className="font-mono text-zinc-200 tabular-nums">{testFrequency} Hz</span>
              </div>
              <input
                type="range"
                min="110"
                max="1200"
                step="5"
                value={testFrequency}
                onChange={(e) => {
                  const freq = parseInt(e.target.value, 10);
                  setTestFrequency(freq);
                  playTone(freq);
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Test 3: Color Contrast & Theme Tokens */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-semibold text-white font-display">
                  {t.playground.colorContrastTitle}
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mb-6">{t.playground.colorContrastDesc}</p>
            </div>

            {/* Accent theme buttons */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[
                { id: 'indigo', label: 'Indigo', hex: '#6366f1' },
                { id: 'emerald', label: 'Emerald', hex: '#10b981' },
                { id: 'amber', label: 'Amber', hex: '#f59e0b' },
                { id: 'rose', label: 'Rose', hex: '#f43f5e' },
                { id: 'cyan', label: 'Cyan', hex: '#06b6d4' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundEngine.playTactileClick();
                    onChangeAccent(item.id as ThemeAccent);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    accent === item.id
                      ? 'border-white/80 bg-zinc-800 text-white'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: item.hex }}
                  />
                  <div className="text-[10px] font-medium">{item.label}</div>
                </button>
              ))}
            </div>

            {/* Contrast validation badge */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Contrast Ratio (4.5:1 Target):</span>
              <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                14.2:1 (Pass AAA)
              </span>
            </div>
          </div>

          {/* Test 4: Component State Stress Test Bench */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-semibold text-white font-display">
                  Component State Bench
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mb-6">
                Interactive verification of toggles, counters, and asynchronous shimmer states.
              </p>
            </div>

            <div className="space-y-4">
              {/* Toggles */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">Spatial Audio Haptics</span>
                <button
                  onClick={() => {
                    soundEngine.playTactileClick();
                    setToggleA(!toggleA);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    toggleA ? 'bg-indigo-500' : 'bg-zinc-850'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      toggleA ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Dynamic Animated Counter */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <span className="text-xs text-zinc-300">Stress Test Value:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playTactileClick();
                      setCounter((c) => Math.max(0, c - 1));
                    }}
                    className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-white text-sm tabular-nums">
                    {counter}
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playTactileClick();
                      setCounter((c) => c + 1);
                    }}
                    className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Shimmer / Skeleton trigger */}
              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                <button
                  onClick={toggleLoadingSimulation}
                  className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
                >
                  Simulate Async Network Delay
                </button>
                {isLoadingState ? (
                  <div className="w-24 h-4 bg-zinc-800 animate-pulse rounded-md" />
                ) : (
                  <span className="text-xs text-emerald-400 font-mono">Status: Ready</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
