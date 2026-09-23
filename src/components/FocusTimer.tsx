import React, { useState, useEffect, useRef } from 'react';
import { TimerMode, Language } from '../types';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/soundEngine';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Brain,
  Coffee,
  Sunset,
  Plus,
  Trash2,
} from 'lucide-react';

interface FocusTimerProps {
  lang: Language;
}

const MODE_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const FocusTimer: React.FC<FocusTimerProps> = ({ lang }) => {
  const t = translations[lang];
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [distractions, setDistractions] = useState<string[]>([]);
  const [distractionInput, setDistractionInput] = useState<string>('');

  const timerRef = useRef<number | null>(null);
  const totalTime = MODE_DURATIONS[mode];

  // Timer interval tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleComplete = () => {
    setIsRunning(false);
    soundEngine.playChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (mode === 'pomodoro') {
      setCompletedSessions((prev) => prev + 1);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    soundEngine.playTactileClick();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const toggleTimer = () => {
    soundEngine.playTactileClick();
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    soundEngine.playTactileClick();
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const skipTimer = () => {
    soundEngine.playTactileClick();
    setIsRunning(false);
    if (mode === 'pomodoro') {
      switchMode('shortBreak');
    } else {
      switchMode('pomodoro');
    }
  };

  const handleAddDistraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distractionInput.trim()) return;
    soundEngine.playTactileClick();
    setDistractions((prev) => [distractionInput.trim(), ...prev]);
    setDistractionInput('');
  };

  const removeDistraction = (idx: number) => {
    soundEngine.playTactileClick();
    setDistractions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Format time mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Circular progress calculation
  const progressRatio = (totalTime - timeLeft) / totalTime;
  const strokeDashoffset = 754 * (1 - progressRatio); // 2 * PI * 120 approx 754

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            {t.focus.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">{t.focus.subtitle}</p>
        </div>

        {/* Completed count */}
        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t.focus.completedSessions}:</span>
          <span className="font-semibold text-white tabular-nums">{completedSessions}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Timer Display */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 sm:p-12 bg-zinc-900/50 border border-zinc-800/80 rounded-3xl">
          {/* Mode Segmented Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl mb-8">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'pomodoro'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.focus.pomodoro}</span>
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'shortBreak'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.focus.shortBreak}</span>
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'longBreak'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sunset className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.focus.longBreak}</span>
            </button>
          </div>

          {/* Circular SVG Ring & Numerical Display */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
              {/* Background circle */}
              <circle
                cx="130"
                cy="130"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-800/60 fill-transparent"
              />
              {/* Active progress arc */}
              <circle
                cx="130"
                cy="130"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="754"
                strokeDashoffset={strokeDashoffset}
                className="text-indigo-500 transition-all duration-500 fill-transparent"
              />
            </svg>

            {/* Time readout in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-bold tracking-tight text-white font-mono tabular-nums">
                {formattedTime}
              </span>
              <span className="text-xs font-medium text-zinc-400 mt-2">
                {isRunning ? (
                  <span className="text-indigo-400">● {lang === 'hi' ? 'सक्रिय सत्र' : 'Flow in progress'}</span>
                ) : (
                  <span>○ {lang === 'hi' ? 'विराम' : 'Paused / Ready'}</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={resetTimer}
              title={t.common.reset}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25 transition-all"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{t.common.pause}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>{timeLeft === totalTime ? t.common.start : t.common.resume}</span>
                </>
              )}
            </button>

            <button
              onClick={skipTimer}
              title={lang === 'hi' ? 'अगला चक्र' : 'Skip to next'}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Distraction Parking Lot & Thought Tracker */}
        <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white font-display">
              {t.focus.distractionTitle}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {lang === 'hi'
                ? 'अचानक याद आए विचार यहाँ तुरंत लिख दें ताकि एकाग्रता न टूटे।'
                : 'Offload incoming thoughts or random impulses without breaking your flow.'}
            </p>
          </div>

          <form onSubmit={handleAddDistraction} className="flex gap-2 mb-4">
            <input
              type="text"
              value={distractionInput}
              onChange={(e) => setDistractionInput(e.target.value)}
              placeholder={t.focus.distractionPlaceholder}
              className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/70"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.common.add}</span>
            </button>
          </form>

          {/* List of distractions */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {distractions.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                {lang === 'hi' ? 'कोई ध्यान भटकाव दर्ज नहीं है। मन शांत है।' : 'Mind is tranquil. No parked distractions yet.'}
              </div>
            ) : (
              distractions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-xs text-zinc-300"
                >
                  <span className="truncate pr-2">{item}</span>
                  <button
                    onClick={() => removeDistraction(index)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
