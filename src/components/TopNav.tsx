import React from 'react';
import { AppTab, Language, ThemeAccent } from '../types';
import { translations } from '../utils/translations';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface TopNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  lang: Language;
  onToggleLang: () => void;
  accent: ThemeAccent;
  onChangeAccent: (accent: ThemeAccent) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  accent,
  onChangeAccent,
  isMuted,
  onToggleMute,
}) => {
  const t = translations[lang];

  const tabs: { id: AppTab; label: string }[] = [
    { id: 'soundscape', label: t.tabs.soundscape },
    { id: 'focus', label: t.tabs.focus },
    { id: 'tasks', label: t.tabs.tasks },
    { id: 'notes', label: t.tabs.notes },
    { id: 'playground', label: t.tabs.playground },
  ];

  const accents: { id: ThemeAccent; colorClass: string; label: string }[] = [
    { id: 'indigo', colorClass: 'bg-indigo-500', label: 'Indigo' },
    { id: 'emerald', colorClass: 'bg-emerald-500', label: 'Emerald' },
    { id: 'amber', colorClass: 'bg-amber-500', label: 'Amber' },
    { id: 'rose', colorClass: 'bg-rose-500', label: 'Rose' },
    { id: 'cyan', colorClass: 'bg-cyan-500', label: 'Cyan' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            soundEngine.playTactileClick();
            onSelectTab('soundscape');
          }}
          className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 font-display text-left"
        >
          Aura
        </button>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playTactileClick();
                  onSelectTab(tab.id);
                }}
                className={`relative py-1 whitespace-nowrap transition-colors ${
                  isActive ? 'text-white font-semibold' : 'hover:text-zinc-200'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Accent Color Palette Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {accents.map((acc) => (
              <button
                key={acc.id}
                title={acc.label}
                onClick={() => {
                  soundEngine.playTactileClick();
                  onChangeAccent(acc.id);
                }}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${acc.colorClass} ${
                  accent === acc.id ? 'scale-125 ring-2 ring-white/60' : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
                aria-label={acc.label}
              />
            ))}
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              onToggleMute();
            }}
            title={isMuted ? t.common.unmute : t.common.mute}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-900/40'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              onToggleLang();
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition-colors whitespace-nowrap"
          >
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden items-center justify-between overflow-x-auto border-t border-zinc-900 px-3 py-1.5 scrollbar-none gap-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playTactileClick();
                onSelectTab(tab.id);
              }}
              className={`px-3 py-1 text-xs whitespace-nowrap rounded-md transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
