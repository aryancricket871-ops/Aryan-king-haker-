/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppTab, Language, ThemeAccent } from './types';
import { TopNav } from './components/TopNav';
import { SoundscapeLab } from './components/SoundscapeLab';
import { FocusTimer } from './components/FocusTimer';
import { TaskMatrix } from './components/TaskMatrix';
import { ZenNotes } from './components/ZenNotes';
import { UiTestingLab } from './components/UiTestingLab';
import { soundEngine } from './utils/soundEngine';
import { translations } from './utils/translations';
import {
  Sparkles,
  Headphones,
  Timer,
  CheckSquare,
  FileText,
  FlaskConical,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('soundscape');
  const [lang, setLang] = useState<Language>('hi'); // Initialized to Hindi as requested by the user, easily toggleable!
  const [accent, setAccent] = useState<ThemeAccent>('indigo');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const t = translations[lang];

  // Sync mute state with sound engine
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMute(nextMuted);
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar adhering to 3-Zone Top Bar Contract */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        onToggleLang={toggleLanguage}
        accent={accent}
        onChangeAccent={setAccent}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10">
        {currentTab === 'soundscape' && <SoundscapeLab lang={lang} />}
        {currentTab === 'focus' && <FocusTimer lang={lang} />}
        {currentTab === 'tasks' && <TaskMatrix lang={lang} />}
        {currentTab === 'notes' && <ZenNotes lang={lang} />}
        {currentTab === 'playground' && (
          <UiTestingLab
            lang={lang}
            accent={accent}
            onChangeAccent={setAccent}
          />
        )}
      </main>

      {/* Bottom Editorial Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300 font-display">Aura Studio</span>
            <span aria-hidden="true">·</span>
            <span>{t.tagline}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Web Audio 48kHz</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-400">React 19</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                soundEngine.playTactileClick();
                setCurrentTab('playground');
              }}
              className="text-indigo-400 hover:underline"
            >
              {lang === 'hi' ? 'टेस्टिंग लैब खोलें' : 'Open Test Bench'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
